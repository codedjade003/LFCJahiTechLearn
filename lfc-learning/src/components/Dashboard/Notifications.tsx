// src/components/Notifications.tsx - FIXED
import { useState, useEffect } from "react";
import { FaBookmark, FaVideo, FaUsers, FaBell, FaChevronDown, FaChevronUp } from "react-icons/fa";
import NotificationCard from "./NotificationCard";

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

  useEffect(() => {
    fetchNotifications();
  }, [filters]);

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
        return <FaBell className="text-blue-500" />;
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
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-start p-3">
              <div className="w-6 h-6 bg-gray-200 rounded-full mr-3"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-lfc-red text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="all">All Types</option>
            <option value="course">Courses</option>
            <option value="submission">Submissions</option>
            <option value="grade">Grades</option>
          </select>
          <button 
            onClick={markAllAsRead}
            className="text-sm text-lfc-red hover:text-lfc-gold"
          >
            Mark all read
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
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
              />
            ))}
            
            {/* Expand/Collapse button */}
            {notifications.length > 3 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full text-center py-2 text-sm text-lfc-red hover:text-lfc-gold hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-2"
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
    </div>
  );
};

export default Notifications;