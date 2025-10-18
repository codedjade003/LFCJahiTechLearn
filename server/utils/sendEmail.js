import { Resend } from "resend";

import dotenv from "dotenv";
dotenv.config();


const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends an email using the correct domain address.
 *
 * @param {string} to - Recipient email
 * @param {string} subject - Subject line
 * @param {string} html - HTML content
 * @param {("welcome" | "verification" | "reset" | "support" | "default")} type - Email type
 */
const sendEmail = async (to, subject, html, type = "default") => {
  try {
    // Choose the correct sender address
    let from = "noreply@lfctechlearn.com"; // default for automated emails
    if (type === "support") {
      from = "hello@lfctechlearn.com"; // only for support-related emails
    }

    const response = await resend.emails.send({
      from: `LFC Tech Learn <${from}>`,
      to,
      subject,
      html,
    });

    console.log(`📧 Email (${type}) sent to ${to}:`, response?.id || response);
    return response;
  } catch (err) {
    console.error("🚨 Email send failed:", err?.response?.data || err.message || err);
    throw new Error("Failed to send email");
  }
};

export default sendEmail;