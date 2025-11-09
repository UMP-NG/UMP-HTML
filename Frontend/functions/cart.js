const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ump-html-1.onrender.com";

let currentStep = 1;

function showStep(step) {
  console.log(`🪜 Showing step ${step}`); // 👈 log which step is being displayed

  const allSteps = document.querySelectorAll(".step-content");
  const steps = document.querySelectorAll(".step");
  const labels = document.querySelectorAll(".step-label");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  allSteps.forEach((s) => s.classList.remove("active"));
  steps.forEach((s) => s.classList.remove("active", "completed"));
  labels.forEach((l) => l.classList.remove("active-label"));

  document
    .querySelector(`.step-content[data-step="${step}"]`)
    ?.classList.add("active");
  steps[step - 1]?.classList.add("active");
  labels[step - 1]?.classList.add("active-label");

  for (let i = 0; i < step - 1; i++) {
    steps[i]?.classList.add("completed");
  }

  if (step === 1) {
    console.log("👈 Hiding Previous button (first step)");
    prevBtn.style.display = "none";
    nextBtn.textContent = "Next";
  } else if (step === steps.length) {
    console.log("🏁 Last step reached — changing Next to Finish");
    prevBtn.style.display = "inline-block";
    nextBtn.textContent = "Finish";
  } else {
    prevBtn.style.display = "inline-block";
    nextBtn.textContent = "Next";
  }
}

async function nextStep() {
  const totalSteps = document.querySelectorAll(".step").length;

  // ✅ STEP 1 VALIDATION
  if (currentStep === 1) {
    const cartItems = document.querySelectorAll(".cart-item");
    const deliverySelected = document.querySelector(
      'input[name="delivery"]:checked'
    );

    if (cartItems.length === 0) {
      alert("🛒 Please add at least one product to your cart.");
      console.warn("❌ No cart items found.");
      return;
    }

    if (!deliverySelected) {
      alert("🚚 Please select a delivery option before continuing.");
      console.warn("❌ Delivery option not selected.");
      return;
    }
  }

  if (currentStep === 2) {
    const step2 = document.querySelector('.step-content[data-step="2"]');
    if (!step2) {
      console.error("❌ Step 2 container not found");
      return;
    }

    const fullNameEl = step2.querySelector("#fullName");
    const emailEl = step2.querySelector("#email");
    const locationEl = step2.querySelector("#location");
    const notesEl = step2.querySelector("#notes");
    const phoneEl = step2.querySelector("#phone");

    if (!fullNameEl || !emailEl || !locationEl || !notesEl || !phoneEl) {
      console.error("❌ Some input elements not found in Step 2");
      return;
    }

    const fullName = fullNameEl.value.trim();
    const email = emailEl.value.trim();
    const location = locationEl.value.trim();
    const notes = notesEl.value.trim();
    const phone = phoneEl.value.trim();

    if (!fullName || !email || !location || !notes || !phone) {
      alert("⚠️ Please fill in all required fields before proceeding.");
      console.warn("❌ Missing required info fields.");
      return;
    }
  }

  // ✅ MOVE TO NEXT STEP OR FINISH
  if (currentStep < totalSteps) {
    currentStep++;
    showStep(currentStep);
  } else {
    const paymentChoice = document.querySelector(
      'input[name="payment"]:checked'
    );
    if (!paymentChoice) {
      alert("💳 Please select a payment method.");
      return;
    }

    console.log("💰 Payment choice:", paymentChoice.value);
    await checkoutCart(paymentChoice.value);
  }
}

function prevStep() {
  console.log("⬅️ Previous button clicked");
  if (currentStep > 1) {
    currentStep--;
    console.log(`↩️ Going back to step ${currentStep}`);
    showStep(currentStep);
  } else {
    console.log("🚫 Already at first step, cannot go back further");
  }
}

function goBackToCheckout() {
  console.log("🔙 Returning to checkout view");
  document.getElementById("cardForm")?.classList.add("hidden");
  document.getElementById("transferForm")?.classList.add("hidden");

  document
    .querySelectorAll(
      ".forgot-something, .btn-container, .step-content, .progress-container, .progress-label"
    )
    .forEach((sec) => (sec.style.display = ""));

  document.getElementById("nextBtn").style.display = "inline-block";
  document.getElementById("prevBtn").style.display = "inline-block";
}

window.goBackToCheckout = goBackToCheckout;
// ---------------------------
// 🧠 CART UTILITIES (Backend Version)
// ---------------------------

// Cookie helpers (replace localStorage usage)
function cookieSet(name, value, days = 7) {
  const expires = new Date(
    Date.now() + days * 24 * 60 * 60 * 1000
  ).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/`;
}

function cookieGet(name) {
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

function cookieRemove(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// Auth check helper — do not rely on reading httpOnly cookie from JS
async function authCheck() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch (err) {
    console.error("authCheck error:", err);
    return null;
  }
}

// Generic API fetch wrapper
async function apiFetch(url, options = {}) {
  const fetchOptions = {
    credentials: "include",
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  };
  if (
    fetchOptions.body &&
    !(fetchOptions.body instanceof FormData) &&
    !fetchOptions.headers["Content-Type"]
  ) {
    fetchOptions.headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${url}`, fetchOptions);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

// Fetch user cart from backend
async function loadCart() {
  try {
    const data = await apiFetch("/api/cart");
    return data.items || [];
  } catch (err) {
    console.error("❌ Failed to load cart:", err);
    return [];
  }
}

function showLoading(show = true, message = "Processing...") {
  const overlay = document.getElementById("loadingOverlay");
  if (!overlay) return;
  overlay.querySelector("p").textContent = message;
  overlay.classList.toggle("hidden", !show);
}

// ---------------------------
// 🛒 Add to Cart (Guest + Auth Users, Safe JSON Handling)
// ---------------------------
async function addToCart(productId, quantity = 1) {
  if (!productId) {
    console.error("❌ addToCart called without productId");
    return;
  }

  try {
    const user = await authCheck(); // Check if user is logged in

    // ---------------------------
    // 🧩 Guest cart (stored in cookie)
    // ---------------------------
    if (!user) {
      let guestCart = (() => {
        const v = cookieGet("guestCart");
        return v ? JSON.parse(v) : [];
      })();

      const existing = guestCart.find((item) => item.productId === productId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        guestCart.push({ productId, quantity });
      }

      cookieSet("guestCart", JSON.stringify(guestCart), 7);
      console.log("✅ Product added to guest cart:", productId, quantity);
      renderGuestCart();
      alert("✅ Product added to your cart (guest mode).");
      return;
    }

    // ---------------------------
    // ✅ Authenticated user — send request to backend
    // ---------------------------
    const res = await apiFetch("/api/cart/add", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });

    // Parse JSON response safely
    let data;
    try {
      data = (await res.json?.()) || res; // works if apiFetch already returns JSON
    } catch (jsonErr) {
      console.error("❌ Failed to parse JSON response:", jsonErr);
      throw new Error("Invalid response from server");
    }

    if (!res.ok && data?.message) {
      throw new Error(data.message);
    }

    console.log("✅ Add to cart response:", data);
    alert("✅ Product added to cart!");
    renderCart();
  } catch (err) {
    console.error("❌ Failed to add to cart:", err);
    alert(err.message || "Error adding product to cart");
  }
}

// ✅ Event delegation for Add to Cart buttons
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-to-cart, .add-to-cart-btn");
  if (!btn) return; // not an add-to-cart button

  const productId = btn.dataset.productId;
  if (!productId) {
    console.error("❌ No product ID found on button");
    return;
  }

  addToCart(productId, 1); // adjust quantity if needed
});

// ---------------------------
// 🔹 Set productId from URL for static product pages
// ---------------------------
function setProductIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  if (!productId) return;

  const addToCartBtn = document.querySelector(".add-to-cart");
  if (addToCartBtn) addToCartBtn.dataset.productId = productId;
}

// ---------------------------
// 🔹 Initialize on page load
// ---------------------------
document.addEventListener("DOMContentLoaded", () => {
  setProductIdFromURL();
  setProductIdFromURL();
});

// Expose globally for inline buttons or dynamic content
window.addToCart = addToCart;

async function removeFromCart(productId) {
  try {
    await apiFetch(`/api/cart/remove/${productId}`, { method: "DELETE" });
    renderCart();
  } catch (err) {
    console.error("❌ Failed to remove item:", err);
  }
}

async function updateQuantity(productId, change) {
  const qtySpan = document.querySelector(
    `.cart-item[data-id="${productId}"] .qty`
  );
  if (!qtySpan) return console.error("Quantity element not found");

  let currentQty = parseInt(qtySpan.textContent, 10);
  if (isNaN(currentQty)) currentQty = 1; // fallback

  const newQty = Math.max(currentQty + change, 1); // minimum 1

  try {
    await apiFetch("/api/cart/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: newQty }), // ✅ send absolute quantity
    });

    // Update the DOM after backend confirms
    qtySpan.textContent = newQty;

    // Optionally, re-render summary
    const cart = await loadCart();
    renderSummary(cart);
  } catch (err) {
    console.error("❌ Failed to update quantity:", err);
  }
}

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;

// ---------------------------
// 🖼️ CART RENDERING (Updated)
// ---------------------------
async function renderCart() {
  const container = document.getElementById("cartItems");
  if (!container) return;

  const cart = await loadCart();

  const deliverySection = document.getElementById("deliveryOptions");
  if (deliverySection) {
    deliverySection.style.display = cart.length ? "block" : "none";
  }

  container.innerHTML = "";

  if (!cart.length) {
    container.innerHTML = `
      <div class="empty-cart">
        <p>🛒 Your cart is empty.</p>
        <button class="btn" onclick="window.location.href='/Pages/market.html'">
          🛍️ Continue Shopping
        </button>
      </div>`;
    renderSummary([]);
    return;
  }

  cart.forEach((item) => {
    const imgSrc =
      (item.product?.images && item.product.images.length > 0
        ? item.product.images[0]
        : item.product?.image) || "../images/placeholder.png";

    const name = item.product?.name || "Unnamed Product";
    const price = item.product?.price || 0;
    const sellerName = item.product?.seller?.storeName || "Unknown Store";

    const row = document.createElement("div");
    row.className = "cart-item";
    row.dataset.id = item.product._id; // ✅ Add this for updateQuantity to find the element

    row.innerHTML = `
    <img src="${imgSrc}" alt="${name}" class="cart-item-img" />
    <div class="cart-item-details">
      <h3>${name}</h3>
      <a href="#" class="seller-name">${sellerName}</a>
      <div class="cart-item-actions">
        <div class="quantity-control">
          <button onclick="updateQuantity('${item.product._id}', -1)">-</button>
          <span class="qty">${item.quantity}</span>
          <button onclick="updateQuantity('${item.product._id}', 1)">+</button>
        </div>
        <span class="line-price">₦${price.toLocaleString("en-NG")}</span>
        <button class="remove-item" onclick="removeFromCart('${
          item.product._id
        }')">✕</button>
      </div>
    </div>`;
    container.appendChild(row);
  });

  renderSummary(cart);
}

// ---------------------------
// 💰 CART SUMMARY + DELIVERY
// ---------------------------
function calculateSubtotal(cart) {
  return cart.reduce(
    (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 1),
    0
  );
}

function renderSummary(cart) {
  const existing = document.querySelector(".cart-summary");
  if (existing) existing.remove();

  const summary = document.createElement("div");
  summary.className = "cart-summary";
  const subtotal = calculateSubtotal(cart);

  summary.innerHTML = `
    <h2>Summary</h2>
    <p>Subtotal: <strong>₦${subtotal.toLocaleString("en-NG")}</strong></p>
  `;
  document.querySelector(".cart-layout")?.appendChild(summary);
}

function renderSummaryWithDelivery() {
  const container = document.querySelector(".cart-summary");
  if (!container) return;

  const deliveryOption = document.querySelector(
    'input[name="delivery"]:checked'
  );
  const deliveryFee = deliveryOption ? parseFloat(deliveryOption.value) : 0;

  const subtotal = parseFloat(
    container.querySelector("strong").textContent.replace(/[^\d]/g, "")
  );

  container.innerHTML = `
    <h2>Summary</h2>
    <p>Subtotal: ₦${subtotal.toLocaleString("en-NG")}</p>
    <p>Delivery: ₦${deliveryFee.toLocaleString("en-NG")}</p>
    <p><strong>Total: ₦${(subtotal + deliveryFee).toLocaleString(
      "en-NG"
    )}</strong></p>
  `;
}

// ---------------------------
// 🧾 Guest Cart (Updated)
// ---------------------------
function renderGuestCart() {
  const container = document.getElementById("cartItems");
  if (!container) return;

  const guestCart = (() => {
    const v = cookieGet("guestCart");
    return v ? JSON.parse(v) : [];
  })();

  container.innerHTML = "";

  if (!guestCart.length) {
    container.innerHTML = `
      <div class="empty-cart">
        <p>🛒 Your guest cart is empty.</p>
        <button class="btn" onclick="window.location.href='/Pages/market.html'">
          🛍️ Continue Shopping
        </button>
      </div>`;
    renderSummary([]);
    return;
  }

  guestCart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="../images/placeholder.png" alt="Product" class="cart-item-img" />
      <div class="cart-item-details">
        <h3>Product ID: ${item.productId}</h3>
        <div class="cart-item-actions">
          <div class="quantity-control">
            <span class="qty">${item.quantity}</span>
          </div>
          <button class="remove-item" onclick="removeGuestItem('${item.productId}')">✕</button>
        </div>
      </div>`;
    container.appendChild(row);
  });

  renderSummary(
    guestCart.map((i) => ({ product: { price: 0 }, quantity: i.quantity }))
  );
}

function removeGuestItem(productId) {
  let guestCart = (() => {
    const v = cookieGet("guestCart");
    return v ? JSON.parse(v) : [];
  })();
  guestCart = guestCart.filter((i) => i.productId !== productId);
  cookieSet("guestCart", JSON.stringify(guestCart), 7);
  renderGuestCart();
}
window.removeGuestItem = removeGuestItem;

document.addEventListener("DOMContentLoaded", async () => {
  const user = await authCheck();
  if (user) {
    await renderCart(); // user logged in
  } else {
    renderGuestCart(); // guest mode
  }
});

const guestCart = (() => {
  const v = cookieGet("guestCart");
  return v ? JSON.parse(v) : [];
})();
if (guestCart?.length) {
  for (const item of guestCart) {
    await addToCart(item.productId, item.quantity);
  }
  cookieRemove("guestCart");
}

document
  .querySelectorAll('input[name="delivery"]')
  .forEach((el) => el.addEventListener("change", renderSummaryWithDelivery));

// ---------------------------
// 🚀 INIT
// ---------------------------
document.addEventListener("DOMContentLoaded", async () => {
  const user = await authCheck();
  if (user) await renderCart();
  showStep(currentStep);
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("nextBtn")?.addEventListener("click", nextStep);
  document.getElementById("prevBtn")?.addEventListener("click", prevStep);
  console.log("✅ Step navigation initialized");
});

async function loadRecommendations() {
  const container = document.querySelector(".recommendations"); // ✅ match your HTML
  if (!container) return;

  container.innerHTML = "<p>Loading recommendations...</p>";

  try {
    // ✅ Fetch product data from backend
    const { products } = await apiFetch("/api/products?limit=8");
    container.innerHTML = "";

    // ✅ Handle empty data
    if (!products || !products.length) {
      container.innerHTML = "<p>No recommendations available right now.</p>";
      return;
    }

    // ✅ Render product cards
    products.forEach((p) => {
      const card = document.createElement("div");
      card.className = "recom-card";

      const imageSrc =
        (Array.isArray(p.images) && p.images.length > 0 && p.images[0]) ||
        "../images/placeholder.png";
      const price = Number(p.price || 0).toLocaleString("en-NG");

      card.innerHTML = `
        <img src="${imageSrc}" alt="${p.name || "Product"}" />
        <p>${p.name || "Unnamed Product"}</p>
        <span>₦${price}</span>
      `;

      // ✅ Navigate to product page
      card.addEventListener("click", () => {
        window.location.href = `/Pages/products.html?id=${p._id}`;
      });

      container.appendChild(card);
    });
  } catch (err) {
    console.error("⚠️ Failed to load recommendations:", err);
    container.innerHTML =
      "<p>⚠️ Error loading products. Please try again later.</p>";
  }
}

async function checkoutCart(paymentMethod) {
  try {
    const cart = await loadCart();
    if (!cart.length) {
      alert("🛒 Your cart is empty!");
      return;
    }

    // ✅ Delivery details
    const deliveryOption = document.querySelector(
      'input[name="delivery"]:checked'
    );
    const deliveryFee = deliveryOption ? parseFloat(deliveryOption.value) : 0;
    const deliveryMethod = deliveryFee === 700 ? "pickup" : "delivery";

    // ✅ Collect checkout info
    const info = {
      fullName: document.querySelector("#fullName").value.trim(),
      email: document.querySelector("#email").value.trim(),
      location: document.querySelector("#location").value.trim(),
      notes: document.querySelector("#notes").value.trim(),
      phone: document.querySelector("#phone").value.trim(),
      paymentMethod,
      deliveryFee,
      deliveryMethod,
      shippingAddress: {
        name: document.querySelector("#fullName").value.trim(),
        phone: document.querySelector("#phone").value.trim(),
        address: document.querySelector("#location").value.trim(),
        notes: document.querySelector("#notes").value.trim(),
      },
      items: cart,
    };

    // 🏦 Handle transfer method separately
    if (paymentMethod === "transfer") {
      // Hide checkout steps and show transfer form
      document.querySelector(".checkout-steps").classList.add("hidden");
      const transferForm = document.getElementById("transferForm");
      transferForm.classList.remove("hidden");

      // Get escrow bank details from backend
      const bankRes = await apiFetch("/api/orders/escrow-details");
      const { bankName, accountNumber, accountName } = bankRes.data || {};

      // Populate the form with backend data
      transferForm.querySelector(
        "p:nth-of-type(2)"
      ).innerHTML = `<strong>Bank Name:</strong> ${bankName || "Loading..."}`;
      transferForm.querySelector(
        "p:nth-of-type(3)"
      ).innerHTML = `<strong>Account Number:</strong> ${
        accountNumber || "N/A"
      }`;
      transferForm.querySelector(
        "p:nth-of-type(4)"
      ).innerHTML = `<strong>Account Name:</strong> ${accountName || "N/A"}`;

      // Handle proof upload submission
      const transferSubmit = transferForm.querySelector("form");
      transferSubmit.onsubmit = async (e) => {
        e.preventDefault();

        const proofInput = transferSubmit.querySelector("input[type='file']");
        if (!proofInput.files.length) {
          alert("⚠️ Please upload proof of transfer.");
          return;
        }

        const formData = new FormData();
        formData.append("paymentProof", proofInput.files[0]);
        formData.append("orderInfo", JSON.stringify(info));

        const res = await apiFetch("/api/orders/transfer", {
          method: "POST",
          body: formData,
        });

        if (res.success) {
          alert("✅ Transfer submitted! Your payment will be verified soon.");
          window.location.href = "/Pages/checkout-success.html";
        } else {
          alert("❌ Failed to submit transfer proof. Try again.");
        }
      };

      return; // Stop normal checkout
    }

    // 💳 For other payment methods
    const res = await apiFetch("/api/orders/checkout", {
      method: "POST",
      body: JSON.stringify(info),
    });

    alert("✅ Checkout successful!");
    window.location.href = "/Pages/checkout-success.html";
  } catch (err) {
    console.error("❌ Checkout failed:", err);
    alert("⚠️ Checkout failed. Please try again.");
  }
}

// 🔧 Helper for file selection
async function selectFile() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.pdf";
    input.onchange = () => resolve(input.files[0]);
    input.click();
  });
}

// ✅ Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", loadRecommendations);

document.addEventListener("DOMContentLoaded", () => {
  const cardForm = document.getElementById("cardPaymentForm");
  const transferForm = document.querySelector("#transferForm form");

  // 💳 Card Payment Submission
  if (cardForm) {
    cardForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      showLoading(true, "Initializing card payment...");

      const cardData = {
        number: document.getElementById("cardNumber").value.trim(),
        expiry: document.getElementById("expiryDate").value.trim(),
        cvv: document.getElementById("cvv").value.trim(),
      };

      try {
        const res = await apiFetch("/api/payments/initialize", {
          method: "POST",
          body: JSON.stringify({
            method: "card",
            cardData,
          }),
        });

        showLoading(false);

        if (res.authorizationUrl) {
          // Redirect to payment page (Paystack/Flutterwave)
          window.location.href = res.authorizationUrl;
        } else {
          alert("✅ Payment simulated successfully (test mode).");
          console.log("Payment response:", res);
        }
      } catch (err) {
        showLoading(false);
        alert("❌ Payment failed to initialize.");
        console.error("Payment error:", err);
      }
    });
  }

  // 🏦 Bank Transfer Proof Upload
  if (transferForm) {
    transferForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const proofFile =
        transferForm.querySelector('input[type="file"]').files[0];
      if (!proofFile) {
        alert("Please upload proof of payment.");
        return;
      }

      showLoading(true, "Uploading payment proof...");

      const formData = new FormData();
      formData.append("paymentProof", proofFile);
      formData.append("method", "transfer");

      try {
        const res = await apiFetch("/api/payments/confirm", {
          method: "POST",
          body: formData,
        });

        showLoading(false);

        if (res.success) {
          alert(
            "✅ Transfer confirmed! Your order is now pending seller confirmation."
          );
          goBackToCheckout();
        } else {
          alert("⚠️ Payment confirmation failed. Please contact support.");
        }
      } catch (err) {
        showLoading(false);
        console.error("❌ Transfer upload failed:", err);
        alert("Error uploading proof of payment.");
      }
    });
  }
});

// ✅ Attach listener for card payment form
document.getElementById("cardForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payBtn = e.target.querySelector("button[type='submit']");
  payBtn.disabled = true;
  payBtn.textContent = "Processing...";

  try {
    // ✅ Get the active order from the backend session
    const orderResponse = await apiFetch("/api/orders/current", {
      method: "GET",
    });
    if (!orderResponse || !orderResponse._id) {
      alert("No active order found. Please create an order first.");
      return;
    }

    const res = await apiFetch("/api/payments/initialize", {
      method: "POST",
      body: JSON.stringify({
        orderId: orderResponse._id,
        provider: "Paystack",
      }),
    });

    if (res.authorization_url) {
      window.location.href = res.authorization_url; // ✅ Secure redirect to Paystack
    } else {
      console.error("Missing payment URL in response:", res);
      alert("Failed to start payment. Please try again.");
    }
  } catch (err) {
    console.error("💥 Payment initialization error:", err);
    alert("Unable to initialize payment. Please try again later.");
  } finally {
    payBtn.disabled = false;
    payBtn.textContent = "Pay with Card";
  }
});