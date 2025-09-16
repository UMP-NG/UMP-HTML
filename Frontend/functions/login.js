import API from "../functions/api.js";

function toggleAuthView(showSignUp) {
  const container = document.getElementById("container");

  if (showSignUp) {
    container.classList.add("show-sign-up");
  } else {
    container.classList.remove("show-sign-up");
  }
}

// Attach events to your buttons
document
  .getElementById("switchtosignup")
  .addEventListener("click", () => toggleAuthView(true));
document
  .getElementById("switchtosignin")
  .addEventListener("click", () => toggleAuthView(false));

// Mobile toggle links
document
  .getElementById("mobileSwitchToSignUp")
  .addEventListener("click", () => toggleAuthView(true));
document
  .getElementById("mobileSwitchToSignIn")
  .addEventListener("click", () => toggleAuthView(false));

const form = document.getElementById("signupForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "Sending...";
  const email = form.email.value.trim();
  const password = form.password.value;

  try {
    const res = await API.signup({ email, password });
    // backend returns otp in dev; in prod you would not show it
    msg.textContent = "OTP sent. Redirecting to verify...";
    // store email so verify page can prefill
    localStorage.setItem("pendingEmail", email);
    // optional: store OTP in dev for testing
    console.log("DEV OTP:", res.otp);
    setTimeout(() => (window.location.href = "../Pages/auth.html"), 800);
  } catch (err) {
    msg.textContent = err.body?.message || err.message;
  }
});

const form2 = document.getElementById("loginForm");
const msg2 = document.getElementById("msg-login");

form2.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg2.textContent = "Logging in...";

  try {
    const res = await API.login({
      // 👇 Use the actual input names/IDs
      email: document.getElementById("signin-username").value.trim(),
      password: document.getElementById("signin-password").value,
    });

    localStorage.setItem("token", res.token);
    msg2.textContent = "Logged in. Redirecting...";
    setTimeout(() => (window.location.href = "../Pages/index.html"), 600);
  } catch (err) {
    msg2.textContent = err.body?.message || err.message;
  }
});
