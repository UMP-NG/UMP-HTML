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
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // OTP fields
    isVerified: { type: Boolean, default: false },
    otp: String,
    otpExpire: Date,

    // Password reset fields
    resetPasswordToken: String,
    resetPasswordExpire: Date,
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
  const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
  this.otp = otp;
  this.otpExpire = Date.now() + 10 * 60 * 1000; // 10 mins expiry
  return otp;
};

export default mongoose.model("User", userSchema);
