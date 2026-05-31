// House detail page: shows one house and lets a student request a booking.

function getId() {
  return new URLSearchParams(window.location.search).get("id");
}

function amenityChips(amenities) {
  if (!amenities || !amenities.length)
    return `<span class="text-soft">No amenities listed.</span>`;
  return amenities
    .map((a) => {
      const info = AMENITY_MAP[a] || { label: a, icon: "check2" };
      return `<span class="fh-chip"><i class="bi bi-${info.icon}"></i>${UI.escape(info.label)}</span>`;
    })
    .join(" ");
}

function gallery(images) {
  const imgs = images && images.length ? images : [null];
  const main = imgs[0] ? UI.img(imgs[0]) : UI.placeholderImg();
  const thumbs = imgs
    .map((src, i) => {
      const url = src ? UI.img(src) : UI.placeholderImg();
      return `<img src="${url}" class="${i === 0 ? "is-active" : ""}"
        data-full="${url}" alt="Photo ${i + 1}"
        onerror="this.src=UI.placeholderImg()">`;
    })
    .join("");
  return `
    <div class="fh-gallery__main">
      <img id="gallery-main" src="${main}" alt="Main photo"
           onerror="this.src=UI.placeholderImg()">
    </div>
    <div class="fh-gallery__thumbs">${thumbs}</div>`;
}

function actionBox(house) {
  const user = Auth.getUser();
  const unavailable = house.status !== "AVAILABLE";

  if (!user) {
    return `
      <div class="fh-panel">
        <p class="text-soft mb-3">Log in as a student to request a booking
          or schedule a visit.</p>
        <a href="login.html?next=house.html" class="btn btn-fh w-100">Log in to book</a>
        <a href="register.html" class="btn btn-ghost w-100 mt-2">Create an account</a>
      </div>`;
  }

  if (user.role !== "STUDENT") {
    return `
      <div class="fh-panel">
        <p class="text-soft mb-0">Booking requests are made by students.
        You are signed in as <strong>${UI.escape(user.role)}</strong>.</p>
      </div>`;
  }

  if (unavailable) {
    return `
      <div class="fh-panel">
        <p class="mb-0">This house is currently
          ${UI.badge(house.status)} and not accepting bookings.</p>
      </div>`;
  }

  return `
    <div class="fh-panel">
      <h5 class="mb-3">Request this house</h5>
      <div class="mb-3">
        <label class="form-label" for="b-visit">Preferred visit date (optional)</label>
        <input id="b-visit" type="date" class="form-control">
      </div>
      <div class="mb-3">
        <label class="form-label" for="b-msg">Message to landlord</label>
        <textarea id="b-msg" rows="3" class="form-control"
          placeholder="Introduce yourself, ask a question…"></textarea>
      </div>
      <button id="b-submit" class="btn btn-fh-accent w-100">Send booking request</button>
      <p class="text-soft small mt-2 mb-0">
        The landlord will be notified and can approve your request.</p>
    </div>`;
}

function render(house) {
  const box = document.getElementById("detail");
  box.innerHTML = `
    <div class="row g-4">
      <div class="col-lg-8">
        ${gallery(house.images)}

        <div class="d-flex flex-wrap align-items-center gap-2 mt-4">
          <span class="fh-chip">${UI.escape(UI.typeLabel(house.type))}</span>
          <span class="fh-chip">${UI.escape(UI.interiorLabel(house.interior))}</span>
          ${UI.badge(house.status)}
          <span id="fav-slot" class="ms-auto"></span>
        </div>
        <h1 class="h2 mt-2">${UI.escape(house.title)}</h1>
        <p class="text-soft mb-2">
          <i class="bi bi-geo-alt"></i>
          ${UI.escape(house.address)}, ${UI.escape(house.ward || "")}
          ${house.ward ? "," : ""} ${UI.escape(house.district)}, HCMC
        </p>

        <div class="row g-3 my-3">
          <div class="col-6 col-md-3"><div class="fh-stat">
            <div class="fh-stat__label">Rent / month</div>
            <div class="fh-stat__value" style="font-size:1.3rem">${UI.vnd(house.price)}</div>
          </div></div>
          <div class="col-6 col-md-3"><div class="fh-stat">
            <div class="fh-stat__label">Deposit</div>
            <div class="fh-stat__value" style="font-size:1.3rem">${UI.vnd(house.deposit)}</div>
          </div></div>
          <div class="col-6 col-md-3"><div class="fh-stat">
            <div class="fh-stat__label">Area</div>
            <div class="fh-stat__value" style="font-size:1.3rem">${house.area} m²</div>
          </div></div>
          <div class="col-6 col-md-3"><div class="fh-stat">
            <div class="fh-stat__label">Max tenants</div>
            <div class="fh-stat__value" style="font-size:1.3rem">${house.maxTenants}</div>
          </div></div>
        </div>

        <h5 class="mt-4">Description</h5>
        <p style="white-space:pre-line">${UI.escape(house.description)}</p>

        <h5 class="mt-4">Amenities</h5>
        <div class="d-flex flex-wrap gap-2">${amenityChips(house.amenities)}</div>
      </div>

      <div class="col-lg-4">
        <div class="fh-panel mb-3">
          <p class="fh-section-eyebrow mb-2">Listed by</p>
          <div class="d-flex align-items-center gap-3">
            <span class="fh-avatar" style="width:46px;height:46px;font-size:1.1rem">
              ${UI.escape((house.landlord?.fullName || "?")[0])}</span>
            <div>
              <div class="fw-bold">${UI.escape(house.landlord?.fullName || "Landlord")}</div>
              <div class="text-soft small">Verified landlord</div>
            </div>
          </div>
          <hr class="fh-divider">
          <p class="mb-1"><i class="bi bi-telephone"></i>
            ${UI.escape(house.contactPhone || house.landlord?.phone || "—")}</p>
          <p class="mb-0"><i class="bi bi-envelope"></i>
            ${UI.escape(house.contactEmail || house.landlord?.email || "—")}</p>
        </div>
        <div id="action-box">${actionBox(house)}</div>
      </div>
    </div>`;

  // Gallery thumbnail switching.
  box.querySelectorAll(".fh-gallery__thumbs img").forEach((t) =>
    t.addEventListener("click", () => {
      document.getElementById("gallery-main").src = t.dataset.full;
      box.querySelectorAll(".fh-gallery__thumbs img").forEach((x) =>
        x.classList.remove("is-active"));
      t.classList.add("is-active");
    })
  );

  // Booking submission (students only).
  const submit = document.getElementById("b-submit");
  if (submit) {
    submit.addEventListener("click", () => sendBooking(house.id, submit));
  }

  // Favorite button (students only).
  setupFavoriteButton(house.id);
}

async function setupFavoriteButton(houseId) {
  const slot = document.getElementById("fav-slot");
  const user = Auth.getUser();
  if (!slot || !user || user.role !== "STUDENT") return;
  let isFav = false;
  try {
    const data = await Api.get("/favorites/check/" + houseId);
    isFav = !!data.favorited;
  } catch {}

  const render = () => {
    slot.innerHTML = `<button class="fh-fav-btn ${isFav ? "is-on" : ""}" id="fav-toggle">
      <i class="bi ${isFav ? "bi-heart-fill" : "bi-heart"}"></i>
      <span>${isFav ? "Saved" : "Save"}</span>
    </button>`;
    document.getElementById("fav-toggle").addEventListener("click", toggle);
  };
  const toggle = async () => {
    const btn = document.getElementById("fav-toggle");
    btn.disabled = true;
    try {
      const data = await Api.post("/favorites/" + houseId, {});
      isFav = data.favorited;
      UI.toast(isFav ? "Saved to your list." : "Removed from your list.", isFav ? "success" : "info");
      render();
    } catch (err) {
      UI.toast(err.message, "error");
      btn.disabled = false;
    }
  };
  render();
}

async function sendBooking(houseId, btn) {
  const visitDate = document.getElementById("b-visit").value;
  const message = document.getElementById("b-msg").value.trim();
  btn.disabled = true;
  btn.textContent = "Sending…";
  try {
    await Api.post("/bookings", {
      houseId,
      message: message || undefined,
      visitDate: visitDate || undefined,
    });
    UI.toast("Booking request sent! The landlord has been notified.", "success");
    document.getElementById("action-box").innerHTML = `
      <div class="fh-panel">
        <h5 class="mb-2"><i class="bi bi-check-circle text-success"></i> Request sent</h5>
        <p class="text-soft mb-3">Track this in your dashboard under My Bookings.</p>
        <a href="student.html" class="btn btn-fh w-100">Go to my dashboard</a>
      </div>`;
  } catch (err) {
    UI.toast(err.message, "error");
    btn.disabled = false;
    btn.textContent = "Send booking request";
  }
}

async function init() {
  UI.chrome("browse");
  const id = getId();
  const box = document.getElementById("detail");
  if (!id) { box.innerHTML = UI.empty("No house selected."); return; }
  box.innerHTML = UI.spinner("Loading house…");
  try {
    const data = await Api.get("/houses/" + id);
    render(data.house);
  } catch (err) {
    box.innerHTML = UI.empty(err.message);
  }
}

document.addEventListener("DOMContentLoaded", init);
