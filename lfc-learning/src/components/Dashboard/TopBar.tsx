// src/components/Topbar.tsx
import { useState, useEffect, useRef } from "react";
import { FaBars, FaBell, FaChevronDown, FaUserShield, FaUserCog, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar = ({ onMenuClick }: TopbarProps) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'admin-only';
  const isSuperAdmin = user?.email === 'codedjade003@gmail.com';

  // Close dropdowns if click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdminMode = () => {
    navigate("/admin/dashboard");
    setDropdownOpen(false);
  };

  return (
    <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 sticky top-0 z-30">
      {/* Left Section */}
      <div className="flex items-center flex-1">
        <button 
          onClick={onMenuClick}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
        >
          <FaBars className="text-lg md:hidden" />
        </button>
        
        {/* Logo for mobile */}
        <div className="md:hidden ml-3">
          <img 
            src="/logo.png" 
            alt="LFC Jahi Tech" 
            className="h-8 w-8 object-contain"
          />
        </div>
        
        <h1 className="ml-4 text-xl font-semibold text-gray-800 hidden md:block">
          Training Dashboard
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-3">

        {/* Notifications */}
        <div className="relative">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200 relative">
            <FaBell className="text-lg" />
            <span className="absolute top-0 right-0 bg-lfc-red text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
              3
            </span>
          </button>
        </div>

        {/* User Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <div className="relative">
              <img
                className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
                src={
                  user?.profilePicture?.url
                    ? user.profilePicture.url
                    : "/default-avatar.png"
                }
                alt="User profile"
              />
              {isAdmin && (
                <div className="absolute -bottom-1 -right-1 bg-lfc-gold rounded-full p-1">
                  {isSuperAdmin ? (
                    <FaUserCog className="text-xs text-white" />
                  ) : (
                    <FaUserShield className="text-xs text-white" />
                  )}
                </div>
              )}
            </div>
            <div className="hidden md:block text-left">
              <span className="text-sm font-medium text-gray-700 block">
                {user?.name || "Loading..."}
              </span>
              {isAdmin && (
                <span className={`text-xs font-medium ${
                  isSuperAdmin ? 'text-lfc-red' : 'text-lfc-gold'
                }`}>
                  {isSuperAdmin ? 'Super Admin' : 'Admin'}
                </span>
              )}
            </div>
            <FaChevronDown className={`hidden md:block text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
              {/* User Info Section */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate mb-1">{user?.email}</p>
                {isAdmin && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    isSuperAdmin 
                      ? 'bg-lfc-red/10 text-lfc-red' 
                      : 'bg-lfc-gold/10 text-lfc-gold'
                  }`}>
                    {isSuperAdmin ? (
                      <FaUserCog className="mr-1" />
                    ) : (
                      <FaUserShield className="mr-1" />
                    )}
                    {isSuperAdmin ? 'Super Admin' : 'Admin'}
                  </span>
                )}
              </div>

              {/* Admin Mode Switch (only for admins) */}
              {isAdmin && (
                <button
                  onClick={handleAdminMode}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center"
                >
                  <FaUserShield className="mr-3 text-lfc-gold" />
                  Switch to Admin Mode
                </button>
              )}

              {/* Regular Menu Items */}
              <button
                onClick={() => {
                  navigate("/dashboard/profile");
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center"
              >
                <FaUser className="mr-3 text-gray-400" />
                My Profile
              </button>

              <button
                onClick={() => {
                  logout();
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors duration-200 flex items-center"
              >
                <FaChevronDown className="mr-3 text-red-400 transform rotate-90" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;