import axios from "axios";

const sendEmail = async (to, subject, text) => {
  try {
    const res = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "LFC Jahi Tech Learn", email: process.env.EMAIL_FROM },
        to: [{ email: to }],
        subject,
        textContent: text,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📧 Email sent:", res.data);
  } catch (err) {
    console.error("🚨 Email send failed:", err.response?.data || err.message);
  }
};

export default sendEmail;
