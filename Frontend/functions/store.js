// Mock sellers
const sellers = [
  {
    id: 1,
    name: "TechHub",
    bio: "Passionate about bringing the latest Apple products to students at fair prices.",
    banner: "../images/banner.jpg",
    logo: "../images/banner.jpg",
    sold: 320,
    rating: "★★★★★",
    category: ["Phones"],
    products: [
      {
        id: 1,
        name: "iPhone 15",
        price: "₦1,198,500",
        image: "../images/Apple-iPhone-15-Pro-Max.jpg",
      },
      {
        id: 2,
        name: "iPhone 16",
        price: "₦1,398,500",
        image: "../images/iphone 16.jpg",
      },
      {
        id: 3,
        name: "iPhone 17",
        price: "₦1,498,500",
        image: "../images/iphone 17.jpeg",
      },
    ],
  },
  {
    id: 2,
    name: "MobileWorld",
    bio: "Your one-stop hub for Samsung devices and support.",
    banner: "../images/banner.jpg",
    logo: "../images/banner.jpg",
    sold: 185,
    rating: "★★★★☆",
    category: ["Phones"],
    products: [
      {
        id: 4,
        name: "Samsung Galaxy S25 Ultra",
        price: "₦1,275,000",
        image: "../images/s25ultra.png",
      },
    ],
  },
  {
    id: 3,
    name: "John Doe",
    bio: "Student entrepreneur making tech affordable for peers.",
    banner: "../images/banner.jpg",
    logo: "../images/banner.jpg",
    sold: 95,
    rating: "★★★☆☆",
    category: ["Electronics"],
    products: [
      {
        id: 5,
        name: "Wireless Headphones",
        price: "₦15,000",
        image: "../images/headphones.jpg",
      },
    ],
  },
  {
    id: 4,
    name: "Jane Smith",
    bio: "Bringing affordable everyday gadgets to students.",
    banner: "../images/banner.jpg",
    logo: "../images/banner.jpg",
    sold: 140,
    rating: "★★★★☆",
    category: ["Electronics"],
    products: [
      {
        id: 6,
        name: "Airpods",
        price: "₦9,500",
        image: "../images/earbuds.jpg",
      },
    ],
  },
  {
    id: 5,
    name: "Mike Johnson",
    bio: "Helping students stay fit with wearable tech.",
    banner: "../images/banner.jpg",
    logo: "../images/banner.jpg",
    sold: 70,
    rating: "★★★★☆",
    category: ["Electronics"],
    products: [
      {
        id: 7,
        name: "Smartwatch",
        price: "₦40,000",
        image: "../images/smartwatch.jpg",
      },
    ],
  },
  {
    id: 6,
    name: "Emma Brown",
    bio: "Passionate about affordable fashion accessories.",
    banner: "../images/banner.jpg",
    logo: "../images/banner.jpg",
    sold: 60,
    rating: "★★★☆☆",
    category: ["Accessories"],
    products: [
      {
        id: 8,
        name: "Laptop Bag",
        price: "₦3,000",
        image: "../images/lapbag.jpeg",
      },
    ],
  },
  {
    id: 7,
    name: "ElectroShop",
    bio: "All kinds of affordable electronics at your fingertips.",
    banner: "../images/banner.jpg",
    logo: "../images/banner.jpg",
    sold: 210,
    rating: "★★★★☆",
    category: ["Electronics"],
    products: [
      {
        id: 9,
        name: "Wireless Earbuds",
        price: "₦12,000",
        image: "../images/earbuds.jpg",
      },
    ],
  },
  {
    id: 8,
    name: "UrbanGear",
    bio: "Stylish, functional student fashion at unbeatable prices.",
    banner: "../images/banner.jpg",
    logo: "../images/banner.jpg",
    sold: 120,
    rating: "★★★★☆",
    category: ["Accessories"],
    products: [
      {
        id: 10,
        name: "Smart Backpack",
        price: "₦25,000",
        image: "../images/Smart Backpack.jpg",
      },
    ],
  },
  {
    id: 9,
    name: "StyleHub",
    bio: "Affordable everyday student fashion.",
    banner: "../images/banner.jpg",
    logo: "../images/banner.jpg",
    sold: 80,
    rating: "★★★☆☆",
    category: ["Fashion"],
    products: [
      {
        id: 11,
        name: "Classic Hoodie",
        price: "₦5,000",
        image: "../images/hoodie.jpg",
      },
    ],
  },
  {
    id: 10,
    name: "BookWorld",
    bio: "Helping students stay prepared with affordable stationery.",
    banner: "../images/banner.jpg",
    logo: "../images/banner.jpg",
    sold: 55,
    rating: "★★★★☆",
    category: ["Books"],
    products: [
      {
        id: 12,
        name: "Notebook Bundle",
        price: "₦4,000",
        image: "../images/books.jpg",
      },
    ],
  },
  {
    id: 11,
    name: "FitLife",
    bio: "Promoting health and wellness in student life.",
    banner: "../images/banner.jpg",
    logo: "../images/banner.jpg",
    sold: 95,
    rating: "★★★★☆",
    category: ["Electronics"],
    products: [
      {
        id: 13,
        name: "Fitness Tracker",
        price: "₦15,000",
        image: "../images/fitness tracker.jpg",
      },
    ],
  },
];

document.addEventListener("DOMContentLoaded", () => {
  console.log("store.js is loaded");

  // Check if this page has a seller grid (store listing)
  const grid = document.getElementById("storeGrid");
  if (grid) {
    displaySellers(sellers, grid);
  }

  // Check if this page has a seller profile (seller.html)
  const container = document.getElementById("sellerProfile");
  if (container) {
    const params = new URLSearchParams(window.location.search);
    const sellerId = parseInt(params.get("id"));
    console.log("Seller ID from URL:", sellerId);

    const seller = sellers.find((s) => s.id === sellerId);
    console.log("Seller found:", seller);

    if (seller) {
      renderSellerProfile(seller, container);
    } else {
      console.warn("Seller not found!");
    }
  }
});

// Functions
function displaySellers(list, grid) {
  grid.innerHTML = list
    .map(
      (s) => `
      <a href="seller.html?id=${s.id}" class="store-card">
        <img src="${s.logo}" alt="${s.name}" class="store-avatar" />
        <h3 class="store-name">${s.name}</h3>
        <div class="store-stats">⭐ ${s.rating}</div>
      </a>
    `
    )
    .join("");
}

function renderSellerProfile(seller, container) {
  container.innerHTML = `
    <section class="seller-header">
      <img src="${seller.banner}" alt="${
    seller.name
  } Banner" class="store-banner" />
      <div class="seller-info">
        <img src="${seller.logo}" alt="${
    seller.name
  } Logo" class="seller-avatar" />
        <h2 class="seller-name">${seller.name}</h2>
        <p class="seller-bio">${seller.bio}</p>
        <button class="contact-btn">Contact Seller</button>
        <div class="seller-stats">
          <div>Items Sold: ${seller.sold}</div>
          <div>Rating: ${seller.rating}</div>
        </div>
      </div>
    </section>

    <section class="seller-products">
      <h3>Available Products</h3>
      <div class="seller-grid">
        ${seller.products
          .map(
            (p) => `
            <div class="seller-card" data-product-id="${p.id}">
              <a href="products.html?id=${p.id}" class="product-link">
                <div class="seller-product-card">
                  <img src="${p.image}" alt="${p.name}">
                    <div class="seller-product-action">
                        <button class="quick-view" data-product-id="12"><i class="fas fa-eye"></i></button>
                        <button class="add-to-cart" data-product-id="12"><i class="fas fa-cart-plus"></i></button>
                    </div>
                </div>
                <div class="seller-product-info">
                  <h3>${p.name}</h3>
                  <p>${p.price}</p>
                </div>
              </a>
            </div>
          `
          )
          .join("")}
      </div>
    </section>
  `;
}

// === Store search (updated class names to match your CSS) ===
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults"); // <div id="searchResults" class="store-search-grid"></div>
  const storeDirectory = document.querySelector(".store-directory"); // wrapper to hide when searching

  if (!searchInput || !searchResults) return; // nothing to do on other pages

  // Ensure the container has the CSS class we expect
  if (!searchResults.classList.contains("store-search-grid")) {
    searchResults.classList.add("store-search-grid");
  }

  // hide results by default
  searchResults.style.display = "none";

  function renderSellers(results) {
    // hide the default directory while searching
    if (storeDirectory) storeDirectory.style.display = "none";

    // show results container
    searchResults.style.display = "grid"; // your CSS expects a grid on .store-search-grid

    if (!results || results.length === 0) {
      searchResults.innerHTML = `
        <div class="no-results">
          <h2>Sorry, no sellers found</h2>
          <p>We couldn’t find any matches for your search.</p>
        </div>
      `;
      return;
    }

    // build the seller cards using the CSS classes you defined
    searchResults.innerHTML = results
      .map(
        (s) => `
      <div class="search-card" data-seller-id="${s.id}">
        <a href="seller.html?id=${s.id}" class="search-link">
          <div class="search-image">
            <img src="${s.logo}" alt="${s.name}">
          </div>
          <div class="search-info">
            <h3>${s.name}</h3>
            <p>${s.bio ? s.bio : ""}</p>
            <small>⭐ ${s.rating} • ${s.sold ?? 0} sold</small>
          </div>
        </a>
      </div>
    `
      )
      .join("");
  }

  // Input listener: when user types, hide the directory and show filtered results.
  searchInput.addEventListener("input", (e) => {
    const term = e.target.value.trim().toLowerCase();

    if (term === "") {
      // show default directory again
      if (storeDirectory) storeDirectory.style.display = ""; // resets to stylesheet
      searchResults.style.display = "none";
      searchResults.innerHTML = "";
      return;
    }

    // filter sellers by name, tag or bio
    const filtered = sellers.filter((s) => {
      const name = s.name?.toLowerCase() ?? "";
      const tag = (s.tag ?? "").toLowerCase();
      const bio = (s.bio ?? "").toLowerCase();
      return name.includes(term) || tag.includes(term) || bio.includes(term);
    });

    renderSellers(filtered);
  });

  // Optional: handle Enter (submit) so pressing Enter behaves same as typing
  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      const term = e.target.value.trim().toLowerCase();
      if (term !== "") {
        const filtered = sellers.filter((s) => {
          const name = s.name?.toLowerCase() ?? "";
          const tag = (s.tag ?? "").toLowerCase();
          const bio = (s.bio ?? "").toLowerCase();
          return (
            name.includes(term) || tag.includes(term) || bio.includes(term)
          );
        });
        renderSellers(filtered);
      }
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  console.log("store.js is loaded");

  const storeGrid = document.getElementById("storeGrid");
  const filterBtns = document.querySelectorAll(".filter-btn");

  // Function to render sellers
  function renderSellers(sellersToRender) {
    storeGrid.innerHTML = sellersToRender
      .map(
        (seller) => `
      <div class="store-card" data-id="${seller.id}">
        <img src="${seller.logo || "../images/guy.png"}" 
     alt="${seller.name}" 
     class="store-avatar">

        <h3 class="store-name">${seller.name}</h3>
        <p class="store-stats">${seller.products.length} products</p>
        <span class="store-tag">${seller.category}</span>
      </div>
    `
      )
      .join("");
  }

  // Initially show all sellers
  renderSellers(sellers);

  // Filter button clicks
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category;

      if (category === "all") {
        renderSellers(sellers);
      } else {
        const filtered = sellers.filter(
          (s) => s.category.toLowerCase() === category.toLowerCase()
        );
        renderSellers(filtered);
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const filterToggle = document.getElementById("Toggle");
  const filterPanel = document.getElementById("Panel");
  const closePanel = document.getElementById("closePanel");

  if (!filterToggle || !filterPanel || !closePanel) {
    console.error("❌ One or more elements not found in DOM");
    return;
  }

  // Toggle panel with main button
  filterToggle.addEventListener("click", () => {
    filterPanel.classList.toggle("active");
    filterToggle.textContent = filterPanel.classList.contains("active")
      ? "✖ Close Filters"
      : "☰ Filters";
  });

  // Close panel with close button
  closePanel.addEventListener("click", () => {
    filterPanel.classList.remove("active");
    filterToggle.textContent = "☰ Filters";
  });

  // Optional: click outside to close
  document.addEventListener("click", (e) => {
    if (
      filterPanel.classList.contains("active") &&
      !filterPanel.contains(e.target) &&
      !filterToggle.contains(e.target)
    ) {
      filterPanel.classList.remove("active");
      filterToggle.textContent = "☰ Filters";
    }
  });
});
