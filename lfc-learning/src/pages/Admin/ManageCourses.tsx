// src/pages/Admin/ManageCourses.tsx
import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaEye, FaEyeSlash, FaSave } from "react-icons/fa";
import CourseEditor from "../../components/Admin/CourseEditor";

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
}

export default function ManageCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [visibilityUpdates, setVisibilityUpdates] = useState<Record<string, boolean>>({});

  // put this above your component
const API_BASE = "http://localhost:5000";

function resolveImageUrl(url?: string) {
  if (!url) return ""; // fallback handled later
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
}

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/courses", {
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
      }
    } catch (err) {
      console.error("Error fetching courses", err);
    } finally {
      setLoading(false);
    }
  };

    // Also fix the handleVisibilityChange function to ensure proper boolean values
    const handleVisibilityChange = (courseId: string, isPublic: boolean) => {
      setVisibilityUpdates(prev => ({
        ...prev,
        [courseId]: Boolean(isPublic) // Ensure it's a boolean
      }));
    };

    const saveVisibilityChanges = async () => {
      setSaving(true);
      try {
        const token = localStorage.getItem("token");

        // Build updates ONLY for courses that changed
        const updates = courses
          .filter((c) => visibilityUpdates[c._id] !== c.isPublic)
          .map((c) => ({
            courseId: c._id,
            isPublic: visibilityUpdates[c._id],
          }));

        if (updates.length === 0) {
          alert("No visibility changes to save.");
          setSaving(false);
          return;
        }

        const res = await fetch("http://localhost:5000/api/courses/visibility", {
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
          fetchCourses(); // Refresh to get updated data
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
    setSelectedCourseId(courseId);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
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
    fetchCourses(); // Refresh the list
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
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-yt-light-hover rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-yt-text-dark">Manage Courses</h1>
        <button
          onClick={saveVisibilityChanges}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-lfc-red text-white rounded-md hover:bg-lfc-gold-dark disabled:opacity-50"
        >
          <FaSave className="mr-2" />
          {saving ? "Saving..." : "Save Visibility Changes"}
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white p-8 rounded-lg text-center border border-yt-light-border">
          <p className="text-yt-text-gray mb-4">No courses found.</p>
          <button className="px-4 py-2 bg-lfc-red text-white rounded-md hover:bg-lfc-gold-dark">
            Create Your First Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-lg shadow-sm border border-yt-light-border overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Thumbnail */}
              <div className="h-48 bg-yt-light-hover overflow-hidden">
                {course.thumbnail ? (
                  <img
                    src={resolveImageUrl(course.thumbnail)}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-yt-text-gray">
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
                  <h3 className="font-semibold text-lg text-yt-text-dark line-clamp-2">
                    {course.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditCourse(course._id)}
                      className="text-yt-text-gray hover:text-blue-500"
                      title="Edit course"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      className="text-yt-text-gray hover:text-lfc-red"
                      title="Delete course"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <p className="text-yt-text-gray text-sm mb-3 line-clamp-3">
                  {course.description}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <span className="inline-block bg-yt-light-hover px-2 py-1 rounded text-xs text-yt-text-dark">
                    {course.categories[0]}
                  </span>
                  <span className="inline-block bg-yt-light-hover px-2 py-1 rounded text-xs text-yt-text-dark">
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
                    <div className="w-8 h-8 rounded-full bg-lfc-gold flex items-center justify-center mr-2">
                      <span className="text-white text-sm font-medium">
                        {course.instructor?.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                  <span className="text-sm text-yt-text-dark">
                    {course.instructor?.name || 'Unknown Instructor'}
                  </span>
                </div>

                {/* Visibility Toggle */}
                <div className="flex items-center justify-between pt-3 border-t border-yt-light-border">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={visibilityUpdates[course._id] || false}
                        onChange={(e) => handleVisibilityChange(course._id, e.target.checked)}
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${
                        visibilityUpdates[course._id] ? 'bg-lfc-red' : 'bg-gray-300'
                      }`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        visibilityUpdates[course._id] ? 'transform translate-x-4' : ''
                      }`}></div>
                    </div>
                    <span className="ml-2 text-sm font-medium text-yt-text-dark">
                      {visibilityUpdates[course._id] ? <FaEye /> : <FaEyeSlash />}
                      {visibilityUpdates[course._id] ? ' Public' : ' Private'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}