const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ump-html-1.onrender.com";

const listingControls = document.getElementById("listingControls");
const listingGrid = document.getElementById("listingGrid");
const toggleButtons = document.querySelectorAll(".toggle-btn");

// Cookie helper
function cookieGet(name) {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}
function cookieRemove(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// ==========================
// STATE
// ==========================
let listings = [];
const filters = {
  location: "",
  minPrice: 1000,
  maxPrice: 5000000,
  bedrooms: "",
  amenities: "",
};

// ==========================
// FETCH DATA FROM BACKEND
// ==========================
async function fetchListings() {
  try {
    const res = await fetch(`${API_BASE}/api/listings`);
    if (!res.ok) throw new Error("Failed to fetch listings");

    const data = await res.json();
    listings = data.listings || []; // ✅ Extract actual array

    if (!Array.isArray(listings) || listings.length === 0) {
      listingGrid.innerHTML = `
        <div class="no-results">
          <img src="../images/empty.png" alt="Empty" />
          <h3>No hostels/apartment Listed Yet</h3>
          <p>Try adjusting your filters or check back later.</p>
        </div>`;
      listingControls.style.display = "none";
      return;
    }

    listingControls.style.display = "block";
    renderListings(listings);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    listingGrid.innerHTML = `
      <div class="error-state">
        <h3>Unable to load listings</h3>
        <p>${err.message}</p>
      </div>`;
  }
}

// ==========================
// RENDER LISTINGS
// ==========================
function renderListings(data) {
  listingGrid.innerHTML = data
    .map(
      (item) => `
      <div class="listing-card" data-id="${item._id}">
        <div class="card-image">
          <div class="carousel">
            ${
              item.images?.length
                ? item.images
                    .map(
                      (img, i) =>
                        `<img src="${img}" class="${
                          i === 0 ? "active" : ""
                        }" alt="${item.name}">`
                    )
                    .join("")
                : `<img src="/images/no-image.jpg" class="active" alt="No image available">`
            }
          </div>
          <button class="carousel-btn prev"><i class="fa-solid fa-chevron-left"></i></button>
          <button class="carousel-btn next"><i class="fa-solid fa-chevron-right"></i></button>
          <button class="wishlist" data-id="${item._id}">
            <i class="fa-regular fa-heart"></i>
          </button>
        </div>

        <div class="card-content">
          <div class="card-header">
            <h3>${item.name || "Unnamed Property"}</h3>
            <span class="property-type">${item.type || "Apartment"}</span>
          </div>
          <div class="card-price">
            ₦${Number(item.price || 0).toLocaleString()} <span>${
        item.rate || "per month"
      }</span>
          </div>
          <div class="card-metrics">
            <div><i class="fa-solid fa-bed"></i> ${item.beds || 0} Bed</div>
            <div><i class="fa-solid fa-bath"></i> ${item.baths || 0} Bath</div>
            <div><i class="fa-solid fa-location-dot"></i> ${
              item.location || "N/A"
            }</div>
          </div>
        </div>
      </div>`
    )
    .join("");

  // Initialize carousels
  initCarousel();

  document.querySelectorAll(".listing-card").forEach((card) => {
    const id = card.dataset.id;

    // Card click opens detail page
    card.addEventListener("click", () => {
      window.location.href = `/pages/hostelpdp.html?id=${id}`;
    });

    // Stop card click when wishlist button is clicked
    card.querySelector(".wishlist").addEventListener("click", (e) => {
      e.stopPropagation(); // ✅ Prevents triggering card click
      const itemId = e.currentTarget.dataset.id;
      addToWishlist(itemId, e.currentTarget);
    });

    // Stop card click when carousel arrows are clicked
    card.querySelectorAll(".carousel-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => e.stopPropagation());
    });
  });
}

// ==========================
// CAROUSEL LOGIC
// ==========================
function initCarousel() {
  document.querySelectorAll(".listing-card").forEach((card) => {
    const imgs = card.querySelectorAll(".carousel img");
    let index = 0;

    const prev = card.querySelector(".carousel-btn.prev");
    const next = card.querySelector(".carousel-btn.next");

    if (!imgs.length) return;

    prev.addEventListener("click", (e) => {
      e.stopPropagation();
      index = (index - 1 + imgs.length) % imgs.length;
      imgs.forEach((img) => img.classList.remove("active"));
      imgs[index].classList.add("active");
    });

    next.addEventListener("click", (e) => {
      e.stopPropagation();
      index = (index + 1) % imgs.length;
      imgs.forEach((img) => img.classList.remove("active"));
      imgs[index].classList.add("active");
    });
  });
}

// ==========================
// FILTER CONTROLS
// ==========================
function applyFilters() {
  const filtered = listings.filter((item) => {
    const price = parseInt(item.price);
    return (
      (!filters.location || item.location === filters.location) &&
      price >= filters.minPrice &&
      price <= filters.maxPrice &&
      (!filters.bedrooms || item.beds >= parseInt(filters.bedrooms)) &&
      (!filters.amenities ||
        (item.amenities && item.amenities.includes(filters.amenities)))
    );
  });

  renderListings(filtered);
}

function goToListing(id) {
  window.location.href = `/pages/hostelpdp.html?id=${id}`;
}

// ==========================
// RANGE SLIDER
// ==========================
const minPrice = document.getElementById("minPrice");
const maxPrice = document.getElementById("maxPrice");
const minValue = document.getElementById("minValue");
const maxValue = document.getElementById("maxValue");

[minPrice, maxPrice].forEach((el) =>
  el.addEventListener("input", () => {
    filters.minPrice = parseInt(minPrice.value);
    filters.maxPrice = parseInt(maxPrice.value);
    minValue.textContent = filters.minPrice.toLocaleString();
    maxValue.textContent = filters.maxPrice.toLocaleString();
    applyFilters();
  })
);

// ==========================
// OTHER FILTERS
// ==========================
document.querySelectorAll(".bed-btn").forEach((btn) =>
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".bed-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    filters.bedrooms = btn.dataset.bed;
    applyFilters();
  })
);

document.getElementById("location").addEventListener("change", (e) => {
  filters.location = e.target.value;
  applyFilters();
});

document.getElementById("amenities").addEventListener("change", (e) => {
  filters.amenities = e.target.value;
  applyFilters();
});

// ==========================
// VIEW TOGGLE
// ==========================
toggleButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    toggleButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const view = btn.dataset.view;
    listingGrid.classList.toggle("list-view", view === "list");
  });
});

// ==========================
// INIT
// ==========================
fetchListings();

async function addToWishlist(productId, button) {
  // Verify auth via server (httpOnly cookie) rather than reading cookie in JS
  let user = null;
  try {
    const r = await fetch(`${API_BASE}/api/auth/me`, { credentials: "include" });
    if (r.ok) {
      const body = await r.json();
      user = body.user || null;
    }
  } catch (e) {
    console.error("auth verify error", e);
  }

  if (!user) {
    alert("Please log in to add items to your wishlist.");
    window.location.href = "/Pages/login.html"; // adjust path if different
    return;
  }

  try {
    button.disabled = true;
    button.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`; // show loading

    const res = await fetch(`${API_BASE}/api/wishlist/${productId}`, {
      method: "POST",
      credentials: "include", // ensure server-set httpOnly cookie is sent
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const data = await res.json();

    button.classList.add("added");
    button.innerHTML = `<i class="fa-solid fa-heart"></i>`; // filled heart icon
    console.log("✅ Wishlist added:", data);
    } catch (err) {
      console.error("❌ Wishlist error:", err);
      alert("Failed to add to wishlist. Please log in again.");
      window.location.href = "/Pages/login.html";
    } finally {
    button.disabled = false;
  }
}
