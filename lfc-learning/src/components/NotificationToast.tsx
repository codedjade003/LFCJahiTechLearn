import { FaTimes } from "react-icons/fa";

interface NotificationToastProps {
  notifications: Array<{
    _id: string;
    title: string;
    message?: string;
    createdAt: string;
  }>;
  onClose: (id: string) => void;
  onView: (notification: any) => void;
}

export default function NotificationToast({
  notifications,
  onClose,
  onView,
}: NotificationToastProps) {
  // Only show max 3 most recent
  const visibleNotifications = notifications.slice(0, 3);

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[90] space-y-3 max-w-md">
      {visibleNotifications.map((notification, index) => (
        <div
          key={notification._id}
          className="bg-white dark:bg-[var(--bg-elevated)] border-l-4 border-lfc-red shadow-lg rounded-lg overflow-hidden animate-slide-in"
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 bg-lfc-red/10 dark:bg-lfc-red/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📢</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-[var(--text-primary)] text-sm mb-1 line-clamp-2">
                    {notification.title}
                  </h4>
                  {notification.message && (
                    <p className="text-xs text-gray-600 dark:text-[var(--text-secondary)] line-clamp-2">
                      {notification.message}
                    </p>
                  )}
                  <button
                    onClick={() => onView(notification)}
                    className="text-xs text-lfc-red hover:text-lfc-red/80 font-medium mt-2 inline-block"
                  >
                    View Details →
                  </button>
                </div>
              </div>
              <button
                onClick={() => onClose(notification._id)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors flex-shrink-0"
              >
                <FaTimes size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
