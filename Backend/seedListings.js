import mongoose from "mongoose";
import dotenv from "dotenv";
import Listing from "./models/Listing.js";
import User from "./models/User.js";
import bcrypt from "bcrypt";

dotenv.config();

const listings = [
  {
    name: "Maple Heights Apartment",
    type: "Apartment",
    description:
      "A luxury 2-bedroom apartment with modern finishes, 24/7 power supply, and easy access to campus. Perfect for students seeking comfort and security.",
    price: 180000,
    rate: "per Year",
    location: "Akoka, Lagos",
    beds: 2,
    baths: 2,
    distance: "300m from UNILAG Gate",
    amenities: ["WiFi", "24/7 Power", "Water", "Furnished Kitchen"],
    images: [
      "/uploads/apart.jpeg",
      "/uploads/apart2.jpg",
      "/uploads/apart3.jpg",
    ],
    videos: ["/uploads/apart.mp4"],
    furnished: true,
    reviews: [
      {
        stars: 5,
        name: "Chika",
        year: 2024,
        text: "Amazing apartment with everything I needed. Worth the price!",
      },
    ],
  },
  {
    name: "Campus View Lodge",
    type: "Hostel",
    description:
      "A student-friendly hostel offering clean rooms, constant water, and walking distance to campus. Ideal for first-year students.",
    price: 95000,
    rate: "per Year",
    location: "Akoka, Lagos",
    beds: 1,
    baths: 1,
    distance: "200m from Faculty of Science",
    amenities: ["Water", "Security", "Laundry Access"],
    images: [
      "/uploads/hostel.jpg",
      "/uploads/hostel2.jpg",
      "/uploads/hostel3.jpg",
    ],
    // ✅ Video removed for hostel (since you said no video here)
    furnished: false,
    reviews: [
      {
        stars: 4,
        name: "Tunde",
        year: 2025,
        text: "Good environment and close to school. A bit small but cozy.",
      },
    ],
  },
];

const seedListings = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // ✅ Ensure at least one Seller exists
    let owner = await User.findOne({ role: "Seller" });

    if (!owner) {
      console.log("⚙️ No Seller found — creating a default Seller account...");
      const hashedPassword = await bcrypt.hash("123456", 10);

      // Generate a valid matric number-style email
      const randomMatric = 190000000 + Math.floor(Math.random() * 1000);
      const email = `${randomMatric}@live.unilag.edu.ng`;

      owner = await User.create({
        name: "Demo Seller",
        email,
        password: hashedPassword,
        role: "Seller",
      });
      console.log(`✅ Created Seller: ${owner.email}`);
    }

    // 🧹 Clear old listings
    await Listing.deleteMany();
    console.log("🗑️ Old listings cleared");

    // ✅ Seed new listings
    const listingsWithOwner = listings.map((l) => ({
      ...l,
      owner: owner._id,
    }));

    await Listing.insertMany(listingsWithOwner);
    console.log("✅ Listings seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedListings();
