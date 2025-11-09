import Seller from "../models/Seller.js";
import User from "../models/User.js";

export const becomeSeller = async (req, res) => {
  try {
    const {
      name,
      storeName,
      businessName,
      bio,
      story,
      description,
      location,
      avatar,
      address,
      category,
    } = req.body;

    // ✅ Default images
    let logo = "/images/guy.png";
    let banner = "/images/banner-default.jpg";

    // ✅ Uploaded images (if available)
    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        logo = `/uploads/sellers/${req.files.logo[0].filename}`;
      }
      if (req.files.banner && req.files.banner[0]) {
        banner = `/uploads/sellers/${req.files.banner[0].filename}`;
      }
    }

    // ✅ Ensure seller role
    if (!req.user.roles.includes("seller")) {
      req.user.roles.push("seller");
      await req.user.save();
    }

    let seller = await Seller.findOne({ user: req.user._id });

    if (seller) {
      // ✅ Update
      seller.name = name || seller.name;
      seller.storeName = storeName || seller.storeName;
      seller.businessName = businessName || seller.businessName;
      seller.bio = bio || seller.bio;
      seller.banner = banner || seller.banner;
      seller.logo = logo || seller.logo;
      seller.story = story || seller.story;
      seller.description = description || seller.description;
      seller.location = location || seller.location;
      seller.avatar = avatar || seller.avatar;
      seller.address = address || seller.address;

      if (category) {
        seller.category = Array.isArray(category)
          ? category
          : category.split(",").map((c) => c.trim());
      }

      await seller.save();
    } else {
      // ✅ Create
      seller = await Seller.create({
        user: req.user._id,
        name,
        storeName,
        businessName,
        bio,
        banner,
        logo,
        story,
        description,
        location,
        avatar,
        address,
        category: Array.isArray(category)
          ? category
          : category
          ? category.split(",").map((c) => c.trim())
          : [],
      });
    }

    res.status(200).json({
      success: true,
      message: "✅ Seller profile saved successfully.",
      seller,
    });
  } catch (error) {
    console.error("❌ Error saving seller profile:", error);
    res.status(500).json({
      message: error.message || "Server error while saving seller profile.",
    });
  }
};

export const getSellerProfile = async (req, res) => {
  try {
    // Try to find an existing seller record
    let seller = await Seller.findOne({ user: req.user._id });

    // If no seller record, return minimal user info instead of 500
    if (!seller) {
      const user = await User.findById(req.user._id).select(
        "username email roles avatar"
      );
      return res.status(200).json({
        _id: user._id,
        storeName: user.username,
        logo: user.avatar || null,
        message: "No seller profile yet",
      });
    }

    res.status(200).json(seller);
  } catch (err) {
    console.error("❌ Error fetching seller profile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get all sellers
export const getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find()
      .populate("user", "email role")
      .populate("products", "name price images");
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get single seller
export const getSellerById = async (req, res) => {
  try {
    let seller =
      (await Seller.findById(req.params.id)
        .populate("user", "email role")
        .populate("products", "name price images")) ||
      (await Seller.findOne({ user: req.params.id })
        .populate("user", "email role")
        .populate("products", "name price images"));

    if (!seller) return res.status(404).json({ message: "Seller not found" });

    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Toggle follow/unfollow atomically
export const followSeller = async (req, res) => {
  try {
    const sellerId = req.params.id;
    const userId = req.user._id;

    if (sellerId.toString() === userId.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const seller = await User.findById(sellerId).select("followers");
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    const alreadyFollowing = seller.followers.includes(userId);

    const update = alreadyFollowing
      ? { $pull: { followers: userId } }
      : { $addToSet: { followers: userId } };

    const updatedSeller = await User.findByIdAndUpdate(sellerId, update, {
      new: true,
      select: "followers",
    });

    res.json({
      following: !alreadyFollowing,
      followersCount: updatedSeller.followers.length,
    });
  } catch (err) {
    console.error("❌ Follow action error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Unfollow a seller
export const unfollowSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    const user = await User.findById(req.user._id);

    if (!seller) return res.status(404).json({ message: "Seller not found" });

    seller.followers = seller.followers.filter(
      (followerId) => followerId.toString() !== user._id.toString()
    );

    await seller.save();
    res.json({ message: "Seller unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const incrementSellerView = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await Seller.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    res.json({ message: "Seller view counted", views: seller.views });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
