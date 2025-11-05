import { FaTimes } from "react-icons/fa";

interface ManualNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: {
    title: string;
    message?: string;
    createdAt: string;
  } | null;
}

export default function ManualNotificationModal({
  isOpen,
  onClose,
  notification,
}: ManualNotificationModalProps) {
  if (!isOpen || !notification) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[var(--bg-elevated)] border-b border-gray-200 dark:border-[var(--border-primary)] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lfc-red/10 dark:bg-lfc-red/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">📢</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
              Notice
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-[var(--text-primary)] mb-4">
            {notification.title}
          </h3>
          
          {notification.message && (
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                {notification.message}
              </p>
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-[var(--border-primary)]">
            <p className="text-sm text-gray-500 dark:text-[var(--text-tertiary)]">
              Posted on {new Date(notification.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-[var(--bg-primary)] border-t border-gray-200 dark:border-[var(--border-primary)] px-6 py-4 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-lfc-red text-white rounded-lg hover:bg-lfc-red/90 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
