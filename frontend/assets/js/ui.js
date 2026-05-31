// Shared UI helpers used across every page.

const UI = {
  vnd(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) return "—";
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
  },

  date(value) {
    if (!value) return "—";
    const d = new Date(value);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  },

  img(path) {
    if (!path) return UI.placeholderImg();
    if (path.startsWith("http")) return path;
    return API_ORIGIN + path;
  },

  placeholderImg() {
    const svg =
      "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>" +
      "<rect width='100%' height='100%' fill='%23e9e2d6'/>" +
      "<text x='50%' y='50%' fill='%23b5a890' font-family='sans-serif'" +
      " font-size='20' text-anchor='middle' dy='.3em'>No photo</text></svg>";
    return "data:image/svg+xml," + svg.replace(/#/g, "%23");
  },

  escape(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  },

  badge(status) {
    const map = {
      AVAILABLE: "ok", PENDING: "warn", RENTED: "muted", INACTIVE: "muted",
      APPROVED: "ok", REJECTED: "bad", CANCELLED: "bad",
      ACTIVE: "ok", EXPIRED: "muted", TERMINATED: "bad",
      PAID: "ok", OVERDUE: "bad", STUDENT: "info", LANDLORD: "info", STAFF: "dark",
    };
    const tone = map[status] || "muted";
    return `<span class="fh-badge fh-badge--${tone}">${UI.escape(status)}</span>`;
  },

  typeLabel(value) {
    const t = HOUSE_TYPES.find((x) => x.value === value);
    return t ? t.label : value;
  },

  interiorLabel(value) {
    const t = INTERIOR_TYPES.find((x) => x.value === value);
    return t ? t.label : value;
  },

  toast(message, type = "success") {
    let host = document.getElementById("fh-toast-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "fh-toast-host";
      document.body.appendChild(host);
    }
    const el = document.createElement("div");
    el.className = "fh-toast fh-toast--" + type;
    el.textContent = message;
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add("is-shown"));
    setTimeout(() => {
      el.classList.remove("is-shown");
      setTimeout(() => el.remove(), 300);
    }, 3600);
  },

  spinner(text = "Loading…") {
    return `<div class="fh-loading"><div class="fh-spinner"></div>
      <span>${UI.escape(text)}</span></div>`;
  },

  empty(text = "Nothing here yet.") {
    return `<div class="fh-empty">${UI.escape(text)}</div>`;
  },

  navbar(active = "") {
    const host = document.getElementById("app-navbar");
    if (!host) return;
    const user = Auth.getUser();

    let right;
    if (user) {
      const dash = Auth.dashboardFor(user.role);
      right = `
        <li class="nav-item">
          <a class="nav-link" href="${dash}">Dashboard</a>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle d-flex align-items-center gap-2"
             href="#" role="button" data-bs-toggle="dropdown">
            <span class="fh-avatar">${UI.escape((user.fullName || "?")[0])}</span>
            <span class="d-none d-lg-inline">${UI.escape(user.fullName)}</span>
          </a>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><span class="dropdown-item-text small text-muted">
              ${UI.escape(user.email)}<br>${UI.badge(user.role)}</span></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="${dash}">My dashboard</a></li>
            <li><a class="dropdown-item" href="#" id="nav-logout">Log out</a></li>
          </ul>
        </li>`;
    } else {
      right = `
        <li class="nav-item"><a class="nav-link" href="login.html">Log in</a></li>
        <li class="nav-item">
          <a class="btn btn-fh-accent btn-sm ms-lg-2 px-3" href="register.html">
            Sign up
          </a>
        </li>`;
    }

    const link = (href, label, key) =>
      `<li class="nav-item">
        <a class="nav-link ${active === key ? "active" : ""}" href="${href}">${label}</a>
      </li>`;

    host.innerHTML = `
      <nav class="navbar navbar-expand-lg fh-navbar sticky-top">
        <div class="container">
          <a class="navbar-brand fh-brand" href="index.html">
            <span class="fh-brand__mark">FH</span>
            <span class="fh-brand__text">Find House <em>HCMC</em></span>
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                  data-bs-target="#fhNav" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="fhNav">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              ${link("index.html", "Browse houses", "browse")}
            </ul>
            <ul class="navbar-nav align-items-lg-center">
              ${right}
            </ul>
          </div>
        </div>
      </nav>`;

    const logout = document.getElementById("nav-logout");
    if (logout) {
      logout.addEventListener("click", (e) => {
        e.preventDefault();
        Auth.logout();
      });
    }
  },

  footer() {
    const host = document.getElementById("app-footer");
    if (!host) return;
    host.innerHTML = `
      <footer class="fh-footer">
        <div class="container">
          <div class="fh-footer__grid">
            <div>
              <div class="fh-brand fh-brand--footer">
                <span class="fh-brand__mark">FH</span>
                <span class="fh-brand__text">Find House <em>HCMC</em></span>
              </div>
              <p class="fh-footer__tag">
                Connecting students with trusted landlords across
                Ho Chi Minh City.
              </p>
            </div>
            <div>
              <h6>Platform</h6>
              <a href="index.html">Browse houses</a>
              <a href="register.html">Become a landlord</a>
              <a href="login.html">Log in</a>
            </div>
            <div>
              <h6>About</h6>
              <span>Web Application Development</span>
              <span>Final Project</span>
              <span>International University – VNU HCMC</span>
            </div>
          </div>
          <div class="fh-footer__bar">
            © ${new Date().getFullYear()} Find House for Rent. Student project.
          </div>
        </div>
      </footer>`;
  },

  // Mount navbar, footer and chat widget.
  chrome(active = "") {
    UI.navbar(active);
    UI.footer();
    UI.mountChat();
  },

  // Heart toggle, shown to students only.
  heart(houseId, isFav) {
    const user = Auth.getUser();
    if (!user || user.role !== "STUDENT") return "";
    return `<button class="fh-heart ${isFav ? "is-on" : ""}"
      data-fav="${houseId}" title="Save this house" aria-label="Save this house">
      <i class="bi ${isFav ? "bi-heart-fill" : "bi-heart"}"></i>
    </button>`;
  },

  // Wire heart buttons to toggle favorites.
  bindHearts(root = document) {
    root.querySelectorAll("button[data-fav]").forEach((btn) => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.dataset.fav;
        btn.disabled = true;
        try {
          const data = await Api.post("/favorites/" + id, {});
          const on = data.favorited;
          btn.classList.toggle("is-on", on);
          btn.querySelector("i").className = "bi " + (on ? "bi-heart-fill" : "bi-heart");
          UI.toast(on ? "Saved to your list." : "Removed from your list.", on ? "success" : "info");
        } catch (err) {
          UI.toast(err.message, "error");
        } finally {
          btn.disabled = false;
        }
      });
    });
  },

  // Floating chat panel for the housing assistant.
  mountChat() {
    if (document.getElementById("fh-chat")) return;
    const wrap = document.createElement("div");
    wrap.id = "fh-chat";
    wrap.innerHTML = `
      <button id="fh-chat-toggle" class="fh-chat__toggle" aria-label="Open housing assistant">
        <i class="bi bi-chat-dots-fill"></i>
      </button>
      <div id="fh-chat-panel" class="fh-chat__panel" hidden>
        <div class="fh-chat__head">
          <div>
            <strong>Housing assistant</strong>
            <div class="fh-chat__sub">Ask about districts, rent, living costs</div>
          </div>
          <button id="fh-chat-close" class="fh-chat__close" aria-label="Close">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div id="fh-chat-log" class="fh-chat__log"></div>
        <div class="fh-chat__input">
          <input id="fh-chat-text" type="text" class="form-control"
            placeholder="e.g. Cheap rooms near HCMUT?" autocomplete="off">
          <button id="fh-chat-send" class="btn btn-fh">Send</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);

    const panel = wrap.querySelector("#fh-chat-panel");
    const log = wrap.querySelector("#fh-chat-log");
    const input = wrap.querySelector("#fh-chat-text");
    const sendBtn = wrap.querySelector("#fh-chat-send");

    const add = (who, text) => {
      const row = document.createElement("div");
      row.className = "fh-chat__msg fh-chat__msg--" + who;
      row.textContent = text;
      log.appendChild(row);
      log.scrollTop = log.scrollHeight;
      return row;
    };

    let greeted = false;
    const openPanel = () => {
      panel.hidden = false;
      if (!greeted) {
        add("bot", "Hi! I can help with questions about renting in Ho Chi Minh City — districts, budgets, what to look for. What would you like to know?");
        greeted = true;
      }
      input.focus();
    };

    const send = async () => {
      const message = input.value.trim();
      if (!message) return;
      add("me", message);
      input.value = "";
      sendBtn.disabled = true;
      const thinking = add("bot", "…");
      try {
        const data = await Api.post("/ai/chat", { message });
        thinking.textContent = data.reply || "Sorry, no answer right now.";
      } catch (err) {
        thinking.textContent = "The assistant is unavailable right now. Please try again later.";
      } finally {
        sendBtn.disabled = false;
        log.scrollTop = log.scrollHeight;
      }
    };

    wrap.querySelector("#fh-chat-toggle").addEventListener("click", openPanel);
    wrap.querySelector("#fh-chat-close").addEventListener("click", () => (panel.hidden = true));
    sendBtn.addEventListener("click", send);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });
  },
};
