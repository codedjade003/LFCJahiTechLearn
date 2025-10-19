// src/pages/Dashboard/MyAssignments.tsx - FIXED
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FaFileAlt, 
  FaCalendar, 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaArrowRight,
  FaBook
} from "react-icons/fa";
import OnboardingTour from "../../components/shared/OnboardingTour";
import { assignmentsTour } from "../../config/onboardingTours";

interface Assignment {
  _id: string;
  title: string;
  instructions: string;
  dueDate: string;
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
  };
}

interface AssignmentWithProgress extends Assignment {
  progress: {
    submitted: boolean;
    graded: boolean;
    score?: number; // Changed from grade to score
    grade?: number; // Keep for backward compatibility
  };
}

export default function MyAssignments() {
  const [assignments, setAssignments] = useState<AssignmentWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem("token");
      const [coursesRes, enrollmentsRes] = await Promise.all([
        fetch(`${API_BASE}/api/courses`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/enrollments/my`, { headers: { "Authorization": `Bearer ${token}` } })
      ]);
      
      if (coursesRes.ok && enrollmentsRes.ok) {
        const courses = await coursesRes.json();
        const enrollments = await enrollmentsRes.json();
        
        // Get enrolled course IDs
        const enrolledCourseIds = new Set(enrollments.map((e: any) => e.course?._id).filter(Boolean));
        
        // Only show assignments from enrolled courses
        const allAssignments: AssignmentWithProgress[] = courses
          .filter((course: any) => enrolledCourseIds.has(course._id))
          .flatMap((course: any) => 
          (course.assignments || []).map((assignment: any) => {
            // Find real progress from enrollments
            const enrollment = enrollments.find((e: any) => e.course?._id === course._id);
            const assignmentProgress = enrollment?.assignmentProgress?.find(
              (ap: any) => ap.assignmentId === assignment._id
            );
            
            // Use score instead of grade, and check both fields
            const progress = assignmentProgress ? {
              submitted: assignmentProgress.submitted || false,
              graded: assignmentProgress.graded || false,
              score: assignmentProgress.score, // This is what's actually stored
              grade: assignmentProgress.score || assignmentProgress.grade // Fallback
            } : { submitted: false, graded: false, score: undefined, grade: undefined };
            
            return {
              ...assignment,
              course: {
                _id: course._id,
                title: course.title,
                thumbnail: course.thumbnail
              },
              progress
            };
          })
        );
        
        setAssignments(allAssignments);
      }
    } catch (err) {
      console.error("Error fetching assignments", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter assignments based on selected filter
  const filteredAssignments = assignments.filter(assignment => {
    switch (filter) {
      case 'pending':
        return !assignment.progress.submitted;
      case 'submitted':
        return assignment.progress.submitted && !assignment.progress.graded;
      case 'graded':
        return assignment.progress.graded;
      default:
        return true;
    }
  });

  const getStatusBadge = (assignment: AssignmentWithProgress) => {
    // Use score first, then fallback to grade
    const displayGrade = assignment.progress.score ?? assignment.progress.grade;
    
    if (assignment.progress.graded && displayGrade !== undefined) {
      return { 
        color: 'bg-green-100 text-green-800', 
        text: `Graded: ${displayGrade}%`, 
        icon: FaCheckCircle 
      };
    }
    if (assignment.progress.submitted) {
      return { 
        color: 'bg-blue-100 text-blue-800', 
        text: 'Submitted', 
        icon: FaCheckCircle 
      };
    }
    if (new Date(assignment.dueDate) < new Date()) {
      return { 
        color: 'bg-red-100 text-red-800', 
        text: 'Overdue', 
        icon: FaExclamationTriangle 
      };
    }
    return { 
      color: 'bg-yellow-100 text-yellow-800', 
      text: 'Pending', 
      icon: FaClock 
    };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-yt-light-hover rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <OnboardingTour tourKey="assessments" steps={assignmentsTour} />
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-yt-text-dark">My Assignments</h1>
          <p className="text-yt-text-gray">Manage and submit your course assignments</p>
        </div>
        <span className="text-yt-text-gray">
          {filteredAssignments.length} {filteredAssignments.length === 1 ? 'assignment' : 'assignments'}
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-4 mb-6 border-b" data-tour="assignment-filters">
        {[
          { key: 'all', label: 'All Assignments', count: assignments.length },
          { key: 'pending', label: 'Pending', count: assignments.filter(a => !a.progress.submitted).length },
          { key: 'submitted', label: 'Submitted', count: assignments.filter(a => a.progress.submitted && !a.progress.graded).length },
          { key: 'graded', label: 'Graded', count: assignments.filter(a => a.progress.graded).length }
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`pb-3 px-1 font-medium transition-colors border-b-2 ${
              filter === key
                ? 'text-lfc-red border-lfc-red'
                : 'text-yt-text-gray border-transparent hover:text-yt-text-dark'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Assignments Grid */}
      {filteredAssignments.length === 0 ? (
        <div className="bg-white dark:bg-[var(--bg-elevated)] p-8 rounded-lg text-center border border-yt-light-border">
          <FaFileAlt className="text-4xl text-yt-text-gray mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No assignments found</h3>
          <p className="text-yt-text-gray mb-4">
            {filter === 'all' 
              ? "You don't have any assignments yet." 
              : `No ${filter} assignments at the moment.`}
          </p>
          <Link 
            to="/dashboard/courses"
            className="px-4 py-2 bg-lfc-red text-white rounded-md hover:bg-lfc-gold-dark inline-flex items-center"
          >
            <FaBook className="mr-2" />
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredAssignments.map((assignment) => {
            const status = getStatusBadge(assignment);
            const StatusIcon = status.icon;
            // Use score first, then fallback to grade for display
            const displayGrade = assignment.progress.score ?? assignment.progress.grade;
            
            return (
              <Link
                key={assignment._id}
                to={`/dashboard/assignments/${assignment._id}`}
                className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg shadow-sm border border-yt-light-border p-6 hover:shadow-md transition-shadow block"
                data-tour="assignment-card"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-yt-text-dark">
                        {assignment.title}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        <StatusIcon className="mr-1" size={12} />
                        {status.text}
                      </span>
                    </div>
                    
                    <p className="text-yt-text-gray text-sm mb-3 line-clamp-2">
                      {assignment.instructions}
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-yt-text-gray">
                      <span className="flex items-center">
                        <FaBook className="mr-1" />
                        {assignment.course.title}
                      </span>
                      <span className="flex items-center">
                        <FaCalendar className="mr-1" />
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <FaArrowRight className="text-yt-text-gray ml-4 flex-shrink-0 mt-1" />
                </div>

                {/* Progress bar for graded assignments */}
                {assignment.progress.graded && displayGrade !== undefined && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-yt-text-gray mb-1">
                      <span>Grade</span>
                      <span>{displayGrade}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-lfc-gold transition-all duration-300"
                        style={{ width: `${displayGrade}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}