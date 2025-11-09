// ===============================
// 🌐 API BASE CONFIGURATION (COOKIE-AUTH)
// ===============================
const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ump-ng.github.io/UMP-HTML/Frontend/Pages/";

let redirectingToLogin = false; // global guard

function cookieSet(name, value, days = 1) {
  const expires = new Date(
    Date.now() + days * 24 * 60 * 60 * 1000
  ).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/`;
}

function cookieGet(name) {
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function cookieRemove(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// -------------------------------
// API fetch helper
// -------------------------------
async function apiFetch(path, options = {}) {
  if (redirectingToLogin) return;

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

    // Handle 401 Unauthorized
    if (res.status === 401) {
      if (!redirectingToLogin) {
        redirectingToLogin = true;
        sessionStorage.clear(); // optional: clear session
        window.location.replace("../Pages/login.html");
      }
      return;
    }

    if (!res.ok) {
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
// Load current user profile (optional)
// -------------------------------
async function loadUserProfile() {
  if (redirectingToLogin) return null;
  try {
    const data = await apiFetch("/auth/me");
    return data.user || data;
  } catch {
    return null;
  }
}
