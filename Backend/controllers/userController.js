import User from "../models/User.js";
import Product from "../models/Product.js";
import Service from "../models/Service.js";

// ===============================
// GET current logged-in user profile
// ===============================
export const getCurrentUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("wishlist", "name price images")
      .populate("cart.product", "name price images")
      .populate("orders")
      // populate services so frontend can access service.image directly
      .populate("services", "name image");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// UPDATE current logged-in user profile
// ===============================
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, avatar, phone, address, bio, dateOfBirth, gender, website } =
      req.body;

    user.name = name || user.name;
    user.avatar = avatar || user.avatar;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.bio = bio || user.bio;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;
    user.gender = gender || user.gender;
    user.website = website || user.website;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GET all users (admin only)
// ===============================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GET single user by ID
// ===============================
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// DELETE current user (self)
// ===============================
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.remove();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// FOLLOW / UNFOLLOW users
// ===============================
export const followUser = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id)
      return res.status(400).json({ message: "You cannot follow yourself" });

    const user = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.followers.includes(currentUser._id))
      return res.status(400).json({ message: "Already following this user" });

    user.followers.push(currentUser._id);
    currentUser.following.push(user._id);

    await user.save();
    await currentUser.save();

    res.json({ message: "User followed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.followers = user.followers.filter(
      (followerId) => followerId.toString() !== currentUser._id.toString()
    );
    currentUser.following = currentUser.following.filter(
      (followingId) => followingId.toString() !== user._id.toString()
    );

    await user.save();
    await currentUser.save();

    res.json({ message: "User unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// WISHLIST
// ===============================
export const addToWishlist = async (req, res) => {
  try {
    const productId = req.body.productId;
    const user = await User.findById(req.user._id);
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }
    res.json({ message: "Added to wishlist" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const productId = req.params.productId;
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId.toString()
    );
    await user.save();
    res.json({ message: "Removed from wishlist" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// CART
// ===============================
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const user = await User.findById(req.user._id);

    const cartItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (cartItem) {
      cartItem.quantity += quantity || 1;
    } else {
      user.cart.push({ product: productId, quantity: quantity || 1 });
    }

    await user.save();
    res.json({ message: "Added to cart" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const user = await User.findById(req.user._id);

    const cartItem = user.cart.find(
      (item) => item.product.toString() === req.params.productId
    );
    if (!cartItem) return res.status(404).json({ message: "Item not in cart" });

    cartItem.quantity = quantity;
    await user.save();
    res.json({ message: "Cart updated" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const productId = req.params.productId;
    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId
    );
    await user.save();
    res.json({ message: "Removed from cart" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// NOTIFICATIONS
// ===============================
export const markNotificationRead = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const notifIndex = user.notifications.findIndex(
      (n) => n._id.toString() === req.params.notificationId
    );
    if (notifIndex === -1)
      return res.status(404).json({ message: "Notification not found" });

    user.notifications[notifIndex].read = true;
    await user.save();
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// BECOME SERVICE PROVIDER
// ===============================
export const becomeServiceProvider = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Add 'service_provider' role
    if (!user.roles) user.roles = [];
    if (!user.roles.includes("service_provider")) {
      user.roles.push("service_provider");
    }

    // Optional: add or update service details
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

    const serviceData = {
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
      timeSlots: Array.isArray(timeSlots)
        ? timeSlots
        : timeSlots
        ? [timeSlots]
        : [],
      isAvailable: available === "on" || available === true,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      createdAt: new Date(),
    };

    // Create a Service document and link it to the user
    const service = await Service.create({
      provider: user._id,
      name: serviceData.name || user.name || "",
      title: serviceData.title || "",
      major: serviceData.major || "",
      desc: serviceData.desc || "",
      about: serviceData.about || "",
      rate: serviceData.rate || 0,
      currency: serviceData.currency || "NGN",
      package: serviceData.package || "",
      duration: serviceData.duration || 0,
      certifications: serviceData.certifications || [],
      portfolio: serviceData.portfolio || [],
      policies: serviceData.policies || [],
      tags: serviceData.tags || [],
      timeSlots: serviceData.timeSlots || [],
      available: serviceData.isAvailable,
      image: serviceData.image,
    });

    // ensure user.services is an array of ObjectId refs
    if (!user.services) user.services = [];
    user.services.push(service._id);

    // Update serviceProviderInfo on user (non-sensitive fields)
    user.serviceProviderInfo = user.serviceProviderInfo || {};
    user.serviceProviderInfo.businessName =
      user.serviceProviderInfo.businessName || serviceData.name || user.name;
    user.serviceProviderInfo.skills =
      serviceData.tags && serviceData.tags.length
        ? serviceData.tags
        : user.serviceProviderInfo.skills || [];
    user.serviceProviderInfo.rate =
      serviceData.rate || user.serviceProviderInfo.rate;
    user.serviceProviderInfo.bio =
      serviceData.about || user.serviceProviderInfo.bio || "";

    await user.save();

    res.status(200).json({
      success: true,
      message: "User is now a service provider",
      user,
      service,
    });
  } catch (error) {
    console.error("❌ Error becoming service provider:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateWalkerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update name if provided and not blank
    const name = req.body.name?.trim();
    if (name) {
      user.name = name; // top-level name for display
      user.walkerInfo.name = name; // walker-specific name
    }

    // Update avatar if file uploaded
    if (req.file) {
      const avatarPath = `/uploads/${req.file.filename}`;
      user.avatar = avatarPath; // top-level avatar
      user.walkerInfo.avatar = avatarPath;
    }

    await user.save();

    res.status(200).json({
      walkerInfo: user.walkerInfo,
      name: user.name,
      avatar: user.avatar,
    });
  } catch (err) {
    console.error("❌ updateWalkerProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
