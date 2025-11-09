const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ump-html-1.onrender.com";

async function loadCategories() {
  try {
    const res = await fetch(`${API_BASE}/api/categories`);
    if (!res.ok) throw new Error("Failed to fetch categories");
    const categories = await res.json();

    const container = document.getElementById("categoriesContainer");
    container.innerHTML = "";

    if (categories.length === 0) {
      container.innerHTML = "<p>No categories found.</p>";
      return;
    }

    categories.forEach((cat) => {
      const a = document.createElement("a");
      a.href = `../pages/category.html?slug=${cat.slug}`;
      a.classList.add("category-card");

      a.innerHTML = `
          <img src="${cat.image}" alt="${cat.name}" />
          <div class="category-overlay">
            <h3>${cat.name}</h3>
            <span>${cat.description || ""}</span>
          </div>
        `;

      container.appendChild(a);
    });
  } catch (err) {
    document.getElementById("categoriesContainer").innerHTML =
      "<p>Error loading categories.</p>";
    console.error("Error:", err);
  }
}

loadCategories();
