import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Seller from "../models/Seller.js";
import Cart from "../models/Cart.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===============================
// Create a new order
// ===============================
export const createOrder = async (req, res) => {
  try {
    const { items, deliveryMethod, deliveryFee, shippingAddress, notes } =
      req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Order must contain at least one item" });
    }

    let totalAmount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product)
        return res
          .status(404)
          .json({ message: `Product not found: ${item.product}` });
      totalAmount += product.price * item.quantity;
    }

    totalAmount += deliveryFee || 0;

    const order = await Order.create({
      buyer: req.user._id,
      seller: items[0]?.seller, // assuming one seller per order, adapt if multiple sellers
      items,
      totalAmount,
      deliveryMethod,
      deliveryFee,
      shippingAddress,
      notes,
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Allowed payment methods
const PAYMENT_METHODS = [
  "Paystack",
  "Flutterwave",
  "Stripe",
  "PayPal",
  "COD",
  "transfer",
];

export const checkoutCart = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Fetch cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Validate / normalize payment method
    let { paymentMethod, deliveryMethod, shippingAddress } = req.body;
    paymentMethod = paymentMethod?.toLowerCase().trim();

    const PAYMENT_MAP = {
      paystack: "Paystack",
      flutterwave: "Flutterwave",
      stripe: "Stripe",
      paypal: "PayPal",
      cod: "COD",
      transfer: "transfer",
    };
    paymentMethod = PAYMENT_MAP[paymentMethod] || "Paystack";

    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res
        .status(400)
        .json({ message: `Invalid payment method: ${paymentMethod}` });
    }

    // Prepare order items
    const items = cart.items.map((i) => ({
      product: i.product._id,
      quantity: i.quantity,
      price: i.product.price,
      variant: i.variant || {},
    }));

    // Find seller — assuming all items are from one seller for now
    const sellerId = cart.items[0].product.seller;
    if (!sellerId)
      return res.status(400).json({ message: "Cannot determine seller" });

    // Calculate totals
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryFee = Number(req.body.deliveryFee || 0);
    const totalAmount = subtotal + deliveryFee;

    // Create order
    const order = new Order({
      buyer: userId,
      seller: sellerId,
      items,
      subtotal,
      totalAmount,
      deliveryFee,
      deliveryMethod: deliveryMethod || "pickup",
      shippingAddress: shippingAddress || {},
      paymentMethod,
      status: "pending",
    });

    await order.save();

    // Optionally: clear cart
    cart.items = [];
    await cart.save();

    return res.status(201).json({ success: true, order });
  } catch (err) {
    console.error("❌ Checkout error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ======================================================
// BUYER: Get my orders
// ======================================================
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================================================
// SELLER: Get all orders containing their products
// Supports: ?status=&search=&sort=&limit=
// ======================================================
export const getSellerOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    // find product ids for seller
    const products = await Product.find({ seller: userId })
      .select("_id")
      .lean();
    const productIds = products.map((p) => p._id);

    if (productIds.length === 0)
      return res.json({ orders: [], message: "No products found for seller" });

    const filter = { "items.product": { $in: productIds } };

    // filter by status
    if (req.query.status) filter.status = req.query.status;

    // search by order ID
    if (req.query.search) {
      const q = req.query.search;
      if (/^[0-9a-fA-F]{24}$/.test(q)) filter._id = q;
    }

    // base query
    let query = Order.find(filter)
      .populate("buyer", "name email")
      .sort({ createdAt: -1 });

    // sorting
    if (req.query.sort === "value-asc") query = query.sort({ totalAmount: 1 });
    if (req.query.sort === "value-desc")
      query = query.sort({ totalAmount: -1 });

    const orders = await query.limit(parseInt(req.query.limit || 50)).lean();

    res.json({ orders });
  } catch (err) {
    console.error("getSellerOrders error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ======================================================
// UNIVERSAL: Get single order by ID (buyer or seller)
// ======================================================
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("buyer", "name email")
      .populate("items.product", "name price images seller")
      .lean();

    if (!order) return res.status(404).json({ message: "Order not found" });

    const userId = req.user._id.toString();

    // check if buyer or seller has access
    const isBuyer = order.buyer._id.toString() === userId;
    const isSeller = order.items.some(
      (i) => i.product?.seller?.toString() === userId
    );

    if (!isBuyer && !isSeller)
      return res
        .status(403)
        .json({ message: "Not authorized to view this order" });

    res.json({ success: true, order });
  } catch (err) {
    console.error("getOrderById error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ======================================================
// SELLER: Update order status or add tracking number
// Also handles: paid → stock reduction, sold count increment
// ======================================================
export const updateOrderStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.params;
    const { status, trackingNumber } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // ensure seller owns at least one product
    const products = await Product.find({
      _id: { $in: order.items.map((i) => i.product) },
    }).select("seller");
    const owns = products.some((p) => String(p.seller) === String(userId));
    if (!owns)
      return res
        .status(403)
        .json({ message: "Not authorized to update this order" });

    if (status) order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    // When marked as paid: update product & seller stats
    if (status === "paid" && order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";

      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (!product) continue;

        // decrease stock
        product.stock = Math.max(0, (product.stock || 0) - item.quantity);
        product.purchases = (product.purchases || 0) + item.quantity;

        await product.save();
      }

      // increment seller's sold count
      const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0);
      await Seller.findOneAndUpdate(
        { user: userId },
        { $inc: { sold: totalQty } }
      );
    }

    await order.save();

    res.json({ message: "Order updated", order });
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// Update order (admin/seller only)
// ===============================
export const updateOrder = async (req, res) => {
  try {
    const { status, paymentStatus, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// Delete order (buyer/admin)
// ===============================
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params; // keep using :id if your route uses /orders/:id
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Prevent direct deletion of paid orders
    if (order.paymentStatus === "paid") {
      return res
        .status(400)
        .json({ message: "Paid orders require refund process" });
    }

    // Mark as canceled instead of deleting
    order.status = "canceled";
    await order.save();

    res.json({
      success: true,
      message: "Order canceled successfully",
      order,
    });
  } catch (error) {
    console.error("Error canceling order:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🧾 Generate Invoice PDF
export const downloadInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("user");

    if (!order) return res.status(404).json({ message: "Order not found" });

    const pdfPath = await generateInvoicePDF(order);
    res.download(pdfPath);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate invoice" });
  }
};

export const markOrderAsPaid = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("items.product");

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.paymentStatus = "paid";
    order.status = "processing";
    await order.save();

    // ✅ Update seller and product analytics
    for (const item of order.items) {
      const product = await Product.findById(item.product._id);
      if (product) {
        product.purchases += item.quantity;
        await product.save();

        // Update seller total sales
        const seller = await Seller.findOne({ user: product.seller });
        if (seller) {
          seller.totalSalesValue += item.price * item.quantity;
          seller.sold += item.quantity;
          await seller.save();
        }
      }
    }

    res.json({ message: "Order marked as paid and analytics updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add this in orderController.js
export const getIncomingOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const products = await Product.find({ seller: userId }).select("_id");
    const productIds = products.map((p) => p._id);

    if (!productIds.length)
      return res.json({
        success: true,
        orders: [],
        message: "No incoming orders",
      });

    const orders = await Order.find({
      "items.product": { $in: productIds },
      status: { $ne: "canceled" },
    })
      .populate("buyer", "name email")
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    console.error("getIncomingOrders error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const generateInvoicePDF = async (order) => {
  const pdfPath = path.join(__dirname, `../invoices/invoice-${order._id}.pdf`);
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(pdfPath));

  doc.fontSize(20).text("Invoice", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Order ID: ${order._id}`);
  doc.text(`Buyer: ${order.buyer?.name || "Unknown"}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
  doc.moveDown();

  doc.text("Items:", { underline: true });
  order.items.forEach((item) => {
    doc.text(
      `${item.product?.name || "Product"} - Qty: ${item.quantity} - ₦${
        item.price
      }`
    );
  });

  doc.moveDown();
  doc.text(`Total: ₦${order.totalAmount}`, { bold: true });
  doc.end();

  return pdfPath;
};

// PUT /api/orders/:orderId/confirm-delivery
export const confirmDelivery = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.paymentStatus !== "paid")
      return res.status(400).json({ message: "Payment not yet confirmed" });

    order.status = "completed";
    order.paymentStatus = "released";
    await order.save();

    // Optionally trigger seller payout
    res.json({ message: "✅ Delivery confirmed, funds released to seller" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to confirm delivery" });
  }
};

export const confirmTransfer = async (req, res) => {
  try {
    const { orderInfo } = req.body;
    if (!orderInfo) {
      return res
        .status(400)
        .json({ success: false, message: "Missing order details" });
    }

    // Parse order data from FormData
    const info = JSON.parse(orderInfo);
    const {
      fullName,
      email,
      location,
      phone,
      notes,
      items,
      deliveryFee,
      deliveryMethod,
      shippingAddress,
    } = info;

    if (!items?.length) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // ✅ Handle file upload
    let paymentProofPath = null;
    if (req.file) {
      const uploadDir = path.join("uploads", "paymentProofs");
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });

      const newPath = path.join(
        uploadDir,
        req.file.filename + path.extname(req.file.originalname)
      );
      fs.renameSync(req.file.path, newPath);
      paymentProofPath = newPath;
    }

    // ✅ Group items by seller
    const itemsBySeller = items.reduce((acc, item) => {
      if (!item.seller) return acc;
      if (!acc[item.seller]) acc[item.seller] = [];
      acc[item.seller].push(item);
      return acc;
    }, {});

    const createdOrders = [];

    // ✅ Create an order per seller
    for (const [sellerId, sellerItems] of Object.entries(itemsBySeller)) {
      const subtotal = sellerItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const totalAmount = subtotal + (deliveryFee || 0);

      const order = new Order({
        buyer: req.user._id,
        seller: sellerId,
        items: sellerItems,
        subtotal,
        totalAmount,
        deliveryFee,
        deliveryMethod,
        shippingAddress,
        notes,
        paymentMethod: "transfer",
        paymentStatus: "pending",
        status: "pending-verification",
        paymentInfo: {
          reference: `TRANSFER-${Date.now()}`,
          transactionId: null,
          paidAt: null,
        },
        paymentProof: paymentProofPath,
      });

      await order.save();
      createdOrders.push(order._id);
    }

    console.log("✅ Bank transfer orders saved:", createdOrders);

    return res.status(201).json({
      success: true,
      message: "Transfer recorded. Awaiting admin verification.",
      orderIds: createdOrders,
      proof: paymentProofPath,
    });
  } catch (err) {
    console.error("❌ Transfer confirmation failed:", err);
    res.status(500).json({
      success: false,
      message: "Failed to confirm transfer",
      error: err.message,
    });
  }
};

export const getEscrowDetails = async (req, res) => {
  try {
    const escrowDetails = {
      bankName: process.env.ESCROW_BANK_NAME || "Example Bank",
      accountNumber: process.env.ESCROW_ACCOUNT_NUMBER || "1234567890",
      accountName: process.env.ESCROW_ACCOUNT_NAME || "UMP Escrow Services",
    };

    res.json({ success: true, data: escrowDetails });
  } catch (err) {
    console.error("❌ Failed to load escrow details:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch escrow info" });
  }
};
