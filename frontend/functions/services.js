const isLocal = window.location.hostname === "localhost";
const API_BASE = isLocal
  ? "http://localhost:5000/api"
  : "https://ump-html-1.onrender.com/api";


const priceRange = document.getElementById("priceRange");
const priceValue = document.getElementById("priceValue");
const grid = document.getElementById("serviceGrid");

// ======== Update Price Range Text ========
if (priceRange && priceValue) {
  priceRange.addEventListener("input", () => {
    priceValue.textContent = `₦0 - ₦${priceRange.value}/hr`;
  });
}

// ======== Reusable API Fetch Helper ========
async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}/api${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("❌ API fetch failed:", err);
    throw err;
  }
}

// ======== Render Services ========
function renderServices(data) {
  const filterBar = document.querySelector(".filter-bar");

  if (!grid) return;

  // If no data or empty array
  if (!data || data.length === 0) {
    // Hide filter section
    if (filterBar) filterBar.style.display = "none";

    grid.innerHTML = `
      <div class="empty-state">
        <img src="../images/service.jpg" alt="No services">
        <h3>No services available yet</h3>
        <p>Once partners add services, they’ll appear here.</p>
      </div>`;
    return;
  }

  // ✅ If services exist, show the filter bar again
  if (filterBar) filterBar.style.display = "flex";

  grid.innerHTML = data
    .map(
      (s) => `
      <div class="service-card" data-id="${s._id}">
        <img src="${s.image || "../images/default.jpg"}" alt="${
        s.title
      }" class="service-photo" />
        <h3 class="service-title">${s.title}</h3>
        <div class="provider-info">
          <span>${s.name || s.provider?.name || "Unknown"}</span>
          ${s.verified ? `<span class="verified-badge">Verified</span>` : ""}
        </div>
        <div class="price">₦${s.rate || "N/A"}/hr</div>
        <div class="rating">⭐ ${s.rating || "0"} <span>/ 5.0</span></div>
        <button class="view-btn">View Details</button>
      </div>
    `
    )
    .join("");
}

// ======== Load Services from Backend ========
async function loadServices() {
  try {
    const services = await apiFetch("/services");
    renderServices(
      Array.isArray(services) ? services : services.services || []
    );
  } catch (err) {
    grid.innerHTML = `
      <div class="error-msg">
        <p>Failed to load services. Please try again later.</p>
      </div>`;
  }
}

// ======== Click: View Details ========
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("view-btn")) {
    const card = e.target.closest(".service-card");
    const serviceId = card.getAttribute("data-id");
    window.location.href = `servicesdp.html?id=${serviceId}`;
  }
});

// ======== Initialize ========
document.addEventListener("DOMContentLoaded", loadServices);
