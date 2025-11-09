import mongoose from "mongoose";
import dotenv from "dotenv";
import Service from "./models/Service.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

const seedServices = async () => {
  try {
    await connectDB();

    await Service.deleteMany();
    console.log("🧹 Old services removed");

    // 🆔 Replace with your actual provider/admin ObjectId
    const myId = "68f7bde86fba125b89a90a88"; // <-- your real _id here
    const myModel = "admin"; // or "admin" if that’s your role

    const sampleServices = [
      {
        name: "John Adewale",
        title: "Professional Graphic Designer",
        rate: 8000,
        currency: "NGN",
        package: "Standard",
        rating: 4.8,
        reviewsCount: 27,
        verified: true,
        image: "https://i.ibb.co/2t0FyCm/design.jpg",
        major: "design",
        desc: "I design stunning logos, banners, and social media graphics.",
        about:
          "With over 4 years of experience in Adobe Photoshop and Illustrator, I create visually appealing and modern designs that fit your brand identity.",
        certifications: ["Adobe Certified Designer"],
        portfolio: ["https://www.behance.net/john-designs"],
        policies: ["Revisions allowed: 2", "Delivery within 48 hours"],
        available: true,
        tags: ["design", "logo", "branding"],
        duration: 2,
        seller: myId,
        sellerModel: myModel,
      },
      {
        name: "Grace Nwosu",
        title: "Experienced Fitness Coach",
        rate: 5000,
        currency: "NGN",
        package: "Basic",
        rating: 4.6,
        reviewsCount: 15,
        verified: true,
        image: "https://i.ibb.co/mhzRktS/fitness.jpg",
        major: "fitness",
        desc: "Get fit and strong with my personalized fitness sessions.",
        about:
          "I offer customized fitness and nutrition coaching programs for all experience levels — whether at home or the gym.",
        certifications: ["Certified Personal Trainer (ACE)"],
        policies: ["Free consultation for first session"],
        available: true,
        tags: ["fitness", "coach", "training"],
        duration: 1,
        seller: myId,
        sellerModel: myModel,
      },
    ];

    await Service.insertMany(sampleServices);
    console.log("✅ Services added successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedServices();
