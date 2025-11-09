// seedSellers.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";
import Seller from "./models/Seller.js";
import connectDB from "./config/db.js";

dotenv.config();

const sellersData = [
  {
    name: "Luna Designs",
    storeName: "Luna’s Boutique",
    businessName: "Luna Creative Studio",
    bio: "We create fashion-forward designs with love and precision.",
    banner: "/uploads/banner.jpg",
    logo: "/uploads/guy.png",
    category: ["Fashion", "Accessories"],
    description: "Trendy clothing and handmade accessories for all.",
    location: "Lagos, Nigeria",
    rating: 4.8,
    sold: 123,
    isVerified: true,
  },
  {
    name: "Techify Hub",
    storeName: "Techify Electronics",
    businessName: "Techify Solutions",
    bio: "Your go-to spot for quality gadgets and smart devices.",
    banner: "/uploads/banner.jpg",
    logo: "/uploads/guy.png",
    category: ["Electronics", "Gadgets"],
    description: "Affordable and durable tech accessories.",
    location: "Abuja, Nigeria",
    rating: 4.5,
    sold: 210,
    isVerified: true,
  },
  {
    name: "Glow Haven",
    storeName: "Glow Haven Beauty",
    businessName: "Glow Haven Ltd",
    bio: "Skincare made with nature’s best ingredients.",
    banner: "/uploads/banner.jpg",
    logo: "/uploads/guy.png",
    category: ["Beauty", "Health"],
    description: "Organic skincare and wellness essentials.",
    location: "Port Harcourt, Nigeria",
    rating: 4.9,
    sold: 342,
    isVerified: true,
  },
];

const seedSellers = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB Connected");

    console.log("🗑️ Clearing old sellers and their users...");
    await Seller.deleteMany();
    await User.deleteMany({ role: "seller" });

    console.log("👤 Creating test seller users...");
    const testUsers = await User.insertMany(
      sellersData.map((s, i) => ({
        name: s.storeName,
        email: `19${1234567 + i + Math.floor(Math.random() * 100)}@live.unilag.edu.ng`,
        password: "123456",
        role: "seller",
      }))
    );

    console.log("🛍️ Creating seller profiles...");
    const sellersToInsert = sellersData.map((s, i) => ({
      ...s,
      user: testUsers[i]._id,
    }));

    const inserted = await Seller.insertMany(sellersToInsert);

    console.log(`✅ Successfully seeded ${inserted.length} sellers!`);
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding sellers:", err);
    process.exit(1);
  }
};

seedSellers();
