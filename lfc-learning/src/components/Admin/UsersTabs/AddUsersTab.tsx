import React, { useState } from 'react';
import { FaUpload, FaPlus, FaTrash, FaUserShield, FaFileExcel, FaSave } from 'react-icons/fa';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  username: string;
  role: string;
  phoneNumber: string;
}

const AddUsersTab = () => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [userForms, setUserForms] = useState<UserFormData[]>([
    { name: '', email: '', password: '', username: '', role: 'student', phoneNumber: '' }
  ]);
  const [adminForm, setAdminForm] = useState({ username: '' });
  const [generatedAdmin, setGeneratedAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // Add new user form
  const addUserForm = () => {
    setUserForms([...userForms, 
      { name: '', email: '', password: '', username: '', role: 'student', phoneNumber: '' }
    ]);
  };

  // Remove user form
  const removeUserForm = (index: number) => {
    if (userForms.length > 1) {
      setUserForms(userForms.filter((_, i) => i !== index));
    }
  };

  // Update user form field
  const updateUserForm = (index: number, field: keyof UserFormData, value: string) => {
    const updatedForms = [...userForms];
    updatedForms[index][field] = value;
    setUserForms(updatedForms);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Process bulk upload
  const processBulkUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE}/api/users/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Successfully processed ${result.results.successful.length} users`);
        setFile(null);
      } else {
        throw new Error('Bulk upload failed');
      }
    } catch (error) {
      console.error('Bulk upload error:', error);
      alert('Error processing bulk upload');
    } finally {
      setLoading(false);
    }
  };

  // Generate admin helper
  const generateAdminHelper = async () => {
    if (!adminForm.username) {
      alert('Please enter a username');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/register-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          username: adminForm.username,
          role: 'admin-only'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setGeneratedAdmin(result);
        setAdminForm({ username: '' });
        alert('Admin helper created successfully!');
      } else {
        throw new Error('Failed to create admin helper');
      }
    } catch (error) {
      console.error('Error creating admin helper:', error);
      alert('Error creating admin helper');
    } finally {
      setLoading(false);
    }
  };

  // Register multiple users
  const registerUsers = async () => {
    const validUsers = userForms.filter(user => 
      user.email && user.password && user.name
    );

    if (validUsers.length === 0) {
      alert('Please fill in at least one valid user form');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/users/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ users: JSON.stringify(validUsers) })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Successfully registered ${result.results.successful.length} users`);
        setUserForms([{ name: '', email: '', password: '', username: '', role: 'student', phoneNumber: '' }]);
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Error registering users:', error);
      alert('Error registering users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Section 1: Bulk Upload */}
      <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg border border-gray-200 dark:border-[var(--border-primary)] p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaUpload className="mr-2 text-lfc-gold" />
          Bulk Upload Users
        </h2>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <FaFileExcel className="text-4xl text-green-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-[var(--text-secondary)] mb-3">Upload CSV or Excel file with user data</p>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="bg-lfc-gold text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-lfc-gold/90"
            >
              Choose File
            </label>
            {file && (
              <div className="mt-3">
                <span className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">Selected: {file.name}</span>
              </div>
            )}
          </div>

          {file && (
            <button
              onClick={processBulkUpload}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Upload and Process'}
            </button>
          )}
        </div>
      </div>

      {/* Section 2: Add Multiple Users */}
      <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg border border-gray-200 dark:border-[var(--border-primary)] p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <FaPlus className="mr-2 text-lfc-gold" />
            Add Multiple Users
          </h2>
          <button
            onClick={addUserForm}
            className="bg-lfc-gold text-white px-4 py-2 rounded-lg hover:bg-lfc-gold/90 flex items-center"
          >
            <FaPlus className="mr-2" />
            Add Another User
          </button>
        </div>

        <div className="space-y-4">
          {userForms.map((form, index) => (
            <div key={index} className="border border-gray-200 dark:border-[var(--border-primary)] rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">User #{index + 1}</h3>
                {userForms.length > 1 && (
                  <button
                    onClick={() => removeUserForm(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => updateUserForm(index, 'name', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lfc-gold"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={(e) => updateUserForm(index, 'email', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lfc-gold"
                />
                <input
                  type="text"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => updateUserForm(index, 'password', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lfc-gold"
                />
                <input
                  type="text"
                  placeholder="Username (optional)"
                  value={form.username}
                  onChange={(e) => updateUserForm(index, 'username', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lfc-gold"
                />
                <select
                  value={form.role}
                  onChange={(e) => updateUserForm(index, 'role', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lfc-gold"
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                  <option value="admin-only">Admin Only</option>
                </select>
                <input
                  type="text"
                  placeholder="Phone Number (optional)"
                  value={form.phoneNumber}
                  onChange={(e) => updateUserForm(index, 'phoneNumber', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-lfc-gold"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={registerUsers}
          disabled={loading}
          className="mt-4 bg-lfc-red dark:bg-red-800 text-white px-6 py-2 rounded-lg hover:bg-lfc-red/90 disabled:opacity-50 flex items-center"
        >
          <FaSave className="mr-2" />
          {loading ? 'Registering...' : 'Register Users'}
        </button>
      </div>

      {/* Section 3: Generate Admin Helper */}
      <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg border border-gray-200 dark:border-[var(--border-primary)] p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaUserShield className="mr-2 text-lfc-red" />
          Generate Admin Helper
        </h2>
        
        <div className="space-y-4">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-2">
              Username for Admin Helper
            </label>
            <input
              type="text"
              placeholder="Enter username"
              value={adminForm.username}
              onChange={(e) => setAdminForm({ username: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-lfc-red"
            />
          </div>

          <button
            onClick={generateAdminHelper}
            disabled={loading || !adminForm.username}
            className="bg-lfc-red dark:bg-red-800 text-white px-6 py-2 rounded-lg hover:bg-lfc-red/90 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Admin Helper'}
          </button>

          {generatedAdmin && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800">Admin Helper Created!</h4>
              <p className="text-sm text-green-600">
                Username: {generatedAdmin.username}<br />
                Password: {generatedAdmin.password}<br />
                Role: {generatedAdmin.role}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddUsersTab;