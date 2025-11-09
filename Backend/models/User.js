import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [
        /^[1-9]\d{1}\d{5,}@live\.unilag\.edu\.ng$/,
        "Please use your valid school email (matric ≥ 19xxxxxxx)",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters"],
    },

    // 🧩 Role system
    roles: {
      type: [String],
      enum: ["user", "seller", "service_provider", "walker", "admin"],
      default: ["user"],
    },

    sellerInfo: {
      storeName: String,
      description: String,
      location: String,
      phone: String,
    },
    serviceProviderInfo: {
      businessName: String,
      skills: [String],
      rate: Number,
      bio: String,
    },
    // list of Service _id references for services the user provides
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    walkerInfo: {
      transportMethod: { type: String, default: "" },
      zonesCovered: { type: String, default: "" },
      availability: { type: String, default: "" }, // <-- was Boolean
      idCard: { type: String, default: null },
      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
      },
    },

    // 🧠 Basic profile info
    name: { type: String, trim: true },
    avatar: { type: String, default: "" }, // profile picture
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    bio: { type: String, trim: true },

    // 🛒 E-commerce-specific
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
      },
    ],

    // 🧍 Social features
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // ✅ Verification & security
    isVerified: { type: Boolean, default: false },
    otp: String,
    otpExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    dateOfBirth: Date,
    gender: { type: String, enum: ["male", "female", "other"] },
    website: { type: String },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    paymentMethods: [
      {
        cardType: String,
        last4Digits: String,
        expiry: Date,
      },
    ],
    loyaltyPoints: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },
    notifications: [
      {
        type: String,
        message: String,
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    twoFactorEnabled: { type: Boolean, default: false },
    lastLogin: Date,
    notificationPreferences: {
      order: { type: Boolean, default: true },
      message: { type: Boolean, default: true },
      payout: { type: Boolean, default: true },
      inventory: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// ===============================
// HASH PASSWORD BEFORE SAVE
// ===============================
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ===============================
// COMPARE PASSWORD METHOD
// ===============================
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ===============================
// GENERATE 4-DIGIT OTP
// ===============================
userSchema.methods.createOTP = function () {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  this.otp = otp;
  this.otpExpire = Date.now() + 10 * 60 * 1000; // 10 mins expiry
  return otp;
};

export default mongoose.model("User", userSchema);
