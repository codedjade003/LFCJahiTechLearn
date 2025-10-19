// src/components/NotificationCard.tsx - ENHANCED
interface NotificationCardProps {
  icon: React.ReactNode;
  title: string;
  message?: string;
  time: string;
  highlight?: boolean;
  type?: string;
  isManual?: boolean;
}

const NotificationCard = ({ 
  icon, 
  title, 
  message, 
  time, 
  highlight = false, 
  isManual 
}: NotificationCardProps) => {
  return (
    <div className={`flex items-start p-3 rounded-lg border ${
      highlight ? 'bg-lfc-red/10 dark:bg-red-800/20 border-lfc-red/20 dark:border-[var(--lfc-red)]/30' : 'hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] border-gray-100 dark:border-[var(--border-primary)]'
    }`}>
      <div className="flex-shrink-0 pt-1">{icon}</div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-gray-800 dark:text-[var(--text-primary)]">{title}</p>
        {message && <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">{message}</p>}
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-500 dark:text-[var(--text-tertiary)]">{time}</p>
          {isManual && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
              Admin
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;