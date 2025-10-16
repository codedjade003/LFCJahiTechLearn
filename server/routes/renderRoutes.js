import express from "express";
import { sendEmail } from "./sendEmail.js";

const router = express.Router();

// Example support endpoint
router.post("/support", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    await sendEmail(
      "hello@lfctechlearn.com", // receiver
      `Support Request from ${name}`,
      `
        <p><strong>From:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
      "support"
    );

    res.json({ success: true, message: "Support message sent successfully" });
  } catch (err) {
    console.error("🚨 Support email error:", err.message);
    res.status(500).json({ success: false, error: "Failed to send support email" });
  }
});

export default router;
