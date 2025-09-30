// Toggle filter panel
const filterToggle = document.getElementById("filterToggle");
const filterPanel = document.getElementById("filterPanel");
const closeFilter = document.getElementById("closeFilter");

filterToggle.addEventListener("click", () => {
  filterPanel.classList.add("active");
});

closeFilter.addEventListener("click", () => {
  filterPanel.classList.remove("active");
});

// Collapsible filter sections
const filterSections = document.querySelectorAll(".filter-section button");

filterSections.forEach((button) => {
  button.addEventListener("click", () => {
    const section = button.parentElement;
    section.classList.toggle("active");
  });
});

const discoveryBar = document.querySelector(".discovery-bar");

discoveryBar.addEventListener("scroll", () => {
  let scrollX = discoveryBar.scrollLeft;
  discoveryBar.style.boxShadow =
    scrollX > 5 ? "inset 10px 0 10px -8px rgba(0,0,0,0.15)" : "none";
});

const track = document.querySelector(".carousel-track");
const cards = document.querySelectorAll(".carousel-card");
let index = 0;
const cardWidth = 210; // 200px card + 10px gap
const totalCards = cards.length;

// Clone the first few cards and append them at the end
cards.forEach((card) => {
  const clone = card.cloneNode(true);
  track.appendChild(clone);
});

function slideCarousel() {
  index++;
  track.style.transition = "transform 0.5s ease-in-out";
  track.style.transform = `translateX(-${index * cardWidth}px)`;

  // Reset position after reaching the last "real" card
  if (index === totalCards) {
    setTimeout(() => {
      track.style.transition = "none";
      track.style.transform = "translateX(0)";
      index = 0;
    }, 500); // wait for transition before resetting
  }
}

setInterval(slideCarousel, 3000); // auto-slide every 3s

// Product grid animation on scroll
const productCards = document.querySelectorAll(".product-card");

const productObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.1 }
);

productCards.forEach((card) => productObserver.observe(card));

const footer = document.getElementById("pageFooter");
const yearSpan = document.getElementById("year");

// Set dynamic year
yearSpan.textContent = new Date().getFullYear();

// Footer reveal on scroll (re-trigger each time it enters viewport)
const footerObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        footer.classList.add("visible");
      } else {
        footer.classList.remove("visible");
      }
    });
  },
  { threshold: 0.05 }
);

footerObserver.observe(footer);

// Mock products with complete details
export const allProducts = [
  {
    id: 1,
    name: "iPhone 15",
    price: "₦1,198,500",
    desc: "Apple iPhone 15 Pro Max - sleek titanium design with upgraded performance.",
    images: [
      "../images/Apple-iPhone-15-Pro-Max.jpg",
      "../images/iphone15-side.jpg",
      "../images/iphone15-back.jpg",
    ],
    seller: {
      name: "TechHub",
      store: "Apple Store",
      followers: 1245,
      story:
        "Passionate about bringing the latest Apple products to students at fair prices.",
      avatar: "../images/seller-techhub.jpg",
    },
    condition: "Refurbished",
    category: "Phones",
    specs: {
      dimensions: "159.9 x 76.7 x 8.3 mm",
      weight: "221g",
      material: "Titanium frame, Ceramic Shield front",
      storage: "256GB",
    },
    reviews: [
      {
        name: "Adeola",
        rating: 5,
        comment: "Excellent phone, worth every naira!",
      },
      {
        name: "Chukwuemeka",
        rating: 4,
        comment: "Battery life is solid but price is high.",
      },
    ],
  },
  {
    id: 2,
    name: "iPhone 16",
    price: "₦1,398,500",
    desc: "Apple iPhone 16 - cutting-edge performance and sleek curves.",
    images: [
      "../images/iphone 16.jpg",
      "../images/iphone16-side.jpg",
      "../images/iphone16-back.jpg",
    ],
    seller: {
      name: "TechHub",
      store: "Apple Store",
      followers: 1245,
      story:
        "Passionate about bringing the latest Apple products to students at fair prices.",
      avatar: "../images/seller-techhub.jpg",
    },
    condition: "New",
    category: "Phones",
    specs: {
      dimensions: "160.1 x 77.6 x 8.4 mm",
      weight: "223g",
      material: "Aluminum + Ceramic Shield",
      storage: "512GB",
    },
    reviews: [],
  },
  {
    id: 3,
    name: "iPhone 17",
    price: "₦1,498,500",
    desc: "Apple iPhone 17 - advanced camera technology with immersive display.",
    images: [
      "../images/iphone 17.jpeg",
      "../images/iphone17-side.jpg",
      "../images/iphone17-back.jpg",
    ],
    seller: {
      name: "TechHub",
      store: "Apple Store",
      followers: 1245,
      story:
        "Passionate about bringing the latest Apple products to students at fair prices.",
      avatar: "../images/seller-techhub.jpg",
    },
    condition: "New",
    category: "Phones",
    specs: {
      dimensions: "161 x 78 x 8.5 mm",
      weight: "226g",
      material: "Titanium frame, Ceramic Shield",
      storage: "1TB",
    },
    reviews: [],
  },
  {
    id: 4,
    name: "Samsung Galaxy S25 Ultra",
    price: "₦1,275,000",
    desc: "Samsung’s 2025 flagship with cutting-edge camera and S-Pen.",
    images: [
      "../images/s25ultra.png",
      "../images/s25ultra-back.jpg",
      "../images/s25ultra-side.jpg",
    ],
    seller: {
      name: "MobileWorld",
      store: "Samsung Outlet",
      followers: 860,
      story: "Your one-stop hub for Samsung devices and support.",
      avatar: "../images/seller-mobileworld.jpg",
    },
    condition: "New",
    category: "Phones",
    specs: {
      dimensions: "162.5 x 79.5 x 8.9 mm",
      weight: "233g",
      material: "Aluminum + Gorilla Glass Victus",
      storage: "512GB",
    },
    reviews: [
      {
        name: "Fatima",
        rating: 5,
        comment: "The camera zoom is unbelievable!",
      },
    ],
  },
  {
    id: 5,
    name: "Wireless Headphones",
    price: "₦15,000",
    desc: "Comfortable over-ear headphones with active noise cancellation.",
    images: ["../images/headphones.jpg", "../images/headphones-side.jpg"],
    seller: {
      name: "John Doe",
      store: "Tech Haven",
      followers: 210,
      story: "Student entrepreneur making tech affordable for peers.",
      avatar: "../images/seller-john.jpg",
    },
    condition: "New",
    category: "Electronics",
    specs: {
      dimensions: "Adjustable headband",
      weight: "270g",
      material: "Plastic + foam padding",
      battery: "30hrs playback",
    },
    reviews: [],
  },
  {
    id: 6,
    name: "Airpods",
    price: "₦9,500",
    desc: "Comfortable true wireless earbuds with clear sound.",
    images: ["../images/earbuds.jpg", "../images/earbuds-case.jpg"],
    seller: {
      name: "Jane Smith",
      store: "Gadget World",
      followers: 430,
      story: "Bringing affordable everyday gadgets to students.",
      avatar: "../images/seller-jane.jpg",
    },
    condition: "New",
    category: "Electronics",
    specs: {
      battery: "24hrs playback with case",
      weight: "4g each",
      material: "Plastic",
    },
    reviews: [],
  },
  {
    id: 7,
    name: "Smartwatch",
    price: "₦40,000",
    desc: "Track your fitness and stay connected on the go.",
    images: ["../images/smartwatch.jpg", "../images/smartwatch-side.jpg"],
    seller: {
      name: "Mike Johnson",
      store: "Wearables Hub",
      followers: 590,
      story: "Helping students stay fit with wearable tech.",
      avatar: "../images/seller-mike.jpg",
    },
    condition: "Refurbished",
    category: "Electronics",
    specs: {
      display: "1.8 inch AMOLED",
      battery: "5 days",
      material: "Aluminum",
      weight: "32g",
    },
    reviews: [],
  },
  {
    id: 8,
    name: "Laptop Bag",
    price: "₦3,000",
    desc: "Durable laptop bag with multiple compartments.",
    images: ["../images/lapbag.jpeg", "../images/lapbag-open.jpg"],
    seller: {
      name: "Emma Brown",
      store: "Bag World",
      followers: 175,
      story: "Passionate about affordable fashion accessories.",
      avatar: "../images/seller-emma.jpg",
    },
    condition: "New",
    category: "Others",
    specs: {
      dimensions: "15.6 inch compatible",
      weight: "450g",
      material: "Polyester",
    },
    reviews: [],
    sellerFollowers: 1245,
    sellerImage: "../images/guy.png",
    sellerStory:
      "Emma, a final-year student at UNILAG, designs affordable and stylish accessories to support students and professionals alike.",
  },

  {
    id: 9,
    name: "Wireless Earbuds",
    price: "₦12,000",
    desc: "Compact wireless earbuds — best seller of the week.",
    images: ["../images/earbuds.jpg", "../images/earbuds-case.jpg"],
    seller: {
      name: "ElectroShop",
      store: "Main Store",
      followers: 510,
      story: "All kinds of affordable electronics at your fingertips.",
      avatar: "../images/seller-electro.jpg",
    },
    condition: "New",
    category: "Electronics",
    specs: {
      battery: "20hrs playback",
      weight: "5g each",
      material: "Plastic",
    },
    reviews: [],
  },
  {
    id: 10,
    name: "Smart Backpack",
    price: "₦25,000",
    desc: "Hot trending smart backpack with USB charging port.",
    images: ["../images/Smart Backpack.jpg", "../images/backpack-open.jpg"],
    seller: {
      name: "UrbanGear",
      store: "Main Store",
      followers: 305,
      story: "Stylish, functional student fashion at unbeatable prices.",
      avatar: "../images/seller-urban.jpg",
    },
    condition: "New",
    category: "Others",
    specs: {
      dimensions: "Fits up to 17 inch laptops",
      weight: "900g",
      material: "Oxford fabric",
    },
    reviews: [],
  },
  {
    id: 11,
    name: "Classic Hoodie",
    price: "₦5,000",
    desc: "Cozy and stylish hoodie — best seller of the week.",
    images: ["../images/hoodie.jpg", "../images/hoodie-back.jpg"],
    seller: {
      name: "StyleHub",
      store: "Fashion Outlet",
      followers: 780,
      story: "Affordable everyday student fashion.",
      avatar: "../images/seller-stylehub.jpg",
    },
    condition: "New",
    category: "Clothing",
    specs: {
      sizes: "S, M, L, XL",
      material: "Cotton blend",
      weight: "350g",
    },
    reviews: [],
  },
  {
    id: 12,
    name: "Notebook Bundle",
    price: "₦4,000",
    desc: "Affordable bundle of 5 durable notebooks — trending pick.",
    images: ["../images/books.jpg", "../images/books-stack.jpg"],
    seller: {
      name: "BookWorld",
      store: "Book Store",
      followers: 220,
      story: "Helping students stay prepared with affordable stationery.",
      avatar: "../images/seller-bookworld.jpg",
    },
    condition: "New",
    category: "Books",
    specs: {
      pages: "200 each",
      material: "Premium paper",
    },
    reviews: [],
  },
  {
    id: 13,
    name: "Fitness Tracker",
    price: "₦15,000",
    desc: "Track steps, heart rate, and sleep — highly rated pick.",
    images: ["../images/fitness tracker.jpg", "../images/fitband-side.jpg"],
    seller: {
      name: "FitLife",
      store: "Fitness Shop",
      followers: 640,
      story: "Promoting health and wellness in student life.",
      avatar: "../images/seller-fitlife.jpg",
    },
    condition: "New",
    category: "Electronics",
    specs: {
      display: "1.2 inch OLED",
      battery: "7 days",
      weight: "25g",
    },
    reviews: [],
  },
];

const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
let searchForm = document.querySelector(".search-form");

// Select the main content wrapper (everything except filter/sort/footer should live here)
const mainContent = document.getElementById("mainContent");

// Hide search results by default
searchResults.style.display = "none";

// Render products dynamically
function renderProducts(products) {
  console.log("Rendering products:", products);

  // Show results container
  searchResults.style.display = "grid";

  if (products.length === 0) {
    searchResults.innerHTML = `
      <div class="no-results">
        <h2>Sorry, no results found</h2>
        <p>We couldn’t find any matches for your search.</p>
      </div>
    `;
    console.log("Displayed no results message");
    return;
  }

  searchResults.innerHTML = `
    <section class="search-grid">
      ${products
        .map(
          (product) => `
        <div class="search-card" data-product-id="${product.id}">
          <a href="product.html" class="search-link">
            <div class="search-image">
              <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="search-info">
              <h3>${product.name}</h3>
              <p>${product.price}</p>
            </div>
          </a>
          <div class="search-actions">
            <button class="quick-view" data-product-id="${product.id}">
              <i class="fas fa-eye"></i>
            </button>
            <button>
              <i class="fas fa-cart-plus"></i>
            </button>
          </div>
        </div>
      `
        )
        .join("")}
    </section>
  `;
}

// Handle quick view click (use the dynamic modal builder)
document.addEventListener("click", (e) => {
  if (e.target.closest(".quick-view")) {
    e.preventDefault();

    const btn = e.target.closest(".quick-view");
    const id = btn.getAttribute("data-product-id");
    console.log("[Quick View Clicked] Button:", btn, "Product ID:", id);

    const product = allProducts.find((p) => p.id == id);
    console.log("[Product Lookup] Result:", product);

    if (product) {
      openSearchModal(product); // ✅ always use the dynamic modal function
    } else {
      console.warn("[WARNING] No product found for ID:", id);
    }
  }
});

function openSearchModal(product) {
  // Remove any existing modal (prevents duplicates)
  const oldModal = document.getElementById("quickViewModal");
  if (oldModal) oldModal.remove();

  // Build modal HTML
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "quickViewModal";
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-modal" id="closeModal">&times;</span>
      <div class="modal-body">
        <div class="modal-image">
          <img id="modalProductImage" src="" alt="Product">
        </div>
        <div class="modal-details">
          <h2 id="modalProductName">Product Name</h2>
          <p class="modal-price" id="modalProductPrice">$0.00</p>
          <p class="modal-desc" id="modalProductDesc">Product description goes here...</p>
          <p><strong>Seller:</strong> <span id="modalSellerName">Seller Name</span></p>
          <p><strong>Store:</strong> <span id="modalStoreName">Store Name</span></p>
          <p><strong>Category:</strong> <span id="modalCategory">Category</span></p>
          <button class="message-btn">Message Seller</button>
        </div>
      </div>
    </div>
  `;

  // Append modal to body
  document.body.appendChild(modal);

  // Populate product details
  document.getElementById("modalProductImage").src = product.image || "";
  document.getElementById("modalProductImage").alt = product.name || "Product";
  document.getElementById("modalProductName").textContent =
    product.name || "Unnamed Product";
  document.getElementById("modalProductPrice").textContent =
    product.price || "$0.00";
  document.getElementById("modalProductDesc").textContent =
    product.desc || "No description available";
  document.getElementById("modalSellerName").textContent =
    product.seller || "Unknown";
  document.getElementById("modalStoreName").textContent =
    product.store || "N/A";
  document.getElementById("modalCategory").textContent =
    product.category || "N/A";

  // Show modal
  modal.style.display = "flex";

  // Close button
  document.getElementById("closeModal").addEventListener("click", () => {
    modal.remove();
  });

  // Close when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });

  // Message Seller button
  modal.querySelector(".message-btn").addEventListener("click", () => {
    console.log(`[Message] Seller contacted for: ${product.name}`);
    // You could add logic to open a chat box or redirect to messaging page
  });
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-to-cart");
  if (!btn) return; // safety

  e.preventDefault();
  const id = btn.getAttribute("data-product-id");
  const product = allProducts.find((p) => p.id == id);

  if (product) {
    addToCart(id); // use new function
  }
});

// Centralized search function
function runSearch() {
  const query = searchInput.value.toLowerCase().trim();
  console.log("Search query:", query);

  if (query === "") {
    console.log("Empty query, restoring main content");
    searchResults.innerHTML = "";
    searchResults.style.display = "none"; // hide when empty
    mainContent.style.display = "block";
    return;
  }

  const results = allProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(query) ||
      product.desc.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.store.toLowerCase().includes(query) ||
      product.seller.toLowerCase().includes(query)
  );

  console.log("Search results found:", results.length);

  // Hide original content, show only search results
  mainContent.style.display = "none";
  renderProducts(results);

  // Close/collapse search input after searching
  searchInput.blur();
  searchForm.classList.remove("active");
}

// Prevent form reload & handle Enter key
document.querySelector(".search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  console.log("Form submitted");
  runSearch();
});

// Handle click on 🔍 icon
document.querySelector(".search-form label").addEventListener("click", (e) => {
  e.preventDefault();
  console.log("Search icon clicked");
  runSearch();
});

// Mock product data
const products = {
  1: {
    name: "Wireless Headphones",
    price: "Price: $120",
    desc: "High-quality wireless headphones with noise cancellation.",
    image: "../images/headphones.jpg",
    seller: "John Doe",
    store: "Tech Haven",
    category: "Electronics",
    condition: "new",
  },
  2: {
    name: "Airpods",
    price: "$35",
    desc: "Comfortable true wireless earbuds with clear sound.",
    image: "../images/earbuds.jpg",
    seller: "Jane Smith",
    store: "Gadget World",
    category: "Electronics",
    condition: "new",
  },
  3: {
    name: "Smartwatch",
    price: "$99",
    desc: "Track your fitness and stay connected on the go.",
    image: "../images/smartwatch.jpg",
    seller: "Mike Johnson",
    store: "Wearables Hub",
    category: "Electronics",
    condition: "used",
  },
  4: {
    name: "Laptop Bag",
    price: "$5",
    desc: "Durable laptop bag with multiple compartments.",
    image: "../images/lapbag.jpeg",
    seller: "Emma Brown",
    store: "Bag World",
    category: "Others",
    condition: "refurbished",
  },
  5: {
    name: "iPhone 15",
    price: "$799",
    desc: "Apple iPhone 12 - sleek design",
    image: "../images/Apple-iPhone-15-Pro-Max.jpg",
    seller: "TechHub",
    store: "Apple Store",
    category: "Phones",
    condition: "used",
  },
  6: {
    name: "iPhone 16",
    price: "$899",
    desc: "Apple iPhone 13 - latest performance",
    image: "../images/iphone 16.jpg",
    seller: "TechHub",
    store: "Apple Store",
    category: "Phones",
    condition: "new",
  },
  7: {
    name: "iPhone 17",
    price: "$999",
    desc: "Apple iPhone 14 - new camera tech",
    image: "../images/iphone 17.jpeg",
    seller: "TechHub",
    store: "Apple Store",
    category: "Phones",
    condition: "new",
  },
  8: {
    name: "Samsung Galaxy S25 Ultra",
    price: "$850",
    desc: "A Brand new Samsung flagship with cutting-edge features and sleek design with pen support.",
    image: "../images/s25ultra.png",
    seller: "MobileWorld",
    store: "Samsung Outlet",
    category: "Phones",
    condition: "New",
  },
  9: {
    name: "Wireless Earbuds",
    price: "$29.99",
    desc: "Best seller of the week",
    image: "../images/earbuds.jpg",
    seller: "ElectroShop",
    store: "Main Store",
    category: "Electronics",
    condition: "new",
  },
  10: {
    name: "Smart Backpack",
    price: "$59.99",
    desc: "Hot trending item",
    image: "../images/Smart Backpack.jpg",
    seller: "UrbanGear",
    store: "Main Store",
    category: "Others",
    condition: "new",
  },
  11: {
    name: "Classic Hoodie",
    price: "$39.99",
    desc: "Best seller of the week",
    image: "../images/hoodie.jpg",
    seller: "StyleHub",
    store: "Fashion Outlet",
    category: "Fashion",
    condition: "refurbished",
  },
  12: {
    name: "Notebook Bundle",
    price: "$12.99",
    desc: "Hot trending item",
    image: "../images/books.jpg",
    seller: "BookWorld",
    store: "Book Store",
    category: "Books",
    condition: "new",
  },
  13: {
    name: "Fitness Tracker",
    price: "$45.00",
    desc: "Highly rated pick",
    image: "../images/fitness tracker.jpg",
    seller: "FitLife",
    store: "Fitness Shop",
    category: "Electronics",
    condition: "refurbished",
  },
  // Add more products here...
};

// Modal elements
const modal = document.getElementById("quickViewModal");
const closeModal = document.getElementById("closeModal");

const modalProductName = document.getElementById("modalProductName");
const modalProductPrice = document.getElementById("modalProductPrice");
const modalProductDesc = document.getElementById("modalProductDesc");
const modalProductImage = document.getElementById("modalProductImage");
const modalSellerName = document.getElementById("modalSellerName");
const modalStoreName = document.getElementById("modalStoreName");
const modalCategory = document.getElementById("modalCategory");

// Open modal
document.querySelectorAll(".quick-view").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const id = btn.getAttribute("data-product-id");
    const product = allProducts.find((p) => p.id == id);

    if (product) {
      modalProductName.textContent = product.name;
      modalProductPrice.textContent = product.price;
      modalProductDesc.textContent = product.desc;
      modalProductImage.src = product.image;
      modalSellerName.textContent = product.seller;
      modalStoreName.textContent = product.store;
      modalCategory.textContent = product.category;

      modal.style.display = "flex";
    }
  });
});

// Close modal
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

// Close when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

const sortSelect = document.getElementById("sortSelect");
const trendingCarousel = document.querySelector(".trending-carousel");

// Handle sorting
sortSelect.addEventListener("change", () => {
  const value = sortSelect.value;
  let sortedProducts = [...allProducts];

  if (value === "price-low") {
    sortedProducts.sort(
      (a, b) =>
        parseFloat(a.price.replace(/[^0-9.]/g, "")) -
        parseFloat(b.price.replace(/[^0-9.]/g, ""))
    );
  } else if (value === "price-high") {
    sortedProducts.sort(
      (a, b) =>
        parseFloat(b.price.replace(/[^0-9.]/g, "")) -
        parseFloat(a.price.replace(/[^0-9.]/g, ""))
    );
  } else if (value === "newest") {
    sortedProducts.sort((a, b) => b.id - a.id);
  } else if (value === "oldest") {
    sortedProducts.sort((a, b) => a.id - b.id);
  }

  // Hide trending carousel & main content
  if (trendingCarousel) trendingCarousel.style.display = "none";
  mainContent.style.display = "none";

  // Reuse search results renderer
  renderProducts(sortedProducts);
});

const filterCheckboxes = document.querySelectorAll(
  ".filter-section input[type='checkbox']"
);

filterCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", applyFilters);
});

function applyFilters() {
  let filteredProducts = [...allProducts];

  // --- Category filter ---
  const selectedCategories = Array.from(
    document.querySelectorAll("input[name='category']:checked")
  ).map((cb) => cb.value.toLowerCase());

  if (selectedCategories.length > 0) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.category &&
        selectedCategories.includes(product.category.toLowerCase())
    );
  }

  // --- Condition filter ---
  const selectedConditions = Array.from(
    document.querySelectorAll("input[name='condition']:checked")
  ).map((cb) => cb.value.toLowerCase());

  if (selectedConditions.length > 0) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.condition &&
        selectedConditions.includes(product.condition.toLowerCase())
    );
  }

  // --- Price filter ---
  const selectedPrices = Array.from(
    document.querySelectorAll("input[name='price']:checked")
  ).map((cb) => cb.value);

  if (selectedPrices.length > 0) {
    filteredProducts = filteredProducts.filter((product) => {
      const price = parseFloat(product.price.replace(/[^0-9.]/g, ""));
      return selectedPrices.some((range) => {
        if (range === "under-50") return price < 50;
        if (range === "50-100") return price >= 50 && price <= 100;
        if (range === "100-200") return price >= 100 && price <= 200;
        if (range === "above-200") return price > 200;
      });
    });
  }

  // --- Fallback: if NO filters at all, reset to all ---
  if (
    selectedCategories.length === 0 &&
    selectedPrices.length === 0 &&
    selectedConditions.length === 0
  ) {
    filteredProducts = [...allProducts];
  }

  // Hide trending + main content
  const trending = document.querySelector(".trending-carousel");
  if (trending) trending.style.display = "none";
  mainContent.style.display = "none";

  // Render filtered results
  renderProducts(filteredProducts);
}

// ==========================
// CART LOGIC (localStorage)
// ==========================
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Add product to cart
function addToCart(productId) {
  const cart = getCart();
  const product = allProducts.find((p) => p.id == productId);

  if (!product) {
    console.warn("Product not found for ID:", productId);
    return;
  }

  // Check if already in cart
  const existing = cart.find((item) => item.id == productId);
  if (existing) {
    existing.quantity += 1; // increment
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
  console.log("Cart updated:", cart);

  // Optional: show a toast/alert
  alert(`${product.name} added to cart!`);
}

// Remove product from cart
function removeFromCart(productId) {
  let cart = getCart().filter((item) => item.id != productId);
  saveCart(cart);
  console.log("Item removed. Updated cart:", cart);
}
