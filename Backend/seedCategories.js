import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "./models/Category.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const categories = [
  {
    name: "Fashion",
    slug: "fashion",
    description: "Clothes • Shoes • Accessories",
    image: "/uploads/fashion.jpg",
  },
  {
    name: "Electronics",
    slug: "electronics",
    description: "Phones • Laptops • Gadgets",
    image: "/uploads/electronics.jpg",
  },
  {
    name: "Art & Decor",
    slug: "art-decor",
    description: "Wall Art • Crafts • Home",
    image: "/uploads/arts.jpg",
  },
  {
    name: "Books",
    slug: "books",
    description: "Study • Fiction • Lifestyle",
    image: "/uploads/books.jpg",
  },
  {
    name: "Home & Kitchen",
    slug: "home-kitchen",
    description: "Appliances, furniture, and décor.",
    image: "/uploads/home.jpg",
  },
  {
    name: "Beauty & Health",
    slug: "beauty-health",
    description: "Cosmetics • Skincare • Fitness",
    image: "/uploads/beauty.jpg",
  },
  {
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    description: "Sports gear • Outdoor equipment",
    image: "/uploads/sports.jpg",
  },
  {
    name: "Automotive",
    slug: "automotive",
    description: "Car parts • Accessories • Tools",
    image: "/uploads/automotive.jpg",
  },
  {
    name: "Groceries",
    slug: "groceries",
    description: "Everyday essentials • Food • Drinks",
    image: "/uploads/groceries.png",
  },
  {
    name: "Pet Supplies",
    slug: "pet-supplies",
    description: "Toys • Food • Accessories",
    image: "/uploads/pet.jpg",
  },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    await Category.deleteMany();
    await Category.insertMany(categories);
    console.log("✅ Categories seeded successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seed();
