// utils/sendEmail.js
import { Resend } from "resend";

// Initialize Resend client using your API key from .env
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends an email using the Resend API
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Email body (plain text)
 */
const sendEmail = async (to, subject, text) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ Missing RESEND_API_KEY in environment variables");
      throw new Error("Email service not configured properly.");
    }

    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
    });

    console.log(`📧 Email sent successfully to ${to}:`, response.id || response);
    return response;
  } catch (error) {
    console.error("🚨 sendEmail() failed:", error.message);
    // Don’t rethrow — avoid crashing your API
  }
};

export default sendEmail;
