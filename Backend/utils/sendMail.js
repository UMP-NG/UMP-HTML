import brevo from "@getbrevo/brevo";

const sendMail = async (to, subject, content, type = "otp") => {
  try {
    const client = new brevo.TransactionalEmailsApi();
    client.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

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
        </div>`;
    }

    const sendSmtpEmail = {
      sender: { name: "UMP App", email: "umpofficial.noreply@gmail.com" },
      to: [{ email: to }],
      subject,
      htmlContent,
    };

    const result = await client.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Email sent successfully:", result.messageId);
    return result;
  } catch (err) {
    console.error("❌ Email send failed:", err);
    throw new Error("Email could not be sent");
  }
};

export default sendMail;
