import API from "./api.js";

const form = document.getElementById("reset");
const msg = document.getElementById("msg");

// Get token from query string: ?token=abc
const params = new URLSearchParams(window.location.search);
const token = params.get("token");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!token) {
    msg.textContent = "❌ No reset token found in URL.";
    return;
  }

  msg.textContent = "🔄 Resetting...";
  try {
    await API.resetPassword(token, {
      password: document.getElementById("pass").value,
    });
    msg.textContent = "✅ Password reset successful. Redirecting...";
    setTimeout(() => (window.location.href = "./Pages/login.html"), 1200);
  } catch (err) {
    msg.textContent = "❌ " + (err.body?.message || err.message);
  }
});
