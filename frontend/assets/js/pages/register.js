// Register page logic.

async function doRegister(btn) {
  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;
  const role = document.querySelector('input[name="role"]:checked').value;

  if (!fullName || !email || !password) {
    UI.toast("Please fill in your name, email and password.", "error");
    return;
  }
  if (password.length < 6) {
    UI.toast("Password should be at least 6 characters.", "error");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Creating…";
  try {
    const data = await Api.post("/auth/register", {
      fullName, email, password, phone: phone || undefined, role,
    });
    Auth.setSession(data.token, data.user);
    UI.toast("Account created. Welcome!", "success");
    setTimeout(() => {
      window.location.href = Auth.dashboardFor(data.user.role);
    }, 500);
  } catch (err) {
    UI.toast(err.message, "error");
    btn.disabled = false;
    btn.textContent = "Create account";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (Auth.isLoggedIn()) {
    window.location.href = Auth.dashboardFor(Auth.getUser().role);
    return;
  }
  const btn = document.getElementById("submit");
  btn.addEventListener("click", () => doRegister(btn));
});
