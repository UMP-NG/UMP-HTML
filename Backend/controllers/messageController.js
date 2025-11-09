import Message from "../models/Message.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import path from "path";
import { io } from "../server.js"; // Make sure io is exported from server.js

// ---------- SEND MESSAGE ----------
export const sendMessage = async (req, res) => {
  try {
    const { receiver, text } = req.body;

    if (!receiver && !text && !req.files?.length) {
      return res
        .status(400)
        .json({ message: "Message or attachments required" });
    }

    const receiverUser = await User.findById(receiver);
    if (!receiverUser)
      return res.status(404).json({ message: "Receiver not found" });

    const senderRole = req.user.role;
    const receiverRole = receiverUser.role;

    // Example: basic messaging rule
    if (senderRole === "user" && !["seller", "admin"].includes(receiverRole)) {
      return res.status(403).json({
        message: "Users can only message sellers or admins",
      });
    }

    // Build attachment URLs if uploaded
    const attachments = (req.files || []).map((file) => {
      return `${req.protocol}://${req.get(
        "host"
      )}/uploads/messages/${path.basename(file.path)}`;
    });

    const message = await Message.create({
      sender: req.user._id,
      receiver,
      text: text || "",
      attachments,
    });

    // ✅ Emit via Socket.io
    io.to(receiver.toString()).emit("new_message", message);
    io.to(req.user._id.toString()).emit("new_message", message);

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------- PAGINATED MESSAGES ----------
export const getUserMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20, conversationWith } = req.query;
    const skip = (page - 1) * limit;

    const filter = {
      $or: [
        { sender: req.user._id, receiver: conversationWith },
        { sender: conversationWith, receiver: req.user._id },
      ],
    };

    const messages = await Message.find(filter)
      .populate("sender", "name avatar role")
      .populate("receiver", "name avatar role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json(messages);
  } catch (error) {
    console.error("Error fetching paginated messages:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------- MARK MESSAGE READ ----------
export const markMessageRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    message.isRead = true;
    await message.save();

    res.json({ message: "Message marked as read", data: message });
  } catch (error) {
    console.error("Error marking message read:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------- CONVERSATIONS ----------
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { receiver: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      {
        $project: {
          sender: 1,
          receiver: 1,
          text: 1,
          createdAt: 1,
          unread: { $cond: [{ $in: [userId, "$readBy"] }, 0, 1] },
          conversationWith: {
            $cond: [
              { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] },
              "$receiver",
              "$sender",
            ],
          },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$conversationWith",
          latestMessage: { $first: "$text" },
          latestCreatedAt: { $first: "$createdAt" },
          unreadCount: { $sum: "$unread" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          conversationWith: "$user._id",
          name: "$user.name",
          avatar: "$user.avatar",
          latestMessage: 1,
          latestCreatedAt: 1,
          unreadCount: 1,
        },
      },
      { $sort: { latestCreatedAt: -1 } },
    ]);

    res.json(conversations);
  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------- LATEST CONVERSATIONS ----------
export const getUserConversationsLatest = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "name role avatar")
      .populate("receiver", "name role avatar")
      .sort({ createdAt: -1 });

    const map = {};
    messages.forEach((msg) => {
      const otherId =
        msg.sender._id.toString() === userId.toString()
          ? msg.receiver._id.toString()
          : msg.sender._id.toString();

      if (!map[otherId]) {
        map[otherId] = msg;
      }
    });

    res.json(Object.values(map));
  } catch (error) {
    console.error("Error fetching latest conversations:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------- UNREAD MESSAGES ----------
export const getUnreadMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const unreadMessages = await Message.find({
      receiver: userId,
      isRead: false,
    })
      .populate("sender", "name role avatar")
      .sort({ createdAt: -1 });

    res.json(unreadMessages);
  } catch (error) {
    console.error("Error fetching unread messages:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------- MARK CONVERSATION READ ----------
export const markConversationRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationWithId } = req.params;

    await Message.updateMany(
      {
        sender: conversationWithId,
        receiver: userId,
        readBy: { $ne: userId },
      },
      { $push: { readBy: userId }, $set: { isRead: true } }
    );

    res.json({ message: "Conversation marked as read" });
  } catch (error) {
    console.error("Error marking conversation read:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------- UNREAD COUNTS ----------
export const getUnreadCounts = async (req, res) => {
  try {
    const userId = req.user._id;

    const counts = await Message.aggregate([
      {
        $match: {
          receiver: new mongoose.Types.ObjectId(userId),
          readBy: { $ne: userId },
        },
      },
      {
        $group: {
          _id: "$sender",
          unreadCount: { $sum: 1 },
        },
      },
    ]);

    res.json(counts);
  } catch (error) {
    console.error("Error getting unread counts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------- SINGLE MESSAGE ----------
export const getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId)
      .populate("sender", "name avatar role")
      .populate("receiver", "name avatar role");

    if (!message) return res.status(404).json({ message: "Message not found" });

    if (
      message.sender._id.toString() !== req.user._id.toString() &&
      message.receiver._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(message);
  } catch (error) {
    console.error("Error fetching message:", error);
    res.status(500).json({ message: "Server error" });
  }
};
