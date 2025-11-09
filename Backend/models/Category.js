import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true },
    // optional image/icon for the category
    image: { type: String },
    // convenience: keep an array of subcategory ids (not required)
    subcategories: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" },
    ],
  },
  { timestamps: true }
);

categorySchema.index({ name: "text", description: "text" });

export default mongoose.model("Category", categorySchema);
