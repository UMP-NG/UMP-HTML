let originalImageSrc = null;

window.onload = function () {
  const mainImage = document.getElementById("mainImg");
  if (mainImage) {
    originalImageSrc = mainImage.src;
  }
};

function switchImage(el) {
  const mainImage = document.getElementById("mainImg");
  if (!mainImage) return;

  // Change to clicked thumbnail
  mainImage.src = el.src;

  // After 3s revert back to original
  setTimeout(() => {
    mainImage.src = originalImageSrc;
  }, 5000);
}

function addToCart(btn) {
  btn.classList.add("btn-processing");
  btn.textContent = "Processing...";
  setTimeout(() => {
    btn.classList.remove("btn-processing");
    btn.textContent = "Add to Cart";
    alert("Item added to cart ✅");
  }, 1500);
}

// 🔹 Swatch selector function
function selectSwatch(el) {
  // remove 'active' from all
  document
    .querySelectorAll(".swatch")
    .forEach((s) => s.classList.remove("active"));

  // add 'active' to clicked one
  el.classList.add("active");

  // get chosen color
  let selectedColor = el.getAttribute("data-color");
  console.log("Selected color:", selectedColor);

  // update UI if placeholder exists
  let label = document.getElementById("selected-color-label");
  if (label) {
    label.innerText = selectedColor;
  }
}

// Expose functions globally (so inline onclick works)
window.switchImage = switchImage;
window.selectSwatch = selectSwatch;

// Tab switching with animation
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Remove active state
    tabButtons.forEach((b) => b.classList.remove("active"));
    tabContents.forEach((c) => c.classList.remove("active"));

    // Activate clicked tab
    btn.classList.add("active");
    const target = btn.getAttribute("data-tab");
    document.getElementById(target).classList.add("active");
  });
});

// Example follow button toggle
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("follow-btn")) {
    if (e.target.textContent.includes("Follow")) {
      e.target.textContent = "✓ Following";
    } else {
      e.target.textContent = "+ Follow";
    }
  }
});

(function () {
  document.querySelectorAll(".rel-carousel-track").forEach((track) => {
    let isMouseDown = false;
    let startX = 0;
    let startScrollLeft = 0;

    // ---- Mouse drag support (desktop) ----
    track.addEventListener("mousedown", (e) => {
      isMouseDown = true;
      track.classList.add("dragging");
      startX = e.pageX - track.offsetLeft;
      startScrollLeft = track.scrollLeft;
    });

    window.addEventListener("mouseup", () => {
      if (isMouseDown) {
        isMouseDown = false;
        track.classList.remove("dragging");
      }
    });

    track.addEventListener("mousemove", (e) => {
      if (!isMouseDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5; // drag sensitivity
      track.scrollLeft = startScrollLeft - walk;
    });

    // ---- Touch support (mobile/tablet) ----
    let touchStartX = 0;
    let touchStartScroll = 0;

    track.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length !== 1) return; // only single-finger drag
        touchStartX = e.touches[0].pageX - track.offsetLeft;
        touchStartScroll = track.scrollLeft;
      },
      { passive: true }
    );

    track.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches.length !== 1) return;
        const x = e.touches[0].pageX - track.offsetLeft;
        const walk = (x - touchStartX) * 1.5;
        track.scrollLeft = touchStartScroll - walk;
      },
      { passive: true }
    );
  });
})();

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
    colors: ["Black", "Silver", "Blue"],
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
    colors: ["Gold", "Graphite", "White"],
    condition: "New",
    category: "Phones",
    specs: {
      dimensions: "160.1 x 77.6 x 8.4 mm",
      weight: "223g",
      material: "Aluminum + Ceramic Shield",
      storage: "512GB",
    },
    reviews: [
      {
        name: "Tosin",
        rating: 5,
        comment: "Smoother and faster than my iPhone 14 Pro.",
      },
    ],
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
    colors: ["Titanium Black", "Deep Blue", "Rose Gold"],
    condition: "New",
    category: "Phones",
    specs: {
      dimensions: "161 x 78 x 8.5 mm",
      weight: "226g",
      material: "Titanium frame, Ceramic Shield",
      storage: "1TB",
    },
    reviews: [
      {
        name: "Zainab",
        rating: 5,
        comment: "The best display I’ve ever seen on a phone.",
      },
    ],
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
    colors: ["Phantom Black", "Green", "Lavender"],
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
      {
        name: "Ibrahim",
        rating: 4,
        comment: "Great phone but a little heavy.",
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
    colors: ["Black", "White", "Red"],
    condition: "New",
    category: "Electronics",
    specs: {
      dimensions: "Adjustable headband",
      weight: "270g",
      material: "Plastic + foam padding",
      battery: "30hrs playback",
    },
    reviews: [
      { name: "Seyi", rating: 4, comment: "Nice bass and comfortable fit." },
    ],
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
    colors: ["White"],
    condition: "New",
    category: "Electronics",
    specs: {
      battery: "24hrs playback with case",
      weight: "4g each",
      material: "Plastic",
    },
    reviews: [
      { name: "Daniel", rating: 5, comment: "Affordable and works perfectly!" },
    ],
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
    colors: ["Black", "Silver"],
    condition: "Refurbished",
    category: "Electronics",
    specs: {
      display: "1.8 inch AMOLED",
      battery: "5 days",
      material: "Aluminum",
      weight: "32g",
    },
    reviews: [
      { name: "Kemi", rating: 4, comment: "Good smartwatch for the price." },
    ],
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
      story:
        "Emma, a final-year student at UNILAG, designs affordable and stylish accessories to support students and professionals alike.",
      avatar: "../images/seller-emma.jpg",
    },
    colors: ["Black", "Grey", "Navy Blue"],
    condition: "New",
    category: "Others",
    specs: {
      dimensions: "15.6 inch compatible",
      weight: "450g",
      material: "Polyester",
    },
    reviews: [
      {
        name: "Kunle",
        rating: 5,
        comment: "Strong material and very spacious.",
      },
    ],
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
    colors: ["Black", "White"],
    condition: "New",
    category: "Electronics",
    specs: {
      battery: "20hrs playback",
      weight: "5g each",
      material: "Plastic",
    },
    reviews: [
      {
        name: "Aisha",
        rating: 4,
        comment: "Good sound, case feels a bit cheap.",
      },
    ],
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
    colors: ["Black", "Grey"],
    condition: "New",
    category: "Others",
    specs: {
      dimensions: "Fits up to 17 inch laptops",
      weight: "900g",
      material: "Oxford fabric",
    },
    reviews: [
      {
        name: "Chidera",
        rating: 5,
        comment: "Super stylish and useful for school.",
      },
    ],
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
    colors: ["Black", "Grey", "Red"],
    condition: "New",
    category: "Clothing",
    specs: {
      sizes: "S, M, L, XL",
      material: "Cotton blend",
      weight: "350g",
    },
    reviews: [
      { name: "Precious", rating: 5, comment: "Very soft and fits perfectly." },
    ],
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
    colors: [],
    condition: "New",
    category: "Books",
    specs: {
      pages: "200 each",
      material: "Premium paper",
    },
    reviews: [
      { name: "Femi", rating: 4, comment: "Great value for the price." },
    ],
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
    colors: ["Black", "Blue", "Pink"],
    condition: "New",
    category: "Electronics",
    specs: {
      display: "1.2 inch OLED",
      battery: "7 days",
      weight: "25g",
    },
    reviews: [
      {
        name: "Ngozi",
        rating: 5,
        comment: "Really helps me track my fitness goals.",
      },
    ],
  },
];

// ===== GET PRODUCT ID FROM URL =====
const params = new URLSearchParams(window.location.search);
const productId = parseInt(params.get("id"));
const product = allProducts.find((p) => p.id === productId);

if (!product) {
  alert("Product not found!");
  window.location.href = "./market.html";
}

// ===== POPULATE PRODUCT INFO =====
if (product) {
  // Breadcrumb
  const breadcrumbName = document.getElementById("breadcrumb-name");
  if (breadcrumbName) breadcrumbName.textContent = product.name;

  // Main info
  const productName = document.getElementById("product-name");
  if (productName) productName.textContent = product.name;

  const productPrice = document.getElementById("product-price");
  if (productPrice) productPrice.textContent = product.price;

  const productDesc = document.getElementById("product-desc");
  if (productDesc) productDesc.textContent = product.desc;

  const productCondition = document.getElementById("product-condition");
  if (productCondition) productCondition.textContent = product.condition;

  // Sold by (store name)
  const productSeller = document.getElementById("product-seller");
  if (productSeller) productSeller.textContent = product.seller.store;

  // Seller info
  const sellerName = document.getElementById("seller-name");
  if (sellerName) sellerName.textContent = product.seller.name;

  const sellerFollowers = document.getElementById("seller-followers");
  if (sellerFollowers)
    sellerFollowers.textContent =
      (product.seller.followers
        ? product.seller.followers.toLocaleString()
        : "0") + " followers";

  const sellerPhoto = document.getElementById("seller-photo");
  if (sellerPhoto)
    sellerPhoto.src = product.seller.avatar || "../images/guy.png";

  const sellerStory = document.getElementById("seller-story");
  if (sellerStory)
    sellerStory.textContent =
      product.seller.story || "This seller hasn’t added a story yet.";

  // Main image
  const mainImg = document.getElementById("product-img");
  if (mainImg && product.images && product.images.length > 0)
    mainImg.src = product.images[0];

  // Thumbnails
  const thumbnailsContainer = document.getElementById("product-thumbnails");
  if (thumbnailsContainer && product.images && product.images.length > 0) {
    thumbnailsContainer.innerHTML = "";
    product.images.forEach((imgSrc, idx) => {
      const thumb = document.createElement("img");
      thumb.src = imgSrc;
      thumb.alt = `Thumbnail ${idx + 1}`;
      thumb.addEventListener("click", () => {
        if (mainImg) mainImg.src = imgSrc;
      });
      thumbnailsContainer.appendChild(thumb);
    });
  }

  // Swatches / Colors
  const swatchesContainer = document.getElementById("product-swatches");
  if (swatchesContainer) {
    swatchesContainer.innerHTML = "";
    const colors =
      product.colors && product.colors.length > 0
        ? product.colors
        : ["Default"];
    colors.forEach((color) => {
      const swatch = document.createElement("div");
      swatch.className = "swatch";
      swatch.style.backgroundColor = color.toLowerCase();
      swatch.dataset.color = color;
      swatch.addEventListener("click", () => {
        const label = document.getElementById("selected-color-label");
        if (label) label.textContent = color;
      });
      swatchesContainer.appendChild(swatch);
    });
  }

  // Specifications
  const specsTable = document.getElementById("product-specs");
  if (specsTable && product.specs) {
    specsTable.innerHTML = "";
    for (const [key, value] of Object.entries(product.specs)) {
      const row = document.createElement("tr");
      row.innerHTML = `<td><b>${key}</b></td><td>${value}</td>`;
      specsTable.appendChild(row);
    }
  }

  // Reviews
  const reviewsList = document.getElementById("reviews-list");
  if (reviewsList) {
    reviewsList.innerHTML = "";
    if (product.reviews && product.reviews.length > 0) {
      // Compute average rating
      const avgRating =
        product.reviews.reduce((sum, r) => sum + r.rating, 0) /
        product.reviews.length;

      const productRating = document.getElementById("product-rating");
      if (productRating)
        productRating.innerHTML = `<span>${"★".repeat(
          Math.round(avgRating)
        )}${"☆".repeat(5 - Math.round(avgRating))}</span> ${avgRating.toFixed(
          1
        )}/5`;

      // Render each review
      product.reviews.forEach((rev) => {
        const div = document.createElement("div");
        div.className = "review";
        div.innerHTML = `
          <p><b>${rev.name}:</b> <span class="review-stars">${"★".repeat(
          rev.rating
        )}${"☆".repeat(5 - rev.rating)}</span></p>
          <p>${rev.comment}</p>
        `;
        reviewsList.appendChild(div);
      });
    } else {
      const productRating = document.getElementById("product-rating");
      if (productRating) productRating.textContent = "No ratings yet";
    }
  }
}

// Make selected tab fully visible on mobile
document.querySelectorAll(".tab-btn").forEach((tab) => {
  tab.addEventListener("click", () => {
    tab.scrollIntoView({ behavior: "smooth", inline: "center" });
  });
});
