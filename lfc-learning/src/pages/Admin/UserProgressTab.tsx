import { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaUser, FaBook, FaChartLine, FaClock, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

interface UserProgress {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    lastLogin?: string;
  };
  course: {
    _id: string;
    title: string;
    duration: string;
    estimatedDuration?: number;
  };
  progress: number;
  completed: boolean;
  timeSpent: number;
  enrolledAt: string;
  lastAccessed: string;
  sectionProgress: Array<{
    sectionId: string;
    completed: boolean;
    modulesCompleted: number;
    totalModules: number;
  }>;
  assignmentProgress: Array<{
    assignmentId: string;
    submitted: boolean;
    graded: boolean;
    score: number;
  }>;
  projectProgress?: {
    submitted: boolean;
    reviewed: boolean;
    score: number;
  };
}

const UserProgressTab = () => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [progressData, setProgressData] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserProgress | null>(null);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/enrollments/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched progress data:', data);
        setProgressData(data.enrollments || data || []);
      } else {
        console.error('API Error:', response.status);
        setProgressData([]);
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
      setProgressData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProgress = useMemo(() => {
    const validProgress = progressData.filter(progress => 
      progress && progress.user && progress.course
    );

    return validProgress.filter(progress => {
      const matchesSearch = 
        progress.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        progress.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        progress.course.title?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCourse = filterCourse === 'all' || progress.course._id === filterCourse;
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'completed' && progress.completed) ||
        (filterStatus === 'in-progress' && !progress.completed && progress.progress > 0) ||
        (filterStatus === 'not-started' && progress.progress === 0);

      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [progressData, searchTerm, filterCourse, filterStatus]);

  // Safe calculation functions
  const getStatusColor = (progress: UserProgress) => {
    if (progress.completed) return 'bg-green-100 text-green-800';
    if (progress.progress > 0) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (progress: UserProgress) => {
    if (progress.completed) return <FaCheckCircle className="text-green-600" />;
    if (progress.progress > 0) return <FaChartLine className="text-blue-600" />;
    return <FaClock className="text-gray-600" />;
  };

  const calculateRiskLevel = (progress: UserProgress) => {
    if (!progress.enrolledAt) return 'low';
    
    const daysEnrolled = Math.floor((new Date().getTime() - new Date(progress.enrolledAt).getTime()) / (1000 * 60 * 60 * 24));
    const expectedDuration = progress.course.estimatedDuration || 30;
    
    if (progress.completed) return 'none';
    if (daysEnrolled > expectedDuration * 1.5 && progress.progress < 50) return 'high';
    if (daysEnrolled > expectedDuration && progress.progress < 75) return 'medium';
    return 'low';
  };

  const formatTimeSpent = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleUserClick = (progress: UserProgress) => {
    setSelectedUser(progress);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lfc-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading progress data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaUser className="text-blue-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold">
                {new Set(progressData.filter(p => p?.user?._id).map(p => p.user._id)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Courses Completed</p>
              <p className="text-2xl font-bold">
                {progressData.filter(p => p?.completed).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <FaExclamationTriangle className="text-orange-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">At Risk</p>
              <p className="text-2xl font-bold">
                {progressData.filter(p => p && calculateRiskLevel(p) === 'high').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FaBook className="text-purple-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Courses</p>
              <p className="text-2xl font-bold">
                {new Set(progressData.filter(p => p?.course?._id).map(p => p.course._id)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search users, courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lfc-gold"
            />
          </div>
          
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Courses</option>
            {Array.from(new Set(progressData.map(p => p.course._id))).map(courseId => {
              const course = progressData.find(p => p.course._id === courseId)?.course;
              return <option key={courseId} value={courseId}>{course?.title}</option>;
            })}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
            <option value="not-started">Not Started</option>
          </select>
        </div>
      </div>

      {/* Progress Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User & Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProgress.map((progress) => {
                if (!progress || !progress.user || !progress.course) return null;
                return (
                <tr key={progress._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <button 
                        onClick={() => handleUserClick(progress)}
                        className="font-medium text-gray-900 hover:text-lfc-red cursor-pointer"
                      >
                        {progress.user.name || 'N/A'}
                      </button>
                      <div className="text-sm text-gray-500">{progress.user.email || 'N/A'}</div>
                      <div className="text-sm font-medium text-lfc-red mt-1">
                        {progress.course.title || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="ml-3 text-sm font-medium">{progress.progress || 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatTimeSpent(progress.timeSpent)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(progress)}`}>
                      {getStatusIcon(progress)}
                      <span className="ml-1">
                        {progress.completed ? 'Completed' : progress.progress > 0 ? 'In Progress' : 'Not Started'}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      calculateRiskLevel(progress) === 'high' ? 'bg-red-100 text-red-800' :
                      calculateRiskLevel(progress) === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      calculateRiskLevel(progress) === 'low' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      <FaExclamationTriangle className="mr-1" />
                      {calculateRiskLevel(progress).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {progress.lastAccessed ? new Date(progress.lastAccessed).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>

        {filteredProgress.length === 0 && (
          <div className="text-center py-12">
            <FaSearch className="mx-auto text-gray-400 text-4xl" />
            <p className="mt-4 text-gray-600">No progress records found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">User Progress Details</h3>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700">User Information</h4>
                  <p><strong>Name:</strong> {selectedUser.user.name || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedUser.user.email || 'N/A'}</p>
                  <p><strong>Last Login:</strong> {selectedUser.user.lastLogin ? new Date(selectedUser.user.lastLogin).toLocaleDateString() : 'N/A'}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700">Course Progress</h4>
                  <p><strong>Course:</strong> {selectedUser.course.title || 'N/A'}</p>
                  <p><strong>Progress:</strong> {selectedUser.progress || 0}%</p>
                  <p><strong>Status:</strong> {selectedUser.completed ? 'Completed' : 'In Progress'}</p>
                  <p><strong>Time Spent:</strong> {formatTimeSpent(selectedUser.timeSpent)}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700">Enrollment Details</h4>
                  <p><strong>Enrolled:</strong> {selectedUser.enrolledAt ? new Date(selectedUser.enrolledAt).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>Last Accessed:</strong> {selectedUser.lastAccessed ? new Date(selectedUser.lastAccessed).toLocaleDateString() : 'N/A'}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700">Section Progress</h4>
                  {selectedUser.sectionProgress?.map((section, index) => (
                    <div key={index} className="text-sm">
                      <p>Section {index + 1}: {section.modulesCompleted}/{section.totalModules} modules completed</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="bg-lfc-red text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProgressTab;