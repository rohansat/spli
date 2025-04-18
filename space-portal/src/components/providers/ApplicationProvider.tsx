"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Application, Document } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";

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

  // Fetch user's data when they log in
  useEffect(() => {
    async function fetchUserData() {
      if (!user) {
        setApplications([]);
        setDocuments([]);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch applications
        const applicationsQuery = query(
          collection(db, "applications"),
          where("userId", "==", user.uid)
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);
        const applicationsData = applicationsSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        })) as Application[];
        setApplications(applicationsData);

        // Fetch documents
        const documentsQuery = query(
          collection(db, "documents"),
          where("userId", "==", user.uid)
        );
        const documentsSnapshot = await getDocs(documentsQuery);
        const documentsData = documentsSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        })) as Document[];
        setDocuments(documentsData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [user]);

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

    if (user) {
      try {
        await addDoc(collection(db, "applications"), newApplication);
      } catch (error) {
        console.error("Error saving application to Firestore:", error);
      }
    }

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

    if (user) {
      try {
        await addDoc(collection(db, "documents"), newDocument);
      } catch (error) {
        console.error("Error saving document to Firestore:", error);
      }
    }

    return newDocument;
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));

    if (user) {
      try {
        deleteDoc(doc(db, "documents", id));
      } catch (error) {
        console.error("Error removing document from Firestore:", error);
      }
    }
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
