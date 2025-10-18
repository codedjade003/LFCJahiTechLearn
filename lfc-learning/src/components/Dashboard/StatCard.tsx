// src/components/Dashboard/StatCard.tsx - SIMPLIFIED
import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  progress: number;
  description: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  progress,
  description,
  color,
}) => {
  return (
    <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg shadow dark:shadow-[var(--shadow-md)] p-6 hover:shadow-md dark:hover:shadow-[var(--shadow-lg)] border dark:border-[var(--border-primary)] transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-[var(--text-secondary)]">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)] mt-1">{value}</p>
        </div>
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-[var(--bg-tertiary)] rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${progress}%`,
              backgroundColor: color
            }}
          ></div>
        </div>
      </div>
      
      <p className="text-xs text-gray-600 mt-2">{description}</p>
    </div>
  );
};

export default StatCard;