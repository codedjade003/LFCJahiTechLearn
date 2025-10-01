import { useEffect, useRef, useState, type JSX } from "react";
import { FaBell, FaEnvelope, FaChevronDown, FaBars } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface TopNavProps {
  onMenuToggle: () => void;
}

export default function TopNav({ onMenuToggle }: TopNavProps): JSX.Element {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // close dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="px-3 sm:px-4 py-3 flex items-center justify-between">
        {/* Left: Menu button and Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-md text-lfc-gray hover:bg-gray-100 lg:hidden"
          >
            <FaBars />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800">Admin Dashboard</h1>
        </div>

        {/* Right: icons + profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            aria-label="notifications"
            className="relative p-1 sm:p-2 rounded hover:bg-gray-100 transition"
          >
            <FaBell className="text-lfc-gray text-sm sm:text-base" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-lfc-red" />
          </button>

          <button
            aria-label="messages"
            className="relative p-1 sm:p-2 rounded hover:bg-gray-100 transition"
          >
            <FaEnvelope className="text-lfc-gray text-sm sm:text-base" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-lfc-red" />
          </button>

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-1 sm:gap-2 rounded p-1 hover:bg-gray-100 transition"
            >
              <img
                src={
                user?.profilePicture?.url
                  ? user.profilePicture.url
                  : "/default-avatar.png"
              }
                alt="profile"
                className="h-6 w-6 sm:h-8 sm:w-8 rounded-full object-cover"
              />
              <span className="text-xs sm:text-sm font-medium text-lfc-gray hidden lg:block">
                {user?.name ?? "Admin User"}
              </span>
              <FaChevronDown className="text-lfc-gray text-xs sm:text-sm" />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg overflow-hidden z-50">
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/dashboard/profile");
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-lfc-gray hover:bg-gray-50"
                >
                  My Profile
                </button>

                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-lfc-gray hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}