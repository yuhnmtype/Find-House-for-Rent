// API client: attaches the token, parses JSON, throws on error.

const Api = {
  async request(method, path, { body, isForm = false } = {}) {
    const headers = {};
    const token = Auth.getToken();
    if (token) headers["Authorization"] = "Bearer " + token;

    let payload;
    if (body !== undefined) {
      if (isForm) {
        payload = body;
      } else {
        headers["Content-Type"] = "application/json";
        payload = JSON.stringify(body);
      }
    }

    let res;
    try {
      res = await fetch(API_BASE + path, { method, headers, body: payload });
    } catch (networkErr) {
      throw new Error(
        "Cannot reach the server. Make sure the backend is running on " +
          API_ORIGIN + "."
      );
    }

    let data = null;
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!res.ok) {
      // Session expired or invalid.
      if (res.status === 401 && Auth.isLoggedIn()) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
      const msg = (data && data.message) || "Request failed (" + res.status + ")";
      throw new Error(msg);
    }

    return data;
  },

  get(path) {
    return this.request("GET", path);
  },
  post(path, body, opts) {
    return this.request("POST", path, { body, ...opts });
  },
  put(path, body, opts) {
    return this.request("PUT", path, { body, ...opts });
  },
  patch(path, body) {
    return this.request("PATCH", path, { body });
  },
  del(path) {
    return this.request("DELETE", path);
  },

  // Build a query string, skipping empty values.
  qs(params) {
    const sp = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") sp.append(k, v);
    });
    const s = sp.toString();
    return s ? "?" + s : "";
  },
};
