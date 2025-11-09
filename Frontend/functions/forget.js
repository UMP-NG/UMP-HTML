import API from "./api.js";

const form = document.getElementById("forgot");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "Requesting...";
  try {
    const res = await API.forgotPassword({
      email: form.email.value.trim(),
    });
    msg.textContent = "✅ Reset link generated. Check your email.";
    console.log("DEV resetUrl:", res.resetUrl);
  } catch (err) {
    msg.textContent = "❌ " + (err.body?.message || err.message);
  }
});
