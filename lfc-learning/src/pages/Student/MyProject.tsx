// src/pages/Dashboard/MyProject.tsx - FIXED
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

interface Project {
  title: string;
  instructions: string;
  dueDate: string;
  submissionTypes: string[];
  materials: Array<{
    url: string;
    name: string;
    type: string;
  }>;
}

interface ProjectWithProgress {
  project: Project;
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
  };
  progress: {
    submitted: boolean;
    graded: boolean;
    grade?: number;
  };
}

export default function MyProject() {
  const [projects, setProjects] = useState<ProjectWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const [coursesRes, enrollmentsRes] = await Promise.all([
        fetch(`${API_BASE}/api/courses`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/enrollments/my`, { headers: { "Authorization": `Bearer ${token}` } })
      ]);
      
      if (coursesRes.ok && enrollmentsRes.ok) {
        const courses = await coursesRes.json();
        const enrollments = await enrollmentsRes.json();
        
        // Filter courses that have projects and create project objects
        const allProjects: ProjectWithProgress[] = courses
          .filter((course: any) => {
            // Get enrolled course IDs
            const enrolledCourseIds = new Set(enrollments.map((e: any) => e.course?._id).filter(Boolean));
            return course.project && enrolledCourseIds.has(course._id);
          })
          .map((course: any) => {
            // Find enrollment for this course
            const enrollment = enrollments.find((e: any) => e.course?._id === course._id);
            
            // Get project progress from enrollment
            const projectProgress = enrollment?.projectProgress || {
              submitted: false,
              reviewed: false,
              score: 0,
              feedback: ''
            };

            return {
              project: course.project,
              course: {
                _id: course._id,
                title: course.title,
                thumbnail: course.thumbnail
              },
              progress: {
                submitted: projectProgress.submitted || false,
                graded: projectProgress.reviewed || false,
                grade: projectProgress.score || undefined
              }
            };
          });
        
        setProjects(allProjects);
      } else {
        console.error("Failed to fetch data");
      }
    } catch (err) {
      console.error("Error fetching projects", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter projects based on selected filter
  const filteredProjects = projects.filter(projectItem => {
    switch (filter) {
      case 'pending':
        return !projectItem.progress.submitted;
      case 'submitted':
        return projectItem.progress.submitted && !projectItem.progress.graded;
      case 'graded':
        return projectItem.progress.graded;
      default:
        return true;
    }
  });

  const getStatusBadge = (projectItem: ProjectWithProgress) => {
    if (projectItem.progress.graded) {
      return { 
        color: 'bg-green-100 text-green-800', 
        text: `Graded: ${projectItem.progress.grade}%`, 
        icon: FaCheckCircle 
      };
    }
    if (projectItem.progress.submitted) {
      return { 
        color: 'bg-blue-100 text-blue-800', 
        text: 'Submitted', 
        icon: FaCheckCircle 
      };
    }
    if (projectItem.project.dueDate && new Date(projectItem.project.dueDate) < new Date()) {
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-yt-text-dark">My Projects</h1>
          <p className="text-yt-text-gray">Manage and submit your course projects</p>
        </div>
        <span className="text-yt-text-gray">
          {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        {[
          { key: 'all', label: 'All Projects', count: projects.length },
          { key: 'pending', label: 'Pending', count: projects.filter(p => !p.progress.submitted).length },
          { key: 'submitted', label: 'Submitted', count: projects.filter(p => p.progress.submitted && !p.progress.graded).length },
          { key: 'graded', label: 'Graded', count: projects.filter(p => p.progress.graded).length }
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

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white p-8 rounded-lg text-center border border-yt-light-border">
          <FaFileAlt className="text-4xl text-yt-text-gray mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No projects found</h3>
          <p className="text-yt-text-gray mb-4">
            {filter === 'all' 
              ? "You don't have any projects yet." 
              : `No ${filter} projects at the moment.`}
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
          {filteredProjects.map((projectItem) => {
            const status = getStatusBadge(projectItem);
            const StatusIcon = status.icon;
            
            return (
                <Link
                  key={projectItem.course._id}
                  to={`/dashboard/project/${projectItem.course._id}`} // Changed from /projects/ to /project/
                  className="bg-white rounded-lg shadow-sm border border-yt-light-border p-6 hover:shadow-md transition-shadow block"
                >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-yt-text-dark">
                        {projectItem.project.title}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        <StatusIcon className="mr-1" size={12} />
                        {status.text}
                      </span>
                    </div>
                    
                    <p className="text-yt-text-gray text-sm mb-3 line-clamp-2">
                      {projectItem.project.instructions}
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-yt-text-gray">
                      <span className="flex items-center">
                        <FaBook className="mr-1" />
                        {projectItem.course.title}
                      </span>
                      {projectItem.project.dueDate && (
                        <span className="flex items-center">
                          <FaCalendar className="mr-1" />
                          Due: {new Date(projectItem.project.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <FaArrowRight className="text-yt-text-gray ml-4 flex-shrink-0 mt-1" />
                </div>

                {/* Progress bar for graded projects */}
                {projectItem.progress.graded && projectItem.progress.grade && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-yt-text-gray mb-1">
                      <span>Grade</span>
                      <span>{projectItem.progress.grade}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-lfc-gold transition-all duration-300"
                        style={{ width: `${projectItem.progress.grade}%` }}
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