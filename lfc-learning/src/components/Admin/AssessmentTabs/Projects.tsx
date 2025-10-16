// src/pages/Admin/Projects.tsx
import { useState, useEffect } from "react";
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
import ProjectSubmissionModal from "./ProjectSubmissionModal";
import { useNotification } from "../../../hooks/useNotification";

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
  createdAt: string;
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
  const [selectedSubmission, setSelectedSubmission] = useState<ProjectSubmission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coursePermissions, setCoursePermissions] = useState<Record<string, boolean>>({});
  const { showNotification } = useNotification();

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);

  const toggleSubmissionSelection = (submissionId: string) => {
    setSelectedSubmissions(prev =>
      prev.includes(submissionId)
        ? prev.filter(id => id !== submissionId)
        : [...prev, submissionId]
    );
  };

  useEffect(() => {
    fetchProjectSubmissions();
  }, []);

  const checkPermissionsForCourses = async (courses: any[]) => {
  const token = localStorage.getItem("token");
  const permissionsMap: Record<string, boolean> = {};

  for (const course of courses) {
    try {
      const res = await fetch(`${API_BASE}/api/courses/${course._id}/permissions`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        permissionsMap[course._id] = data.canGrade || data.canManage || false;
      } else {
        permissionsMap[course._id] = false;
      }
    } catch (error) {
      console.error(`Error checking permissions for course ${course._id}:`, error);
      permissionsMap[course._id] = false;
    }
  }

    setCoursePermissions(permissionsMap);
  };

  const fetchProjectSubmissions = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // First, get all courses to find which ones have projects
      const coursesRes = await fetch(`${API_BASE}/api/courses`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!coursesRes.ok) {
        console.error("Failed to fetch courses");
        setSubmissions([]);
        return;
      }

      const courses = await coursesRes.json();
      
      // Filter courses that have projects
      const coursesWithProjects = courses.filter((course: any) => course.project);
      
      console.log(`📊 Found ${coursesWithProjects.length} courses with projects`);
      
      // Fetch project submissions for each course
      const allProjectSubmissions: ProjectSubmission[] = [];
      
      for (const course of coursesWithProjects) {
        try {
          const submissionRes = await fetch(
            `${API_BASE}/api/submissions/admin/courses/${course._id}/submissions?projectOnly=true`,
            {
              headers: { "Authorization": `Bearer ${token}` }
            }
          );
          
          if (submissionRes.ok) {
            const data = await submissionRes.json();
            // Add course project info to each submission
            const courseSubmissions = data.submissions?.map((submission: any) => ({
              ...submission,
              courseId: {
                _id: course._id,
                title: course.title,
                project: course.project
              }
            })) || [];

            await checkPermissionsForCourses(coursesWithProjects);
            
            allProjectSubmissions.push(...courseSubmissions);
          }
        } catch (err) {
          console.error(`Error fetching submissions for course ${course._id}:`, err);
        }
      }
      
      console.log(`✅ Loaded ${allProjectSubmissions.length} project submissions`);
      setSubmissions(allProjectSubmissions);
      
    } catch (err) {
      console.error("Error fetching project submissions", err);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const canGradeCourse = (courseId: string) => {
    return coursePermissions[courseId] === true;
  };

  const handleBulkGrade = async (grade: number) => {
    if (!selectedSubmissions.length) return;

    // Check permissions for all selected submissions
    const unauthorizedSubmissions = selectedSubmissions.filter(submissionId => {
      const submission = submissions.find(s => s._id === submissionId);
      return submission && !canGradeCourse(submission.courseId._id);
    });

    if (unauthorizedSubmissions.length > 0) {
      showNotification("You don't have permission to grade some of the selected submissions", 'error');
      return;
    }

    if (!confirm(`Give ${grade}% to ${selectedSubmissions.length} submissions?`)) return;
      try {
        const token = localStorage.getItem("token");
        await Promise.all(
          selectedSubmissions.map(submissionId =>
            fetch(`${API_BASE}/api/submissions/${submissionId}/grade`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
              },
              body: JSON.stringify({ grade, feedback: "Bulk graded" }),
            })
          )
        );

        // Refresh submissions
        await fetchProjectSubmissions();
        setSelectedSubmissions([]);
        alert(`Successfully graded ${selectedSubmissions.length} submissions`);
      } catch (error) {
        console.error("Error in bulk grading:", error);
        alert("Error in bulk grading");
      }
  };

  const handleGradeSubmission = async (submissionId: string, grade: number, feedback: string) => {
    const submission = submissions.find(s => s._id === submissionId);
    if (!submission) return;

    if (!canGradeCourse(submission.courseId._id)) {
      showNotification("You don't have permission to grade projects for this course", 'error');
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/submissions/${submissionId}/grade`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          grade,
          feedback
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to grade submission");
      }

      // Update local state
      setSubmissions(prev => 
        prev.map(sub => 
          sub._id === submissionId 
            ? { ...sub, grade, feedback }
            : sub
        )
      );

      // Show success message
      alert("Submission graded successfully!");
    } catch (error) {
      console.error("Error grading submission:", error);
      throw error;
    }
  };

  // Open submission for viewing/grading
  const openSubmission = (submission: ProjectSubmission) => {
    if (!canGradeCourse(submission.courseId._id)) {
      showNotification("You don't have permission to view or grade projects for this course", 'error');
      return;
    }
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSubmission(null);
  };

  const getStatusBadge = (submission: ProjectSubmission) => {
    if (submission.grade !== undefined) {
      return { color: 'bg-green-100 text-green-800', text: 'Reviewed', icon: FaCheckCircle };
    }
    
    const submittedDate = new Date(submission.createdAt);
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
    if (filters.status === 'late') {
      const submittedDate = new Date(submission.createdAt);
      const dueDate = submission.courseId.project?.dueDate ? new Date(submission.courseId.project.dueDate) : null;
      if (!dueDate || submittedDate <= dueDate) return false;
    }
    
    if (filters.search && !submission.studentId.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !submission.courseId.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Bulk action handlers
  const handleBulkSelectAll = () => {
    if (selectedSubmissions.length === filteredSubmissions.length) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(filteredSubmissions.map(sub => sub._id));
    }
  };

  const handleExportSubmissions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/submissions/export?type=projects`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'project-submissions.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        alert('Export started successfully!');
      } else {
        alert('Export failed. Please try again.');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting submissions');
    }
  };

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
          <button 
            onClick={handleExportSubmissions}
            className="px-4 py-2 bg-lfc-red text-white rounded-lg hover:bg-lfc-gold-dark flex items-center"
          >
            <FaDownload className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedSubmissions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-blue-800 font-medium">
                {selectedSubmissions.length} submissions selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkGrade(100)}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Grade 100%
                </button>
                <button
                  onClick={() => handleBulkGrade(85)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Grade 85%
                </button>
                <button
                  onClick={() => handleBulkGrade(70)}
                  className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                >
                  Grade 70%
                </button>
                <button
                  onClick={() => handleBulkGrade(0)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Grade 0%
                </button>
              </div>
            </div>
            <button
              onClick={() => setSelectedSubmissions([])}
              className="text-blue-800 hover:text-blue-900 text-sm"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

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
            {Array.from(new Set(submissions.map(s => s.courseId.title))).map(title => (
              <option key={title} value={title}>{title}</option>
            ))}
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
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-yt-text-dark">Project Submissions</h3>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-sm text-yt-text-gray">
                <input
                  type="checkbox"
                  checked={selectedSubmissions.length === filteredSubmissions.length && filteredSubmissions.length > 0}
                  onChange={handleBulkSelectAll}
                  className="rounded border-yt-light-border"
                />
                <span>Select all</span>
              </label>
            </div>
          </div>
        </div>

        <div className="divide-y divide-yt-light-border">
          {filteredSubmissions.length === 0 ? (
            <div className="p-8 text-center text-yt-text-gray">
              No project submissions found matching your filters.
            </div>
          ) : (
            filteredSubmissions.map((submission) => {
              const status = getStatusBadge(submission);
              const StatusIcon = status.icon;
              const FileTypeIcon = getFileTypeIcon(submission);
              
              return (
                <div key={submission._id} className="p-4 hover:bg-yt-light-hover transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedSubmissions.includes(submission._id)}
                        onChange={() => toggleSubmissionSelection(submission._id)}
                        className="rounded border-yt-light-border"
                      />
                      
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
                          <span>Submitted: {new Date(submission.createdAt).toLocaleDateString()}</span>
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
                      <button
                        onClick={() => openSubmission(submission)}
                        className="p-2 text-yt-text-gray hover:text-lfc-red hover:bg-red-50 rounded-lg transition-colors"
                        title="Grade Project"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add the modal */}
      <ProjectSubmissionModal
        submission={selectedSubmission}
        isOpen={isModalOpen}
        onClose={closeModal}
        onGrade={handleGradeSubmission}
      />
    </div>
  );
}