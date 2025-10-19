// src/pages/Admin/ManageCourses.tsx
import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaEye, FaEyeSlash, FaSave, FaLock } from "react-icons/fa";
import CourseEditor from "../../components/Admin/CourseEditor";
import { useNavigate } from "react-router-dom";
import Notification from "../../components/shared/Notification";
import { useNotification } from "../../hooks/useNotification";
import { useCoursePermissions } from "../../hooks/useCousePermissions";

interface Course {
  _id: string;
  title: string;
  description: string;
  categories: string[];
  level: string;
  thumbnail: string;
  instructor: {
    name: string;
    avatar: string;
  };
  isPublic: boolean;
  createdBy: string;
  instructors: Array<{
    userId: string;
    name: string;
    role: string;
  }>;
}

export default function ManageCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [visibilityUpdates, setVisibilityUpdates] = useState<Record<string, boolean>>({});
  const [coursePermissions, setCoursePermissions] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  
  const { notification, showNotification, hideNotification } = useNotification();
  useCoursePermissions();

  const handleCreate = () => {
    navigate('/admin/dashboard/courses/new');
  };

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  function resolveImageUrl(url?: string) {
    if (!url) return "";
    return url.startsWith("http") ? url : `${API_BASE}${url}`;
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/courses`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
        
        // Initialize visibility updates with current isPublic values
        const initialVisibility: Record<string, boolean> = {};
        data.forEach((course: Course) => {
          initialVisibility[course._id] = course.isPublic || false;
        });
        setVisibilityUpdates(initialVisibility);

        // Check permissions for each course
        await checkPermissionsForCourses(data);
      }
    } catch (err) {
      console.error("Error fetching courses", err);
    } finally {
      setLoading(false);
    }
  };

  const checkPermissionsForCourses = async (courses: Course[]) => {
    const token = localStorage.getItem("token");
    const permissionsMap: Record<string, boolean> = {};

    // Check permissions for each course
    for (const course of courses) {
      try {
        const res = await fetch(`${API_BASE}/api/courses/${course._id}/permissions`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          permissionsMap[course._id] = data.canManage || false;
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

  const canManageCourse = (courseId: string) => {
    return coursePermissions[courseId] === true;
  };

  const handleVisibilityChange = (courseId: string, isPublic: boolean) => {
    if (!canManageCourse(courseId)) {
      showNotification("You don't have permission to modify this course", 'error');
      return;
    }

    setVisibilityUpdates(prev => ({
      ...prev,
      [courseId]: Boolean(isPublic)
    }));
  };

  const saveVisibilityChanges = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");

      // Filter updates to only include courses the user can manage
      const updates = courses
        .filter((c) => canManageCourse(c._id) && visibilityUpdates[c._id] !== c.isPublic)
        .map((c) => ({
          courseId: c._id,
          isPublic: visibilityUpdates[c._id],
        }));

      if (updates.length === 0) {
        alert("No visibility changes to save.");
        setSaving(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/courses/visibility`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ updates }),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Visibility settings saved successfully!");
        fetchCourses();
      } else {
        if (res.status === 207) {
          alert(`Some courses failed to update: ${result.message}`);
        } else {
          alert(`Failed to save visibility changes: ${result.message}`);
        }
      }
    } catch (err) {
      console.error("Error saving visibility changes", err);
      alert("Failed to save visibility changes. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditCourse = (courseId: string) => {
    if (!canManageCourse(courseId)) {
      showNotification("You don't have permission to edit this course", 'error');
      return;
    }
    setSelectedCourseId(courseId);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!canManageCourse(courseId)) {
      showNotification("You don't have permission to delete this course", 'error');
      return;
    }

    if (!confirm("Are you sure you want to delete this course?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/courses/${courseId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        alert("Course deleted successfully!");
        fetchCourses();
      }
    } catch (err) {
      console.error("Error deleting course", err);
      alert("Failed to delete course");
    }
  };

  const handleCourseUpdated = () => {
    setSelectedCourseId(null);
    fetchCourses();
  };

  if (selectedCourseId) {
    return (
      <CourseEditor 
        courseId={selectedCourseId} 
        onBack={() => setSelectedCourseId(null)}
        onCourseUpdated={handleCourseUpdated}
      />
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-b dark:from-[var(--bg-primary)] dark:to-[var(--bg-elevated)]">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-[var(--bg-tertiary)] rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b dark:from-[var(--bg-primary)] dark:to-[var(--bg-elevated)]">
      {/* Notification */}
      {notification.visible && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}

      <div className="flex justify-between items-center mb-6 ">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Manage Courses</h1>
        <button
          onClick={saveVisibilityChanges}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-lfc-red dark:bg-red-800 text-gray-200 rounded-md hover:bg-lfc-red-hover dark:hover:bg-red-700 disabled:opacity-50"
        >
          <FaSave className="mr-2" />
          {saving ? "Saving..." : "Save Visibility Changes"}
        </button>
      </div>

      {courses.length === 0 ? (
        <div className=" bg-gray-200 dark:bg-[var(--bg-secondary)] dark:bg-[var(--bg-primary)] p-8 rounded-lg text-center border border-[var(--border-primary)]">
          <p className="text-[var(--text-secondary)] mb-4">No courses found.</p>
          <button 
            onClick={handleCreate}
            className="px-4 py-2 bg-lfc-red dark:bg-red-800 text-gray-200 rounded-md hover:bg-lfc-red-hover dark:hover:bg-red-700"
          >
            Create Your First Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const canManage = canManageCourse(course._id);
            
            return (
              <div
                key={course._id}
                className={` bg-gray-300 dark:bg-[var(--bg-secondary)] rounded-lg shadow-sm border overflow-hidden hover:shadow-md dark:hover:shadow-lg transition-shadow ${
                  !canManage ? 'border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' : 'border-lfc-gold/20 dark:border-red-700/10'
                }`}
              >
                {/* Permission Indicator */}
                {!canManage && (
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 border-b border-yellow-300 dark:border-yellow-700 px-4 py-2 flex items-center text-yellow-800 dark:text-yellow-200 text-sm">
                    <FaLock className="mr-2" />
                    Read Only
                  </div>
                )}

                {/* Thumbnail */}
                <div className="h-48 bg-gray-200 dark:bg-[var(--bg-tertiary)] overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={resolveImageUrl(course.thumbnail)}
                      alt={course.title}
                      className="w-full min-h-full object-cover"
                    />
                  ) : (
                    <div className="w-full min-h-full flex items-center justify-center text-[var(--text-secondary)]">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M3 7h18M3 12h18M3 17h18" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg text-[var(--text-primary)] line-clamp-2">
                      {course.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditCourse(course._id)}
                        className={`${canManage ? 'text-[var(--text-secondary)] hover:text-blue-500' : 'text-[var(--text-muted)] cursor-not-allowed opacity-50'}`}
                        title={canManage ? "Edit course" : "No permission to edit"}
                        disabled={!canManage}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course._id)}
                        className={`${canManage ? 'text-[var(--text-secondary)] hover:text-lfc-red' : 'text-[var(--text-muted)] cursor-not-allowed opacity-50'}`}
                        title={canManage ? "Delete course" : "No permission to delete"}
                        disabled={!canManage}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <p className="text-[var(--text-secondary)] text-sm mb-3 line-clamp-3">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-block bg-gray-200 dark:bg-[var(--bg-tertiary)] px-2 py-1 rounded text-xs text-[var(--text-primary)]">
                      {course.categories[0]}
                    </span>
                    <span className="inline-block bg-gray-200 dark:bg-[var(--bg-tertiary)] px-2 py-1 rounded text-xs text-[var(--text-primary)]">
                      {course.level}
                    </span>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center mb-4">
                    {course.instructor?.avatar ? (
                      <img
                        src={resolveImageUrl(course.instructor.avatar)}
                        alt={course.instructor.name}
                        className="w-8 h-8 rounded-full mr-2 object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-lfc-gold dark:bg-lfc-gold/80 flex items-center justify-center mr-2">
                        <span className="text-white text-sm font-medium">
                          {course.instructor?.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                    <span className="text-sm text-[var(--text-primary)]">
                      {course.instructor?.name || 'Unknown Instructor'}
                    </span>
                  </div>

                  {/* Visibility Toggle */}
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--border-primary)]">
                    <label className={`flex items-center ${canManage ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={visibilityUpdates[course._id] || false}
                          onChange={(e) => handleVisibilityChange(course._id, e.target.checked)}
                          disabled={!canManage}
                        />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${
                          visibilityUpdates[course._id] ? 'bg-lfc-red' : 'bg-gray-400 dark:bg-[var(--bg-tertiary)]'
                        }`}></div>
                        <div className={`absolute left-1 top-1  bg-gray-200 dark:bg-[var(--bg-secondary)] w-4 h-4 rounded-full transition-transform ${
                          visibilityUpdates[course._id] ? 'transform translate-x-4' : ''
                        }`}></div>
                      </div>
                      <span className="ml-2 text-sm font-medium text-[var(--text-primary)]">
                        {visibilityUpdates[course._id] ? <FaEye /> : <FaEyeSlash />}
                        {visibilityUpdates[course._id] ? ' Public' : ' Private'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}