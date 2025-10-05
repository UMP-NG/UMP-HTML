// Toggle List / Map buttons
document.querySelectorAll(".toggle-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".toggle-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// Bedroom selection
document.querySelectorAll(".bed-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".bed-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// Wishlist Toggle
document.querySelectorAll(".wishlist").forEach((btn) => {
  btn.addEventListener("click", () => {
    const icon = btn.querySelector("i");
    icon.classList.toggle("fa-regular");
    icon.classList.toggle("fa-solid");
    icon.style.color = icon.classList.contains("fa-solid")
      ? "var(--color-comp)"
      : "";
  });
});

// Mock Data
const mockListings = [
  {
    id: 1,
    name: "Yaba Comfort Apartment",
    type: "Apartment",
    price: 180000,
    rate: "per Year",
    location: "yaba",
    beds: 2,
    baths: 2,
    distance: "5 min walk",
    amenities: ["wifi", "laundry"],
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      "../images/apart3.jpg",
    ],
  },
  {
    id: 2,
    name: "Campus View Hostel",
    type: "Hostel",
    location: "main-campus",
    price: 120000,
    rate: "per Year",
    beds: 1,
    baths: 1,
    distance: "3 min walk",
    amenities: ["parking", "wifi"],
    images: ["../images/hostel.jpg", "../images/hostel2.jpg"],
  },
  {
    id: 3,
    name: "Bariga Villa",
    type: "Apartment",
    price: 200000,
    rate: "per Year",
    location: "bariga",
    beds: 3,
    baths: 2,
    distance: "7 min walk",
    amenities: ["pet", "laundry"],
    images: ["../images/apart.jpeg", "../images/apart2.jpg"],
  },
  {
    id: 4,
    name: "Main Campus Suites",
    type: "Apartment",
    location: "main-campus",
    price: 160000,
    beds: 3,
    baths: 2,
    distance: "10 mins Transport",
    rate: "per Year",
    amenities: ["wifi", "pet"],
    images: ["../images/apart2.jpg", "../images/apart.jpeg"],
  },
];

// Selectors
const toggleButtons = document.querySelectorAll(".toggle-btn");
const listingGrid = document.querySelector(".listing-grid");

// Function to Render Listings
function renderListings(data) {
  listingGrid.innerHTML = data
    .map(
      (item) => `
    <div class="listing-card" data-id="${item.id}">
      <div class="card-image">
        <div class="carousel">
          ${item.images
            .map(
              (img, i) =>
                `<img src="${img}" class="${i === 0 ? "active" : ""}" alt="${
                  item.name
                }">`
            )
            .join("")}
        </div>
        <button class="carousel-btn prev"><i class="fa-solid fa-chevron-left"></i></button>
        <button class="carousel-btn next"><i class="fa-solid fa-chevron-right"></i></button>
        <button class="wishlist"><i class="fa-regular fa-heart"></i></button>
      </div>

      <div class="card-content">
        <div class="card-header">
          <h3>${item.name}</h3>
          <span class="property-type">${item.type}</span>
        </div>
        <div class="card-price">
          ₦${item.price.toLocaleString()} <span>${item.rate}</span>
        </div>
        <div class="card-metrics">
          <div><i class="fa-solid fa-bed"></i> ${item.beds} Bed</div>
          <div><i class="fa-solid fa-bath"></i> ${item.baths} Bath</div>
          <div><i class="fa-solid fa-person-walking"></i> ${item.distance}</div>
        </div>
      </div>
    </div>`
    )
    .join("");

  document.querySelectorAll(".listing-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      localStorage.setItem("selectedPropertyId", id);
      window.location.href = "./hostelpdp.html"; // Redirect to Product Detail Page
    });
  });
  initCarousel();
}

// Initialize carousel buttons
function initCarousel() {
  document.querySelectorAll(".listing-card").forEach((card) => {
    const images = card.querySelectorAll(".carousel img");
    let index = 0;

    const showImage = (i) => {
      images.forEach((img) => img.classList.remove("active"));
      images[i].classList.add("active");
    };

    const prevBtn = card.querySelector(".carousel-btn.prev");
    const nextBtn = card.querySelector(".carousel-btn.next");
    if (!prevBtn || !nextBtn || images.length === 0) return;

    prevBtn.addEventListener("click", () => {
      index = (index - 1 + images.length) % images.length;
      showImage(index);
    });

    nextBtn.addEventListener("click", () => {
      index = (index + 1) % images.length;
      showImage(index);
    });
  });
}

// Initial render
renderListings(mockListings);

// Toggle view
toggleButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    toggleButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const view = btn.dataset.view;
    listingGrid.classList.toggle("list-view", view === "list");
  });
});

// === FILTER LOGIC ===
const minPrice = document.getElementById("minPrice");
const maxPrice = document.getElementById("maxPrice");
const minValue = document.getElementById("minValue");
const maxValue = document.getElementById("maxValue");
const bedButtons = document.querySelectorAll(".bed-btn");
const locationSelect = document.getElementById("location");
const amenitiesSelect = document.getElementById("amenities");

let filters = {
  location: "",
  minPrice: 50000,
  maxPrice: 200000,
  bedrooms: "",
  amenities: "",
};

const formatCurrency = (num) => parseInt(num).toLocaleString("en-NG");

function updatePriceDisplay() {
  let minVal = Math.min(
    parseInt(minPrice.value),
    parseInt(maxPrice.value) - 5000
  );
  let maxVal = Math.max(
    parseInt(maxPrice.value),
    parseInt(minPrice.value) + 5000
  );

  minPrice.value = minVal;
  maxPrice.value = maxVal;

  minValue.textContent = formatCurrency(minVal);
  maxValue.textContent = formatCurrency(maxVal);

  filters.minPrice = minVal;
  filters.maxPrice = maxVal;

  applyFilters();
}

minPrice.addEventListener("input", updatePriceDisplay);
maxPrice.addEventListener("input", updatePriceDisplay);

bedButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    bedButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    filters.bedrooms = btn.dataset.bed;
    applyFilters();
  });
});

locationSelect.addEventListener("change", (e) => {
  filters.location = e.target.value;
  applyFilters();
});

amenitiesSelect.addEventListener("change", (e) => {
  filters.amenities = e.target.value;
  applyFilters();
});

// === APPLY FILTERS ===
function applyFilters() {
  const filtered = mockListings.filter((item) => {
    const price = parseInt(item.price);
    return (
      (filters.location === "" || item.location === filters.location) &&
      price >= filters.minPrice &&
      price <= filters.maxPrice &&
      (filters.bedrooms === "" || item.beds >= parseInt(filters.bedrooms)) &&
      (filters.amenities === "" || item.amenities.includes(filters.amenities))
    );
  });

  renderListings(filtered);
  logFilters();
}

// === LOG FILTERS (for debugging) ===
function logFilters() {
  console.clear();
  console.log("Current Filters:");
  console.table(filters);
}
