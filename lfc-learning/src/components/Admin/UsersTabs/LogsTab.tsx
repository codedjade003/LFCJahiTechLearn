import { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaDownload, FaSort, FaUser, FaBook, FaSignInAlt, FaClock } from 'react-icons/fa';

interface LogEntry {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  courseName?: string;
  moduleName?: string;
  status: 'success' | 'error' | 'info';
}

const LogsTab = () => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterAction, setFilterAction] = useState('all');
  const [filterResource, setFilterResource] = useState('all');

  const logsPerPage = 50;

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/logs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedLogs = useMemo(() => {
    let filtered = logs.filter(log => 
      log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterAction !== 'all') {
      filtered = filtered.filter(log => log.action === filterAction);
    }

    if (filterResource !== 'all') {
      filtered = filtered.filter(log => log.resource === filterResource);
    }

  return filtered.sort((a, b) => {
    const aValue = a[sortField as keyof LogEntry] ?? '';
    const bValue = b[sortField as keyof LogEntry] ?? '';
    
    const aString = String(aValue);
    const bString = String(bValue);
    
    if (sortDirection === 'asc') {
      return aString.localeCompare(bString);
    }
    return bString.localeCompare(aString);
  });
  }, [logs, searchTerm, filterAction, filterResource, sortField, sortDirection]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * logsPerPage;
    return filteredAndSortedLogs.slice(startIndex, startIndex + logsPerPage);
  }, [filteredAndSortedLogs, currentPage]);

  const downloadLogs = () => {
    const dataStr = JSON.stringify(paginatedLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-page-${currentPage}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading logs...</div>;
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg border border-gray-200 dark:border-[var(--border-primary)] p-6">
        <h1 className="text-2xl font-bold mb-2">Activity Logs</h1>
        <p className="text-gray-600 dark:text-[var(--text-secondary)]">View user activity logs and login history</p>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-gray-50 dark:bg-[var(--bg-secondary)] p-4 rounded-lg">
            <FaUser className="text-blue-600 text-xl mb-2" />
            <div className="text-2xl font-bold">{logs.length}</div>
            <div className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">Total Logs</div>
          </div>
          <div className="bg-gray-50 dark:bg-[var(--bg-secondary)] p-4 rounded-lg">
            <FaSignInAlt className="text-green-600 text-xl mb-2" />
            <div className="text-2xl font-bold">{logs.filter(l => l.action === 'login').length}</div>
            <div className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">Logins</div>
          </div>
          <div className="bg-gray-50 dark:bg-[var(--bg-secondary)] p-4 rounded-lg">
            <FaBook className="text-purple-600 text-xl mb-2" />
            <div className="text-2xl font-bold">{logs.filter(l => l.resource === 'course').length}</div>
            <div className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">Course Activities</div>
          </div>
          <div className="bg-gray-50 dark:bg-[var(--bg-secondary)] p-4 rounded-lg">
            <FaClock className="text-orange-600 text-xl mb-2" />
            <div className="text-2xl font-bold">{new Set(logs.map(l => l.userId)).size}</div>
            <div className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">Active Users</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg border border-gray-200 dark:border-[var(--border-primary)] p-6">
        <div className="flex flex-col md:flex-row flex-wrap gap-4 mb-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs by user, action, course, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg w-full sm:w-auto"
          >
            <option value="all">All Actions</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="enroll">Enroll</option>
            <option value="complete">Complete</option>
          </select>

          <select
            value={filterResource}
            onChange={(e) => setFilterResource(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg w-full sm:w-auto"
          >
            <option value="all">All Resources</option>
            <option value="course">Course</option>
            <option value="module">Module</option>
            <option value="assignment">Assignment</option>
            <option value="user">User</option>
            <option value="system">System</option>
          </select>

          <button
            onClick={downloadLogs}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center w-full sm:w-auto"
          >
            <FaDownload className="mr-2" />
            Download JSON
          </button>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto touch-pan-x">
          <table className="min-w-[900px] w-full">
            <thead className="bg-gray-50 dark:bg-[var(--bg-secondary)]">
              <tr>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort('timestamp')}>
                  <div className="flex items-center">
                    <FaClock className="mr-2" />
                    Time
                    <FaSort className="ml-1" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort('userName')}>
                  <div className="flex items-center">
                    <FaUser className="mr-2" />
                    User
                    <FaSort className="ml-1" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort('action')}>
                  Action
                  <FaSort className="ml-1" />
                </th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort('resource')}>
                  Resource
                  <FaSort className="ml-1" />
                </th>
                <th className="px-4 py-3 text-left">Details</th>
                <th className="px-4 py-3 text-left">IP Address</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:bg-[var(--bg-secondary)]">
                  <td className="px-4 py-3 text-sm">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium">{log.userName}</div>
                      <div className="text-sm text-gray-500">{log.userEmail}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium capitalize">{log.action}</span>
                  </td>
                  <td className="px-4 py-3 capitalize">{log.resource}</td>
                  <td className="px-4 py-3 text-sm max-w-xs truncate" title={log.details}>
                    {log.details}
                    {log.courseName && (
                      <div className="text-gray-500">Course: {log.courseName}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono">{log.ipAddress}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
            Showing {paginatedLogs.length} of {filteredAndSortedLogs.length} logs
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {currentPage} of {Math.ceil(filteredAndSortedLogs.length / logsPerPage)}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredAndSortedLogs.length / logsPerPage), p + 1))}
              disabled={currentPage >= Math.ceil(filteredAndSortedLogs.length / logsPerPage)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogsTab;
