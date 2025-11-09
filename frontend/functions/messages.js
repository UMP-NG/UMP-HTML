// ----- CONFIG -----
const isLocal = window.location.hostname === "localhost";

const API_BASE = isLocal
  ? "http://localhost:5000/api/messages"
  : "https://ump-html-1.onrender.com/api/messages";

const SOCKET_URL = isLocal
  ? "http://localhost:5000"
  : "https://ump-html-1.onrender.com";

let currentUser = null;
let currentChatUser = null;
let socket = null;
let page = 1;
let loadingOlder = false;

// ----- FETCH HELPERS -----
async function apiGet(url) {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Error: ${res.status}`);
  return res.json();
}

async function apiPostForm(url, formData) {
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) throw new Error(`Error: ${res.status}`);
  return res.json();
}

async function apiPostJSON(url, data) {
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Error: ${res.status}`);
  return res.json();
}

// ----- INITIAL LOAD -----
document.addEventListener("DOMContentLoaded", async () => {
  await loadAdmins();
  await loadConversations();
  await initSocket();
  document.getElementById("message-form").classList.add("hidden");
});

async function loadAdmins() {
  try {
    const res = await fetch(`${API_BASE.replace("/messages", "")}/admins`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch admins");
    adminUsers = await res.json();
    console.log("👑 Loaded admins:", adminUsers);
  } catch (err) {
    console.error("⚠️ Could not load admins:", err);
  }
}

// ----- SOCKET.IO REALTIME -----
async function initSocket() {
  socket = io(SOCKET_URL, { withCredentials: true });

  socket.on("connect", async () => {
    console.log("✅ Connected to Socket.io server");

    try {
      const userRes = await apiGet(
        `${API_BASE.replace("/messages", "")}/auth/me`
      );
      currentUser = userRes.user;
      socket.emit("register", currentUser._id);
      console.log("Registered socket for user:", currentUser._id);
    } catch (err) {
      console.error("Error registering socket:", err);
    }
  });

  socket.on("new_message", (msg) => {
    console.log("📩 New message received:", msg);

    // If this belongs to the open chat
    if (
      currentChatUser &&
      (msg.sender._id === currentChatUser.conversationWith ||
        msg.receiver._id === currentChatUser.conversationWith)
    ) {
      appendMessage(msg);
    } else {
      console.log("🔔 Message from another chat");
    }
  });
}

// ----- LOAD CONVERSATIONS -----
async function loadConversations() {
  const list = document.getElementById("conversations-list");
  list.innerHTML = "<li>Loading...</li>";

  try {
    const conversations = await apiGet(`${API_BASE}/conversations`);
    list.innerHTML = "";

    // 🟢 Pinned Admins (from loadAdmins)
    if (window.adminUsers && adminUsers.length > 0) {
      adminUsers.forEach((admin) => {
        const adminItem = document.createElement("li");
        adminItem.innerHTML = `
          <img src="${
            admin.avatar || "../images/admin-default.png"
          }" alt="Admin" />
          <div>
            <strong>${admin.name}</strong><br />
            <small>Support</small>
          </div>`;
        adminItem.onclick = () =>
          openChat({
            conversationWith: admin._id,
            name: admin.name,
            avatar: admin.avatar || "../images/admin-default.png",
          });
        list.appendChild(adminItem);
      });
    }

    // 🟠 Regular Conversations (User, Seller, Walker, Service Provider)
    conversations.forEach((conv) => {
      const user =
        conv.user || conv.seller || conv.walker || conv.service || conv;
      const name =
        user.name ||
        user.displayName ||
        user.fullName ||
        user.businessName ||
        user.storeName ||
        "Unknown User";

      const avatar =
        user.avatar ||
        user.profileImage ||
        user.image ||
        user.logo ||
        "../images/guy.png";

      const item = document.createElement("li");
      item.innerHTML = `
        <img src="${avatar}" />
        <div>
          <strong>${name}</strong><br/>
          <small>${conv.latestMessage || "No messages yet"}</small>
        </div>`;

      item.onclick = () =>
        openChat({
          conversationWith: user._id,
          name,
          avatar,
        });

      list.appendChild(item);
    });
  } catch (err) {
    console.error("❌ Failed to load conversations:", err);
    list.innerHTML = "<li>Failed to load conversations</li>";
  }
}

// ----- OPEN CHAT -----
async function openChat(user) {
  currentChatUser = user;

  const username = document.getElementById("chat-username");
  const avatar = document.getElementById("chat-avatar");
  const status = document.getElementById("chat-status");
  const msgContainer = document.getElementById("chat-messages");
  const msgForm = document.getElementById("message-form");

  // Update header
  username.textContent = user.name;
  avatar.src = user.avatar || "../images/guy.png";
  status.textContent = "Online";

  // Remove fallback & show message form
  msgContainer.classList.remove("chat-fallback");
  msgContainer.innerHTML = "Loading messages...";
  msgForm.classList.remove("hidden");

  // Hide sidebar on mobile
  document.querySelector(".sidebar").classList.remove("active");

  try {
    page = 1;
    const messages = await apiGet(
      `${API_BASE}/user?conversationWith=${user.conversationWith}&page=${page}`
    );
    renderMessages(messages);
  } catch (err) {
    console.error(err);
    msgContainer.textContent = "Failed to load messages";
  }
}

// ----- RENDER MESSAGES -----
function renderMessages(messages) {
  const container = document.getElementById("chat-messages");
  container.innerHTML = "";

  messages.reverse().forEach((msg) => appendMessage(msg));
  container.scrollTop = container.scrollHeight;
}

function prependMessages(messages) {
  const container = document.getElementById("chat-messages");
  const oldScroll = container.scrollHeight;

  messages.reverse().forEach((msg) => {
    const isSent = msg.sender._id !== currentChatUser.conversationWith;
    const div = document.createElement("div");
    div.className = `message ${isSent ? "sent" : "received"}`;
    div.innerHTML = `<div class="bubble">${msg.text}</div>`;
    container.prepend(div);
  });

  // Keep scroll position stable
  container.scrollTop = container.scrollHeight - oldScroll;
}

function appendMessage(msg) {
  const container = document.getElementById("chat-messages");
  const isSent = msg.sender._id !== currentChatUser.conversationWith;
  const div = document.createElement("div");
  div.className = `message ${isSent ? "sent" : "received"}`;

  // handle attachments
  if (msg.attachments && msg.attachments.length > 0) {
    const filesHTML = msg.attachments
      .map((file) => {
        if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
          return `<img src="${file}" alt="attachment" class="chat-image" />`;
        } else {
          return `<a href="${file}" target="_blank">${file
            .split("/")
            .pop()}</a>`;
        }
      })
      .join("<br>");
    div.innerHTML = `<div class="bubble">${
      msg.text || ""
    }<br>${filesHTML}</div>`;
  } else {
    div.innerHTML = `<div class="bubble">${msg.text}</div>`;
  }

  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

// ----- SEND MESSAGE (text + attachments) -----
document
  .getElementById("message-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("message-input");
    const fileInput = document.getElementById("file-upload");
    const text = input.value.trim();

    if (
      (!text && fileInput.files.length === 0) ||
      !currentChatUser ||
      !currentUser
    )
      return;

    const formData = new FormData();
    formData.append("receiver", currentChatUser.conversationWith);
    formData.append("text", text);
    for (let file of fileInput.files) {
      formData.append("attachments", file);
    }

    try {
      // Emit real-time
      socket.emit("send_message", {
        sender: currentUser._id,
        receiver: currentChatUser.conversationWith,
        text,
        attachments: [],
      });

      // Persist with file upload
      const response = await apiPostForm(`${API_BASE}/send`, formData);

      input.value = "";
      fileInput.value = "";
      appendMessage({
        sender: { _id: currentUser._id },
        text,
        attachments: response.attachments || [],
      });
    } catch (err) {
      console.error(err);
      alert("Failed to send message");
    }
  });

// ----- SIDEBAR TOGGLE -----
document.addEventListener("click", (e) => {
  const header = e.target.closest(".chat-header");
  const sidebar = document.querySelector(".sidebar");

  if (!sidebar) return; // safety check

  if (header) {
    // 🟢 Toggle sidebar when clicking the chat header
    sidebar.classList.toggle("active");
  } else if (
    sidebar.classList.contains("active") &&
    !e.target.closest(".sidebar")
  ) {
    // 🔴 Clicked outside sidebar → close it
    sidebar.classList.remove("active");
  }
});

// ----- PAGINATION (Infinite Scroll) -----
const messagesContainer = document.getElementById("chat-messages");

messagesContainer.addEventListener("scroll", async () => {
  if (messagesContainer.scrollTop === 0 && !loadingOlder && currentChatUser) {
    loadingOlder = true;
    page++;
    try {
      const olderMessages = await apiGet(
        `${API_BASE}/user?conversationWith=${currentChatUser.conversationWith}&page=${page}`
      );
      prependMessages(olderMessages);
    } catch (err) {
      console.error("Failed to load older messages:", err);
    } finally {
      loadingOlder = false;
    }
  }
});
