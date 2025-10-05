// Tabs
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
    reviews: [
      { stars: 5, name: "Tunde", year: 2024, text: "Comfortable and quiet." },
      { stars: 4, name: "Ada", year: 2023, text: "Clean but Wi-Fi could be faster." },
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
    reviews: [
      { stars: 5, name: "Bolu", year: 2024, text: "Best value for students." },
    ],
  },
];

// Get property from storage
const propertyId = localStorage.getItem("selectedPropertyId") || 1;
const property = mockListings.find((item) => item.id == propertyId);

if (property) {
  // Header
  document.getElementById("propertyLocation").textContent = property.location.replace("-", " ");
  document.getElementById("propertyName").textContent = property.name;
  document.getElementById("propertyTitle").textContent = property.name;
  document.getElementById("propertyPrice").textContent = `₦${property.price.toLocaleString()}`;
  document.getElementById("propertyRate").textContent = property.rate;

  // Basic Info
  document.getElementById("bedrooms").textContent = property.beds;
  document.getElementById("bathrooms").textContent = property.baths;
  document.getElementById("distance").textContent = property.distance;

  // Description
  document.getElementById(
    "propertyDesc"
  ).textContent = `${property.name} is a ${property.type.toLowerCase()} located in ${property.location}. It offers ${property.beds} bedrooms and ${property.baths} bathrooms, ideal for comfortable living.`;

  // Images
  const mainImage = document.getElementById("mainImage");
  const thumbnailRow = document.getElementById("thumbnailRow");
  mainImage.src = property.images[0];
  thumbnailRow.innerHTML = property.images
    .map((img) => `<img src="${img}" alt="${property.name}" class="thumbnail" />`)
    .join("");

  document.querySelectorAll(".thumbnail").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      mainImage.src = thumb.src;
      document.querySelectorAll(".thumbnail").forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");
    });
  });

  // Amenities (right column)
  const amenityList = document.getElementById("amenityList");
  amenityList.innerHTML = property.amenities
    .map(
      (a) => `<div class="amenity"><i class="fa fa-check"></i><span>${a.toUpperCase()}</span></div>`
    )
    .join("");

  // Location Map
  document.getElementById(
    "propertyMap"
  ).src = `https://www.google.com/maps?q=${property.location}&output=embed`;

  // Amenities Tab
  document.getElementById("amenitiesTab").innerHTML = `
    <ul>${property.amenities.map((a) => `<li>${a}</li>`).join("")}</ul>
  `;

  // Reviews Tab
  const reviewContainer = document.getElementById("reviewContainer");
  reviewContainer.innerHTML = property.reviews
    .map(
      (r) => `
        <div class="review">
          <div class="review-header">
            <span class="stars">${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</span>
            <span class="reviewer">— ${r.name}, ${r.year}</span>
          </div>
          <p>“${r.text}”</p>
        </div>
      `
    )
    .join("");
}
