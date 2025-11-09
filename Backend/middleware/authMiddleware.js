import jwt from "jsonwebtoken";
import User from "../models/User.js";
import cookie from "cookie";

let lastAuthLogAt = 0;
const AUTH_LOG_INTERVAL_MS = Number(process.env.AUTH_LOG_INTERVAL_MS) || 5000;

export const protect = async (req, res, next) => {
  try {
    // ===== DEBUG LOGGING =====
    if (process.env.DEBUG_AUTH === "true") {
      const now = Date.now();
      if (now - lastAuthLogAt > AUTH_LOG_INTERVAL_MS) {
        lastAuthLogAt = now;
        console.log("=== Incoming Request ===");
        console.log("Headers:", req.headers);
        console.log("Cookies:", req.headers.cookie || "No cookies sent");
      }
    }

    // ===== 1️⃣ Check Authorization header =====
    let token = req.header("Authorization")?.replace("Bearer ", "");
    if (token) console.log("[Token] Found in Authorization header");

    // ===== 2️⃣ Check cookie if header missing =====
    if (!token && req.headers.cookie) {
      const cookies = cookie.parse(req.headers.cookie || "");
      token = cookies.token;
      if (token) console.log("[Token] Found in cookie");
    }

    // ===== 3️⃣ No token found =====
    if (!token) {
      console.warn("[Protect] No token found in request");
      return res
        .status(401)
        .json({ message: "Not authorized, no token provided" });
    }

    // ===== 4️⃣ Verify JWT =====
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("[Token Verified] Decoded payload:", decoded);
    } catch (err) {
      console.error("[Protect] Invalid token:", err.message);
      return res.status(401).json({ message: "Not authorized, token invalid" });
    }

    // ===== 5️⃣ Attach user to request =====
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.warn("[Protect] User not found for token:", decoded.id);
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    console.log("[Protect] User attached to request:", user.email);

    next();
  } catch (error) {
    console.error("[Protect Middleware Error]:", error.message);
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

// ✅ Role-based access control middleware
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRoles = req.user?.roles || []; // roles is an array in User model
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return res
        .status(403)
        .json({ message: "Access denied: insufficient role" });
    }

    next();
  };
};
