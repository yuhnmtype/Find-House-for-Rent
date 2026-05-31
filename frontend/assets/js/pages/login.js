// Login page logic.

function nextTarget() {
  return new URLSearchParams(window.location.search).get("next");
}

async function doLogin(btn) {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  if (!email || !password) {
    UI.toast("Please enter your email and password.", "error");
    return;
  }
  btn.disabled = true;
  btn.textContent = "Logging in…";
  try {
    const data = await Api.post("/auth/login", { email, password });
    Auth.setSession(data.token, data.user);
    UI.toast("Welcome back, " + data.user.fullName + "!", "success");
    const next = nextTarget();
    setTimeout(() => {
      window.location.href = next ? next : Auth.dashboardFor(data.user.role);
    }, 500);
  } catch (err) {
    UI.toast(err.message, "error");
    btn.disabled = false;
    btn.textContent = "Log in";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (Auth.isLoggedIn()) {
    window.location.href = Auth.dashboardFor(Auth.getUser().role);
    return;
  }
  const btn = document.getElementById("submit");
  btn.addEventListener("click", () => doLogin(btn));
  ["email", "password"].forEach((id) =>
    document.getElementById(id).addEventListener("keydown", (e) => {
      if (e.key === "Enter") doLogin(btn);
    })
  );
});
