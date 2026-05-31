// Home page: search, filter and list houses.

const state = { page: 1, limit: 9, favIds: new Set() };

function fillSelect(id, options, getVal, getLabel) {
  const sel = document.getElementById(id);
  options.forEach((o) => {
    const opt = document.createElement("option");
    opt.value = getVal(o);
    opt.textContent = getLabel(o);
    sel.appendChild(opt);
  });
}

function cardTemplate(h) {
  const cover = (h.images && h.images[0]) ? UI.img(h.images[0]) : UI.placeholderImg();
  return `
    <div class="col-12 col-sm-6 col-lg-4">
      <a class="text-decoration-none" href="house.html?id=${h.id}">
        <article class="fh-card">
          <div class="fh-card__media">
            <img src="${cover}" alt="${UI.escape(h.title)}"
                 onerror="this.src=UI.placeholderImg()">
            <span class="fh-card__price">${UI.vnd(h.price)}/mo</span>
            ${UI.heart(h.id, state.favIds.has(h.id))}
          </div>
          <div class="fh-card__body">
            <div class="d-flex justify-content-between align-items-start gap-2">
              <span class="fh-chip">${UI.escape(UI.typeLabel(h.type))}</span>
              ${UI.badge(h.status)}
            </div>
            <h3 class="fh-card__title">${UI.escape(h.title)}</h3>
            <p class="fh-card__loc mb-0">
              <i class="bi bi-geo-alt"></i>
              ${UI.escape(h.district)}${h.ward ? " · " + UI.escape(h.ward) : ""}
            </p>
            <div class="fh-card__meta mt-1">
              <span><i class="bi bi-rulers"></i> ${h.area} m²</span>
              <span><i class="bi bi-people"></i> ${h.maxTenants} tenant(s)</span>
              <span><i class="bi bi-house-gear"></i> ${UI.escape(UI.interiorLabel(h.interior))}</span>
            </div>
          </div>
        </article>
      </a>
    </div>`;
}

async function loadListings() {
  const box = document.getElementById("listings");
  box.innerHTML = `<div class="col-12">${UI.spinner("Finding houses…")}</div>`;
  document.getElementById("pager").innerHTML = "";

  const [sortBy, order] = document.getElementById("f-sort").value.split("|");
  const params = {
    keyword: document.getElementById("f-keyword").value.trim(),
    district: document.getElementById("f-district").value,
    type: document.getElementById("f-type").value,
    interior: document.getElementById("f-interior").value,
    maxPrice: document.getElementById("f-max").value,
    status: "AVAILABLE",
    sortBy, order,
    page: state.page, limit: state.limit,
  };

  try {
    const data = await Api.get("/houses" + Api.qs(params));
    const houses = data.houses || [];
    document.getElementById("result-count").textContent =
      data.total + " result" + (data.total === 1 ? "" : "s");

    if (!houses.length) {
      box.innerHTML = `<div class="col-12">${UI.empty("No houses match your filters. Try widening your search.")}</div>`;
      return;
    }
    box.innerHTML = houses.map(cardTemplate).join("");
    UI.bindHearts(box);
    renderPager(data.page, data.totalPages);
  } catch (err) {
    box.innerHTML = `<div class="col-12">${UI.empty(err.message)}</div>`;
  }
}

function renderPager(page, totalPages) {
  if (totalPages <= 1) return;
  const pager = document.getElementById("pager");
  const btn = (label, target, disabled, active) =>
    `<button class="btn ${active ? "btn-fh" : "btn-ghost"} btn-sm"
       ${disabled ? "disabled" : ""} data-page="${target}">${label}</button>`;
  let html = btn("‹ Prev", page - 1, page <= 1, false);
  for (let p = 1; p <= totalPages; p++) html += btn(p, p, false, p === page);
  html += btn("Next ›", page + 1, page >= totalPages, false);
  pager.innerHTML = html;
  pager.querySelectorAll("button[data-page]").forEach((b) =>
    b.addEventListener("click", () => {
      state.page = parseInt(b.dataset.page);
      loadListings();
      window.scrollTo({ top: 0, behavior: "smooth" });
    })
  );
}

function init() {
  UI.chrome("browse");
  fillSelect("f-district", HCMC_DISTRICTS, (d) => d, (d) => d);
  fillSelect("f-type", HOUSE_TYPES, (t) => t.value, (t) => t.label);
  fillSelect("f-interior", INTERIOR_TYPES, (t) => t.value, (t) => t.label);

  document.getElementById("f-search").addEventListener("click", () => {
    state.page = 1; loadListings();
  });
  document.getElementById("f-sort").addEventListener("change", () => {
    state.page = 1; loadListings();
  });
  document.getElementById("f-keyword").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { state.page = 1; loadListings(); }
  });

  loadFavoritesThenListings();
}

// Load the student's saved house ids first.
async function loadFavoritesThenListings() {
  const user = Auth.getUser();
  if (user && user.role === "STUDENT") {
    try {
      const data = await Api.get("/favorites");
      state.favIds = new Set((data.houses || []).map((h) => h.id));
    } catch {
      state.favIds = new Set();
    }
  }
  loadListings();
}

document.addEventListener("DOMContentLoaded", init);
