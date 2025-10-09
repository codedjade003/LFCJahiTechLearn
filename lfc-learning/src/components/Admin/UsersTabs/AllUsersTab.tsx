import React, { useState, useEffect, useMemo } from 'react';
import { FaEdit, FaTrash, FaSearch, FaSave, FaTimes, FaFileExcel, FaFileCsv, FaFilter } from 'react-icons/fa';

interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  technicalUnit?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  bio?: string;
  occupation?: string;
  company?: string;
  skills?: string[];
  socialLinks?: {
    website?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  preferences?: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    theme?: string;
    language?: string;
  };
  isVerified: boolean;
  isOnboarded: boolean;
  firstLogin: boolean;
  hasSeenOnboarding: boolean;
  lastLogin?: string;
  loginCount: number;
  streak?: {
    current: number;
    longest: number;
    lastLogin: string;
  };
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EditableUser extends User {
  isEditing?: boolean;
  originalData?: User;
}

const AllUsersTab: React.FC = () => {
  const [users, setUsers] = useState<EditableUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterVerified, setFilterVerified] = useState('all');
  const API_BASE = "http://localhost:5000";
  const [visibleFields, setVisibleFields] = useState({
    name: true,
    email: true,
    username: false,
    role: true,
    phoneNumber: false,
    dateOfBirth: false,
    maritalStatus: false,
    technicalUnit: false,
    address: false,
    bio: false,
    occupation: false,
    company: false,
    skills: false,
    socialLinks: false,
    preferences: false,
    isVerified: true,
    isOnboarded: false,
    firstLogin: false,
    hasSeenOnboarding: false,
    lastLogin: true,
    loginCount: true,
    streak: false,
    twoFactorEnabled: false,
    createdAt: false,
    updatedAt: false,
    showFieldPicker: false
  });

  const toggleFieldPicker = () => {
    setVisibleFields(prev => ({ ...prev, showFieldPicker: !prev.showFieldPicker }));
  };

  useEffect(() => {
    fetchUsers();
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
        // Normalize the ID field - handle both _id and id
        const normalizedUsers = data.map((user: any) => ({
          ...user,
          id: user.id || user._id, // Use _id if id doesn't exist
          isEditing: false,
          originalData: { ...user, id: user.id || user._id }
        }));
        
        setUsers(normalizedUsers);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.technicalUnit?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesVerified = filterVerified === 'all' || 
        (filterVerified === 'verified' && user.isVerified) ||
        (filterVerified === 'unverified' && !user.isVerified);

      return matchesSearch && matchesRole && matchesVerified;
    });
  }, [users, searchTerm, filterRole, filterVerified]);

  // Add this function to handle data export
  const exportToExcel = (format: 'xlsx' | 'csv') => {
    // Get only visible fields
    const visibleFieldKeys = Object.entries(visibleFields)
      .filter(([key, isVisible]) => isVisible && key !== 'showFieldPicker')
      .map(([key]) => key);

    // Prepare data for export
    const exportData = filteredUsers.map(user => {
      const row: any = {};
      
      visibleFieldKeys.forEach(field => {
        switch (field) {
          case 'address':
            row[field] = user.address ? 
              `${user.address.street || ''}, ${user.address.city || ''}, ${user.address.state || ''}`.replace(/, ,/g, ',').replace(/,$/, '') 
              : 'N/A';
            break;
          case 'skills':
            row[field] = user.skills?.join(', ') || 'N/A';
            break;
          case 'socialLinks':
            row[field] = user.socialLinks ? 
              Object.entries(user.socialLinks)
                .filter(([_, url]) => url)
                .map(([platform, url]) => `${platform}: ${url}`)
                .join('; ') 
              : 'N/A';
            break;
          case 'preferences':
            row[field] = user.preferences ? 
              `Email: ${user.preferences.emailNotifications ? 'Yes' : 'No'}, Push: ${user.preferences.pushNotifications ? 'Yes' : 'No'}, Theme: ${user.preferences.theme || 'Default'}`
              : 'N/A';
            break;
          case 'streak':
            row[field] = user.streak ? 
              `Current: ${user.streak.current}, Longest: ${user.streak.longest}` 
              : 'N/A';
            break;
          case 'dateOfBirth':
          case 'lastLogin':
          case 'createdAt':
          case 'updatedAt':
            row[field] = user[field as keyof User] ? 
              new Date(user[field as keyof User] as string).toLocaleDateString() 
              : 'N/A';
            break;
          default:
            row[field] = user[field as keyof User] || 'N/A';
        }
      });
      
      return row;
    });

    if (format === 'csv') {
      exportToCSV(exportData, visibleFieldKeys);
    } else {
      exportToXLSX(exportData, visibleFieldKeys);
    }
  };

  const exportToCSV = (data: any[], headers: string[]) => {
    const csvHeaders = headers.map(header => `"${header}"`).join(',');
    const csvRows = data.map(row => 
      headers.map(header => `"${String(row[header] || '').replace(/"/g, '""')}"`).join(',')
    );
    
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `users_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportToXLSX = async (data: any[], headers: string[]) => {
    try {
      const XLSX = await import('xlsx');
      
      // Use headers to ensure proper column order
      const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
      XLSX.writeFile(workbook, `users_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting to Excel. Please try again.');
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEdit = (id: string) => {
    setUsers(users.map(user => 
      user.id === id 
        ? { ...user, isEditing: true, originalData: { ...user } }
        : { ...user, isEditing: false }
    ));
  };

  const handleSave = async (id: string) => {
    const userToUpdate = users.find(user => user.id === id);
    if (!userToUpdate || !userToUpdate.originalData) return;

    try {
      let response: Response;
      
      // Check if role changed
      if (userToUpdate.role !== userToUpdate.originalData.role) {
        // Use role endpoint for role changes - try both id and _id formats
        const roleEndpoint = `${API_BASE}/api/users/${id}/role`;
        console.log('Updating role for user:', id, 'Endpoint:', roleEndpoint);
        
        response = await fetch(roleEndpoint, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ role: userToUpdate.role })
        });
      } else {
        // Use quick endpoint for other changes
        // Create a copy without role to avoid conflicts
        const { role, ...updatesWithoutRole } = userToUpdate;
        const quickEndpoint = `${API_BASE}/api/users/${id}/quick`;
        console.log('Quick update for user:', id, 'Endpoint:', quickEndpoint);
        
        response = await fetch(quickEndpoint, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Fixed: added missing closing brace
          },
          body: JSON.stringify(updatesWithoutRole)
        });
      }

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === id 
            ? { ...user, isEditing: false, originalData: undefined }
            : user
        ));
        // Refresh the users list to ensure data consistency
        await fetchUsers();
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      // Revert changes on error
      setUsers(users.map(user => 
        user.id === id && user.originalData
          ? { ...user.originalData, isEditing: false }
          : user
      ));
      alert('Error updating user: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleCancel = (id: string) => {
    setUsers(users.map(user => 
      user.id === id && user.originalData
        ? { ...user.originalData, isEditing: false }
        : user
    ));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/auth/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== id));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleFieldChange = (id: string, field: string, value: any) => {
    setUsers(users.map(user => 
      user.id === id 
        ? { ...user, [field]: value }
        : user
    ));
  };

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name, email, phone, username, or technical unit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lfc-gold focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-4">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lfc-gold"
          >
            <option value="all">All Roles</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
            <option value="admin-only">Admin Only</option>
          </select>

          <select
            value={filterVerified}
            onChange={(e) => setFilterVerified(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lfc-gold"
          >
            <option value="all">All Users</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>

          <button
            onClick={toggleFieldPicker}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            title="Field visibility"
          >
            <FaFilter />
          </button>

          {/* Export buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => exportToExcel('xlsx')}
              disabled={filteredUsers.length === 0}
              className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Export to Excel"
            >
              <FaFileExcel className="w-4 h-4" />
              Excel
            </button>
            <button
              onClick={() => exportToExcel('csv')}
              disabled={filteredUsers.length === 0}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Export to CSV"
            >
              <FaFileCsv className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Field Visibility Picker */}
      {visibleFields.showFieldPicker && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-medium mb-3">Visible Fields</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(visibleFields).map(([field, isVisible]) => (
              field !== 'showFieldPicker' && (
                <label key={field} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isVisible as boolean}
                    onChange={(e) => setVisibleFields(prev => ({
                      ...prev,
                      [field]: e.target.checked
                    }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm capitalize">{field}</span>
                </label>
              )
            ))}
          </div>
        </div>
      )}

      {/* Users Table */}
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
      <div className="relative">
        <div className="overflow-x-auto" style={{ maxWidth: '100vw', maxHeight: '70vh' }}>
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-30">
              <tr>
                {/* All your existing th elements for fields */}
                {visibleFields.name && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Name
                  </th>
                )}
                {visibleFields.email && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    Email
                  </th>
                )}
                {visibleFields.username && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Username
                  </th>
                )}
                {visibleFields.role && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    Role
                  </th>
                )}
                {visibleFields.phoneNumber && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Phone
                  </th>
                )}
                {visibleFields.dateOfBirth && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Birth Date
                  </th>
                )}
                {visibleFields.maritalStatus && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    Status
                  </th>
                )}
                {visibleFields.technicalUnit && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Tech Unit
                  </th>
                )}
                {visibleFields.address && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    Address
                  </th>
                )}
                {visibleFields.isVerified && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    Verified
                  </th>
                )}
                {visibleFields.isOnboarded && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Onboarded
                  </th>
                )}
                {visibleFields.firstLogin && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                    First Login
                  </th>
                )}
                {visibleFields.hasSeenOnboarding && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Seen Onboarding
                  </th>
                )}
                {visibleFields.lastLogin && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Last Login
                  </th>
                )}
                {visibleFields.loginCount && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                    Logins
                  </th>
                )}
                {visibleFields.streak && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Streak
                  </th>
                )}
                {visibleFields.twoFactorEnabled && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    2FA
                  </th>
                )}
                {visibleFields.createdAt && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Created
                  </th>
                )}
                {visibleFields.updatedAt && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Updated
                  </th>
                )}
                {visibleFields.skills && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Skills
                  </th>
                )}
                {visibleFields.socialLinks && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Socials
                  </th>
                )}
                {visibleFields.preferences && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Preferences
                  </th>
                )}
                {visibleFields.bio && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Bio
                  </th>
                )}
                {visibleFields.occupation && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Occupation
                  </th>
                )}
                {visibleFields.company && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Company
                  </th>
                )}

                {/* Locked Actions column */}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] sticky top-0 right-0 bg-gray-50 z-30 border-l border-gray-200">
                    Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  {/* All your existing td elements for fields */}
                  {visibleFields.name && (
                    <td className="px-4 py-3">
                      {user.isEditing ? (
                        <input
                          type="text"
                          value={user.name || ''}
                          onChange={(e) => handleFieldChange(user.id, 'name', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <div className="font-medium text-sm">{user.name || 'N/A'}</div>
                      )}
                    </td>
                  )}
                  {visibleFields.email && (
                    <td className="px-4 py-3">
                      {user.isEditing ? (
                        <input
                          type="email"
                          value={user.email}
                          onChange={(e) => handleFieldChange(user.id, 'email', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <div className="text-sm">{user.email}</div>
                      )}
                    </td>
                  )}
                  {visibleFields.username && (
                    <td className="px-4 py-3">
                      {user.isEditing ? (
                        <input
                          type="text"
                          value={user.username || ''}
                          onChange={(e) => handleFieldChange(user.id, 'username', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <div className="text-sm">{user.username || 'N/A'}</div>
                      )}
                    </td>
                  )}
                  {visibleFields.role && (
                    <td className="px-4 py-3">
                      {user.isEditing ? (
                        <select
                          value={user.role}
                          onChange={(e) => handleFieldChange(user.id, 'role', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="student">Student</option>
                          <option value="admin">Admin</option>
                          <option value="admin-only">Admin Only</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'admin-only' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      )}
                    </td>
                  )}
                  {visibleFields.phoneNumber && (
                    <td className="px-4 py-3">
                      {user.isEditing ? (
                        <input
                          type="text"
                          value={user.phoneNumber || ''}
                          onChange={(e) => handleFieldChange(user.id, 'phoneNumber', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <div className="text-sm">{user.phoneNumber || 'N/A'}</div>
                      )}
                    </td>
                  )}
                  {visibleFields.dateOfBirth && (
                    <td className="px-4 py-3 text-sm">
                      {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}
                    </td>
                  )}
                  {visibleFields.maritalStatus && (
                    <td className="px-4 py-3 text-sm">
                      {user.maritalStatus || 'N/A'}
                    </td>
                  )}
                  {visibleFields.technicalUnit && (
                    <td className="px-4 py-3 text-sm">
                      {user.technicalUnit || 'N/A'}
                    </td>
                  )}
                  {visibleFields.address && (
                    <td className="px-4 py-3 text-sm">
                      {user.address ? `${user.address.street || ''} ${user.address.city || ''}`.trim() || 'N/A' : 'N/A'}
                    </td>
                  )}
                  {visibleFields.isVerified && (
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.isVerified ? 'Yes' : 'No'}
                      </span>
                    </td>
                  )}
                  {visibleFields.isOnboarded && (
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isOnboarded ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.isOnboarded ? 'Yes' : 'No'}
                      </span>
                    </td>
                  )}
                  {visibleFields.firstLogin && (
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.firstLogin ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.firstLogin ? 'Yes' : 'No'}
                      </span>
                    </td>
                  )}
                  {visibleFields.hasSeenOnboarding && (
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.hasSeenOnboarding ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.hasSeenOnboarding ? 'Yes' : 'No'}
                      </span>
                    </td>
                  )}
                  {visibleFields.lastLogin && (
                    <td className="px-4 py-3 text-sm">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                  )}
                  {visibleFields.loginCount && (
                    <td className="px-4 py-3 text-sm">
                      {user.loginCount}
                    </td>
                  )}
                  {visibleFields.streak && (
                    <td className="px-4 py-3 text-sm">
                      {user.streak ? `${user.streak.current} (Longest: ${user.streak.longest})` : 'N/A'}
                    </td>
                  )}
                  {visibleFields.twoFactorEnabled && (
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                  )}
                  {visibleFields.createdAt && (
                    <td className="px-4 py-3 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  )}
                  {visibleFields.updatedAt && (
                    <td className="px-4 py-3 text-sm">
                      {new Date(user.updatedAt).toLocaleDateString()}
                    </td>
                  )}
                  {visibleFields.skills && (
                    <td className="px-4 py-3 text-sm">
                      {user.skills && user.skills.length > 0 ? user.skills.join(', ') : 'N/A'}
                    </td>
                  )}
                  {visibleFields.socialLinks && (
                    <td className="px-4 py-3 text-sm">
                      {user.socialLinks ? (
                        Object.entries(user.socialLinks)
                          .filter(([_, url]) => url)
                          .map(([platform, url]) => (
                            <a
                              key={platform}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline mr-2"
                            >
                              {platform}
                            </a>
                          ))
                      ) : 'N/A'}
                    </td>
                  )}
                  {visibleFields.preferences && (
                    <td className="px-4 py-3 text-sm">
                      {user.preferences ? (
                        <>
                          Email: {user.preferences.emailNotifications ? 'Yes' : 'No'}, Push: {user.preferences.pushNotifications ? 'Yes' : 'No'}, Theme: {user.preferences.theme || 'Default'}, Language: {user.preferences.language || 'N/A'}
                        </>
                      ) : 'N/A'}
                    </td>
                  )}
                  {visibleFields.bio && (
                    <td className="px-4 py-3 text-sm">
                      {user.bio || 'N/A'}
                    </td>
                  )}
                  {visibleFields.occupation && (
                    <td className="px-4 py-3 text-sm">
                      {user.occupation || 'N/A'}
                    </td>
                  )}
                  {visibleFields.company && (
                    <td className="px-4 py-3 text-sm">
                      {user.company || 'N/A'}
                    </td>
                  )}
                    {/* Locked Actions column */}
                    <td className="px-4 py-3 sticky right-0 bg-white border-l border-gray-200">
                      <div className="flex space-x-2">
                        {user.isEditing ? (
                          <>
                            <button
                              onClick={() => handleSave(user.id)}
                              className="p-1 text-green-600 hover:text-green-800"
                              title="Save"
                            >
                              <FaSave />
                            </button>
                            <button
                              onClick={() => handleCancel(user.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Cancel"
                            >
                              <FaTimes />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(user.id)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete"
                              disabled={user.email === 'codedjade003@gmail.com'}
                            >
                              <FaTrash />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No users found matching your criteria
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500">
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </div>
  );
};

export default AllUsersTab;