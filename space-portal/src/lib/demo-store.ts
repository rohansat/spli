import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type ApplicationStatus = 'DRAFT' | 'UNDER REVIEW' | 'AWAITING ACTION' | 'ACTIVE';
export type DocumentType = 'Application' | 'Attachment' | 'License' | 'Email';

export interface Application {
  id: string;
  name: string;
  type: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  size: string;
  uploadedAt: string;
  applicationId: string;
  applicationName: string;
}

export interface Message {
  id: string;
  from: string;
  subject: string;
  preview: string;
  content: string;
  date: string;
  unread: boolean;
  applicationId?: string;
}

interface DemoStore {
  applications: Application[];
  documents: Document[];
  messages: Message[];
  searchQuery: string;
  selectedMessageId: string | null;
  
  // Application Actions
  createApplication: (name: string, type: string) => Application;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  
  // Document Actions
  addDocument: (doc: Omit<Document, 'id'>) => void;
  removeDocument: (id: string) => void;
  setSearchQuery: (query: string) => void;
  
  // Message Actions
  addMessage: (message: Omit<Message, 'id'>) => void;
  markMessageAsRead: (id: string) => void;
  setSelectedMessage: (id: string | null) => void;
}

// Initial mock data
const initialApplications: Application[] = [
  {
    id: 'app-1',
    name: 'Falcon X Launch Vehicle License',
    type: 'Part 450',
    status: 'UNDER REVIEW',
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-02-20T00:00:00Z',
  },
  {
    id: 'app-2',
    name: 'Starcruiser Reentry Vehicle',
    type: 'Part 450',
    status: 'DRAFT',
    createdAt: '2025-02-27T00:00:00Z',
    updatedAt: '2025-02-27T00:00:00Z',
  },
  {
    id: 'app-3',
    name: 'Orbital Facility Safety Approval',
    type: 'Safety Approval',
    status: 'ACTIVE',
    createdAt: '2024-11-05T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'app-4',
    name: 'Launch Site Expansion Amendment',
    type: 'License Amendment',
    status: 'AWAITING ACTION',
    createdAt: '2025-03-03T00:00:00Z',
    updatedAt: '2025-03-05T00:00:00Z',
  },
];

const initialDocuments: Document[] = [
  {
    id: 'doc-1',
    name: 'Falcon X License Application.pdf',
    type: 'Application',
    size: '4.2 MB',
    uploadedAt: '2025-02-20T00:00:00Z',
    applicationId: 'app-1',
    applicationName: 'Falcon X Launch Vehicle License',
  },
  {
    id: 'doc-2',
    name: 'Flight Safety Analysis.pdf',
    type: 'Attachment',
    size: '8.7 MB',
    uploadedAt: '2025-02-20T00:00:00Z',
    applicationId: 'app-1',
    applicationName: 'Falcon X Launch Vehicle License',
  },
  // Add more initial documents...
];

const initialMessages: Message[] = [
  {
    id: 'msg-1',
    from: 'faa-admin@faa.gov',
    subject: 'Falcon X License Application Received',
    preview: 'We have received your application for the Falcon X Launch Vehicle License...',
    content: 'We have received your application for the Falcon X Launch Vehicle License. Your application is currently under review. We will contact you if additional information is needed.',
    date: '2025-02-20T00:00:00Z',
    unread: true,
    applicationId: 'app-1',
  },
  // Add more initial messages...
];

export const useDemoStore = create<DemoStore>((set) => ({
  applications: initialApplications,
  documents: initialDocuments,
  messages: initialMessages,
  searchQuery: '',
  selectedMessageId: null,

  createApplication: (name, type) => {
    const newApp: Application = {
      id: `app-${uuidv4()}`,
      name,
      type,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      applications: [...state.applications, newApp],
    }));

    return newApp;
  },

  updateApplication: (id, updates) => {
    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === id ? { ...app, ...updates, updatedAt: new Date().toISOString() } : app
      ),
    }));
  },

  addDocument: (doc) => {
    const newDoc: Document = {
      id: `doc-${uuidv4()}`,
      ...doc,
    };

    set((state) => ({
      documents: [...state.documents, newDoc],
    }));
  },

  removeDocument: (id) => {
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
    }));
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  addMessage: (message) => {
    const newMessage: Message = {
      id: `msg-${uuidv4()}`,
      ...message,
    };

    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  },

  markMessageAsRead: (id) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, unread: false } : msg
      ),
    }));
  },

  setSelectedMessage: (id) => {
    set({ selectedMessageId: id });
  },
})); 