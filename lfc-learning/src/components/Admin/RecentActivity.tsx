// src/components/Admin/RecentActivity.tsx
import { useMemo, useState } from "react";
import type { IconType } from "react-icons";
import { FaUserPlus, FaCheckCircle, FaExclamationCircle, FaBook } from "react-icons/fa";

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

export default function RecentActivity({ items }: { items: ActivityItem[] }) {
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentItems = useMemo(
    () => items.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize),
    [items, page]
  );

  const getIconComponent = (iconName: string): IconType => {
    return iconMap[iconName] || FaBook;
  };

  return (
    <div>
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-lfc-gray">Recent Activity</h2>
      </div>

      <div className="p-6 space-y-3">
        {currentItems.length === 0 && (
          <div className="text-sm text-lfc-gray">No recent activity yet.</div>
        )}

        {currentItems.map((it) => {
          const IconComponent = getIconComponent(it.icon);
          return (
            <div key={it.id} className="flex items-start">
              <div className={`p-2 rounded-full mr-4 flex items-center justify-center ${it.iconBgClass ?? "bg-gray-100"}`}>
                <IconComponent className={it.iconColorClass ?? "text-lfc-red"} />
              </div>

              <div>
                <p className="font-medium text-sm">{it.title}</p>
                {it.detail && <p className="text-sm text-lfc-gray">{it.detail}</p>}
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
              className="px-3 py-1 rounded bg-gray-100 text-sm text-lfc-gray disabled:opacity-50"
            >
              Prev
            </button>
            <div className="text-sm text-lfc-gray">
              Page {page} of {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-gray-100 text-sm text-lfc-gray disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}