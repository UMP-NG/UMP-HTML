const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ump-html-1.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          console.log("🟢 Card became visible:", entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 } // triggers when 20% of card is visible
  );

  // Function to observe all current cards
  function observeCards() {
    const cards = document.querySelectorAll(".product-card, .search-card");
    cards.forEach((card) => {
      if (!card.classList.contains("observed")) {
        observer.observe(card);
        card.classList.add("observed"); // avoid double-observing
        console.log("👀 Observing new card:", card);
      }
    });
    console.log(`✅ Now observing ${cards.length} cards for reveal animation.`);
  }

  // Initial observation
  observeCards();

  // Re-run when new cards are dynamically added (via search, pagination, etc.)
  const mutationObserver = new MutationObserver(() => {
    observeCards();
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
});

let allProducts = [];

// --- ✅ HTML escape helper ---
function escapeHTML(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// defensive: if these are missing, create safe no-op references
const safeSearchResults = () => document.getElementById("searchResults");
const safeMainContent = () => document.querySelector("product-grid");

// Hide results initially (guarded)
const _sr = safeSearchResults();
if (_sr) _sr.style.display = "none";

/**
 * showFallback(message, subtext)
 * - Displays a friendly empty/error state in the searchResults container.
 */
function showFallback(
  message = "No items",
  subtext = "Please try again later."
) {
  const results = safeSearchResults();
  if (!results) {
    console.warn("showFallback: #searchResults not found. Message:", message);
    return;
  }

  results.style.display = "grid";
  results.innerHTML = `
    <div class="no-results" style="text-align:center;padding:30px;">
      <img src="../images/empty.png" alt="Empty" style="width:120px;opacity:0.8;margin-bottom:12px;">
      <h2 style="margin:6px 0 4px;">${escapeHTML(message)}</h2>
      <p style="margin:0;color:#6b7280;">${escapeHTML(subtext)}</p>
    </div>
  `;

  const main = safeMainContent();
  if (main) main.style.display = "none";
}

// Small helper to clear fallback and show main content again
function clearFallback() {
  const results = safeSearchResults();
  if (results) {
    results.innerHTML = "";
    results.style.display = "none";
  }
  const main = safeMainContent();
  if (main) main.style.display = "";
}

// --- Toggle filter panel ---
const filterToggle = document.getElementById("filterToggle");
const filterPanel = document.getElementById("filterPanel");
const closeFilter = document.getElementById("closeFilter");

filterToggle?.addEventListener("click", () => {
  filterPanel?.classList.add("active");
});
closeFilter?.addEventListener("click", () => {
  filterPanel?.classList.remove("active");
});

// --- Collapsible filter sections ---
const filterSections = document.querySelectorAll(".filter-section button");
filterSections.forEach((button) => {
  button.addEventListener("click", () => {
    button.parentElement.classList.toggle("active");
  });
});

// --- Discovery bar shadow on scroll ---
const discoveryBar = document.querySelector(".discovery-bar");
discoveryBar?.addEventListener("scroll", () => {
  discoveryBar.style.boxShadow =
    discoveryBar.scrollLeft > 5
      ? "inset 10px 0 10px -8px rgba(0,0,0,0.15)"
      : "none";
});

async function loadAdvertisedProducts() {
  try {
    const res = await fetch(`${API_BASE}/api/products/advertised`);
    if (!res.ok) throw new Error("Failed to fetch advertised products");
    const products = await res.json();

    const section = document.getElementById("trendingSection");
    const track = document.getElementById("trendingTrack");

    // If no advertised products, hide entire section
    if (!products || products.length === 0) {
      section.style.display = "none";
      return;
    }

    // Otherwise, show and populate it
    section.style.display = "block";
    track.innerHTML = products
      .map(
        (p) => `
          <div class="carousel-card">
            <div class="img-container">
              <img src="http://localhost:5000${p.image}" alt="${p.name}" />
            </div>
            <h4>${p.name}</h4>
            <span>₦${p.price.toLocaleString()}</span>
            <p>${p.description || "Hot trending item"}</p>
            <button class="carousel-btn">Check It Out</button>
          </div>
        `
      )
      .join("");

    // --- Initialize carousel auto-slide after content is loaded ---
    initCarousel();
  } catch (err) {
    console.error("Error loading advertised products:", err);
  }
}

// Carousel logic (auto-slide)
function initCarousel() {
  const track = document.querySelector(".carousel-track");
  const cards = document.querySelectorAll(".carousel-card");

  if (!track || cards.length === 0) return;

  let index = 0;
  const cardWidth = cards[0].offsetWidth + 20; // add spacing between cards
  const totalCards = cards.length;

  // Clone cards to make loop seamless
  cards.forEach((card) => track.appendChild(card.cloneNode(true)));

  function slideCarousel() {
    index++;
    track.style.transition = "transform 0.5s ease-in-out";
    track.style.transform = `translateX(-${index * cardWidth}px)`;

    if (index === totalCards) {
      setTimeout(() => {
        track.style.transition = "none";
        track.style.transform = "translateX(0)";
        index = 0;
      }, 500);
    }
  }

  setInterval(slideCarousel, 3000);
}

// Load everything
loadAdvertisedProducts();

// --- Product grid animation on scroll ---
const productObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.1 }
);

// --- Footer year & reveal ---
const footer = document.getElementById("pageFooter");
const yearSpan = document.getElementById("year");
if (yearSpan) yearSpan.textContent = new Date().getFullYear();
if (footer) {
  const footerObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        footer.classList.toggle("visible", entry.isIntersecting);
      });
    },
    { threshold: 0.05 }
  );
  footerObserver.observe(footer);
}

// --- Helper function for backend requests ---
async function apiFetch(endpoint, options = {}) {
  try {
    // ✅ Change URL if your backend isn’t running locally
    const baseURL =
      window.location.hostname === "localhost"
        ? "http://localhost:5000/api"
        : "https://ump-html-1.onrender.com";

    const res = await fetch(`${baseURL}${endpoint}`, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      credentials: "include", // send httpOnly cookie for auth
      body: options.body ? JSON.stringify(options.body) : null,
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("apiFetch error:", err);
    throw err;
  }
}

// ==========================
// 🔍 SEARCH + PRODUCT DISPLAY
// ==========================

const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const mainContent = document.querySelector(".product-grid");
const searchForm = document.querySelector(".search-form");

// --- Render product cards (for both main and search) ---
function renderProducts(products, target = mainContent) {
  if (!target) return;
  target.style.display = "grid";

  if (!products.length) {
    target.innerHTML = `
      <div class="no-results">
        <h2>No products found</h2>
        <p>Try adjusting your filters or search terms.</p>
      </div>`;
    return;
  }

  target.innerHTML = `
    <section class="search-grid">
      ${products
        .map(
          (product) => `
        <div class="search-card" data-product-id="${product._id}">
          <a href="/Pages/products.html?id=${product._id}" class="search-link">
            <div class="search-image">
              <img src="${
                product.images?.[0] ||
                product.image ||
                "./images/placeholder.png"
              }" alt="${escapeHTML(product.name)}">
            </div>
            <div class="search-info">
              <h3>${escapeHTML(product.name)}</h3>
              <p>₦${Number(product.price || 0).toLocaleString()}</p>
            </div>
          </a>
          <div class="search-actions">
            <button class="quick-view" data-product-id="${product._id}">
              <i class="fas fa-eye"></i>
            </button>
            <button class="add-to-cart" data-product-id="${product._id}">
              <i class="fas fa-cart-plus"></i>
            </button>
          </div>
        </div>`
        )
        .join("")}
    </section>
  `;

  target.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const productId = btn.dataset.productId;
      if (!productId) return console.error("❌ No product ID found on button");
      addToCart(productId, 1);
    });
  });
}

// --- Load all products into main grid ---
async function loadProducts() {
  try {
    const res = await apiFetch("/products");
    if (!res || !Array.isArray(res.products))
      throw new Error("Invalid response");

    allProducts = res.products;

    if (allProducts.length === 0) {
      showFallback(
        "No products available",
        "Check back soon — sellers may add new items!"
      );
      return;
    }

    // ✅ Render to main grid only
    renderProducts(allProducts, mainContent);
  } catch (err) {
    console.error("❌ Failed to fetch products:", err);
    showFallback("Could not load products", "Please try again later.");
  }
}

// --- Search handler ---
async function runSearch(e) {
  if (e) e.preventDefault();

  const query = searchInput.value.trim();
  if (!query) {
    // empty search: show main grid
    searchResults.style.display = "none";
    mainContent.style.display = "grid";
    return;
  }

  try {
    const res = await fetch(
      `${API_BASE}/api/search/products?query=${encodeURIComponent(query)}`
    );
    if (!res.ok) throw new Error(`Server error ${res.status}`);
    const results = await res.json();

    mainContent.style.display = "none";
    searchResults.style.display = "grid";
    renderProducts(results, searchResults);
  } catch (error) {
    console.error("❌ Error running search:", error);
    searchResults.innerHTML = `<p class="error-message">Error fetching search results.</p>`;
  }
}

// ✅ Proper listener for submit
searchForm.addEventListener("submit", runSearch);

// ==========================
// ⚡ QUICK VIEW MODAL
// ==========================
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".quick-view");
  if (!btn) return;
  const id = btn.getAttribute("data-product-id");
  const product = allProducts.find((p) => p._id === id);
  if (product) openSearchModal(product);
});

function openSearchModal(product) {
  document.getElementById("quickViewModal")?.remove();

  const modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "quickViewModal";
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-modal" id="closeModal">&times;</span>
      <div class="modal-body">
        <div class="modal-image">
          <img src="${
            product.images?.[0] || product.image || "./images/placeholder.png"
          }" alt="${escapeHTML(product.name)}">
        </div>
        <div class="modal-details">
          <h2>${escapeHTML(product.name)}</h2>
          <p class="modal-price">₦${product.price}</p>
          <p class="modal-desc">${escapeHTML(
            product.desc || "No description available"
          )}</p>
          <p><strong>Seller:</strong> ${escapeHTML(
            product.seller?.name || "Unknown"
          )}</p>
          <p><strong>Store:</strong> ${escapeHTML(product.store || "N/A")}</p>
          <p><strong>Category:</strong> ${escapeHTML(
            product.category || "N/A"
          )}</p>
          <button class="message-btn">Message Seller</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);

  modal.style.display = "flex";
  document
    .getElementById("closeModal")
    .addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });
}

// ==========================
// 🧮 SORTING & FILTERING (Backend Powered)
// ==========================
const sortSelect = document.getElementById("sortSelect");

// Handle sorting
sortSelect?.addEventListener("change", async () => {
  const val = sortSelect.value;
  await loadFilteredAndSortedProducts({ sort: val });
});

// Handle filter checkboxes
document
  .querySelectorAll(".filter-section input[type='checkbox']")
  .forEach((cb) => cb.addEventListener("change", applyFilters));

async function applyFilters() {
  const cats = Array.from(
    document.querySelectorAll("input[name='category']:checked")
  ).map((cb) => cb.value.toLowerCase());

  const conds = Array.from(
    document.querySelectorAll("input[name='condition']:checked")
  ).map((cb) => cb.value.toLowerCase());

  const prices = Array.from(
    document.querySelectorAll("input[name='price']:checked")
  ).map((cb) => cb.value);

  await loadFilteredAndSortedProducts({
    categories: cats,
    conditions: conds,
    prices,
    sort: sortSelect?.value || "",
  });
}

// 🔥 Fetch products from backend based on selected filters/sort
async function loadFilteredAndSortedProducts({
  categories = [],
  conditions = [],
  prices = [],
  sort = "",
}) {
  try {
    const params = new URLSearchParams();

    if (categories.length) params.append("categories", categories.join(","));
    if (conditions.length) params.append("conditions", conditions.join(","));
    if (prices.length) params.append("prices", prices.join(","));
    if (sort) params.append("sort", sort);

    const res = await fetch(
      `${API_BASE}/api/products/filter?${params.toString()}`
    );

    if (!res.ok) throw new Error("Failed to fetch filtered/sorted products");

    const products = await res.json();

    mainContent.style.display = "none";
    renderProducts(products);
  } catch (error) {
    console.error("❌ Error applying filters:", error);
    renderProducts([]); // clear display on error
  }
}

// ==========================
// INIT
// ==========================
document.addEventListener("DOMContentLoaded", loadProducts);
