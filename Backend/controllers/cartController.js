import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// ✅ Get current user's cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || !cart.items.length) {
      return res.json({ items: [], message: "🛒 Your cart is empty" });
    }

    res.json({ items: cart.items });
  } catch (error) {
    console.error("❌ Error fetching cart:", error);
    res.status(500).json({ message: "Failed to load cart" });
  }
};

// ✅ Add product to cart with detailed logging
export const addToCart = async (req, res) => {
  try {
    console.log("🔹 /api/cart/add called");
    console.log("Request body:", req.body);
    console.log("Authenticated user:", req.user?._id);

    const { productId, quantity = 1 } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      console.warn("❌ Unauthorized attempt to add to cart");
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validate productId
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      console.warn("❌ Invalid product ID:", productId);
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Validate quantity
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      console.warn("❌ Invalid quantity:", quantity);
      return res
        .status(400)
        .json({ message: "Quantity must be a positive number" });
    }

    // Check product existence
    const product = await Product.findById(productId);
    if (!product) {
      console.warn("❌ Product not found:", productId);
      return res.status(404).json({ message: "Product not found" });
    }

    // Find or create user's cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      console.log("ℹ️ Creating new cart for user:", userId);
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if item already exists in cart
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += qty;
      console.log(
        `ℹ️ Increased quantity for product ${productId} to ${existingItem.quantity}`
      );
    } else {
      cart.items.push({
        product: productId,
        quantity: qty,
        price: product.price,
      });
      console.log(`ℹ️ Added product ${productId} to cart with quantity ${qty}`);
    }

    await cart.save();
    console.log("✅ Cart saved successfully for user:", userId);

    res.json({ message: "✅ Product added to cart", cart });
  } catch (error) {
    console.error("❌ Error adding to cart:", error);
    res.status(500).json({ message: "Failed to add to cart" });
  }
};

// ✅ Update item quantity
export const updateQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item)
      return res.status(404).json({ message: "Item not found in cart" });

    item.quantity = Math.max(1, quantity); // ✅ never below 1
    await cart.save();

    res.json({ message: "✅ Quantity updated", cart });
  } catch (error) {
    console.error("❌ Error updating quantity:", error);
    res.status(500).json({ message: "Failed to update quantity" });
  }
};

// ✅ Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params; // ✅ use params instead of body
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    await cart.save();

    res.json({ message: "🗑️ Item removed", cart });
  } catch (error) {
    console.error("❌ Error removing item:", error);
    res.status(500).json({ message: "Failed to remove item" });
  }
};

// ✅ Checkout and create order
export const checkoutCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "🛒 Cart is empty" });
    }

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.price,
    }));

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const newOrder = new Order({
      buyer: userId,
      seller: orderItems[0]?.product?.seller || null, // ✅ safe access
      items: orderItems,
      totalAmount,
      deliveryMethod: req.body.deliveryMethod || "pickup",
      deliveryFee: req.body.deliveryFee || 0,
      shippingAddress: req.body.shippingAddress || "",
    });

    await newOrder.save();
    await Cart.deleteOne({ user: userId }); // ✅ clear cart after order

    res.json({ message: "✅ Order created successfully", order: newOrder });
  } catch (error) {
    console.error("❌ Checkout failed:", error);
    res.status(500).json({ message: "Checkout failed" });
  }
};
