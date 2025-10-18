import { useState, useEffect } from "react";
import { FaPlus, FaUserPlus, FaFileExport, FaSearch, FaSync, FaChevronLeft, FaChevronRight } from "react-icons/fa";
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(3);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Fetch courses on component mount - FIXED like ManageCourses.tsx
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/courses`, {
        headers: { 
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        // Based on ManageCourses.tsx, it expects direct array response
        setCourses(data || []);
      } else {
        console.error("Failed to fetch courses:", res.status);
        setCourses([]);
      }
    } catch (err) {
      console.error("Failed to fetch courses", err);
      setCourses([]);
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
        const errorData = await res.json();
        alert(`Failed to create course: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Error creating course", err);
      alert("Error creating course - check console for details");
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedCourses.length === 0) {
      alert("Please select an action and at least one course");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      let successCount = 0;
      
      for (const id of selectedCourses) {
        try {
          let response;
          
          switch (bulkAction) {
            case "publish":
            case "unpublish":
              // Use the same pattern as ManageCourses.tsx visibility update
              response = await fetch(`${API_BASE}/api/courses/${id}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ 
                  isPublic: bulkAction === "publish" 
                }),
              });
              break;
            
            case "delete":
              response = await fetch(`${API_BASE}/api/courses/${id}`, {
                method: "DELETE",
                headers: { 
                  Authorization: `Bearer ${token}`,
                },
              });
              break;
            
            default:
              continue;
          }

          if (response?.ok) {
            successCount++;
          } else {
            console.error(`Failed to ${bulkAction} course ${id}:`, response?.status);
          }
        } catch (err) {
          console.error(`Failed to process course ${id}:`, err);
        }
      }

      setBulkAction("");
      setSelectedCourses([]);
      fetchCourses();
      
      if (successCount === selectedCourses.length) {
        alert("Bulk action completed successfully!");
      } else {
        alert(`Bulk action partially completed. ${successCount}/${selectedCourses.length} courses processed.`);
      }
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
      
      // Use the exact endpoint from UserEnrollmentsTab
      const res = await fetch(`${API_BASE}/api/enrollments/enroll-all/${enrollCourseId}`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("All users enrolled successfully!");
        fetchCourses(); // Refresh to get updated enrollment counts
      } else {
        console.error("Enroll-all failed:", res.status);
        alert("Failed to enroll all users. The endpoint might not be available.");
      }
    } catch (err) {
      console.error("Enrollment error", err);
      alert("Error enrolling users");
    }
  };

  // SIMPLIFIED Export function - client-side only
  const handleExportData = () => {
    try {
      // Create comprehensive export data
      const exportData = {
        exportedAt: new Date().toISOString(),
        totalCourses: courses.length,
        courses: courses.map(course => ({
          id: course._id,
          title: course.title,
          type: course.type,
          level: course.level,
          isPublic: course.isPublic,
          enrolledStudents: course.enrolledStudents,
          createdAt: course.createdAt,
        }))
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `courses-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert(`Exported ${courses.length} courses successfully!`);
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export data");
    }
  };

  // Filter courses based on search term
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.type && course.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Get current courses for display (3 per page)
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  // Calculate total pages
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  const toggleSelectCourse = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const toggleSelectAll = () => {
    // Only select/deselect currently displayed courses
    const currentCourseIds = currentCourses.map(c => c._id);
    const allCurrentSelected = currentCourseIds.every(id => selectedCourses.includes(id));
    
    if (allCurrentSelected) {
      // Deselect all current courses
      setSelectedCourses(prev => prev.filter(id => !currentCourseIds.includes(id)));
    } else {
      // Select all current courses
      setSelectedCourses(prev => [...new Set([...prev, ...currentCourseIds])]);
    }
  };

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Check if all current courses are selected
  const allCurrentSelected = currentCourses.length > 0 && 
    currentCourses.every(course => selectedCourses.includes(course._id));

  if (loading) {
    return (
      <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg shadow dark:shadow-[var(--shadow-md)] border dark:border-[var(--border-primary)] p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg shadow dark:shadow-[var(--shadow-md)] border dark:border-[var(--border-primary)]">
      {/* Header - Mobile optimized */}
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-primary)]">Course Management</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
            {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
            {searchTerm && ` (filtered from ${courses.length})`}
          </span>
          <button
            onClick={fetchCourses}
            className="p-2 text-gray-600 dark:text-[var(--text-secondary)] hover:text-lfc-red hover:bg-gray-100 dark:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
            title="Refresh courses"
          >
            <FaSync />
          </button>
        </div>
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
            className="bg-gray-100 dark:bg-[var(--bg-tertiary)] hover:bg-gray-200 text-gray-800 dark:text-[var(--text-primary)] py-3 px-4 rounded-lg flex items-center justify-center font-medium transition-colors text-sm"
            onClick={handleExportData}
            disabled={courses.length === 0}
          >
            <FaFileExport className="mr-2" /> 
            {courses.length === 0 ? 'No Data to Export' : 'Export Data'}
          </button>
        </div>

        {/* Search and Selection Header - Mobile optimized */}
        {courses.length > 0 && (
          <div className="border rounded-lg">
            <div className="p-3 border-b bg-gray-50 dark:bg-[var(--bg-secondary)] space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={allCurrentSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] whitespace-nowrap">
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
              {currentCourses.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  {searchTerm ? "No courses match your search" : "No courses found"}
                </div>
              ) : (
                currentCourses.map(course => (
                  <div
                    key={course._id}
                    className="p-3 border-b hover:bg-gray-50 dark:bg-[var(--bg-secondary)] flex items-start space-x-3"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course._id)}
                      onChange={() => toggleSelectCourse(course._id)}
                      className="rounded border-gray-300 w-4 h-4 mt-1 flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-1">
                        <h3 className="font-medium text-gray-900 dark:text-[var(--text-primary)] text-sm leading-tight break-words">
                          {course.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap flex-shrink-0 ${
                          course.isPublic 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 dark:bg-[var(--bg-tertiary)] text-gray-800 dark:text-[var(--text-primary)]'
                        }`}>
                          {course.isPublic ? 'Public' : 'Private'}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-gray-600 dark:text-[var(--text-secondary)]">
                        <span className="truncate">{course.type || 'No type'}</span>
                        <span className="hidden xs:inline">•</span>
                        <span>{course.level || 'No level'}</span>
                        <span className="hidden xs:inline">•</span>
                        <span>{course.enrolledStudents || 0} students</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-3 border-t bg-gray-50 dark:bg-[var(--bg-secondary)] flex items-center justify-between">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-[var(--text-secondary)] hover:text-gray-800 dark:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaChevronLeft className="text-xs" />
                  Previous
                </button>
                
                <span className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-[var(--text-secondary)] hover:text-gray-800 dark:text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            )}
          </div>
        )}

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
                  className="text-gray-600 dark:text-[var(--text-secondary)] hover:text-gray-800 dark:text-[var(--text-primary)] px-3 py-2 text-sm border rounded-lg"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mass Enrollment - Mobile optimized */}
        {courses.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 dark:text-[var(--text-primary)] mb-2 text-sm">Mass Enrollment</h3>
            <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:space-x-2">
              <select
                value={enrollCourseId}
                onChange={(e) => setEnrollCourseId(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm w-full sm:flex-1"
              >
                <option value="">Select course for enrollment...</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.title} ({course.enrolledStudents || 0} students)
                  </option>
                ))}
              </select>
              
              <button
                onClick={handleEnrollAllUsers}
                disabled={!enrollCourseId}
                className="bg-lfc-gold hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-black px-3 py-2 rounded-lg font-medium text-sm flex items-center justify-center w-full sm:w-auto"
              >
                <FaUserPlus className="mr-2" /> Enroll All
              </button>
            </div>
          </div>
        )}

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