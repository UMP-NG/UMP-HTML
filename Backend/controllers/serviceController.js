import Service from "../models/Service.js";
import User from "../models/User.js";
import fs from "fs";
import path from "path";

// ===============================
// GET services owned by current user
// ===============================
export const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, services });
  } catch (error) {
    console.error("getMyServices error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load services" });
  }
};

// Become Service Provider (update role + optional first service)
export const becomeServiceProvider = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Add 'service_provider' to roles array
    if (!user.roles) user.roles = [];
    if (!user.roles.includes("service_provider")) {
      user.roles.push("service_provider");
    }

    // Optionally allow adding first service here
    if (req.body.name || req.body.title) {
      const serviceData = {
        name: req.body.name,
        title: req.body.title,
        major: req.body.major,
        desc: req.body.desc,
        about: req.body.about,
        rate: Number(req.body.rate) || 0,
        currency: req.body.currency || "NGN",
        package: req.body.package || "",
        duration: Number(req.body.duration) || 0,
        certifications: req.body.certifications
          ? req.body.certifications.split(",").map((c) => c.trim())
          : [],
        portfolio: req.body.portfolio
          ? req.body.portfolio.split(",").map((p) => p.trim())
          : [],
        policies: req.body.policies
          ? req.body.policies.split(",").map((p) => p.trim())
          : [],
        tags: req.body.tags
          ? req.body.tags.split(",").map((t) => t.trim())
          : [],
        timeSlots: req.body.timeSlots
          ? Array.isArray(req.body.timeSlots)
            ? req.body.timeSlots
            : [req.body.timeSlots]
          : [],
        isAvailable: req.body.available === "on" || req.body.available === true,
        image: req.file ? `/uploads/${req.file.filename}` : null,
        createdAt: new Date(),
      };

      if (!user.services) user.services = [];
      user.services.push(serviceData);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "User is now a service provider",
      user,
    });
  } catch (error) {
    console.error("❌ Error becoming service provider:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ===============================
// CREATE a new service
// ===============================
export const createService = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const {
      name,
      title,
      major,
      desc,
      about,
      rate,
      currency,
      package: pkg,
      duration,
      certifications,
      portfolio,
      policies,
      tags,
      timeSlots,
      available,
    } = req.body;

    const parsedTimeSlots = timeSlots
      ? Array.isArray(timeSlots)
        ? timeSlots
        : [timeSlots]
      : [];

    const isAvailable = available === "on" || available === true;

    // Handle uploaded image
    let imageUrl = null;
    if (req.file) imageUrl = `/uploads/${req.file.filename}`;

    const service = await Service.create({
      provider: user._id,
      name,
      title,
      major,
      desc,
      about,
      rate: Number(rate) || 0,
      currency: currency || "NGN",
      package: pkg || "",
      duration: Number(duration) || 0,
      certifications: certifications
        ? certifications.split(",").map((c) => c.trim())
        : [],
      portfolio: portfolio ? portfolio.split(",").map((p) => p.trim()) : [],
      policies: policies ? policies.split(",").map((p) => p.trim()) : [],
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      timeSlots: parsedTimeSlots,
      isAvailable,
      image: imageUrl,
    });

    // Link service id to user's services array for easy lookup
    try {
      if (!user.services) user.services = [];
      user.services.push(service._id);
      await user.save();
    } catch (linkErr) {
      console.warn("⚠️ Could not link service to user.services:", linkErr);
    }
    // Update user role to service provider if not already
    if (user.role !== "service_provider") {
      user.role = "service_provider";
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    console.error("❌ Error creating service:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ===============================
// GET all services
// ===============================
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().populate(
      "provider",
      "name email role businessName brandName storeName"
    );

    res.json({ success: true, count: services.length, services });
  } catch (error) {
    console.error("❌ Error fetching services:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// GET single service by ID
// ===============================
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate("provider", "name email role")
      .populate({
        path: "reviews",
        // Review schema uses `author` as the user reference
        populate: { path: "author", select: "name email avatar" },
      });

    if (!service)
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });

    const userId = req.user?._id?.toString();
    const providerId = service.provider?._id?.toString();

    if (userId && userId !== providerId) {
      service.views = (service.views || 0) + 1;
      service.viewedBy = [...(service.viewedBy || []), userId];
      await service.save();
    } else if (!userId) {
      service.views = (service.views || 0) + 1;
      await service.save();
    }

    res.status(200).json({ success: true, service });
  } catch (error) {
    console.error("❌ Error fetching service:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// UPDATE service by ID
// ===============================
export const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service)
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });

    if (
      service.provider.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const updates = { ...req.body };
    if (req.file) updates.image = `/uploads/${req.file.filename}`;

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({ success: true, service: updatedService });
  } catch (error) {
    console.error("❌ Error updating service:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// DELETE service by ID
// ===============================
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service)
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });

    if (
      service.provider.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    if (service.image) {
      const filePath = path.join(process.cwd(), service.image);
      fs.unlink(filePath, (err) => {
        if (err) console.warn("⚠️ Could not delete image:", filePath);
      });
    }

    await service.deleteOne();

    // Remove reference from user's services array if present
    try {
      const owner = await User.findById(service.provider);
      if (owner && Array.isArray(owner.services)) {
        owner.services = owner.services.filter(
          (sid) => sid.toString() !== service._id.toString()
        );
        await owner.save();
      }
    } catch (remErr) {
      console.warn("⚠️ Could not remove service reference from user:", remErr);
    }

    res.json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting service:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
