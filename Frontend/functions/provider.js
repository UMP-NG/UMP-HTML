const tabs = document.querySelectorAll(".tab");
const panes = document.querySelectorAll(".tab-pane");
const forms = document.querySelectorAll(".form-pane");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    // Reset all tabs, panes, and forms
    tabs.forEach((t) => t.classList.remove("active"));
    panes.forEach((p) => p.classList.remove("active"));
    forms.forEach((f) => f.classList.remove("active"));

    // Activate clicked tab + its pane + its form
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
    document.getElementById("form-" + tab.dataset.tab).classList.add("active");
  });
});
