const isLocal = window.location.hostname === "localhost";
const API_BASE = isLocal
  ? "http://localhost:5000/api"
  : "https://ump-html-1.onrender.com/api";


document.addEventListener("DOMContentLoaded", async () => {
  // ======== Selectors ========
  const storeGrid = document.getElementById("storeGrid");
  const sellerProfile = document.getElementById("sellerProfile");
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");
  const storeDirectory = document.querySelector(".store-directory");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const filterToggle = document.getElementById("Toggle");
  const filterPanel = document.getElementById("Panel");
  const closePanel = document.getElementById("closePanel");

  let sellers = [];

  // ============================
  // 🌐 Backend API helper (Uses cookies, no localStorage)
  // ============================
  async function apiFetch(endpoint, options = {}) {
    try {
      const res = await fetch(`${API_BASE}/api${endpoint}`, {
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
        },
        body: options.body ? JSON.stringify(options.body) : null,
        credentials: "include", // ✅ cookies for auth
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("apiFetch error:", err);
      throw err;
    }
  }

  // ============================
  // 👩‍💼 Load sellers from backend
  // ============================
  async function loadSellers() {
    try {
      const res = await apiFetch("/sellers");
      sellers = Array.isArray(res) ? res : res.sellers || [];

      if (!sellers || sellers.length === 0) {
        console.warn("⚠️ No sellers found in database.");
        if (storeGrid) {
          storeGrid.innerHTML = `
            <div class="empty-state">
              <img src="../images/empty.png" alt="Empty state" />
              <h3>No Service Providers Available Yet</h3>
              <p>Once service providers join, their profiles will appear here.</p>
              <button class="refresh-btn" id="refreshBtn">🔄 Refresh</button>
            </div>
          `;

          const refreshBtn = document.getElementById("refreshBtn");
          if (refreshBtn) {
            refreshBtn.addEventListener("click", () => {
              console.log("refreshBtn clicked ✅");
              window.location.reload();
            });
          }
        }
        return;
      }

      if (storeGrid) displaySellers(sellers, storeGrid);
      if (sellerProfile) showSellerProfile();
    } catch (err) {
      console.error("❌ Failed to load sellers:", err);
      if (storeGrid)
        storeGrid.innerHTML = `
          <div class="error-msg">
            <p>Failed to load sellers. Please try again later.</p>
          </div>`;
    }
  }

  // ============================
  // 🧱 Display sellers in a grid
  // ============================
  function displaySellers(list, grid) {
    if (!list || list.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <img src="../images/guy.png" alt="No sellers">
          <p>No sellers found.</p>
        </div>`;
      return;
    }

    grid.innerHTML = list
      .map(
        (s) => `
        <a href="seller.html?id=${s._id}" class="store-card">
          <img src="${s.logo || "../images/guy.png"}" alt="${
          s.name
        }" class="store-avatar" />
          <h3 class="store-name">${s.name}</h3>
          <div class="store-stats">⭐ ${s.rating || "0"}</div>
        </a>`
      )
      .join("");
  }

  // ============================
  // 🧍 Seller profile page
  // ============================
  function showSellerProfile() {
    const params = new URLSearchParams(window.location.search);
    const sellerId = params.get("id");
    const seller = sellers.find((s) => s._id === sellerId);
    window.currentSellerId = sellerId;

    if (!sellerProfile) return;

    if (!seller) {
      sellerProfile.innerHTML = `
        <div class="empty-state">
          <img src="../images/guy.png" alt="No seller" />
          <p>Seller not found or may have been removed.</p>
        </div>`;
      return;
    }

    sellerProfile.innerHTML = `
      <section class="seller-header">
        <img src="${seller.banner || "../images/banner.jpg"}" alt="${
      seller.name
    }" class="store-banner" />
        <div class="seller-info">
          <img src="${seller.logo || "../images/guy.png"}" alt="${
      seller.name
    }" class="seller-avatar" />
          <h2 class="seller-name">${seller.name}</h2>
          <p class="seller-bio">${
            seller.bio || "This seller has no bio yet."
          }</p>

          <div class="seller-actions">
            <button class="contact-btn" id="contactSellerBtn">💬 Contact Seller</button>
            <button class="btn btn-primary" id="followSellerBtn">
              ${seller.isFollowed ? "Following ✓" : "Follow Store"}
            </button>
          </div>

          <div class="seller-stats">
            <div>Items Sold: ${seller.sold || 0}</div>
            <div>Rating: ${seller.rating || "0"}</div>
          </div>
        </div>
      </section>

      <section class="seller-products">
        <h3>Available Products</h3>
        <div class="seller-grid">
          ${
            seller.products && seller.products.length > 0
              ? seller.products
                  .map(
                    (p) => `
                    <div class="seller-card" data-product-id="${p._id}">
                      <a href="./product.html?id=${p._id}" class="product-link">
                        <div class="seller-product-card">
                          <img src="${
                            p.image || "../images/default.jpg"
                          }" alt="${p.name}">
                          <div class="seller-product-action">
                            <button class="quick-view" data-product-id="${
                              p._id
                            }">
                              <i class="fas fa-eye"></i>
                            </button>
                            <button class="add-to-cart" data-product-id="${
                              p._id
                            }">
                              <i class="fas fa-cart-plus"></i>
                            </button>
                          </div>
                        </div>
                        <div class="seller-product-info">
                          <h3>${p.name}</h3>
                          <p>${p.price || "N/A"}</p>
                        </div>
                      </a>
                    </div>`
                  )
                  .join("")
              : `
                <div class="no-products" id="noProducts">
                  <img src="../images/empty.png" alt="No products" class="no-products__img" />
                  <div class="no-products__content">
                    <h4 class="no-products__title">This seller has no products yet</h4>
                    <p class="no-products__text">
                      The seller hasn't added items to their store. Check back later or follow the store to get updates.
                    </p>
                    <div class="no-products__actions">
                      <button class="btn btn-primary" id="followSellerBtn">Follow Store</button>
                      <button class="btn btn-ghost" id="refreshProductsBtn">Refresh</button>
                    </div>
                  </div>
                </div>`
          }
        </div>
      </section>`;
  }

  // ============================
  // 🔍 Search sellers
  // ============================
  if (searchInput && searchResults) {
    searchResults.style.display = "none";

    function renderSearchResults(results) {
      if (storeDirectory) storeDirectory.style.display = "none";
      searchResults.style.display = "grid";

      if (!results.length) {
        searchResults.innerHTML = `
          <div class="no-results">
            <h2>No sellers found</h2>
            <p>Try another keyword.</p>
          </div>`;
        return;
      }

      searchResults.innerHTML = results
        .map(
          (s) => `
          <div class="search-card" data-seller-id="${s._id}">
            <a href="seller.html?id=${s._id}" class="search-link">
              <div class="search-image">
                <img src="${s.logo || "../images/guy.png"}" alt="${s.name}">
              </div>
              <div class="search-info">
                <h3>${s.name}</h3>
                <p>${s.bio || ""}</p>
                <small>⭐ ${s.rating || "0"} • ${s.sold || 0} sold</small>
              </div>
            </a>
          </div>`
        )
        .join("");
    }

    searchInput.addEventListener("input", async (e) => {
      const term = e.target.value.trim();
      if (!term) {
        if (storeDirectory) storeDirectory.style.display = "";
        searchResults.style.display = "none";
        return;
      }

      try {
        const res = await apiFetch(
          `/sellers/search?q=${encodeURIComponent(term)}`
        );
        const data = Array.isArray(res) ? res : res.sellers || [];
        renderSearchResults(data);
      } catch (err) {
        console.error("❌ Search failed:", err);
        searchResults.innerHTML = `
          <div class="no-results">
            <h2>Search failed</h2>
            <p>Try again later.</p>
          </div>`;
      }
    });
  }

  // ============================
  // 🎛️ Filter toggle panel
  // ============================
  if (filterToggle && filterPanel && closePanel) {
    filterToggle.addEventListener("click", () => {
      filterPanel.classList.toggle("active");
      filterToggle.textContent = filterPanel.classList.contains("active")
        ? "✖ Close Filters"
        : "☰ Filters";
    });

    closePanel.addEventListener("click", () => {
      filterPanel.classList.remove("active");
      filterToggle.textContent = "☰ Filters";
    });

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
  }

  // ============================
  // 🧩 Filter sellers by category
  // ============================
  if (filterBtns && filterBtns.length > 0 && storeGrid) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const category = btn.dataset.category;
        if (category === "all") {
          displaySellers(sellers, storeGrid);
        } else {
          const filtered = sellers.filter(
            (s) =>
              s.category &&
              s.category.some((c) => c.toLowerCase() === category.toLowerCase())
          );
          displaySellers(filtered, storeGrid);
        }
      });
    });
  }

  // ✅ Load sellers on page ready
  await loadSellers();
});

// ============================
// 🖱️ Global Click Actions
// ============================
document.addEventListener("click", async (e) => {
  // 🔁 Refresh products
  if (e.target.id === "refreshProductsBtn") {
    e.target.textContent = "Checking…";
    window.location.reload();
  }

  // 💬 Contact Seller
  if (e.target.id === "contactSellerBtn") {
    const sellerId = window.currentSellerId || document.body.dataset.sellerId;
    if (!sellerId) return alert("Seller not found.");

    const res = await fetch(`${API_BASE}/api/users/me`, { credentials: "include" });
    if (!res.ok) return alert("Please log in to send a message.");

    window.location.href = `/messages?to=${sellerId}`;
  }

  // 🤝 Follow / Unfollow Seller
  if (e.target.id === "followSellerBtn") {
    const btn = e.target;
    const sellerId = window.currentSellerId || document.body.dataset.sellerId;
    if (!sellerId) return alert("Seller not found.");

    const check = await fetch(`${API_BASE}/api/users/me`, { credentials: "include" });
    if (!check.ok) return alert("Please log in to follow stores.");

    try {
      const res = await fetch(`${API_BASE}/api/sellers/${sellerId}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to follow");

      btn.textContent = data.isFollowing ? "Following ✓" : "Follow Store";
      btn.classList.toggle("following", data.isFollowing);
    } catch (err) {
      console.error(err);
      alert("Unable to follow this seller right now.");
    }
  }
});
