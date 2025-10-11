import { useEffect } from "react";
import { useNavigate, useRouteError, isRouteErrorResponse } from "react-router-dom";
import { FaHome, FaExclamationTriangle, FaTools } from "react-icons/fa";

export default function ErrorPage() {
  const navigate = useNavigate();
  const error = useRouteError();

  useEffect(() => {
    // Always redirect to home after 5 seconds
    const timer = setTimeout(() => navigate("/"), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  // Handle backend asleep or network failure
    const isServerDown =
    !error ||
    (typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as any).message === "string" &&
        (error as any).message.includes("NetworkError"));

  if (isServerDown) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <FaTools className="text-lfc-gold text-6xl mb-4 animate-spin" />
        <h1 className="text-3xl font-semibold mb-2">Waking Up the Server...</h1>
        <p className="text-gray-600 mb-6 max-w-sm">
          Our backend might be asleep or restarting.  
          Please wait a few moments while we reconnect.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-lfc-gold text-white px-6 py-3 rounded-lg hover:bg-lfc-gold-dark transition"
        >
          Refresh Now
        </button>
      </div>
    );
  }

  // Handle real route errors
  let status = 500;
  let message = "Oops! Something went wrong.";

  if (isRouteErrorResponse(error)) {
    status = error.status;
    message =
      status === 404
        ? "The page you're looking for doesn't exist or has been moved."
        : error.statusText || message;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <FaExclamationTriangle className="text-redCustom text-6xl mb-4" />
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        {status === 404 ? "404 - Page Not Found" : "500 - Server Error"}
      </h1>
      <p className="text-gray-600 mb-6 max-w-md">{message}</p>
      <button
        onClick={() => navigate("/")}
        className="bg-redCustom text-white px-6 py-3 rounded-lg hover:bg-goldCustom transition"
      >
        <FaHome className="inline mr-2" /> Go to Homepage
      </button>
    </div>
  );
}
