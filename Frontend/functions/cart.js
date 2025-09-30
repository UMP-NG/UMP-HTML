let currentStep = 1;

function showStep(step) {
  const allSteps = document.querySelectorAll(".step-content");
  const steps = document.querySelectorAll(".step");
  const labels = document.querySelectorAll(".step-label");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  // Remove active/completed classes
  allSteps.forEach((s) => s.classList.remove("active"));
  steps.forEach((s) => s.classList.remove("active", "completed"));
  labels.forEach((l) => l.classList.remove("active-label"));

  // Show current step
  document
    .querySelector(`.step-content[data-step="${step}"]`)
    ?.classList.add("active");
  steps[step - 1]?.classList.add("active");
  labels[step - 1]?.classList.add("active-label");

  // Mark previous as completed
  for (let i = 0; i < step - 1; i++) {
    steps[i]?.classList.add("completed");
  }

  // Button logic
  if (step === 1) {
    prevBtn.style.display = "none";
    nextBtn.textContent = "Next";
  } else if (step === steps.length) {
    prevBtn.style.display = "inline-block";
    nextBtn.textContent = "Finish";
  } else {
    prevBtn.style.display = "inline-block";
    nextBtn.textContent = "Next";
  }
}

function nextStep() {
  const totalSteps = document.querySelectorAll(".step").length;

  if (currentStep < totalSteps) {
    currentStep++;
    showStep(currentStep);
  } else {
    // ✅ Instead of finishing immediately, check payment method
    const paymentChoice = document.querySelector(
      'input[name="payment"]:checked'
    );
    if (!paymentChoice) {
      alert("Please select a payment method.");
      return;
    }

    // hide progressive sections
    document
      .querySelectorAll(
        ".forgot-something, .btn-container, .step-content, .progress-container, .progress-label"
      )
      .forEach((sec) => (sec.style.display = "none"));

    // hide both forms first
    document.getElementById("cardForm").classList.add("hidden");
    document.getElementById("transferForm").classList.add("hidden");

    // show the selected form
    if (paymentChoice.value === "card") {
      document.getElementById("cardForm").classList.remove("hidden");
    } else if (paymentChoice.value === "transfer") {
      document.getElementById("transferForm").classList.remove("hidden");
    }

    // optional: disable the next/finish button so user uses form
    document.getElementById("nextBtn").style.display = "none";
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
  }
}

function goBackToCheckout() {
  // hide forms
  document.getElementById("cardForm").classList.add("hidden");
  document.getElementById("transferForm").classList.add("hidden");

  // restore checkout sections
  document
    .querySelectorAll(
      ".forgot-something, .btn-container, .step-content, .progress-container, .progress-label"
    )
    .forEach((sec) => (sec.style.display = ""));

  // bring back the navigation buttons
  document.getElementById("nextBtn").style.display = "inline-block";
  document.getElementById("prevBtn").style.display = "inline-block";
}

window.goBackToCheckout = goBackToCheckout;

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  showStep(currentStep);

  document.getElementById("nextBtn")?.addEventListener("click", nextStep);
  document.getElementById("prevBtn")?.addEventListener("click", prevStep);

  if (typeof updateCartCount === "function") updateCartCount();
  if (typeof renderCart === "function") renderCart();
});

// Expose functions globally if needed
window.nextStep = nextStep;
window.prevStep = prevStep;

// ✅ Make cart functions available for inline onclicks
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;

// ---------------------------
// CART UTILITIES (localStorage)
// ---------------------------
const CART_KEY = "cart";

// Load cart from localStorage
function loadCart() {
  const raw = localStorage.getItem(CART_KEY);
  console.log("🔄 Loading cart from localStorage:", raw);
  return JSON.parse(raw) || [];
}

// Save cart to localStorage
function saveCart(cart) {
  console.log("💾 Saving cart:", cart);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Add product to cart
function addToCart(productId) {
  const product = allProducts.find((p) => p.id == productId);
  if (!product) return;

  let cart = loadCart();
  let existing = cart.find((item) => item.id == product.id);

  if (existing) {
    existing.quantity += 1; // ✅ use quantity
  } else {
    cart.push({ ...product, quantity: 1 }); // ✅ use quantity
  }

  saveCart(cart);
  console.log("Cart updated:", cart); // ✅ debug log
  updateCartCount();
}

// Remove product
function removeFromCart(productId) {
  console.log("🗑 Removing product:", productId);
  let cart = loadCart().filter((item) => item.id != productId);
  saveCart(cart);
  renderCart();
  updateCartCount();
}

// Update quantity
function updateQuantity(productId, change) {
  let cart = loadCart();
  let item = cart.find((p) => p.id == productId);

  if (item) {
    item.quantity += change; // ✅ use quantity
    if (item.quantity <= 0) {
      cart = cart.filter((p) => p.id != productId);
    }
  }

  saveCart(cart);
  renderCart();
  updateCartCount();
}

// ---------------------------
// MARKETPLACE HANDLERS
// ---------------------------
document.addEventListener("click", (e) => {
  if (e.target.closest(".add-to-cart")) {
    const id = e.target.closest(".add-to-cart").dataset.productId;
    console.log("🖱 Clicked Add to Cart:", id);
    addToCart(id);
  }

  if (e.target.closest(".quick-view")) {
    const id = e.target.closest(".quick-view").dataset.productId;
    console.log("👁 Quick view product:", id);
    openQuickView(id);
  }
});

// ---------------------------
// QUICK VIEW MODAL
// ---------------------------
function openQuickView(productId) {
  const product = allProducts.find((p) => p.id == productId);
  console.log("🔍 Opening quick view:", product);

  if (!product) return;

  document.getElementById("modalProductImage").src = product.image;
  document.getElementById("modalProductName").textContent = product.name;
  document.getElementById("modalProductPrice").textContent = product.price;
  document.getElementById("modalProductDesc").textContent = product.desc;
  document.getElementById("modalSellerName").textContent = product.seller;
  document.getElementById("modalStoreName").textContent = product.store;
  document.getElementById("modalCategory").textContent = product.category;

  document.getElementById("quickViewModal").style.display = "block";
}

document.getElementById("closeModal")?.addEventListener("click", () => {
  console.log("❎ Closing quick view modal");
  document.getElementById("quickViewModal").style.display = "none";
});

// ---------------------------
// CART PAGE RENDERING
// ---------------------------
function renderCart() {
  const container = document.getElementById("cartItems");
  if (!container) {
    console.warn("❌ No #cartItems container found in DOM");
    return;
  }

  let cart = loadCart();
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = `<p>Your cart is empty</p>`;
    return;
  }

  console.log("🖼 Rendering cart with items:", cart);

  cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item";

    // Use first image in array if available
    const imgSrc = item.images?.[0] || "../images/placeholder.png";

    row.innerHTML = `
      <img src="${imgSrc}" alt="${item.name}" class="cart-item-img" />
      <div class="cart-item-details">
        <h3 class="product-name">${item.name}</h3>
        <a href="#" class="seller-name">${item.seller?.store || "Unknown Store"}</a>
        <p class="product-attr">Condition: ${item.condition}</p>
        <div class="cart-item-actions">
          <div class="quantity-control">
            <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
            <span class="qty">${item.quantity}</span>
            <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
          </div>
          <span class="line-price">${item.price}</span>
          <button class="remove-item" onclick="removeFromCart(${item.id})">✕</button>
        </div>
      </div>
    `;

    container.appendChild(row);
  });

  renderSummary(cart);
}


function renderSummary(cart) {
  const existing = document.querySelector(".cart-summary");
  if (existing) existing.remove();

  const summary = document.createElement("div");
  summary.className = "cart-summary";

  const subtotal = cart.reduce((sum, item) => {
    const price = parseFloat(item.price.replace(/[^\d.]/g, ""));
    return sum + price * item.quantity;
  }, 0);

  summary.innerHTML = `
    <h2>Summary</h2>
    <p>Subtotal: <strong>₦${subtotal.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}</strong></p>
  `;

  document.querySelector(".cart-layout")?.appendChild(summary);
}

// ---------------------------
// DELIVERY OPTIONS
// ---------------------------
function updateDelivery() {
  const cart = loadCart();
  let subtotal = cart.reduce((sum, item) => {
    const price = parseFloat(item.price.replace(/[^\d.]/g, ""));
    return sum + price * item.quantity;
  }, 0);

  // Get selected delivery
  const deliveryOption = document.querySelector(
    'input[name="delivery"]:checked'
  );
  if (!deliveryOption) return subtotal; // no delivery selected yet

  const deliveryFee = parseFloat(deliveryOption.value);
  return subtotal + deliveryFee;
}

function renderSummaryWithDelivery() {
  const container = document.querySelector(".cart-summary");
  if (!container) return;

  const cart = loadCart();
  let subtotal = cart.reduce((sum, item) => {
    const price = parseFloat(item.price.replace(/[^\d.]/g, ""));
    return sum + price * item.quantity;
  }, 0);

  const deliveryOption = document.querySelector(
    'input[name="delivery"]:checked'
  );
  const deliveryFee = deliveryOption ? parseFloat(deliveryOption.value) : 0;

  container.innerHTML = `
    <h2>Summary</h2>
    <p>Subtotal: <strong>₦${subtotal.toLocaleString("en-NG")}</strong></p>
    <p>Delivery: <strong>₦${deliveryFee.toLocaleString("en-NG")}</strong></p>
    <p>Total: <strong>₦${(subtotal + deliveryFee).toLocaleString(
      "en-NG"
    )}</strong></p>
  `;
}

// Re-render summary when delivery option changes
document.querySelectorAll('input[name="delivery"]').forEach((el) => {
  el.addEventListener("change", renderSummaryWithDelivery);
});

// ✅ Update nextStep validation to require delivery
const originalNextStep = nextStep;
nextStep = function () {
  if (currentStep === 1) {
    // step with delivery
    const selectedDelivery = document.querySelector(
      'input[name="delivery"]:checked'
    );
    if (!selectedDelivery) {
      alert("Please select a delivery option to proceed.");
      return;
    }
  }
  originalNextStep();
};

// Call renderSummaryWithDelivery initially to include delivery fee if selected
document.addEventListener("DOMContentLoaded", renderSummaryWithDelivery);

document.addEventListener("DOMContentLoaded", () => {
  const cardNumber = document.getElementById("cardNumber");
  const expiryDate = document.getElementById("expiryDate");
  const cvv = document.getElementById("cvv");

  // Format Card Number (1234 5678 9012 3456)
  cardNumber.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, ""); // remove non-digits
    value = value.substring(0, 16); // max 16 digits
    e.target.value = value.replace(/(\d{4})(?=\d)/g, "$1 "); // add spaces
  });

  // Format Expiry Date (MM/YY)
  expiryDate.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, ""); // remove non-digits
    if (value.length >= 3) {
      value = value.substring(0, 4);
      e.target.value = value.replace(/(\d{2})(\d{1,2})/, "$1/$2");
    } else {
      e.target.value = value;
    }
  });

  // CVV only allows 3 digits
  cvv.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "").substring(0, 3);
  });
});
