import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendMail = async (options) => {
  if (!options.email) {
    throw new Error("Recipient email is required");
  }

  try {
    console.log("📨 Sending email using Gmail SMTP...");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let subject = options.subject || "UMP Notification";
    let htmlContent = "";
    let textContent = "";

    if (options.type === "otp") {
      subject = "Your UMP OTP Verification Code";

      textContent = `
UMP OTP Verification
Hello, use the OTP below to verify your email:
Your OTP is: ${options.otp}
This OTP is valid for 10 minutes.
- UMP Support
      `;

      htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f6f8;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 500px;
      margin: 30px auto;
      background: #fff;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.08);
    }
    h2 {
      color: #333;
      margin-bottom: 10px;
    }
    .otp {
      font-size: 24px;
      font-weight: bold;
      color: #007BFF;
      text-align: center;
      background: #eef5ff;
      padding: 10px;
      border-radius: 8px;
      margin: 20px 0;
    }
    p {
      color: #555;
      line-height: 1.6;
    }
    .footer {
      margin-top: 20px;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>UMP OTP Verification</h2>
    <p>Hello 👋,</p>
    <p>Use the OTP below to verify your email address:</p>
    <div class="otp">${options.otp}</div>
    <p>This OTP is valid for <b>10 minutes</b>.</p>
    <p>- UMP Support</p>
    <div class="footer">© ${new Date().getFullYear()} UMP. All rights reserved.</div>
  </div>
</body>
</html>`;
    } else if (options.type === "reset") {
      subject = "Reset Your UMP Password";

      textContent = `
UMP Password Reset
Hello, you requested a password reset.
Click the link below to reset your password:
${options.resetUrl}
This link will expire in 10 minutes.
- UMP Support
      `;

      htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f6f8;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 520px;
      margin: 30px auto;
      background: #fff;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.08);
    }
    h2 {
      color: #222;
      margin-bottom: 10px;
    }
    a.button {
      display: inline-block;
      background-color: #007BFF;
      color: #fff !important;
      text-decoration: none;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
    }
    p {
      color: #555;
      line-height: 1.6;
    }
    .footer {
      margin-top: 25px;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Password Reset Request</h2>
    <p>Hello 👋,</p>
    <p>You requested to reset your UMP account password.</p>
    <p>Click the button below to reset your password:</p>
    <p style="text-align:center;">
      <a class="button" href="${
        options.resetUrl
      }" target="_blank">Reset Password</a>
    </p>
    <p>This link will expire in <b>10 minutes</b>. If you didn’t request this, please ignore this email.</p>
    <p>- UMP Support</p>
    <div class="footer">© ${new Date().getFullYear()} UMP. All rights reserved.</div>
  </div>
</body>
</html>`;
    } else {
      subject = options.subject || "Message from UMP";
      htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; padding: 30px; background-color: #f4f4f4; }
    .content { background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <div class="content">
    <p>${options.message || "Hello from UMP!"}</p>
  </div>
</body>
</html>`;
    }

    const mailOptions = {
      from: `"UMP Support" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject,
      text: textContent,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};

export default sendMail;
