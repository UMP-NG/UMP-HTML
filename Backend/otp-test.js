// otp-test.js
import dotenv from "dotenv";
import sendMail from "./utils/sendMail.js";

dotenv.config();

const testEmail = "240401509@live.unilag.edu.ng"; // 🔄 Replace with your real email
const otp = Math.floor(1000 + Math.random() * 9000); // 4-digit OTP

(async () => {
  try {
    console.log(`🔄 Sending OTP ${otp} to ${testEmail}...`);
    await sendMail(testEmail, "Your OTP Code", `Your OTP is: ${otp}`);
    console.log("✅ Test email sent successfully!");
  } catch (err) {
    console.error("❌ Failed to send test email:", err);
  }
})();
