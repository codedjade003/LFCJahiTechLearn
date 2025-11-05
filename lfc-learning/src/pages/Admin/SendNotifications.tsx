// src/pages/Admin/SendNotifications.tsx
import { useState, useEffect } from "react";
import { FaBell, FaPaperPlane, FaUsers, FaBook, FaUserCheck, FaUserTimes } from "react-icons/fa";
import { toast } from "react-toastify";

interface Course {
  _id: string;
  title: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

const SendNotifications = () => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form state
  const [recipientType, setRecipientType] = useState<"all" | "course-enrolled" | "course-not-enrolled" | "specific">("all");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "alert" | "system">("info");
  const [link, setLink] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch courses
      const coursesRes = await fetch(`${API_BASE}/api/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData);
      }

      // Fetch users
      const usersRes = await fetch(`${API_BASE}/api/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        console.log("Users fetched:", usersData);
        // Handle both array and object with users property
        const usersList = Array.isArray(usersData) ? usersData : usersData.users || [];
        setUsers(usersList);
        console.log("Users set:", usersList.length);
      } else {
        console.error("Failed to fetch users:", usersRes.status);
        toast.error("Failed to load users");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoadingData(false);
    }
  };

  const getRecipientUserIds = async (): Promise<string[]> => {
    const token = localStorage.getItem("token");

    switch (recipientType) {
      case "all":
        return users.map(u => u._id);

      case "course-enrolled":
        if (!selectedCourse) {
          toast.error("Please select a course");
          return [];
        }
        try {
          const res = await fetch(`${API_BASE}/api/courses/${selectedCourse}/enrollments`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const enrollments = await res.json();
            return enrollments.map((e: any) => e.user._id || e.user);
          }
        } catch (error) {
          console.error("Error fetching enrollments:", error);
          toast.error("Failed to fetch enrolled users");
        }
        return [];

      case "course-not-enrolled":
        if (!selectedCourse) {
          toast.error("Please select a course");
          return [];
        }
        try {
          const res = await fetch(`${API_BASE}/api/courses/${selectedCourse}/enrollments`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const enrollments = await res.json();
            const enrolledIds = enrollments.map((e: any) => e.user._id || e.user);
            return users.filter(u => !enrolledIds.includes(u._id)).map(u => u._id);
          }
        } catch (error) {
          console.error("Error fetching enrollments:", error);
          toast.error("Failed to fetch non-enrolled users");
        }
        return [];

      case "specific":
        if (selectedUsers.length === 0) {
          toast.error("Please select at least one user");
          return [];
        }
        return selectedUsers;

      default:
        return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a notification title");
      return;
    }

    setLoading(true);

    try {
      const userIds = await getRecipientUserIds();
      
      if (userIds.length === 0) {
        toast.error("No recipients selected");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/notifications/manual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userIds,
          title,
          message,
          type,
          link: link || undefined,
        }),
      });

      if (response.ok) {
        await response.json();
        toast.success(`Notification sent to ${userIds.length} user(s)`);
        
        // Reset form
        setTitle("");
        setMessage("");
        setLink("");
        setSelectedUsers([]);
        setSelectedCourse("");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(users.map(u => u._id));
  };

  const deselectAllUsers = () => {
    setSelectedUsers([]);
  };

  if (loadingData) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-[var(--bg-tertiary)] rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-[var(--bg-tertiary)] rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-[var(--text-primary)] flex items-center gap-2">
          <FaBell className="text-lfc-red" />
          Send Notifications
        </h1>
        <p className="text-gray-600 dark:text-[var(--text-secondary)] mt-1">
          Send custom notifications to users
        </p>
      </div>

      <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg shadow-md border dark:border-[var(--border-primary)] p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-primary)] mb-2">
              Recipients
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRecipientType("all")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  recipientType === "all"
                    ? "border-lfc-red bg-lfc-red/10 dark:bg-red-900/20"
                    : "border-gray-200 dark:border-[var(--border-primary)] hover:border-lfc-red/50"
                }`}
              >
                <FaUsers className="text-2xl mb-2 text-lfc-red" />
                <div className="font-medium text-gray-800 dark:text-[var(--text-primary)]">All Users</div>
                <div className="text-xs text-gray-500 dark:text-[var(--text-tertiary)]">
                  {users.length} users
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRecipientType("course-enrolled")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  recipientType === "course-enrolled"
                    ? "border-lfc-red bg-lfc-red/10 dark:bg-red-900/20"
                    : "border-gray-200 dark:border-[var(--border-primary)] hover:border-lfc-red/50"
                }`}
              >
                <FaUserCheck className="text-2xl mb-2 text-green-600" />
                <div className="font-medium text-gray-800 dark:text-[var(--text-primary)]">Course Enrolled</div>
                <div className="text-xs text-gray-500 dark:text-[var(--text-tertiary)]">
                  Users in a course
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRecipientType("course-not-enrolled")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  recipientType === "course-not-enrolled"
                    ? "border-lfc-red bg-lfc-red/10 dark:bg-red-900/20"
                    : "border-gray-200 dark:border-[var(--border-primary)] hover:border-lfc-red/50"
                }`}
              >
                <FaUserTimes className="text-2xl mb-2 text-orange-600" />
                <div className="font-medium text-gray-800 dark:text-[var(--text-primary)]">Not Enrolled</div>
                <div className="text-xs text-gray-500 dark:text-[var(--text-tertiary)]">
                  Users not in a course
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRecipientType("specific")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  recipientType === "specific"
                    ? "border-lfc-red bg-lfc-red/10 dark:bg-red-900/20"
                    : "border-gray-200 dark:border-[var(--border-primary)] hover:border-lfc-red/50"
                }`}
              >
                <FaBook className="text-2xl mb-2 text-blue-600" />
                <div className="font-medium text-gray-800 dark:text-[var(--text-primary)]">Specific Users</div>
                <div className="text-xs text-gray-500 dark:text-[var(--text-tertiary)]">
                  Select manually
                </div>
              </button>
            </div>
          </div>

          {/* Course Selection (for enrolled/not-enrolled) */}
          {(recipientType === "course-enrolled" || recipientType === "course-not-enrolled") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-primary)] mb-2">
                Select Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--border-primary)] rounded-lg bg-white dark:bg-[var(--bg-tertiary)] text-gray-900 dark:text-[var(--text-primary)] focus:ring-2 focus:ring-lfc-red focus:border-transparent"
                required
              >
                <option value="">-- Select a course --</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* User Selection (for specific users) */}
          {recipientType === "specific" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-primary)]">
                  Select Users ({selectedUsers.length} selected)
                </label>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={selectAllUsers}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllUsers}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              <div className="border border-gray-300 dark:border-[var(--border-primary)] rounded-lg max-h-64 overflow-y-auto">
                {users.map((user) => (
                  <label
                    key={user._id}
                    className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] cursor-pointer border-b border-gray-200 dark:border-[var(--border-primary)] last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => toggleUserSelection(user._id)}
                      className="mr-3 h-4 w-4 text-lfc-red focus:ring-lfc-red border-gray-300 rounded"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-[var(--text-tertiary)]">
                        {user.email}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Notification Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-primary)] mb-2">
              Notification Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "info" | "alert" | "system")}
              className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--border-primary)] rounded-lg bg-white dark:bg-[var(--bg-tertiary)] text-gray-900 dark:text-[var(--text-primary)] focus:ring-2 focus:ring-lfc-red focus:border-transparent"
            >
              <option value="info">Info</option>
              <option value="alert">Alert</option>
              <option value="system">System</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-primary)] mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
              className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--border-primary)] rounded-lg bg-white dark:bg-[var(--bg-tertiary)] text-gray-900 dark:text-[var(--text-primary)] focus:ring-2 focus:ring-lfc-red focus:border-transparent"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-primary)] mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter notification message (optional)"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--border-primary)] rounded-lg bg-white dark:bg-[var(--bg-tertiary)] text-gray-900 dark:text-[var(--text-primary)] focus:ring-2 focus:ring-lfc-red focus:border-transparent"
            />
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-primary)] mb-2">
              Link (Optional)
            </label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="e.g., /dashboard/courses/123"
              className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--border-primary)] rounded-lg bg-white dark:bg-[var(--bg-tertiary)] text-gray-900 dark:text-[var(--text-primary)] focus:ring-2 focus:ring-lfc-red focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-lfc-red hover:bg-lfc-red/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  Send Notification
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendNotifications;
