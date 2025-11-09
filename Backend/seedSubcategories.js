import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "./models/Category.js";
import Subcategory from "./models/Subcategory.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const subcategoriesData = {
  Fashion: [
    {
      name: "Men's Wear",
      slug: "mens-wear",
      description: "Shirts, pants, suits, and more.",
    },
    {
      name: "Women's Wear",
      slug: "womens-wear",
      description: "Dresses, tops, skirts, and more.",
    },
    {
      name: "Footwear",
      slug: "footwear",
      description: "Shoes, sandals, heels, and sneakers.",
    },
    {
      name: "Accessories",
      slug: "accessories",
      description: "Bags, belts, watches, and jewelry.",
    },
  ],
  Electronics: [
    {
      name: "Mobile Phones",
      slug: "mobile-phones",
      description: "Smartphones and feature phones.",
    },
    {
      name: "Laptops",
      slug: "laptops",
      description: "Personal and gaming laptops.",
    },
    {
      name: "Audio & Headphones",
      slug: "audio-headphones",
      description: "Earphones, speakers, and more.",
    },
    {
      name: "Wearables",
      slug: "wearables",
      description: "Smartwatches and fitness bands.",
    },
  ],
  "Home & Kitchen": [
    {
      name: "Furniture",
      slug: "furniture",
      description: "Sofas, tables, beds, and more.",
    },
    {
      name: "Appliances",
      slug: "appliances",
      description: "Refrigerators, blenders, irons, etc.",
    },
    {
      name: "Cookware",
      slug: "cookware",
      description: "Pots, pans, cutlery, and utensils.",
    },
    {
      name: "Lighting",
      slug: "lighting",
      description: "Bulbs, lamps, chandeliers, etc.",
    },
  ],
  "Beauty & Health": [
    {
      name: "Makeup",
      slug: "makeup",
      description: "Face, eyes, and lips products.",
    },
    {
      name: "Skincare",
      slug: "skincare",
      description: "Cleansers, moisturizers, serums.",
    },
    {
      name: "Haircare",
      slug: "haircare",
      description: "Shampoos, conditioners, and oils.",
    },
    {
      name: "Fitness",
      slug: "fitness",
      description: "Gym gear and supplements.",
    },
  ],
  Books: [
    {
      name: "Educational",
      slug: "educational",
      description: "Textbooks, guides, and academic materials.",
    },
    {
      name: "Fiction",
      slug: "fiction",
      description: "Novels and stories across genres.",
    },
    {
      name: "Comics",
      slug: "comics",
      description: "Manga, graphic novels, and more.",
    },
    {
      name: "Self Help",
      slug: "self-help",
      description: "Motivation, productivity, and wellness books.",
    },
  ],
  "Sports & Outdoors": [
    {
      name: "Fitness Equipment",
      slug: "fitness-equipment",
      description: "Weights, mats, and benches.",
    },
    {
      name: "Outdoor Gear",
      slug: "outdoor-gear",
      description: "Camping, hiking, and sports accessories.",
    },
    {
      name: "Cycling",
      slug: "cycling",
      description: "Bikes, helmets, and safety kits.",
    },
  ],
  Automotive: [
    {
      name: "Car Accessories",
      slug: "car-accessories",
      description: "Seat covers, mats, and more.",
    },
    {
      name: "Car Care",
      slug: "car-care",
      description: "Cleaners, wax, and maintenance kits.",
    },
    {
      name: "Motorcycle Parts",
      slug: "motorcycle-parts",
      description: "Helmets, parts, and gear.",
    },
  ],
  Groceries: [
    {
      name: "Beverages",
      slug: "beverages",
      description: "Soft drinks, juices, and water.",
    },
    {
      name: "Snacks",
      slug: "snacks",
      description: "Chips, biscuits, nuts, and sweets.",
    },
    {
      name: "Household",
      slug: "household",
      description: "Cleaning and personal care items.",
    },
    {
      name: "Fresh Produce",
      slug: "fresh-produce",
      description: "Fruits and vegetables.",
    },
  ],
  "Pet Supplies": [
    {
      name: "Dog Supplies",
      slug: "dog-supplies",
      description: "Food, collars, toys for dogs.",
    },
    {
      name: "Cat Supplies",
      slug: "cat-supplies",
      description: "Food, litter, toys for cats.",
    },
    {
      name: "Pet Toys",
      slug: "pet-toys",
      description: "Interactive and chew toys.",
    },
  ],
  "Art & Decor": [
    {
      name: "Wall Art",
      slug: "wall-art",
      description: "Paintings, posters, and digital prints.",
    },
    {
      name: "Crafts",
      slug: "crafts",
      description: "Handmade decor and ornaments.",
    },
    {
      name: "Home Accents",
      slug: "home-accents",
      description: "Vases, figurines, and table decor.",
    },
    {
      name: "Lighting Decor",
      slug: "lighting-decor",
      description: "Ambient lights and decorative lamps.",
    },
  ],
};

const seedSubcategories = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("🟢 Connected to MongoDB");

    await Subcategory.deleteMany();
    console.log("🧹 Cleared existing subcategories");

    const categories = await Category.find();

    for (const category of categories) {
      const subs = subcategoriesData[category.name];
      if (!subs) {
        console.warn(`⚠️ No subcategories found for ${category.name}`);
        continue;
      }

      const subDocs = subs.map((s) => ({
        ...s,
        parent: category._id,
        image: category.image,
      }));

      await Subcategory.insertMany(subDocs);
      console.log(`✅ Added ${subs.length} subcategories to ${category.name}`);
    }

    console.log("🎉 Subcategories populated successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedSubcategories();
