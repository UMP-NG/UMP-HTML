const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ump-html-1.onrender.com";

const tabs = document.querySelectorAll(".tab-btn");
const panes = document.querySelectorAll(".tab-pane");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    panes.forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

// =============== Get Property ID from URL =================
const urlParams = new URLSearchParams(window.location.search);
const propertyId = urlParams.get("id");

if (!propertyId) {
  console.error("❌ No property ID found in URL");
  alert("Invalid property link.");
}

// =============== Fetch Property Data =================
async function loadProperty() {
  try {
    const res = await fetch(`${API_BASE}/api/listings/${propertyId}`);
    if (!res.ok) throw new Error("Failed to fetch property details");

    const data = await res.json();
    const property = data.listing; // ✅ Correctly access listing

    populateProperty(property);
    loadRelatedListings(property);
  } catch (error) {
    console.error("❌ Error loading property:", error);
    document.querySelector(
      ".property-header"
    ).innerHTML = `<p class="error">Failed to load property. Please try again later.</p>`;
  }
}

// =============== Populate Property Info =================
function populateProperty(property) {
  // Basic info
  document.getElementById("propertyLocation").textContent =
    property.location || "—";
  document.getElementById("propertyName").textContent =
    property.name || "Untitled";
  document.getElementById("propertyTitle").textContent =
    property.name || "Untitled";
  document.getElementById("propertyPrice").textContent = `₦${(
    property.price || 0
  ).toLocaleString()}`;
  document.getElementById("propertyRate").textContent = property.rate || "—";
  document.getElementById("bedrooms").textContent = property.beds || "—";
  document.getElementById("bathrooms").textContent = property.baths || "—";
  document.getElementById("distance").textContent = property.distance || "—";
  document.getElementById("propertyDesc").textContent =
    property.description ||
    `${property.name} is a ${
      property.type?.toLowerCase() || "residential"
    } property located in ${property.location}. It features ${
      property.beds || 0
    } bedrooms and ${property.baths || 0} bathrooms.`;

  // Images
  const mainImage = document.getElementById("mainImage");
  const thumbnailRow = document.getElementById("thumbnailRow");
  const images =
    property.images && property.images.length > 0
      ? property.images.map((img) => `${img}`)
      : ["../images/badimage.png"];
  mainImage.src = images[0];
  thumbnailRow.innerHTML = images
    .map(
      (img) => `<img src="${img}" alt="${property.name}" class="thumbnail" />`
    )
    .join("");

  // Video
  const videoEl = document.getElementById("propertyVideo");
  const videoContainer = document.getElementById("propertyVideoContainer");
  if (property.videos && property.videos.length > 0) {
    videoEl.src = `${property.videos[0]}`;
    videoContainer.style.display = "block";
  } else {
    videoContainer.style.display = "none";
  }

  // Thumbnail click
  document.querySelectorAll(".thumbnail").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      mainImage.src = thumb.src;
      document
        .querySelectorAll(".thumbnail")
        .forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");
    });
  });

  // --------------------------
  // Location Tab (Google Map)
  // --------------------------
  const mapEl = document.getElementById("propertyMap");
  if (property.location) {
    const query = encodeURIComponent(property.location);
    mapEl.src = `https://www.google.com/maps?q=${query}&output=embed`;
  } else {
    mapEl.src = "";
  }

  const poiListEl = document.getElementById("poiList");
  poiListEl.innerHTML =
    (property.poi || [])
      .map((p) => `<li>${p.name} - ${p.distance || "N/A"} km away</li>`)
      .join("") || `<li>No points of interest available.</li>`;

  // --------------------------
  // Amenities Tab
  // --------------------------
  const amenitiesEl = document.getElementById("amenitiesTab");
  amenitiesEl.innerHTML =
    (property.amenities || [])
      .map((a) => `<span class="amenity">${a}</span>`)
      .join("") || `<p>No amenities listed.</p>`;

  // --------------------------
  // Reviews Tab
  // --------------------------
  const reviewContainer = document.getElementById("reviewContainer");

  // Filter out empty reviews
  const validReviews = (property.reviews || []).filter(
    (r) => r.comment?.trim() || r.rating
  );

  let reviewsHtml = "";

  if (validReviews.length > 0) {
    reviewsHtml = validReviews
      .map(
        (r) => `
      <div class="review">
        <strong>${r.userName?.trim() || "Anonymous"}</strong> 
        ${r.rating ? `(${r.rating}/5)` : ""}
        <p>${r.comment?.trim() || ""}</p>
      </div>
    `
      )
      .join("");
  } else {
    reviewsHtml = `<p style="font-style:italic; color:#555;">No reviews yet.</p>`;
  }

  // Add review submission form
  const reviewFormHtml = `
  <div class="review-form">
    <h4>Write a Review</h4>
    <textarea id="newReviewText" rows="3" placeholder="Write your review..."></textarea>
    <br/>
    <select id="newReviewRating">
      <option value="">Select rating</option>
      <option value="5">5 - Excellent</option>
      <option value="4">4 - Good</option>
      <option value="3">3 - Average</option>
      <option value="2">2 - Poor</option>
      <option value="1">1 - Terrible</option>
    </select>
    <br/>
    <button id="submitReviewBtn">Submit Review</button>
  </div>
`;

  reviewContainer.innerHTML = reviewsHtml + reviewFormHtml;

  // Handle review submission
  const submitReviewBtn = document.getElementById("submitReviewBtn");
  submitReviewBtn.addEventListener("click", async () => {
    const text = document.getElementById("newReviewText").value.trim();
    const rating = document.getElementById("newReviewRating").value;

    if (!text) {
      alert("Please write a review before submitting.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: "POST",
        credentials: "include", // send cookies / token
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: property._id,
          comment: text,
          rating: parseInt(rating),
        }),
      });

      if (!res.ok) throw new Error("Failed to submit review");
      alert("Review submitted successfully!");
      loadProperty(); // reload property to update reviews
    } catch (err) {
      console.error(err);
      alert("Error submitting review.");
    }
  });
}

// ==========================
// RELATED LISTINGS with fuzzy match
// ==========================
async function loadRelatedListings(currentProperty) {
  const relatedContainer = document.getElementById("relatedContainer");

  // Simple string similarity function (returns 0-1)
  function similarity(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    let longer = s1.length > s2.length ? s1 : s2;
    let shorter = s1.length > s2.length ? s2 : s1;
    const longerLength = longer.length;
    if (longerLength === 0) return 1.0;
    const editDist = levenshteinDistance(longer, shorter);
    return (longerLength - editDist) / longerLength;
  }

  function levenshteinDistance(a, b) {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) =>
      Array(a.length + 1).fill(0)
    );

    for (let i = 0; i <= b.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = b[i - 1] === a[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }
    return matrix[b.length][a.length];
  }

  try {
    const res = await fetch(`${API_BASE}/api/listings`);
    if (!res.ok) throw new Error("Failed to fetch related listings");
    const data = await res.json();

    // Filter out current property and fuzzy match locations
    let related = (data.listings || []).filter((p) => {
      if (p._id === currentProperty._id) return false;
      const score = similarity(
        currentProperty.location || "",
        p.location || ""
      );
      return score >= 0.4; // threshold (0.4 is quite permissive, adjust as needed)
    });

    // Randomize
    related = related.sort(() => Math.random() - 0.5);

    if (related.length === 0) {
      relatedContainer.innerHTML = `<p class="no-related">No related properties found.</p>`;
      return;
    }

    // Display all
    relatedContainer.innerHTML = related
      .map(
        (prop) => `
      <div class="listing-card" data-id="${prop._id}">
        <img src="${prop.images?.[0] || "badimage.png"}" alt="${prop.name}">
        <div class="listing-info">
          <h4>${prop.name}</h4>
          <p>${prop.location}</p>
          <span>₦${(prop.price || 0).toLocaleString()}</span>
        </div>
      </div>`
      )
      .join("");

    document
      .querySelectorAll("#relatedContainer .listing-card")
      .forEach((card) => {
        card.addEventListener("click", () => {
          window.location.href = `/pages/hostelpdp.html?id=${card.dataset.id}`;
        });
      });
  } catch (err) {
    console.error("❌ Related listings error:", err);
    relatedContainer.innerHTML = `<p class="error">Failed to load related listings.</p>`;
  }
}

// =============== Initialize =================
if (propertyId) loadProperty();

// ================== Schedule Viewing Button ==================
document.addEventListener("DOMContentLoaded", () => {
  const contactBtn = document.getElementById("contactBtn");
  const bookingModal = document.getElementById("bookingModal");
  const closeBooking = document.getElementById("closeBooking");
  const bookingForm = document.getElementById("bookingForm");

  if (!contactBtn) return;

  // ✅ Open modal when button clicked
  contactBtn.addEventListener("click", async () => {
    try {
      // 🧠 Check if user is logged in (via backend)
      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: "GET",
        credentials: "include", // important: sends cookies
      });

      if (!res.ok) {
        alert("Please log in to schedule a viewing.");
        window.location.href = "/Pages/login.html";
        return;
      }

      // ✅ Show modal if logged in
      bookingModal.style.display = "flex";
    } catch (err) {
      console.error("❌ Auth check failed:", err);
      alert("Error checking login status.");
    }
  });

  // ❌ Close modal handlers
  closeBooking.addEventListener("click", () => {
    bookingModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === bookingModal) bookingModal.style.display = "none";
  });

  // 📨 Handle booking submission
  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const date = document.getElementById("viewDate").value;
    const timeSlot = document.getElementById("viewTime").value;
    const notes = document.getElementById("notes").value;

    if (!date || !timeSlot) {
      alert("Please select a date and time.");
      return;
    }

    // 🧭 Get property/listing ID from URL (example: ?id=68fcbefc20862def7e291bd0)
    const urlParams = new URLSearchParams(window.location.search);
    const listingId = urlParams.get("id");

    if (!listingId) {
      alert("Listing ID not found.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        credentials: "include", // sends token cookie
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: listingId,
          itemType: "listing",
          date,
          timeSlot,
          notes,
        }),
      });

      if (!res.ok) throw new Error(`Booking failed (${res.status})`);
      const data = await res.json();

      alert("✅ Viewing scheduled successfully!");
      bookingModal.style.display = "none";
      console.log("📅 Booking confirmed:", data);
    } catch (err) {
      console.error("❌ Booking error:", err);
      alert("Failed to schedule viewing. Please try again.");
    }
  });
});
