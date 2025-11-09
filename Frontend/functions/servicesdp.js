const isLocal = window.location.hostname === "localhost";
const API_BASE = isLocal
  ? "http://localhost:5000/api"
  : "https://ump-html-1.onrender.com/api";

const tabBtns = document.querySelectorAll(".tab-btn");
const tabPanes = document.querySelectorAll(".tab-pane");

// Cookie helper
function cookieGet(name) {
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabBtns.forEach((b) => b.classList.remove("active"));
    tabPanes.forEach((p) => p.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// === Service Details Page ===

// Inject base layout into #app
document.getElementById("app").innerHTML = `
  <section class="service-detail container">
    <div class="service-layout">
      <div class="service-info" id="serviceInfo"></div>
      <aside class="booking-panel" id="bookingPanel"></aside>
    </div>

    <div class="details-tabs">
      <div class="tab-controls">
        <button class="tab-btn active" data-tab="reviews">All Reviews</button>
        <button class="tab-btn" data-tab="policies">Policies</button>
      </div>
      <div class="tab-content">
        <div class="tab-pane active" id="reviews"></div>
        <div class="tab-pane" id="policies"></div>
      </div>
    </div>
  </section>
`;

// === DOM ELEMENTS ===
const serviceInfo = document.getElementById("serviceInfo");
const bookingPanel = document.getElementById("bookingPanel");
const reviewsPane = document.getElementById("reviews");
const policiesPane = document.getElementById("policies");

// === GET SERVICE ID FROM URL ===
const urlParams = new URLSearchParams(window.location.search);
const serviceId = urlParams.get("id");

if (!serviceId) {
  document.getElementById("app").innerHTML = `
    <div class="not-found">
      <h2>Invalid Request</h2>
      <p>No service ID provided in the URL.</p>
    </div>`;
  throw new Error("No service ID in URL");
}

// === FETCH SERVICE DATA FROM BACKEND ===
async function fetchService() {
  try {
    const res = await fetch(`${API_BASE}/api/services/${serviceId}`);
    if (!res.ok) throw new Error(`Failed to load service (${res.status})`);

    const { success, service } = await res.json();
    if (!success || !service) throw new Error("Service not found");

    renderService(service);
  } catch (err) {
    console.error("❌ Failed to load service:", err);
    document.getElementById("app").innerHTML = `
      <div class="not-found">
        <h2>Service not found</h2>
        <p>${err.message}</p>
      </div>`;
  }
}

// === RENDER SERVICE DETAILS ===
function renderService(s) {
  const provider = s.serviceProvider || s.provider || {}; // fallback safety

  // LEFT COLUMN — MAIN INFO
  serviceInfo.innerHTML = `
    <div class="service-header">
      <h1>${s.title || s.name}</h1>
      ${s.verified ? `<span class="verified-badge">Verified Expert</span>` : ""}
    </div>

    <div class="provider-bio">
      <img src="${provider.avatar || s.image || "../images/default-user.png"}" 
           alt="${provider.name || "Service Provider"}" 
           class="provider-photo" />
      <div>
        <h3>${s.name || s.provider?.name || "Unknown"}</h3>
        <p class="provider-role">Role: ${
          provider.role || "Service Provider"
        }</p>
        <p class="provider-major">${s.major || ""}</p>
        <p class="provider-desc">${s.desc || s.about || ""}</p>
        ${
          provider.email
            ? `<p class="provider-email"><i class="fa-solid fa-envelope"></i> ${provider.email}</p>`
            : ""
        }
      </div>
    </div>

    <div class="service-description">
      <h2>About the Service</h2>
      <p>${s.about || "No description available."}</p>
    </div>

    ${
      s.certifications?.length
        ? `<div class="certifications">
            <h2>Certifications</h2>
            <ul>${s.certifications.map((c) => `<li>${c}</li>`).join("")}</ul>
          </div>`
        : ""
    }

    ${
      s.portfolio?.length
        ? `<div class="portfolio">
            <h2>Portfolio</h2>
            <div class="portfolio-gallery">
              ${s.portfolio
                .map((img) => `<img src="${img}" alt="Portfolio Example">`)
                .join("")}
            </div>
          </div>`
        : ""
    }

    <div class="reviews-summary">
      <h2>Reviews Summary</h2>
      <div class="rating-overview">
        <h3>⭐ ${s.rating || "N/A"} <span>/ 5.0</span></h3>
        <p>Based on ${s.reviewsCount || 0} reviews</p>
      </div>
    </div>
  `;

  // RIGHT COLUMN — BOOKING PANEL
  bookingPanel.innerHTML = `
  <div class="price-box">
    <h3 class="main-rate">${s.rate || "Price not set"}</h3>
    <p>${s.package || ""}</p>
  </div>

  <div class="schedule">
    <label for="bookingDate">Choose a Date</label>
    <input type="date" id="bookingDate" />
    <div class="time-slots" id="timeSlots">
      ${
        s.availableTimes && s.availableTimes.length
          ? s.availableTimes
              .map((t) => `<button class="time-btn">${t}</button>`)
              .join("")
          : `
            <button class="time-btn">9:00 AM</button>
            <button class="time-btn">11:00 AM</button>
            <button class="time-btn">2:00 PM</button>
            <button class="time-btn">4:00 PM</button>
          `
      }
    </div>
  </div>

  <div class="action-buttons">
    <button class="cta-btn" id="bookBtn">Book Session</button>
    <button class="cta-btn" id="downloadPortfolioBtn">Download Portfolio</button>
    <button class="cta-btn secondary" id="messageProviderBtn">Message Provider</button>
  </div>
`;

  // === REVIEWS TAB ===
  if (s.reviews && s.reviews.length > 0) {
    reviewsPane.innerHTML = `
    <h3>Reviews (${s.reviews.length})</h3>
    <div class="reviews-list">
      ${s.reviews
        .map(
          (r) => `
          <div class="review-item">
            <p class="review-text">“${r.text}”</p>
            <div class="review-meta">
              <span class="review-author">— ${
                r.user?.name || "Anonymous"
              }</span>
              <span class="review-stars">⭐ ${r.stars}/5</span>
              <span class="review-date">${new Date(
                r.createdAt
              ).toLocaleDateString()}</span>
            </div>
          </div>`
        )
        .join("")}
    </div>`;
  } else {
    reviewsPane.innerHTML = `
    <div class="no-reviews">
      <img src="../images/empty-box.png" alt="No Reviews" />
      <h4>No reviews yet</h4>
      <p>Be the first to leave a review!</p>
    </div>`;
  }

  // === POLICIES TAB ===
  if (s.policies && s.policies.length > 0) {
    policiesPane.innerHTML = `
    <h3>Policies</h3>
    <ul class="policies-list">
      ${s.policies.map((p) => `<li>${p}</li>`).join("")}
    </ul>`;
  } else {
    policiesPane.innerHTML = `
    <div class="no-policies">
      <p>No policies listed for this service.</p>
    </div>`;
  }

  // Store provider ID globally for chat
  window.currentService = { providerId: provider._id };
}

// === Initialize ===
fetchService();

// TAB SWITCH FUNCTIONALITY
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("tab-btn")) {
    document
      .querySelectorAll(".tab-btn")
      .forEach((btn) => btn.classList.remove("active"));
    document
      .querySelectorAll(".tab-pane")
      .forEach((p) => p.classList.remove("active"));
    e.target.classList.add("active");
    document.getElementById(e.target.dataset.tab).classList.add("active");
  }
});

// === BUTTON FUNCTIONALITY ===
document.addEventListener("click", async (e) => {
  // Select time slot
  if (e.target.classList.contains("time-btn")) {
    document
      .querySelectorAll(".time-btn")
      .forEach((btn) => btn.classList.remove("selected"));
    e.target.classList.add("selected");
  }

  // Book session
  if (e.target.id === "bookBtn") {
    const date = document.getElementById("bookingDate").value;
    const timeSlot = document.querySelector(".time-btn.selected")?.textContent;

    if (!date || !timeSlot) {
      alert("Please select a date and time before booking.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        credentials: "include", // ensure httpOnly cookie is sent
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: window.currentService?._id || serviceId, // the current service ID
          date,
          timeSlot,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      alert(`✅ Booking confirmed for ${date} at ${timeSlot}`);
    } catch (err) {
      console.error("Booking error:", err);
      alert(`❌ ${err.message}`);
    }
  }

  // Download portfolio
  if (e.target.id === "downloadPortfolioBtn") {
    window.location.href = `/api/services/${serviceId}/portfolio/download`;
  }

  // Message provider
  if (e.target.id === "messageProviderBtn") {
    const providerId = window.currentService?.providerId;
    if (!providerId) {
      alert("No provider found for this service.");
      return;
    }
    window.location.href = `/chat?receiver=${providerId}`;
  }
});
