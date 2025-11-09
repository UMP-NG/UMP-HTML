import axios from "axios";
import Payment from "../models/Payment.js";
import Order from "../models/Order.js";

// ✅ Step 1: Initialize payment (Paystack)
export const initializePayment = async (req, res) => {
  try {
    const { orderId, provider } = req.body;

    // 🔍 Validate order
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const amount = Math.round(order.totalAmount * 100); // convert to kobo
    let response;

    // 💳 Initialize with Paystack
    if (provider === "Paystack") {
      response = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          email: req.user.email,
          amount,
          reference: `UMP_${Date.now()}`,
          callback_url: `${process.env.CLIENT_URL}/Pages/payment-success.html`,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      return res.status(400).json({ message: "Unsupported payment provider" });
    }

    const { reference, authorization_url } = response.data.data;

    // 🧾 Save pending payment record
    await Payment.create({
      order: orderId,
      user: req.user._id,
      provider,
      amount: order.totalAmount,
      reference,
      status: "pending",
    });

    res.status(200).json({
      message: "Payment initialized successfully",
      authorization_url,
      reference,
    });
  } catch (error) {
    console.error(
      "💥 Payment initialization error:",
      error.response?.data || error
    );
    res.status(500).json({
      message: "Payment initialization failed",
      error: error.response?.data || error.message,
    });
  }
};

// ✅ Step 2: Verify payment after redirect
export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data.data;
    const payment = await Payment.findOne({ reference });

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    // Update payment record
    payment.status = data.status === "success" ? "success" : "failed";
    payment.paidAt = new Date();
    payment.metadata = data;
    await payment.save();

    // Update order
    if (data.status === "success") {
      await Order.findByIdAndUpdate(payment.order, {
        paymentStatus: "paid",
        status: "paid",
      });
    }

    res.json({
      message: "Payment verified",
      status: payment.status,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Payment verification failed" });
  }
};

export const confirmTransfer = async (req, res) => {
  try {
    // Save uploaded proof to /uploads
    // Mark payment as pending verification
    res.json({ success: true, message: "Proof uploaded successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to confirm payment" });
  }
};
