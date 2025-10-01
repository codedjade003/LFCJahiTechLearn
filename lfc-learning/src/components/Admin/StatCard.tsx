import type { IconType } from "react-icons";

interface StatCardProps {
  label: string;
  value: number | string;
  Icon: IconType;
  iconBgClass?: string; // e.g. "bg-lfc-gold/20" or "bg-green-100"
  iconColorClass?: string; // e.g. "text-lfc-red"
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
  iconColorClass = "text-lfc-red",
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-lfc-gray">{label}</p>
          <h3 className="text-2xl font-bold text-lfc-red">{value}</h3>
        </div>

        <div className={`p-3 rounded-full ${iconBgClass} ${iconColorClass} flex items-center justify-center`}>
          <Icon className="text-xl" />
        </div>
      </div>
    </div>
  );
}
