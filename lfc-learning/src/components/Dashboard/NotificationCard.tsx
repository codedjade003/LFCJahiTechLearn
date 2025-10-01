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
  type,
  isManual 
}: NotificationCardProps) => {
  return (
    <div className={`flex items-start p-3 rounded-lg border ${
      highlight ? 'bg-lfc-red/10 border-lfc-red/20' : 'hover:bg-gray-50 border-gray-100'
    }`}>
      <div className="flex-shrink-0 pt-1">{icon}</div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-gray-800">{title}</p>
        {message && <p className="text-sm text-gray-600 mt-1">{message}</p>}
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-500">{time}</p>
          {isManual && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Admin
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;