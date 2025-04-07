"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { Application, Document } from "@/types";
import { applications as initialApplications, documents as initialDocuments } from "@/lib/mock-data";

interface ApplicationContextType {
  applications: Application[];
  documents: Document[];
  createApplication: (name: string, type: Application["type"]) => Application;
  getApplicationById: (id: string) => Application | undefined;
  getDocumentsByApplicationId: (applicationId: string) => Document[];
  uploadDocument: (document: Omit<Document, "id" | "uploadedAt">) => Document;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);

  const createApplication = (name: string, type: Application["type"]) => {
    const now = new Date().toISOString();
    const newApplication: Application = {
      id: `app-${uuidv4()}`,
      name,
      status: "draft",
      type,
      createdAt: now,
      updatedAt: now,
    };

    setApplications((prev) => [...prev, newApplication]);
    return newApplication;
  };

  const getApplicationById = (id: string) => {
    return applications.find((app) => app.id === id);
  };

  const getDocumentsByApplicationId = (applicationId: string) => {
    return documents.filter((doc) => doc.applicationId === applicationId);
  };

  const uploadDocument = (document: Omit<Document, "id" | "uploadedAt">) => {
    const now = new Date().toISOString();
    const newDocument: Document = {
      ...document,
      id: `doc-${uuidv4()}`,
      uploadedAt: now,
    };

    setDocuments((prev) => [...prev, newDocument]);
    return newDocument;
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
