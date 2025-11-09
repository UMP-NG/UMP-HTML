const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ump-html-1.onrender.com";

async function loadCategoryProducts() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug) {
    document.getElementById("categoryTitle").textContent = "Category not found";
    return;
  }

  try {
    // Get category info by slug
    const catRes = await fetch(`${API_BASE}/api/categories/slug/${slug}`);
    if (!catRes.ok) throw new Error("Category not found");
    const category = await catRes.json();

    console.log("📦 Category response:", category);

    document.getElementById("categoryTitle").textContent = category.name;

    // Get products in this category
    const prodRes = await fetch(
      `${API_BASE}/api/products/category/${category._id}`
    );
    if (!prodRes.ok) throw new Error("Failed to fetch products");
    const products = await prodRes.json();

    console.log("🛒 Products response:", products);

    const container = document.getElementById("productsContainer");
    container.innerHTML = "";

    if (products.length === 0) {
      container.innerHTML = "<p>No products in this category yet.</p>";
      return;
    }

    products.forEach((p) => {
      const div = document.createElement("div");
      div.classList.add("product-card");
      div.innerHTML = `
  <img src="${API_BASE}${p.image}" alt="${p.name}">
  <h3>${p.name}</h3>
  <p class="price">₦${p.price.toLocaleString()}</p>
`;
      container.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    document.getElementById("productsContainer").innerHTML =
      "<p>Error loading products.</p>";
  }
}

loadCategoryProducts();
