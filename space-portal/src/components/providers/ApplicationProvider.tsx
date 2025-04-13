"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { Application, Document } from "@/types";
import { useAuth } from "@/lib/auth-context";

interface ApplicationContextType {
  applications: Application[];
  documents: Document[];
  createApplication: (name: string, type: Application["type"]) => Promise<Application>;
  getApplicationById: (id: string) => Application | undefined;
  getDocumentsByApplicationId: (applicationId: string) => Document[];
  uploadDocument: (document: Omit<Document, "id" | "uploadedAt">) => Promise<Document>;
  removeDocument: (id: string) => void;
  isLoading: boolean;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const createApplication = async (name: string, type: Application["type"]) => {
    const now = new Date().toISOString();
    const newApplication: Application = {
      id: uuidv4(),
      name,
      status: "draft",
      type,
      createdAt: now,
      updatedAt: now,
      userId: user?.uid || ""
    };

    setApplications(prev => [...prev, newApplication]);
    return newApplication;
  };

  const uploadDocument = async (document: Omit<Document, "id" | "uploadedAt">) => {
    const now = new Date().toISOString();
    const newDocument: Document = {
      id: uuidv4(),
      ...document,
      uploadedAt: now,
      userId: user?.uid || ""
    };

    setDocuments(prev => [...prev, newDocument]);
    return newDocument;
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const getApplicationById = (id: string) => {
    return applications.find((app) => app.id === id);
  };

  const getDocumentsByApplicationId = (applicationId: string) => {
    return documents.filter((doc) => doc.applicationId === applicationId);
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
        isLoading,
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
