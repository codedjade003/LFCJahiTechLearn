import { useState, useEffect, useMemo } from "react";
import {
  FaSearch,
  FaUserPlus,
  FaUserMinus,
  FaUsers,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaTimes,
  FaBook,
  FaUser,
  FaGraduationCap,
  FaExclamationTriangle,
} from "react-icons/fa";

interface Enrollment {
  _id: string;
  user: { _id: string; name: string; email: string };
  course: { _id: string; title: string; description?: string };
  enrolledAt: string;
}

interface SelectedItem {
  _id: string;
  name?: string;
  email?: string;
  title?: string;
  description?: string;
}

const UserEnrollmentsTab = () => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [allUsers, setAllUsers] = useState<SelectedItem[]>([]);
  const [allCourses, setAllCourses] = useState<SelectedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Selection states
  const [selectedUsers, setSelectedUsers] = useState<SelectedItem[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<SelectedItem[]>([]);
  const [selectedEnrollments, setSelectedEnrollments] = useState<Set<string>>(new Set());

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [userResults, setUserResults] = useState<any[]>([]);
  const [courseResults, setCourseResults] = useState<any[]>([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showCourseSearch, setShowCourseSearch] = useState(false);

  // UI states
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"enrollments" | "bulk-actions">("enrollments");

  useEffect(() => {
    fetchEnrollments();
    fetchAllUsers();
    fetchAllCourses();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/enrollments/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      const validEnrollments = (data.enrollments || data || []).filter((e: any) => 
        e && e.user && e.course && e.user.name && e.user.email && e.course.title
      );
      setEnrollments(validEnrollments);
    } catch (err) {
      console.error("Error fetching enrollments:", err);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const usersData = data.users || data || [];
        setAllUsers(usersData);
        setUserResults(usersData);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchAllCourses = async () => {
    try {
      setCoursesLoading(true);
      const res = await fetch(`${API_BASE}/api/courses`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAllCourses(data);
        setCourseResults(data); // Initialize with all courses
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setCoursesLoading(false);
    }
  };

  // Search users with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (userSearch.trim()) {
        const filtered = allUsers.filter(user =>
          user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.email?.toLowerCase().includes(userSearch.toLowerCase())
        );
        setUserResults(filtered);
      } else {
        setUserResults(allUsers); // Show all users when search is empty
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [userSearch, allUsers]);

  // Search courses with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (courseSearch.trim()) {
        const filtered = allCourses.filter(course =>
          course.title?.toLowerCase().includes(courseSearch.toLowerCase()) ||
          course.description?.toLowerCase().includes(courseSearch.toLowerCase())
        );
        setCourseResults(filtered);
      } else {
        setCourseResults(allCourses); // Show all courses when search is empty
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [courseSearch, allCourses]);

  // Selection handlers
  const toggleUserSelection = (user: SelectedItem) => {
    setSelectedUsers(prev => {
      const exists = prev.find(u => u._id === user._id);
      if (exists) {
        return prev.filter(u => u._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
    setUserSearch("");
    setShowUserSearch(false);
  };

  const toggleCourseSelection = (course: SelectedItem) => {
    setSelectedCourses(prev => {
      const exists = prev.find(c => c._id === course._id);
      if (exists) {
        return prev.filter(c => c._id !== course._id);
      } else {
        return [...prev, course];
      }
    });
    setCourseSearch("");
    setShowCourseSearch(false);
  };

  const toggleEnrollmentSelection = (enrollmentId: string) => {
    setSelectedEnrollments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(enrollmentId)) {
        newSet.delete(enrollmentId);
      } else {
        newSet.add(enrollmentId);
      }
      return newSet;
    });
  };

  const selectAllEnrollmentsInCourse = (enrollments: Enrollment[]) => {
    setSelectedEnrollments(prev => {
      const newSet = new Set(prev);
      const allSelected = enrollments.every(e => newSet.has(e._id));
      
      if (allSelected) {
        // Deselect all
        enrollments.forEach(e => newSet.delete(e._id));
      } else {
        // Select all
        enrollments.forEach(e => newSet.add(e._id));
      }
      return newSet;
    });
  };

  // Action handlers (keep the same as before)
  const handleEnrollUsers = async () => {
    if (selectedUsers.length === 0 || selectedCourses.length === 0) return;
    
    try {
      for (const user of selectedUsers) {
        for (const course of selectedCourses) {
          await fetch(`${API_BASE}/api/enrollments/enroll`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              userId: user._id,
              courseId: course._id,
            }),
          });
        }
      }
      await fetchEnrollments();
      setSelectedUsers([]);
      setSelectedCourses([]);
    } catch (err) {
      console.error("Error enrolling users:", err);
    }
  };

  const handleBulkEnroll = async () => {
    if (selectedCourses.length === 0) return;
    
    try {
      for (const course of selectedCourses) {
        await fetch(
          `${API_BASE}/api/enrollments/enroll-all/${course._id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }
      await fetchEnrollments();
      setSelectedCourses([]);
    } catch (err) {
      console.error("Error bulk enrolling:", err);
    }
  };

  const handleUnenrollSelected = async () => {
    const enrollmentsToUnenroll = Array.from(selectedEnrollments);
    if (enrollmentsToUnenroll.length === 0) return;
    
    try {
      for (const enrollmentId of enrollmentsToUnenroll) {
        const enrollment = enrollments.find(e => e._id === enrollmentId);
        if (enrollment) {
          await fetch(
            `${API_BASE}/api/enrollments/unenroll/${enrollment.course._id}/${enrollment.user._id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        }
      }
      await fetchEnrollments();
      setSelectedEnrollments(new Set());
    } catch (err) {
      console.error("Error unenrolling:", err);
    }
  };

  const handleBulkUnenroll = async () => {
    if (selectedCourses.length === 0) return;
    
    try {
      for (const course of selectedCourses) {
        await fetch(
          `${API_BASE}/api/enrollments/unenroll-all/${course._id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }
      await fetchEnrollments();
      setSelectedCourses([]);
    } catch (err) {
      console.error("Error bulk unenrolling:", err);
    }
  };

  // UI helpers
  const toggleCourseExpansion = (courseId: string) => {
    setExpandedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((e) => {
      if (!e || !e.user || !e.course) return false;
      
      const matchesSearch =
        (e.user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (e.user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (e.course.title?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [enrollments, searchTerm]);

  const enrollmentsByCourse = useMemo(() => {
    const grouped: { [courseId: string]: Enrollment[] } = {};
    filteredEnrollments.forEach(enrollment => {
      if (!enrollment || !enrollment.course) return;
      const courseId = enrollment.course._id;
      if (!grouped[courseId]) {
        grouped[courseId] = [];
      }
      grouped[courseId].push(enrollment);
    });
    return grouped;
  }, [filteredEnrollments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading enrollments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[var(--bg-secondary)] p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-2xl bg-lfc-red text-white">
            <FaGraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-[var(--text-primary)]">Course Enrollments</h1>
            <p className="text-gray-600 mt-1">Manage user access to courses</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-2xl shadow-sm border border-gray-200 dark:border-[var(--border-primary)] mb-6">
          <div className="flex border-b border-gray-200 dark:border-[var(--border-primary)]">
            <button
              onClick={() => setActiveTab("enrollments")}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === "enrollments"
                  ? "border-lfc-red text-lfc-red"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaUsers className="w-4 h-4" />
              All Enrollments
            </button>
            <button
              onClick={() => setActiveTab("bulk-actions")}
              className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === "bulk-actions"
                  ? "border-lfc-red text-lfc-red"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaUserPlus className="w-4 h-4" />
              Bulk Actions
            </button>
          </div>

          {/* Bulk Actions Tab */}
          {activeTab === "bulk-actions" && (
            <div className="p-6">
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {/* User Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-lfc-red" />
                    <h3 className="font-semibold text-gray-900 dark:text-[var(--text-primary)]">Select Users</h3>
                    {usersLoading && (
                      <span className="text-sm text-gray-500">Loading...</span>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-[var(--bg-secondary)] border border-gray-300 dark:border-[var(--border-secondary)] rounded-xl px-4 py-3">
                        <FaSearch className="text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search users by name or email..."
                          value={userSearch}
                          onChange={(e) => {
                            setUserSearch(e.target.value);
                            setShowUserSearch(true);
                          }}
                          onFocus={() => setShowUserSearch(true)}
                          className="flex-1 bg-transparent outline-none text-gray-900 dark:text-[var(--text-primary)] placeholder-gray-500 dark:placeholder-[var(--text-muted)]"
                        />
                      </div>
                      
                      {showUserSearch && (
                        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-[var(--bg-elevated)] border border-gray-300 dark:border-[var(--border-secondary)] rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          {userResults.length > 0 ? (
                            userResults.map((user) => (
                              <div
                                key={user._id}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:bg-[var(--bg-secondary)] cursor-pointer border-b border-gray-100 dark:border-[var(--border-primary)] last:border-b-0"
                                onClick={() => toggleUserSelection(user)}
                              >
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                  selectedUsers.some(u => u._id === user._id)
                                    ? "bg-lfc-red border-lfc-red"
                                    : "border-gray-300 dark:border-[var(--border-secondary)]"
                                }`}>
                                  {selectedUsers.some(u => u._id === user._id) && (
                                    <div className="w-2 h-2 bg-white dark:bg-[var(--bg-elevated)] rounded-sm" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-[var(--text-primary)]">{user.name}</div>
                                  <div className="text-sm text-gray-600">{user.email}</div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-center text-gray-500">
                              <FaExclamationTriangle className="w-5 h-5 mx-auto mb-2" />
                              No users found
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Display List - All Available Users */}
                    {!showUserSearch && allUsers.length > 0 && (
                      <div className="border border-gray-200 dark:border-[var(--border-primary)] rounded-xl max-h-60 overflow-y-auto">
                        <div className="p-3 bg-gray-50 dark:bg-[var(--bg-secondary)] border-b border-gray-200 dark:border-[var(--border-primary)]">
                          <h4 className="font-medium text-gray-900 dark:text-[var(--text-primary)]">Available Users ({allUsers.length})</h4>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {allUsers.slice(0, 10).map((user) => (
                            <div
                              key={user._id}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:bg-[var(--bg-secondary)] cursor-pointer"
                              onClick={() => toggleUserSelection(user)}
                            >
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                selectedUsers.some(u => u._id === user._id)
                                  ? "bg-lfc-red border-lfc-red"
                                  : "border-gray-300 dark:border-[var(--border-secondary)]"
                              }`}>
                                {selectedUsers.some(u => u._id === user._id) && (
                                  <div className="w-2 h-2 bg-white dark:bg-[var(--bg-elevated)] rounded-sm" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-[var(--text-primary)]">{user.name}</div>
                                <div className="text-sm text-gray-600">{user.email}</div>
                              </div>
                            </div>
                          ))}
                          {allUsers.length > 10 && (
                            <div className="px-4 py-3 text-center text-gray-500 text-sm">
                              ... and {allUsers.length - 10} more users
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Selected Users */}
                    {selectedUsers.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 dark:text-[var(--text-primary)] mb-2">Selected Users ({selectedUsers.length})</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedUsers.map(user => (
                            <div
                              key={user._id}
                              className="flex items-center gap-2 bg-lfc-red bg-opacity-10 text-lfc-red px-3 py-2 rounded-lg text-sm"
                            >
                              <FaUser className="w-3 h-3" />
                              <span>{user.name}</span>
                              <button
                                onClick={() => setSelectedUsers(prev => prev.filter(u => u._id !== user._id))}
                                className="hover:text-red-700"
                              >
                                <FaTimes className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Course Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FaBook className="text-lfc-gold" />
                    <h3 className="font-semibold text-gray-900 dark:text-[var(--text-primary)]">Select Courses</h3>
                    {coursesLoading && (
                      <span className="text-sm text-gray-500">Loading...</span>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-[var(--bg-secondary)] border border-gray-300 dark:border-[var(--border-secondary)] rounded-xl px-4 py-3">
                        <FaSearch className="text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search courses by title..."
                          value={courseSearch}
                          onChange={(e) => {
                            setCourseSearch(e.target.value);
                            setShowCourseSearch(true);
                          }}
                          onFocus={() => setShowCourseSearch(true)}
                          className="flex-1 bg-transparent outline-none text-gray-900 dark:text-[var(--text-primary)] placeholder-gray-500 dark:placeholder-[var(--text-muted)]"
                        />
                      </div>
                      
                      {showCourseSearch && (
                        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-[var(--bg-elevated)] border border-gray-300 dark:border-[var(--border-secondary)] rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          {courseResults.length > 0 ? (
                            courseResults.map((course) => (
                              <div
                                key={course._id}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:bg-[var(--bg-secondary)] cursor-pointer border-b border-gray-100 dark:border-[var(--border-primary)] last:border-b-0"
                                onClick={() => toggleCourseSelection(course)}
                              >
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                  selectedCourses.some(c => c._id === course._id)
                                    ? "bg-lfc-gold border-lfc-gold"
                                    : "border-gray-300 dark:border-[var(--border-secondary)]"
                                }`}>
                                  {selectedCourses.some(c => c._id === course._id) && (
                                    <div className="w-2 h-2 bg-white dark:bg-[var(--bg-elevated)] rounded-sm" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-[var(--text-primary)]">{course.title}</div>
                                  {course.description && (
                                    <div className="text-sm text-gray-600 line-clamp-1">
                                      {course.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-center text-gray-500">
                              <FaExclamationTriangle className="w-5 h-5 mx-auto mb-2" />
                              No courses found
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Display List - All Available Courses */}
                    {!showCourseSearch && allCourses.length > 0 && (
                      <div className="border border-gray-200 dark:border-[var(--border-primary)] rounded-xl max-h-60 overflow-y-auto">
                        <div className="p-3 bg-gray-50 dark:bg-[var(--bg-secondary)] border-b border-gray-200 dark:border-[var(--border-primary)]">
                          <h4 className="font-medium text-gray-900 dark:text-[var(--text-primary)]">Available Courses ({allCourses.length})</h4>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {allCourses.slice(0, 10).map((course) => (
                            <div
                              key={course._id}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:bg-[var(--bg-secondary)] cursor-pointer"
                              onClick={() => toggleCourseSelection(course)}
                            >
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                selectedCourses.some(c => c._id === course._id)
                                  ? "bg-lfc-gold border-lfc-gold"
                                  : "border-gray-300 dark:border-[var(--border-secondary)]"
                              }`}>
                                {selectedCourses.some(c => c._id === course._id) && (
                                  <div className="w-2 h-2 bg-white dark:bg-[var(--bg-elevated)] rounded-sm" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-[var(--text-primary)]">{course.title}</div>
                                {course.description && (
                                  <div className="text-sm text-gray-600 line-clamp-1">
                                    {course.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          {allCourses.length > 10 && (
                            <div className="px-4 py-3 text-center text-gray-500 text-sm">
                              ... and {allCourses.length - 10} more courses
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Selected Courses */}
                    {selectedCourses.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 dark:text-[var(--text-primary)] mb-2">Selected Courses ({selectedCourses.length})</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCourses.map(course => (
                            <div
                              key={course._id}
                              className="flex items-center gap-2 bg-lfc-gold bg-opacity-10 text-lfc-gold px-3 py-2 rounded-lg text-sm"
                            >
                              <FaBook className="w-3 h-3" />
                              <span>{course.title}</span>
                              <button
                                onClick={() => setSelectedCourses(prev => prev.filter(c => c._id !== course._id))}
                                className="hover:text-yellow-700"
                              >
                                <FaTimes className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleEnrollUsers}
                  disabled={selectedUsers.length === 0 || selectedCourses.length === 0}
                  className="flex items-center gap-3 bg-lfc-red text-white px-6 py-3 rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  <FaUserPlus className="w-4 h-4" />
                  Enroll Selected Users to Selected Courses
                </button>
                
                <button
                  onClick={handleBulkEnroll}
                  disabled={selectedCourses.length === 0}
                  className="flex items-center gap-3 bg-lfc-gold text-white px-6 py-3 rounded-xl hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  <FaUsers className="w-4 h-4" />
                  Enroll All Users to Selected Courses
                </button>
                
                <button
                  onClick={handleBulkUnenroll}
                  disabled={selectedCourses.length === 0}
                  className="flex items-center gap-3 bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  <FaTrash className="w-4 h-4" />
                  Unenroll All from Selected Courses
                </button>
              </div>
            </div>
          )}

          {/* Enrollments Tab (keep the same as before) */}
          {activeTab === "enrollments" && (
            <div className="p-6">
              {/* Search Bar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search enrollments by user, email, or course..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[var(--bg-secondary)] border border-gray-300 dark:border-[var(--border-secondary)] rounded-xl focus:ring-2 focus:ring-lfc-red focus:border-transparent outline-none transition-colors"
                  />
                </div>
                
                {selectedEnrollments.size > 0 && (
                  <button
                    onClick={handleUnenrollSelected}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-3 rounded-xl hover:bg-red-700 transition-colors font-medium"
                  >
                    <FaUserMinus className="w-4 h-4" />
                    Unenroll Selected ({selectedEnrollments.size})
                  </button>
                )}
              </div>

              {/* Enrollments List */}
              <div className="space-y-4">
                {Object.entries(enrollmentsByCourse).map(([courseId, courseEnrollments]) => {
                  const course = courseEnrollments[0]?.course;
                  if (!course) return null;
                  
                  const isExpanded = expandedCourses.has(courseId);
                  const allSelected = courseEnrollments.every(e => selectedEnrollments.has(e._id));

                  return (
                    <div key={courseId} className="bg-white dark:bg-[var(--bg-elevated)] border border-gray-200 dark:border-[var(--border-primary)] rounded-xl overflow-hidden">
                      {/* Course Header */}
                      <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-[var(--bg-secondary)] border-b border-gray-200 dark:border-[var(--border-primary)]">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer ${
                          allSelected ? "bg-lfc-red border-lfc-red" : "border-gray-400"
                        }`}
                        onClick={() => selectAllEnrollmentsInCourse(courseEnrollments)}
                        >
                          {allSelected && <div className="w-2 h-2 bg-white dark:bg-[var(--bg-elevated)] rounded-sm" />}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-[var(--text-primary)] text-lg">{course.title}</h3>
                          {course.description && (
                            <p className="text-gray-600 text-sm mt-1">{course.description}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">
                            {courseEnrollments.length} enrolled
                          </span>
                          <button
                            onClick={() => toggleCourseExpansion(courseId)}
                            className="flex items-center gap-2 text-lfc-red hover:text-red-700 font-medium"
                          >
                            {isExpanded ? "Collapse" : "Expand"}
                            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                          </button>
                        </div>
                      </div>

                      {/* Enrolled Users */}
                      {isExpanded && (
                        <div className="divide-y divide-gray-100">
                          {courseEnrollments.map((enrollment) => (
                            <div key={enrollment._id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:bg-[var(--bg-secondary)]">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer ${
                                selectedEnrollments.has(enrollment._id) 
                                  ? "bg-lfc-red border-lfc-red" 
                                  : "border-gray-400"
                              }`}
                              onClick={() => toggleEnrollmentSelection(enrollment._id)}
                              >
                                {selectedEnrollments.has(enrollment._id) && (
                                  <div className="w-2 h-2 bg-white dark:bg-[var(--bg-elevated)] rounded-sm" />
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-[var(--text-primary)]">
                                  {enrollment.user?.name || 'Unknown User'}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {enrollment.user?.email || 'No email'}
                                </div>
                              </div>
                              
                              <div className="text-sm text-gray-500">
                                Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                              </div>
                              
                              <button
                                onClick={() => toggleEnrollmentSelection(enrollment._id)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                  selectedEnrollments.has(enrollment._id)
                                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                              >
                                {selectedEnrollments.has(enrollment._id) ? "Selected" : "Select"}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredEnrollments.length === 0 && (
                  <div className="text-center py-12">
                    <FaUsers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--text-primary)] mb-2">No enrollments found</h3>
                    <p className="text-gray-600">
                      {searchTerm ? "Try adjusting your search terms" : "Get started by enrolling users in courses"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserEnrollmentsTab;