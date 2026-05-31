// Staff dashboard: platform-wide administration.

async function loadStaffStats() {
  const host = document.getElementById("stats");
  try {
    const data = await Api.get("/users/dashboard/stats");
    const s = data.stats || {};
    const tile = (label, value, accent) => `
      <div class="col-6 col-lg-3">
        <div class="fh-stat ${accent ? "fh-stat--accent" : ""}">
          <div class="fh-stat__label">${label}</div>
          <div class="fh-stat__value">${value ?? "—"}</div>
        </div>
      </div>`;
    host.innerHTML =
      tile("Students", s.students) +
      tile("Landlords", s.landlords) +
      tile("Total listings", s.totalHouses, true) +
      tile("Active contracts", s.activeContracts) +
      tile("Available", s.availableHouses) +
      tile("Rented", s.rentedHouses, true);
  } catch {
    host.innerHTML = "";
  }
}

async function loadUsers() {
  const box = document.getElementById("tab-users");
  box.innerHTML = UI.spinner("Loading users…");
  try {
    const data = await Api.get("/users" + Api.qs({ limit: 100 }));
    const users = data.users || [];
    if (!users.length) { box.innerHTML = UI.empty("No users found."); return; }
    const rows = users.map((u) => `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            <span class="fh-avatar">${UI.escape((u.fullName || "?")[0])}</span>
            <span class="fw-semibold">${UI.escape(u.fullName)}</span>
          </div>
        </td>
        <td>${UI.escape(u.email)}</td>
        <td>${UI.escape(u.phone || "—")}</td>
        <td>${UI.badge(u.role)}</td>
        <td>${u.isActive
          ? `<span class="fh-badge fh-badge--ok">Active</span>`
          : `<span class="fh-badge fh-badge--bad">Disabled</span>`}</td>
        <td>${UI.date(u.createdAt)}</td>
        <td class="text-end">
          ${u.role !== "STAFF"
            ? `<button class="btn btn-ghost btn-sm" data-toggle="${u.id}">
                 ${u.isActive ? "Deactivate" : "Activate"}</button>`
            : `<span class="text-soft small">—</span>`}
        </td>
      </tr>`).join("");
    box.innerHTML = panelTable(
      ["User", "Email", "Phone", "Role", "Account", "Joined", ""], rows);
    box.querySelectorAll("button[data-toggle]").forEach((b) =>
      b.addEventListener("click", () => toggleUser(b.dataset.toggle)));
  } catch (err) {
    box.innerHTML = UI.empty(err.message);
  }
}

async function toggleUser(id) {
  try {
    const data = await Api.patch("/users/" + id + "/status", {});
    UI.toast(data.message || "User updated.", "success");
    loadUsers();
    loadStaffStats();
  } catch (err) {
    UI.toast(err.message, "error");
  }
}

async function loadAllHouses() {
  const box = document.getElementById("tab-houses");
  box.innerHTML = UI.spinner("Loading listings…");
  try {
    const data = await Api.get("/houses" + Api.qs({ limit: 100, status: "" }));
    const houses = data.houses || [];
    if (!houses.length) { box.innerHTML = UI.empty("No listings yet."); return; }
    const rows = houses.map((h) => `
      <tr>
        <td>${Dash.houseCell(h)}</td>
        <td>${UI.escape(h.landlord?.fullName || "—")}</td>
        <td>${UI.escape(UI.typeLabel(h.type))}</td>
        <td>${UI.vnd(h.price)}</td>
        <td>${UI.badge(h.status)}</td>
        <td class="text-end">
          <button class="btn btn-ghost btn-sm" data-delhouse="${h.id}">
            <i class="bi bi-trash"></i></button>
        </td>
      </tr>`).join("");
    box.innerHTML = panelTable(
      ["House", "Landlord", "Type", "Price", "Status", ""], rows);
    box.querySelectorAll("button[data-delhouse]").forEach((b) =>
      b.addEventListener("click", () => deleteHouseAdmin(b.dataset.delhouse)));
  } catch (err) {
    box.innerHTML = UI.empty(err.message);
  }
}

async function deleteHouseAdmin(id) {
  if (!confirm("Delete this listing?")) return;
  try {
    await Api.del("/houses/" + id);
    UI.toast("Listing deleted.", "success");
    loadAllHouses();
    loadStaffStats();
  } catch (err) {
    UI.toast(err.message, "error");
  }
}

async function loadAllBookings() {
  const box = document.getElementById("tab-bookings");
  box.innerHTML = UI.spinner("Loading bookings…");
  try {
    const data = await Api.get("/bookings");
    const bookings = data.bookings || [];
    if (!bookings.length) { box.innerHTML = UI.empty("No bookings yet."); return; }
    const rows = bookings.map((b) => `
      <tr>
        <td>
          <a href="house.html?id=${b.house?.id}" class="fw-semibold">
            ${UI.escape(b.house?.title || "—")}</a>
          <div class="text-soft small">${UI.escape(b.house?.district || "")}</div>
        </td>
        <td>${UI.escape(b.student?.fullName || "—")}</td>
        <td>${UI.date(b.visitDate) || "—"}</td>
        <td>${UI.badge(b.status)}</td>
        <td>${UI.date(b.createdAt)}</td>
      </tr>`).join("");
    box.innerHTML = panelTable(
      ["House", "Student", "Visit", "Status", "Created"], rows);
  } catch (err) {
    box.innerHTML = UI.empty(err.message);
  }
}

function paymentTypeLabel(t) {
  if (t === "LISTING_FEE") return "Listing fee";
  if (t === "RENEWAL_FEE") return "Renewal fee";
  return t || "Fee";
}

async function loadAllPayments() {
  const box = document.getElementById("tab-payments");
  box.innerHTML = UI.spinner("Loading payments…");
  try {
    const data = await Api.get("/payments");
    const payments = data.payments || [];
    if (!payments.length) {
      box.innerHTML = UI.empty("No payments yet. Use the controls below to generate this month's listing fees.");
    } else {
      const rows = payments.map((p) => `
        <tr>
          <td>${UI.escape(p.user?.fullName || "—")}</td>
          <td>${paymentTypeLabel(p.type)}</td>
          <td>${String(p.month || "").padStart(2, "0")}/${p.year || ""}</td>
          <td>${UI.vnd(p.amount)}</td>
          <td>${UI.badge(p.status)}</td>
          <td>${p.paidAt ? UI.date(p.paidAt) : "—"}</td>
        </tr>`).join("");
      box.innerHTML = panelTable(
        ["Landlord", "Type", "Period", "Amount", "Status", "Paid on"], rows);
    }
    const now = new Date();
    const bar = document.createElement("div");
    bar.className = "d-flex justify-content-end gap-2 mt-3 align-items-end flex-wrap";
    bar.innerHTML = `
      <div>
        <label class="form-label">Month</label>
        <input id="gen-month" type="number" min="1" max="12" class="form-control form-control-sm"
          style="width:90px" value="${now.getMonth() + 1}">
      </div>
      <div>
        <label class="form-label">Year</label>
        <input id="gen-year" type="number" class="form-control form-control-sm"
          style="width:110px" value="${now.getFullYear()}">
      </div>
      <button id="gen-fees" class="btn btn-fh-accent btn-sm">Generate listing fees</button>`;
    box.appendChild(bar);
    document.getElementById("gen-fees").addEventListener("click", generateFees);
  } catch (err) {
    box.innerHTML = UI.empty(err.message);
  }
}

async function generateFees() {
  const month = document.getElementById("gen-month").value;
  const year = document.getElementById("gen-year").value;
  try {
    const data = await Api.post("/payments/generate", { month, year });
    UI.toast(data.message || "Fees generated.", "success");
    loadAllPayments();
  } catch (err) {
    UI.toast(err.message, "error");
  }
}

function panelTable(headers, rows) {
  const ths = headers.map((h) => `<th>${h}</th>`).join("");
  return `
    <div class="fh-panel p-0">
      <div class="table-responsive">
        <table class="fh-table">
          <thead><tr>${ths}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const user = Auth.requireRole("STAFF");
  if (!user) return;
  UI.chrome();
  loadStaffStats();
  Dash.initTabs({
    users: loadUsers,
    houses: loadAllHouses,
    bookings: loadAllBookings,
    payments: loadAllPayments,
  });
});
