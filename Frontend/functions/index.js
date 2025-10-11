document.addEventListener("DOMContentLoaded", () => {
  let searchForm = document.querySelector(".search-form");
  let search = document.querySelector("#search-btn");

  let profilePopup = document.querySelector(".profile-popup");
  let loginBtn = document.querySelector("#login-btn");

  let Links = document.querySelector(".nav_links");
  let Menu = document.querySelector("#mobile_menu");

  if (search) {
    search.addEventListener("click", function () {
      searchForm.classList.toggle("active");
      Links.classList.remove("active");
      profilePopup.classList.remove("active");
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener("click", function () {
      profilePopup.classList.toggle("active");
      searchForm.classList.remove("active");
      Links.classList.remove("active");
    });
  }

  if (Menu) {
    Menu.addEventListener("click", function () {
      Links.classList.toggle("active");
      profilePopup.classList.remove("active");
      searchForm.classList.remove("active");
    });
  }

  window.onscroll = () => {
    Links.classList.remove("active");
    profilePopup.classList.remove("active");
    searchForm.classList.remove("active");
  };
});

document.getElementById("cart-btn").addEventListener("click", () => {
  window.location.href = "cart.html";
});

document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".slider-track");
  const slides = document.querySelectorAll(".slide");
  const dotsContainer = document.querySelector(".slider-dots");

  // Declare these outside the block
  let firstClone, lastClone;

  // Clone first and last slides
  if (slides.length > 0) {
    firstClone = slides[0].cloneNode(true);
    lastClone = slides[slides.length - 1].cloneNode(true);
    track.appendChild(firstClone);
    track.insertBefore(lastClone, slides[0]);
  }

  // Update slides list after cloning
  const allSlides = document.querySelectorAll(".slide");
  let currentIndex = 1;
  let slideInterval;

  function getSlideFullWidth() {
    const slide = allSlides[0];
    const style = window.getComputedStyle(slide);
    const margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
    return slide.getBoundingClientRect().width + margin;
  }

  // Create dots
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
    track.style.transition = "transform 0.6s ease-in-out";
    track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

    dots.forEach((dot) => dot.classList.remove("active"));
    if (currentIndex === 0) dots[dots.length - 1].classList.add("active");
    else if (currentIndex === allSlides.length - 1)
      dots[0].classList.add("active");
    else dots[currentIndex - 1].classList.add("active");
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
});

const cat_cards = document.querySelectorAll(".category-card");

function revealCards() {
  const trigger = window.innerHeight * 0.9;
  cat_cards.forEach((card) => {
    const top = card.getBoundingClientRect().top;
    if (top < trigger) {
      card.classList.add("show");
    }
  });
}

window.addEventListener("scroll", revealCards);
window.addEventListener("load", revealCards);

// Reveal on scroll effect
const vibeCards = document.querySelectorAll(".vibe-card");

function revealVibes() {
  const trigger = window.innerHeight * 0.9;
  vibeCards.forEach((card) => {
    const top = card.getBoundingClientRect().top;
    if (top < trigger) {
      card.classList.add("show");
    }
  });
}

window.addEventListener("scroll", revealVibes);
window.addEventListener("load", revealVibes);

const images = [
  "../images/fash-trend.jpg",
  "../images/cozy-hostel.jpg",
  "../images/tech-life.jpg",
  "../images/study-essen.jpg",
  "../images/electronics.jpg",
  "../images/arts.jpg",
  "../images/books.jpg",
  "../images/fashion.jpg",
];

const cards = document.querySelectorAll(".campus-card img");
const lightboxImg = document.getElementById("lightboxImg");

// Auto rotate images
function rotateImage(card) {
  let randomImage = images[Math.floor(Math.random() * images.length)];
  card.classList.add("fade-out");
  setTimeout(() => {
    card.src = randomImage;
    card.classList.remove("fade-out");
  }, 1000);
}

setInterval(() => {
  if (cards.length === 0) return; // no campus-card images
  let card = cards[Math.floor(Math.random() * cards.length)];
  if (card) rotateImage(card);
}, 3000);

// Lightbox functionality
cards.forEach((card) => {
  card.parentElement.addEventListener("click", (e) => {
    lightboxImg.src = card.src;
  });
});

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

const footer = document.getElementById("pageFooter");
const yearSpan = document.getElementById("year");

// Set dynamic year
yearSpan.textContent = new Date().getFullYear();

// Footer reveal on scroll (re-trigger each time it enters viewport)
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
