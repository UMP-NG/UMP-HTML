// ===============================
// 🌐 API BASE CONFIGURATION (COOKIE-AUTH)
// ===============================
const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ump-html-1.onrender.com"; // backend API base for production

let redirectingToLogin = false; // global guard

// -------------------------------
// Cookie helpers
// -------------------------------
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
// API fetch helper (no auto-redirect)
// -------------------------------
async function apiFetch(path, options = {}) {
  const headers = options.headers || {};
  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const res = await fetch(API_BASE + path, {
      ...options,
      headers,
      credentials: "include", // ✅ include cookies automatically
    });

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    // Handle 401 without redirect
    if (res.status === 401) {
      console.warn(`[apiFetch] 401 Unauthorized for ${path}`);
      return null; // user not logged in
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
  try {
    const data = await apiFetch("/auth/me");
    return data?.user || data || null;
  } catch (err) {
    console.warn("⚠️ Failed to load user profile:", err);
    return null;
  }
}
