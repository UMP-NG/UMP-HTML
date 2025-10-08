const toggleBtns = document.querySelectorAll(".toggle-btn");
const sections = document.querySelectorAll(".analytics-section");

toggleBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Remove all active states
    toggleBtns.forEach((b) => b.classList.remove("active"));
    sections.forEach((sec) => sec.classList.remove("active"));

    // Activate clicked button
    btn.classList.add("active");

    // Find target section
    const target = btn.getAttribute("data-role");
    const section = document.getElementById(target);

    // Show section only if found
    if (section) {
      section.classList.add("active");
    } else {
      console.warn(`Section with ID "${target}" not found`);
    }
  });
});

document.querySelectorAll(".accept-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.textContent = "Accepted";
    btn.style.background = "#10b981";
    btn.disabled = true;
  });
});

const chartIds = ["earningsChart", "serviceEarningsChart"];
const labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
const data = Array.from(
  { length: 30 },
  () => Math.floor(Math.random() * 8000) + 2000
);

chartIds.forEach((id) => {
  const canvas = document.getElementById(id);
  if (!canvas) return; // skip if canvas doesn't exist on the page

  const ctx = canvas.getContext("2d");

  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Daily Earnings (₦)",
          data,
          borderColor: "#10b981", // your accent color
          backgroundColor: "rgba(16,185,129,0.1)",
          borderWidth: 2,
          tension: 0.4, // smooth line
          pointRadius: 3,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "#10b981",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#111827",
          titleColor: "#fff",
          bodyColor: "#fff",
          cornerRadius: 6,
          displayColors: false,
          callbacks: {
            label: (context) => `₦${context.formattedValue}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#6b7280" },
        },
        y: {
          grid: { color: "#f3f4f6" },
          ticks: { color: "#6b7280", callback: (val) => `₦${val}` },
        },
      },
    },
  });
});

document.querySelector(".request-btn")?.addEventListener("click", () => {
  alert("Your payout request has been sent for review.");
});
