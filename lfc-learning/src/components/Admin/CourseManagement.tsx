import { useState, useEffect } from "react";
import { FaPlus, FaUserPlus, FaFileExport, FaSearch, FaSync } from "react-icons/fa";
import CourseFormModal from "./CourseFormModal";

interface Course {
  _id: string;
  title: string;
  type: string;
  level: string;
  isPublic: boolean;
  enrolledStudents: number;
  progress: number;
  createdAt: string;
}

export default function CourseManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");
  const [enrollCourseId, setEnrollCourseId] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
      }
    } catch (err) {
      console.error("Failed to fetch courses", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (data: any) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data.courseInfo),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchCourses(); // Refresh the list
        alert("Course created successfully!");
      } else {
        alert("Failed to create course");
      }
    } catch (err) {
      console.error("Error creating course", err);
      alert("Error creating course");
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedCourses.length === 0) {
      alert("Please select an action and at least one course");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      switch (bulkAction) {
        case "publish":
          await Promise.all(
            selectedCourses.map(id =>
              fetch(`${API_BASE}/api/courses/${id}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ isPublic: true }),
              })
            )
          );
          break;
        
        case "unpublish":
          await Promise.all(
            selectedCourses.map(id =>
              fetch(`${API_BASE}/api/courses/${id}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ isPublic: false }),
              })
            )
          );
          break;
        
        case "delete":
          if (!confirm(`Delete ${selectedCourses.length} course(s)? This cannot be undone.`)) return;
          await Promise.all(
            selectedCourses.map(id =>
              fetch(`${API_BASE}/api/courses/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              })
            )
          );
          break;
      }

      setBulkAction("");
      setSelectedCourses([]);
      fetchCourses();
      alert("Bulk action completed successfully!");
    } catch (err) {
      console.error("Bulk action failed", err);
      alert("Failed to perform bulk action");
    }
  };

  const handleEnrollAllUsers = async () => {
    if (!enrollCourseId) {
      alert("Please select a course first");
      return;
    }

    if (!confirm("Enroll ALL users in this course?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/enrollments/enroll-all/${enrollCourseId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("All users enrolled successfully!");
      } else if (res.status === 404) {
        alert("Enroll-all endpoint not available");
      } else {
        alert("Failed to enroll all users");
      }
    } catch (err) {
      console.error("Enrollment error", err);
      alert("Error enrolling users");
    }
  };

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/courses/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'courses-export.json';
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Export feature not available");
      }
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export data");
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectCourse = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedCourses(
      selectedCourses.length === filteredCourses.length
        ? []
        : filteredCourses.map(c => c._id)
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header - Mobile optimized */}
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Course Management</h2>
        <button
          onClick={fetchCourses}
          className="p-2 text-gray-600 hover:text-lfc-red hover:bg-gray-100 rounded-lg"
          title="Refresh courses"
        >
          <FaSync />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Quick Actions - Stack on mobile */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="bg-lfc-red hover:bg-red-700 text-white py-3 px-4 rounded-lg flex items-center justify-center font-medium transition-colors text-sm"
            onClick={() => setIsModalOpen(true)}
          >
            <FaPlus className="mr-2" /> New Course
          </button>

          <button
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg flex items-center justify-center font-medium transition-colors text-sm"
            onClick={handleExportData}
          >
            <FaFileExport className="mr-2" /> Export Data
          </button>
        </div>

        {/* Search and Selection Header - Mobile optimized */}
        <div className="border rounded-lg">
          <div className="p-3 border-b bg-gray-50 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedCourses.length === filteredCourses.length && filteredCourses.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-gray-300 w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                {selectedCourses.length} selected
              </span>
            </div>
            
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                className="pl-10 pr-4 py-2 border rounded-lg text-sm w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Course List - Mobile optimized */}
          <div className="max-h-80 overflow-y-auto">
            {filteredCourses.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                {searchTerm ? "No courses match your search" : "No courses found"}
              </div>
            ) : (
              filteredCourses.map(course => (
                <div
                  key={course._id}
                  className="p-3 border-b hover:bg-gray-50 flex items-start space-x-3"
                >
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course._id)}
                    onChange={() => toggleSelectCourse(course._id)}
                    className="rounded border-gray-300 w-4 h-4 mt-1 flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-1">
                      <h3 className="font-medium text-gray-900 text-sm leading-tight break-words">
                        {course.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap flex-shrink-0 ${
                        course.isPublic 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {course.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-gray-600">
                      <span className="truncate">{course.type}</span>
                      <span className="hidden xs:inline">•</span>
                      <span>{course.level}</span>
                      <span className="hidden xs:inline">•</span>
                      <span>{course.enrolledStudents || 0} students</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bulk Actions - Mobile optimized */}
        {selectedCourses.length > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2 text-sm">Bulk Actions</h3>
            <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:space-x-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm w-full sm:flex-1"
              >
                <option value="">Select action...</option>
                <option value="publish">Publish Selected</option>
                <option value="unpublish">Unpublish Selected</option>
                <option value="delete">Delete Selected</option>
              </select>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleBulkAction}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium text-sm flex-1"
                >
                  Apply ({selectedCourses.length})
                </button>
                
                <button
                  onClick={() => setSelectedCourses([])}
                  className="text-gray-600 hover:text-gray-800 px-3 py-2 text-sm border rounded-lg"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mass Enrollment - Mobile optimized */}
        <div className="border-t pt-4">
          <h3 className="font-medium text-gray-900 mb-2 text-sm">Mass Enrollment</h3>
          <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:space-x-2">
            <select
              value={enrollCourseId}
              onChange={(e) => setEnrollCourseId(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm w-full sm:flex-1"
            >
              <option value="">Select course for enrollment...</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.title} ({course.enrolledStudents || 0})
                </option>
              ))}
            </select>
            
            <button
              onClick={handleEnrollAllUsers}
              className="bg-lfc-gold hover:bg-yellow-600 text-black px-3 py-2 rounded-lg font-medium text-sm flex items-center justify-center w-full sm:w-auto"
            >
              <FaUserPlus className="mr-2" /> Enroll All
            </button>
          </div>
        </div>

        {isModalOpen && (
          <CourseFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleCreateCourse}
          />
        )}
      </div>
    </div>
  );
}