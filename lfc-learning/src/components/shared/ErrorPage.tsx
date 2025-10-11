import { useEffect, useState } from "react";
import { useNavigate, useRouteError } from "react-router-dom";
import { FaHome, FaArrowLeft, FaExclamationTriangle, FaTools } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function ErrorPage() {
  const navigate = useNavigate();
  const error = useRouteError() as { status?: number; message?: string };
  const [isSleeping, setIsSleeping] = useState(false);

  useEffect(() => {
    // detect backend-sleep-like behavior
    if (!error?.status || error?.message?.includes("NetworkError")) {
      setIsSleeping(true);
    }

    const timer = setTimeout(() => navigate("/"), 5000);
    return () => clearTimeout(timer);
  }, [error, navigate]);

  if (isSleeping) {
    return (
      <div className="min-h-screen bg-yt-light-gray flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-lfc-gold bg-opacity-10 flex items-center justify-center">
          <FaTools className="w-10 h-10 text-lfc-gold animate-spin" />
        </div>
        <h1 className="text-2xl font-bold text-yt-text-dark mb-2">
          Waking up the Server...
        </h1>
        <p className="text-yt-text-gray mb-6 max-w-md">
          Our backend may be asleep right now. It usually takes 30–60 seconds to wake up.  
          Please be patient — the page will refresh automatically.
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

  const status = error?.status || 500;
  const is404 = status === 404;

  return (
    <div className="min-h-screen bg-yt-light-gray flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-yt-light-border p-8 text-center shadow-sm">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-lfc-gold bg-opacity-10 flex items-center justify-center">
          <FaExclamationTriangle className="w-10 h-10 text-lfc-gold" />
        </div>

        <h1 className="text-2xl font-bold text-yt-text-dark mb-4">
          {is404 ? "Page Not Found" : "Something Went Wrong"}
        </h1>

        <p className="text-yt-text-gray mb-8 leading-relaxed">
          {is404
            ? "The page you're looking for doesn't exist or has been moved."
            : "Oops! The server ran into a problem. You’ll be redirected shortly."}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-yt-light-border rounded-lg text-yt-text-dark hover:bg-yt-light-hover transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-lfc-gold text-white rounded-lg hover:bg-lfc-gold-dark transition-colors"
          >
            <FaHome className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
