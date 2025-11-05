// src/components/Notifications.tsx - FIXED
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBookmark, FaVideo, FaUsers, FaBell, FaChevronDown, FaChevronUp } from "react-icons/fa";
import NotificationCard from "./NotificationCard";
import ManualNotificationModal from "../ManualNotificationModal";

interface Notification {
  _id: string;
  title: string;
  message?: string;
  type: string;
  link?: string;
  read: boolean;
  createdAt: string;
  manual?: boolean;
  createdBy?: {
    name: string;
  };
}

const Notifications = () => {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    read: 'all',
    source: 'all'
  });
  const [expanded, setExpanded] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [filters]);

  // Listen for notification updates from other components
  useEffect(() => {
    const handleNotificationUpdate = () => fetchNotifications();
    window.addEventListener("notificationUpdate", handleNotificationUpdate);
    return () => window.removeEventListener("notificationUpdate", handleNotificationUpdate);
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      const response = await fetch(`${API_BASE}/api/notifications/${notification._id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n._id === notification._id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        window.dispatchEvent(new CustomEvent("notificationUpdate"));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
    
    // If it's a manual notification, show modal instead of navigating
    if (notification.manual) {
      setSelectedNotification(notification);
      setShowModal(true);
    } else if (notification.link) {
      navigate(notification.link);
    }
  };

  const fetchNotifications = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.read !== 'all') params.append('read', filters.read);
      if (filters.source !== 'all') params.append('source', filters.source);
      params.append('limit', '20');

      const response = await fetch(`${API_BASE}/api/notifications/my?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const notificationsArray = data.notifications || data || [];
        setNotifications(notificationsArray);
        
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
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/notifications/my/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        fetchNotifications();
      } else {
        console.error('Failed to mark all as read:', response.status);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <FaBookmark className="text-lfc-red" />;
      case 'submission':
        return <FaVideo className="text-lfc-gold" />;
      case 'grade':
        return <FaUsers className="text-green-500" />;
      default:
        return <FaBell className="text-blue-500 dark:text-[var(--info)]" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Get notifications to display (3 when collapsed, all when expanded)
  const displayNotifications = expanded ? notifications : notifications.slice(0, 3);

  if (loading) {
    return (
      <div className="bg-white dark:bg-[var(--bg-elevated)] dark:bg-[var(--bg-elevated)] rounded-lg shadow dark:shadow-[var(--shadow-md)] border dark:border-[var(--border-primary)] p-6 mb-6">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-start p-3">
              <div className="w-6 h-6 bg-gray-200 dark:bg-[var(--bg-tertiary)] rounded-full mr-3"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-[var(--bg-tertiary)] rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-[var(--bg-tertiary)] rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[var(--bg-elevated)] dark:bg-[var(--bg-elevated)] rounded-lg shadow dark:shadow-[var(--shadow-md)] border dark:border-[var(--border-primary)] p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-primary)]">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-lfc-red dark:bg-red-800 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="text-sm border dark:border-[var(--border-primary)] rounded bg-white dark:bg-[var(--bg-elevated)] dark:bg-[var(--bg-tertiary)] text-gray-900 dark:text-[var(--text-primary)] px-2 py-1"
          >
            <option value="all">All Types</option>
            <option value="course">Courses</option>
            <option value="submission">Submissions</option>
            <option value="grade">Grades</option>
          </select>
          <button 
            onClick={markAllAsRead}
            className="text-sm text-lfc-red dark:text-red-400 hover:text-lfc-gold dark:hover:text-yellow-400"
          >
            Mark all read
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-[var(--text-tertiary)]">
            No notifications found
          </div>
        ) : (
          <>
            {displayNotifications.map((notification) => (
              <NotificationCard
                key={notification._id}
                icon={getNotificationIcon(notification.type)}
                title={notification.title}
                message={notification.message}
                time={formatTime(notification.createdAt)}
                highlight={!notification.read}
                type={notification.type}
                isManual={notification.manual}
                onClick={() => handleNotificationClick(notification)}
                link={notification.link}
              />
            ))}
            
            {/* Expand/Collapse button */}
            {notifications.length > 3 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full text-center py-2 text-sm text-lfc-red dark:text-red-400 hover:text-lfc-gold dark:hover:text-yellow-400 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {expanded ? (
                  <>
                    <FaChevronUp className="text-xs" />
                    Show Less
                  </>
                ) : (
                  <>
                    <FaChevronDown className="text-xs" />
                    Show All ({notifications.length - 3} more)
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
      
      {/* Manual Notification Modal */}
      <ManualNotificationModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedNotification(null);
        }}
        notification={selectedNotification}
      />
    </div>
  );
};

export default Notifications;