// Session and authentication helpers (token + user in localStorage).

const TOKEN_KEY = "fh_token";
const USER_KEY = "fh_user";

const Auth = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  updateUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = "index.html";
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  // Dashboard page for a role.
  dashboardFor(role) {
    if (role === "STUDENT") return "student.html";
    if (role === "LANDLORD") return "landlord.html";
    if (role === "STAFF") return "staff.html";
    return "index.html";
  },

  // Guard a page by role; redirect if not allowed.
  requireRole(...roles) {
    const user = this.getUser();
    if (!this.isLoggedIn() || !user) {
      const next = encodeURIComponent(window.location.pathname.split("/").pop());
      window.location.href = "login.html?next=" + next;
      return null;
    }
    if (roles.length && !roles.includes(user.role)) {
      window.location.href = this.dashboardFor(user.role);
      return null;
    }
    return user;
  },
};
