// src/pages/Admin/Quizzes.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FaSearch, 
  FaFilter, 
  FaDownload, 
  FaEye, 
  FaChartBar,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaBrain
} from "react-icons/fa";

interface QuizSubmission {
  _id: string;
  submissionType: string;
  submission: {
    answers: any[];
    score: number;
    passed: boolean;
  };
  grade: number;
  submittedAt: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  courseId: {
    _id: string;
    title: string;
  };
  moduleId: string;
}

export default function Quizzes() {
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    course: 'all',
    search: ''
  });

  const API_BASE = "http://localhost:5000";

  useEffect(() => {
    fetchQuizSubmissions();
  }, []);

  const fetchQuizSubmissions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/submissions/admin/submissions?type=quiz`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error("Error fetching quiz submissions", err);
    } finally {
      setLoading(false);
    }
  };

  const getPassFailBadge = (submission: QuizSubmission) => {
    if (submission.submission.passed) {
      return { color: 'bg-green-100 text-green-800', text: 'Passed', icon: FaCheckCircle };
    } else {
      return { color: 'bg-red-100 text-red-800', text: 'Failed', icon: FaTimesCircle };
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    if (filters.status === 'passed' && !submission.submission.passed) return false;
    if (filters.status === 'failed' && submission.submission.passed) return false;
    
    if (filters.search && !submission.studentId.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !submission.courseId.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Calculate statistics
  const totalAttempts = submissions.length;
  const passedAttempts = submissions.filter(s => s.submission.passed).length;
  const averageScore = submissions.reduce((acc, s) => acc + s.grade, 0) / submissions.length;
  const uniqueStudents = new Set(submissions.map(s => s.studentId._id)).size;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-yt-light-hover rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-yt-text-dark">Quiz Results</h1>
          <p className="text-yt-text-gray">Monitor student quiz performance and analytics</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-yt-text-gray">
            {filteredSubmissions.length} attempts
          </span>
          <button className="px-4 py-2 bg-lfc-red text-white rounded-lg hover:bg-lfc-gold-dark flex items-center">
            <FaDownload className="mr-2" />
            Export Results
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-yt-light-border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-yt-text-gray" />
            <input
              type="text"
              placeholder="Search students or courses..."
              className="w-full pl-10 pr-4 py-2 border border-yt-light-border rounded-lg focus:outline-none focus:border-lfc-red"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          
          <select
            className="border border-yt-light-border rounded-lg px-3 py-2 focus:outline-none focus:border-lfc-red"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">All Results</option>
            <option value="passed">Passed Only</option>
            <option value="failed">Failed Only</option>
          </select>

          <select
            className="border border-yt-light-border rounded-lg px-3 py-2 focus:outline-none focus:border-lfc-red"
            value={filters.course}
            onChange={(e) => setFilters({...filters, course: e.target.value})}
          >
            <option value="all">All Courses</option>
          </select>

          <button className="px-4 py-2 border border-yt-light-border rounded-lg hover:bg-yt-light-hover flex items-center justify-center">
            <FaFilter className="mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-yt-light-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yt-text-gray">Total Attempts</p>
              <p className="text-2xl font-bold text-yt-text-dark">{totalAttempts}</p>
            </div>
            <FaBrain className="text-lfc-red text-xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-yt-light-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yt-text-gray">Pass Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0}%
              </p>
            </div>
            <FaCheckCircle className="text-green-600 text-xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-yt-light-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yt-text-gray">Average Score</p>
              <p className="text-2xl font-bold text-lfc-red">
                {Math.round(averageScore || 0)}%
              </p>
            </div>
            <FaChartBar className="text-lfc-red text-xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-yt-light-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yt-text-gray">Unique Students</p>
              <p className="text-2xl font-bold text-yt-text-dark">{uniqueStudents}</p>
            </div>
            <FaUser className="text-lfc-red text-xl" />
          </div>
        </div>
      </div>

      {/* Quiz Results List */}
      <div className="bg-white rounded-lg border border-yt-light-border">
        <div className="p-4 border-b border-yt-light-border">
          <h3 className="font-semibold text-yt-text-dark">Quiz Attempts</h3>
        </div>
        
        {filteredSubmissions.length === 0 ? (
          <div className="p-8 text-center">
            <FaBrain className="text-4xl text-yt-text-gray mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No quiz attempts found</h3>
            <p className="text-yt-text-gray">Adjust your filters to see more results</p>
          </div>
        ) : (
          <div className="divide-y divide-yt-light-border">
            {filteredSubmissions.map((submission) => {
              const status = getPassFailBadge(submission);
              const StatusIcon = status.icon;
              
              return (
                <div key={submission._id} className="p-4 hover:bg-yt-light-hover transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-10 h-10 bg-lfc-red rounded-full flex items-center justify-center text-white font-semibold">
                        {submission.studentId.name.charAt(0)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-yt-text-dark truncate">
                            {submission.studentId.name}
                          </h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            <StatusIcon className="mr-1" size={10} />
                            {status.text}
                          </span>
                          <span className="bg-lfc-red text-white px-2 py-1 rounded-full text-xs font-medium">
                            {submission.grade}%
                          </span>
                        </div>
                        
                        <p className="text-sm text-yt-text-gray truncate">
                          {submission.courseId.title} • Quiz Attempt
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-yt-text-gray mt-1">
                          <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                          <span>Score: {submission.grade}%</span>
                          <span>Status: {submission.submission.passed ? 'Passed' : 'Failed'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/admin/submissions/${submission._id}`}
                        className="p-2 text-yt-text-gray hover:text-lfc-red hover:bg-yt-light-hover rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FaEye />
                      </Link>
                      <Link
                        to={`/admin/analytics/quiz/${submission._id}`}
                        className="p-2 text-yt-text-gray hover:text-lfc-red hover:bg-yt-light-hover rounded-lg transition-colors"
                        title="View Analytics"
                      >
                        <FaChartBar />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}