// src/pages/UserEnrollmentsTab.tsx
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
}

const UserEnrollmentsTab = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  // Search states
  const [userQuery, setUserQuery] = useState("");
  const [courseQuery, setCourseQuery] = useState("");
  const [userResults, setUserResults] = useState<any[]>([]);
  const [courseResults, setCourseResults] = useState<any[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);

  // Multi-select states
  const [selectedUsers, setSelectedUsers] = useState<SelectedItem[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<SelectedItem[]>([]);

  // Table states
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/enrollments/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setEnrollments(data);
    } catch (err) {
      console.error("Error fetching enrollments:", err);
    } finally {
      setLoading(false);
    }
  };

  // Search users with debounce
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (userQuery.trim()) {
        try {
          const res = await fetch(
            `http://localhost:5000/api/users?search=${encodeURIComponent(userQuery)}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          const data = await res.json();
          setUserResults(data);
          setShowUserDropdown(true);
        } catch (err) {
          console.error("Error searching users:", err);
        }
      } else {
        setUserResults([]);
        setShowUserDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [userQuery]);

  // Search courses with debounce
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (courseQuery.trim()) {
        try {
          const res = await fetch(
            `http://localhost:5000/api/courses?search=${encodeURIComponent(courseQuery)}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          const data = await res.json();
          setCourseResults(data);
          setShowCourseDropdown(true);
        } catch (err) {
          console.error("Error searching courses:", err);
        }
      } else {
        setCourseResults([]);
        setShowCourseDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [courseQuery]);

  const toggleUserSelection = (user: SelectedItem) => {
    setSelectedUsers(prev => {
      const exists = prev.find(u => u._id === user._id);
      if (exists) {
        return prev.filter(u => u._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
    setUserQuery("");
    setShowUserDropdown(false);
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
    setCourseQuery("");
    setShowCourseDropdown(false);
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u._id !== userId));
  };

  const removeSelectedCourse = (courseId: string) => {
    setSelectedCourses(prev => prev.filter(c => c._id !== courseId));
  };

  const handleEnrollUsers = async () => {
    if (selectedUsers.length === 0 || selectedCourses.length === 0) return;
    
    try {
      for (const user of selectedUsers) {
        for (const course of selectedCourses) {
          await fetch("http://localhost:5000/api/enrollments/enroll", {
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
      fetchEnrollments();
      setSelectedUsers([]);
      setSelectedCourses([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkEnroll = async () => {
    if (selectedCourses.length === 0) return;
    
    try {
      for (const course of selectedCourses) {
        await fetch(
          `http://localhost:5000/api/enrollments/enroll-all/${course._id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }
      fetchEnrollments();
      setSelectedCourses([]);
    } catch (err) {
      console.error(err);
    }
  };

  // Add this new function for unenrolling selected users
  const handleUnenrollSelected = async () => {
    if (selectedUsers.length === 0 || selectedCourses.length === 0) return;
    
    try {
      for (const user of selectedUsers) {
        for (const course of selectedCourses) {
          await fetch(
            `http://localhost:5000/api/enrollments/unenroll/${course._id}/${user._id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        }
      }
      fetchEnrollments();
      setSelectedUsers([]);
      setSelectedCourses([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkUnenroll = async () => {
    if (selectedCourses.length === 0) return;
    
    try {
      for (const course of selectedCourses) {
        await fetch(
          `http://localhost:5000/api/enrollments/unenroll-all/${course._id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }
      fetchEnrollments();
      setSelectedCourses([]);
    } catch (err) {
      console.error(err);
    }
  };

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
      const matchesSearch =
        e.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.course.title.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [enrollments, searchTerm]);

  // Group enrollments by course for better display
  const enrollmentsByCourse = useMemo(() => {
    const grouped: { [courseId: string]: Enrollment[] } = {};
    filteredEnrollments.forEach(enrollment => {
      if (!grouped[enrollment.course._id]) {
        grouped[enrollment.course._id] = [];
      }
      grouped[enrollment.course._id].push(enrollment);
    });
    return grouped;
  }, [filteredEnrollments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-yt-text-gray">Loading enrollments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-yt-light-gray min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-xl border border-yt-light-border p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-full bg-lfc-red text-white">
            <FaUsers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-yt-text-dark">Course Enrollments</h1>
            <p className="text-yt-text-gray text-sm">Manage user course assignments and access</p>
          </div>
        </div>

        {/* Search and Selection Area */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* User Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-yt-text-dark">
              Select Users
            </label>
            <div className="relative">
              <div className="flex items-center gap-2 bg-yt-light-bg border border-yt-light-border rounded-lg px-3 py-2">
                <FaSearch className="text-yt-text-gray flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  onFocus={() => setShowUserDropdown(true)}
                  className="flex-1 bg-transparent outline-none text-yt-text-dark placeholder-yt-text-gray"
                />
              </div>
              
              {showUserDropdown && userResults.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-yt-light-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {userResults.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-yt-light-hover cursor-pointer border-b border-yt-light-border last:border-b-0"
                      onClick={() => toggleUserSelection(user)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.some(u => u._id === user._id)}
                        onChange={() => {}}
                        className="rounded border-yt-light-border text-lfc-gold focus:ring-lfc-gold"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-yt-text-dark">{user.name}</div>
                        <div className="text-xs text-yt-text-gray">{user.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div
                    key={user._id}
                    className="flex items-center gap-2 bg-lfc-gold bg-opacity-10 text-lfc-gold px-3 py-1 rounded-full text-sm"
                  >
                    <span>{user.name}</span>
                    <button
                      onClick={() => removeSelectedUser(user._id)}
                      className="hover:text-red-600"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Course Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-yt-text-dark">
              Select Courses
            </label>
            <div className="relative">
              <div className="flex items-center gap-2 bg-yt-light-bg border border-yt-light-border rounded-lg px-3 py-2">
                <FaSearch className="text-yt-text-gray flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={courseQuery}
                  onChange={(e) => setCourseQuery(e.target.value)}
                  onFocus={() => setShowCourseDropdown(true)}
                  className="flex-1 bg-transparent outline-none text-yt-text-dark placeholder-yt-text-gray"
                />
              </div>
              
              {showCourseDropdown && courseResults.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-yt-light-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {courseResults.map((course) => (
                    <div
                      key={course._id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-yt-light-hover cursor-pointer border-b border-yt-light-border last:border-b-0"
                      onClick={() => toggleCourseSelection(course)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCourses.some(c => c._id === course._id)}
                        onChange={() => {}}
                        className="rounded border-yt-light-border text-lfc-gold focus:ring-lfc-gold"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-yt-text-dark">{course.title}</div>
                        {course.description && (
                          <div className="text-xs text-yt-text-gray line-clamp-1">
                            {course.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Courses */}
            {selectedCourses.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedCourses.map(course => (
                  <div
                    key={course._id}
                    className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{course.title}</span>
                    <button
                      onClick={() => removeSelectedCourse(course._id)}
                      className="hover:text-red-600"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleEnrollUsers}
            disabled={selectedUsers.length === 0 || selectedCourses.length === 0}
            className="flex items-center gap-2 bg-lfc-gold text-white px-4 py-2 rounded-lg hover:bg-lfc-gold-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaUserPlus className="w-4 h-4" />
            Enroll Selected
          </button>
          <button
            onClick={handleBulkEnroll}
            disabled={selectedCourses.length === 0}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaUsers className="w-4 h-4" />
            Enroll All to Selected Courses
          </button>
          <button
            onClick={handleUnenrollSelected}
            disabled={selectedUsers.length === 0 || selectedCourses.length === 0}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaUserMinus className="w-4 h-4" />
            Unenroll Selected
          </button>
          <button
            onClick={handleBulkUnenroll}
            disabled={selectedCourses.length === 0}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaTrash className="w-4 h-4" />
            Unenroll All from Selected Courses
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-yt-light-border shadow-sm">
        {/* Table Header */}
        <div className="p-6 border-b border-yt-light-border">
          <div className="flex items-center gap-3">
            <FaSearch className="text-yt-text-gray" />
            <input
              type="text"
              placeholder="Search enrollments by user name, email, or course title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-yt-text-dark placeholder-yt-text-gray"
            />
          </div>
        </div>

        {/* Enrollment Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-yt-text-light uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-yt-text-light uppercase tracking-wider">
                  Enrolled Users
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-yt-text-light uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-yt-light-border">
              {Object.entries(enrollmentsByCourse).map(([courseId, courseEnrollments]) => {
                const course = courseEnrollments[0].course;
                const isExpanded = expandedCourses.has(courseId);
                const visibleUsers = isExpanded ? courseEnrollments : courseEnrollments.slice(0, 3);

                return (
                  <tr key={courseId} className="hover:bg-yt-light-hover">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-yt-text-dark">
                        {course.title}
                      </div>
                      {course.description && (
                        <div className="text-xs text-yt-text-gray mt-1">
                          {course.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {visibleUsers.map((enrollment) => (
                          <div key={enrollment._id} className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-yt-text-dark">
                                {enrollment.user.name}
                              </div>
                              <div className="text-xs text-yt-text-gray">
                                {enrollment.user.email}
                              </div>
                            </div>
                            <div className="text-xs text-yt-text-gray">
                              {new Date(enrollment.enrolledAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                        {courseEnrollments.length > 3 && (
                          <button
                            onClick={() => toggleCourseExpansion(courseId)}
                            className="flex items-center gap-1 text-lfc-gold text-sm hover:underline"
                          >
                            {isExpanded ? (
                              <>
                                <FaChevronUp className="w-3 h-3" />
                                Show Less
                              </>
                            ) : (
                              <>
                                <FaChevronDown className="w-3 h-3" />
                                Show {courseEnrollments.length - 3} more
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedCourses([{ _id: course._id, title: course.title }]);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Select Course
                        </button>
                        <button
                          onClick={() => handleBulkUnenroll()}
                          className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm"
                        >
                          <FaUserMinus className="w-3 h-3" />
                          Unenroll All
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredEnrollments.length === 0 && (
            <div className="text-center py-12">
              <div className="text-yt-text-gray text-lg">No enrollments found</div>
              <div className="text-yt-text-light text-sm mt-2">
                {searchTerm ? "Try adjusting your search terms" : "Start by enrolling users in courses"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserEnrollmentsTab;