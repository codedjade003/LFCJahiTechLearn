// src/components/Dashboard/DashboardStats.tsx - UPDATED
import React, { useEffect, useState } from "react";
import StatCard from "./StatCard";
import { FaFire, FaCheckCircle, FaBook } from "react-icons/fa";

type StatsShape = {
  streak: number;
  totalCourses: number;
  completedCourses: number;
  activeCourses: number;
  completionPercent: number;
};

const DashboardStats: React.FC = () => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [stats, setStats] = useState<StatsShape>({
    streak: 0,
    totalCourses: 0,
    completedCourses: 0,
    activeCourses: 0,
    completionPercent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem("token");

    async function loadStats() {
      setLoading(true);
      try {
        const headers: HeadersInit = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_BASE}/api/stats/me`, { headers });
        
        if (res.ok) {
          const data = await res.json();
          
          if (mounted) {
            setStats({
              streak: data.streak ?? 0,
              totalCourses: data.totalCourses ?? 0,
              completedCourses: data.completedCourses ?? 0,
              activeCourses: data.activeCourses ?? 0,
              completionPercent: data.completionPercent ?? 0,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadStats();
    return () => {
      mounted = false;
    };
  }, []);

  // Skeleton card
  const SkeletonCard = () => (
    <div className="bg-white rounded-lg shadow p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-4 w-28 bg-gray-300 rounded mb-2" />
          <div className="h-8 w-20 bg-gray-300 rounded" />
        </div>
        <div className="w-16 h-16 rounded-full bg-gray-300" />
      </div>
      <div className="h-3 w-40 bg-gray-200 rounded mt-3" />
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : (
        <>
          <StatCard
            title="Current Streak"
            value={`${stats.streak} days`}
            icon={<FaFire className="text-xl" />}
            progress={Math.min(100, Math.round((stats.streak / 7) * 100))}
            description="Keep it up! Log in tomorrow to continue your streak."
            color="#A41E21"
          />

          <StatCard
            title="Courses Completed"
            value={`${stats.completedCourses}/${stats.totalCourses}`}
            icon={<FaCheckCircle className="text-xl" />}
            progress={stats.completionPercent}
            description={`${stats.completionPercent}% of your courses completed.`}
            color="#A41E21"
          />

          <StatCard
            title="Active Courses"
            value={`${stats.activeCourses}`}
            icon={<FaBook className="text-xl" />}
            progress={stats.activeCourses > 0 ? 100 : 0}
            description="You're making good progress on your current courses."
            color="#A41E21"
          />
        </>
      )}
    </div>
  );
};

export default DashboardStats;