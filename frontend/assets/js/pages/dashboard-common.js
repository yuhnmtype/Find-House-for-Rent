// Helpers shared by the student, landlord and staff dashboards.

const Dash = {
  // Wire up the .fh-tab buttons to show/hide matching panels.
  // Calls loaders[tabName]() the first time a tab is opened.
  initTabs(loaders) {
    const loaded = {};
    const tabs = document.querySelectorAll(".fh-tab");
    const open = (name) => {
      tabs.forEach((t) => t.classList.toggle("is-active", t.dataset.tab === name));
      document.querySelectorAll(".tab-panel").forEach((p) =>
        p.classList.toggle("d-none", p.id !== "tab-" + name)
      );
      if (loaders[name] && !loaded[name]) {
        loaded[name] = true;
        loaders[name]();
      }
    };
    tabs.forEach((t) => t.addEventListener("click", () => open(t.dataset.tab)));
    // Open the first tab.
    const first = document.querySelector(".fh-tab");
    if (first) open(first.dataset.tab);
    return { open, reload: (name) => { loaded[name] = false; open(name); } };
  },

  // Render an editable profile form into a container.
  renderProfile(container) {
    const user = Auth.getUser();
    container.innerHTML = `
      <div class="row g-4">
        <div class="col-lg-7">
          <div class="fh-panel">
            <h5 class="mb-3">Account details</h5>
            <div class="mb-3">
              <label class="form-label" for="p-name">Full name</label>
              <input id="p-name" class="form-control" value="${UI.escape(user.fullName)}">
            </div>
            <div class="mb-3">
              <label class="form-label" for="p-phone">Phone</label>
              <input id="p-phone" class="form-control" value="${UI.escape(user.phone || "")}">
            </div>
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input class="form-control" value="${UI.escape(user.email)}" disabled>
              <small class="text-soft">Email cannot be changed.</small>
            </div>
            <button id="p-save" class="btn btn-fh">Save changes</button>
          </div>
        </div>
        <div class="col-lg-5">
          <div class="fh-panel">
            <h5 class="mb-3">Change password</h5>
            <div class="mb-3">
              <label class="form-label" for="p-old">Current password</label>
              <input id="p-old" type="password" class="form-control">
            </div>
            <div class="mb-3">
              <label class="form-label" for="p-new">New password</label>
              <input id="p-new" type="password" class="form-control" placeholder="At least 6 characters">
            </div>
            <button id="p-change" class="btn btn-fh-outline">Update password</button>
          </div>
        </div>
      </div>`;

    document.getElementById("p-save").addEventListener("click", async (e) => {
      const btn = e.target;
      btn.disabled = true;
      try {
        const body = {
          fullName: document.getElementById("p-name").value.trim(),
          phone: document.getElementById("p-phone").value.trim() || undefined,
        };
        const data = await Api.put("/auth/me", body);
        Auth.updateUser(data.user);
        UI.toast("Profile updated.", "success");
        const hello = document.getElementById("hello");
        if (hello) hello.textContent = data.user.fullName;
      } catch (err) {
        UI.toast(err.message, "error");
      } finally {
        btn.disabled = false;
      }
    });

    document.getElementById("p-change").addEventListener("click", async (e) => {
      const btn = e.target;
      const currentPassword = document.getElementById("p-old").value;
      const newPassword = document.getElementById("p-new").value;
      if (!currentPassword || !newPassword) {
        UI.toast("Fill in both password fields.", "error");
        return;
      }
      if (newPassword.length < 6) {
        UI.toast("New password should be at least 6 characters.", "error");
        return;
      }
      btn.disabled = true;
      try {
        await Api.put("/auth/change-password", { currentPassword, newPassword });
        UI.toast("Password updated.", "success");
        document.getElementById("p-old").value = "";
        document.getElementById("p-new").value = "";
      } catch (err) {
        UI.toast(err.message, "error");
      } finally {
        btn.disabled = false;
      }
    });
  },

  // A small house-summary cell for tables.
  houseCell(house) {
    if (!house) return "<span class='text-soft'>—</span>";
    const cover = (house.images && house.images[0])
      ? UI.img(house.images[0]) : UI.placeholderImg();
    return `<div class="d-flex align-items-center gap-2">
      <img src="${cover}" alt="" style="width:46px;height:36px;object-fit:cover;border-radius:6px"
           onerror="this.src=UI.placeholderImg()">
      <div>
        <a href="house.html?id=${house.id}" class="fw-semibold">${UI.escape(house.title)}</a>
        <div class="text-soft small">${UI.escape(house.district || "")}</div>
      </div></div>`;
  },
};
