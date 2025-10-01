// src/pages/Admin/Assignments.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FaSearch, 
  FaFilter, 
  FaDownload, 
  FaEye, 
  FaEdit, 
  FaChartBar,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa";

interface Submission {
  _id: string;
  submissionType: string;
  submission: {
    text?: string;
    link?: string;
    file?: {
      url: string;
      name: string;
      type: string;
    };
  };
  grade?: number;
  feedback?: string;
  submittedAt: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  courseId: {
    _id: string;
    title: string;
    instructor: {
      name: string;
    };
  };
  assignmentId?: {
    _id: string;
    title: string;
    dueDate: string;
  };
}

export default function Assignments() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    course: 'all',
    search: ''
  });

  const API_BASE = "http://localhost:5000";

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/submissions/admin/submissions?type=assignment`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error("Error fetching submissions", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (submission: Submission) => {
    if (submission.grade !== undefined) {
      return { color: 'bg-green-100 text-green-800', text: 'Graded', icon: FaCheckCircle };
    }
    
    const submittedDate = new Date(submission.submittedAt);
    const dueDate = submission.assignmentId ? new Date(submission.assignmentId.dueDate) : null;
    
    if (dueDate && submittedDate > dueDate) {
      return { color: 'bg-red-100 text-red-800', text: 'Late', icon: FaExclamationTriangle };
    }
    
    return { color: 'bg-yellow-100 text-yellow-800', text: 'Pending', icon: FaClock };
  };

  const filteredSubmissions = submissions.filter(submission => {
    if (filters.status === 'graded' && submission.grade === undefined) return false;
    if (filters.status === 'pending' && submission.grade !== undefined) return false;
    if (filters.status === 'late') {
      const dueDate = submission.assignmentId ? new Date(submission.assignmentId.dueDate) : null;
      const submittedDate = new Date(submission.submittedAt);
      if (!dueDate || submittedDate <= dueDate) return false;
    }
    
    if (filters.search && !submission.studentId.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !submission.courseId.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

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
          <h1 className="text-2xl font-bold text-yt-text-dark">Assignment Submissions</h1>
          <p className="text-yt-text-gray">Manage and grade student assignments</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-yt-text-gray">
            {filteredSubmissions.length} submissions
          </span>
          <button className="px-4 py-2 bg-lfc-red text-white rounded-lg hover:bg-lfc-gold-dark flex items-center">
            <FaDownload className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-yt-light-border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
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
          
          {/* Status Filter */}
          <select
            className="border border-yt-light-border rounded-lg px-3 py-2 focus:outline-none focus:border-lfc-red"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="graded">Graded</option>
            <option value="late">Late Submissions</option>
          </select>

          {/* Course Filter */}
          <select
            className="border border-yt-light-border rounded-lg px-3 py-2 focus:outline-none focus:border-lfc-red"
            value={filters.course}
            onChange={(e) => setFilters({...filters, course: e.target.value})}
          >
            <option value="all">All Courses</option>
            {/* Would be populated from API */}
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
              <p className="text-sm text-yt-text-gray">Total Submissions</p>
              <p className="text-2xl font-bold text-yt-text-dark">{submissions.length}</p>
            </div>
            <FaChartBar className="text-lfc-red text-xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-yt-light-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yt-text-gray">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">
                {submissions.filter(s => s.grade === undefined).length}
              </p>
            </div>
            <FaClock className="text-yellow-600 text-xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-yt-light-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yt-text-gray">Graded</p>
              <p className="text-2xl font-bold text-green-600">
                {submissions.filter(s => s.grade !== undefined).length}
              </p>
            </div>
            <FaCheckCircle className="text-green-600 text-xl" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-yt-light-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yt-text-gray">Average Grade</p>
              <p className="text-2xl font-bold text-lfc-red">
                {submissions.filter(s => s.grade).length > 0 
                  ? Math.round(submissions.filter(s => s.grade).reduce((acc, s) => acc + (s.grade || 0), 0) / submissions.filter(s => s.grade).length)
                  : 0}%
              </p>
            </div>
            <FaChartBar className="text-lfc-red text-xl" />
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-lg border border-yt-light-border">
        <div className="p-4 border-b border-yt-light-border">
          <h3 className="font-semibold text-yt-text-dark">Assignment Submissions</h3>
        </div>
        
        {filteredSubmissions.length === 0 ? (
          <div className="p-8 text-center">
            <FaChartBar className="text-4xl text-yt-text-gray mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No submissions found</h3>
            <p className="text-yt-text-gray">Adjust your filters to see more results</p>
          </div>
        ) : (
          <div className="divide-y divide-yt-light-border">
            {filteredSubmissions.map((submission) => {
              const status = getStatusBadge(submission);
              const StatusIcon = status.icon;
              
              return (
                <div key={submission._id} className="p-4 hover:bg-yt-light-hover transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Student Avatar */}
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
                          {submission.grade && (
                            <span className="bg-lfc-red text-white px-2 py-1 rounded-full text-xs font-medium">
                              {submission.grade}%
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-yt-text-gray truncate">
                          {submission.courseId.title} • {submission.assignmentId?.title}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-yt-text-gray mt-1">
                          <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                          {submission.assignmentId?.dueDate && (
                            <span>Due: {new Date(submission.assignmentId.dueDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/admin/submissions/${submission._id}`}
                        className="p-2 text-yt-text-gray hover:text-lfc-red hover:bg-red-50 rounded-lg transition-colors"
                        title="View Submission"
                      >
                        <FaEye />
                      </Link>
                      
                      <button
                        className="p-2 text-yt-text-gray hover:text-lfc-red hover:bg-red-50 rounded-lg transition-colors"
                        title="Grade Assignment"
                      >
                        <FaEdit />
                      </button>
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