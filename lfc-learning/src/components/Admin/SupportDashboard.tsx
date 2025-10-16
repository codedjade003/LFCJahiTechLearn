// src/components/Admin/SupportDashboard.jsx
import { useState, useEffect } from 'react';
import { FaSpinner, FaClock, FaCheckCircle, FaUser, FaExclamationTriangle, FaEye, FaTimes, FaPaperPlane } from 'react-icons/fa';
import type { SupportTicket, TicketFilters } from '../../types/support';

const SupportDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const [filters, setFilters] = useState<TicketFilters>({
    status: '',
    category: '',
    priority: ''
  });

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.priority) queryParams.append('priority', filters.priority);

      const response = await fetch(`${API_BASE}/api/support/admin/tickets?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/support/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchTickets();
        // If we're viewing this ticket, update it in the modal too
        if (selectedTicket && selectedTicket._id === ticketId) {
          setSelectedTicket(prev => prev ? { ...prev, status: status as SupportTicket['status'] } : null);
        }
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const assignToMe = async (ticketId: string): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/support/${ticketId}/assign`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Send automatic notification to student
        await sendAssignmentNotification(ticketId);
        fetchTickets();
        
        // If we're viewing this ticket, update it in the modal too
        if (selectedTicket && selectedTicket._id === ticketId) {
          const updatedTicket = await fetchTicketById(ticketId);
          setSelectedTicket(updatedTicket);
        }
      }
    } catch (error) {
      console.error('Error assigning ticket:', error);
    }
  };

  const fetchTicketById = async (ticketId: string): Promise<SupportTicket | null> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/support/${ticketId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      return null;
    }
  };

  const sendAssignmentNotification = async (ticketId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/support/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          message: "Hello! I've been assigned to your support ticket and will be helping you resolve this issue. Please let me know if you have any additional information that might help." 
        })
      });

      if (!response.ok) {
        console.error('Failed to send assignment notification');
      }
    } catch (error) {
      console.error('Error sending assignment notification:', error);
    }
  };

  const sendMessage = async (ticketId: string, message: string) => {
    if (!message.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/support/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });

      if (response.ok) {
        setNewMessage('');
        // Refresh the ticket to get updated messages
        const updatedTicket = await fetchTicketById(ticketId);
        if (updatedTicket) {
          setSelectedTicket(updatedTicket);
        }
        fetchTickets(); // Refresh the list to show updated message count
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getStatusCounts = (): { [key: string]: number } => {
    const counts: { [key: string]: number } = {
      open: 0,
      'in-progress': 0,
      resolved: 0,
      closed: 0
    };

    tickets.forEach(ticket => {
      counts[ticket.status]++;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-2xl text-lfc-red" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Support Dashboard</h1>
        <p className="text-gray-600">Manage customer support tickets</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open Tickets</p>
              <p className="text-2xl font-bold text-blue-600">{statusCounts.open}</p>
            </div>
            <FaClock className="text-blue-500 text-xl" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{statusCounts['in-progress']}</p>
            </div>
            <FaSpinner className="text-yellow-500 text-xl" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{statusCounts.resolved}</p>
            </div>
            <FaCheckCircle className="text-green-500 text-xl" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
            </div>
            <FaUser className="text-gray-500 text-xl" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-lfc-red focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-lfc-red focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="technical">Technical</option>
            <option value="billing">Billing</option>
            <option value="content">Content</option>
            <option value="general">General</option>
            <option value="other">Other</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters({...filters, priority: e.target.value})}
            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-lfc-red focus:border-transparent"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <button
            onClick={() => setFilters({ status: '', category: '', priority: '' })}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Support Tickets</h3>
          <p className="text-sm text-gray-600 mt-1">
            Showing {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
          </p>
        </div>

        {tickets.length === 0 ? (
          <div className="p-8 text-center">
            <FaExclamationTriangle className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-600">Adjust your filters to see more results</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        ticket.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                        ticket.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                        ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {ticket.status.replace('-', ' ')}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{ticket.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>By: {ticket.createdBy?.name}</span>
                      <span>Category: {ticket.category}</span>
                      <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      {ticket.assignedTo && (
                        <span className="font-medium text-lfc-red">Assigned to: {ticket.assignedTo.name}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {!ticket.assignedTo && (
                      <button
                        onClick={() => assignToMe(ticket._id)}
                        className="px-3 py-1 bg-lfc-red text-white rounded-lg hover:bg-red-700 text-sm"
                      >
                        Assign to Me
                      </button>
                    )}
                    
                    <select
                      value={ticket.status}
                      onChange={(e) => updateTicketStatus(ticket._id, e.target.value)}
                      className="border border-gray-300 rounded-lg p-1 text-sm focus:ring-2 focus:ring-lfc-red focus:border-transparent"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="px-3 py-1 border border-lfc-red text-lfc-red rounded-lg hover:bg-lfc-red hover:text-white transition-colors text-sm flex items-center"
                    >
                      <FaEye className="mr-1" />
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full h-[80vh] flex flex-col">
            {/* Header */}
            <div className="bg-lfc-red text-white p-4 rounded-t-lg flex justify-between items-center">
              <div className="flex-1">
                <h2 className="text-xl font-bold">{selectedTicket.title}</h2>
                <div className="flex flex-wrap gap-2 mt-1 text-sm">
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
                    Status: <span className="capitalize">{selectedTicket.status}</span>
                  </span>
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
                    Priority: <span className="capitalize">{selectedTicket.priority}</span>
                  </span>
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
                    Category: <span className="capitalize">{selectedTicket.category}</span>
                  </span>
                  {selectedTicket.assignedTo && (
                    <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
                      Assigned to: {selectedTicket.assignedTo.name}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedTicket(null);
                  setNewMessage('');
                }}
                className="text-white hover:text-gray-200 text-xl ml-4"
              >
                <FaTimes />
              </button>
            </div>

            {/* Ticket Info */}
            <div className="border-b p-4 bg-gray-50">
              <p className="text-gray-700">{selectedTicket.description}</p>
              <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                <span>Created by: {selectedTicket.createdBy?.name}</span>
                <span>Created: {new Date(selectedTicket.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto">
              {selectedTicket.messages?.length > 0 ? (
                selectedTicket.messages.map((message) => (
                  <div
                    key={message._id}
                    className={`mb-4 ${message.user.role === 'admin' ? 'text-left' : 'text-right'}`}
                  >
                    <div
                      className={`inline-block max-w-md rounded-lg p-4 ${
                        message.user.role === 'admin'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-lfc-red text-white'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {message.user.name} • {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No messages yet. Start the conversation!
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder="Type your response..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage(selectedTicket._id, newMessage)}
                  className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-lfc-red focus:border-transparent"
                />
                <button
                  onClick={() => sendMessage(selectedTicket._id, newMessage)}
                  disabled={!newMessage.trim()}
                  className="bg-lfc-red text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                >
                  <FaPaperPlane className="mr-2" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportDashboard;