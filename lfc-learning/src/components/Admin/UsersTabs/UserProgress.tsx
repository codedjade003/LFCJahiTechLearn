// FIXED UserProgress.tsx - Replace the entire component
import { useState, useEffect, type JSX } from "react";
import { FaExclamationTriangle, FaCheck, FaClock, FaBook } from "react-icons/fa";

interface CourseProgress {
  _id: string;
  name: string;
  percentage: number;
  color: string;
  icon: JSX.Element;
  riskLevel: 'none' | 'low' | 'medium' | 'high';
  timeSpent: number;
  enrolledAt: string;
  estimatedDuration: string;
}

export default function UserProgress() {
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
      const response = await fetch('http://localhost:5000/api/enrollments/progress/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProgressData(data.courses);
        setStats(data.stats);
      } else {
        console.error('Failed to fetch progress data');
        // Fallback to empty data instead of sample data
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
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-redCustom">User Progress Overview</h2>
        </div>
        <div className="p-6 text-center">Loading progress data...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold text-redCustom">User Progress Overview</h2>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-500">Users at risk</p>
            <h3 className="text-xl font-bold">{stats.atRisk}</h3>
          </div>
          <div>
            <p className="text-gray-500">On track</p>
            <h3 className="text-xl font-bold">{stats.onTrack}</h3>
          </div>
          <div>
            <p className="text-gray-500">Completed</p>
            <h3 className="text-xl font-bold">{stats.completed}</h3>
          </div>
          <div>
            <p className="text-gray-500">Total</p>
            <h3 className="text-xl font-bold">{stats.total}</h3>
          </div>
        </div>

        <div className="space-y-4">
          {progressData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No progress data available
            </div>
          ) : (
            progressData.map((course) => (
              <div key={course._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <FaBook className="text-gray-600" />
                    <span className="text-sm font-medium">{course.name}</span>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(course.riskLevel)}`}>
                    {getRiskIcon(course.riskLevel)}
                    <span className="ml-1 capitalize">{course.riskLevel} risk</span>
                  </span>
                </div>
                
                <div className="flex justify-between mb-1 text-sm text-gray-600">
                  <span>{course.percentage}% complete</span>
                  <span>{course.timeSpent}h spent</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div
                    className={`${course.color} h-2.5 rounded-full`}
                    style={{ width: `${course.percentage}%` }}
                  />
                </div>
                
                <div className="text-xs text-gray-500">
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