import { useState, useEffect } from "react";
import { FaExclamationTriangle, FaCheck, FaClock, FaBook } from "react-icons/fa";
import { Link } from "react-router-dom";

interface CourseProgress {
  _id: string;
  name: string;
  percentage: number;
  color: string;
  riskLevel: 'none' | 'low' | 'medium' | 'high';
  timeSpent: number;
  enrolledAt: string;
  estimatedDuration: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: {
      url: string;
    };
  };
}

interface ProgressOverviewData {
  courses: CourseProgress[];
  stats: {
    atRisk: number;
    onTrack: number;
    completed: number;
    total: number;
  };
}

export default function UserProgress() {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [progressData, setProgressData] = useState<CourseProgress[]>([]);
  const [stats, setStats] = useState({
    atRisk: 0,
    onTrack: 0,
    completed: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProgress();
  }, []);

  const fetchUserProgress = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/enrollments/progress/overview`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data: ProgressOverviewData = await response.json();
        console.log('Progress overview data:', data);

        // Filter: top 5 by percentage, skip 100% completions
        const filteredCourses = (data.courses || [])
          .filter((course: CourseProgress) => course.percentage < 100)
          .sort((a: CourseProgress, b: CourseProgress) => b.percentage - a.percentage)
          .slice(0, 5);

        setProgressData(filteredCourses);
        setStats(data.stats || { atRisk: 0, onTrack: 0, completed: 0, total: 0 });
      } else {
        console.error('Failed to fetch progress data');
        setProgressData([]);
        setStats({ atRisk: 0, onTrack: 0, completed: 0, total: 0 });
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
      setProgressData([]);
      setStats({ atRisk: 0, onTrack: 0, completed: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return <FaExclamationTriangle className="text-red-500" />;
      case 'medium': return <FaExclamationTriangle className="text-yellow-500" />;
      case 'low': return <FaClock className="text-blue-500" />;
      default: return <FaCheck className="text-green-500" />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'low': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      default: return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg shadow dark:shadow-[var(--shadow-md)] border dark:border-[var(--border-primary)]">
        <div className="p-6 border-b dark:border-[var(--border-primary)]">
          <h2 className="text-lg font-semibold text-redCustom dark:text-gray-100">User Progress Overview</h2>
        </div>
        <div className="p-6 text-center text-gray-600 dark:text-[var(--text-secondary)]">Loading progress data...</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg shadow dark:shadow-[var(--shadow-md)] border dark:border-[var(--border-primary)]">
      <div className="p-6 border-b dark:border-[var(--border-primary)] flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-redCustom dark:text-gray-100">User Progress Overview</h2>
          <p className="text-sm text-gray-500 dark:text-[var(--text-tertiary)] mt-1">Active enrollments across all users</p>
        </div>
        <Link 
          to="/admin/dashboard/users/progress"
          className="text-sm text-lfc-red dark:text-red-400 hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-500 dark:text-[var(--text-tertiary)]">At Risk</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">{stats.atRisk}</h3>
          </div>
          <div>
            <p className="text-gray-500 dark:text-[var(--text-tertiary)]">On Track</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">{stats.onTrack}</h3>
          </div>
          <div>
            <p className="text-gray-500 dark:text-[var(--text-tertiary)]">Completed</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">{stats.completed}</h3>
          </div>
          <div>
            <p className="text-gray-500 dark:text-[var(--text-tertiary)]">Total</p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">{stats.total}</h3>
          </div>
        </div>

        <div className="space-y-4">
          {progressData.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-[var(--text-tertiary)]">
              No active progress data available
            </div>
          ) : (
            progressData.map((course) => (
              <div key={`${course._id}-${course.user?._id}`} className="border dark:border-[var(--border-primary)] rounded-lg p-4">
                {/* User Info Header */}
                {course.user && (
                  <div className="flex items-center space-x-3 mb-3 pb-3 border-b dark:border-[var(--border-primary)]">
                    <img
                      src={course.user.profilePicture?.url || "/logo.png"}
                      alt={course.user.name}
                      className={`w-10 h-10 rounded-full object-cover border-2 border-lfc-gold ${
                        !course.user.profilePicture?.url ? "bg-white p-1" : ""
                      }`}
                      onError={(e) => {
                        e.currentTarget.src = "/logo.png";
                        e.currentTarget.classList.add("bg-white", "p-1");
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)] truncate">
                        {course.user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-[var(--text-tertiary)] truncate">
                        {course.user.email}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Course Info */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <FaBook className="text-gray-600 dark:text-[var(--text-secondary)] flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)] truncate">
                      {course.name}
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(course.riskLevel)} ml-2 flex-shrink-0`}>
                    {getRiskIcon(course.riskLevel)}
                    <span className="ml-1 capitalize">{course.riskLevel} risk</span>
                  </span>
                </div>
                
                <div className="flex justify-between mb-1 text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                  <span>{course.percentage}% complete</span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                  <div
                    className={`${course.color} h-2.5 rounded-full transition-all duration-300`}
                    style={{ width: `${course.percentage}%` }}
                  />
                </div>
                
                <div className="text-xs text-gray-500 dark:text-[var(--text-muted)]">
                  Enrolled: {new Date(course.enrolledAt).toLocaleDateString()} • Est: {course.estimatedDuration}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
