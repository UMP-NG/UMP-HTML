const isLocal = window.location.hostname === "localhost";
const API_BASE = isLocal
  ? "http://localhost:5000/api"
  : "https://ump-html-1.onrender.com/api";

// ===============================
// 🧭 Tab Switching Functionality
// ===============================
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetTab = btn.dataset.tab;

    // 1️⃣ Remove "active" class from all buttons
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));

    // 2️⃣ Add "active" class to clicked button
    btn.classList.add("active");

    // 3️⃣ Hide all tab contents
    document
      .querySelectorAll(".tab-content")
      .forEach((tab) => tab.classList.remove("active"));

    // 4️⃣ Show selected tab content
    const activeTab = document.getElementById(targetTab);
    if (activeTab) activeTab.classList.add("active");

    // Optional: scroll into view on mobile
    activeTab.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// -----------------------------
// 🧩 PRODUCT DETAIL PAGE (Full Integration + Enhanced Logging + View Tracking + Follow System)
// -----------------------------
(async function handleProductPage() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  if (!productId) {
    console.warn("⚠️ No product ID found in URL.");
    return;
  }

  console.log("🌐 Loading product page for ID:", productId);

  try {
    // ✅ Fetch product data from backend (use shared apiFetch helper)
    console.log("📡 Fetching product data from backend...");
    const data = await apiFetch(`/products/${productId}`);
    const product = data.product || data;

    if (!product || !product._id) {
      alert("Product not found.");
      window.location.href = "./market.html";
      return;
    }

    console.log("✅ Product data loaded:", product);

    // --- 🧭 Breadcrumb Update ---
    const breadcrumbName = document.getElementById("breadcrumb-name");
    if (breadcrumbName) breadcrumbName.textContent = product.name || "Product";

    // --- 🖼 Update product UI ---
    document.getElementById("product-name").textContent = product.name || "";
    document.getElementById("product-price").textContent = product.price
      ? `₦${Number(product.price).toLocaleString()}`
      : "Price not available";
    document.getElementById("product-desc").textContent =
      product.desc || product.description || "No description provided.";
    document.getElementById("product-condition").textContent =
      product.condition || "N/A";

    // --- 🏪 Seller Info ---
    const seller = product.seller || {};
    document.getElementById("product-seller").textContent =
      seller.storeName || seller.name || "Unknown Seller";
    document.getElementById("seller-name").textContent =
      seller.storeName || seller.name || "Unknown Seller";
    document.getElementById("seller-followers").textContent =
      seller.followers?.length > 0
        ? `${seller.followers.length} followers`
        : "No followers yet";
    document.getElementById("seller-logo").src =
      seller.logo || seller.avatar || "../images/guy.png";
    document.getElementById("seller-bio").textContent =
      seller.bio || "No bio available.";
    document.getElementById("seller-story").textContent =
      seller.description || seller.bio || "No seller story yet.";

    // --- 🖼 Product Images ---
    const mainImg = document.getElementById("product-img");
    const thumbnails = document.getElementById("product-thumbnails");
    if (product.images && product.images.length > 0) {
      mainImg.src = product.images[0];
      thumbnails.innerHTML = "";
      product.images.forEach((img) => {
        const thumb = document.createElement("img");
        thumb.src = img;
        thumb.className = "product-thumb";
        thumb.onclick = () => (mainImg.src = img);
        thumbnails.appendChild(thumb);
      });
    } else {
      mainImg.src = product.image || "../images/placeholder.png";
    }

    // --- 🎨 Color Swatches ---
    const swatches = document.getElementById("product-swatches");
    if (product.colors?.length) {
      swatches.innerHTML = "";
      product.colors.forEach((color) => {
        const swatch = document.createElement("div");
        swatch.className = "swatch";
        // support both legacy string colors and new object { name, code }
        const code = typeof color === "string" ? color : color?.code || "";
        const name = typeof color === "string" ? color : color?.name || "";
        if (code) swatch.style.backgroundColor = code;
        if (name) swatch.title = name;
        swatch.dataset.color = code;
        swatch.onclick = () => selectSwatch(swatch);
        swatches.appendChild(swatch);
      });
    }

    const addToCartBtn = document.querySelector(".add-to-cart-btn");
    if (addToCartBtn) {
      addToCartBtn.dataset.productId = product._id; // fills in the correct product ID
    }

    // --- 👁️ Track Product View (dedicated endpoint)
    await trackProductView(product._id);

    // --- 📊 Product Specs + Reviews — pass already-fetched product to avoid duplicate fetch
    await loadProductDetails(product);

    // --- ❤️ Add to Wishlist ---
    const wishlistBtn = document.getElementById("wishlist-btn");
    if (wishlistBtn) {
      wishlistBtn.addEventListener("click", () =>
        addToWishlist(product._id, wishlistBtn)
      );
    }

    // --- 👥 Follow Seller Button ---
    const followBtn = document.getElementById("follow-btn");
    if (followBtn && seller._id) {
      // Set initial button state using helper
      setFollowButtonState(followBtn, !!seller.isFollowing);

      followBtn.addEventListener("click", async () => {
        await toggleFollowSeller(seller._id, followBtn);
      });
    }
  } catch (err) {
    console.error("❌ Failed to load product:", err);
    alert("Could not load product details. Please try again later.");
  }

  // (trackProductView is implemented at module scope so other scripts/listeners can call it.)

  // -----------------------------
  // 🔍 Load Full Product Details (Specs + Reviews)
  // -----------------------------
  async function loadProductDetails(productOrId) {
    const id = typeof productOrId === "string" ? productOrId : productOrId?._id;
    console.log("🔄 Loading detailed info for product:", id);
    try {
      let productData = productOrId;
      if (!productData || typeof productOrId === "string") {
        productData = await apiFetch(`/products/${id}`);
      }

      const product = productData.product || productData;
      console.log("📦 Detailed product data:", product);

      // --- 📊 Specifications ---
      const specsTable = document.getElementById("product-specs");
      const specs = product.specs || {};

      // Convert specs to array and filter out empty values
      const specEntries = Object.entries(specs).filter(
        ([key, value]) => key && value && String(value).trim()
      );

      if (specEntries.length > 0) {
        specsTable.innerHTML = specEntries
          .map(
            ([key, value]) =>
              `<tr>
                <td><b>${escapeHtml(key)}</b></td>
                <td>${escapeHtml(String(value))}</td>
              </tr>`
          )
          .join("");
      } else {
        specsTable.innerHTML = `<tr><td colspan="2">No specifications available.</td></tr>`;
      }

      // --- ⭐ Reviews ---
      renderReviews(product.reviews || [], product._id || id);
    } catch (err) {
      console.error("❌ Product detail load error:", err);
    }
  }

  // -----------------------------
  // 💬 Render Reviews
  // -----------------------------
  function renderReviews(reviews, productId) {
    console.log(
      `🧩 Rendering ${reviews.length} review(s) for product ID:`,
      productId
    );
    const reviewsList = document.getElementById("reviews-list");
    reviewsList.innerHTML = "";

    if (!reviews.length) {
      console.log("ℹ️ No reviews found for this product.");
      reviewsList.innerHTML = "<p>No reviews available yet.</p>";
      return;
    }

    const avg =
      reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length;
    const avgStars = `${"★".repeat(Math.round(avg))}${"☆".repeat(
      5 - Math.round(avg)
    )}`;
    console.log(`⭐ Average Rating: ${avg.toFixed(1)}/5`);

    reviewsList.innerHTML = `
      <p><b>Average Rating:</b> ${avgStars} ${avg.toFixed(1)}/5</p>
      ${reviews
        .map(
          (r, i) => `
          <div class="review" data-index="${i}">
            <p><b>${escapeHtml(r.userName || "Anonymous")}</b> — ${
            r.rating || 0
          }★</p>
            <p>${escapeHtml(r.comment || "")}</p>
          </div>`
        )
        .join("")}
    `;
    console.log("✅ Reviews rendered successfully.");
  }

  // -----------------------------
  // ✍️ Submit Review
  // -----------------------------
  document
    .getElementById("submitReviewBtn")
    .addEventListener("click", async () => {
      const comment = document.getElementById("reviewComment").value.trim();
      const rating = parseInt(document.getElementById("reviewRating").value);
      const productId = new URLSearchParams(window.location.search).get("id");

      console.log("📝 Submitting review:", { productId, comment, rating });

      if (!comment || !rating) {
        alert("Please enter a comment and select a rating.");
        return;
      }

      try {
        const res = await fetch(`/api/products/${productId}/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ comment, rating }),
        });

        if (!res.ok) {
          console.error(
            "❌ Review submission failed:",
            res.status,
            res.statusText
          );
          throw new Error("Failed to submit review");
        }

        const updatedProduct = await res.json();
        console.log("✅ Review submitted. Updated product:", updatedProduct);

        renderReviews(updatedProduct.reviews, productId);
        document.getElementById("reviewComment").value = "";
        document.getElementById("reviewRating").value = "";

        alert("✅ Review submitted successfully!");
      } catch (err) {
        console.error("❌ Review submit error:", err);
        alert("Failed to submit review. Please log in first or try again.");
      }
    });
})();

// -----------------------------
// ❤️ Wishlist Function
// -----------------------------
async function addToWishlist(productId, button) {
  try {
    button.disabled = true;
    button.textContent = "Adding...";

    // Use cookies (credentials) for auth; backend should rely on session cookie
    await apiFetch(`/wishlist/${productId}`, { method: "POST" });

    button.textContent = "❤️ Added to Wishlist";
    button.classList.add("added");
    console.log("✅ Wishlist added");
  } catch (err) {
    console.error("❌ Wishlist error:", err);
    if (err.status === 401) {
      window.location.href = "/Pages/login.html";
      return;
    }
    alert("Failed to add to wishlist.");
  } finally {
    button.disabled = false;
  }
}

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
if (productId) {
  loadRelatedProducts(productId);
  loadSellerProducts(productId);
}

// ===============================
// 🎯 RELATED PRODUCTS
// ===============================
async function loadRelatedProducts(productId) {
  const relSection = document.querySelector(
    ".rel-products .rel-carousel-track"
  );

  try {
    const data = await apiFetch(`/products/${productId}/related`);
    // data might be an array or an object { products }
    const products = Array.isArray(data) ? data : data.products || [];

    if (!products.length) {
      relSection.innerHTML = `<p class="empty-text">No similar products found.</p>`;
      return;
    }

    relSection.innerHTML = products
      .map(
        (p) => `
        <div class="rel-product-card">
          <a href="products.html?id=${p._id}">
            <img src="${
              p.images?.[0] || p.image || "../images/placeholder.png"
            }" alt="${escapeAttr(p.name || "")}">
            <h3 class="rel-card-title">${escapeHtml(p.name || "")}</h3>
            <p class="rel-card-price">₦${Number(p.price).toLocaleString()}</p>
          </a>
        </div>`
      )
      .join("");
  } catch (err) {
    console.error("❌ Related products error:", err);
    relSection.innerHTML = `<p class="error-text">Error loading similar products.</p>`;
  }
}

// ===============================
// 🛍️ Seller section (robust, cookie-auth)
// ===============================
async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers:
      opts.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" },
    ...opts,
  });

  const text = await res.text();
  const data = text
    ? (() => {
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      })()
    : null;

  if (!res.ok) {
    const msg =
      data?.message || data?.error || res.statusText || "Request failed";
    const err = new Error(msg);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

// ===============================
// 👁️ Product view tracking (module-scope)
// - Prevents duplicate tracking by using a Set stored on window
// - Safe to call from anywhere (page-specific scripts may call it on DOMContentLoaded)
// ===============================
async function trackProductView(productId) {
  if (!productId) return;

  // create global set to avoid duplicate requests for same product during a single session
  try {
    window._trackedProductViews = window._trackedProductViews || new Set();
    if (window._trackedProductViews.has(productId)) {
      console.debug("👁️ View already tracked for", productId);
      return;
    }

    console.log("👁️ Tracking view for product:", productId);
    const data = await apiFetch(
      `/products/${encodeURIComponent(productId)}/view`,
      { method: "POST" }
    );
    console.log("✅ View recorded, current count:", data?.views ?? "(unknown)");

    // mark tracked even if response shape unexpected
    window._trackedProductViews.add(productId);
    return data;
  } catch (err) {
    console.error("❌ Failed to track product view:", err);
  }
}

function setText(idOrEl, text) {
  const el =
    typeof idOrEl === "string" ? document.getElementById(idOrEl) : idOrEl;
  if (!el) return;
  el.textContent = text;
}

function setSrc(idOrEl, src) {
  const el =
    typeof idOrEl === "string" ? document.getElementById(idOrEl) : idOrEl;
  if (!el) return;
  el.src = src;
}

// ===============================
// Follow button helpers
// ===============================
function setFollowButtonState(btn, following) {
  if (!btn) return;
  btn.classList.toggle("following", !!following);
  // Use checkmark for visual clarity
  btn.innerHTML = following ? `✔️ Following` : `+ Follow`;
}

function showFollowButtonLoading(btn, loading = true) {
  if (!btn) return;
  if (loading) {
    // store previous HTML so we can restore it
    btn.dataset._prevHtml = btn.innerHTML;
    btn.innerHTML = `<span class="follow-spinner" aria-hidden="true">⏳</span> Processing...`;
    btn.disabled = true;
  } else {
    if (btn.dataset._prevHtml) btn.innerHTML = btn.dataset._prevHtml;
    btn.disabled = false;
    delete btn.dataset._prevHtml;
  }
}

async function loadSellerInfo(sellerId) {
  const sellerLogo = document.getElementById("seller-logo");
  const sellerName = document.getElementById("seller-name");
  const sellerFollowers = document.getElementById("seller-followers");
  const sellerBio = document.getElementById("seller-bio");
  const sellerStory = document.getElementById("seller-story");
  const followBtns = Array.from(document.querySelectorAll(".follow-btn"));

  console.log("🔍 Starting loadSellerInfo for ID:", sellerId);

  try {
    const seller = await apiFetch(`/sellers/${encodeURIComponent(sellerId)}`);

    console.log("✅ Raw seller response:", seller);
    console.log("🧠 Seller fields:", {
      id: seller._id,
      storeName: seller.storeName,
      businessName: seller.businessName,
      name: seller.name,
      followers: seller.followers?.length,
      logo: seller.logo,
      products: seller.products?.length,
    });

    setSrc(sellerLogo, seller.logo || "../images/store.png");
    setText(
      sellerName,
      seller.storeName || seller.businessName || "Unknown Seller"
    );
    setText(
      sellerFollowers,
      `${seller.followerCount ?? seller.followers?.length ?? 0} followers`
    );
    setText(sellerBio, seller.bio || "No bio available.");
    setText(sellerStory, seller.story || "No seller story yet.");

    followBtns.forEach((btn) => {
      btn.dataset.sellerId = sellerId;
      setFollowButtonState(btn, !!seller.isFollowing);
      btn.disabled = false;

      // clear any previous listeners
      btn.removeEventListener("click", btn._followHandler);
      const handler = async (e) => {
        e.preventDefault();
        console.log("➡️ Follow button clicked for seller:", sellerId);
        await toggleFollowSeller(sellerId, btn);
      };
      btn.addEventListener("click", handler);
      btn._followHandler = handler;
    });

    console.log("🎯 Seller info rendered successfully.");
  } catch (err) {
    console.error("❌ Error loading seller info:", err);
    if (err.status === 404)
      console.warn("⚠️ Seller not found on backend:", sellerId);
    setText(sellerName, "Seller info unavailable.");
    setText(sellerFollowers, "");
  }
}

// ===============================
// 👥 Follow / Unfollow Seller
// ===============================
async function toggleFollowSeller(sellerId, button) {
  if (!sellerId) return;

  const followButtons = Array.from(
    document.querySelectorAll(".follow-btn")
  ).filter((b) => b.dataset.sellerId == sellerId);

  try {
    if (button) showFollowButtonLoading(button, true);

    const data = await apiFetch(
      `/sellers/${encodeURIComponent(sellerId)}/follow`,
      { method: "POST" }
    );

    const following = !!data.following;
    const followerCount =
      data.followerCount ??
      data.followersCount ??
      data.followers?.length ??
      null;

    followButtons.forEach((btn) => {
      setFollowButtonState(btn, following);
      btn.disabled = false;
    });

    const followersEl = document.getElementById("seller-followers");
    if (followersEl && followerCount !== null) {
      followersEl.textContent =
        followerCount > 0
          ? `${followerCount} follower${followerCount === 1 ? "" : "s"}`
          : "No followers yet";
    }

    console.log("✅ Follow status updated:", data);
    return data;
  } catch (err) {
    if (err.message === "You cannot follow yourself") {
      alert("You cannot follow yourself");
      return; // stop further processing
    }

    console.error("❌ toggleFollowSeller error:", err);

    if (err && err.status === 401) {
      window.location.href = "/Pages/login.html";
      return;
    }

    alert(err.message || "Could not update follow status.");
  } finally {
    if (button) showFollowButtonLoading(button, false);
  }
}

async function loadSellerProducts(productId) {
  const track = document.querySelector(".seller-products .rel-carousel-track");
  if (!track) return;

  track.innerHTML = `<div class="loading">Loading seller products…</div>`;

  try {
    // Get current product
    const productData = await apiFetch(
      `/products/${encodeURIComponent(productId)}`
    );

    // normalize possible shapes: { product } or direct product object
    const product = productData.product || productData;
    if (!product) throw new Error("Product payload malformed");

    // seller may be id string or object
    const sellerId = product.seller?._id || product.seller;
    if (!sellerId) {
      track.innerHTML = "<p>No seller info available.</p>";
      return;
    }

    // populate seller section first
    await loadSellerInfo(sellerId);

    // fetch other products
    const listData = await apiFetch(
      `/products?seller=${encodeURIComponent(sellerId)}`
    );
    const products = (listData.products || []).filter(
      (p) => p._id !== productId
    );

    if (!products.length) {
      track.innerHTML = "<p>No more products from this seller yet.</p>";
      return;
    }

    // render
    track.innerHTML = "";
    const fragment = document.createDocumentFragment();

    products.forEach((p) => {
      const card = document.createElement("div");
      card.className = "rel-product-card";
      const imgSrc =
        p.image ||
        (Array.isArray(p.images) && p.images[0]) ||
        "../images/placeholder.jpg";
      const price = Number(p.price) || 0;

      // accessible card
      card.innerHTML = `
        <button type="button" class="rel-card-inner" data-product-id="${
          p._id
        }" aria-label="Open ${escapeHtml(p.name || "product")}">
          <img class="rel-card-image" src="${escapeAttr(
            imgSrc
          )}" alt="${escapeAttr(p.name || "")}">
          <h3 class="rel-card-title">${escapeHtml(p.name || "")}</h3>
          <p class="rel-card-price">₦${price.toLocaleString()}</p>
        </button>
      `;

      // navigate on click
      card.querySelector(".rel-card-inner").addEventListener("click", () => {
        window.location.href = `products.html?id=${encodeURIComponent(p._id)}`;
      });

      fragment.appendChild(card);
    });

    track.appendChild(fragment);
  } catch (err) {
    console.error("Error loading seller products:", err);
    track.innerHTML = "<p>Error loading seller products.</p>";
  }
}

/* Utilities to avoid XSS when inserting small strings into attributes/text */
function escapeHtml(str) {
  if (!str && str !== 0) return "";
  return String(str).replace(
    /[&<>"']/g,
    (s) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        s
      ])
  );
}
function escapeAttr(val) {
  return escapeHtml(val);
}

/* Init on page load */
document.addEventListener("DOMContentLoaded", () => {
  try {
    const bodyProductId =
      document.body && document.body.dataset && document.body.dataset.productId;
    if (bodyProductId) {
      trackProductView(bodyProductId);
    }
  } catch (e) {
    console.warn("Could not read body dataset for productId", e);
  }

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");
  if (productId) loadSellerProducts(productId);

  document
    .querySelectorAll(".tab-btn")
    .forEach((tab) =>
      tab.addEventListener("click", () =>
        tab.scrollIntoView({ behavior: "smooth", inline: "center" })
      )
    );
});
