// src/components/Topbar.tsx
import { useState, useEffect, useRef } from "react";
import { FaBars, FaBell, FaChevronDown, FaUserShield, FaUserCog, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../ThemeToggle";

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar = ({ onMenuClick }: TopbarProps) => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const navigate = useNavigate();

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'admin-only';
  const isSuperAdmin = user?.email === 'codedjade003@gmail.com';

  // Fetch notifications count
  useEffect(() => {
  const fetchNotificationCount = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/notifications/my?limit=5`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Handle both direct array and nested response
        const notificationsArray = data.notifications || data || [];
        setNotifications(notificationsArray);
        
        // Calculate unread count from the data
        const unread = notificationsArray.filter((n: { read: any; }) => !n.read).length;
        setUnreadCount(unread);
      } else {
        console.error('Failed to fetch notifications:', response.status);
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

    fetchNotificationCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);
    
  // Mark as read function
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        console.error('Failed to mark as read:', response.status);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Format time function
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

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
    <div className="flex items-center justify-between h-16 px-4 bg-white dark:bg-[var(--bg-elevated)] border-b border-gray-200 dark:border-[var(--border-primary)] sticky top-0 z-30">
      {/* Left Section */}
      <div className="flex items-center flex-1">
        <button 
          onClick={onMenuClick}
          className="p-2 text-gray-600 dark:text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] rounded-full transition-colors duration-200"
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
        
        <h1 className="ml-4 text-xl font-semibold text-gray-800 dark:text-[var(--text-primary)] hidden md:block">
          Training Dashboard
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-3">

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-gray-600 dark:text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] rounded-full transition-colors duration-200 relative"
          >
            <FaBell className="text-lg" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-lfc-red dark:bg-[var(--lfc-red)] text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-xs font-medium px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-primary)]">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-lfc-red dark:bg-[var(--lfc-red)] text-white text-xs px-2 py-1 rounded-full">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
              </div>

              <div className="p-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No new notifications
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                        notification.read 
                          ? 'bg-gray-50 hover:bg-gray-100' 
                          : 'bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-500'
                      }`}
                      onClick={() => markAsRead(notification._id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            notification.read ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </p>
                          {notification.message && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))
                )}
                
                {notifications.length > 5 && (
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      // Navigate to full notifications page - you can add this route
                      // navigate('/dashboard/notifications');
                    }}
                    className="w-full text-center py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    View all notifications
                  </button>
                )}
              </div>
            </div>
          )}
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