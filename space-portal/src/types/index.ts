export interface Application {
  id: string;
  name: string;
  status: 'draft' | 'under_review' | 'submitted' | 'approved' | 'pending_approval';
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
  emailMetadata?: {
    recipient: string;
    subject: string;
    body: string;
    sentAt: string;
    applicationData: Record<string, string>;
    applicationName: string;
  };
}

export interface Message {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  bodyContentType?: string;
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
