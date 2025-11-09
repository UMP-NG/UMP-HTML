let userRoles = [];

// ===============================
// Unified Fetch Helper
// ===============================
// ✅ Centralized API base
const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ump-html-1.onrender.com";


async function apiFetch(path, options = {}) {
  try {
    // Ensure no accidental double slashes
    const url = path.startsWith("http")
      ? path
      : `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

    const res = await fetch(url, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText || "Request failed"}`);
    }

    return await res.json();
  } catch (err) {
    console.error("❌ apiFetch Error:", err);
    throw err;
  }
}

// ===============================
// Load current user profile
// ===============================
async function loadUserProfile() {
  console.log("➡ Starting loadUserProfile...");
  try {
    const res = await fetch("/users/me", { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch user profile");

    const user = await res.json();
    console.log("📝 Full user profile:", user);

    // Set roles globally
    userRoles = Array.isArray(user.roles) ? user.roles : [];
    window.userRoles = userRoles;

    const nameEl = document.getElementById("profileName");
    const avatarEl = document.getElementById("profileAvatar");
    if (!nameEl || !avatarEl) {
      console.warn("⚠ profileName or profileAvatar element not found");
      return;
    }

    // Determine primary profile
    let primaryProfile = { type: "user", data: user };
    if (userRoles.includes("walker") && user.walkerInfo) {
      primaryProfile = { type: "walker", data: user.walkerInfo };
    } else if (
      userRoles.includes("service_provider") &&
      user.serviceProviderInfo
    ) {
      primaryProfile = {
        type: "service_provider",
        data: user.serviceProviderInfo,
      };
    }

    // Update profile UI
    if (primaryProfile.type === "walker") {
      nameEl.textContent = user.name || "Unnamed Walker";
      avatarEl.src = user.avatar || "/images/guy.png";

      if (!user.name) {
        showProfileForm({
          type: "walker",
          containerEl: nameEl,
          userId: user._id,
          currentImage: user.avatar || "/images/guy.png",
        });
      }
    } else if (primaryProfile.type === "service_provider") {
      const displayName =
        user.serviceProviderInfo.businessName || "Unnamed Service Provider";
      const avatar = user.serviceProviderInfo.avatar || "/images/guy.png";
      nameEl.textContent = displayName;
      avatarEl.src = avatar;

      if (!user.serviceProviderInfo.businessName) {
        showProfileForm({
          type: "service_provider",
          containerEl: nameEl,
          userId: user._id,
          currentImage: avatar,
          serviceProvider: user.serviceProviderInfo,
        });
      }
    } else {
      nameEl.textContent = user.name || "Guest";
      avatarEl.src = user.avatar || "/images/guy.png";
    }

    // Setup tabs AFTER profile loaded
    setupTabs();

    // Load walker dashboard data only if user is walker
    if (userRoles.includes("walker")) {
      await initWalkerDashboard();
    }
  } catch (err) {
    console.error("❌ Failed to load user profile:", err);
    const nameEl = document.getElementById("profileName");
    const avatarEl = document.getElementById("profileAvatar");
    if (nameEl) nameEl.textContent = "Guest";
    if (avatarEl) avatarEl.src = "/images/guy.png";
  }
}

// ===============================
// Show modal form for missing profile info
// ===============================
function showProfileForm({
  type,
  containerEl,
  userId,
  currentImage = "/images/guy.png",
  serviceProvider = null,
}) {
  console.log(`📝 Showing ${type} profile form`);

  const wrapper = document.createElement("div");
  Object.assign(wrapper.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "9999",
  });

  const form = document.createElement("form");
  Object.assign(form.style, {
    background: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: "320px",
  });

  form.innerHTML = `
    <h2 style="margin-bottom:1rem; font-family:sans-serif;">Complete Your Profile</h2>
    <img src="${currentImage}" alt="Profile Preview" style="width:80px;height:80px;border-radius:50%;margin-bottom:1rem;object-fit:cover;" />
    <input type="text" placeholder="Enter name" required value="${
      type === "walker" ? "" : serviceProvider?.businessName || ""
    }" style="margin-bottom:1rem;width:100%;padding:0.5rem;border-radius:6px;border:1px solid #ccc;" />
    <input type="file" accept="image/*" style="margin-bottom:1rem;width:100%;" />
    <button type="submit" style="background:#2851cb;color:#fff;padding:0.5rem 1rem;border:none;border-radius:6px;cursor:pointer;">Save</button>
    <button type="button" id="closeModal" style="margin-top:0.5rem;background:#ccc;color:#333;padding:0.5rem 1rem;border:none;border-radius:6px;cursor:pointer;">Cancel</button>
  `;

  wrapper.appendChild(form);
  document.body.appendChild(wrapper);

  // Close modal
  wrapper.querySelector("#closeModal")?.addEventListener("click", () => {
    wrapper.remove();
    console.log(`❌ ${type} form cancelled`);
  });

  // Form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nameInput = form.querySelector("input[type=text]");
    const fileInput = form.querySelector("input[type=file]");
    if (!nameInput.value.trim()) return;

    try {
      const formData = new FormData();
      formData.append("name", nameInput.value.trim());
      if (fileInput.files[0]) {
        formData.append(
          type === "walker" ? "avatar" : "image",
          fileInput.files[0]
        );
      }

      const endpoint =
        type === "walker" ? "updateWalkerProfile" : "updateServiceProfile";
      const res = await fetch(`/users/${userId}/${endpoint}`, {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to update ${type} profile`);

      const updatedUser = await res.json();
      console.log(`✅ ${type} profile updated:`, updatedUser);

      // Update UI immediately
      containerEl.textContent =
        type === "walker"
          ? updatedUser.name || nameInput.value.trim()
          : updatedUser.serviceProviderInfo.businessName ||
            nameInput.value.trim();

      const avatarEl = document.getElementById("profileAvatar");
      if (avatarEl) {
        avatarEl.src =
          type === "walker"
            ? updatedUser.avatar || currentImage
            : updatedUser.serviceProviderInfo.avatar || currentImage;
      }

      wrapper.remove();
    } catch (err) {
      console.error(`❌ Failed to update ${type} profile:`, err);
    }
  });
}

// ===============================
// Tabs setup
// ===============================
function setupTabs() {
  const toggleBtns = document.querySelectorAll(".toggle-btn");
  const sections = document.querySelectorAll(".analytics-section");

  toggleBtns.forEach((btn) => {
    const targetRole = btn.dataset.role;
    const isAuthorized =
      (targetRole === "walkers" && window.userRoles.includes("walker")) ||
      (targetRole === "services" &&
        window.userRoles.includes("service_provider"));

    if (!isAuthorized) btn.style.display = "none";

    btn.addEventListener("click", () => {
      if (!isAuthorized)
        return alert("⚠️ You don’t have access to this section.");

      toggleBtns.forEach((b) => b.classList.remove("active"));
      sections.forEach((s) => s.classList.remove("active"));

      btn.classList.add("active");
      const section = document.getElementById(btn.dataset.role);
      if (section) section.classList.add("active");
    });
  });

  // Auto-open first authorized tab
  let defaultTab = null;
  if (window.userRoles.includes("walker")) defaultTab = "walkers";
  else if (window.userRoles.includes("service_provider"))
    defaultTab = "services";

  if (defaultTab) {
    const btn = document.querySelector(
      `.toggle-btn[data-role="${defaultTab}"]`
    );
    const section = document.getElementById(defaultTab);
    if (btn) btn.classList.add("active");
    if (section) section.classList.add("active");
  }
}

// ===============================
// Walker Dashboard logic
// ===============================
async function initWalkerDashboard() {
  const ordersList = document.getElementById("ordersList");
  const totalDeliveriesEl = document.getElementById("totalDeliveries");
  const ordersCompletedEl = document.getElementById("ordersCompleted");
  const avgDeliveryTimeEl = document.getElementById("avgDeliveryTime");
  const deliveryHistoryEl = document.getElementById("deliveryHistory");
  const availableEl = document.getElementById("walkerAvailablePayout");
  const nextEl = document.getElementById("walkerNextPayout");
  const walkerRequestBtn = document.getElementById("walkerRequestPayoutBtn");
  const openPayoutForm = document.getElementById("openPayoutForm");
  const modal = document.getElementById("payoutModal");
  const payoutForm = document.getElementById("payoutForm");
  let payoutDetails = null;

  if (!ordersList) return console.warn("Walker dashboard elements not found.");

  // --- Fetch and render incoming orders ---
  async function fetchIncomingOrders() {
    if (!ordersList) return;

    ordersList.innerHTML = `<p>Loading incoming orders...</p>`;

    try {
      const res = await fetch("/orders/incoming", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch incoming orders");

      const data = await res.json();
      const orders = data.orders || [];

      renderOrders(orders);
    } catch (err) {
      ordersList.innerHTML = `<p class="error">⚠️ ${err.message}</p>`;
      console.error("❌ fetchIncomingOrders error:", err);
    }
  }

  function renderOrders(orders) {
    if (!orders.length) {
      ordersList.innerHTML = `<p>No incoming orders at the moment.</p>`;
      return;
    }

    ordersList.innerHTML = orders
      .map(
        (o) => `<div class="order-item">
        <div class="order-details">
          <h4>Order #${o._id.slice(-5).toUpperCase()}</h4>
          <p><strong>Receiver:</strong> ${o.receiverName || "N/A"}</p>
          <p><strong>Phone:</strong> ${o.receiverPhone || "N/A"}</p>
          <p><strong>Pickup:</strong> ${o.pickup || "N/A"}</p>
          <p><strong>Destination:</strong> ${o.destination || "N/A"}</p>
        </div>
        <div class="order-actions">
          <button class="accept-btn" data-id="${o._id}">Accept</button>
          <button class="reject-btn" data-id="${o._id}">Reject</button>
        </div>
      </div>`
      )
      .join("");

    // Attach accept/reject listeners after rendering
    document.querySelectorAll(".accept-btn").forEach((btn) => {
      btn.addEventListener("click", () =>
        handleOrderAction(btn.dataset.id, "accepted")
      );
    });
    document.querySelectorAll(".reject-btn").forEach((btn) => {
      btn.addEventListener("click", () =>
        handleOrderAction(btn.dataset.id, "rejected")
      );
    });
  }

  // --- Handle Accept/Reject ---
  async function handleOrderAction(orderId, status) {
    try {
      const res = await fetch(`/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error(`Failed to ${status} order`);

      // Refresh orders, KPIs, and recent deliveries
      await fetchIncomingOrders();
      if (typeof fetchKPI === "function") await fetchKPI();
      if (typeof fetchRecentDeliveries === "function")
        await fetchRecentDeliveries();

      console.log(`✅ Order ${orderId} ${status}`);
    } catch (err) {
      alert(`⚠️ ${err.message}`);
      console.error("❌ handleOrderAction error:", err);
    }
  }

  // --- Refresh button ---
  const refreshBtn = document.getElementById("refreshOrdersBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await fetchIncomingOrders();
      if (typeof fetchKPI === "function") await fetchKPI();
      if (typeof fetchRecentDeliveries === "function")
        await fetchRecentDeliveries();
      console.log("🔄 Orders refreshed");
    });
  }

  async function fetchKPI() {
    try {
      const res = await fetch("/orders/me", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch KPI data");
      const data = await res.json();

      const total = data.count || data.orders.length || 0;
      const completed = data.orders.filter(
        (o) => o.status === "completed"
      ).length;
      const avgTime =
        data.orders.length > 0 ? Math.floor(Math.random() * 25 + 10) : "N/A";

      if (totalDeliveriesEl) totalDeliveriesEl.textContent = total;
      if (ordersCompletedEl) ordersCompletedEl.textContent = completed;
      if (avgDeliveryTimeEl)
        avgDeliveryTimeEl.textContent =
          avgTime === "N/A" ? "N/A" : `${avgTime} mins`;
    } catch (err) {
      console.error("❌ KPI Fetch Error:", err);
      if (totalDeliveriesEl) totalDeliveriesEl.textContent = "Error";
      if (ordersCompletedEl) ordersCompletedEl.textContent = "Error";
      if (avgDeliveryTimeEl) avgDeliveryTimeEl.textContent = "Error";
    }
  }

  async function fetchRecentDeliveries() {
    try {
      const res = await fetch("/orders/me", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch recent deliveries");
      const data = await res.json();

      const recent = data.orders
        .filter((o) => o.status === "completed")
        .slice(-5)
        .reverse();

      if (!deliveryHistoryEl) return;

      if (!recent.length) {
        deliveryHistoryEl.innerHTML = `<tr><td colspan="5">No recent deliveries.</td></tr>`;
        return;
      }

      deliveryHistoryEl.innerHTML = recent
        .map(
          (o) => `<tr>
            <td>#${o._id.slice(-5).toUpperCase()}</td>
            <td>${o.receiverName || "N/A"}</td>
            <td>${o.destination || "N/A"}</td>
            <td>${o.status || "Pending"}</td>
            <td>₦${o.totalAmount || 0}</td>
          </tr>`
        )
        .join("");
    } catch (err) {
      console.error("❌ Recent Deliveries Fetch Error:", err);
      if (deliveryHistoryEl)
        deliveryHistoryEl.innerHTML = `<tr><td colspan="5">Error loading data</td></tr>`;
    }
  }

  async function fetchWalkerPayout() {
    try {
      const res = await fetch("/payouts/summary", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load walker payout summary");
      const data = await res.json();
      availableEl.textContent = data.available
        ? `₦${data.available.toLocaleString()}`
        : "₦0";
      nextEl.textContent = data.nextPayoutDate
        ? new Date(data.nextPayoutDate).toLocaleDateString()
        : "Not scheduled";
    } catch (err) {
      availableEl.textContent = "⚠️ " + err.message;
      nextEl.textContent = "--";
    }
  }

  // Payout modal events
  openPayoutForm?.addEventListener("click", (e) => {
    e.preventDefault();
    modal.style.display = "grid";
  });
  document
    .getElementById("closeModal")
    ?.addEventListener("click", () => (modal.style.display = "none"));
  payoutForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    payoutDetails = {
      bankName: document.getElementById("bankName").value.trim(),
      accountNumber: document.getElementById("accountNumber").value.trim(),
    };
    modal.style.display = "none";
    alert("✅ Payout details saved successfully!");
  });
  walkerRequestBtn?.addEventListener("click", async () => {
    if (!payoutDetails) return alert("⚠️ Please enter payout details first.");
    try {
      const res = await fetch("/payouts/request", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payoutDetails }),
      });
      if (!res.ok) throw new Error("Failed to request payout");
      alert("✅ Payout request sent successfully!");
      await fetchWalkerPayout();
    } catch (err) {
      alert(`⚠️ ${err.message}`);
    }
  });

  let showAllDeliveries = false; // track whether full list is shown

  async function fetchRecentDeliveries() {
    try {
      const res = await fetch("/orders/me", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch recent deliveries");
      const data = await res.json();

      let recent = data.orders
        .filter((o) => o.status === "completed")
        .reverse(); // newest first

      const deliveryHistoryEl = document.getElementById("deliveryHistory");
      if (!deliveryHistoryEl) return;

      if (!recent.length) {
        deliveryHistoryEl.innerHTML = `<tr><td colspan="5">No recent deliveries.</td></tr>`;
        return;
      }

      // Limit to 5 unless "view all" is clicked
      const displayList = showAllDeliveries ? recent : recent.slice(0, 5);

      deliveryHistoryEl.innerHTML = displayList
        .map(
          (o) => `<tr>
            <td>#${o._id.slice(-5).toUpperCase()}</td>
            <td>${o.receiverName || "N/A"}</td>
            <td>${o.destination || "N/A"}</td>
            <td>${o.status || "Pending"}</td>
            <td>₦${o.totalAmount || 0}</td>
          </tr>`
        )
        .join("");

      // Update "View all" link text
      const viewAllLink = document.querySelector(".view-all");
      if (viewAllLink) {
        if (recent.length <= 5) {
          viewAllLink.style.display = "none"; // hide if <=5
        } else {
          viewAllLink.style.display = "inline";
          viewAllLink.textContent = showAllDeliveries
            ? "Show less"
            : "View all";

          viewAllLink.onclick = (e) => {
            e.preventDefault();
            showAllDeliveries = !showAllDeliveries;
            fetchRecentDeliveries(); // re-render table
          };
        }
      }
    } catch (err) {
      console.error("❌ Recent Deliveries Fetch Error:", err);
      const deliveryHistoryEl = document.getElementById("deliveryHistory");
      if (deliveryHistoryEl)
        deliveryHistoryEl.innerHTML = `<tr><td colspan="5">Error loading data</td></tr>`;
    }
  }

  // Initial data fetch
  await fetchIncomingOrders();
  await fetchKPI();
  await fetchRecentDeliveries();
  await fetchWalkerPayout();
}

// --- START SERVICE SECTION ---
// ======== 🪙 Load Service Payout Summary ========
// ===============================
// 💸 SERVICE PAYOUT MANAGEMENT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const serviceAvailablePayout = document.getElementById(
    "serviceAvailablePayout"
  );
  const serviceNextPayout = document.getElementById("serviceNextPayout");
  const openServicePayoutForm = document.getElementById(
    "openServicePayoutForm"
  );
  const servicePayoutModal = document.getElementById("servicePayoutModal");
  const servicePayoutForm = document.getElementById("servicePayoutForm");
  const closeServiceModal = document.getElementById("closeServiceModal");
  const bankNameInput = document.getElementById("serviceBankName");
  const accountNumberInput = document.getElementById("serviceAccountNumber");

  // 🧩 Load payout summary for service provider
  window.loadServicePayoutSummary = async function () {
    try {
      const data = await apiFetch("/payouts/summary");

      if (data && data.summary) {
        const { available, nextPayout } = data.summary;

        if (serviceAvailablePayout)
          serviceAvailablePayout.textContent = `₦${
            available?.toLocaleString() || "0"
          }`;

        if (serviceNextPayout)
          serviceNextPayout.textContent = nextPayout
            ? new Date(nextPayout).toLocaleDateString()
            : "Not scheduled";
      }
    } catch (err) {
      console.error("❌ Error loading payout summary:", err);
      if (serviceAvailablePayout) serviceAvailablePayout.textContent = "Error";
      if (serviceNextPayout) serviceNextPayout.textContent = "Error";
    }
  };

  // 📤 Handle payout form submit
  servicePayoutForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const bankName = bankNameInput.value.trim();
    const accountNumber = accountNumberInput.value.trim();

    if (!bankName || !accountNumber)
      return alert("Please fill out all fields.");

    try {
      const res = await apiFetch("/payouts/update", {
        method: "PUT",
        body: JSON.stringify({ bankName, accountNumber }),
      });

      alert(res.message || "✅ Payout details updated successfully!");
      servicePayoutModal.style.display = "none";
      await loadServicePayoutSummary();
    } catch (err) {
      console.error("❌ Error saving payout details:", err);
      alert("Failed to update payout details. Try again later.");
    }
  });

  // 🧾 Open modal
  openServicePayoutForm?.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const data = await apiFetch("/payouts/details");
      const { bankName, accountNumber } = data.details || {};
      if (bankNameInput) bankNameInput.value = bankName || "";
      if (accountNumberInput) accountNumberInput.value = accountNumber || "";
      servicePayoutModal.style.display = "flex";
    } catch {
      servicePayoutModal.style.display = "flex";
    }
  });

  // ❌ Close modal
  closeServiceModal?.addEventListener("click", () => {
    servicePayoutModal.style.display = "none";
  });

  // 🪟 Click outside modal closes it
  window.addEventListener("click", (e) => {
    if (e.target === servicePayoutModal) {
      servicePayoutModal.style.display = "none";
    }
  });

  // 🚀 Initialize
  loadServicePayoutSummary();
});

// --- SERVICE MANAGER + RECENT MESSAGES HANDLER ---
// (Relies on global apiFetch() defined in api.js)

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("serviceModal");
  const openBtn = document.getElementById("serviceAddBtn");
  const closeBtn = document.getElementById("serviceCloseModal");
  const form = document.getElementById("serviceForm");
  const list = document.getElementById("serviceList");
  const title = document.getElementById("serviceModalTitle");
  const serviceId = document.getElementById("serviceId");
  const msgContainer = document.getElementById("serviceMessages");
  const viewAllLink = document.querySelector(".recent-messages .view-all");

  // --- Open Modal ---
  if (openBtn) {
    openBtn.addEventListener("click", () => {
      form.reset();
      serviceId.value = "";
      title.textContent = "Add New Service";
      modal.style.display = "flex";
      modal.setAttribute("aria-hidden", "false");
    });
  }

  // --- Close Modal ---
  if (closeBtn) {
    closeBtn.addEventListener("click", () => closeServiceModal());
  }

  window.addEventListener("click", (e) => {
    if (e.target === modal) closeServiceModal();
  });

  function closeServiceModal() {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
  }

  // --- Load Services ---
  async function loadServices() {
    try {
      const data = await apiFetch("/services");
      list.innerHTML = "";

      if (!data?.services?.length) {
        list.innerHTML = `
          <div class="empty-state">
            <img src="../images/empty-box.png" alt="No services" class="empty-icon">
            <p>No services added yet. Click “+ Add Service” to get started.</p>
          </div>`;
        return;
      }

      data.services.forEach((srv) => {
        const item = document.createElement("div");
        item.className = "service-card";
        item.innerHTML = `
          <img src="${srv.image || "../images/service.jpg"}" alt="${
          srv.title
        }">
          <div class="service-info">
            <h4>${srv.title}</h4>
            <p>${srv.desc || "No description available"}</p>
            <p><strong>${srv.rate || 0} ${srv.currency || "NGN"}</strong></p>
          </div>
          <div class="service-actions">
            <button class="edit-btn" data-id="${srv._id}">✏️ Edit</button>
            <button class="delete-btn" data-id="${srv._id}">🗑 Delete</button>
          </div>`;
        list.appendChild(item);
      });

      attachServiceActions();
    } catch (err) {
      console.error("⚠️ Error loading services:", err);
      list.innerHTML = `
        <div class="empty-state">
          <p>Unable to load services right now. Please refresh the page.</p>
        </div>`;
    }
  }

  // --- Attach Edit/Delete Listeners ---
  function attachServiceActions() {
    document.querySelectorAll(".edit-btn").forEach((btn) =>
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        try {
          const { service } = await apiFetch(`/services/${id}`);
          populateForm(service);
          modal.style.display = "flex";
          modal.setAttribute("aria-hidden", "false");
          title.textContent = "Edit Service";
        } catch (err) {
          console.error("Error fetching service details:", err);
        }
      })
    );

    document.querySelectorAll(".delete-btn").forEach((btn) =>
      btn.addEventListener("click", async () => {
        if (!confirm("Are you sure you want to delete this service?")) return;
        try {
          await apiFetch(`/services/${btn.dataset.id}`, {
            method: "DELETE",
          });
          loadServices();
        } catch (err) {
          console.error("Error deleting service:", err);
        }
      })
    );
  }

  // --- Populate Form for Edit ---
  function populateForm(srv) {
    serviceId.value = srv._id;
    document.getElementById("serviceName").value = srv.name || "";
    document.getElementById("serviceTitle").value = srv.title || "";
    document.getElementById("serviceMajor").value = srv.major || "";
    document.getElementById("serviceDesc").value = srv.desc || "";
    document.getElementById("serviceAbout").value = srv.about || "";
    document.getElementById("serviceRate").value = srv.rate || "";
    document.getElementById("serviceCurrency").value = srv.currency || "NGN";
    document.getElementById("servicePackage").value = srv.package || "";
    document.getElementById("serviceDuration").value = srv.duration || "";
    document.getElementById("serviceCertifications").value =
      srv.certifications?.join(", ") || "";
    document.getElementById("servicePortfolio").value =
      srv.portfolio?.join(", ") || "";
    document.getElementById("servicePolicies").value =
      srv.policies?.join(", ") || "";
    document.getElementById("serviceTags").value = srv.tags?.join(", ") || "";
    document.getElementById("serviceAvailable").checked = srv.available ?? true;

    const slots = srv.timeSlots || [];
    ["Morning", "Afternoon", "Evening"].forEach((t) => {
      document.getElementById(`serviceAvail${t}`).checked = slots.includes(t);
    });
  }

  // --- Submit Service Form ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const id = serviceId.value;

    const timeSlots = [
      ...form.querySelectorAll('input[name="timeSlots"]:checked'),
    ].map((i) => i.value);

    fd.append("timeSlots", JSON.stringify(timeSlots));
    fd.append("available", document.getElementById("serviceAvailable").checked);

    const method = id ? "PUT" : "POST";
    const endpoint = id ? `/api/services/${id}` : "/api/services";

    try {
      await fetch(endpoint, {
        method,
        body: fd,
        credentials: "include",
      });
      closeServiceModal();
      loadServices();
    } catch (err) {
      console.error("❌ Save Service Error:", err);
      alert("Failed to save service. Try again.");
    }
  });

  // --- Load Recent Messages ---
  async function loadRecentMessages() {
    try {
      const res = await apiFetch("/messages/unread");
      msgContainer.innerHTML = "";

      if (!res?.messages?.length) {
        msgContainer.innerHTML = `
          <div class="empty-state small">
            <p>No unread messages yet.</p>
          </div>`;
        return;
      }

      res.messages.slice(0, 5).forEach((msg) => {
        const div = document.createElement("div");
        div.className = "message-item";
        div.innerHTML = `
          <div class="message-avatar">
            <img src="${msg.sender?.avatar || "../images/guy.png"}" alt="user">
          </div>
          <div class="message-body">
            <p class="message-sender">${msg.sender?.name || "Unknown User"}</p>
            <p class="message-preview">${msg.text || "No message content"}</p>
            <span class="message-time">${new Date(
              msg.createdAt
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}</span>
          </div>`;
        msgContainer.appendChild(div);
      });

      // --- View All Click Handler ---
      if (viewAllLink) {
        viewAllLink.addEventListener("click", (e) => {
          e.preventDefault();
          window.location.href = "../Pages/messages.html";
        });
      }
    } catch (err) {
      console.error("⚠️ Error loading messages:", err);
      msgContainer.innerHTML = `
        <div class="empty-state small">
          <p>Unable to load messages right now.</p>
        </div>`;
    }
  }

  // --- Initial Loads ---
  loadServices();
  loadRecentMessages();
});

// ===== Service Analytics =====
async function loadServiceAnalytics() {
  console.log("🔄 Loading service analytics...");
  trySetLoadingStates: {
    try {
      setServiceKpiLoading();
      setServiceSessionsLoading();
      setServiceChartLoading();
    } catch (e) {
      console.warn("Could not set loading states", e);
    }
  }

  try {
    const kpi = await apiFetch("/service-analytics/kpi");
    console.log("📊 KPI data received:", kpi);

    const totalRevenueEl = document.getElementById("serviceTotalRevenue");
    const sessionsEl = document.getElementById("serviceSessionsCompleted");
    const avgRatingEl = document.getElementById("serviceAvgRating");
    const revenueChangeEl = document.getElementById("serviceRevenueChange");

    const safeKpi = {
      totalRevenue: kpi?.totalRevenue ?? 0,
      sessionsCompleted: kpi?.sessionsCompleted ?? 0,
      avgRating: kpi?.avgRating ?? 0,
      revenueChange: kpi?.revenueChange,
    };

    if (totalRevenueEl)
      totalRevenueEl.textContent = `₦${safeKpi.totalRevenue.toLocaleString()}`;
    if (sessionsEl) sessionsEl.textContent = safeKpi.sessionsCompleted;
    if (avgRatingEl) avgRatingEl.textContent = `${safeKpi.avgRating} ★`;
    if (revenueChangeEl) {
      if (safeKpi.revenueChange !== undefined) {
        revenueChangeEl.textContent =
          safeKpi.revenueChange > 0
            ? `+${safeKpi.revenueChange}% from last month`
            : `${safeKpi.revenueChange}% from last month`;
      } else revenueChangeEl.textContent = "";
    }

    // ===== Recent Sessions =====
    const sessions = await apiFetch("/service-analytics/sessions/recent");
    console.log("📝 Recent sessions received:", sessions);

    const recentTbody = document.getElementById("serviceRecentSessions");
    const fallbackTbody = document.querySelector(".activity-table tbody");

    const rows = (Array.isArray(sessions) ? sessions : [])
      .map(
        (s) => `
        <tr>
          <td>${new Date(s.date).toLocaleDateString()}</td>
          <td>${s.client?.name || "Unknown"}</td>
          <td>${s.type || "-"}</td>
          <td>₦${(s.price || 0).toLocaleString()}</td>
        </tr>`
      )
      .join("");

    const emptyState = `<tr><td colspan="4">No recent sessions</td></tr>`;

    if (recentTbody) recentTbody.innerHTML = rows || emptyState;
    if (fallbackTbody && !recentTbody)
      fallbackTbody.innerHTML = rows || emptyState;

    await loadServiceRevenueChart();
    startServiceAutoRefresh();
    try {
      setServiceLastUpdated(new Date());
    } catch (e) {
      console.warn("Could not update last-updated timestamp", e);
    }
  } catch (err) {
    console.error("❌ Failed to load service analytics:", err);

    const trySet = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    trySet("serviceTotalRevenue", "Error");
    trySet("serviceSessionsCompleted", "Error");
    trySet("serviceAvgRating", "Error");

    const recentTbody = document.getElementById("serviceRecentSessions");
    const fallbackTbody = document.querySelector(".activity-table tbody");
    const errorState = `<tr><td colspan="4">Failed to load sessions</td></tr>`;
    if (recentTbody) recentTbody.innerHTML = errorState;
    if (fallbackTbody && !recentTbody) fallbackTbody.innerHTML = errorState;
  }
}

// ===== Revenue Chart =====
async function loadServiceRevenueChart() {
  const canvas = document.getElementById("serviceEarningsChart");
  if (!canvas) return;

  try {
    const data = await apiFetch("/service-analytics/revenue/daily");
    console.log("📈 Revenue chart data received:", data);

    const labels = Array.isArray(data.labels) ? data.labels : [];
    const revenue = Array.isArray(data.revenue) ? data.revenue : [];

    if (!labels.length || !revenue.length) {
      canvas.parentElement.innerHTML =
        "<p class='error-msg'>No chart data available.</p>";
      return;
    }

    const parent = canvas.parentElement;
    if (parent) {
      parent.innerHTML = `<canvas id="serviceEarningsChart"></canvas>`;
    }
    const freshCanvas = document.getElementById("serviceEarningsChart");
    if (!freshCanvas) return;
    removeServiceChartLoader();
    const ctx = freshCanvas.getContext("2d");

    if (typeof Chart === "undefined") {
      console.error("❌ Chart.js is not available. Cannot render chart.");
      freshCanvas.parentElement.innerHTML =
        "<p class='error-msg'>Chart library not loaded.</p>";
      return;
    }

    new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Daily Earnings (₦)",
            data: revenue,
            borderColor: "#10b981",
            backgroundColor: "rgba(16,185,129,0.1)",
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (ctx) => `₦${ctx.formattedValue}` },
          },
        },
      },
    });
  } catch (err) {
    console.error("❌ Failed to load daily revenue chart:", err);
    const canvasEl = document.getElementById("serviceEarningsChart");
    if (canvasEl?.parentElement) {
      removeServiceChartLoader();
      canvasEl.parentElement.innerHTML =
        "<p class='error-msg'>Failed to load chart data.</p>";
    }
  }
}

// ===== Loading states + auto-refresh =====
let serviceRefreshId = null;
const SERVICE_REFRESH_MS = 60 * 60 * 1000; // 1 hour

function setServiceKpiLoading() {
  const totalRevenueEl = document.getElementById("serviceTotalRevenue");
  const sessionsEl = document.getElementById("serviceSessionsCompleted");
  const avgRatingEl = document.getElementById("serviceAvgRating");
  const revenueChangeEl = document.getElementById("serviceRevenueChange");

  if (totalRevenueEl) totalRevenueEl.textContent = "Loading…";
  if (sessionsEl) sessionsEl.textContent = "Loading…";
  if (avgRatingEl) avgRatingEl.textContent = "Loading…";
  if (revenueChangeEl) revenueChangeEl.textContent = "";
}

function setServiceSessionsLoading() {
  const recentTbody = document.getElementById("serviceRecentSessions");
  const fallbackTbody = document.querySelector(".activity-table tbody");
  const loadingRow = `<tr><td colspan="4">Loading…</td></tr>`;
  if (recentTbody) recentTbody.innerHTML = loadingRow;
  else if (fallbackTbody) fallbackTbody.innerHTML = loadingRow;
}

function setServiceChartLoading() {
  const canvas = document.getElementById("serviceEarningsChart");
  if (!canvas) return;
  const parent = canvas.parentElement;
  if (!parent) return;
  let loader = document.getElementById("serviceChartLoader");
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "serviceChartLoader";
    loader.textContent = "Loading chart…";
    loader.style.cssText =
      "text-align:center;padding:12px;color:#6b7280;font-style:italic;";
    parent.appendChild(loader);
  }
}

function removeServiceChartLoader() {
  const loader = document.getElementById("serviceChartLoader");
  if (loader && loader.parentElement) loader.parentElement.removeChild(loader);
}

function setServiceLastUpdated(dateOrStr) {
  try {
    const el = document.querySelector(".service-analytics-last-updated");
    if (!el) return;
    if (!dateOrStr) {
      el.textContent = "";
      return;
    }
    const d = dateOrStr instanceof Date ? dateOrStr : new Date(dateOrStr);
    if (isNaN(d)) {
      el.textContent = String(dateOrStr);
      return;
    }
    el.textContent = `Last updated: ${d.toLocaleString()}`;
  } catch (e) {
    console.warn("Could not set last-updated", e);
  }
}

function startServiceAutoRefresh() {
  if (serviceRefreshId) return;
  serviceRefreshId = setInterval(() => {
    if (Array.isArray(userRoles) && userRoles.includes("service_provider")) {
      console.log("🔁 Auto-refreshing service analytics...");
      loadServiceAnalytics();
    }
  }, SERVICE_REFRESH_MS);
}

function stopServiceAutoRefresh() {
  if (serviceRefreshId) {
    clearInterval(serviceRefreshId);
    serviceRefreshId = null;
  }
}

window.addEventListener("beforeunload", () => stopServiceAutoRefresh());

// call service section loaders
document.addEventListener("DOMContentLoaded", async () => {
  await loadServicePayoutSummary();
  await loadServiceAnalytics();
});
// --- END SERVICE SECTION ---

// ===============================
// Init on DOM ready
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();
});
