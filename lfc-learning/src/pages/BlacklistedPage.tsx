// src/pages/BlacklistedPage.tsx
import { useLocation, Link } from "react-router-dom";
import { FaBan, FaHome } from "react-icons/fa";

export default function BlacklistedPage() {
  const location = useLocation();
  const reason = location.state?.reason || "Your account has been restricted.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <FaBan className="text-4xl text-red-600 dark:text-red-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Access Restricted
        </h1>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800 dark:text-red-200">
            <strong>Reason:</strong> {reason}
          </p>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your account has been restricted from accessing this platform. If you believe this is an
          error, please contact support.
        </p>

        <div className="space-y-3">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-lfc-red text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FaHome />
            Return to Home
          </Link>

          <Link
            to="/contact"
            className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Contact Support
          </Link>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-500 mt-6">
          This restriction was applied to protect the platform and its users.
        </p>
      </div>
    </div>
  );
}
