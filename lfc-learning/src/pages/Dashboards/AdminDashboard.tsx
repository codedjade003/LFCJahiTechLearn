// src/pages/admin/AdminDashboard.tsx
import type { JSX } from "react";
import { useState, useEffect } from "react";
import StatCard from "../../components/Admin/StatCard";
import RecentActivity, { type ActivityItem } from "../../components/Admin/RecentActivity";
import CourseManagement from "../../components/Admin/CourseManagement";

// NEW COMPONENTS
import UserProgress from "../../components/Admin/UserProgress";
import CourseAnalytics from "../../components/Admin/CourseAnalytics";
import RecentUsers from "../../components/Admin/RecentUsers";
import PendingAssessments from "../../components/Admin/PendingAssessments";
import OnboardingTour from "../../components/shared/OnboardingTour";
import { adminDashboardTour } from "../../config/onboardingTours";

import {
  FaBook,
  FaUsers,
  FaClipboardList,
  FaExclamationTriangle,
} from "react-icons/fa";

interface DashboardStats {
  totalCourses: number;
  activeUsers: number;
  pendingAssessments: number;
  atRiskUsers: number;
  recentActivity: ActivityItem[];
}

export default function AdminDashboard(): JSX.Element {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    activeUsers: 0,
    pendingAssessments: 0,
    atRiskUsers: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Failed to fetch dashboard data');
        // Fallback to empty data
        setStats({
          totalCourses: 0,
          activeUsers: 0,
          pendingAssessments: 0,
          atRiskUsers: 0,
          recentActivity: []
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        totalCourses: 0,
        activeUsers: 0,
        pendingAssessments: 0,
        atRiskUsers: 0,
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: "Total Courses", 
      value: stats.totalCourses, 
      Icon: FaBook, 
      iconBgClass: "bg-lfc-gold/20", 
      iconColorClass: "text-lfc-red" 
    },
    { 
      label: "Active Users", 
      value: stats.activeUsers, 
      Icon: FaUsers, 
      iconBgClass: "bg-green-100", 
      iconColorClass: "text-green-600" 
    },
    { 
      label: "Pending Assessments", 
      value: stats.pendingAssessments, 
      Icon: FaClipboardList, 
      iconBgClass: "bg-yellow-100", 
      iconColorClass: "text-yellow-600" 
    },
    { 
      label: "Potential Abscondees", 
      value: stats.atRiskUsers, 
      Icon: FaExclamationTriangle, 
      iconBgClass: "bg-red-100", 
      iconColorClass: "text-red-600" 
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 space-y-6 p-3 sm:p-4 md:p-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
        <div className="text-center py-8">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 space-y-6 p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Onboarding Tour */}
      <OnboardingTour tourKey="adminDashboard" steps={adminDashboardTour} />
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="stats">
        {statCards.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            Icon={s.Icon}
            iconBgClass={s.iconBgClass}
            iconColorClass={s.iconColorClass}
          />
        ))}
      </div>

      {/* Recent Activity + Course Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow" data-tour="recent-activity">
          <RecentActivity items={stats.recentActivity} />
        </div>
        <CourseManagement />
      </div>

      {/* New Section: Analytics + Progress + Users + Assessments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <UserProgress />
        <CourseAnalytics />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentUsers />
        <div data-tour="pending-assessments">
          <PendingAssessments />
        </div>
      </div>
    </div>
  );
}