const links = document.querySelectorAll(".sidebar a");
const contents = document.querySelectorAll(".content");

links.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    console.log("🔗 Clicked link:", link.textContent);

    // Remove active class from all links
    links.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    console.log("✔ Active link set:", link.textContent);

    const targetId = link.getAttribute("data-target");
    console.log("🎯 Target content ID:", targetId);

    // Hide all contents
    contents.forEach((content) => {
      content.classList.remove("active");
      console.log("❌ Hiding content:", content.id);
    });

    // Show the target content
    const targetContent = document.getElementById(targetId);
    if (targetContent) {
      targetContent.classList.add("active");
      console.log("✅ Showing content:", targetContent.id);
    } else {
      console.warn("⚠ No content found for ID:", targetId);
    }
  });
});

document.querySelectorAll(".chart-toggle").forEach((btn, index) => {
  btn.addEventListener("click", () => {
    const panel = btn.nextElementSibling;
    panel.classList.toggle("active");

    if (!panel.dataset.chartInit) {
      const ctx = panel.querySelector("canvas").getContext("2d");
      new Chart(ctx, {
        // Chart is now globally available
        type: "line",
        data: {
          labels: [
            "Day 1",
            "Day 5",
            "Day 10",
            "Day 15",
            "Day 20",
            "Day 25",
            "Day 30",
          ],
          datasets: [
            {
              label: "Sales",
              data: [5, 8, 12, 6, 15, 20, 18],
              borderColor: "#2851cb",
              backgroundColor: "rgba(40,81,203,0.1)",
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { x: { display: false }, y: { display: false } },
        },
      });
      panel.dataset.chartInit = true;
    }
  });
});

// Wait until DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const orderAlert = document.getElementById("orderAlert");
  const viewOrdersBtn = document.getElementById("viewOrdersBtn");
  const closeAlert = document.getElementById("closeAlert");

  // Scroll smoothly to the orders section
  function scrollToOrders() {
    const ordersSection = document.getElementById("ordersModule");
    if (ordersSection) {
      ordersSection.scrollIntoView({ behavior: "smooth" });
    } else {
      console.warn("⚠️ No orders module found (id='ordersModule').");
    }
  }

  // Hide the alert
  function dismissAlert() {
    if (orderAlert) {
      orderAlert.style.display = "none";
    }
  }

  // Attach listeners safely
  if (viewOrdersBtn) {
    viewOrdersBtn.addEventListener("click", scrollToOrders);
  }

  if (closeAlert) {
    closeAlert.addEventListener("click", dismissAlert);
  }
});

// Example mock orders data
const orders = [
  {
    id: "ORD123",
    buyer: "Student001",
    address: "123 Campus Road, Lagos",
    contact: "+2348012345678",
    items: "2x Shoes",
    status: "new",
    date: "2025-10-01",
    subtotal: 15000,
    shipping: 1500,
    tax: 750,
    total: 17250,
    history: ["Order placed on 2025-10-01", "Payment pending"],
  },
  {
    id: "ORD124",
    buyer: "Student002",
    address: "456 University Ave, Abuja",
    contact: "+2348098765432",
    items: "1x Book",
    status: "completed",
    date: "2025-09-30",
    subtotal: 2500,
    shipping: 500,
    tax: 125,
    total: 3125,
    history: ["Order placed on 2025-09-29", "Delivered on 2025-09-30"],
  },
  {
    id: "ORD125",
    buyer: "Student003",
    address: "12 Hostel Street, Ibadan",
    contact: "+2348076543210",
    items: "1x Laptop",
    status: "transit",
    date: "2025-09-29",
    subtotal: 360000,
    shipping: 5000,
    tax: 18000,
    total: 383000,
    history: ["Order placed on 2025-09-27", "Shipped on 2025-09-28"],
  },
  {
    id: "ORD126",
    buyer: "Student004",
    address: "78 Market Road, Enugu",
    contact: "+2348054321098",
    items: "3x T-Shirts",
    status: "canceled",
    date: "2025-09-28",
    subtotal: 4500,
    shipping: 800,
    tax: 225,
    total: 5525,
    history: ["Order placed on 2025-09-26", "Order canceled on 2025-09-28"],
  },
  {
    id: "ORD127",
    buyer: "Student005",
    address: "9 Tech Lane, Port Harcourt",
    contact: "+2348034567890",
    items: "1x Phone",
    status: "new",
    date: "2025-09-27",
    subtotal: 500000,
    shipping: 8000,
    tax: 25000,
    total: 533000,
    history: ["Order placed on 2025-09-27", "Awaiting confirmation"],
  },
];

document.addEventListener("DOMContentLoaded", () => {
  const orderSearch = document.getElementById("orderSearch");
  const filterButtons = document.querySelectorAll(
    ".orders-filters .filter-btn"
  );
  const sortSelect = document.getElementById("sortOrders");
  const tableBody = document.getElementById("ordersTableBody");

  const detailsPanel = document.getElementById("orderDetailsPanel");
  const panelOrderId = document.getElementById("panelOrderId");
  const panelBuyer = document.getElementById("panelBuyer");
  const panelAddress = document.getElementById("panelAddress");
  const panelContact = document.getElementById("panelContact");
  const panelItems = document.getElementById("panelItems");
  const panelSubtotal = document.getElementById("panelSubtotal");
  const panelShipping = document.getElementById("panelShipping");
  const panelTax = document.getElementById("panelTax");
  const panelTotal = document.getElementById("panelTotal");
  const panelHistory = document.getElementById("panelHistory");

  let activeFilter = "all";

  // Render Orders
  function renderOrders() {
    console.log("🔄 Rendering orders...");
    let filteredOrders = orders;

    // Apply filter
    if (activeFilter !== "all") {
      filteredOrders = filteredOrders.filter(
        (order) => order.status === activeFilter
      );
      console.log(`📌 Filter applied: ${activeFilter}`, filteredOrders);
    } else {
      console.log("📌 No filter applied (all orders).");
    }

    // Apply search
    const query = orderSearch.value.toLowerCase();
    if (query) {
      filteredOrders = filteredOrders.filter(
        (order) =>
          order.id.toLowerCase().includes(query) ||
          order.buyer.toLowerCase().includes(query)
      );
      console.log(`🔍 Search query: "${query}"`, filteredOrders);
    }

    // Apply sort
    const sortValue = sortSelect.value;
    console.log(`↕️ Sort applied: ${sortValue}`);
    filteredOrders.sort((a, b) => {
      if (sortValue === "date-desc") return new Date(b.date) - new Date(a.date);
      if (sortValue === "date-asc") return new Date(a.date) - new Date(b.date);
      if (sortValue === "value-desc") return b.total - a.total;
      if (sortValue === "value-asc") return a.total - b.total;
    });

    // Populate table
    tableBody.innerHTML = filteredOrders
      .map(
        (order) => `
      <tr data-id="${order.id}">
        <td>${order.id}</td>
        <td>${order.buyer}</td>
        <td>${order.items}</td>
        <td><span class="status ${order.status}">${order.status}</span></td>
        <td>${order.date}</td>
        <td>₦${order.total.toLocaleString()}</td>
        <td><button class="view-btn">View Details</button></td>
      </tr>
    `
      )
      .join("");

    console.log(`✅ Table rendered with ${filteredOrders.length} orders.`);
  }

  // Event Listeners
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.status;
      console.log(`🟢 Filter button clicked: ${activeFilter}`);
      renderOrders();
    });
  });

  orderSearch.addEventListener("input", () => {
    console.log(`⌨️ Search input: ${orderSearch.value}`);
    renderOrders();
  });

  sortSelect.addEventListener("change", () => {
    console.log(`📊 Sort changed to: ${sortSelect.value}`);
    renderOrders();
  });

  // Event delegation for view buttons and close button
  document.body.addEventListener("click", (e) => {
    const viewBtn = e.target.closest(".view-btn");
    if (viewBtn) {
      e.preventDefault();

      const row = viewBtn.closest("tr");
      const orderId = row.dataset.id;
      console.log(`👁 View Details clicked for Order ID: ${orderId}`);

      const order = orders.find((o) => o.id === orderId);
      if (!order) {
        console.warn("⚠️ Order not found in dataset.");
        return;
      }

      // Populate panel with real data
      console.log("📦 Populating details panel with order:", order);
      panelOrderId.textContent = `Order ${order.id}`;
      panelBuyer.textContent = order.buyer;
      panelAddress.textContent = order.address;
      panelContact.textContent = order.contact;
      panelItems.textContent = order.items;
      panelSubtotal.textContent = `₦${order.subtotal.toLocaleString()}`;
      panelShipping.textContent = `₦${order.shipping.toLocaleString()}`;
      panelTax.textContent = `₦${order.tax.toLocaleString()}`;
      panelTotal.textContent = `₦${order.total.toLocaleString()}`;
      panelHistory.innerHTML = order.history
        .map((h) => `<li>${h}</li>`)
        .join("");

      // Show panel
      detailsPanel.classList.add("open");
      detailsPanel.setAttribute("aria-hidden", "false");
      console.log("✅ Details panel opened.");
      return;
    }

    // Close panel if user clicked close button
    const closeBtn = e.target.closest("#closePanel, .close-panel");
    if (closeBtn) {
      e.preventDefault();
      detailsPanel.classList.remove("open");
      detailsPanel.setAttribute("aria-hidden", "true");
      console.log("❌ Details panel closed.");
      return;
    }
  });

  // Initial render
  console.log("🚀 Initial render triggered.");
  renderOrders();
});

/* ===== hookup buttons ===== */
const addProductBtn = document.getElementById("addProductBtn");
const modal = document.getElementById("addProductModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const addProductForm = document.getElementById("addProductForm");
const imageInput = document.getElementById("imageInput");
const specsContainer = document.getElementById("specsContainer");
const addSpecBtn = document.getElementById("addSpecBtn");

// Open modal
addProductBtn.addEventListener("click", () => {
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
});

// Close modal
closeModalBtn.addEventListener("click", () => {
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
});

// Close if clicking outside
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  }
});

// Add spec row
addSpecBtn.addEventListener("click", () => {
  const row = document.createElement("div");
  row.classList.add("spec-row");

  row.innerHTML = `
    <input type="text" placeholder="Key (e.g. sizes)" class="spec-key" />
    <input type="text" placeholder="Value (e.g. S, M, L)" class="spec-value" />
    <button type="button" class="remove-spec">✖</button>
  `;

  row
    .querySelector(".remove-spec")
    .addEventListener("click", () => row.remove());

  specsContainer.appendChild(row);
});

// Handle form submit
addProductForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(addProductForm);

  // Extract images
  const images = [];
  for (const file of imageInput.files) {
    images.push(`../images/${file.name}`); // placeholder path
  }

  // Extract specs dynamically
  const specs = {};
  document.querySelectorAll(".spec-row").forEach((row) => {
    const key = row.querySelector(".spec-key").value.trim();
    const value = row.querySelector(".spec-value").value.trim();
    if (key && value) {
      specs[key] = value;
    }
  });

  // Build product object
  const product = {
    id: Number(formData.get("id")),
    name: formData.get("name"),
    price: formData.get("price"),
    desc: formData.get("desc"),
    images: images,
    condition: formData.get("condition"),
    category: formData.get("category"),
    specs: specs,
  };

  console.log("✅ Product Added:", product);

  // Reset form & close modal
  addProductForm.reset();
  specsContainer.innerHTML = ""; // clear dynamic specs
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  alert("✅ Product added (frontend only, check console for object)");
});

// Mock product data
const products = [
  {
    id: 13,
    name: "Fitness Tracker",
    price: "₦15,000",
    desc: "Track steps, heart rate, and sleep — highly rated pick.",
    images: ["../images/fitness tracker.jpg"],
    status: "Active",
    stock: 5,
    views: 120,
    sales: 30,
  },
  {
    id: 14,
    name: "Cotton T-Shirt",
    price: "₦7,500",
    desc: "Soft cotton blend, multiple sizes.",
    images: ["../images/hoodie.jpg"],
    status: "Draft",
    stock: 50,
    views: 80,
    sales: 10,
  },
  {
    id: 15,
    name: "Laptop Backpack",
    price: "₦25,000",
    desc: "Oxford fabric, fits up to 17-inch laptops.",
    images: ["../images/lapbag.jpeg"],
    status: "Low Stock",
    stock: 2,
    views: 220,
    sales: 45,
  },
];

const tableBody = document.getElementById("productTableBody");

function renderProducts(products) {
  tableBody.innerHTML = ""; // clear first

  products.forEach((product) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <div class="product-info">
          <img src="${product.images[0]}" alt="${product.name}" />
          <a href="product.html?id=${product.id}" target="_blank">${
      product.name
    }</a>
        </div>
      </td>
      <td>
        <span class="status-badge ${
          product.status === "Active"
            ? "status-active"
            : product.status === "Draft"
            ? "status-draft"
            : "status-low"
        }">${product.status}</span>
      </td>
      <td class="${product.stock < 5 ? "stock-low" : ""}">
        ${product.stock}
      </td>
      <td>${product.views}</td>
      <td><strong>${product.sales}</strong></td>
      <td>
        <div class="action-icons">
          <i class="fas fa-edit" title="Edit"></i>
          <i class="fas fa-ban" title="Deactivate"></i>
          <i class="fas fa-chart-line" title="View Stats"></i>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

renderProducts(products);

document.addEventListener("DOMContentLoaded", () => {
  const quickEditPanel = document.getElementById("quickEditPanel");
  const closePanelBtn = document.getElementById("closePanel");
  const quickEditForm = document.getElementById("quickEditForm");

  if (!quickEditPanel) return; // safety

  // Open / Close helpers
  function openQuickEdit(product) {
    if (product && product.id !== undefined)
      quickEditPanel.dataset.productId = product.id;
    quickEditPanel.classList.add("view");
    // focus first input after panel has animated
    setTimeout(() => {
      const stockInput = document.getElementById("editStock");
      if (stockInput) stockInput.focus();
    }, 160);
  }

  function closeQuickEdit() {
    quickEditPanel.classList.remove("view");
    delete quickEditPanel.dataset.productId;
  }

  // Delegate: open when an .fa-edit icon is clicked
  document.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".fa-edit");
    if (editBtn) {
      const row = editBtn.closest("tr");
      if (!row) return;

      // Prefer to read product ID if you add data-product-id on the <tr>.
      // Fallback: match by product name link text.
      const productName = row.querySelector("a")?.textContent?.trim();
      const product =
        typeof products !== "undefined" && Array.isArray(products)
          ? products.find(
              (p) => String(p.name).trim() === String(productName).trim()
            )
          : null;

      // Fill fields
      const stockCell = row.querySelector("td:nth-child(3)");
      document.getElementById("editStock").value = stockCell
        ? stockCell.textContent.trim()
        : "";
      document.getElementById("editPrice").value = product?.price ?? "";
      document.getElementById("editStatus").value = product?.status ?? "Active";

      // Save product id for updates
      if (product) quickEditPanel.dataset.productId = product.id;

      openQuickEdit(product);
      return; // stop here so we don't treat this click as "outside click"
    }

    // CLOSE when clicking outside the panel (anywhere NOT inside the panel)
    if (
      quickEditPanel.classList.contains("view") &&
      !e.target.closest("#quickEditPanel")
    ) {
      closeQuickEdit();
    }
  });

  // Close when clicking the X
  closePanelBtn?.addEventListener("click", closeQuickEdit);

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && quickEditPanel.classList.contains("view"))
      closeQuickEdit();
  });

  // Save mock changes (updates products array and re-renders if renderProducts exists)
  quickEditForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const pid = quickEditPanel.dataset.productId;
    const newStock = Number(document.getElementById("editStock").value);
    const newPrice = document.getElementById("editPrice").value;
    const newStatus = document.getElementById("editStatus").value;

    if (typeof products !== "undefined" && pid !== undefined) {
      const prod = products.find((p) => String(p.id) === String(pid));
      if (prod) {
        prod.stock = newStock;
        prod.price = newPrice;
        prod.status = newStatus;
      }
    }

    // Re-render table if you have this function
    if (typeof renderProducts === "function") renderProducts(products);

    alert("✅ Changes saved (mock only)");
    closeQuickEdit();
  });
});

// Mock data
const conversations = [
  {
    id: 1,
    name: "Alex Johnson",
    avatar: "A",
    context: {
      product: "Fitness Tracker",
      orderId: "ORD123",
      thumb: "../images/fitness tracker.jpg",
    },
    messages: [
      {
        id: 1,
        text: "Hey, are we still on for tomorrow?",
        type: "received",
        time: "2:15 PM",
        read: false,
      },
      {
        id: 2,
        text: "Yes, 10AM at the café.",
        type: "sent",
        time: "2:16 PM",
        read: true,
      },
    ],
  },
  {
    id: 2,
    name: "Michael Smith",
    avatar: "M",
    context: null,
    messages: [
      {
        id: 1,
        text: "Got the docs, thanks!",
        type: "received",
        time: "1:40 PM",
        read: false,
      },
    ],
  },
];

// Elements
const conversationListEl = document.querySelector(".conversation-list");
const chatPanelEl = document.querySelector(".chat-panel");
const chatHeaderEl = chatPanelEl.querySelector(".chat-header h3");
const chatMessagesEl = chatPanelEl.querySelector(".chat-messages");
const chatContextEl = chatPanelEl.querySelector(".chat-context");
const searchInput = document.getElementById("searchConversations");
const newMessageInput = document.getElementById("newMessageInput");
const sendBtn = document.getElementById("sendMessageBtn");
const sidebarMessageLink = document.querySelector('a[data-target="messages"]');
const backBtn = document.getElementById("backToConversations");

let activeConversationId = null;

// Render unread badge
function updateUnreadIndicator() {
  const unreadCount = conversations.reduce((acc, conv) => {
    return (
      acc +
      conv.messages.filter((msg) => msg.type === "received" && !msg.read).length
    );
  }, 0);

  let badge = sidebarMessageLink.querySelector(".unread-badge");
  if (badge) badge.remove();

  if (unreadCount > 0) {
    badge = document.createElement("span");
    badge.classList.add("unread-badge");
    badge.textContent = unreadCount;
    sidebarMessageLink.appendChild(badge);
  }
}

// Render conversation list
function renderConversationList(filter = "") {
  conversationListEl
    .querySelectorAll(".conversation")
    .forEach((c) => c.remove());
  const filtered = conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(filter.toLowerCase()) ||
      c.messages.some((m) =>
        m.text.toLowerCase().includes(filter.toLowerCase())
      )
  );

  filtered.forEach((conv) => {
    const lastMsg = conv.messages[conv.messages.length - 1];
    const unreadCount = conv.messages.filter(
      (m) => m.type === "received" && !m.read
    ).length;

    const convEl = document.createElement("div");
    convEl.classList.add("conversation");
    convEl.dataset.id = conv.id;
    if (unreadCount > 0) convEl.classList.add("flash");

    convEl.innerHTML = `
      <div class="avatar">${conv.avatar}</div>
      <div class="conversation-info">
        <h4>${conv.name}</h4>
        ${
          unreadCount > 0
            ? `<span class="unread-badge">${unreadCount}</span>`
            : ""
        }
        <p>${lastMsg ? lastMsg.text : ""}</p>
      </div>
      <span class="time">${lastMsg ? lastMsg.time : ""}</span>
    `;
    conversationListEl.appendChild(convEl);
  });
}

// On conversation click (mobile)
conversationListEl.addEventListener("click", (e) => {
  const convEl = e.target.closest(".conversation");
  if (!convEl) return;

  renderChat(convEl.dataset.id);

  // Highlight active
  conversationListEl
    .querySelectorAll(".conversation")
    .forEach((c) => c.classList.remove("active"));
  convEl.classList.add("active");

  // Mobile slide
  if (window.innerWidth <= 768) {
    conversationListEl.classList.add("hidden");
    chatPanelEl.classList.add("active");
  }
});

// Back button click (mobile)
backBtn.addEventListener("click", () => {
  conversationListEl.classList.remove("hidden");
  chatPanelEl.classList.remove("active");
});

// Render active chat
function renderChat(conversationId) {
  const conv = conversations.find((c) => c.id == conversationId);
  if (!conv) return;

  activeConversationId = conv.id;

  // Header
  chatHeaderEl.textContent = conv.name;

  // Context
  if (conv.context) {
    chatContextEl.style.display = "flex";
    chatContextEl.querySelector(".context-thumb").src = conv.context.thumb;
    chatContextEl.querySelector(".context-name").textContent =
      conv.context.product;
    chatContextEl.querySelector(".context-id").textContent =
      conv.context.orderId;
  } else {
    chatContextEl.style.display = "none";
  }

  // Messages
  chatMessagesEl.innerHTML = "";
  conv.messages.forEach((msg) => {
    const msgEl = document.createElement("div");
    msgEl.classList.add("message", msg.type);
    msgEl.innerHTML = `<p>${msg.text}</p><span class="time">${msg.time}</span>`;
    chatMessagesEl.appendChild(msgEl);

    // Animate
    setTimeout(() => msgEl.classList.add("show"), 10);
  });

  // Scroll bottom
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;

  // Mark received as read
  conv.messages.forEach((m) => {
    if (m.type === "received") m.read = true;
  });

  // Update badges
  updateUnreadIndicator();
}

// Search functionality
searchInput.addEventListener("input", (e) =>
  renderConversationList(e.target.value)
);

// Click conversation
conversationListEl.addEventListener("click", (e) => {
  const convEl = e.target.closest(".conversation");
  if (!convEl) return;
  renderChat(convEl.dataset.id);

  // Highlight active
  conversationListEl
    .querySelectorAll(".conversation")
    .forEach((c) => c.classList.remove("active"));
  convEl.classList.add("active");
});

// Send new message
sendBtn.addEventListener("click", () => {
  const text = newMessageInput.value.trim();
  if (!text || !activeConversationId) return;

  const conv = conversations.find((c) => c.id == activeConversationId);
  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const newMsg = { id: Date.now(), text, type: "sent", time, read: true };
  conv.messages.push(newMsg);

  // Render last message only for performance
  const msgEl = document.createElement("div");
  msgEl.classList.add("message", "sent", "show");
  msgEl.innerHTML = `<p>${newMsg.text}</p><span class="time">${newMsg.time}</span>`;
  chatMessagesEl.appendChild(msgEl);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;

  newMessageInput.value = "";

  // Re-render conversation list to move conversation to top
  renderConversationList(searchInput.value);
});

// Initial render
renderConversationList();
if (conversations.length > 0) renderChat(conversations[0].id);

const payoutHistoryEl = document.getElementById("payoutHistory");

// Mock Data
const minPayout = 50;
let availablePayout = 2345.67;
const transactions = [
  {
    date: "2025-09-28",
    type: "Payout",
    amount: 500000,
    status: "Completed",
    ref: "TX123",
  },
  {
    date: "2025-09-25",
    type: "Sale Deposit",
    amount: 120000,
    status: "Completed",
    ref: "TX124",
  },
  {
    date: "2025-09-20",
    type: "Payout",
    amount: 15000,
    status: "Pending",
    ref: "TX125",
  },
];

// Elements
const requestBtn = document.getElementById("requestPayoutBtn");
const transactionTableBody = document.getElementById("transactionTableBody");
const searchinput = document.getElementById("transactionSearch");
const filterStatus = document.getElementById("filterStatus");

// Enable/disable payout button
function updatePayoutButton() {
  if (availablePayout >= minPayout) {
    requestBtn.classList.remove("disabled");
  } else {
    requestBtn.classList.add("disabled");
  }
}

// Render transaction table
function renderTransactions() {
  transactionTableBody.innerHTML = "";

  const searchTerm = searchinput.value.toLowerCase();
  const filter = filterStatus.value;

  transactions
    .filter(
      (tx) =>
        (tx.ref.toLowerCase().includes(searchTerm) ||
          tx.type.toLowerCase().includes(searchTerm)) &&
        (filter === "all" || tx.status === filter)
    )
    .forEach((tx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${tx.date}</td>
        <td>${tx.type}</td>
        <td style="color:${
          tx.type === "Sale Deposit" ? "green" : "#000"
        }">₦${tx.amount.toFixed(2)}</td>
        <td><span class="status-badge status-${tx.status}">${
        tx.status
      }</span></td>
        <td>${tx.ref}</td>
      `;
      transactionTableBody.appendChild(tr);
    });
}

// Event listeners
searchinput.addEventListener("input", renderTransactions);
filterStatus.addEventListener("change", renderTransactions);

requestBtn.addEventListener("click", () => {
  if (availablePayout < minPayout) return;
  alert(
    `✅ Payout request submitted for $${availablePayout.toFixed(2)} (mock)`
  );
  availablePayout = 0;
  document.getElementById(
    "availablePayout"
  ).textContent = `$${availablePayout.toFixed(2)}`;
  updatePayoutButton();
});

// Optional export
document.getElementById("exportSheetBtn").addEventListener("click", () => {
  alert("Export to Sheets (mock) triggered!");
});

// Initial render
updatePayoutButton();
renderTransactions();

// Accordion behavior
document.querySelectorAll(".accordion-header").forEach((header) => {
  header.addEventListener("click", () => {
    const item = header.parentElement;
    item.classList.toggle("active");
  });
});

// 2FA toggle
const toggle2FA = document.getElementById("toggle2FA");
const twoFASetup = document.getElementById("twoFASetup");
toggle2FA.addEventListener("change", () => {
  if (toggle2FA.checked) {
    twoFASetup.classList.remove("hidden");
  } else {
    twoFASetup.classList.add("hidden");
  }
});

// Email edit
const editEmailLink = document.getElementById("editEmailLink");
const editEmailInput = document.getElementById("editEmailInput");
editEmailLink.addEventListener("click", (e) => {
  e.preventDefault();
  editEmailInput.classList.toggle("hidden");
});

// Danger Zone Deactivate modal
const deactivateBtn = document.getElementById("deactivateAccountBtn");
deactivateBtn.addEventListener("click", () => {
  if (
    confirm(
      "Are you sure you want to deactivate your account? This action cannot be undone."
    )
  ) {
    alert("Account deactivation triggered (mock).");
  }
});

// Select all links with class 'scroll-link'
// Select all action-bar links
const actionLinks = document.querySelectorAll(".action-bar a");

actionLinks.forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();

    const targetId = this.getAttribute("href").substring(1); // get 'orders', 'products', 'payouts'
    const sidebarLink = document.querySelector(
      `.sidebar a[data-target="${targetId}"]`
    );

    if (sidebarLink) {
      // Trigger click on the sidebar link
      sidebarLink.click();
    }
  });
});

const sidebar = document.querySelector(".sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");

sidebarToggle.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

// Optional: close sidebar when clicking outside
document.addEventListener("click", (e) => {
  if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
    sidebar.classList.remove("open");
  }
});
