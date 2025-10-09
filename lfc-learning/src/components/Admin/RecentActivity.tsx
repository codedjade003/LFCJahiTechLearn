import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { IconType } from "react-icons";
import { 
  FaUserPlus, 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaBook,
  FaArrowRight 
} from "react-icons/fa";

export interface ActivityItem {
  id: string;
  icon: string;
  iconBgClass?: string;
  iconColorClass?: string;
  title: string;
  detail?: string;
  time: string;
}

const iconMap: { [key: string]: IconType } = {
  'FaUserPlus': FaUserPlus,
  'FaCheckCircle': FaCheckCircle,
  'FaExclamationCircle': FaExclamationCircle,
  'FaBook': FaBook
};

export default function RecentActivity({ items: initialItems }: { items?: ActivityItem[] }) {
  const [items, setItems] = useState<ActivityItem[]>(initialItems || []);
  const [loading, setLoading] = useState(!initialItems);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const pageSize = 5;

  // Fetch recent logs from API if no items provided
  useEffect(() => {
    if (initialItems) return; // Use provided items if available
    
    const fetchRecentActivity = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/logs/recent?limit=${pageSize}`, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          // Transform API data to match ActivityItem format
          const transformedItems = data.logs?.map((log: any) => ({
            id: log._id,
            icon: mapLogTypeToIcon(log.type),
            iconBgClass: getIconBgClass(log.type),
            iconColorClass: getIconColorClass(log.type),
            title: log.action || log.message,
            detail: log.details,
            time: new Date(log.timestamp).toLocaleDateString()
          })) || [];
          setItems(transformedItems);
        }
      } catch (err) {
        console.error("Failed to fetch recent activity", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, [API_BASE, initialItems]);

  // Helper functions to map log types to icons and styles
  const mapLogTypeToIcon = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      'user_registration': 'FaUserPlus',
      'course_completion': 'FaCheckCircle',
      'system_alert': 'FaExclamationCircle',
      'course_created': 'FaBook'
    };
    return typeMap[type] || 'FaBook';
  };

  const getIconBgClass = (type: string): string => {
    const bgMap: { [key: string]: string } = {
      'user_registration': 'bg-blue-100',
      'course_completion': 'bg-green-100',
      'system_alert': 'bg-red-100',
      'course_created': 'bg-purple-100'
    };
    return bgMap[type] || 'bg-gray-100';
  };

  const getIconColorClass = (type: string): string => {
    const colorMap: { [key: string]: string } = {
      'user_registration': 'text-blue-600',
      'course_completion': 'text-green-600',
      'system_alert': 'text-red-600',
      'course_created': 'text-purple-600'
    };
    return colorMap[type] || 'text-gray-600';
  };

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentItems = useMemo(
    () => items.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize),
    [items, page]
  );

  const getIconComponent = (iconName: string): IconType => {
    return iconMap[iconName] || FaBook;
  };

  const handleViewAll = () => {
    navigate("/admin/dashboard/users", { 
    state: { 
      activeTab: "logs" 
    } 
  });
  };

  if (loading) {
    return (
      <div>
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-lfc-gray">Recent Activity</h2>
        </div>
        <div className="p-6 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full mr-4"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold text-lfc-gray">Recent Activity</h2>
        <button 
          onClick={handleViewAll}
          className="text-sm text-lfc-red hover:text-lfc-gold-dark flex items-center gap-1"
        >
          View All <FaArrowRight size={12} />
        </button>
      </div>

      <div className="p-6 space-y-3">
        {currentItems.length === 0 && (
          <div className="text-sm text-lfc-gray text-center py-4">
            No recent activity yet.
          </div>
        )}

        {currentItems.map((it) => {
          const IconComponent = getIconComponent(it.icon);
          return (
            <div key={it.id} className="flex items-start">
              <div className={`p-2 rounded-full mr-4 flex items-center justify-center ${it.iconBgClass ?? "bg-gray-100"}`}>
                <IconComponent className={it.iconColorClass ?? "text-lfc-red"} size={14} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{it.title}</p>
                {it.detail && (
                  <p className="text-sm text-lfc-gray truncate">{it.detail}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">{it.time}</p>
              </div>
            </div>
          );
        })}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-gray-100 text-sm text-lfc-gray disabled:opacity-50 hover:bg-gray-200"
            >
              Prev
            </button>
            <div className="text-sm text-lfc-gray">
              Page {page} of {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-gray-100 text-sm text-lfc-gray disabled:opacity-50 hover:bg-gray-200"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}