import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Service from "./models/Service.js";
import ServiceSession from "./models/ServiceSession.js";

dotenv.config();

const MONGO = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ump";

async function main() {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("Connected to MongoDB:", MONGO);

  // Try to locate a provider user
  const provider = await User.findOne({ roles: "service_provider" });
  if (!provider) {
    console.error("No user with role 'service_provider' found. Create a provider user first.");
    process.exit(1);
  }

  // Try to locate a client (any user that's not the provider)
  const client = await User.findOne({ _id: { $ne: provider._id } });
  if (!client) {
    console.error("No client user found. Create at least one additional user to act as the client.");
    process.exit(1);
  }

  // Try to find a service belonging to the provider
  let service = await Service.findOne({ provider: provider._id });
  if (!service) {
    // fallback: any service
    service = await Service.findOne();
  }
  if (!service) {
    console.error("No Service document found. Create a Service first (one that references a provider).");
    process.exit(1);
  }

  const session = await ServiceSession.create({
    service: service._id,
    client: client._id,
    provider: provider._id,
    date: new Date(),
    price: 5000,
    rating: 4.5,
    status: "completed",
  });

  console.log("Created ServiceSession:", session);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
