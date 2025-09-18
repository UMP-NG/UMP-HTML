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

const sendMail = async (to, subject, otp) => {
  try {
    console.log(`🔌 Checking SMTP connectivity...`);
    await checkSMTPConnection("smtp.gmail.com", 587);
    console.log(`✅ SMTP connection looks good, proceeding to send mail...`);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();

    // Your tested OTP email design
    // const htmlContent = `
    //   <h2>Your OTP Code</h2>
    //     <p>Use the following code to verify your account:</p>
    //     <h4>
    //       ${otp}
    //     </h4>
    //     <p>
    //       This code will expire in 10 minutes. If you didn't request this, you can ignore this email.
    //     </p>
    //   </div>
    // `;

    const info = await transporter.sendMail({
      from: `"UMP App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: `Your OTP code is: ${otp}`,
      html: none,
    });

    console.log(`✅ Gmail email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error("❌ Mail send error:", err.message);
    throw new Error("Email could not be sent");
  }
};

export default sendMail;
