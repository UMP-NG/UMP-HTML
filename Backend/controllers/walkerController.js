import Dispatcher from "../models/Walker.js";
import User from "../models/User.js";

// ✅ Student applies to become a dispatcher
export const applyDispatcher = async (req, res) => {
  try {
    const userId = req.user._id;
    const { transportMethod, zonesCovered, availability } = req.body;

    // Prevent multiple applications
    const existing = await Dispatcher.findOne({ user: userId });
    if (existing) {
      return res
        .status(400)
        .json({ message: "You already applied as a dispatcher." });
    }

    const dispatcher = await Dispatcher.create({
      user: userId,
      transportMethod,
      zonesCovered,
      availability,
      idCard: req.file ? `/uploads/${req.file.filename}` : null,
      status: "Pending", // always start as Pending
      createdAt: new Date(),
    });

    res.status(201).json({
      message:
        "✅ Application submitted successfully. Awaiting admin approval.",
      dispatcher,
    });
  } catch (error) {
    console.error("Dispatcher registration error:", error);
    res.status(500).json({ message: "Server error submitting application." });
  }
};

// ✅ Admin approves or rejects dispatcher
export const updateDispatcherStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "Approved" or "Rejected"

    const dispatcher = await Dispatcher.findById(id).populate("user");
    if (!dispatcher)
      return res.status(404).json({ message: "Dispatcher not found." });

    dispatcher.status = status;
    await dispatcher.save();

    // Update user roles if approved
    if (status.toLowerCase() === "approved") {
      const user = await User.findById(dispatcher.user._id);
      if (!user.roles.includes("walker")) {
        user.roles.push("walker");
        await user.save();
      }
    }

    res.json({ message: `Dispatcher ${status.toLowerCase()} successfully.` });
  } catch (error) {
    console.error("Approval error:", error);
    res.status(500).json({ message: "Error updating dispatcher status." });
  }
};

// ✅ Admin: Get all pending dispatchers
export const getPendingDispatchers = async (req, res) => {
  try {
    const pending = await Dispatcher.find({ status: "Pending" }).populate(
      "user",
      "name email roles"
    );
    res.json(pending);
  } catch (error) {
    console.error("Fetching pending dispatchers error:", error);
    res.status(500).json({ message: "Error fetching pending dispatchers." });
  }
};

// ✅ Student: View their own dispatcher profile
export const getMyDispatcherProfile = async (req, res) => {
  try {
    const dispatcher = await Dispatcher.findOne({
      user: req.user._id,
    }).populate("user", "name email roles");
    if (!dispatcher)
      return res.status(404).json({ message: "Dispatcher profile not found." });

    res.json(dispatcher);
  } catch (error) {
    console.error("Fetching dispatcher profile error:", error);
    res.status(500).json({ message: "Error fetching dispatcher profile." });
  }
};
