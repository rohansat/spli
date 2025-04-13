"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Application, Document } from "@/types";
import { applications as mockApplications, documents as mockDocuments } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";

interface ApplicationContextType {
  applications: Application[];
  documents: Document[];
  createApplication: (name: string, type: Application["type"]) => Application;
  getApplicationById: (id: string) => Application | undefined;
  getDocumentsByApplicationId: (applicationId: string) => Document[];
  uploadDocument: (document: Omit<Document, "id" | "uploadedAt">) => Document;
  removeDocument: (id: string) => void;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  // Initialize with user-specific data or mock data
  useEffect(() => {
    if (user) {
      // For now, we'll modify the mock data to look like it belongs to the current user
      const userApplications = mockApplications.map(app => ({
        ...app,
        name: app.name + ` (${user.displayName || user.email})`,
        userId: user.uid // Add user ID to track ownership
      }));
      
      const userDocuments = mockDocuments.map(doc => ({
        ...doc,
        name: doc.name.replace('.pdf', ` - ${user.displayName || user.email}.pdf`),
        userId: user.uid
      }));

      setApplications(userApplications);
      setDocuments(userDocuments);
    } else {
      setApplications([]);
      setDocuments([]);
    }
  }, [user]);

  const createApplication = (name: string, type: Application["type"]) => {
    if (!user) throw new Error("Must be authenticated to create applications");
    
    const now = new Date().toISOString();
    const newApplication: Application = {
      id: `app-${uuidv4()}`,
      name,
      status: "draft",
      type,
      createdAt: now,
      updatedAt: now,
      userId: user.uid // Add user ID to new applications
    };

    setApplications((prev) => [...prev, newApplication]);
    return newApplication;
  };

  const getApplicationById = (id: string) => {
    return applications.find((app) => app.id === id && app.userId === user?.uid);
  };

  const getDocumentsByApplicationId = (applicationId: string) => {
    return documents.filter((doc) => doc.applicationId === applicationId && doc.userId === user?.uid);
  };

  const uploadDocument = (document: Omit<Document, "id" | "uploadedAt">) => {
    if (!user) throw new Error("Must be authenticated to upload documents");
    
    const now = new Date().toISOString();
    const newDocument: Document = {
      ...document,
      id: `doc-${uuidv4()}`,
      uploadedAt: now,
      userId: user.uid // Add user ID to new documents
    };

    setDocuments((prev) => [...prev, newDocument]);
    return newDocument;
  };

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  return (
    <ApplicationContext.Provider
      value={{
        applications,
        documents,
        createApplication,
        getApplicationById,
        getDocumentsByApplicationId,
        uploadDocument,
        removeDocument,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplication() {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error("useApplication must be used within an ApplicationProvider");
  }
  return context;
}
