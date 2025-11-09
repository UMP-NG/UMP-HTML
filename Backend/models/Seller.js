import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: { type: String, required: true, trim: true },
    storeName: { type: String, trim: true },
    businessName: { type: String, trim: true },
    bio: String,
    banner: String,
    logo: String,
    avatar: String,

    sold: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    category: [String],

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    story: String,
    description: { type: String, trim: true },
    location: { type: String, trim: true },

    // ✅ Store Verification
    isVerified: { type: Boolean, default: false },

    // ✅ Relationship with products
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    // ✅ Analytics
    totalRevenue: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalProducts: { type: Number, default: 0 },
    pendingPayout: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    address: { type: String, trim: true },

    // ✅ Payout system
    bankDetails: {
      bankName: String,
      accountName: String,
      accountNumber: String,
    },
    payoutHistory: [
      {
        amount: Number,
        date: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["pending", "paid", "failed"],
          default: "pending",
        },
        referenceId: String,
      },
    ],
  },
  { timestamps: true }
);

// ✅ Add searchable text index
sellerSchema.index({
  name: "text",
  storeName: "text",
  businessName: "text",
  description: "text",
  story: "text",
});

export default mongoose.model("Seller", sellerSchema);
