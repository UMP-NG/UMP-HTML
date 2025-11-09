import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";

dotenv.config();

const admins = [
  {
    name: "Technical Support",
    email: "240401509@live.unilag.edu.ng",
    avatar: "/uploads/techtide.png",
  },
];

await mongoose.connect(process.env.MONGO_URI);

try {
  for (const admin of admins) {
    const exists = await Admin.findOne({ email: admin.email });
    if (exists) {
      console.log(`✅ Admin already exists: ${admin.email}`);
    } else {
      await Admin.create(admin);
      console.log(`🎉 Created admin: ${admin.email}`);
    }
  }
} catch (err) {
  console.error("❌ Error seeding admins:", err);
} finally {
  await mongoose.disconnect();
}
