import nodemailer from "nodemailer";

const sendMail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // or use SMTP settings
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
};

export default sendMail;
