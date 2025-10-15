// src/components/Student/SupportChatWidget.tsx
import React, { useState, useEffect, useRef } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaPlus, FaHeadset } from 'react-icons/fa';
import type { SupportTicket, NewTicketData } from '../../types/support';

const SupportChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const [showNewTicketForm, setShowNewTicketForm] = useState<boolean>(false);
  const [newTicket, setNewTicket] = useState<NewTicketData>({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (isOpen) {
      fetchTickets();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [activeTicket?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/support/my-tickets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data);
        if (data.length > 0 && !activeTicket) {
          setActiveTicket(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const createNewTicket = async (e: React.FormEvent) => {
    e.preventDefault();
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
        const ticket = await response.json();
        setTickets([ticket, ...tickets]);
        setActiveTicket(ticket);
        setShowNewTicketForm(false);
        setNewTicket({
          title: '',
          description: '',
          category: 'general',
          priority: 'medium'
        });
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeTicket) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/support/${activeTicket._id}/messages`, {
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
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-lfc-red text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-all z-50"
      >
        <FaComments size={24} />
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col">
          {/* Header */}
          <div className="bg-lfc-red text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <FaHeadset className="mr-2" />
              <h3 className="font-semibold">Support Center</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <FaTimes />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            {showNewTicketForm ? (
              // New Ticket Form
              <div className="flex-1 p-4">
                <h4 className="font-semibold mb-4">Create New Ticket</h4>
                <form onSubmit={createNewTicket} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Title"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                    className="w-full border border-gray-300 rounded p-2 text-sm"
                    required
                  />
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                    className="w-full border border-gray-300 rounded p-2 text-sm"
                  >
                    <option value="general">General</option>
                    <option value="technical">Technical</option>
                    <option value="content">Course Content</option>
                    <option value="billing">Billing</option>
                  </select>
                  <textarea
                    placeholder="Describe your issue..."
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                    className="w-full border border-gray-300 rounded p-2 text-sm h-24"
                    required
                  />
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowNewTicketForm(false)}
                      className="flex-1 border border-gray-300 rounded p-2 text-sm hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-lfc-red text-white rounded p-2 text-sm hover:bg-red-700"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            ) : activeTicket ? (
              // Active Ticket Chat
              <>
                {/* Ticket Header */}
                <div className="border-b p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-sm">{activeTicket.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(activeTicket.status)}`}>
                        {activeTicket.status}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowNewTicketForm(true)}
                      className="text-lfc-red hover:text-red-700 text-sm flex items-center"
                    >
                      <FaPlus className="mr-1" size={12} />
                      New
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {activeTicket.messages?.map((message) => (
                    <div
                      key={message._id}
                      className={`mb-3 ${message.user._id === 'current-user-id' ? 'text-right' : ''}`}
                    >
                      <div
                        className={`inline-block max-w-xs rounded-lg p-3 ${
                          message.user._id === 'current-user-id'
                            ? 'bg-lfc-red text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t p-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1 border border-gray-300 rounded p-2 text-sm"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-lfc-red text-white p-2 rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      <FaPaperPlane />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // Ticket List
              <div className="flex-1 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold">Your Tickets</h4>
                  <button
                    onClick={() => setShowNewTicketForm(true)}
                    className="bg-lfc-red text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center"
                  >
                    <FaPlus className="mr-1" />
                    New Ticket
                  </button>
                </div>
                <div className="space-y-2">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      onClick={() => setActiveTicket(ticket)}
                      className="border border-gray-200 rounded p-3 cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <h5 className="font-medium text-sm">{ticket.title}</h5>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">{ticket.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  {tickets.length === 0 && (
                    <p className="text-center text-gray-500 text-sm py-8">
                      No support tickets yet
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SupportChatWidget;