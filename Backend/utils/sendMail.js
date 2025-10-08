import SibApiV3Sdk from "sib-api-v3-sdk";

const sendMail = async (to, subject, content, type = "otp") => {
  try {
    console.log("📡 Sending email via Brevo API...");

    // Configure Brevo API
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.EMAIL_PASS; // your Brevo API key

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    // === Email template ===
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

    // === Send ===
    const sendSmtpEmail = {
      sender: { name: "UMP App", email: "umpofficial.noreply@gmail.com" },
      to: [{ email: to }],
      subject,
      htmlContent,
    };

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email sent successfully to ${to}. Message ID: ${data.messageId}`);
    return data;
  } catch (err) {
    console.error("❌ Mail send error:", err.message);
    throw new Error("Email could not be sent");
  }
};

export default sendMail;
