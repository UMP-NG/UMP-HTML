import jwt from "jsonwebtoken";
import User from "../models/User.js";
import cookie from "cookie";

// Rate-limited, low-sensitivity auth logging controls
let lastAuthLogAt = 0;
const AUTH_LOG_INTERVAL_MS = Number(process.env.AUTH_LOG_INTERVAL_MS) || 5000; // default 5s

export const protect = async (req, res, next) => {
  try {
    // Light-weight diagnostic logging: only presence/absence (no token values), rate-limited.
    // Enable by setting DEBUG_AUTH=true in your environment. Interval controlled by AUTH_LOG_INTERVAL_MS (ms).
    if (process.env.DEBUG_AUTH === "true") {
      const now = Date.now();
      if (now - lastAuthLogAt > AUTH_LOG_INTERVAL_MS) {
        lastAuthLogAt = now;
        const hasAuthHeader = !!req.headers.authorization;
        let cookieTokenPresent = false;
        try {
          if (req.headers.cookie) {
            const cookies = cookie.parse(req.headers.cookie || "");
            cookieTokenPresent = !!cookies.token;
          }
        } catch (e) {
          // ignore cookie parse errors
        }
        console.log(
          `[authMiddleware] auth header present: ${hasAuthHeader}, cookie token present: ${cookieTokenPresent}`
        );
      }
    }

    // 1️⃣ Try reading from Authorization header
    let token = req.header("Authorization")?.replace("Bearer ", "");

    // 2️⃣ If not found, try reading from cookies
    if (!token && req.headers.cookie) {
      const cookies = cookie.parse(req.headers.cookie || "");
      token = cookies.token;
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authorized, no token provided" });
    }

    // 3️⃣ Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Attach user to request
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
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
