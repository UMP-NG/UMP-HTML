import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authroutes.js";

dotenv.config();
console.log("Using email:", process.env.EMAIL_USER);

connectDB();

const app = express();

// ✅ Middlewares must come FIRST
const allowedOrigins = [
  "http://127.0.0.1:5500", 
  "http://localhost:5500",
  "https://ump-ng.github.io"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

app.use(helmet());

// ✅ Now register routes AFTER CORS
app.use("/api/auth", authRoutes);

// ✅ Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working and connected to MongoDB!" });
});

// ✅ Root route
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
