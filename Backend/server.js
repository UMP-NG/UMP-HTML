import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authroutes.js";
import mongoose from "mongoose";

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);

app.use(express.json()); // Parse JSON request body

// Middlewares
app.use(express.json());
// server.js (backend)
app.use(cors({ origin: "http://localhost:5500" }));
app.use(helmet());

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working and connected to MongoDB!" });
});

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
