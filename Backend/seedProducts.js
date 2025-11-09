import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js"; // Adjust path if different
import User from "./models/User.js";
import Category from "./models/Category.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// ✅ Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected..."))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Helper: Create slug
function makeSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const seedProducts = async () => {
  try {
    // Clear old data (optional — helps avoid duplicates)
    await Product.deleteMany();

    // ✅ Example seller (replace with a real seller _id if available)
    let seller = await User.findOne();
    if (!seller) {
      throw new Error("No seller found in Users collection!");
    }

    // ✅ Example category (replace with real category if available)
    let category = await Category.findOne();
    if (!category) {
      throw new Error("No category found in Categories collection!");
    }

    // ✅ Seed products (same seller + same category)
    const products = [
      {
        name: "Smartphone Pro X",
        slug: makeSlug("Smartphone Pro X"),
        desc: "High-performance smartphone with 128GB storage and long battery life.",
        price: 250000,
        images: [
          "/uploads/s25ultra.png",
        ],
        seller: seller._id,
        category: category._id,
        // variants removed
        colors: ["Black"],
        specs: { brand: "TechX", battery: "5000mAh", camera: "108MP" },
        stock: 10,
      },
      {
        name: "Wireless Headphones",
        slug: makeSlug("Wireless Headphones"),
        desc: "Noise-cancelling wireless headphones with 20 hours of battery life.",
        price: 80000,
        images: [
          "/uploads/headphones.jpg",
        ],
        seller: seller._id,
        category: category._id,
        // variants removed
        colors: ["Black"],
        specs: { brand: "SoundMax", bluetooth: "5.2", range: "10m" },
        stock: 20,
      },
      {
        name: "Smartwatch Elite",
        slug: makeSlug("Smartwatch Elite"),
        desc: "Feature-rich smartwatch with health tracking and AMOLED display.",
        price: 120000,
        images: [
          "/uploads/Smart Backpack.jpg",
        ],
        seller: seller._id,
        category: category._id,
        // variants removed
        colors: ["Silver"],
        specs: { brand: "TimeZone", display: "AMOLED", waterproof: "Yes" },
        stock: 15,
      },
      {
        name: "Laptop Air 15",
        slug: makeSlug("Laptop Air 15"),
        desc: "Lightweight laptop with Intel i7, 16GB RAM, and 512GB SSD.",
        price: 450000,
        images: [
          "/uploads/iphone 16.jpg",
        ],
        seller: seller._id,
        category: category._id,
        // variants removed
        colors: ["Gray"],
        specs: {
          brand: "UltraComp",
          processor: "Intel i7",
          ram: "16GB",
          storage: "512GB SSD",
        },
        stock: 8,
      },
    ];

    // ✅ Insert products
    const inserted = await Product.insertMany(products);
    console.log(`✅ Successfully inserted ${inserted.length} products.`);

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Seeding error:", err);
    mongoose.connection.close();
  }
};

seedProducts();
