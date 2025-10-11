import axios from "axios";

const URL = process.env.SERVER_URL || "http://localhost:5000/health";

setInterval(async () => {
  try {
    await axios.get(URL);
    console.log("💓 Keep-alive ping successful");
  } catch (err) {
    console.log("⚠️ Keep-alive failed:", err.message);
  }
}, 1000 * 60 * 10); // every 10 minutes
