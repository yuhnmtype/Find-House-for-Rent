// Landlord: incoming booking requests, contract creation, and payments.

// Load the landlord's houses, then bookings per house.
async function loadRequests() {
  const box = document.getElementById("tab-requests");
  box.innerHTML = UI.spinner("Loading booking requests…");
  try {
    const houseData = await Api.get("/houses/landlord/my");
    const houses = houseData.houses || [];
    if (!houses.length) {
      box.innerHTML = UI.empty("You have no listings yet, so there are no booking requests.");
      return;
    }

    const perHouse = await Promise.all(
      houses.map((h) =>
        Api.get("/bookings/house/" + h.id)
          .then((d) => (d.bookings || []).map((b) => ({ ...b, house: h })))
          .catch(() => [])
      )
    );
    const bookings = perHouse.flat().sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    if (!bookings.length) {
      box.innerHTML = UI.empty("No booking requests yet. They appear here when a student requests one of your houses.");
      return;
    }
    const rows = bookings.map((b) => `
      <tr>
        <td>${Dash.houseCell(b.house)}</td>
        <td>
          <div class="fw-semibold">${UI.escape(b.student?.fullName || "Student")}</div>
          <div class="text-soft small">${UI.escape(b.student?.email || "")}</div>
          <div class="text-soft small">${UI.escape(b.student?.phone || "")}</div>
        </td>
        <td style="max-width:220px">${UI.escape(b.message || "—")}</td>
        <td>${UI.date(b.visitDate) || "—"}</td>
        <td>${UI.badge(b.status)}</td>
        <td class="text-end" style="white-space:nowrap">
          ${b.status === "PENDING" ? `
            <button class="btn btn-fh btn-sm" data-approve="${b.id}">Approve</button>
            <button class="btn btn-ghost btn-sm" data-reject="${b.id}">Reject</button>
          ` : b.status === "APPROVED" ? `
            <button class="btn btn-fh-accent btn-sm"
              data-contract="1"
              data-house="${b.house.id}"
              data-student="${b.studentId}"
              data-rent="${b.house.price || ""}"
              data-deposit="${b.house.deposit || ""}"
              data-housetitle="${UI.escape(b.house.title || "")}">
              Create contract</button>
          ` : "—"}
        </td>
      </tr>`).join("");
    box.innerHTML = `
      <div class="fh-panel p-0">
        <div class="table-responsive">
          <table class="fh-table">
            <thead><tr>
              <th>House</th><th>Student</th><th>Message</th>
              <th>Visit</th><th>Status</th><th></th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;

    box.querySelectorAll("button[data-approve]").forEach((b) =>
      b.addEventListener("click", () => setBookingStatus(b.dataset.approve, "APPROVED")));
    box.querySelectorAll("button[data-reject]").forEach((b) =>
      b.addEventListener("click", () => setBookingStatus(b.dataset.reject, "REJECTED")));
    box.querySelectorAll("button[data-contract]").forEach((b) =>
      b.addEventListener("click", () => openContractForm(b.dataset)));
  } catch (err) {
    box.innerHTML = UI.empty(err.message);
  }
}

async function setBookingStatus(id, status) {
  try {
    await Api.patch("/bookings/" + id + "/status", { status });
    UI.toast("Request " + status.toLowerCase() + ".", "success");
    loadRequests();
  } catch (err) {
    UI.toast(err.message, "error");
  }
}

function openContractForm(d) {
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById("contractForm").innerHTML = `
    <p class="text-soft">Contract for <strong>${d.housetitle}</strong></p>
    <input type="hidden" id="cf-house" value="${d.house}">
    <input type="hidden" id="cf-student" value="${d.student}">
    <div class="mb-3">
      <label class="form-label">Monthly rent (₫)</label>
      <input id="cf-rent" type="number" min="0" step="100000" class="form-control" value="${d.rent}">
    </div>
    <div class="mb-3">
      <label class="form-label">Deposit paid (₫)</label>
      <input id="cf-deposit" type="number" min="0" step="100000" class="form-control" value="${d.deposit}">
    </div>
    <div class="row g-2">
      <div class="col-6">
        <label class="form-label">Start date</label>
        <input id="cf-start" type="date" class="form-control" value="${today}">
      </div>
      <div class="col-6">
        <label class="form-label">End date</label>
        <input id="cf-end" type="date" class="form-control">
      </div>
    </div>
    <div class="mb-3 mt-3">
      <label class="form-label">Terms (optional)</label>
      <textarea id="cf-terms" rows="2" class="form-control"
        placeholder="Payment due date, house rules, notice period…"></textarea>
    </div>
    <div class="d-flex justify-content-end gap-2 mt-3">
      <button class="btn btn-ghost" data-bs-dismiss="modal">Cancel</button>
      <button id="cf-save" class="btn btn-fh">Create contract</button>
    </div>`;
  contractModal.show();
  document.getElementById("cf-save").addEventListener("click", (e) => saveContract(e.target));
}

async function saveContract(btn) {
  const body = {
    houseId: document.getElementById("cf-house").value,
    studentId: document.getElementById("cf-student").value,
    monthlyRent: document.getElementById("cf-rent").value,
    depositPaid: document.getElementById("cf-deposit").value || 0,
    startDate: document.getElementById("cf-start").value,
    endDate: document.getElementById("cf-end").value,
    terms: document.getElementById("cf-terms").value.trim() || undefined,
  };
  if (!body.startDate || !body.endDate) {
    UI.toast("Please set start and end dates.", "error");
    return;
  }
  if (!body.monthlyRent) {
    UI.toast("Please enter the monthly rent.", "error");
    return;
  }
  btn.disabled = true;
  btn.textContent = "Creating…";
  try {
    await Api.post("/contracts", body);
    UI.toast("Contract created. House marked as rented.", "success");
    contractModal.hide();
    loadRequests();
    loadStats();
  } catch (err) {
    UI.toast(err.message, "error");
    btn.disabled = false;
    btn.textContent = "Create contract";
  }
}

function paymentTypeLabel(t) {
  if (t === "LISTING_FEE") return "Listing fee";
  if (t === "RENEWAL_FEE") return "Renewal fee";
  return t || "Fee";
}

function monthYear(p) {
  if (!p.month || !p.year) return "—";
  return String(p.month).padStart(2, "0") + "/" + p.year;
}

async function loadPayments() {
  const box = document.getElementById("tab-payments");
  box.innerHTML = UI.spinner("Loading payments…");
  try {
    const data = await Api.get("/payments/my");
    const payments = data.payments || [];
    if (!payments.length) {
      box.innerHTML = UI.empty("No payments recorded yet. Monthly listing fees appear here once generated by staff.");
      return;
    }
    const rows = payments.map((p) => `
      <tr>
        <td>${paymentTypeLabel(p.type)}</td>
        <td>${monthYear(p)}</td>
        <td>${UI.vnd(p.amount)}</td>
        <td>${UI.badge(p.status)}</td>
        <td>${p.paidAt ? UI.date(p.paidAt) : "—"}</td>
        <td class="text-end">
          ${p.status !== "PAID"
            ? `<button class="btn btn-fh btn-sm" data-pay="${p.id}">Mark paid</button>`
            : ""}
        </td>
      </tr>`).join("");
    box.innerHTML = `
      <div class="fh-panel p-0">
        <div class="table-responsive">
          <table class="fh-table">
            <thead><tr>
              <th>Type</th><th>Billing period</th><th>Amount</th>
              <th>Status</th><th>Paid on</th><th></th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
    box.querySelectorAll("button[data-pay]").forEach((b) =>
      b.addEventListener("click", () => payNow(b.dataset.pay)));
  } catch (err) {
    box.innerHTML = UI.empty(err.message);
  }
}

async function payNow(id) {
  try {
    await Api.patch("/payments/" + id + "/pay", {});
    UI.toast("Payment marked as paid.", "success");
    loadPayments();
  } catch (err) {
    UI.toast(err.message, "error");
  }
}
