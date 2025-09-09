import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^[1-9]\d{1}\d{5,}@live\.unilag\.edu\.ng$/,
      "Please use your valid school email (matric ≥ 19xxxxxxx)",
    ],
  },
  password: {
    type: String,
    required: true,
    minlength: [6, "Password must be at least 6 characters"],
    // Removed regex validation here, now handled in controller
  },
});

const User = mongoose.model("User", userSchema);
export default User;
