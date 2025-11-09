// controllers/bookingController.js
import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import Listing from "../models/Listing.js";

// ===============================
// CREATE BOOKING
// ===============================
export const createBooking = async (req, res) => {
  try {
    const { itemId, itemType, date, timeSlot, notes } = req.body;

    if (!itemId || !itemType || !date || !timeSlot) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    let item, provider, providerModel;

    if (itemType === "service") {
      item = await Service.findById(itemId);
      if (!item) return res.status(404).json({ message: "Service not found." });
      provider = item.seller; // service provider
      providerModel = "service_provider";
    } else if (itemType === "listing") {
      item = await Listing.findById(itemId);
      if (!item) return res.status(404).json({ message: "Listing not found." });
      provider = item.seller; // accommodation seller
      providerModel = "User";
    } else {
      return res.status(400).json({ message: "Invalid booking type." });
    }

    const booking = await Booking.create({
      user: req.user._id,
      item: item._id,
      itemModel: itemType === "service" ? "Service" : "Listing",
      provider,
      providerModel,
      date,
      timeSlot,
      notes,
    });

    res.status(201).json({
      success: true,
      message: `Booking created successfully for ${itemType}`,
      booking,
    });
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GET USER BOOKINGS
// ===============================
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("item")
      .populate("provider", "name email");

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("❌ Error fetching user bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GET PROVIDER BOOKINGS
// ===============================
export const getProviderBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      provider: req.user._id,
    })
      .populate("user", "name email")
      .populate("item");

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("❌ Error fetching provider bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
};
