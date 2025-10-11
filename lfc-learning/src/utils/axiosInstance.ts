import axios from "axios";
import { toast } from "react-hot-toast";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
  timeout: 10000, // 10s timeout for hung backend
});

// Intercept failed requests
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (!error.response) {
      // Network/timeout/backend asleep
      toast.error("Server might be waking up... please wait.");
      window.location.href = "/error";
    } else if (status === 404 || status === 500) {
      toast.error("Something went wrong. Redirecting...");
      window.location.href = "/error";
    }

    return Promise.reject(error);
  }
);

export default API;
