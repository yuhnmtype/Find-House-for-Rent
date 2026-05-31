// Student dashboard: my bookings, my contracts, profile.

async function loadBookings() {
  const box = document.getElementById("tab-bookings");
  box.innerHTML = UI.spinner("Loading your bookings…");
  try {
    const data = await Api.get("/bookings/my");
    const bookings = data.bookings || [];
    if (!bookings.length) {
      box.innerHTML = UI.empty("You have no booking requests yet. Browse houses and send a request.");
      return;
    }
    const rows = bookings.map((b) => `
      <tr>
        <td>${Dash.houseCell(b.house)}</td>
        <td>${UI.date(b.visitDate) || "—"}</td>
        <td style="max-width:260px">${UI.escape(b.message || "—")}</td>
        <td>${UI.badge(b.status)}</td>
        <td>${UI.date(b.createdAt)}</td>
        <td class="text-end">
          ${b.status === "PENDING"
            ? `<button class="btn btn-ghost btn-sm" data-cancel="${b.id}">Cancel</button>`
            : ""}
        </td>
      </tr>`).join("");
    box.innerHTML = `
      <div class="fh-panel p-0">
        <div class="table-responsive">
          <table class="fh-table">
            <thead><tr>
              <th>House</th><th>Visit date</th><th>Message</th>
              <th>Status</th><th>Requested</th><th></th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
    box.querySelectorAll("button[data-cancel]").forEach((btn) =>
      btn.addEventListener("click", () => cancelBooking(btn.dataset.cancel))
    );
  } catch (err) {
    box.innerHTML = UI.empty(err.message);
  }
}

async function cancelBooking(id) {
  if (!confirm("Cancel this booking request?")) return;
  try {
    await Api.patch("/bookings/" + id + "/status", { status: "CANCELLED" });
    UI.toast("Booking cancelled.", "success");
    loadBookings();
  } catch (err) {
    UI.toast(err.message, "error");
  }
}

async function loadContracts() {
  const box = document.getElementById("tab-contracts");
  box.innerHTML = UI.spinner("Loading your contracts…");
  try {
    const data = await Api.get("/contracts/my");
    const contracts = data.contracts || [];
    if (!contracts.length) {
      box.innerHTML = UI.empty("No rental contracts yet. Once a landlord approves a booking and creates a contract, it appears here.");
      return;
    }
    const rows = contracts.map((c) => `
      <tr>
        <td>${Dash.houseCell(c.house)}</td>
        <td>${UI.vnd(c.monthlyRent)}</td>
        <td>${UI.vnd(c.depositPaid)}</td>
        <td>${UI.date(c.startDate)} → ${UI.date(c.endDate)}</td>
        <td>${UI.badge(c.status)}</td>
      </tr>`).join("");
    box.innerHTML = `
      <div class="fh-panel p-0">
        <div class="table-responsive">
          <table class="fh-table">
            <thead><tr>
              <th>House</th><th>Monthly rent</th><th>Deposit</th>
              <th>Period</th><th>Status</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
  } catch (err) {
    box.innerHTML = UI.empty(err.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const user = Auth.requireRole("STUDENT");
  if (!user) return;
  UI.chrome();
  document.getElementById("hello").textContent = user.fullName;
  Dash.initTabs({
    bookings: loadBookings,
    saved: loadSaved,
    history: loadHistory,
    recommended: loadRecommended,
    contracts: loadContracts,
    profile: () => Dash.renderProfile(document.getElementById("tab-profile")),
  });
});

// A compact house card used by Saved / Recommended panels.
function studentHouseCard(h, extra = "") {
  const cover = (h.images && h.images[0]) ? UI.img(h.images[0]) : UI.placeholderImg();
  return `
    <div class="col-12 col-sm-6 col-lg-4">
      <article class="fh-card">
        <a href="house.html?id=${h.id}" class="text-decoration-none">
          <div class="fh-card__media">
            <img src="${cover}" alt="${UI.escape(h.title)}"
                 onerror="this.src=UI.placeholderImg()">
            <span class="fh-card__price">${UI.vnd(h.price)}/mo</span>
          </div>
        </a>
        <div class="fh-card__body">
          <a href="house.html?id=${h.id}" class="text-decoration-none">
            <h3 class="fh-card__title">${UI.escape(h.title)}</h3>
          </a>
          <p class="fh-card__loc mb-0"><i class="bi bi-geo-alt"></i>
            ${UI.escape(h.district || "")}</p>
          ${extra}
        </div>
      </article>
    </div>`;
}

async function loadSaved() {
  const box = document.getElementById("tab-saved");
  box.innerHTML = UI.spinner("Loading your saved houses…");
  try {
    const data = await Api.get("/favorites");
    const houses = data.houses || [];
    if (!houses.length) {
      box.innerHTML = UI.empty("You haven't saved any houses yet. Tap the heart on a listing to save it here.");
      return;
    }
    box.innerHTML = `<div class="row g-4">${houses.map((h) =>
      studentHouseCard(h, `<button class="btn btn-ghost btn-sm mt-1" data-unfav="${h.id}">
        <i class="bi bi-heart-fill text-danger"></i> Remove</button>`)
    ).join("")}</div>`;
    box.querySelectorAll("button[data-unfav]").forEach((b) =>
      b.addEventListener("click", () => unsave(b.dataset.unfav)));
  } catch (err) {
    box.innerHTML = UI.empty(err.message);
  }
}

async function unsave(id) {
  try {
    await Api.post("/favorites/" + id, {});
    UI.toast("Removed from your list.", "info");
    loadSaved();
  } catch (err) {
    UI.toast(err.message, "error");
  }
}

async function loadHistory() {
  const box = document.getElementById("tab-history");
  box.innerHTML = UI.spinner("Loading your history…");
  try {
    const data = await Api.get("/history");
    const history = data.history || [];
    if (!history.length) {
      box.innerHTML = UI.empty("No recently viewed houses yet. Houses you open will show up here.");
      return;
    }
    const cards = history.map((r) =>
      studentHouseCard(r.house, `<p class="text-soft small mb-0 mt-1">Viewed ${UI.date(r.viewedAt)}</p>`)
    ).join("");
    box.innerHTML = `
      <div class="d-flex justify-content-end mb-3">
        <button id="clear-history" class="btn btn-ghost btn-sm">
          <i class="bi bi-trash"></i> Clear history</button>
      </div>
      <div class="row g-4">${cards}</div>`;
    document.getElementById("clear-history").addEventListener("click", clearHistory);
  } catch (err) {
    box.innerHTML = UI.empty(err.message);
  }
}

async function clearHistory() {
  if (!confirm("Clear your entire view history?")) return;
  try {
    await Api.del("/history");
    UI.toast("History cleared.", "success");
    loadHistory();
  } catch (err) {
    UI.toast(err.message, "error");
  }
}

async function loadRecommended() {
  const box = document.getElementById("tab-recommended");
  box.innerHTML = UI.spinner("Finding houses for you…");
  try {
    const data = await Api.get("/ai/recommend");
    const recs = data.recommendations || [];
    if (!recs.length) {
      box.innerHTML = UI.empty(
        (data.reason || "No recommendations yet.") +
        " Browse and save a few houses, then check back."
      );
      return;
    }
    const cards = recs.map((r) =>
      studentHouseCard(r.house, `<div class="fh-reco-reason">
        <i class="bi bi-stars"></i><span>${UI.escape(r.reason || "")}</span></div>`)
    ).join("");
    box.innerHTML = `
      <p class="text-soft mb-3"><i class="bi bi-stars"></i>
        Suggestions based on the houses you've viewed and saved.</p>
      <div class="row g-4">${cards}</div>`;
  } catch (err) {
    box.innerHTML = UI.empty("Recommendations aren't available right now. Please try again later.");
  }
}
