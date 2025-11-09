// ===============================
// 🌐 LOGIN / SIGNUP PAGE SCRIPT
// ===============================
const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ump-html-1.onrender.com";

// -------------------------------
// API fetch helper (login page: ignore 401)
// -------------------------------
async function apiFetchLogin(path, options = {}) {
  const headers = options.headers || {};
  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const res = await fetch(API_BASE + path, {
      ...options,
      headers,
      credentials: "include",
    });

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      // On login page, 401 just means not logged in → return null
      if (res.status === 401) return null;
      const err = new Error(
        data?.message || res.statusText || "Request failed"
      );
      err.status = res.status;
      err.body = data;
      throw err;
    }

    return data;
  } catch (err) {
    console.error("❌ API Fetch Error:", err);
    throw err;
  }
}

// -------------------------------
// Auto-redirect if already logged in
// -------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const data = await apiFetchLogin("/auth/me");
    if (data && (data.user || data.name)) {
      console.log("Already logged in → redirecting to dashboard");
      window.location.href = "../index.html";
    }
  } catch {
    console.log("Not logged in. Stay on login page.");
  }
});

// -------------------------------
// Toggle SignUp / SignIn Views
// -------------------------------
function toggleAuthView(showSignUp) {
  const container = document.getElementById("container");
  if (!container) return;
  container.classList.toggle("show-sign-up", showSignUp);
}

document
  .getElementById("switchtosignup")
  ?.addEventListener("click", () => toggleAuthView(true));
document
  .getElementById("switchtosignin")
  ?.addEventListener("click", () => toggleAuthView(false));
document
  .getElementById("mobileSwitchToSignUp")
  ?.addEventListener("click", () => toggleAuthView(true));
document
  .getElementById("mobileSwitchToSignIn")
  ?.addEventListener("click", () => toggleAuthView(false));

// -------------------------------
// Signup Handler
// -------------------------------
const signupForm = document.getElementById("signupForm");
const signupMsg = document.getElementById("msg");

signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  signupMsg.textContent = "Sending...";

  const email = signupForm.email?.value.trim();
  const password = signupForm.password?.value;
  const username = signupForm.username?.value?.trim() || "User";

  if (!email || !password || !username) {
    signupMsg.textContent = "Please fill all fields.";
    return;
  }

  try {
    const res = await apiFetchLogin("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name: username, email, password }),
    });

    signupMsg.textContent = "OTP sent. Redirecting to verify...";
    console.log("DEV OTP:", res.otp);

    document.cookie = `pendingEmail=${encodeURIComponent(
      email
    )}; path=/; max-age=${60 * 60 * 24}`;

    setTimeout(() => (window.location.href = "./auth.html"), 800);
  } catch (err) {
    signupMsg.textContent = err.body?.message || err.message || "Signup failed";
  }
});

// -------------------------------
// Login Handler
// -------------------------------
const loginForm = document.getElementById("loginForm");
const loginMsg = document.getElementById("msg-login");

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginMsg.textContent = "Logging in...";

  const email = document.getElementById("signin-username")?.value.trim();
  const password = document.getElementById("signin-password")?.value;

  if (!email || !password) {
    loginMsg.textContent = "Please enter email and password.";
    return;
  }

  try {
    await apiFetchLogin("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    loginMsg.textContent = "Logged in. Redirecting...";
    setTimeout(() => (window.location.href = "../index.html"), 600);
  } catch (err) {
    loginMsg.textContent = err.body?.message || err.message || "Login failed";
  }
});
