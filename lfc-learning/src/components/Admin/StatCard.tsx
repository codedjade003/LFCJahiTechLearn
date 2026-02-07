import type { IconType } from "react-icons";

interface StatCardProps {
  label: string;
  value: number | string;
  Icon: IconType;
  iconBgClass?: string; // e.g. "bg-lfc-gold/20" or "bg-green-100"
  iconColorClass?: string; // e.g. "text-lfc-red dark:text-[var(--lfc-red)]"
  valueColorClass?: string; // e.g. "text-green-600 dark:text-green-400"
}

/**
 * StatCard - small card used in dashboard header
 * Icon is a react-icon component (passed in)
 */
export default function StatCard({
  label,
  value,
  Icon,
  iconBgClass = "bg-lfc-gold/20",
  iconColorClass = "text-lfc-red dark:text-red-800",
  valueColorClass = "text-lfc-red dark:text-red-800",
}: StatCardProps) {
  return (
    <div className="bg-white dark:bg-[var(--bg-elevated)] dark:bg-[var(--bg-elevated)] rounded-lg shadow dark:shadow-[var(--shadow-md)] p-4 border dark:border-[var(--border-primary)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-lfc-gray dark:text-[var(--text-secondary)]">{label}</p>
          <h3 className={`text-2xl font-bold ${valueColorClass}`}>{value}</h3>
        </div>

        <div className={`p-3 rounded-full ${iconBgClass} ${iconColorClass} flex items-center justify-center`}>
          <Icon className="text-xl" />
        </div>
      </div>
    </div>
  );
}
