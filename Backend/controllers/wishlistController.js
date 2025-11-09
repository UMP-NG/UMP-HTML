import Wishlist from "../models/Wishlist.js";

export const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user._id; // ✅ assuming you're using auth middleware
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne({ user: userId });

    // Create wishlist if it doesn't exist
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, items: [productId] });
      return res
        .status(200)
        .json({ message: "Added to wishlist", inWishlist: true });
    }

    // If product is already there, remove it
    if (wishlist.items.includes(productId)) {
      wishlist.items.pull(productId);
      await wishlist.save();
      return res
        .status(200)
        .json({ message: "Removed from wishlist", inWishlist: false });
    }

    // Otherwise, add it
    wishlist.items.push(productId);
    await wishlist.save();

    res.status(200).json({ message: "Added to wishlist", inWishlist: true });
  } catch (err) {
    console.error("❌ Wishlist error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
