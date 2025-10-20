// src/components/TopNav.tsx - FIXED NOTIFICATIONS FETCHING
import { useEffect, useRef, useState, type JSX } from "react";
import { FaBell, FaChevronDown, FaBars, FaUserShield, FaUserCog, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useModal } from "../../context/ModalContext";
import ThemeToggle from "../ThemeToggle";

interface TopNavProps {
  onMenuToggle: () => void;
}

export default function TopNav({ onMenuToggle }: TopNavProps): JSX.Element {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const { user, logout } = useAuth();
  const { isModalOpen } = useModal();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'admin-only';
  const isSuperAdmin = user?.email === 'codedjade003@gmail.com';

  // Fetch notifications count - IMPROVED with better error handling
  const fetchNotifications = async () => {
    if (notificationsLoading) return;
    
    setNotificationsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      console.log('🔔 Fetching notifications...');
      
      const response = await fetch(`${API_BASE}/api/notifications/my?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔔 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔔 Notifications data:', data);
        
        // Handle different response formats
        let notificationsArray = [];
        
        if (Array.isArray(data)) {
          notificationsArray = data;
        } else if (data.notifications && Array.isArray(data.notifications)) {
          notificationsArray = data.notifications;
        } else if (data.data && Array.isArray(data.data)) {
          notificationsArray = data.data;
        } else {
          console.warn('🔔 Unexpected notifications response format:', data);
          notificationsArray = [];
        }
        
        setNotifications(notificationsArray);
        
        // Calculate unread count
        const unread = notificationsArray.filter((n: any) => !n.read).length;
        setUnreadCount(unread);
        console.log(`🔔 Loaded ${notificationsArray.length} notifications, ${unread} unread`);
        
      } else {
        console.error('🔔 Failed to fetch notifications:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('🔔 Error response:', errorText);
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('🔔 Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Mark as read function - IMPROVED
  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Update local state immediately for better UX
        setNotifications(prev => 
          prev.map((n: any) => n._id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        console.log('🔔 Marked notification as read:', notificationId);
      } else {
        console.error('🔔 Failed to mark as read:', response.status);
        // Try to refetch notifications if marking as read fails
        fetchNotifications();
      }
    } catch (error) {
      console.error('🔔 Error marking notification as read:', error);
    }
  };

  // Mark all as read function
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Update all notifications to read
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        console.log('🔔 Marked all notifications as read');
      } else {
        console.error('🔔 Failed to mark all as read:', response.status);
      }
    } catch (error) {
      console.error('🔔 Error marking all notifications as read:', error);
    }
  };

  // Format time function
  const formatTime = (dateString: string) => {
    if (!dateString) return 'Just now';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch (error) {
      return 'Recently';
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
      
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={`sticky top-0 ${isModalOpen ? 'z-0' : 'z-40'} bg-white dark:bg-[var(--bg-elevated)] border-b border-gray-200 dark:border-[var(--border-primary)] dark:border-[var(--border-primary)]`}>
      <div className="px-3 sm:px-4 py-3 flex items-center justify-between">
        {/* Left: Menu button and Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-md text-lfc-gray hover:bg-gray-100 dark:bg-[var(--bg-tertiary)] lg:hidden"
          >
            <FaBars />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-[var(--text-primary)] dark:text-[var(--text-primary)]">Admin Dashboard</h1>
        </div>

        {/* Right: icons + profile */}
        <div className="flex items-center gap-2 sm:gap-4">

          {/* Notifications - IMPROVED */}
          {/* Theme Toggle */}
          <ThemeToggle />

          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) {
                  fetchNotifications(); // Refresh when opening
                }
              }}
              disabled={notificationsLoading}
              className="p-2 text-gray-600 dark:text-[var(--text-secondary)] dark:text-[var(--text-secondary)] hover:bg-gray-100 dark:bg-[var(--bg-tertiary)] dark:hover:bg-[var(--hover-bg)] rounded-full transition-colors duration-200 relative disabled:opacity-50"
            >
              <FaBell className="text-lg" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-lfc-red dark:bg-red-800 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-xs font-medium px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              {notificationsLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-lfc-red rounded-full animate-spin"></div>
                </div>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[var(--bg-elevated)] border border-gray-200 dark:border-[var(--border-primary)] rounded-lg shadow-lg z-45 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-200 dark:border-[var(--border-primary)]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-primary)] dark:text-[var(--text-primary)]">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Mark all read
                        </button>
                      )}
                      <span className="bg-lfc-red dark:bg-red-800 text-white text-xs px-2 py-1 rounded-full">
                        {unreadCount} unread
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  {notificationsLoading ? (
                    <div className="text-center py-4">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-lfc-red rounded-full animate-spin mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No notifications yet
                    </div>
                  ) : (
                    <>
                      {notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification._id}
                          className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                            notification.read 
                              ? 'bg-gray-50 dark:bg-[var(--bg-secondary)] hover:bg-gray-100 dark:bg-[var(--bg-tertiary)]' 
                              : 'bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-500'
                          }`}
                          onClick={() => markAsRead(notification._id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${
                                notification.read ? 'text-gray-700 dark:text-[var(--text-secondary)]' : 'text-gray-900 dark:text-[var(--text-primary)]'
                              }`}>
                                {notification.title || 'Notification'}
                              </p>
                              {notification.message && (
                                <p className="text-xs text-gray-600 dark:text-[var(--text-secondary)] mt-1 line-clamp-2">
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
                      ))}
                      
                      {notifications.length > 5 && (
                        <button
                          onClick={() => {
                            setShowNotifications(false);
                            // Navigate to full notifications page
                            // navigate('/dashboard/notifications');
                          }}
                          className="w-full text-center py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          View all notifications
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center space-x-2 p-1 hover:bg-gray-100 dark:hover:bg-[var(--bg-secondary)] dark:bg-[var(--bg-tertiary)] rounded-full transition-colors duration-200"
            >
              <div className="relative">
                <img
                  className="h-8 w-8 rounded-full object-cover border-2 border-gray-200 dark:border-[var(--border-primary)]"
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
                <span className="text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] block">
                  {user?.name || "Loading..."}
                </span>
                {isAdmin && (
                  <span className={`text-xs font-medium ${
                    isSuperAdmin ? 'text-lfc-red dark:text-red-700' : 'text-lfc-gold'
                  }`}>
                    {isSuperAdmin ? 'Super Admin' : 'Admin'}
                  </span>
                )}
              </div>
              <FaChevronDown className={`hidden md:block text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[var(--bg-elevated)] border border-gray-200 dark:border-[var(--border-primary)] rounded-lg shadow-xl z-45 py-1">
                {/* User Info Section */}
                <div className="px-4 py-3 border-b border-gray-100 dark:border-[var(--border-primary)]">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-1">{user?.email}</p>
                  {isAdmin && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      isSuperAdmin 
                        ? 'bg-lfc-red/10 text-lfc-red dark:bg-red-900/30 dark:text-red-400' 
                        : 'bg-lfc-gold/10 text-lfc-gold dark:bg-yellow-900/30 dark:text-yellow-400'
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

                {/* Regular Menu Items */}
                <button
                  onClick={() => {
                    navigate("/dashboard/profile");
                    setOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[var(--bg-secondary)] transition-colors duration-200 flex items-center"
                >
                  <FaUser className="mr-3 text-gray-400" />
                  My Profile
                </button>

                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                    navigate("/");
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 flex items-center border-t border-gray-200 dark:border-[var(--border-primary)]"
                >
                  <FaChevronDown className="mr-3 text-red-400 transform rotate-90" />
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