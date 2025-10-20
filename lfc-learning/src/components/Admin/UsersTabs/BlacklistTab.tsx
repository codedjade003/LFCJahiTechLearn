// src/components/Admin/UsersTabs/BlacklistTab.tsx
import { useState, useEffect } from "react";
import axios from "axios";
import { FaBan, FaUndo, FaSearch, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface BlacklistEntry {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    role: string;
    profilePicture?: {
      url: string;
    };
  };
  email: string;
  reason: string;
  notes?: string;
  blacklistedBy: {
    name: string;
    email: string;
  };
  blacklistedAt: string;
  accessAttempts: Array<{
    timestamp: string;
    ipAddress: string;
    attemptedRoute: string;
  }>;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: {
    url: string;
  };
}

export default function BlacklistTab() {
  const [blacklistedUsers, setBlacklistedUsers] = useState<BlacklistEntry[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  useEffect(() => {
    fetchBlacklistedUsers();
    fetchAllUsers();
  }, []);

  const fetchBlacklistedUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/blacklist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlacklistedUsers(response.data.blacklistedUsers);
    } catch (error: any) {
      console.error("Error fetching blacklisted users:", error);
      toast.error(error.response?.data?.message || "Failed to fetch blacklisted users");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter out admin users
      const nonAdminUsers = response.data.filter(
        (user: User) => user.role !== "admin" && user.role !== "admin-only"
      );
      setAllUsers(nonAdminUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
    }
  };

  const handleAddToBlacklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !reason) {
      toast.error("Please select a user and provide a reason");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/blacklist`,
        { userId: selectedUser, reason, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("User successfully blacklisted");
      setShowAddModal(false);
      setSelectedUser("");
      setReason("");
      setNotes("");
      fetchBlacklistedUsers();
      fetchAllUsers();
    } catch (error: any) {
      console.error("Error adding to blacklist:", error);
      toast.error(error.response?.data?.message || "Failed to blacklist user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveFromBlacklist = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName} from the blacklist?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/blacklist/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User removed from blacklist");
      fetchBlacklistedUsers();
      fetchAllUsers();
    } catch (error: any) {
      console.error("Error removing from blacklist:", error);
      toast.error(error.response?.data?.message || "Failed to remove user from blacklist");
    }
  };

  const filteredBlacklist = blacklistedUsers.filter(
    (entry) =>
      entry.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter out already blacklisted users from the add modal
  const availableUsers = allUsers.filter(
    (user) => !blacklistedUsers.some((bl) => bl.userId?._id === user._id)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lfc-red"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Blacklisted Users
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {blacklistedUsers.length} user{blacklistedUsers.length !== 1 ? "s" : ""} currently
            blacklisted
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-lfc-red text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <FaBan />
          Add to Blacklist
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FaInfoCircle className="text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-medium mb-1">About Blacklisting</p>
            <p>
              Blacklisted users cannot log in or access any protected pages. They can only view the
              landing page, signup page, and footer pages. All access attempts are logged.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, or reason..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lfc-red focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* Blacklist Table */}
      {filteredBlacklist.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <FaBan className="mx-auto text-4xl text-gray-400 mb-3" />
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? "No matching blacklisted users found" : "No users are currently blacklisted"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBlacklist.map((entry) => (
            <div
              key={entry._id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {/* Profile Picture */}
                  <div className="flex-shrink-0">
                    {entry.userId?.profilePicture?.url ? (
                      <img
                        src={entry.userId.profilePicture.url}
                        alt={entry.userId.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold">
                        {entry.userId?.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {entry.userId?.name || "Unknown User"}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{entry.email}</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-start gap-2">
                        <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Reason:
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{entry.reason}</p>
                        </div>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 ml-6">
                          Notes: {entry.notes}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500 ml-6">
                        Blacklisted by {entry.blacklistedBy.name} on{" "}
                        {new Date(entry.blacklistedAt).toLocaleDateString()}
                      </p>
                      {entry.accessAttempts.length > 0 && (
                        <button
                          onClick={() =>
                            setExpandedEntry(expandedEntry === entry._id ? null : entry._id)
                          }
                          className="text-xs text-lfc-red hover:underline ml-6"
                        >
                          {expandedEntry === entry._id ? "Hide" : "Show"} {entry.accessAttempts.length}{" "}
                          access attempt{entry.accessAttempts.length !== 1 ? "s" : ""}
                        </button>
                      )}
                    </div>

                    {/* Access Attempts */}
                    {expandedEntry === entry._id && entry.accessAttempts.length > 0 && (
                      <div className="mt-3 ml-6 p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Recent Access Attempts:
                        </p>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {entry.accessAttempts.slice(0, 10).map((attempt, idx) => (
                            <div key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                              <p>
                                {new Date(attempt.timestamp).toLocaleString()} - {attempt.attemptedRoute}
                              </p>
                              <p className="text-gray-500 dark:text-gray-500">IP: {attempt.ipAddress}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFromBlacklist(entry.userId._id, entry.userId.name)}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-shrink-0"
                >
                  <FaUndo />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add to Blacklist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-55 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Add User to Blacklist
            </h3>
            <form onSubmit={handleAddToBlacklist} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select User *
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lfc-red focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="">-- Select a user --</option>
                  {availableUsers.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason *
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Spam account, Violation of terms"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lfc-red focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-lfc-red focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedUser("");
                    setReason("");
                    setNotes("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-lfc-red text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Adding..." : "Add to Blacklist"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
