// Updated AccessSettingsTab component with instructor assignment
import { useState, useEffect, useMemo } from 'react';
import { 
  FaSearch, 
  FaUserShield, 
  FaUser, 
  FaUserTie, 
  FaSave, 
  FaExclamationTriangle,
  FaChalkboardTeacher,
  FaBook
} from 'react-icons/fa';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'admin-only';
  isVerified: boolean;
}

interface Course {
  _id: string;
  title: string;
  instructors: Array<{
    userId: string;
    name: string;
    role: string;
  }>;
}

const AccessSettingsTab = () => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [roleChanges, setRoleChanges] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'roles' | 'instructors'>('roles');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [instructorAssignments, setInstructorAssignments] = useState<Record<string, string[]>>({});    // Add this state for modal
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<Course | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter out users with undefined IDs and ensure proper structure
        const validUsers = data.filter((user: any) => user.id || user._id).map((user: any) => ({
          id: user.id || user._id, // Handle both id and _id
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }));
        setUsers(validUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const [coursesLoading, setCoursesLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const response = await fetch(`${API_BASE}/api/courses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Courses data:', data); // Debug log
        setCourses(Array.isArray(data) ? data : data.courses || data || []);
      } else {
        console.error('Failed to fetch courses:', response.status);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setCoursesLoading(false);
    }
  };

  // Filter only admin users for instructor assignment
  const adminUsers = useMemo(() => {
    return users.filter(user => user.role === 'admin' || user.role === 'admin-only');
  }, [users]);

  const filteredUsers = useMemo(() => {
    const userList = activeTab === 'instructors' ? adminUsers : users;
    return userList.filter(user => {
      const userName = user.name || '';
      const userEmail = user.email || '';
      return (
        userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [users, adminUsers, searchTerm, activeTab]);

  const toggleUserSelection = (userId: string) => {
    console.log('Toggling user:', userId, 'Current selected:', Array.from(selectedUsers));
    setSelectedUsers(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(userId)) {
        newSelected.delete(userId);
      } else {
        newSelected.add(userId);
      }
      console.log('New selected:', Array.from(newSelected));
      return newSelected;
    });
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    setRoleChanges(prev => ({
      ...prev,
      [userId]: newRole
    }));
  };

  const handleInstructorAssignment = (userId: string, courseId: string) => {
    setInstructorAssignments(prev => {
      const currentCourses = prev[userId] || [];
      const newCourses = currentCourses.includes(courseId)
        ? currentCourses.filter(id => id !== courseId)
        : [...currentCourses, courseId];
      
      return {
        ...prev,
        [userId]: newCourses
      };
    });
  };


  const saveRoleChanges = async () => {
    const changes = Object.entries(roleChanges).filter(([userId, newRole]) => {
      const user = users.find(u => u.id === userId);
      return user && user.role !== newRole;
    });

    if (changes.length === 0) {
      alert('No changes to save');
      return;
    }

    setSaving(true);
    try {
      const promises = changes.map(([userId, newRole]) =>
        fetch(`${API_BASE}/api/users/${userId}/role`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ role: newRole })
        })
      );

      const results = await Promise.all(promises);
      const allSuccessful = results.every(res => res.ok);

      if (allSuccessful) {
        alert('Role changes saved successfully!');
        setRoleChanges({});
        setSelectedUsers(new Set());
        fetchUsers();
      } else {
        throw new Error('Some changes failed to save');
      }
    } catch (error) {
      console.error('Error saving role changes:', error);
      alert('Error saving role changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const saveInstructorAssignments = async () => {
    const assignments = Object.entries(instructorAssignments)
      .flatMap(([userId, courseIds]) => 
        courseIds.map(courseId => ({ userId, courseId }))
      )
      .filter(({ userId, courseId }) => {
        const course = courses.find(c => c._id === courseId);
        return course && !course.instructors.some(instructor => instructor.userId === userId);
      });

    if (assignments.length === 0) {
      alert('No new instructor assignments to save');
      return;
    }

    setSaving(true);
    try {
      const promises = assignments.map((assignment) => { // Remove destructuring here
        const user = users.find(u => u.id === assignment.userId); // Use assignment.userId
        return fetch(`${API_BASE}/api/courses/${assignment.courseId}/instructors`, { // Use assignment.courseId
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            userId: assignment.userId,
            name: user?.name,
            role: 'assistant'
          })
        });
      });

      const results = await Promise.all(promises);
      const allSuccessful = results.every(res => res.ok);

      if (allSuccessful) {
        alert('Instructor assignments saved successfully!');
        setInstructorAssignments({});
        setSelectedUsers(new Set());
        fetchCourses();
      } else {
        throw new Error('Some assignments failed to save');
      }
    } catch (error) {
      console.error('Error saving instructor assignments:', error);
      alert('Error saving instructor assignments. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin-only': return <FaUserShield className="text-blue-600" />;
      case 'admin': return <FaUserTie className="text-purple-600" />;
      default: return <FaUser className="text-green-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin-only': return 'bg-blue-100 text-blue-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6 p-4">
    {selectedCourseForModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-2">{selectedCourseForModal.title}</h3>
          <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mb-4">Course Details</p>
          <div className="space-y-2 text-sm">
            <p><strong>Instructors:</strong> {selectedCourseForModal.instructors.length}</p>
            <p><strong>ID:</strong> {selectedCourseForModal._id}</p>
          </div>
          <button
            onClick={() => setSelectedCourseForModal(null)}
            className="mt-4 bg-lfc-gold text-white px-4 py-2 rounded-lg hover:bg-lfc-gold/90"
          >
            Close
          </button>
        </div>
      </div>
    )}
      {/* Coming Soon Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <FaExclamationTriangle className="text-yellow-600 mr-3" />
          <div>
            <h3 className="text-lg font-medium text-yellow-800">More Features Coming Soon!</h3>
            <p className="text-yellow-700 text-sm">
              Currently managing basic role access and instructor assignments. 
              Advanced permission controls are under development.
            </p>
          </div>
        </div>
      </div>

      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg border border-gray-200 dark:border-[var(--border-primary)] p-4 text-center">
          <FaUser className="text-3xl text-green-600 mx-auto mb-2" />
          <h4 className="font-semibold">Student Access</h4>
          <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">Basic learning platform access</p>
          <div className="text-2xl font-bold text-green-600 mt-2">
            {users.filter(u => u.role === 'student').length}
          </div>
        </div>

        <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg border border-gray-200 dark:border-[var(--border-primary)] p-4 text-center">
          <FaUserTie className="text-3xl text-purple-600 mx-auto mb-2" />
          <h4 className="font-semibold">Admin Access</h4>
          <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">Full administrative privileges</p>
          <div className="text-2xl font-bold text-purple-600 mt-2">
            {users.filter(u => u.role === 'admin').length}
          </div>
        </div>

        <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg border border-gray-200 dark:border-[var(--border-primary)] p-4 text-center">
          <FaUserShield className="text-3xl text-blue-600 mx-auto mb-2" />
          <h4 className="font-semibold">Admin-Only</h4>
          <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">Restricted admin capabilities</p>
          <div className="text-2xl font-bold text-blue-600 mt-2">
            {users.filter(u => u.role === 'admin-only').length}
          </div>
        </div>

        <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg border border-gray-200 dark:border-[var(--border-primary)] p-4 text-center">
          <FaChalkboardTeacher className="text-3xl text-orange-600 mx-auto mb-2" />
          <h4 className="font-semibold">Course Instructors</h4>
          <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">Assigned to courses</p>
          <div className="text-2xl font-bold text-orange-600 mt-2">
            {adminUsers.filter(user => 
              courses.some(course => 
                course.instructors.some(instructor => instructor.userId === user.id)
              )
            ).length}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg border border-gray-200 dark:border-[var(--border-primary)] p-4">
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'roles'
                ? 'bg-lfc-gold text-white'
                : 'bg-gray-100 dark:bg-[var(--bg-tertiary)] text-gray-700 dark:text-[var(--text-secondary)] hover:bg-gray-200'
            }`}
          >
            <FaUserTie className="inline mr-2" />
            Role Management
          </button>
          <button
            onClick={() => setActiveTab('instructors')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'instructors'
                ? 'bg-lfc-gold text-white'
                : 'bg-gray-100 dark:bg-[var(--bg-tertiary)] text-gray-700 dark:text-[var(--text-secondary)] hover:bg-gray-200'
            }`}
          >
            <FaChalkboardTeacher className="inline mr-2" />
            Instructor Assignment
          </button>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder={
                activeTab === 'roles' 
                  ? "Search users by name or email..."
                  : "Search admin users by name or email..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lfc-gold"
            />
          </div>
          
          {activeTab === 'instructors' && (
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lfc-gold"
              disabled={coursesLoading}
            >
              <option value="">Select a course...</option>
              {coursesLoading ? (
                <option value="" disabled>Loading courses...</option>
              ) : courses.length === 0 ? (
                <option value="" disabled>No courses available</option>
              ) : (
                courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))
              )}
            </select>
          )}
          
          <div className="flex gap-4">
            <button
              onClick={activeTab === 'roles' ? saveRoleChanges : saveInstructorAssignments}
              disabled={saving || (
                activeTab === 'roles' 
                  ? Object.keys(roleChanges).length === 0
                  : Object.keys(instructorAssignments).length === 0
              )}
              className="bg-lfc-gold text-white px-6 py-2 rounded-lg hover:bg-lfc-gold/90 disabled:opacity-50 flex items-center"
            >
              <FaSave className="mr-2" />
              {saving ? 'Saving...' : `Save Changes (${
                activeTab === 'roles' 
                  ? Object.keys(roleChanges).length 
                  : Object.keys(instructorAssignments).length
              })`}
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto bg-white dark:bg-[var(--bg-elevated)] rounded-lg border border-gray-200 dark:border-[var(--border-primary)]">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[var(--bg-secondary)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Only select currently filtered users
                      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
                    } else {
                      // Only deselect currently filtered users
                      const newSelected = new Set(selectedUsers);
                      filteredUsers.forEach(user => newSelected.delete(user.id));
                      setSelectedUsers(newSelected);
                    }
                  }}
                  className="rounded border-gray-300"
                />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current {activeTab === 'roles' ? 'Role' : 'Courses'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {activeTab === 'roles' ? 'New Role' : 'Assign to Course'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const userCourses = courses.filter(course => 
                  course.instructors.some(instructor => instructor.userId === user.id)
                );

                return (
                  <tr key={`user-${user.id}-${activeTab}`} className="hover:bg-gray-50 dark:bg-[var(--bg-secondary)]">
                    {/* Remove any whitespace between <tr> and <td> */}
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="rounded border-gray-300"
                      />
                  </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {getRoleIcon(user.role)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {activeTab === 'roles' ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                          <span className="ml-1 capitalize">{user.role}</span>
                        </span>
                      ) : (
                    <div className="space-y-1 max-w-xs">
                      {userCourses.map(course => (
                        <span 
                          key={`${course._id}-${user.id}`}
                          onClick={() => setSelectedCourseForModal(course)}
                          className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs mr-1 mb-1 cursor-pointer hover:bg-blue-200 transition-colors truncate max-w-[200px]"
                          title={course.title}
                        >
                          <FaBook className="mr-1 flex-shrink-0" size={8} />
                          <span className="truncate">{course.title}</span>
                        </span>
                      ))}
                      {userCourses.length === 0 && (
                        <span className="text-xs text-gray-500">No courses assigned</span>
                      )}
                    </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {activeTab === 'roles' ? (
                        <select
                          value={roleChanges[user.id] || user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={!selectedUsers.has(user.id)}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lfc-gold disabled:opacity-50"
                        >
                          <option value="student">Student</option>
                          <option value="admin">Admin</option>
                          <option value="admin-only">Admin Only</option>
                        </select>
                      ) : (
                        <select
                          value={instructorAssignments[user.id] || ''}
                          onChange={(e) => handleInstructorAssignment(user.id, e.target.value)}
                          disabled={!selectedUsers.has(user.id) || !selectedCourse}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-lfc-gold disabled:opacity-50"
                        >
                          <option value="">Select course...</option>
                          {courses.map(course => (
                            <option key={course._id} value={course._id}>
                              {course.title}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {activeTab === 'roles' ? (
                        roleChanges[user.id] && roleChanges[user.id] !== user.role ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending Change
                          </span>
                        ) : user.isVerified ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Unverified
                          </span>
                        )
                      ) : (
                        instructorAssignments[user.id] ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Assignment Pending
                          </span>
                        ) : user.isVerified ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Unverified
                          </span>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {activeTab === 'roles' 
                ? 'No users found matching your search'
                : 'No admin users found matching your search'
              }
            </div>
          )}
        </div>

        {/* Selection Summary */}
        {selectedUsers.size > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>{selectedUsers.size}</strong> user(s) selected. 
              {activeTab === 'roles' 
                ? ' Use the role dropdowns to change their access levels.'
                : ' Use the course dropdowns to assign them as instructors.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessSettingsTab;