// src/components/Notification.tsx
import { useEffect } from "react";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";

interface NotificationProps {
  message: string;
  type: 'error' | 'success' | 'warning';
  onClose: () => void;
  duration?: number;
}

export default function Notification({ message, type, onClose, duration = 5000 }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 border rounded-lg shadow-lg p-4 max-w-sm ${getStyles()}`}>
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes size={14} />
        </button>
      </div>
    </div>
  );
}