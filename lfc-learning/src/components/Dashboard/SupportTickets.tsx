import { useState, useEffect } from 'react';
import { FaPlus, FaSpinner, FaClock, FaCheckCircle, FaExclamationCircle, FaTimes, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';
import type { SupportTicket, NewTicketData } from '../../types/support';
import OnboardingTour from '../shared/OnboardingTour';
import type { Step } from 'react-joyride';

const supportTicketsTour: Step[] = [
  {
    target: "body",
    content: "Welcome to Support! Here you can create tickets, track your requests, and communicate with the support team.",
    placement: "center",
  },
];

const SupportTickets: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [showNewTicket, setShowNewTicket] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  
  const [newTicket, setNewTicket] = useState<NewTicketData>({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium'
  });
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: ''
});

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    // Get current user ID from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(userData.id);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
        const token = localStorage.getItem('token');
        const queryParams = new URLSearchParams();
        
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.priority) queryParams.append('priority', filters.priority);

        const response = await fetch(`${API_BASE}/api/support/my-tickets?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
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

    useEffect(() => {
        fetchTickets();
    }, [filters]);

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTicket)
      });

      if (response.ok) {
        const ticket: SupportTicket = await response.json();
        setTickets([ticket, ...tickets]);
        setShowNewTicket(false);
        setNewTicket({
          title: '',
          description: '',
          category: 'general',
          priority: 'medium'
        });
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const sendMessage = async (ticketId: string) => {
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/support/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: newMessage })
      });

      if (response.ok) {
        setNewMessage('');
        fetchTickets(); // Refresh to get updated messages
      } else if (response.status === 403) {
        alert('You are not authorized to send messages to this ticket');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <FaClock className="text-blue-500" />;
      case 'in-progress': return <FaSpinner className="text-yellow-500" />;
      case 'resolved': return <FaCheckCircle className="text-green-500" />;
      case 'closed': return <FaCheckCircle className="text-gray-500" />;
      default: return <FaClock className="text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority: string): string => {
    const styles: { [key: string]: string } = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${styles[priority]}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-2xl text-lfc-red" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Onboarding Tour */}
      <OnboardingTour tourKey="supportTickets" steps={supportTicketsTour} />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-600">Get help with your courses and account</p>
        </div>
        <button
          onClick={() => setShowNewTicket(true)}
          className="bg-lfc-red text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
        >
          <FaPlus className="mr-2" />
          New Ticket
        </button>
      </div>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create Support Ticket</h2>
            <form onSubmit={createTicket}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-lfc-red focus:border-transparent"
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={newTicket.category}
                      onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-lfc-red focus:border-transparent"
                    >
                      <option value="general">General</option>
                      <option value="technical">Technical</option>
                      <option value="content">Course Content</option>
                      <option value="billing">Billing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-lfc-red focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-lfc-red focus:border-transparent"
                    placeholder="Please provide detailed information about your issue..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewTicket(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-lfc-red text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                >
                  {submitting && <FaSpinner className="animate-spin mr-2" />}
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg max-w-4xl w-full h-[80vh] flex flex-col">
            {/* Header */}
            <div className="bg-lfc-red text-white p-4 rounded-t-lg flex justify-between items-center">
              <div className="flex items-center">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="mr-3 hover:text-gray-200"
                >
                  <FaArrowLeft />
                </button>
                <div>
                  <h2 className="text-xl font-bold">{selectedTicket.title}</h2>
                  <p className="text-sm opacity-90">
                    Status: <span className="capitalize">{selectedTicket.status}</span> • 
                    Created: {new Date(selectedTicket.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-white hover:text-gray-200"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto">
              {selectedTicket.messages?.map((message) => (
                <div
                  key={message._id}
                  className={`mb-4 ${
                    message.user._id === currentUserId ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block max-w-md rounded-lg p-4 ${
                      message.user._id === currentUserId
                        ? 'bg-lfc-red text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {message.user._id === currentUserId ? 'You' : message.user.name} • 
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage(selectedTicket._id)}
                  className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-lfc-red focus:border-transparent"
                />
                <button
                  onClick={() => sendMessage(selectedTicket._id)}
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

      <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg border border-gray-200 p-4 mb-6">
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


      {/* Tickets List */}
      <div className="bg-white dark:bg-[var(--bg-elevated)] rounded-lg border border-gray-200">
        {tickets.length === 0 ? (
          <div className="p-8 text-center">
            <FaExclamationCircle className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No support tickets</h3>
            <p className="text-gray-600">Create your first support ticket to get help</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                      <span className={getPriorityBadge(ticket.priority)}>
                        {ticket.priority}
                      </span>
                      <span className="flex items-center text-sm text-gray-600">
                        {getStatusIcon(ticket.status)}
                        <span className="ml-1 capitalize">{ticket.status.replace('-', ' ')}</span>
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-2">{ticket.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Category: {ticket.category}</span>
                      <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      <span>Messages: {ticket.messages?.length || 0}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="ml-4 px-4 py-2 border border-lfc-red text-lfc-red rounded-lg hover:bg-lfc-red hover:text-white transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportTickets;