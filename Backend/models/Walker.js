import mongoose from "mongoose";

const dispatcherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Dispatcher must be linked to a user"],
      unique: true, // prevent multiple dispatcher profiles per user
    },
    zonesCovered: {
      type: String,
      required: [true, "Zones covered is required"],
      trim: true,
      maxlength: [200, "Zones covered cannot exceed 200 characters"],
    },
    availability: { type: String, required: true },
    idCard: {
      type: String, // cloud URL or local file path
      default: null,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    approvedAt: {
      type: Date, // optional timestamp when admin approves
      default: null,
    },
  },
  { timestamps: true }
);

// Index for quick admin queries
dispatcherSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Dispatcher", dispatcherSchema);
