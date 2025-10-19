// src/pages/Admin/Assignments.tsx
import { useState, useEffect } from "react";
import { 
  FaSearch, 
  FaFilter, 
  FaDownload, 
  FaEdit, 
  FaChartBar,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFileAlt,
  FaLock
} from "react-icons/fa";
import AssignmentSubmissionModal from "./AssignmentSubmissionModal";
import { useNotification } from "../../../hooks/useNotification";

interface AssignmentSubmission {
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
    instructor: {
      name: string;
    };
  };
  assignmentId?: {
    _id: string;
    title: string;
    dueDate: string;
    instructions?: string;
    maxPoints?: number;
  };
}

export default function Assignments() {
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    course: 'all',
    search: ''
  });
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coursePermissions, setCoursePermissions] = useState<Record<string, boolean>>({});

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchAssignmentSubmissions();
  }, []);

  const fetchAssignmentSubmissions = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // First, get all courses to find which ones have assignments
      const coursesRes = await fetch(`${API_BASE}/api/courses`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!coursesRes.ok) {
        console.error("Failed to fetch courses");
        setSubmissions([]);
        return;
      }

      const courses = await coursesRes.json();
      
      // Filter courses that have assignments
      const coursesWithAssignments = courses.filter((course: any) => 
        course.assignments && course.assignments.length > 0
      );
      
      console.log(`📊 Found ${coursesWithAssignments.length} courses with assignments`);
      
      // Check permissions for each course
      await checkPermissionsForCourses(coursesWithAssignments);
      
      // Fetch assignment submissions for each course
      const allAssignmentSubmissions: AssignmentSubmission[] = [];
      
      for (const course of coursesWithAssignments) {
        try {
          const submissionRes = await fetch(
            `${API_BASE}/api/submissions/admin/courses/${course._id}/submissions`,
            {
              headers: { "Authorization": `Bearer ${token}` }
            }
          );
          
          if (submissionRes.ok) {
            const data = await submissionRes.json();
            
            // Filter only assignment submissions (not projects)
            const assignmentSubmissions = data.submissions?.filter((submission: any) => 
              submission.assignmentId && !submission.projectId
            ).map((submission: any) => ({
              ...submission,
              courseId: {
                _id: course._id,
                title: course.title,
                instructor: course.instructor
              },
              // Find the specific assignment details
              assignmentId: course.assignments?.find((a: any) => a._id === submission.assignmentId)
            })) || [];
            
            allAssignmentSubmissions.push(...assignmentSubmissions);
          }
        } catch (err) {
          console.error(`Error fetching submissions for course ${course._id}:`, err);
        }
      }
      
      console.log(`✅ Loaded ${allAssignmentSubmissions.length} assignment submissions`);
      setSubmissions(allAssignmentSubmissions);
      
    } catch (err) {
      console.error("Error fetching assignment submissions", err);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

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

  const canGradeCourse = (courseId: string) => {
    return coursePermissions[courseId] === true;
  };

  const handleGradeSubmission = async (submissionId: string, grade: number, feedback: string) => {
    const submission = submissions.find(s => s._id === submissionId);
    if (!submission) return;

    if (!canGradeCourse(submission.courseId._id)) {
      showNotification("You don't have permission to grade assignments for this course", 'error');
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
      alert("Assignment graded successfully!");
    } catch (error) {
      console.error("Error grading submission:", error);
      throw error;
    }
  };

  // Open submission for viewing/grading
  const openSubmission = (submission: AssignmentSubmission) => {
    if (!canGradeCourse(submission.courseId._id)) {
      showNotification("You don't have permission to view or grade assignments for this course", 'error');
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

const getStatusBadge = (submission: AssignmentSubmission) => {
  if (submission.grade !== undefined) {
    return { 
      color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300', 
      text: 'Graded', 
      icon: FaCheckCircle 
    };
  }
  
  const submittedDate = new Date(submission.createdAt);
  const dueDate = submission.assignmentId ? new Date(submission.assignmentId.dueDate) : null;
  
  if (dueDate && submittedDate > dueDate) {
    return { 
      color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300', 
      text: 'Late', 
      icon: FaExclamationTriangle 
    };
  }
  
  return { 
    color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300', 
    text: 'Pending Review', 
    icon: FaClock 
  };
};

  const getFileTypeIcon = (submission: AssignmentSubmission) => {
    if (submission.submission.file) {
      return FaFileAlt;
    }
    if (submission.submission.link) {
      return FaFileAlt; // Using same icon for consistency
    }
    return FaFileAlt;
  };

  const filteredSubmissions = submissions.filter(submission => {
    if (filters.status === 'graded' && submission.grade === undefined) return false;
    if (filters.status === 'pending' && submission.grade !== undefined) return false;
    if (filters.status === 'late') {
      const dueDate = submission.assignmentId ? new Date(submission.assignmentId.dueDate) : null;
      const submittedDate = new Date(submission.createdAt);
      if (!dueDate || submittedDate <= dueDate) return false;
    }
    
    if (filters.search && !submission.studentId.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !submission.courseId.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !submission.assignmentId?.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-[var(--bg-tertiary)] rounded-lg"></div>
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
          <button className="px-4 py-2 bg-lfc-red text-gray-200 rounded-lg hover:bg-lfc-red-hover flex items-center">
            <FaDownload className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-primary)] p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-yt-text-gray" />
            <input
              type="text"
              placeholder="Search students, courses, or assignments..."
              className="w-full pl-10 pr-4 py-2 border border-[var(--border-primary)] rounded-lg focus:outline-none focus:border-lfc-red"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          
          <select
            className="border border-[var(--border-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-lfc-red"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="graded">Graded</option>
            <option value="late">Late Submissions</option>
          </select>

          <select
            className="border border-[var(--border-primary)] rounded-lg px-3 py-2 focus:outline-none focus:border-lfc-red"
            value={filters.course}
            onChange={(e) => setFilters({...filters, course: e.target.value})}
          >
            <option value="all">All Courses</option>
            {/* Populate with unique courses */}
            {Array.from(new Set(submissions.map(s => s.courseId.title))).map(courseTitle => (
              <option key={courseTitle} value={courseTitle}>{courseTitle}</option>
            ))}
          </select>

          <button className="px-4 py-2 border border-[var(--border-primary)] rounded-lg hover:bg-[var(--hover-bg)] flex items-center justify-center text-[var(--text-primary)]">
            <FaFilter className="mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[var(--bg-elevated)] p-4 rounded-lg border border-[var(--border-primary)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yt-text-gray">Total Assignments</p>
              <p className="text-2xl font-bold text-yt-text-dark">{submissions.length}</p>
            </div>
            <FaFileAlt className="text-lfc-red text-xl" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-[var(--bg-elevated)] p-4 rounded-lg border border-[var(--border-primary)]">
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
        
        <div className="bg-white dark:bg-[var(--bg-elevated)] p-4 rounded-lg border border-[var(--border-primary)]">
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
        
        <div className="bg-white dark:bg-[var(--bg-elevated)] p-4 rounded-lg border border-[var(--border-primary)]">
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
      <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-primary)]">
        <div className="p-4 border-b border-yt-light-border">
          <h3 className="font-semibold text-yt-text-dark">Assignment Submissions</h3>
        </div>

        <div className="divide-y divide-yt-light-border">
          {filteredSubmissions.length === 0 ? (
            <div className="p-8 text-center text-yt-text-gray">
              {submissions.length === 0 
                ? "No assignment submissions found." 
                : "No submissions match your current filters."
              }
            </div>
          ) : (
            filteredSubmissions.map((submission) => {
              const status = getStatusBadge(submission);
              const StatusIcon = status.icon;
              const FileTypeIcon = getFileTypeIcon(submission);
              const canGrade = canGradeCourse(submission.courseId._id);
              
              return (
                <div key={submission._id} className={`p-4 transition-colors ${
                  canGrade ? 'hover:bg-yt-light-hover' : 'bg-gray-50 dark:bg-[var(--bg-secondary)]'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                        canGrade ? 'bg-lfc-red' : 'bg-gray-400'
                      }`}>
                        <FileTypeIcon />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-yt-text-dark truncate">
                            {submission.studentId.name}
                            {!canGrade && (
                              <FaLock className="inline ml-2 text-gray-400" size={12} />
                            )}
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
                          {submission.courseId.title} • {submission.assignmentId?.title || 'Assignment'}
                          {!canGrade && (
                            <span className="text-xs text-gray-500 ml-2">(Read Only)</span>
                          )}
                        </p>
                          
                        <div className="flex items-center space-x-4 text-xs text-yt-text-gray mt-1">
                          <span>Submitted: {new Date(submission.createdAt).toLocaleDateString()}</span>
                          {submission.assignmentId?.dueDate && (
                            <span>Due: {new Date(submission.assignmentId.dueDate).toLocaleDateString()}</span>
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
                        className={`p-2 rounded-lg transition-colors ${
                          canGrade 
                            ? 'text-yt-text-gray hover:text-lfc-red hover:bg-red-50' 
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                        title={canGrade ? "View and Grade Assignment" : "No permission to grade"}
                        disabled={!canGrade}
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
      <AssignmentSubmissionModal
        submission={selectedSubmission}
        isOpen={isModalOpen}
        onClose={closeModal}
        onGrade={handleGradeSubmission}
      />
    </div>
  );
}