// Landlord dashboard logic.

let listingModal, contractModal;

async function loadStats() {
  const host = document.getElementById("stats");
  const tile = (label, value, accent) => `
    <div class="col-6 col-lg-3">
      <div class="fh-stat ${accent ? "fh-stat--accent" : ""}">
        <div class="fh-stat__label">${label}</div>
        <div class="fh-stat__value">${value}</div>
      </div>
    </div>`;
  try {
    const data = await Api.get("/houses/landlord/stats");
    const s = data.stats;
    const l = s.listings;
    host.innerHTML =
      tile("Total listings", l.total) +
      tile("Available", l.available) +
      tile("Rented", l.rented, true) +
      tile("Pending bookings", s.pendingBookings) +
      tile("Active / rented", l.rented) +
      tile("Est. monthly revenue", UI.vnd(s.estimatedMonthlyRevenue), true);
  } catch {
    // Fallback: count from the listings.
    try {
      const data = await Api.get("/houses/landlord/my");
      const houses = data.houses || [];
      const c = { total: houses.length, available: 0, rented: 0, pending: 0 };
      houses.forEach((h) => {
        if (h.status === "AVAILABLE") c.available++;
        if (h.status === "RENTED") c.rented++;
        if (h.status === "PENDING") c.pending++;
      });
      host.innerHTML =
        tile("Total listings", c.total) +
        tile("Available", c.available) +
        tile("Rented", c.rented, true) +
        tile("Pending", c.pending);
    } catch {
      host.innerHTML = "";
    }
  }
}

async function loadListings() {
  const box = document.getElementById("tab-listings");
  box.innerHTML = UI.spinner("Loading your listings…");
  try {
    const data = await Api.get("/houses/landlord/my");
    const houses = data.houses || [];
    if (!houses.length) {
      box.innerHTML = UI.empty("You have no listings yet. Click “New listing” to post your first house.");
      return;
    }
    const rows = houses.map((h) => `
      <tr>
        <td>${Dash.houseCell(h)}</td>
        <td>${UI.escape(UI.typeLabel(h.type))}</td>
        <td>${UI.vnd(h.price)}</td>
        <td>
          ${h.status === "PENDING"
            ? UI.badge("PENDING") + `<div class="text-soft small">awaiting your decision</div>`
            : `<select class="form-select form-select-sm" data-status="${h.id}" style="width:auto">
                ${LANDLORD_SETTABLE_STATUSES.map((s) =>
                  `<option value="${s.value}" ${s.value === h.status ? "selected" : ""}>${s.label}</option>`
                ).join("")}
              </select>`}
        </td>
        <td class="text-end">
          <button class="btn btn-ghost btn-sm" data-edit="${h.id}">Edit</button>
          <button class="btn btn-ghost btn-sm" data-del="${h.id}">
            <i class="bi bi-trash"></i></button>
        </td>
      </tr>`).join("");
    box.innerHTML = `
      <div class="fh-panel p-0">
        <div class="table-responsive">
          <table class="fh-table">
            <thead><tr>
              <th>House</th><th>Type</th><th>Price</th><th>Status</th><th></th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;

    box.querySelectorAll("select[data-status]").forEach((sel) =>
      sel.addEventListener("change", () => changeStatus(sel.dataset.status, sel.value)));
    box.querySelectorAll("button[data-edit]").forEach((b) =>
      b.addEventListener("click", () => openListingForm(b.dataset.edit)));
    box.querySelectorAll("button[data-del]").forEach((b) =>
      b.addEventListener("click", () => deleteListing(b.dataset.del)));
  } catch (err) {
    box.innerHTML = UI.empty(err.message);
  }
}

async function changeStatus(id, status) {
  try {
    await Api.patch("/houses/" + id + "/status", { status });
    UI.toast("Status updated.", "success");
    loadStats();
  } catch (err) {
    UI.toast(err.message, "error");
    loadListings();
  }
}

async function deleteListing(id) {
  if (!confirm("Delete this listing permanently?")) return;
  try {
    await Api.del("/houses/" + id);
    UI.toast("Listing deleted.", "success");
    loadListings();
    loadStats();
  } catch (err) {
    UI.toast(err.message, "error");
  }
}

function listingFormHtml(h) {
  const v = h || {};
  const amenitySet = new Set(v.amenities || []);
  const typeOpts = HOUSE_TYPES.map((t) =>
    `<option value="${t.value}" ${t.value === v.type ? "selected" : ""}>${t.label}</option>`).join("");
  const interiorOpts = INTERIOR_TYPES.map((t) =>
    `<option value="${t.value}" ${t.value === v.interior ? "selected" : ""}>${t.label}</option>`).join("");
  const districtOpts = HCMC_DISTRICTS.map((d) =>
    `<option value="${d}" ${d === v.district ? "selected" : ""}>${d}</option>`).join("");
  const amenityChecks = AMENITY_OPTIONS.map((a) => {
    const info = AMENITY_MAP[a];
    return `<div class="col-6 col-md-4">
      <label class="fh-chip w-100" style="cursor:pointer">
        <input type="checkbox" class="form-check-input me-1" value="${a}"
          ${amenitySet.has(a) ? "checked" : ""}>
        <i class="bi bi-${info.icon}"></i> ${info.label}
      </label></div>`;
  }).join("");

  const existingImgs = (v.images || []).map((src) =>
    `<img src="${UI.img(src)}" style="width:70px;height:54px;object-fit:cover;border-radius:6px"
       onerror="this.src=UI.placeholderImg()">`).join("");

  return `
    <input type="hidden" id="lf-id" value="${v.id || ""}">
    <div class="row g-3">
      <div class="col-12">
        <label class="form-label">Title</label>
        <input id="lf-title" class="form-control" value="${UI.escape(v.title || "")}"
          placeholder="Cozy studio near HCMUT, District 10">
      </div>
      <div class="col-12">
        <label class="form-label">Description</label>
        <textarea id="lf-description" rows="3" class="form-control"
          placeholder="Describe the place, neighbourhood, rules…">${UI.escape(v.description || "")}</textarea>
      </div>
      <div class="col-md-4">
        <label class="form-label">Type</label>
        <select id="lf-type" class="form-select">${typeOpts}</select>
      </div>
      <div class="col-md-4">
        <label class="form-label">Interior</label>
        <select id="lf-interior" class="form-select">${interiorOpts}</select>
      </div>
      <div class="col-md-4">
        <label class="form-label">Max tenants</label>
        <input id="lf-maxTenants" type="number" min="1" class="form-control" value="${v.maxTenants || 1}">
      </div>
      <div class="col-md-4">
        <label class="form-label">Price / month (₫)</label>
        <input id="lf-price" type="number" min="0" step="100000" class="form-control" value="${v.price || ""}">
      </div>
      <div class="col-md-4">
        <label class="form-label">Deposit (₫)</label>
        <input id="lf-deposit" type="number" min="0" step="100000" class="form-control" value="${v.deposit || ""}">
      </div>
      <div class="col-md-4">
        <label class="form-label">Area (m²)</label>
        <input id="lf-area" type="number" min="0" step="0.5" class="form-control" value="${v.area || ""}">
      </div>
      <div class="col-md-4">
        <label class="form-label">District</label>
        <select id="lf-district" class="form-select">
          <option value="">Choose…</option>${districtOpts}
        </select>
      </div>
      <div class="col-md-4">
        <label class="form-label">Ward (optional)</label>
        <input id="lf-ward" class="form-control" value="${UI.escape(v.ward || "")}">
      </div>
      <div class="col-md-4">
        <label class="form-label">Contact phone</label>
        <input id="lf-contactPhone" class="form-control" value="${UI.escape(v.contactPhone || "")}">
      </div>
      <div class="col-12">
        <label class="form-label">Full address</label>
        <input id="lf-address" class="form-control" value="${UI.escape(v.address || "")}"
          placeholder="123 Đường ABC">
      </div>
      <div class="col-12">
        <label class="form-label">Amenities</label>
        <div class="row g-2">${amenityChecks}</div>
      </div>
      <div class="col-12">
        <label class="form-label">Photos ${h ? "(upload to add more)" : ""}</label>
        ${existingImgs ? `<div class="d-flex gap-2 flex-wrap mb-2">${existingImgs}</div>` : ""}
        <input id="lf-images" type="file" class="form-control" accept="image/*" multiple>
        <small class="text-soft">You can select multiple images. Max 5.</small>
      </div>
      <div class="col-12 d-flex justify-content-end gap-2 mt-2">
        <button class="btn btn-ghost" data-bs-dismiss="modal">Cancel</button>
        <button id="lf-save" class="btn btn-fh">${h ? "Save changes" : "Publish listing"}</button>
      </div>
    </div>`;
}

async function openListingForm(id) {
  const titleEl = document.getElementById("listingModalTitle");
  const formEl = document.getElementById("listingForm");
  let house = null;
  if (id) {
    titleEl.textContent = "Edit listing";
    formEl.innerHTML = UI.spinner("Loading…");
    listingModal.show();
    try {
      const data = await Api.get("/houses/" + id);
      house = data.house;
    } catch (err) {
      UI.toast(err.message, "error");
      listingModal.hide();
      return;
    }
  } else {
    titleEl.textContent = "New listing";
    listingModal.show();
  }
  formEl.innerHTML = listingFormHtml(house);
  document.getElementById("lf-save").addEventListener("click", (e) => saveListing(e.target, id));
}

function collectListing() {
  const amenities = Array.from(
    document.querySelectorAll("#listingForm input[type=checkbox]:checked")
  ).map((c) => c.value);
  return {
    title: document.getElementById("lf-title").value.trim(),
    description: document.getElementById("lf-description").value.trim(),
    type: document.getElementById("lf-type").value,
    interior: document.getElementById("lf-interior").value,
    maxTenants: document.getElementById("lf-maxTenants").value,
    price: document.getElementById("lf-price").value,
    deposit: document.getElementById("lf-deposit").value,
    area: document.getElementById("lf-area").value,
    district: document.getElementById("lf-district").value,
    ward: document.getElementById("lf-ward").value.trim(),
    address: document.getElementById("lf-address").value.trim(),
    contactPhone: document.getElementById("lf-contactPhone").value.trim(),
    amenities,
  };
}

async function saveListing(btn, id) {
  const v = collectListing();
  // Required fields.
  if (!v.title || !v.description || !v.address || !v.district) {
    UI.toast("Title, description, address and district are required.", "error");
    return;
  }
  if (!v.price || !v.area) {
    UI.toast("Please enter price and area.", "error");
    return;
  }

  // Send as multipart for image upload.
  const fd = new FormData();
  Object.entries(v).forEach(([k, val]) => {
    if (k === "amenities") fd.append("amenities", JSON.stringify(val));
    else fd.append(k, val);
  });
  const files = document.getElementById("lf-images").files;
  if (files.length > 5) {
    UI.toast("Please select at most 5 images.", "error");
    return;
  }
  for (const f of files) fd.append("images", f);

  btn.disabled = true;
  btn.textContent = "Saving…";
  try {
    if (id) await Api.put("/houses/" + id, fd, { isForm: true });
    else await Api.post("/houses", fd, { isForm: true });
    UI.toast(id ? "Listing updated." : "Listing published.", "success");
    listingModal.hide();
    loadListings();
    loadStats();
  } catch (err) {
    UI.toast(err.message, "error");
    btn.disabled = false;
    btn.textContent = id ? "Save changes" : "Publish listing";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const user = Auth.requireRole("LANDLORD");
  if (!user) return;
  UI.chrome();
  document.getElementById("hello").textContent = user.fullName;
  listingModal = new bootstrap.Modal(document.getElementById("listingModal"));
  contractModal = new bootstrap.Modal(document.getElementById("contractModal"));

  document.getElementById("btn-new-listing")
    .addEventListener("click", () => openListingForm(null));

  loadStats();
  Dash.initTabs({
    listings: loadListings,
    requests: loadRequests,
    payments: loadPayments,
    profile: () => Dash.renderProfile(document.getElementById("tab-profile")),
  });
});
