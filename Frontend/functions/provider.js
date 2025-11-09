const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ump-html-1.onrender.com";


const tabs = document.querySelectorAll(".tab");
const panes = document.querySelectorAll(".tab-pane");
const forms = document.querySelectorAll(".form-pane");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    panes.forEach((p) => p.classList.remove("active"));
    forms.forEach((f) => f.classList.remove("active"));

    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
    document.getElementById("form-" + tab.dataset.tab).classList.add("active");
  });
});

document.querySelectorAll(".form-group.animate").forEach((el, i) => {
  el.style.setProperty("--i", i);
});

// --- Unified registration handler (Cookie-based Auth) ---
async function handleRoleRegistration(role, formId, customHandler) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    try {
      // If a custom handler is provided, hand off the FormData to it
      if (typeof customHandler === "function") {
        await customHandler(formData);
        return;
      }

      const response = await fetch(`${API_BASE}/api/users/become/${role}`, {
        method: "POST",
        credentials: "include", // ✅ send cookies automatically
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        // 🧠 Handle unauthorized or no-token cases
        if (response.status === 401 || response.status === 403) {
          alert("⚠️ You need to log in before registering as a partner.");
          setTimeout(() => {
            window.location.href = "/Pages/login.html";
          }, 1200);
          return;
        }

        throw new Error(result.message || `Failed to register as ${role}`);
      }

      alert(`✅ ${role.replace("_", " ")} registration successful!`);
      console.log("Updated user:", result.user);

      // ✅ Redirect based on role
      if (role === "seller") {
        window.location.href = "../Pages/analytics.html";
      } else if (role === "walker" || role === "service_provider") {
        window.location.href = "../Pages/provideranalytics.html";
      }
    } catch (error) {
      console.error("❌ Registration error:", error);
      alert(error.message || "Registration failed. Please try again.");
    }
  });
}

handleRoleRegistration("seller", "form-seller");
handleRoleRegistration("service_provider", "form-service", async (formData) => {
  try {
    let response = await fetch(`${API_BASE}/api/users/become/service_provider`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (response.status === 401 || response.status === 403) {
      const email = formData.get("email");
      const password = formData.get("password");

      if (!email || !password) {
        alert("Please provide an email and password to create an account first.");
        window.location.href = "/Pages/login.html";
        return;
      }

      response = await fetch(`${API_BASE}/api/auth/signup-provider`, {
        method: "POST",
        body: formData,
      });
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to register as service provider");
    }

    alert("✅ Service provider account ready!");
    console.log("Provider result:", result);
    window.location.href = "../Pages/provideranalytics.html";
  } catch (error) {
    console.error("❌ Service registration error:", error);
    alert(error.message || "Registration failed. Please try again.");
  }
});

handleRoleRegistration("walker", "form-walker", async (formData) => {
  try {
    const response = await fetch(`${API_BASE}/api/walkers/apply`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Application failed");

    alert("✅ Dispatcher application submitted! Pending admin approval.");
    console.log("Walker application:", result.application);
  } catch (err) {
    console.error("❌ Walker registration error:", err);
    alert(err.message || "Submission failed");
  }
});
