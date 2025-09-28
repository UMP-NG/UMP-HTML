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
    // Optional: handle form submission on finish
    alert("Form completed!");
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
  }
}

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
    row.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
      <div class="cart-item-details">
        <h3 class="product-name">${item.name}</h3>
        <a href="#" class="seller-name">${item.seller}</a>
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

  // ✅ render summary after items
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
    <p>Subtotal: <strong>₦${subtotal.toFixed(2)}</strong></p>
    <button class="btn checkout-btn" id="nextBtn">Next</button>
  `;

  document.querySelector(".cart-layout")?.appendChild(summary);

  const checkoutBtn = summary.querySelector(".checkout-btn");
  checkoutBtn.addEventListener("click", () => {
    nextStep();
  });
}