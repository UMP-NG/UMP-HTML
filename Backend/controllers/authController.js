import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendMail from "../utils/sendMail.js";
import generateToken from "../utils/generateToken.js";
import Service from "../models/Service.js";

// ===============================
// SIGNUP WITH OTP
// ===============================
export const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    }

    let user;
    if (existingUser && !existingUser.isVerified) {
      // Resend OTP for unverified user
      // update name if provided (allow user to set display name before verification)
      if (name) existingUser.name = name;
      const otp = existingUser.createOTP();
      await existingUser.save({ validateBeforeSave: false });

      try {
        await sendMail({
          email: email,
          subject: "Your OTP Code",
          type: "otp",
          otp: otp,
        });
      } catch (err) {
        console.error("Mail send error:", err);
      }

      return res.status(200).json({
        message: "OTP sent successfully",
        otp, // ✅ DEV ONLY (remove in production)
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new unverified user (store provided name)
    user = new User({
      name: name || undefined,
      email,
      password,
      isVerified: false,
    });

    const otp = user.createOTP();
    await user.save();

    try {
      await sendMail({
        email: email,
        subject: "Your OTP Code",
        type: "otp",
        otp: otp,
      });
    } catch (err) {
      console.error("Mail send error:", err);
    }

    res.status(201).json({
      message: "User created. OTP sent to your email.",
      otp, // ✅ DEV ONLY (remove later)
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// SIGNUP + CREATE SERVICE (instant provider signup)
// Accepts multipart/form-data (image) or JSON body.
export const signupProvider = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      businessName,
      title,
      major,
      desc,
      about,
      rate,
      tags,
    } = req.body;

    // Basic validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    // Create user and mark verified
    const user = await User.create({
      name: name || businessName || email.split("@")[0],
      email,
      password: hashed,
      isVerified: true,
      roles: ["service_provider"],
    });

    // Create service
    const serviceData = {
      provider: user._id,
      name: businessName || name || user.name,
      title: title || "",
      major: major || "",
      desc: desc || "",
      about: about || "",
      rate: Number(rate) || 0,
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      image: req.file ? `/uploads/${req.file.filename}` : null,
      available: true,
    };

    const service = await Service.create(serviceData);

    // Link service to user
    user.services = user.services || [];
    user.services.push(service._id);
    user.serviceProviderInfo = user.serviceProviderInfo || {};
    user.serviceProviderInfo.businessName = businessName || user.name;
    user.serviceProviderInfo.skills = service.tags || [];
    user.serviceProviderInfo.rate = service.rate || 0;
    user.serviceProviderInfo.bio = service.about || "";

    await user.save();

    // generate token and set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true in prod (HTTPS), false locally
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // lax locally, none in prod
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res
      .status(201)
      .json({ message: "Provider account created", user, service });
  } catch (error) {
    console.error("Signup Provider error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===============================
// VERIFY OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "User already verified" });

    if (!user.otp || user.otp !== otp || user.otpExpire < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// LOGIN
// ===============================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("[Login Attempt] Email:", email);

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      console.log("[Login Failed] No user found for email:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log(
      "[User Found] User ID:",
      existingUser._id,
      "Verified:",
      existingUser.isVerified
    );

    // Check email verification
    if (!existingUser.isVerified) {
      console.log("[Login Failed] User email not verified:", email);
      return res
        .status(403)
        .json({ message: "Please verify your email with the OTP first." });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      console.log("[Login Failed] Incorrect password for user:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateToken(existingUser._id);
    console.log("[Login Success] User ID:", existingUser._id);

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true in prod (HTTPS), false locally
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // lax locally, none in prod
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send response
    res.status(200).json({
      message: "Login successful",
      user: {
        id: existingUser._id,
        email: existingUser.email,
      },
    });
  } catch (error) {
    console.error("[Login Error]", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// PROTECT MIDDLEWARE
// ===============================
export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { id: decoded.id };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Not authorized" });
  }
};

// ===============================
// GET LOGGED-IN USER
// ===============================
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// FORGOT PASSWORD
// ===============================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No user found with that email" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    const resetUrl = `https://ump-ng.github.io/UMP-HTML/Frontend/Pages/reset.html?token=${resetToken}`;

    try {
      await sendMail({
        email: email,
        subject: "Password Reset",
        type: "reset",
        resetUrl: resetUrl,
      });
    } catch (err) {
      console.error("Mail send error:", err);
    }

    res.status(200).json({
      message: "Password reset link generated",
      resetUrl,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// RESET PASSWORD
// ===============================
export const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Re-generate OTP and send email again
    const otp = Math.floor(100000 + Math.random() * 900000);
    await sendMail({
      email,
      subject: "Your New UMP OTP Code",
      otp,
      type: "otp",
    });

    res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to resend OTP", error });
  }
};
