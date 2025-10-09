import { useEffect, useRef, useState, type JSX } from "react";
import { FaBell, FaChevronDown, FaBars } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface TopNavProps {
  onMenuToggle: () => void;
}

export default function TopNav({ onMenuToggle }: TopNavProps): JSX.Element {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch notifications count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/notifications/my?read=false`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
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
      await fetch(`${API_BASE}/api/notifications/my/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Update local state
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
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

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200 relative"
          >
            <FaBell className="text-lg" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-lfc-red text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-xs font-medium px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-lfc-red text-white text-xs px-2 py-1 rounded-full">
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