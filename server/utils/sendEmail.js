// utils/sendEmail.js
import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text) => {
  try {
    // Validate required env variables
    const { EMAIL_USER, EMAIL_PASS, EMAIL_FROM } = process.env;
    if (!EMAIL_USER || !EMAIL_PASS || !EMAIL_FROM) {
      console.error("❌ Missing email credentials in environment variables");
      throw new Error("Email service not configured properly.");
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    // Verify transporter
    await transporter.verify().catch((err) => {
      console.error("⚠️ SMTP verification failed:", err.message);
      throw new Error("Failed to connect to email service.");
    });

    const mailOptions = {
      from: EMAIL_FROM,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to ${to}: ${info.messageId}`);

    return info;
  } catch (error) {
    console.error("🚨 sendEmail() failed:", error.message);
    // Don’t rethrow here; just fail silently to prevent 502s
  }
};

export default sendEmail;
