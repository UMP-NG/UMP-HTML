// js/api.js
const API_BASE = "https://ump-html-1.onrender.com/api/auth";

async function apiFetch(path, options = {}) {
  const headers = options.headers || {};
  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const token = localStorage.getItem("token");
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(API_BASE + path, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }

  if (!res.ok) {
    const err = new Error(data?.message || res.statusText || "Request failed");
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

const signInBtn = document.getElementById("signInBtn");
const signUpBtn = document.getElementById("signUpBtn");
const logoutBtn = document.getElementById("logoutBtn");

// ✅ Check login state on page load
function updateButtons() {
  const token = sessionStorage.getItem("token");

  if (token) {
    // Logged in
    signInBtn.textContent = "Switch Account";
    signUpBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  } else {
    // Not logged in
    signInBtn.textContent = "Sign In";
    signUpBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
}

// ✅ Redirect to login or switch account
signInBtn.addEventListener("click", () => {
  const token = sessionStorage.getItem("token");
  if (token) {
    // Clear session and go to login page
    sessionStorage.removeItem("token");
    alert("Switching account...");
  }
  window.location.href = "../Pages/login.html"; // Change to your login page path
});

// ✅ Redirect to signup page
signUpBtn.addEventListener("click", () => {
  window.location.href = "../Pages/login.html"; // Change to your signup page path
});

// ✅ Handle logout
logoutBtn.addEventListener("click", async () => {
  const token = sessionStorage.getItem("token");

  if (!token) {
    alert("You are not logged in!");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (res.ok) {
      alert("You have been logged out.");
      sessionStorage.removeItem("token");
      updateButtons();
    } else {
      alert(data.message || "Logout failed");
    }
  } catch (err) {
    console.error(err);
    alert("Network error, try again.");
  }
});

// ✅ Initialize on page load
updateButtons();

export default {
  signup: (payload) =>
    apiFetch("/signup", { method: "POST", body: JSON.stringify(payload) }),
  verifyOtp: (payload) =>
    apiFetch("/verify-otp", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) =>
    apiFetch("/login", { method: "POST", body: JSON.stringify(payload) }),
  getMe: () => apiFetch("/me", { method: "GET" }),
  forgotPassword: (payload) =>
    apiFetch("/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  resetPassword: (token, payload) =>
    apiFetch(`/reset-password/${token}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
};
