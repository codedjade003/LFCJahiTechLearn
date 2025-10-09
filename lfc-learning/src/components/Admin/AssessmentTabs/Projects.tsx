// src/pages/Admin/Projects.tsx
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
  FaExclamationTriangle,
  FaFileAlt
} from "react-icons/fa";

interface ProjectSubmission {
  _id: string;
  submissionType: string;
  submission: {
    text?: string;
    link?: string;
    file?: {
      url: string;
      name: string;
      type: string;
      size: number;
    };
  };
  grade?: number;
  feedback?: string;
  submittedAt: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  courseId: {
    _id: string;
    title: string;
    project?: {
      title: string;
      dueDate: string;
    };
  };
}

export default function Projects() {
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    course: 'all',
    search: ''
  });

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchProjectSubmissions();
  }, []);

  const fetchProjectSubmissions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/submissions/admin/submissions?type=file_upload`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        // Filter for project submissions (those with projectId)
        const projectSubmissions = data.submissions?.filter((s: any) => s.projectId) || [];
        setSubmissions(projectSubmissions);
      }
    } catch (err) {
      console.error("Error fetching project submissions", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (submission: ProjectSubmission) => {
    if (submission.grade !== undefined) {
      return { color: 'bg-green-100 text-green-800', text: 'Reviewed', icon: FaCheckCircle };
    }
    
    const submittedDate = new Date(submission.submittedAt);
    const dueDate = submission.courseId.project?.dueDate ? new Date(submission.courseId.project.dueDate) : null;
    
    if (dueDate && submittedDate > dueDate) {
      return { color: 'bg-red-100 text-red-800', text: 'Late', icon: FaExclamationTriangle };
    }
    
    return { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Review', icon: FaClock };
  };

  const getFileTypeIcon = (submission: ProjectSubmission) => {
    if (submission.submission.file) {
      return FaFileAlt;
    }
    if (submission.submission.link) {
      return FaEye;
    }
    return FaFileAlt;
  };

  const filteredSubmissions = submissions.filter(submission => {
    if (filters.status === 'reviewed' && submission.grade === undefined) return false;
    if (filters.status === 'pending' && submission.grade !== undefined) return false;
    
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
          <h1 className="text-2xl font-bold text-yt-text-dark">Project Submissions</h1>
          <p className="text-yt-text-gray">Review and grade student projects</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-yt-text-gray">
            {filteredSubmissions.length} projects
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
            <option value="all">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="reviewed">Reviewed</option>
            <option value="late">Late Submissions</option>
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
              <p className="text-sm text-yt-text-gray">Total Projects</p>
              <p className="text-2xl font-bold text-yt-text-dark">{submissions.length}</p>
            </div>
            <FaFileAlt className="text-lfc-red text-xl" />
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
              <p className="text-sm text-yt-text-gray">Reviewed</p>
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
              <p className="text-sm text-yt-text-gray">Average Score</p>
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

      {/* Projects List */}
      <div className="bg-white rounded-lg border border-yt-light-border">
        <div className="p-4 border-b border-yt-light-border">
          <h3 className="font-semibold text-yt-text-dark">Project Submissions</h3>
        </div>
        
        {filteredSubmissions.length === 0 ? (
          <div className="p-8 text-center">
            <FaFileAlt className="text-4xl text-yt-text-gray mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No project submissions found</h3>
            <p className="text-yt-text-gray">Adjust your filters to see more results</p>
          </div>
        ) : (
          <div className="divide-y divide-yt-light-border">
            {filteredSubmissions.map((submission) => {
              const status = getStatusBadge(submission);
              const StatusIcon = status.icon;
              const FileTypeIcon = getFileTypeIcon(submission);
              
              return (
                <div key={submission._id} className="p-4 hover:bg-yt-light-hover transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-10 h-10 bg-lfc-red rounded-full flex items-center justify-center text-white">
                        <FileTypeIcon />
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
                          {submission.courseId.title} • {submission.courseId.project?.title || 'Course Project'}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-yt-text-gray mt-1">
                          <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                          {submission.courseId.project?.dueDate && (
                            <span>Due: {new Date(submission.courseId.project.dueDate).toLocaleDateString()}</span>
                          )}
                          {submission.submission.file && (
                            <span>{submission.submission.file.name} ({(submission.submission.file.size / 1024 / 1024).toFixed(1)}MB)</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/admin/submissions/${submission._id}`}
                        className="p-2 text-yt-text-gray hover:text-lfc-red hover:bg-red-50 rounded-lg transition-colors"
                        title="View Project"
                      >
                        <FaEye />
                      </Link>
                      
                      <button
                        className="p-2 text-yt-text-gray hover:text-lfc-red hover:bg-red-50 rounded-lg transition-colors"
                        title="Review Project"
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