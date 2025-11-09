// app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";

// 🧩 ROUTES
import authRoutes from "./routes/authroutes.js";
import productRoutes from "./routes/productRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import followRoutes from "./routes/followRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import roleRoutes from "./routes/userRoleRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import sellerDashboardRoutes from "./routes/sellerAnalyticsRoutes.js";
import payoutRoutes from "./routes/payoutRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import walkerRoutes from "./routes/walkerRoutes.js";
import serviceAnalytics from "./routes/serviceAnalyticsRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------------------------
// ⚙️ MIDDLEWARE
// ----------------------------
const allowedOrigins = [
  "http://127.0.0.1:5000",
  "http://localhost:5000",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://localhost:3000",
  "https://ump-ng.github.io",
  "file://",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true, // allow cookies
    allowedHeaders: ["Content-Type", "Authorization"], // allow custom headers
  })
);

// Handle preflight OPTIONS requests for all routes
app.options("*", cors({ credentials: true, origin: allowedOrigins }));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ----------------------------
// 🛡️ Helmet with CSP tuned for your external assets
// ----------------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://maps.googleapis.com",
          "https://maps.gstatic.com",
          "https://cdn.jsdelivr.net",
          "https://cdn.socket.io",
          "https://cdnjs.cloudflare.com",
        ],
        scriptSrcElem: [
          "'self'",
          "'unsafe-inline'",
          "https://maps.googleapis.com",
          "https://maps.gstatic.com",
          "https://cdn.jsdelivr.net",
          "https://cdn.socket.io",
          "https://cdnjs.cloudflare.com",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://cdn-icons-png.flaticon.com",
          "https://cdn-icons.flaticon.com",
          "https://maps.gstatic.com",
          "https://cdn.jsdelivr.net",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com",
          "https://fonts.googleapis.com",
          "https://use.fontawesome.com",
        ],
        fontSrc: [
          "'self'",
          "data:",
          "https://fonts.gstatic.com",
          "https://cdnjs.cloudflare.com",
          "https://cdn.jsdelivr.net",
        ],
        connectSrc: [
          "'self'",
          "http://localhost:5000",
          "http://127.0.0.1:5000",
          "http://localhost:5500",
          "http://127.0.0.1:5500",
          "https://cdn.jsdelivr.net",
          "https://cdn.socket.io",
          "https://maps.googleapis.com",
          "https://maps.gstatic.com",
        ],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

// ----------------------------
// 📂 STATIC FILES — must come BEFORE page routes
// ----------------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "../Frontend")));

// ----------------------------
// 🚏 ROUTES
// ----------------------------
app.use("/api/auth", authRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/users", roleRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/seller-dashboard", sellerDashboardRoutes);
app.use("/api/payouts", payoutRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/walkers", walkerRoutes);
app.use("/api/service-analytics", serviceAnalytics);

// 🧯 Centralized error handler
app.use(errorHandler);

// ----------------------------
// 🔗 CATCH-ALL ROUTES
// ----------------------------
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

// Serve main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

// Serve static Pages safely — only HTML files
app.get("/Pages/:page", (req, res) => {
  const page = req.params.page;
  const safePath = path.join(__dirname, `../frontend/pages/${page}`);
  if (page.endsWith(".html")) {
    res.sendFile(safePath);
  } else {
    res.status(403).send("Forbidden");
  }
});

export default app;
