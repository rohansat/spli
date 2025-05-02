export interface Application {
  id: string;
  name: string;
  status: 'draft' | 'under_review' | 'submitted' | 'approved';
  type: 'Part 450' | 'License Amendment' | 'Safety Approval' | 'Site License';
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  userId?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'application' | 'email' | 'attachment' | 'license';
  applicationId?: string;
  applicationName?: string;
  fileSize: string;
  uploadedAt: string;
  url: string;
  userId?: string;
}

export interface Message {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  isRead: boolean;
  isAutomated: boolean;
  createdAt: string;
  applicationId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  role: 'admin' | 'user';
  initials: string;
}
