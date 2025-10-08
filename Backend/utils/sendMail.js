import nodemailer from "nodemailer";

const sendMail = async (to, subject, content, type = "otp") => {
  try {
    console.log("📡 Connecting to Brevo SMTP...");

    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false, // use STARTTLS
      auth: {
        user: process.env.EMAIL_USER, // e.g. 98d752001@smtp-brevo.com
        pass: process.env.EMAIL_PASS, // your xsmtpsib- key
      },
    });

    await transporter.verify();
    console.log("✅ Brevo SMTP connection verified successfully.");

    // === Email content ===
    let htmlContent = "";
    if (type === "otp") {
      htmlContent = `
        <div style="font-family:Arial;padding:20px;">
          <h2>Your OTP Code</h2>
          <p>Use this code to verify your account:</p>
          <div style="font-size:22px;font-weight:bold;background:#f4f4f4;padding:10px;border-radius:6px;text-align:center;">
            ${content}
          </div>
          <p style="font-size:14px;color:#888;">Expires in 19 minutes.</p>
        </div>`;
    } else if (type === "reset") {
      htmlContent = `
        <div style="font-family:Arial;padding:20px;">
          <h2>Password Reset</h2>
          <p>Click below to reset your password:</p>
          <a href="${content}" style="background:#007bff;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Reset Password</a>
          <p style="font-size:14px;color:#888;">If you didn’t request this, you can ignore this email.</p>
        </div>`;
    }

    const info = await transporter.sendMail({
      from: `"UMP App" <umpofficial.noreply@gmail.com>`, // can be your Brevo verified sender
      to,
      subject,
      html: htmlContent,
    });

    console.log(`✅ Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error("❌ Mail send error details:", err);
    throw new Error("Email could not be sent");
  }
};

export default sendMail;
