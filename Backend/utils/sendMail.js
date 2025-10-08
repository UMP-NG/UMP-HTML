import net from "net";
import nodemailer from "nodemailer";

const checkSMTPConnection = (host, port, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(port, host);
    let timer = setTimeout(() => {
      socket.destroy();
      reject(new Error("SMTP connection timed out"));
    }, timeout);

    socket.on("connect", () => {
      clearTimeout(timer);
      socket.destroy();
      resolve(true);
    });

    socket.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
};

const sendMail = async (to, subject, content, type = "otp") => {
  try {
    console.log(`🔌 Checking SMTP connectivity...`);
    await checkSMTPConnection("smtp.gmail.com", 587);
    console.log(`✅ SMTP connection looks good, proceeding to send mail...`);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();

    // === Templates ===
    let htmlContent = "";

    if (type === "otp") {
      htmlContent = `
      <html><body>
        <div style="max-width:480px;margin:auto;font-family:Arial;border:1px solid #ddd;border-radius:8px;padding:20px;">
          <h2 style="text-align:center;color:#333;">Your OTP Code</h2>
          <p style="text-align:center;font-size:18px;color:#555;">Use the following code to verify your account:</p>
          <div style="text-align:center;font-size:28px;font-weight:bold;background:#f4f4f4;padding:12px;border-radius:6px;letter-spacing:4px;margin:10px 0;">
            ${content}
          </div>
          <p style="font-size:14px;text-align:center;color:#888;">This code will expire in 19 minutes.</p>
        </div>
      </body></html>`;
    } else if (type === "reset") {
      htmlContent = `
      <html><body>
        <div style="max-width:480px;margin:auto;font-family:Arial;border:1px solid #ddd;border-radius:8px;padding:20px;">
          <h2 style="text-align:center;color:#333;">Password Reset</h2>
          <p style="font-size:16px;text-align:center;color:#555;">
            Click the button below to reset your password:
          </p>
          <p style="text-align:center;margin:20px 0;">
            <a href="${content}" style="background:#007bff;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;">Reset Password</a>
          </p>
          <p style="font-size:14px;text-align:center;color:#888;">If you didn’t request this, you can ignore this email.</p>
        </div>
      </body></html>`;
    }

    const info = await transporter.sendMail({
      from: `"UMP App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text:
        type === "otp"
          ? `Your OTP code is: ${content}`
          : `Reset your password using this link: ${content}`,
      html: htmlContent,
    });

    console.log(`✅ Gmail email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error("❌ Mail send error details:", err);
    throw err;
  }
};

export default sendMail;
