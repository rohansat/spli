"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Application, Document } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc } from "firebase/firestore";

interface ApplicationContextType {
  applications: Application[];
  documents: Document[];
  createApplication: (name: string, type: Application["type"]) => Promise<Application>;
  getApplicationById: (id: string) => Application | undefined;
  getDocumentsByApplicationId: (applicationId: string) => Document[];
  uploadDocument: (document: Omit<Document, "id" | "uploadedAt">) => Promise<Document>;
  removeDocument: (id: string) => Promise<void>;
  isLoading: boolean;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's applications and documents when they log in
  useEffect(() => {
    async function fetchUserData() {
      if (!user) {
        setApplications([]);
        setDocuments([]);
        setIsLoading(false);
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
    if (!user) throw new Error("Must be authenticated to create applications");
    
    const now = new Date().toISOString();
    const newApplication: Omit<Application, "id"> = {
      name,
      status: "draft",
      type,
      createdAt: now,
      updatedAt: now,
      userId: user.uid
    };

    try {
      // Add to Firestore
      const docRef = await addDoc(collection(db, "applications"), newApplication);
      const createdApplication = { ...newApplication, id: docRef.id } as Application;
      
      // Update local state
      setApplications(prev => [...prev, createdApplication]);
      return createdApplication;
    } catch (error) {
      console.error("Error creating application:", error);
      throw error;
    }
  };

  const uploadDocument = async (document: Omit<Document, "id" | "uploadedAt">) => {
    if (!user) throw new Error("Must be authenticated to upload documents");
    
    const now = new Date().toISOString();
    const newDocument: Omit<Document, "id"> = {
      ...document,
      uploadedAt: now,
      userId: user.uid
    };

    try {
      // Add to Firestore
      const docRef = await addDoc(collection(db, "documents"), newDocument);
      const createdDocument = { ...newDocument, id: docRef.id } as Document;
      
      // Update local state
      setDocuments(prev => [...prev, createdDocument]);
      return createdDocument;
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  };

  const removeDocument = async (id: string) => {
    if (!user) throw new Error("Must be authenticated to remove documents");

    try {
      // Remove from Firestore
      await deleteDoc(doc(db, "documents", id));
      
      // Update local state
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (error) {
      console.error("Error removing document:", error);
      throw error;
    }
  };

  const getApplicationById = (id: string) => {
    return applications.find((app) => app.id === id && app.userId === user?.uid);
  };

  const getDocumentsByApplicationId = (applicationId: string) => {
    return documents.filter((doc) => doc.applicationId === applicationId && doc.userId === user?.uid);
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
