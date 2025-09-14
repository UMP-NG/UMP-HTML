import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

console.log("[1] EMAIL_USER:", process.env.EMAIL_USER);
console.log(
  "[2] EMAIL_PASS:",
  process.env.EMAIL_PASS ? "✅ Loaded" : "❌ Missing"
);

(async () => {
  try {
    console.log("[3] Creating Gmail transporter (port 587, STARTTLS)...");

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587, // ✅ use STARTTLS port
      secure: false, // ✅ must be false for STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      logger: true,
      debug: true,
    });

    console.log("[4] Verifying connection...");
    await transporter.verify();
    console.log("✅ Gmail SMTP connection verified successfully!");

    console.log("[5] Sending test email...");
    const info = await transporter.sendMail({
      from: `"UMP Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // send to yourself for testing
      subject: "✅ SMTP Test Successful",
      text: "Your Gmail SMTP connection is working!",
    });

    console.log("📨 Test email sent:", info.messageId);
  } catch (error) {
    console.error("[❌] Gmail SMTP test failed:", error);
  }
})();
