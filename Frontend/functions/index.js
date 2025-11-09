const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ump-html-1.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.querySelector(".search-form");
  const search = document.querySelector("#search-btn");
  const profilePopup = document.querySelector(".profile-popup");
  const loginBtn = document.querySelector("#login-btn");
  const Links = document.querySelector(".nav_links");
  const Menu = document.querySelector("#mobile_menu");
  const cartBtn = document.getElementById("cart-btn");

  // ✅ Search toggle
  if (search) {
    search.addEventListener("click", () => {
      searchForm?.classList.toggle("active");
      Links?.classList.remove("active");
      profilePopup?.classList.remove("active");
    });
  }

  // ✅ Profile popup toggle
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      profilePopup?.classList.toggle("active");
      searchForm?.classList.remove("active");
      Links?.classList.remove("active");
    });
  }

  // ✅ Mobile menu toggle
  if (Menu) {
    Menu.addEventListener("click", () => {
      Links?.classList.toggle("active");
      profilePopup?.classList.remove("active");
      searchForm?.classList.remove("active");
    });
  }

  // ✅ Auto-close on scroll
  window.addEventListener("scroll", () => {
    Links?.classList.remove("active");
    profilePopup?.classList.remove("active");
    searchForm?.classList.remove("active");
  });

  // ✅ Cart button redirect
  cartBtn?.addEventListener("click", () => {
    window.location.href = "/pages/cart.html";
  });

  // ====== SLIDER ======
  const track = document.querySelector(".slider-track");
  const slides = document.querySelectorAll(".slide");
  const dotsContainer = document.querySelector(".slider-dots");

  if (track && slides.length > 0 && dotsContainer) {
    let firstClone, lastClone;
    firstClone = slides[0].cloneNode(true);
    lastClone = slides[slides.length - 1].cloneNode(true);
    track.appendChild(firstClone);
    track.insertBefore(lastClone, slides[0]);

    const allSlides = document.querySelectorAll(".slide");
    let currentIndex = 1;
    let slideInterval;

    function getSlideFullWidth() {
      const slide = allSlides[0];
      const style = window.getComputedStyle(slide);
      const margin =
        parseFloat(style.marginLeft) + parseFloat(style.marginRight);
      return slide.getBoundingClientRect().width + margin;
    }

    // ✅ Create dots
    allSlides.forEach((_, i) => {
      if (i === 0 || i === allSlides.length - 1) return;
      const dot = document.createElement("button");
      if (i === 1) dot.classList.add("active");
      dotsContainer.appendChild(dot);
      dot.addEventListener("click", () => goToSlide(i));
    });

    const dots = document.querySelectorAll(".slider-dots button");

    function updateSlider() {
      const slideWidth = getSlideFullWidth();

      // Safety: ensure currentIndex stays in range
      if (currentIndex >= allSlides.length) currentIndex = allSlides.length - 1;
      if (currentIndex < 0) currentIndex = 0;

      track.style.transition = "transform 0.6s ease-in-out";
      track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

      // --- safely update dots ---
      dots.forEach((dot) => dot.classList.remove("active"));

      // Handle when we're on a clone
      if (currentIndex === 0) {
        dots[dots.length - 1]?.classList.add("active"); // last dot
      } else if (currentIndex === allSlides.length - 1) {
        dots[0]?.classList.add("active"); // first dot
      } else {
        dots[currentIndex - 1]?.classList.add("active");
      }
    }

    function goToSlide(index) {
      currentIndex = index;
      updateSlider();
      resetAutoSlide();
    }

    function nextSlide() {
      currentIndex++;
      updateSlider();
    }

    track.addEventListener("transitionend", () => {
      const slideWidth = getSlideFullWidth();

      if (allSlides[currentIndex] === firstClone) {
        track.style.transition = "none";
        currentIndex = 1;
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
      }

      if (allSlides[currentIndex] === lastClone) {
        track.style.transition = "none";
        currentIndex = allSlides.length - 2;
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
      }
    });

    function startAutoSlide() {
      slideInterval = setInterval(nextSlide, 4000);
    }

    function resetAutoSlide() {
      clearInterval(slideInterval);
      startAutoSlide();
    }

    // --- Swipe functionality ---
    let startX = 0;
    let isDragging = false;

    track.addEventListener("touchstart", startDrag);
    track.addEventListener("mousedown", startDrag);

    track.addEventListener("touchmove", dragMove);
    track.addEventListener("mousemove", dragMove);

    track.addEventListener("touchend", endDrag);
    track.addEventListener("mouseup", endDrag);
    track.addEventListener("mouseleave", endDrag);

    function startDrag(e) {
      isDragging = true;
      startX = e.type.includes("mouse") ? e.pageX : e.touches[0].pageX;
      clearInterval(slideInterval);
    }

    function dragMove(e) {
      if (!isDragging) return;
      let currentX = e.type.includes("mouse") ? e.pageX : e.touches[0].pageX;
      let diff = startX - currentX;

      if (diff > 50) {
        nextSlide();
        isDragging = false;
      } else if (diff < -50) {
        currentIndex--;
        updateSlider();
        isDragging = false;
      }
    }

    function endDrag() {
      if (isDragging) {
        isDragging = false;
        resetAutoSlide();
      }
    }

    const initialWidth = getSlideFullWidth();
    track.style.transform = `translateX(-${currentIndex * initialWidth}px)`;
    startAutoSlide();
  }

  // ====== CATEGORY CARDS ANIMATION ======
  async function loadCategories() {
    try {
      const res = await fetch(`${API_BASE}/api/categories`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      let categories = await res.json();

      // ✅ Shuffle categories randomly
      categories = categories.sort(() => Math.random() - 0.5);

      // ✅ Limit to 4
      const randomCategories = categories.slice(0, 4);

      const container = document.getElementById("categoryContainer");
      container.innerHTML = randomCategories
        .map(
          (cat) => `
        <a href="./Pages/category.html?slug=${cat.slug}" class="category-card">
          <img src="${cat.image}" alt="${cat.name}">
          <div class="category-overlay">
            <h3>${cat.name}</h3>
            <span>${cat.description || ""}</span>
          </div>
        </a>
      `
        )
        .join("");

      // ✅ Reapply your animation after rendering
      if (typeof revealCards === "function") revealCards();
    } catch (err) {
      console.error("❌ Error loading categories:", err);
    }
  }

  loadCategories();

  function revealCards() {
    const trigger = window.innerHeight * 0.9;
    document.querySelectorAll(".category-card").forEach((card) => {
      const top = card.getBoundingClientRect().top;
      if (top < trigger) card.classList.add("show");
    });
  }
  window.addEventListener("scroll", revealCards);

  // ====== VIBE CARDS ANIMATION ======
  const vibeCards = document.querySelectorAll(".vibe-card");

  function revealVibes() {
    const trigger = window.innerHeight * 0.9;
    vibeCards.forEach((card) => {
      const top = card.getBoundingClientRect().top;
      if (top < trigger) card.classList.add("show");
    });
  }

  window.addEventListener("scroll", revealVibes);
  window.addEventListener("load", revealVibes);

  // ====== FEATURE ANIMATION ======
  const features = document.querySelectorAll(".feature");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add("visible");
          }, index * 200); // stagger effect
        }
      });
    },
    { threshold: 0.2 }
  );

  features.forEach((f) => observer.observe(f));

  // ====== FOOTER ======
  const footer = document.getElementById("pageFooter");
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  if (footer) {
    const footerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            footer.classList.add("visible");
          } else {
            footer.classList.remove("visible");
          }
        });
      },
      { threshold: 0.05 }
    );

    footerObserver.observe(footer);

    if (footer.getBoundingClientRect().top < window.innerHeight) {
      footer.classList.add("visible");
    }
  }
});
