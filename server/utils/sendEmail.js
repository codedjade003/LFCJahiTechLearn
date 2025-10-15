import axios from "axios";

const sendEmail = async (to, subject, text) => {
  try {
    const res = await axios.post(
      "https://api.mailjet.com/v3.1/send",
      {
        Messages: [
          {
            From: {
              Email: process.env.EMAIL_FROM.replace(/^.*<|>.*$/g, ""),
              Name: "LFC Jahi Tech Learn",
            },
            To: [{ Email: to }],
            Subject: subject,
            TextPart: text,
          },
        ],
      },
      {
        auth: {
          username: process.env.MJ_APIKEY_PUBLIC,
          password: process.env.MJ_APIKEY_PRIVATE,
        },
      }
    );

    console.log("📧 Mailjet sent:", res.data);
  } catch (err) {
    console.error("🚨 Mailjet send failed:", err.response?.data || err.message);
  }
};

export default sendEmail;
