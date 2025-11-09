// server.js
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";
import Message from "./models/Message.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// 🧩 Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 🧩 Create HTTP server
const server = http.createServer(app);

// ⚡ Attach Socket.io
export const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "https://ump-ng.github.io",
      "https://your-frontend-domain.com",
    ],
    credentials: true,
  },
});

// 🧠 Track online users
const onlineUsers = new Map();

// 💬 Socket.io Events
io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  // Register user
  socket.on("register", (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      console.log(`✅ User ${userId} connected (socket: ${socket.id})`);
    }
  });

  // Handle sending messages
  socket.on("send_message", async (data) => {
    try {
      const { sender, receiver, text, attachments = [] } = data;
      if (!sender || !receiver || (!text && !attachments.length)) return;

      const message = await Message.create({
        sender,
        receiver,
        text,
        attachments,
      });

      const populated = await message.populate(
        "sender receiver",
        "name avatar role"
      );

      const senderSocket = onlineUsers.get(sender);
      const receiverSocket = onlineUsers.get(receiver);

      if (senderSocket) io.to(senderSocket).emit("new_message", populated);
      if (receiverSocket) io.to(receiverSocket).emit("new_message", populated);

      console.log(`💬 Message sent from ${sender} → ${receiver}`);
    } catch (err) {
      console.error("❌ Error handling send_message:", err);
    }
  });

  // Handle disconnects
  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`❌ User ${userId} disconnected`);
        break;
      }
    }
  });
});

// 🚀 Start server
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
