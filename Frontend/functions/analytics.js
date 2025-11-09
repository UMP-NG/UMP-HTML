const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ump-html-1.onrender.com";

// ---------------- Load Seller Profile ----------------
async function loadSellerProfile() {
  try {
    const res = await fetch(`${API_BASE}/api/sellers/me`, { credentials: "include" });
    if (!res.ok) throw new Error("Unable to load profile");

    const seller = await res.json();

    const profileImg = document.querySelector(".profile img");
    const profileName = document.querySelector(".profile span");

    profileImg.src = seller.logo || "../images/guy.png";
    profileName.textContent =
      seller.storeName || seller.businessName || "Unnamed Seller";
  } catch (err) {
    console.error("Profile load failed:", err);
    const profileImg = document.querySelector(".profile img");
    const profileName = document.querySelector(".profile span");
    if (profileImg) profileImg.src = "../images/guy.png";
    if (profileName) profileName.textContent = "Unknown Seller";
  }
}
loadSellerProfile();

// Safe global fallback renderer so other DOMContentLoaded scopes can call
// `renderProducts(...)` before the full renderer is declared below.
if (!window.renderProducts) {
  window.renderProducts = function (data) {
    try {
      window.products = data || [];
      const productTableBody = document.getElementById("productTableBody");
      if (!productTableBody) return;
      if (!data || data.length === 0) {
        productTableBody.innerHTML = `\n        <tr><td colspan="6" class="empty">No products available. Click "Add New Product" to create one!</td></tr>`;
        return;
      }

      productTableBody.innerHTML = (data || [])
        .map(
          (p) => `
        <tr>
          <td class="product-info">
            <img src="${
              p.images?.[0]
                ? p.images[0].startsWith("/uploads")
                  ? p.images[0]
                  : `/uploads/${p.images[0]}`
                : "/images/placeholder.png"
            }" alt="${p.name}" width="40">
            <span>${p.name}</span>
          </td>
          <td>${p.status || "Active"}</td>
          <td>${p.stock ?? 0}</td>
          <td>${p.views ?? 0}</td>
          <td>${p.sales ?? 0}</td>
          <td>
          <div class="action-icons">
            <button class="edit-btn btn" data-id="${p._id}">Edit</button>
            <button class="delete-btn btn" data-id="${p._id}">Delete</button>
          </div>  
          </td>
        </tr>`
        )
        .join("");
    } catch (err) {
      console.warn("renderProducts fallback error:", err);
    }
  };
}

// Product quick edit functionality
// Sidebar toggle and basic navigation
const sidebar = document.querySelector(".sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener("click", () =>
    sidebar.classList.toggle("open")
  );

  // Close sidebar when clicking outside
  document.addEventListener("click", (e) => {
    if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
      sidebar.classList.remove("open");
    }
  });

  // Section navigation using data-target
  document.querySelectorAll(".sidebar a").forEach((link) => {
    link.addEventListener("click", (e) => {
      // allow external return link navigation
      if (link.classList.contains("return-link")) return;
      e.preventDefault();
      const target = link.dataset.target;
      if (!target) return;
      document
        .querySelectorAll(".content")
        .forEach((s) => (s.style.display = "none"));
      const el = document.getElementById(target);
      if (el) el.style.display = "block";
      document
        .querySelectorAll(".sidebar a")
        .forEach((a) => a.classList.remove("active"));
      link.classList.add("active");
      sidebar.classList.remove("open");
    });
  });
}

// Dashboard KPI loader
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch(`/api/seller-dashboard`, {
      credentials: "include",
    });
    if (!res.ok) return; // silently ignore if endpoint not present
    const data = await res.json();

    const totals = data.totals || {};
    const productPerformance = Array.isArray(data.productPerformance)
      ? data.productPerformance
      : [];
    const recentOrders = Array.isArray(data.recentOrders)
      ? data.recentOrders
      : [];

    const totalRevenueEl = document.getElementById("kpiTotalRevenue");
    const ordersCountEl = document.getElementById("kpiOrdersCount");
    const viewsEl = document.getElementById("kpiViews");
    const inventoryEl = document.getElementById("kpiInventoryValue");

    if (totalRevenueEl)
      totalRevenueEl.textContent = `₦${(
        totals.totalRevenue || 0
      ).toLocaleString()}`;
    if (ordersCountEl) ordersCountEl.textContent = totals.ordersThisWeek || 0;
    const totalViews = productPerformance.reduce(
      (s, p) => s + (p.views || 0),
      0
    );
    if (viewsEl) {
      // show formatted number and provide raw value in title for copy/readers
      viewsEl.textContent = Number(totalViews || 0).toLocaleString();
      viewsEl.title = String(totalViews || 0);
    }
    if (inventoryEl)
      inventoryEl.textContent = `₦${(
        totals.inventoryValue || 0
      ).toLocaleString()}`;

    // populate recent orders table if present
    const ordersBody = document.getElementById("last10OrdersBody");
    if (ordersBody) {
      if (recentOrders.length === 0) {
        ordersBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No recent orders.</td></tr>`;
      } else {
        ordersBody.innerHTML = recentOrders
          .map(
            (o) => `
          <tr>
            <td>${o._id || "—"}</td>
            <td>${o.buyer?.name || "Unknown Buyer"}</td>
            <td>${o.items?.length || 0}</td>
            <td>${o.status || "Pending"}</td>
            <td><button class="viewOrderBtn" data-id="${
              o._id
            }">View</button></td>
          </tr>
        `
          )
          .join("");
      }
    }
  } catch (err) {
    console.warn("Dashboard summary fetch failed:", err);
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const quickEditPanel = document.getElementById("quickEditPanel");
  const quickEditForm = document.getElementById("quickEditForm");
  const editDropZone = document.getElementById("editDropZone");
  const editImages = document.getElementById("editImages");
  const editPreview = document.getElementById("editPreview");
  const editColorPicker = document.getElementById("editColorPicker");
  const editColorNameInput = document.getElementById("editColorNameInput");
  const editAddColorBtn = document.getElementById("editAddColorBtn");
  const editColorSwatches = document.getElementById("editColorSwatches");
  const editSpecsContainer = document.getElementById("editSpecsContainer");
  const editAddSpecBtn = document.getElementById("editAddSpecBtn");
  const editLoadingOverlay = document.getElementById("editLoadingOverlay");
  const cancelEditBtn = document.getElementById("cancelEdit");
  const clearEditImagesBtn = document.getElementById("clearEditImages");

  let currentProduct = null;
  let editSelectedFiles = [];
  let editSelectedColors = [];
  // track filenames (relative to /uploads) of existing images the user removed
  let removedExistingImages = [];

  // Handle drag and drop for images
  editDropZone.addEventListener("click", () => editImages.click());

  editDropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    editDropZone.classList.add("active");
  });

  editDropZone.addEventListener("dragleave", () => {
    editDropZone.classList.remove("active");
  });

  editDropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    editDropZone.classList.remove("active");
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    handleImageFiles(files);
  });

  // Handle file input change
  editImages.addEventListener("change", (e) => {
    handleImageFiles(Array.from(e.target.files));
  });

  function handleImageFiles(files) {
    editSelectedFiles = [...editSelectedFiles, ...files];
    renderEditPreviews();
  }

  function renderEditPreviews() {
    editPreview.innerHTML = "";
    editSelectedFiles.forEach((file, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "image-preview-item";

      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      wrapper.appendChild(img);

      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-image";
      removeBtn.textContent = "×";
      removeBtn.onclick = (e) => {
        e.preventDefault();
        editSelectedFiles.splice(index, 1);
        renderEditPreviews();
      };
      wrapper.appendChild(removeBtn);

      editPreview.appendChild(wrapper);
    });
  }

  // Clear images
  clearEditImagesBtn.addEventListener("click", () => {
    editSelectedFiles = [];
    editImages.value = "";
    renderEditPreviews();
  });

  // Color management
  editAddColorBtn.addEventListener("click", () => {
    const colorCode = editColorPicker.value;
    const colorName = editColorNameInput.value.trim();

    if (!colorCode || !colorName) {
      alert("Please enter both color and name.");
      return;
    }

    if (
      editSelectedColors.some(
        (c) =>
          c.code === colorCode ||
          c.name.toLowerCase() === colorName.toLowerCase()
      )
    ) {
      alert("This color is already added.");
      return;
    }

    addColor({ name: colorName, code: colorCode });
    editColorNameInput.value = "";
  });

  function addColor(color) {
    editSelectedColors.push(color);
    renderColors();
  }

  function renderColors() {
    editColorSwatches.innerHTML = "";
    editSelectedColors.forEach((color, index) => {
      const chip = document.createElement("div");
      chip.className = "color-chip";
      chip.innerHTML = `
                <span class="color-dot" style="background-color: ${color.code}"></span>
                <span>${color.name}</span>
                <button type="button" class="remove-color">×</button>
            `;

      chip.querySelector(".remove-color").onclick = () => {
        editSelectedColors.splice(index, 1);
        renderColors();
      };

      editColorSwatches.appendChild(chip);
    });
  }

  // Specifications management
  editAddSpecBtn.addEventListener("click", () => {
    const specRow = document.createElement("div");
    specRow.className = "spec-row";
    specRow.innerHTML = `
            <input type="text" name="specKey" placeholder="Specification name" required>
            <input type="text" name="specValue" placeholder="Specification value" required>
            <button type="button" class="remove-spec" aria-label="Remove specification">×</button>
        `;

    specRow.querySelector(".remove-spec").onclick = () => specRow.remove();
    editSpecsContainer.appendChild(specRow);
  });

  // Open quick edit panel
  function openQuickEdit(product) {
    currentProduct = product;
    quickEditForm.dataset.id = product._id;

    // Basic info
    quickEditForm.querySelector("#editName").value = product.name || "";
    quickEditForm.querySelector("#editPrice").value = product.price || "";
    quickEditForm.querySelector("#editStock").value = product.stock || 0;
    quickEditForm.querySelector("#editDesc").value = product.desc || "";
    quickEditForm.querySelector("#editCondition").value =
      product.condition || "New";
    quickEditForm.querySelector("#editStatus").value =
      product.status || "Active";

    // Colors
    editSelectedColors = product.colors || [];
    renderColors();

    // Specs
    editSpecsContainer.innerHTML = "";
    if (product.specs && Object.keys(product.specs).length > 0) {
      Object.entries(product.specs).forEach(([key, value]) => {
        const specRow = document.createElement("div");
        specRow.className = "spec-row";
        specRow.innerHTML = `
                    <input type="text" name="specKey" value="${key}" required>
                    <input type="text" name="specValue" value="${value}" required>
                    <button type="button" class="remove-spec" aria-label="Remove specification">×</button>
                `;
        specRow.querySelector(".remove-spec").onclick = () => specRow.remove();
        editSpecsContainer.appendChild(specRow);
      });
    }

    // Reset image selection
    editSelectedFiles = [];
    editPreview.innerHTML = "";

    // Show existing images
    if (product.images && product.images.length > 0) {
      product.images.forEach((imgPath) => {
        const wrapper = document.createElement("div");
        // mark as existing images so we can distinguish between newly added files
        // and previously-uploaded ones when submitting the form
        wrapper.className = "image-preview-item existing-image";

        const img = document.createElement("img");
        img.src = imgPath.startsWith("/uploads")
          ? imgPath
          : `/uploads/${imgPath}`;
        // store the original path/filename for backend remove requests
        img.dataset.url = imgPath.startsWith("/uploads")
          ? imgPath.split("/uploads/")[1]
          : imgPath;
        wrapper.appendChild(img);

        const removeBtn = document.createElement("button");
        removeBtn.className = "remove-image";
        removeBtn.textContent = "×";
        // For existing images, record removal and remove from DOM immediately.
        removeBtn.onclick = (e) => {
          e.preventDefault();
          const orig = img.dataset.url;
          if (orig) removedExistingImages.push(orig);
          // remove wrapper from DOM so preview updates instantly
          wrapper.remove();
        };
        wrapper.appendChild(removeBtn);

        editPreview.appendChild(wrapper);
      });
    }

    quickEditPanel.classList.add("view");
  }

  // Form submission
  quickEditForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    editLoadingOverlay.classList.add("active");

    const formData = new FormData();

    // Basic info
    formData.append("name", quickEditForm.editName.value);
    formData.append("price", quickEditForm.editPrice.value);
    formData.append("stock", quickEditForm.editStock.value);
    formData.append("desc", quickEditForm.editDesc.value);
    formData.append("condition", quickEditForm.editCondition.value);
    formData.append("status", quickEditForm.editStatus.value);

    // Colors
    formData.append("colors", JSON.stringify(editSelectedColors));

    // Specifications
    const specs = {};
    editSpecsContainer.querySelectorAll(".spec-row").forEach((row) => {
      const key = row.querySelector('[name="specKey"]').value;
      const value = row.querySelector('[name="specValue"]').value;
      if (key && value) specs[key] = value;
    });
    formData.append("specs", JSON.stringify(specs));

    // New images
    editSelectedFiles.forEach((file) => formData.append("images", file));

    // ---------------------------
    // Handle removed existing images (send to backend so it can delete them)
    // We record removals into removedExistingImages when user clicks remove.
    if (removedExistingImages.length > 0) {
      formData.set("removeImages", JSON.stringify(removedExistingImages));
    }

    // ---------------------------
    // Handle replaceImages flag — if there's a checkbox in the form
    const replaceImagesCheckbox = document.getElementById("replaceImages");
    if (replaceImagesCheckbox) {
      formData.set(
        "replaceImages",
        replaceImagesCheckbox.checked ? "true" : "false"
      );
    }

    try {
      const id = quickEditForm.dataset.id;
      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to update product");

      const updated = await res.json();

      // Update the shared (possibly-global) products array and re-render.
      // Use window.products so this handler (defined in a different DOMContentLoaded
      // scope) can safely access the current list.
      const globalProducts = window.products || [];

      if (Array.isArray(globalProducts)) {
        window.products = globalProducts.map((p) =>
          p._id === id ? updated.product : p
        );
        // prefer calling the globally-exposed renderProducts if available
        (window.renderProducts || renderProducts)(window.products);
      } else if (globalProducts && globalProducts._id === id) {
        window.products = updated.product;
        (window.renderProducts || renderProducts)([window.products]);
      } else {
        (window.renderProducts || renderProducts)([]);
      }

      quickEditPanel.classList.remove("view");
      alert("✅ Product updated successfully!");
    } catch (err) {
      console.error("❌ Update error:", err);
      alert("Failed to update product");
    } finally {
      editLoadingOverlay.classList.remove("active");
    }
  });

  // Close panel
  cancelEditBtn.addEventListener("click", () => {
    quickEditPanel.classList.remove("view");
  });

  // Export the openQuickEdit function for use in other scripts
  window.openQuickEdit = openQuickEdit;
});

document.addEventListener("DOMContentLoaded", async () => {
  const ordersBody = document.getElementById("ordersTableBody");
  const orderAlert = document.getElementById("orderAlert");
  const alertText = orderAlert.querySelector("span");
  const closeAlert = document.getElementById("closeAlert");
  const viewOrdersBtn = document.getElementById("viewOrdersBtn");
  const filters = document.querySelectorAll(".filter-btn");
  const sortSelect = document.getElementById("sortOrders");
  const searchInput = document.getElementById("orderSearch");

  let orders = [];
  let filteredOrders = [];

  // ✅ Fetch seller orders securely via cookie
  async function fetchOrders() {
    try {
      const res = await fetch(`${API_BASE}/api/seller-dashboard/orders`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          alert("Session expired. Please log in again.");
          return (window.location.href = "/login.html");
        }
        throw new Error("Failed to fetch orders");
      }

      const data = await res.json();
      orders = Array.isArray(data.orders) ? data.orders : [];
      filteredOrders = [...orders];

      updateAlert();
      renderOrdersTable();
    } catch (err) {
      console.error("❌ Orders Fetch Error:", err);
      ordersBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Failed to load orders.</td></tr>`;
    }
  }

  // ✅ Update top alert if new orders exist
  function updateAlert() {
    const newOrders = orders.filter(
      (o) => (o.status || "").toLowerCase() === "new"
    );
    if (newOrders.length > 0) {
      alertText.textContent = `${newOrders.length} New Orders Awaiting Action`;
      orderAlert.style.display = "flex";
    } else {
      orderAlert.style.display = "none";
    }
  }

  // ✅ Render orders table with fallbacks
  function renderOrdersTable() {
    if (filteredOrders.length === 0) {
      ordersBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No orders found.</td></tr>`;
      return;
    }

    ordersBody.innerHTML = filteredOrders
      .map((o) => {
        const orderId = o._id || "—";
        const buyerName = o.buyer?.name || "Unknown Buyer";
        const itemCount = o.items?.length || 0;
        const status = o.status || "Pending";
        const date = o.createdAt
          ? new Date(o.createdAt).toLocaleDateString()
          : "—";
        const total = o.total ? `₦${o.total.toLocaleString()}` : "₦0";

        return `
          <tr>
            <td>${orderId}</td>
            <td>${buyerName}</td>
            <td>${itemCount}</td>
            <td class="status-${status.toLowerCase()}">${status}</td>
            <td>${date}</td>
            <td>${total}</td>
            <td><button class="view-order-btn" data-id="${orderId}">View</button></td>
          </tr>
        `;
      })
      .join("");
  }

  // ✅ Filter by status
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const status = btn.getAttribute("data-status");
      filteredOrders =
        status === "all"
          ? [...orders]
          : orders.filter((o) => (o.status || "").toLowerCase() === status);

      renderOrdersTable();
    });
  });

  // ✅ Sort by dropdown
  sortSelect.addEventListener("change", () => {
    const val = sortSelect.value;
    filteredOrders.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      const totalA = a.total || 0;
      const totalB = b.total || 0;

      if (val === "date-desc") return dateB - dateA;
      if (val === "date-asc") return dateA - dateB;
      if (val === "value-desc") return totalB - totalA;
      if (val === "value-asc") return totalA - totalB;
      return 0;
    });
    renderOrdersTable();
  });

  // ✅ Search by order ID or buyer name
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    filteredOrders = orders.filter(
      (o) =>
        (o._id || "").toLowerCase().includes(query) ||
        (o.buyer?.name || "").toLowerCase().includes(query)
    );
    renderOrdersTable();
  });

  // ✅ Alert actions
  closeAlert.addEventListener(
    "click",
    () => (orderAlert.style.display = "none")
  );
  viewOrdersBtn.addEventListener("click", () => {
    document.querySelector('[data-status="new"]').click();
    orderAlert.style.display = "none";
  });

  // ✅ View single order details
  ordersBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("view-order-btn")) {
      const orderId = e.target.dataset.id;
      const order = orders.find((o) => o._id === orderId);
      showOrderDetails(order);
    }
  });

  // ✅ Display detailed order info
  function showOrderDetails(order) {
    const panel = document.getElementById("orderDetailsPanel");
    if (!order) return;

    document.getElementById("panelOrderId").textContent = `Order ID: ${
      order._id || "—"
    }`;
    document.getElementById("panelBuyer").textContent =
      order.buyer?.name || "Unknown Buyer";
    document.getElementById("panelAddress").textContent =
      order.buyer?.address || "No address provided";
    document.getElementById("panelContact").textContent =
      order.buyer?.email || "No contact info";

    const defaultImg = "../images/default-product.png";
    document.getElementById("panelItems").innerHTML = order.items?.length
      ? order.items
          .map(
            (i) => `
        <div class="order-item">
          <img src="${i.product?.image || defaultImg}" alt="${
              i.product?.name || "Product"
            }" width="40">
          <span>${i.product?.name || "Unnamed Product"}</span> × ${
              i.quantity || 1
            }
        </div>`
          )
          .join("")
      : "<p>No items available.</p>";

    document.getElementById("panelSubtotal").textContent = `₦${(
      order.subtotal || 0
    ).toLocaleString()}`;
    document.getElementById("panelShipping").textContent = `₦${(
      order.shipping || 0
    ).toLocaleString()}`;
    document.getElementById("panelTax").textContent = `₦${(
      order.tax || 0
    ).toLocaleString()}`;
    document.getElementById("panelTotal").textContent = `₦${(
      order.total || 0
    ).toLocaleString()}`;

    document.getElementById("panelHistory").innerHTML = order.history?.length
      ? order.history
          .map(
            (h) =>
              `<li>${h.status || "Unknown Status"} — ${new Date(
                h.date || Date.now()
              ).toLocaleString()}</li>`
          )
          .join("")
      : "<li>No history available.</li>";

    panel.setAttribute("aria-hidden", "false");
    panel.classList.add("active");

    document.getElementById("closePanel").onclick = () => {
      panel.setAttribute("aria-hidden", "true");
      panel.classList.remove("active");
    };
  }

  // 🚀 Initialize on load
  fetchOrders();
});

document.addEventListener("DOMContentLoaded", async () => {
  console.log("✅ Script loaded, DOM fully parsed");

  // DOM references
  const productTableBody = document.getElementById("productTableBody");
  const addProductBtn = document.getElementById("addProductBtn");
  const addProductModal = document.getElementById("addProductModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const addProductForm = document.getElementById("addProductForm");
  const inventoryBanner = document.getElementById("inventoryBanner");
  const dismissBannerBtn = document.getElementById("dismissBannerBtn");
  const quickEditPanel = document.getElementById("quickEditPanel");
  const quickEditForm = document.getElementById("quickEditForm");
  const imageInput = document.getElementById("imageInput");
  const previewContainer = document.querySelector(".image-preview");
  const clearImagesBtn = document.getElementById("clearImagesBtn");
  // Category & spec elements
  const categorySelect = document.getElementById("category");
  const subcategorySelect = document.getElementById("subcategory");
  const specsContainer = document.getElementById("specsContainer");
  const addSpecBtn = document.getElementById("addSpecBtn");

  // keep products in a window-global slot so other DOMContentLoaded handlers
  // (like the quick-edit panel above) can access and update the same array.
  let products = (window.products = window.products || []);
  let categorySpecsMap = {};

  /* ==========================================================
     🧭 LOAD PRODUCTS
  ========================================================== */
  async function loadProducts() {
    console.log("📦 Loading products...");
    try {
      const res = await fetch(`${API_BASE}/api/products/my`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      console.log("🧾 Products response:", data);
      products = Array.isArray(data.products) ? data.products : data;
      // mirror into the global so other handlers can see updates
      window.products = products;
      renderProducts(products);
      checkLowStock(products);
    } catch (err) {
      console.error("❌ Error loading products:", err);
      productTableBody.innerHTML = `<tr><td colspan="6" class="empty">No products found or failed to load.</td></tr>`;
    }
  }

  /* ==========================================================
     🖼️ RENDER PRODUCTS TABLE
  ========================================================== */
  function renderProducts(data) {
    if (!data || data.length === 0) {
      productTableBody.innerHTML = `
        <tr><td colspan="6" class="empty">No products available. Click "Add New Product" to create one!</td></tr>`;
      return;
    }

    productTableBody.innerHTML = data
      .map(
        (p) => `
        <tr>
          <td class="product-info">
            <img src="${
              p.images?.[0]
                ? p.images[0].startsWith("/uploads")
                  ? p.images[0]
                  : `/uploads/${p.images[0]}`
                : "/images/placeholder.png"
            }" alt="${p.name}" width="40">
            <span>${p.name}</span>
          </td>
          <td>${p.status || "Active"}</td>
          <td>${p.stock ?? 0}</td>
          <td>${p.views ?? 0}</td>
          <td>${p.sales ?? 0}</td>
          <td>
          <div class="action-icons">
            <button class="edit-btn btn" data-id="${p._id}">Edit</button>
            <button class="delete-btn btn" data-id="${p._id}">Delete</button>
          </div>  
          </td>
        </tr>`
      )
      .join("");
  }

  // expose renderProducts globally so other scripts/handlers (quick-edit, product page)
  // can safely call it even if they run in a different DOMContentLoaded scope.
  window.renderProducts = renderProducts;

  // Delegate edit/delete button clicks from the products table
  productTableBody?.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    if (btn.classList.contains("edit-btn")) {
      e.stopPropagation();
      const id = btn.dataset.id;
      const product = products.find((p) => p._id === id);
      if (product) openQuickEdit(product);
      return;
    }

    if (btn.classList.contains("delete-btn")) {
      e.stopPropagation();
      const id = btn.dataset.id;
      deleteProduct(id);
    }
  });

  /* ==========================================================
     ⚠️ LOW STOCK CHECK
  ========================================================== */
  function checkLowStock(data) {
    const lowStock = data.filter((p) => (p.stock ?? 0) < 5);
    if (lowStock.length > 0) {
      inventoryBanner.dataset.visible = "true";
      inventoryBanner.querySelector(".banner-text").textContent = `⚠️ ${
        lowStock.length
      } product${lowStock.length > 1 ? "s" : ""} low in stock`;
    } else {
      inventoryBanner.dataset.visible = "false";
    }
  }

  dismissBannerBtn?.addEventListener("click", () => {
    inventoryBanner.dataset.visible = "false";
  });

  /* ==========================================================
     🧩 CATEGORY + SUBCATEGORY + SPECS
  ========================================================== */
  async function loadCategories() {
    try {
      const res = await fetch(`${API_BASE}/api/categories`);
      if (!res.ok) throw new Error("Failed to load categories");
      const categories = await res.json();

      categorySelect.innerHTML = `<option value="">Select Category</option>`;
      categories.forEach((cat) => {
        const opt = document.createElement("option");
        opt.value = cat._id;
        opt.textContent = cat.name;
        categorySelect.appendChild(opt);

        // define specs for each category
        categorySpecsMap[cat.name.toLowerCase()] = getDefaultSpecs(cat.name);
      });
    } catch (err) {
      console.error("❌ Error loading categories:", err);
    }
  }

  async function loadSubcategories(categoryId) {
    try {
      const res = await fetch(`${API_BASE}/api/categories/sub?parent=${categoryId}`);
      if (!res.ok) throw new Error("Failed to load subcategories");
      const subs = await res.json();
      subcategorySelect.innerHTML = `<option value="">Select Subcategory</option>`;
      subs.forEach((sub) => {
        const opt = document.createElement("option");
        opt.value = sub._id;
        opt.textContent = sub.name;
        subcategorySelect.appendChild(opt);
      });
    } catch (err) {
      console.error("❌ Error loading subcategories:", err);
    }
  }

  // Auto specs based on category
  function getDefaultSpecs(categoryName) {
    const lower = categoryName.toLowerCase();
    if (lower.includes("phone") || lower.includes("mobile"))
      return ["Brand", "Model", "Storage", "RAM", "Battery"];
    if (lower.includes("laptop"))
      return ["Brand", "Processor", "RAM", "Storage", "Screen Size"];
    if (lower.includes("fashion") || lower.includes("clothing"))
      return ["Size", "Color", "Material", "Brand"];
    if (lower.includes("shoe")) return ["Size", "Color", "Material", "Type"];
    if (lower.includes("electronics"))
      return ["Brand", "Power", "Model", "Warranty"];
    if (lower.includes("home"))
      return ["Material", "Dimensions", "Color", "Brand"];
    return [];
  }

  function populateSpecs(categoryName) {
    specsContainer.innerHTML = "";
    const specs = categorySpecsMap[categoryName.toLowerCase()] || [];
    if (specs.length === 0) {
      const note = document.createElement("p");
      note.textContent = "No default specs for this category. Add manually.";
      specsContainer.appendChild(note);
    } else {
      specs.forEach((key) => {
        const wrapper = document.createElement("div");
        wrapper.className = "spec-item";
        wrapper.innerHTML = `
          <input type="text" name="specKey[]" value="${key}" readonly>
          <input type="text" name="specValue[]" placeholder="Enter ${key}" required>
        `;
        specsContainer.appendChild(wrapper);
      });
    }
  }

  addSpecBtn?.addEventListener("click", () => {
    const wrapper = document.createElement("div");
    wrapper.className = "spec-item";
    wrapper.innerHTML = `
      <input type="text" name="specKey[]" placeholder="Specification name" required>
      <input type="text" name="specValue[]" placeholder="Value" required>
      <button type="button" class="removeSpecBtn">×</button>
    `;
    specsContainer.appendChild(wrapper);

    wrapper.querySelector(".removeSpecBtn").addEventListener("click", () => {
      wrapper.remove();
    });
  });

  categorySelect?.addEventListener("change", (e) => {
    const categoryId = e.target.value;
    const selectedText = e.target.options[e.target.selectedIndex].text;
    if (categoryId) {
      loadSubcategories(categoryId);
      populateSpecs(selectedText);
    } else {
      subcategorySelect.innerHTML = `<option value="">Select Subcategory</option>`;
      specsContainer.innerHTML = "";
    }
  });

  /* ==========================================================
     ➕ ADD PRODUCT MODAL
  ========================================================== */
  addProductBtn?.addEventListener("click", () =>
    addProductModal.classList.add("active")
  );
  closeModalBtn?.addEventListener("click", () =>
    addProductModal.classList.remove("active")
  );
  addProductModal?.addEventListener("click", (e) => {
    if (e.target === addProductModal)
      addProductModal.classList.remove("active");
  });

  addProductForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Create FormData from the form but ensure we don't keep any auto-added
    // `images` entries (browsers will include file inputs automatically)
    // — we append selectedFiles manually to avoid duplicates.
    const formData = new FormData(addProductForm);
    // remove any existing 'images' entries that may already be present
    // (prevents double-uploading the same files)
    try {
      formData.delete("images");
    } catch (e) {
      /* ignore in older browsers */
    }

    // append images manually (so we use the files from selectedFiles array)
    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    for (const [key, val] of formData.entries()) console.log(key, val);

    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to add product");

      const newProduct = await res.json();
      console.log("✅ Product added:", newProduct);

      if (newProduct.product) {
        products.unshift(newProduct.product);
        // keep global in sync
        window.products = products;
      } else {
        await loadProducts();
        // loadProducts will sync window.products
      }

      renderProducts(products);
      checkLowStock(products);
      addProductModal.classList.remove("active");
      addProductForm.reset();
      selectedFiles = []; // reset after upload
      previewContainer.innerHTML = "";
      alert("✅ Product added successfully!");
    } catch (err) {
      console.error("❌ Error adding product:", err);
      alert("Failed to add product");
    }
  });

  let selectedFiles = [];

  imageInput.addEventListener("change", (e) => {
    const newFiles = Array.from(e.target.files);

    // Merge existing + new
    selectedFiles = [...selectedFiles, ...newFiles];

    // Update input
    const dataTransfer = new DataTransfer();
    selectedFiles.forEach((file) => dataTransfer.items.add(file));
    imageInput.files = dataTransfer.files;

    // Refresh preview
    renderPreviews();
  });

  // ✅ Remove All button
  clearImagesBtn.addEventListener("click", () => {
    selectedFiles = [];
    imageInput.value = ""; // clear input
    previewContainer.innerHTML = "";
  });

  // ✅ Helper to render previews
  function renderPreviews() {
    previewContainer.innerHTML = "";
    selectedFiles.forEach((file, index) => {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.style.width = "80px";
      img.style.height = "80px";
      img.style.objectFit = "cover";
      img.style.marginRight = "5px";
      img.style.borderRadius = "6px";
      img.title = "Click to remove";

      // click to remove single image
      img.addEventListener("click", () => {
        selectedFiles.splice(index, 1);
        const dt = new DataTransfer();
        selectedFiles.forEach((f) => dt.items.add(f));
        imageInput.files = dt.files;
        renderPreviews();
      });

      previewContainer.appendChild(img);
    });
  }

  /* ==========================================================
     🗑️ DELETE PRODUCT
  ========================================================== */
  async function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      products = products.filter((p) => p._id !== id);
      // sync global view
      window.products = products;
      renderProducts(products);
      checkLowStock(products);
      alert("🗑️ Product deleted successfully");
    } catch (err) {
      console.error("❌ Delete error:", err);
      alert("Failed to delete product");
    }
  }

  const colors = [];
  const colorPicker = document.getElementById("colorPicker");
  const colorNameInput = document.getElementById("colorNameInput");
  const addColorBtn = document.getElementById("addColorBtn");
  const colorSwatchesContainer = document.getElementById(
    "colorSwatchesContainer"
  );
  const colorsInput = document.getElementById("colorsInput");

  addColorBtn.addEventListener("click", () => {
    const colorCode = colorPicker.value;
    const colorName = colorNameInput.value.trim() || colorCode;

    if (!colorCode) return alert("Please select a color.");

    // prevent duplicate colors
    if (colors.find((c) => c.code === colorCode)) {
      alert("Color already added.");
      return;
    }

    const newColor = { name: colorName, code: colorCode };
    colors.push(newColor);
    colorsInput.value = JSON.stringify(colors);

    // add color swatch visually
    const swatch = document.createElement("div");
    swatch.classList.add("color-swatch");
    swatch.style.backgroundColor = colorCode;
    swatch.title = colorName;

    // remove on click
    swatch.addEventListener("click", () => {
      const index = colors.findIndex((c) => c.code === colorCode);
      if (index > -1) colors.splice(index, 1);
      colorsInput.value = JSON.stringify(colors);
      swatch.remove();
    });

    colorSwatchesContainer.appendChild(swatch);

    // reset fields
    colorNameInput.value = "";
  });

  /* ==========================================================
     🔍 SEARCH + SORT
  ========================================================== */
  document.getElementById("productSearch")?.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(term)
    );
    renderProducts(filtered);
  });

  document.getElementById("sortOptions")?.addEventListener("change", (e) => {
    const val = e.target.value;
    let sorted = [...products];
    if (val === "stock") sorted.sort((a, b) => a.stock - b.stock);
    if (val === "sales") sorted.sort((a, b) => b.sales - a.sales);
    if (val === "date")
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    renderProducts(sorted);
  });

  /* ==========================================================
     🚀 INITIAL LOAD
  ========================================================== */
  console.log("🚀 Initializing...");
  await Promise.all([loadCategories(), loadProducts()]);
});

// =========================================================
// 📨 MESSAGING DASHBOARD HANDLER (with empty/fallback states)
// =========================================================

// Elements
const conversationListEl = document.querySelector(".conversation-list");
const chatPanelEl = document.querySelector(".chat-panel");
const chatHeaderEl = chatPanelEl.querySelector(".chat-header h3");
const chatMessagesEl = chatPanelEl.querySelector(".chat-messages");
const searchInput = document.getElementById("searchConversations");
const newMessageInput = document.getElementById("newMessageInput");
const sendBtn = document.getElementById("sendMessageBtn");
const backBtn = document.getElementById("backToConversations");

let conversations = [];
let activeConversation = null;
let currentUser = null;

// ✅ Fetch logged-in user
async function fetchCurrentUser() {
  try {
    const res = await fetch(`${API_BASE}/api/users/me`, { credentials: "include" });
    if (!res.ok) throw new Error(`User not logged in (${res.status})`);
    currentUser = await res.json();
    console.log("✅ Current user:", currentUser);
  } catch (err) {
    console.warn(
      "⚠️ Unable to load current user — redirecting or fallback",
      err
    );
    showEmptyState("user");
  }
}

// ✅ Fetch all user conversations
async function fetchConversations() {
  try {
    const res = await fetch(`${API_BASE}/api/messages/conversations`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
    const data = await res.json();
    conversations = Array.isArray(data) ? data : [];
    renderConversationList();
  } catch (err) {
    console.error("🚫 Error fetching conversations:", err);
    showEmptyState("conversations");
  }
}

// ✅ Fetch messages in a conversation
async function fetchMessages(conversationWith) {
  try {
    const res = await fetch(`${API_BASE}/api/messages?userId=${conversationWith}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error(`Message fetch failed (${res.status})`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("🚫 Error fetching messages:", err);
    return [];
  }
}

// ✅ Send new message
async function sendMessage(receiverId, text) {
  try {
    const res = await fetch(`${API_BASE}/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ receiver: receiverId, text }),
    });
    if (!res.ok) throw new Error(`Failed to send message (${res.status})`);
    const msg = await res.json();
    return msg;
  } catch (err) {
    console.error("🚫 Send message error:", err);
    alert("Could not send message. Please try again.");
  }
}

// ✅ Mark conversation as read
async function markConversationRead(conversationWith) {
  try {
    await fetch(`${API_BASE}/api/messages/${conversationWith}/read`, {
      method: "PUT",
      credentials: "include",
    });
  } catch (err) {
    console.warn("⚠️ Error marking conversation read:", err);
  }
}

// ✅ Render conversation list
function renderConversationList(filter = "") {
  conversationListEl.innerHTML = ""; // Clear list first

  if (!conversations.length) {
    showEmptyState("conversations");
    return;
  }

  const filtered = conversations.filter((c) =>
    c?.name?.toLowerCase().includes(filter.toLowerCase())
  );

  if (!filtered.length) {
    conversationListEl.innerHTML = `<div class="empty-state">No matches found</div>`;
    return;
  }

  filtered.forEach((conv) => {
    const convEl = document.createElement("div");
    convEl.classList.add("conversation");
    convEl.dataset.id = conv.conversationWith || conv._id || "";

    if (conv.unreadCount > 0) convEl.classList.add("flash");

    const name = conv.name || "Unknown User";
    const lastMsg = conv.latestMessage || "No messages yet";

    convEl.innerHTML = `
      <div class="avatar">${name.charAt(0).toUpperCase()}</div>
      <div class="conversation-info">
        <h4>${name}</h4>
        ${
          conv.unreadCount
            ? `<span class="unread-badge">${conv.unreadCount}</span>`
            : ""
        }
        <p>${lastMsg}</p>
      </div>
      <span class="time">${
        conv.latestCreatedAt
          ? new Date(conv.latestCreatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : ""
      }</span>
    `;
    conversationListEl.appendChild(convEl);
  });
}

// ✅ Render messages in a conversation
async function renderChat(conversationWithId, name) {
  chatMessagesEl.innerHTML = `<div class="loading">Loading...</div>`;
  chatHeaderEl.textContent = name || "Chat";
  activeConversation = conversationWithId;

  const messages = await fetchMessages(conversationWithId);
  chatMessagesEl.innerHTML = "";

  if (!messages.length) {
    chatMessagesEl.innerHTML = `<div class="empty-state">No messages yet. Say hello!</div>`;
    return;
  }

  messages.forEach((msg) => {
    const isSent = msg.sender?._id === currentUser?._id;
    const msgEl = document.createElement("div");
    msgEl.classList.add("message", isSent ? "sent" : "received");
    msgEl.innerHTML = `
      <p>${msg.text || "(no text)"}</p>
      <span class="time">${
        msg.createdAt
          ? new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "time unknown"
      }</span>
    `;
    chatMessagesEl.appendChild(msgEl);
  });

  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;

  await markConversationRead(conversationWithId);
  await fetchConversations(); // refresh unread indicators
}

// ✅ Show empty state UI
function showEmptyState(type) {
  const map = {
    user: `<div class="empty-state">⚠️ You’re not logged in. Please sign in to view messages.</div>`,
    conversations: `<div class="empty-state">💬 No conversations found yet.</div>`,
  };
  conversationListEl.innerHTML =
    map[type] || `<div class="empty-state">Nothing to show</div>`;
  chatMessagesEl.innerHTML = "";
}

// ✅ Search filter
searchInput?.addEventListener("input", (e) =>
  renderConversationList(e.target.value)
);

// ✅ Handle click on conversation
conversationListEl?.addEventListener("click", (e) => {
  const convEl = e.target.closest(".conversation");
  if (!convEl) return;

  const id = convEl.dataset.id;
  const name = convEl.querySelector("h4")?.textContent || "Chat";

  renderChat(id, name);

  conversationListEl
    .querySelectorAll(".conversation")
    .forEach((c) => c.classList.remove("active"));
  convEl.classList.add("active");

  if (window.innerWidth <= 768) {
    conversationListEl.classList.add("hidden");
    chatPanelEl.classList.add("active");
  }
});

// ✅ Send button click
sendBtn?.addEventListener("click", async () => {
  const text = newMessageInput.value.trim();
  if (!text || !activeConversation) return;

  const msg = await sendMessage(activeConversation, text);
  if (!msg) return;

  const msgEl = document.createElement("div");
  msgEl.classList.add("message", "sent", "show");
  msgEl.innerHTML = `
    <p>${msg.text}</p>
    <span class="time">${new Date(msg.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}</span>`;
  chatMessagesEl.appendChild(msgEl);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  newMessageInput.value = "";

  await fetchConversations(); // refresh sidebar
});

// ✅ Mobile back button
backBtn?.addEventListener("click", () => {
  conversationListEl.classList.remove("hidden");
  chatPanelEl.classList.remove("active");
});

// ✅ Initialize
(async function init() {
  await fetchCurrentUser();
  await fetchConversations();
})();

document.addEventListener("DOMContentLoaded", async () => {
  const minPayout = 100;

  // Elements
  const requestBtn = document.getElementById("requestPayoutBtn");
  const availablePayoutEl = document.getElementById("availablePayout");
  const payoutAccountEl = document.getElementById("payoutAccount");
  const editPayoutMethodEl = document.getElementById("editPayoutMethod");
  const transactionTableBody = document.getElementById("transactionTableBody"); // ✅ For empty state

  let availablePayout = 0;
  let transactions = [];
  let payoutMethod = null;

  // ✅ Fetch payouts and payout method
  async function fetchPayouts() {
    try {
      const res = await fetch(`${API_BASE}/api/payouts`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to load payouts");

      const data = await res.json();
      transactions = Array.isArray(data.payouts) ? data.payouts : [];

      payoutMethod = data.method || {
        bankName: "Not linked",
        accountNumber: "N/A",
      };

      // ✅ Compute pending balance
      availablePayout = transactions
        .filter((p) => p.status === "pending")
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      updateUI();

      // ✅ Show empty state if no transactions
      if (!transactions.length) {
        showEmptyState("No payout transactions yet.");
      }
    } catch (err) {
      console.error("❌ Error fetching payouts:", err);
      fallbackUI("₦0.00", "Bank Account: Not available");
      showEmptyState("Failed to load payouts. Please refresh the page.");
    }
  }

  // ✅ Update earnings card display
  function updateUI() {
    availablePayoutEl.textContent = `₦${availablePayout.toLocaleString()}`;

    if (payoutMethod?.bankName && payoutMethod?.accountNumber) {
      payoutAccountEl.textContent = `Bank Account: ${
        payoutMethod.bankName
      } - ${maskAccountNumber(payoutMethod.accountNumber)}`;
    } else {
      payoutAccountEl.textContent = "Bank Account: Not linked";
    }

    updatePayoutButton();
  }

  // ✅ Mask account number
  function maskAccountNumber(number) {
    if (!number) return "****";
    return number.replace(/\d(?=\d{4})/g, "*");
  }

  // ✅ Handle button state
  function updatePayoutButton() {
    if (availablePayout >= minPayout) {
      requestBtn.disabled = false;
      requestBtn.classList.remove("disabled");
    } else {
      requestBtn.disabled = true;
      requestBtn.classList.add("disabled");
    }
  }

  // ✅ Empty state renderer
  function showEmptyState(message) {
    if (!transactionTableBody) return; // in case table doesn't exist on this page

    transactionTableBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="5">
          <div class="empty-state">
            <img src="../images/empty-payout.png" alt="No Data" />
            <p>${message}</p>
          </div>
        </td>
      </tr>
    `;
  }

  // ✅ Fallback for major errors
  function fallbackUI(balanceText, accountText) {
    availablePayoutEl.textContent = balanceText;
    payoutAccountEl.textContent = accountText;
    requestBtn.disabled = true;
    requestBtn.classList.add("disabled");
  }

  // ✅ Handle payout request
  requestBtn.addEventListener("click", async () => {
    if (availablePayout < minPayout)
      return alert(`Minimum payout is ₦${minPayout}`);

    try {
      const res = await fetch(`${API_BASE}/api/payouts/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: availablePayout,
          method: "bank",
          accountDetails: payoutMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to request payout");

      alert("✅ Payout request submitted successfully!");
      await fetchPayouts();
    } catch (err) {
      console.error("❌ Payout request failed:", err);
      alert("Failed to request payout. Please try again.");
    }
  });

  // ✅ Edit payout method handler
  editPayoutMethodEl.addEventListener("click", (e) => {
    e.preventDefault();
    alert("🔒 Edit payout method feature coming soon!");
    // (Later replace with modal to update bank details)
  });

  // ✅ Initial load
  await fetchPayouts();
});

// ========== Accordion Behavior ==========
document.querySelectorAll(".accordion-header").forEach((header) => {
  header.addEventListener("click", () => {
    const item = header.parentElement;
    item.classList.toggle("active");
  });
});

// ========== 2FA Toggle ==========
const toggle2FA = document.getElementById("toggle2FA");
const twoFASetup = document.getElementById("twoFASetup");
toggle2FA.addEventListener("change", () => {
  twoFASetup.classList.toggle("hidden", !toggle2FA.checked);
});

// ========== Fetch and Load Seller Info ==========
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch(`${API_BASE}/api/users/me`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch user data");
    const user = await res.json();

    document.getElementById("currentEmail").textContent =
      user.email || "Not set";
    document.getElementById("storeName").value = user.storeName || "";
    document.getElementById("storeBio").value = user.storeBio || "";
    document.getElementById("instagram").value = user.socials?.instagram || "";
    document.getElementById("tiktok").value = user.socials?.tiktok || "";
  } catch (err) {
    console.error("Error fetching profile:", err);
  }

  // ✅ Load notification preferences after user loads
  await loadNotificationPreferences();
});

// ========== Save Password ==========
document
  .getElementById("savePasswordBtn")
  .addEventListener("click", async () => {
    const oldPassword = document.getElementById("oldPassword").value;
    const newPassword = document.getElementById("newPassword").value;

    if (!oldPassword || !newPassword)
      return alert("Please fill in both password fields.");

    try {
      const res = await fetch(`${API_BASE}/api/users/update-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      alert(data.message || "Password updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Error updating password.");
    }
  });

// ========== Save Password ==========
document
  .getElementById("savePasswordBtn")
  .addEventListener("click", async () => {
    const oldPassword = document.getElementById("oldPassword").value;
    const newPassword = document.getElementById("newPassword").value;

    if (!oldPassword || !newPassword)
      return alert("Please fill in both password fields.");

    try {
      const res = await fetch(`${API_BASE}/api/users/update-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      alert(data.message || "Password updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Error updating password.");
    }
  });

// ========== Save Store Profile ==========
document
  .getElementById("saveProfileBtn")
  .addEventListener("click", async () => {
    const formData = new FormData();
    formData.append("storeName", document.getElementById("storeName").value);
    formData.append("storeBio", document.getElementById("storeBio").value);
    formData.append("instagram", document.getElementById("instagram").value);
    formData.append("tiktok", document.getElementById("tiktok").value);
    const file = document.getElementById("storeLogo").files[0];
    if (file) formData.append("logo", file);

    try {
      const res = await fetch(`${API_BASE}/api/sellers/settings`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      alert(data.message || "Store profile saved.");
    } catch (err) {
      console.error(err);
      alert("Failed to save store profile.");
    }
  });

// ========== Notification Preferences ==========
const notificationPrefsContainer = document.getElementById("notificationPrefs");

async function loadNotificationPreferences() {
  try {
    const res = await fetch(`${API_BASE}/api/notifications/preferences`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to load preferences");

    const data = await res.json();
    const prefs = data.preferences || {};

    notificationPrefsContainer
      .querySelectorAll("input[type='checkbox']")
      .forEach((cb) => {
        const type = cb.dataset.type;
        cb.checked = prefs[type] ?? false;
      });
  } catch (err) {
    console.error("❌ Error loading notification preferences:", err);
  }
}

// ✅ Handle toggle updates
notificationPrefsContainer
  .querySelectorAll("input[type='checkbox']")
  .forEach((cb) => {
    cb.addEventListener("change", async () => {
      const type = cb.dataset.type;
      const enabled = cb.checked;

      try {
        const res = await fetch(`${API_BASE}/api/notifications/preferences`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ type, enabled }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to update");

        console.log(`✅ ${type} notification set to ${enabled}`);
      } catch (err) {
        console.error("❌ Error saving notification preference:", err);
        alert("Error updating notification preference.");
      }
    });
  });

// ========== Save Policies ==========
document
  .getElementById("savePoliciesBtn")
  .addEventListener("click", async () => {
    const returnPolicy = document.getElementById("returnPolicy").value;
    const shippingRates = document.getElementById("shippingRates").value;
    const pickups = Array.from(
      document.querySelectorAll(".pickup-options input:checked")
    ).map((cb) => cb.value);

    try {
      const res = await fetch(`${API_BASE}/api/sellers/policies`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ returnPolicy, shippingRates, pickups }),
      });
      const data = await res.json();
      alert(data.message || "Policies saved successfully.");
    } catch (err) {
      console.error(err);
      alert("Error saving policies.");
    }
  });

// ========== Deactivate Account ==========
document
  .getElementById("deactivateAccountBtn")
  .addEventListener("click", async () => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;

    try {
      const res = await fetch(`${API_BASE}/api/users/deactivate`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      alert(data.message || "Account deactivated.");
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert("Error deactivating account.");
    }
  });

// ✅ Load notification preferences on page load
document.addEventListener("DOMContentLoaded", loadNotificationPreferences);

// ----- Accommodation Section -----
document.addEventListener("DOMContentLoaded", () => {
  const addListingBtn = document.getElementById("addListingBtn");
  const addListingModal = document.getElementById("addListingModal");
  const closeListingModalBtn = document.getElementById("closeListingModalBtn");
  const addListingForm = document.getElementById("addListingForm");
  const listingImageInput = document.getElementById("listingImageInput");
  const previewContainer = document.getElementById("listingPreviewContainer");
  const clearListingImagesBtn = document.getElementById(
    "clearListingImagesBtn"
  );
  const listingTableBody = document.getElementById("listingTableBody");
  const listingVideoInput = document.getElementById("listingVideoInput");
  const videoPreview = document.getElementById("videoPreview");
  const clearVideoBtn = document.getElementById("clearVideoBtn");
  const listingTypeSelect = document.getElementById("listingType");
  const submitBtn = addListingForm.querySelector("button[type='submit']");

  // Loader
  const loader = document.createElement("div");
  loader.className = "loader";
  loader.innerText = "Loading...";
  loader.style.textAlign = "center";
  loader.style.padding = "10px";

  // Open modal
  addListingBtn.addEventListener("click", () => {
    addListingModal.setAttribute("aria-hidden", "false");
    addListingModal.style.display = "flex";
  });

  // Close modal
  closeListingModalBtn.addEventListener("click", () => {
    addListingModal.setAttribute("aria-hidden", "true");
    addListingModal.style.display = "none";
  });

  // Preview images with fade-in
  listingImageInput.addEventListener("change", () => {
    previewContainer.innerHTML = "";
    Array.from(listingImageInput.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.style.opacity = 0;
        img.style.transition = "opacity 0.5s";
        previewContainer.appendChild(img);
        setTimeout(() => (img.style.opacity = 1), 50);
      };
      reader.readAsDataURL(file);
    });
  });

  // Clear images
  clearListingImagesBtn.addEventListener("click", () => {
    listingImageInput.value = "";
    previewContainer.innerHTML = "";
  });

  // Preview video
  listingVideoInput.addEventListener("change", () => {
    const file = listingVideoInput.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      videoPreview.src = url;
      videoPreview.style.display = "block";
      videoPreview.style.opacity = 0;
      videoPreview.style.transition = "opacity 0.5s";
      setTimeout(() => (videoPreview.style.opacity = 1), 50);
      clearVideoBtn.style.display = "inline-block";
    }
  });

  // Clear video
  clearVideoBtn.addEventListener("click", () => {
    listingVideoInput.value = "";
    videoPreview.src = "";
    videoPreview.style.display = "none";
    clearVideoBtn.style.display = "none";
  });

  // Submit listing
  addListingForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(addListingForm);
    // ensure we don't double-include images if the file input is part of the form
    try {
      formData.delete("images");
    } catch (e) {
      // ignore
    }

    // Ensure type is included
    formData.set("type", listingTypeSelect.value);

    // Append images (we deleted any auto-added 'images' above)
    Array.from(listingImageInput.files).forEach((file) =>
      formData.append("images", file)
    );

    // Append video
    if (listingVideoInput.files.length > 0) {
      formData.append("videos", listingVideoInput.files[0]);
    }

    try {
      submitBtn.disabled = true;
      submitBtn.innerText = "Saving...";
      const res = await fetch(`${API_BASE}/api/listings/`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to save the listing");
      }

      const newListing = await res.json();
      alert("Accommodation added successfully!");
      addListingForm.reset();
      previewContainer.innerHTML = "";
      videoPreview.src = "";
      videoPreview.style.display = "none";
      clearVideoBtn.style.display = "none";
      addListingModal.style.display = "none";

      appendListingRow(newListing.listing);
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = "+ Add Listing";
    }
  });

  // Add a new row or fallback message
  function appendListingRow(listing) {
    const emptyMsg = document.getElementById("emptyListingMsg");
    if (emptyMsg) emptyMsg.remove();

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${listing.name}</td>
      <td>${listing.type}</td>
      <td>${listing.price}</td>
      <td>${listing.beds}</td>
      <td>${listing.baths}</td>
      <td>
        <button class="btn-clear" data-id="${listing._id}">Delete</button>
      </td>
    `;
    listingTableBody.appendChild(row);

    // Attach delete handler
    row.querySelector(".btn-clear").addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = e.currentTarget.dataset.id;
      if (!confirm("Are you sure you want to delete this listing?")) return;
      try {
        const res = await fetch(`${API_BASE}/api/listings/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to delete");
        row.remove();
      } catch (err) {
        alert("Error deleting listing");
      }
    });
  }

  // Initial fetch of listings with loader
  async function loadListings() {
    listingTableBody.appendChild(loader);
    try {
      const res = await fetch(`${API_BASE}/api/listings/`);
      if (!res.ok) throw new Error("Failed to fetch listings");
      const data = await res.json();
      const listings = data.listings;

      loader.remove();
      if (!listings || listings.length === 0) {
        const tr = document.createElement("tr");
        tr.id = "emptyListingMsg";
        tr.innerHTML = `<td colspan="6" style="text-align:center; font-style:italic;">No accommodations found.</td>`;
        listingTableBody.appendChild(tr);
      } else {
        listings.forEach((listing) => appendListingRow(listing));
      }
    } catch (err) {
      loader.remove();
      console.error(err);
    }
  }

  loadListings();
});
