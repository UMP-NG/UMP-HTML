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
  try { data = text ? JSON.parse(text) : null; } catch(e){ data = text; }

  if (!res.ok) {
    const err = new Error(data?.message || res.statusText || "Request failed");
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export default {
  signup: (payload) => apiFetch("/signup", { method: "POST", body: JSON.stringify(payload) }),
  verifyOtp: (payload) => apiFetch("/verify-otp", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => apiFetch("/login", { method: "POST", body: JSON.stringify(payload) }),
  getMe: () => apiFetch("/me", { method: "GET" }),
  forgotPassword: (payload) => apiFetch("/forgot-password", { method: "POST", body: JSON.stringify(payload) }),
  resetPassword: (token, payload) => apiFetch(`/reset-password/${token}`, { method: "PUT", body: JSON.stringify(payload) }),
};
