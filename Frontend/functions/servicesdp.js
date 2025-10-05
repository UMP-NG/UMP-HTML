// Tabs
const tabBtns = document.querySelectorAll(".tab-btn");
const tabPanes = document.querySelectorAll(".tab-pane");

tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabBtns.forEach((b) => b.classList.remove("active"));
    tabPanes.forEach((p) => p.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// Inject structure into HTML
document.getElementById("app").innerHTML = `
  <section class="service-detail container">
    <div class="service-layout">
      <div class="service-info" id="serviceInfo"></div>
      <aside class="booking-panel" id="bookingPanel"></aside>
    </div>

    <div class="details-tabs">
      <div class="tab-controls">
        <button class="tab-btn active" data-tab="reviews">All Reviews</button>
        <button class="tab-btn" data-tab="policies">Policies</button>
      </div>
      <div class="tab-content">
        <div class="tab-pane active" id="reviews"></div>
        <div class="tab-pane" id="policies"></div>
      </div>
    </div>
  </section>
`;

// Mock service data (can later be fetched from backend)
const services = [
  {
    id: 1,
    name: "Sarah Johnson",
    title: "Calculus I Tutoring",
    rate: "$35 / hour",
    package: "5-Hour Package: $150",
    rating: 4.8,
    verified: true,
    image: "https://randomuser.me/api/portraits/women/45.jpg",
    major: "B.Sc. in Mathematics — University of Lagos",
    desc: "Passionate about helping students master calculus and develop analytical skills. Over 3 years of tutoring experience with excellent student outcomes.",
    about:
      "This Calculus I tutoring session focuses on differentiation, integration, and problem-solving strategies. Each lesson is personalized to your learning pace and includes practical examples and review quizzes.",
    certifications: ["Certified Math Tutor (ALX Academy)", "B.Sc. Mathematics"],
    portfolio: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600",
    ],
    reviews: [
      {
        text: "Sarah is an excellent tutor! I finally understand limits.",
        author: "Tunde, 2024",
        stars: "★★★★★",
      },
      {
        text: "Very patient and helpful sessions. Highly recommend!",
        author: "Ada, 2023",
        stars: "★★★★☆",
      },
    ],
    policies: [
      "📅 Cancellations must be made 24 hours in advance.",
      "💰 Refunds available for unused prepaid hours only.",
      "🕒 Sessions start promptly at the scheduled time.",
    ],
  },
  {
    id: 2,
    name: "David Lee",
    title: "Logo Design & Branding",
    rate: "Flat Rate $150",
    package: "Brand Kit + 3 Concepts: $250",
    rating: 4.7,
    verified: true,
    image: "https://randomuser.me/api/portraits/men/55.jpg",
    major: "B.A. in Graphic Design — University of Toronto",
    desc: "Creative designer specializing in logos, branding, and visual identity. 5+ years of experience helping startups stand out with professional designs.",
    about:
      "This service includes a full brand identity creation process — from concept sketches to a finalized logo and brand color palette. Each design is tailored to match your company’s values and audience.",
    certifications: [
      "Adobe Certified Professional",
      "Brand Identity Design (Coursera)",
    ],
    portfolio: [
      "https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=600",
      "https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=600",
    ],
    reviews: [
      {
        text: "Loved the final logo! David really understood our brand.",
        author: "Amaka, 2024",
        stars: "★★★★★",
      },
      {
        text: "Professional and creative. Delivery took 2 extra days.",
        author: "Kelvin, 2023",
        stars: "★★★★☆",
      },
    ],
    policies: [
      "🖌️ 2 free revisions included.",
      "📅 Final files delivered within 7 business days.",
      "💰 50% deposit required before project start.",
    ],
  },
  {
    id: 3,
    name: "Jessica Osei",
    title: "Personal Fitness Coaching",
    rate: "$40 / hour",
    package: "10-Session Package: $350",
    rating: 4.9,
    verified: true,
    image: "https://randomuser.me/api/portraits/women/33.jpg",
    major: "Certified Personal Trainer (NASM)",
    desc: "Dedicated fitness coach helping clients build strength and confidence through personalized workout and nutrition plans.",
    about:
      "Each coaching session combines bodyweight training, resistance workouts, and nutrition guidance. Whether your goal is weight loss, muscle gain, or general fitness, every program is tailored to you.",
    certifications: [
      "NASM Certified Personal Trainer",
      "Nutrition & Wellness Coach (ACE)",
    ],
    portfolio: [
      "https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?w=600",
      "https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=600",
    ],
    reviews: [
      {
        text: "Jessica kept me accountable and motivated—amazing results!",
        author: "Kunle, 2024",
        stars: "★★★★★",
      },
      {
        text: "Challenging but fun sessions! I feel stronger already.",
        author: "Lydia, 2023",
        stars: "★★★★★",
      },
    ],
    policies: [
      "🏋️‍♀️ Missed sessions can be rescheduled once per week.",
      "💰 Refunds only for cancellations made 48 hours ahead.",
      "⚡ Client progress photos kept private unless permitted.",
    ],
  },
  {
    id: 4,
    name: "Mark Benson",
    title: "Guitar Lessons for Beginners",
    rate: "$25 / hour",
    package: "6-Session Package: $120",
    rating: 4.6,
    verified: false,
    image: "https://randomuser.me/api/portraits/men/41.jpg",
    major: "Diploma in Music Performance — Berklee College of Music",
    desc: "Passionate guitarist teaching beginners the art of rhythm, melody, and music theory in a fun and interactive way.",
    about:
      "Learn how to play chords, scales, and your favorite songs. Classes are structured to help you improve step-by-step with backing tracks and practice assignments.",
    certifications: [
      "Certified Music Instructor (Yamaha School)",
      "Diploma in Guitar Performance",
    ],
    portfolio: [
      "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?w=600",
      "https://images.unsplash.com/photo-1507878866276-a947ef722fee?w=600",
    ],
    reviews: [
      {
        text: "Mark made guitar learning super easy and enjoyable!",
        author: "Bisi, 2024",
        stars: "★★★★★",
      },
      {
        text: "Good teacher, though lessons sometimes felt rushed.",
        author: "Tom, 2023",
        stars: "★★★★☆",
      },
    ],
    policies: [
      "🎸 Students must bring their own guitar.",
      "📅 Cancellations accepted 12 hours before class.",
      "💰 No refunds after the first session.",
    ],
  },
];

// Get elements
const serviceInfo = document.getElementById("serviceInfo");
const bookingPanel = document.getElementById("bookingPanel");
const reviewsPane = document.getElementById("reviews");
const policiesPane = document.getElementById("policies");

// Get ID from URL (e.g., ?id=2)
const urlParams = new URLSearchParams(window.location.search);
const serviceId = parseInt(urlParams.get("id")) || 1; // default to 1 if none

// Find matching service
const s = services.find((srv) => srv.id === serviceId);

// If no service found, show error
if (!s) {
  document.getElementById("app").innerHTML = `
    <div class="not-found">
      <h2>Service not found</h2>
      <p>The service you are looking for does not exist.</p>
    </div>
  `;
} else {
  // Render normally
  const serviceInfo = document.getElementById("serviceInfo");
  const bookingPanel = document.getElementById("bookingPanel");
  const reviewsPane = document.getElementById("reviews");
  const policiesPane = document.getElementById("policies");

  // LEFT COLUMN — Main Info
  serviceInfo.innerHTML = `
    <div class="service-header">
      <h1>${s.title}</h1>
      ${s.verified ? `<span class="verified-badge">Verified Expert</span>` : ""}
    </div>

    <div class="provider-bio">
      <img src="${s.image}" alt="${s.name}" class="provider-photo" />
      <div>
        <h3>${s.name}</h3>
        <p class="provider-major">${s.major}</p>
        <p class="provider-desc">${s.desc}</p>
      </div>
    </div>

    <div class="service-description">
      <h2>About the Service</h2>
      <p>${s.about}</p>
    </div>

    <div class="certifications">
      <h2>Certifications</h2>
      <ul>
        ${s.certifications
          .map((c) => `<li><i class="fa-solid fa-certificate"></i> ${c}</li>`)
          .join("")}
      </ul>
    </div>

    <div class="portfolio">
      <h2>Past Work / Examples</h2>
      <div class="portfolio-gallery">
        ${s.portfolio
          .map((img) => `<img src="${img}" alt="Portfolio Example">`)
          .join("")}
      </div>
    </div>

    <div class="reviews-summary">
      <h2>Reviews Summary</h2>
      <div class="rating-overview">
        <h3>⭐ ${s.rating} <span>/ 5.0</span></h3>
        <p>Based on ${s.reviews.length} student reviews</p>
      </div>
    </div>
  `;

  // RIGHT COLUMN — Booking Panel
  bookingPanel.innerHTML = `
    <div class="price-box">
      <h3 class="main-rate">${s.rate}</h3>
      <p>${s.package}</p>
    </div>

    <div class="schedule">
      <label for="bookingDate">Choose a Date</label>
      <input type="date" id="bookingDate" />
      <div class="time-slots">
        <button class="time-btn">9:00 AM</button>
        <button class="time-btn">11:00 AM</button>
        <button class="time-btn">2:00 PM</button>
        <button class="time-btn">4:00 PM</button>
      </div>
    </div>

    <button class="cta-btn">Book Session</button>
    <button class="secondary-btn">Message Provider</button>
  `;

  // REVIEWS TAB
  reviewsPane.innerHTML = s.reviews
    .map(
      (r) => `
      <div class="review">
        <p>“${r.text}”</p>
        <span>— ${r.author} ${r.stars}</span>
      </div>
    `
    )
    .join("");

  // POLICIES TAB
  policiesPane.innerHTML = `
    <h3>Policies</h3>
    <ul>
      ${s.policies.map((p) => `<li>${p}</li>`).join("")}
    </ul>
  `;
}

// TAB SWITCH
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".tab-pane")
      .forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});
