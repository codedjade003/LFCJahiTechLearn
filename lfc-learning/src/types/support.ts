// types/support.ts
export interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

export interface SupportTicket {
  _id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'content' | 'general' | 'other';
  createdBy: User;
  assignedTo?: User;
  courseId?: string;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface TicketMessage {
  _id: string;
  user: User;
  message: string;
  attachments: Attachment[];
  createdAt: string;
}

export interface Attachment {
  filename: string;
  url: string;
  uploadDate: string;
}

export interface NewTicketData {
  title: string;
  description: string;
  category: string;
  priority: string;
  courseId?: string;
}

export interface TicketFilters {
  status: string;
  category: string;
  priority: string;
}