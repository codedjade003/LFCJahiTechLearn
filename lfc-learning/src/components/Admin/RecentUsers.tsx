// src/components/Admin/RecentUsers.tsx
import { useState, useEffect } from "react";
import { FaUser, FaEye, FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface User {
  _id: string;
  name: string;
  email: string;
  courses: number;
  progress: number;
  lastLogin: string;
}

interface ApiResponse {
  users?: User[];
  totalPages?: number;
  totalUsers?: number;
  count?: number;
  data?: User[];
}

export default function RecentUsers() {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 3;

  useEffect(() => {
    fetchRecentUsers();
  }, [currentPage]);

  const fetchRecentUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/recent-users?page=${currentPage}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data: ApiResponse = await response.json();
        
        // Handle different possible response structures
        const usersData = data.users || data.data || [];
        const totalUsersCount = data.totalUsers || data.count || usersData.length;
        const pages = data.totalPages || Math.ceil(totalUsersCount / limit) || 1;
        
        setUsers(usersData);
        setTotalPages(pages);
        setTotalUsers(totalUsersCount);
      } else {
        console.error('Failed to fetch recent users');
        setUsers([]);
        setTotalUsers(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching recent users:', error);
      setUsers([]);
      setTotalUsers(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-100 text-green-600";
    if (progress >= 50) return "bg-blue-100 text-blue-600";
    if (progress >= 25) return "bg-yellow-100 text-yellow-600";
    return "bg-red-100 text-red-600";
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleViewUser = (userId: string) => {
    window.location.href = `/admin/users/${userId}`;
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        fetchRecentUsers();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete user: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`Error deleting user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-redCustom">Recent Users</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold text-redCustom">Recent Users</h2>
        <span className="text-sm text-gray-500">
          {totalUsers} total users
        </span>
      </div>
      <div className="p-6 overflow-x-auto">
        {users.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No users found</div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full ${getProgressColor(user.progress)} flex items-center justify-center`}>
                          <FaUser />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {user.courses}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-goldCustom h-2 rounded-full"
                          style={{ width: `${user.progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{user.progress}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        onClick={() => handleViewUser(user._id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="View User"
                      >
                        <FaEye />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete User"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                <div className="flex justify-between flex-1 sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * limit, totalUsers)}
                      </span>{" "}
                      of <span className="font-medium">{totalUsers}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="inline-flex -space-x-px rounded-md shadow-sm">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaChevronLeft className="h-4 w-4" />
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? "z-10 bg-redCustom border-redCustom text-white"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaChevronRight className="h-4 w-4" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}