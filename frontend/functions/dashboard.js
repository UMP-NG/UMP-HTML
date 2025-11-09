// ===============================
// 🌐 API BASE CONFIGURATION (COOKIE-AUTH)
// ===============================
const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://ump-html-1.onrender.com/api";

let redirectingToLogin = false;

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

    if (res.status === 401) {
      if (!redirectingToLogin) {
        redirectingToLogin = true;
        sessionStorage.clear();
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

// ===============================
// 🌐 Dashboard / Profile Script
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  const nameEl = document.getElementById("profileName");
  const emailEl = document.getElementById("profileEmail");
  const statusEl = document.getElementById("profileStatus");
  const avatarEl = document.getElementById("profileAvatar");
  const logoutBtn = document.getElementById("logoutBtn");
  const signInBtn = document.getElementById("signInBtn");
  const settingsBtn = document.getElementById("openSettings");
  const modal = document.getElementById("settingsModal");
  const saveBtn = document.getElementById("saveSettings");
  const displayNameInput = document.getElementById("displayName");
  const profileImageInput = document.getElementById("profileImage");
  const imagePreview = document.getElementById("imagePreview");

  let isLoggedIn = false;
  let currentUserId = null;

  function updateButtons() {
    if (isLoggedIn) {
      if (signInBtn) signInBtn.textContent = "Switch Account";
      if (logoutBtn) logoutBtn.style.display = "inline-block";
    } else {
      if (signInBtn) signInBtn.textContent = "Sign In";
      if (logoutBtn) logoutBtn.style.display = "none";
    }
  }

  async function loadUserProfile() {
    try {
      const data = await apiFetch("/auth/me");
      console.log("🧠 /auth/me response:", data);
      const user = data.user || data;

      if (nameEl) nameEl.textContent = user.name || "User";
      if (emailEl) emailEl.textContent = user.email || "";
      if (statusEl) statusEl.textContent = "✔ Logged in";
      if (avatarEl) {
        avatarEl.src =
          user.avatar ||
          user.profileImage ||
          user.image ||
          user.avatarUrl ||
          "../images/guy.png";
      }

      currentUserId = user._id;
      isLoggedIn = true;
      updateButtons();

      // After user is loaded, show floating button
      createFloatingChatButton();
      await updateUnreadMessages();
    } catch (err) {
      console.warn("⚠️ Failed to load user profile:", err);
      if (nameEl) nameEl.textContent = "Guest User";
      if (emailEl) emailEl.textContent = "";
      if (statusEl) statusEl.textContent = "✖ Logged out";
      if (avatarEl) avatarEl.src = "default-avatar.png";

      isLoggedIn = false;
      updateButtons();
    }
  }

  await loadUserProfile();

  logoutBtn?.addEventListener("click", async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
      document.querySelector(".floating-chat-btn")?.remove();
      await loadUserProfile();
      alert("Logged out successfully!");
    } catch {
      alert("Logout failed. Try again.");
    }
  });

  settingsBtn?.addEventListener("click", () => {
    if (!isLoggedIn) return alert("You must be logged in to edit profile.");
    modal.style.display = "flex";
    if (displayNameInput) displayNameInput.value = nameEl.textContent;
    if (imagePreview && avatarEl) imagePreview.src = avatarEl.src;
  });

  saveBtn?.addEventListener("click", async () => {
    const newName = displayNameInput?.value.trim();
    const newImage = profileImageInput?.value.trim();
    if (!newName && !newImage) return alert("No changes made.");

    try {
      await apiFetch("/auth/update", {
        method: "PUT",
        body: JSON.stringify({ name: newName, avatar: newImage }),
      });

      if (newName && nameEl) nameEl.textContent = newName;
      if (newImage && avatarEl) avatarEl.src = newImage;
      alert("✅ Profile updated successfully!");
      modal.style.display = "none";
    } catch {
      alert("Failed to update profile. Try again later.");
    }
  });

  signInBtn?.addEventListener("click", () => {
    window.location.href = "../Pages/login.html";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  document.getElementById("closeSettings")?.addEventListener("click", () => {
    modal.style.display = "none";
  });

  profileImageInput?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (imagePreview) imagePreview.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // ===============================
  // 💬 Floating Chat Button
  // ===============================
  function createFloatingChatButton() {
    if (document.querySelector(".floating-chat-btn")) return;

    const btn = document.createElement("a");
    btn.href = "/Pages/messages.html";
    btn.className = "floating-chat-btn";
    btn.title = "Go to Messages";
    btn.innerHTML = `
      <i class="fa-solid fa-comments"></i>
      <span class="chat-badge" style="display:none;">0</span>
    `;
    document.body.appendChild(btn);

    const style = document.createElement("style");
    style.textContent = `
      .floating-chat-btn {
        position: fixed;
        bottom: 25px;
        right: 25px;
        width: 60px;
        height: 60px;
        background-color: #007bff;
        color: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
        text-decoration: none;
        z-index: 9999;
        transition: transform 0.2s ease, background-color 0.2s ease;
      }
      .floating-chat-btn:hover {
        background-color: #0056b3;
        transform: scale(1.1);
      }
      .chat-badge {
        position: absolute;
        top: 8px;
        right: 10px;
        background: #ff3b3b;
        color: white;
        font-size: 12px;
        font-weight: bold;
        padding: 3px 6px;
        border-radius: 10px;
      }
    `;
    document.head.appendChild(style);
  }

  // ===============================
  // 📬 Update Unread Messages Count
  // ===============================
  async function updateUnreadMessages() {
    if (!currentUserId) return;
    try {
      const data = await apiFetch(`/messages/unread/${currentUserId}`);
      const unreadCount = data?.count || 0;
      const badge = document.querySelector(".chat-badge");
      if (badge) {
        if (unreadCount > 0) {
          badge.textContent = unreadCount;
          badge.style.display = "block";
        } else {
          badge.style.display = "none";
        }
      }
    } catch (err) {
      console.warn("⚠️ Failed to fetch unread messages:", err);
    }
  }

  // Refresh unread count every 30s
  setInterval(updateUnreadMessages, 30000);
});
