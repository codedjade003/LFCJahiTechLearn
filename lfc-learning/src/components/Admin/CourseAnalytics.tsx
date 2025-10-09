// src/components/Admin/CourseAnalytics.tsx
import { useState, useEffect } from "react";

interface Course {
  _id: string;
  title: string;
}

interface Analytics {
  completionRate: number;
  passRate: number;
  averageTime: string;
  averageScore: number;
  dropoutRate: number;
  totalEnrollments?: number;
  activeUsers?: number;
}

export default function CourseAnalytics() {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [analytics, setAnalytics] = useState<Analytics>({
    completionRate: 0,
    passRate: 0,
    averageTime: "0 weeks",
    averageScore: 0,
    dropoutRate: 0,
    totalEnrollments: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourses();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchAnalytics();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('${API_BASE}/api/courses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");
      
      const url = selectedCourse === 'all' 
        ? `${API_BASE}/api/admin/analytics`
        : `${API_BASE}/api/admin/analytics?courseId=${selectedCourse}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Ensure we only use data from API, no static values
        setAnalytics({
          completionRate: data.completionRate || 0,
          passRate: data.passRate || 0,
          averageTime: data.averageTime || "0 weeks",
          averageScore: data.averageScore || 0,
          dropoutRate: data.dropoutRate || 0,
          totalEnrollments: data.totalEnrollments || 0,
          activeUsers: data.activeUsers || 0
        });
      } else {
        console.error('Failed to fetch analytics');
        // Reset to 0 values if API fails
        setAnalytics({
          completionRate: 0,
          passRate: 0,
          averageTime: "0 weeks",
          averageScore: 0,
          dropoutRate: 0,
          totalEnrollments: 0,
          activeUsers: 0
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics({
        completionRate: 0,
        passRate: 0,
        averageTime: "0 weeks",
        averageScore: 0,
        dropoutRate: 0,
        totalEnrollments: 0,
        activeUsers: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStrokeDashoffset = (percentage: number) => {
    const circumference = 125.6;
    return circumference - (percentage / 100) * circumference;
  };

  const formatTime = (timeString: string) => {
    if (!timeString || timeString === "0 weeks") return "0 weeks";
    
    if (timeString.includes(':')) {
      const [hours, minutes, seconds] = timeString.split(':').map(Number);
      const totalHours = hours + (minutes / 60) + (seconds / 3600);
      const weeks = Math.floor(totalHours / (24 * 7));
      const days = Math.floor((totalHours % (24 * 7)) / 24);
      
      if (weeks > 0) {
        return `${weeks} week${weeks > 1 ? 's' : ''}${days > 0 ? ` ${days} day${days > 1 ? 's' : ''}` : ''}`;
      } else if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''}`;
      } else {
        return `${Math.round(totalHours)} hour${Math.round(totalHours) > 1 ? 's' : ''}`;
      }
    }
    
    return timeString;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold text-redCustom">Course Analytics</h2>
        {error && (
          <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
      </div>
      <div className="p-6">
        {/* Course Selection */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 font-medium">Select Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-redCustom focus:border-transparent"
          >
            <option value="all">All Courses Overview</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>{course.title}</option>
            ))}
          </select>
        </div>

        {/* Progress Circles */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="relative">
              <svg className="w-20 h-20" viewBox="0 0 50 50">
                <circle 
                  className="text-gray-200" 
                  strokeWidth="6" 
                  stroke="currentColor" 
                  fill="transparent" 
                  r="20" 
                  cx="25" 
                  cy="25"
                />
                <circle 
                  className="text-goldCustom" 
                  strokeWidth="6" 
                  strokeDasharray="125.6" 
                  strokeDashoffset={calculateStrokeDashoffset(analytics.completionRate)} 
                  strokeLinecap="round" 
                  stroke="currentColor" 
                  fill="transparent" 
                  r="20" 
                  cx="25" 
                  cy="25"
                  transform="rotate(-90 25 25)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold">{analytics.completionRate}%</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-gray-600 font-medium">Completion Rate</p>
              <p className="text-sm text-gray-500">Course completion percentage</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="relative">
              <svg className="w-20 h-20" viewBox="0 0 50 50">
                <circle 
                  className="text-gray-200" 
                  strokeWidth="6" 
                  stroke="currentColor" 
                  fill="transparent" 
                  r="20" 
                  cx="25" 
                  cy="25"
                />
                <circle 
                  className="text-green-500" 
                  strokeWidth="6" 
                  strokeDasharray="125.6" 
                  strokeDashoffset={calculateStrokeDashoffset(analytics.passRate)} 
                  strokeLinecap="round" 
                  stroke="currentColor" 
                  fill="transparent" 
                  r="20" 
                  cx="25" 
                  cy="25"
                  transform="rotate(-90 25 25)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold">{analytics.passRate}%</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-gray-600 font-medium">Pass Rate</p>
              <p className="text-sm text-gray-500">Successful course completions</p>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-600 font-medium">Avg. Time to Complete</p>
            <p className="font-bold text-lg text-blue-800">{formatTime(analytics.averageTime)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <p className="text-sm text-green-600 font-medium">Avg. Score</p>
            <p className="font-bold text-lg text-green-800">{analytics.averageScore}%</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <p className="text-sm text-purple-600 font-medium">Dropout Rate</p>
            <p className="font-bold text-lg text-purple-800">{analytics.dropoutRate}%</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
            <p className="text-sm text-orange-600 font-medium">
              {selectedCourse === 'all' ? 'Total Enrollments' : 'Enrollments'}
            </p>
            <p className="font-bold text-lg text-orange-800">{analytics.totalEnrollments || 0}</p>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="bg-redCustom text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Loading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}