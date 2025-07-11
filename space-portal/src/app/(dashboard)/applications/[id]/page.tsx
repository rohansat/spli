"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApplication } from "@/components/providers/ApplicationProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { part450FormTemplate } from "@/lib/mock-data";
import { ChevronLeft, Save, Send, AlertTriangle, Upload, X } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useSession } from 'next-auth/react';
import { AICursor } from "@/components/ui/ai-cursor";
import { AICursorButton } from "@/components/ui/ai-cursor-button";
import { AIAssistantPanel, AIAssistantPanelHandle } from "@/components/ui/AIAssistantPanel";
import React, { useRef } from "react";
import type { Document } from "@/types";
import { Rnd } from "react-rnd";

interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "select";
  options?: string[];
}

export default function ApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const { getApplicationById, uploadDocument, applications } = useApplication();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("section-0");
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [saveMessageType, setSaveMessageType] = useState<"success" | "error" | "">("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showAICursor, setShowAICursor] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;
  const aiPanelRef = useRef<AIAssistantPanelHandle>(null);
  const [showFloatingChat, setShowFloatingChat] = useState(false);
  const [chatWidth, setChatWidth] = useState(400);
  const [chatHeight, setChatHeight] = useState(600);

  const applicationId = params?.id as string;
  const application = applicationId ? getApplicationById(applicationId) : undefined;

  useEffect(() => {
    if (!application && applicationId) {
      router.push("/dashboard");
    }
  }, [application, applicationId, router]);

  useEffect(() => {
    if (!application || !user?.email) return;
    const fetchFormData = async () => {
      try {
        const ref = doc(db, "applicationForms", `${user.email}_${applicationId}`);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (data && data.formData) {
            setFormData(data.formData);
          }
        }
      } catch (err) {
        console.error("Error loading saved form data:", err);
      }
    };
    fetchFormData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, user?.email]);

  if (!application) {
    return null;
  }

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (user?.email && applicationId) {
        await setDoc(
          doc(db, "applicationForms", `${user.email}_${applicationId}`),
          { formData, userEmail: user.email, applicationId },
          { merge: true }
        );
      }
      setSaveMessage("Application saved successfully");
      setSaveMessageType("success");
      setTimeout(() => {
        setSaveMessage("");
        setSaveMessageType("");
      }, 3000);
    } catch (err) {
      setSaveMessage("Failed to save application");
      setSaveMessageType("error");
      setTimeout(() => {
        setSaveMessage("");
        setSaveMessageType("");
      }, 3000);
      console.error("Error saving form data:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call to submit application
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/dashboard");
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAIFillForm = (suggestions: Record<string, string>) => {
    setFormData((prev) => ({
      ...prev,
      ...suggestions,
    }));
  };

  // Get all form fields from the template
  const getAllFormFields = () => {
    return part450FormTemplate.sections.flatMap(section => 
      section.fields.map(field => ({
        name: field.name,
        label: field.label,
        type: field.type
      }))
    );
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case "text":
      case "email":
        return (
          <Input
            id={field.name}
            type={field.type}
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.label}
            className="bg-white/10 border-white/20 text-white"
          />
        );
      case "textarea":
        return (
          <Textarea
            id={field.name}
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.label}
            rows={4}
            className="bg-white/10 border-white/20 text-white"
          />
        );
      case "select":
        return (
          <select
            id={field.name}
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="w-full p-2 rounded-md bg-white/10 border border-white/20 text-white"
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative max-w-[1400px] mx-auto bg-black py-8 min-h-[80vh] flex flex-row gap-6">
      {/* Form area expands when chat is closed, shrinks when open */}
      <div style={{ flex: showFloatingChat ? `0 1 calc(100% - ${chatWidth + 32}px)` : '1 1 100%' }} className="min-w-0 transition-all duration-300">
        {/* Existing form content starts here */}
        <div className="mb-8">
          <Link href="/dashboard" className="flex items-center text-white/70 hover:text-white transition-colors">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-3">{application.name}</h1>
            <div className="flex items-center">
              <p className="text-white/60 mr-3">
                {application.type} • Created on{" "}
                {new Date(application.createdAt).toLocaleDateString()}
              </p>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  application.status === "draft"
                    ? "bg-zinc-500/20 text-zinc-300"
                    : application.status === "under_review"
                    ? "bg-yellow-500/20 text-yellow-300"
                    : application.status === "submitted"
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-green-500/20 text-green-300"
                }`}
              >
                {application.status === "submitted" ? "SUBMITTED" : application.status.replace("_", " ").toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mt-4 md:mt-0">
            <div className="relative">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileUpload}
                multiple
                accept=".pdf,.doc,.docx,.txt"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center justify-center px-6 py-2 border border-white/40 rounded-md text-white hover:bg-white/5 transition-colors h-10 text-base"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Documents
              </label>
            </div>

            <Button
              variant="outline"
              onClick={handleSave}
              disabled={isSaving || application.status === "approved"}
              className="border-white/40 text-white px-6"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || application.status === "approved"}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6"
            >
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </div>

        {saveMessage && (
          <Alert
            className={
              saveMessageType === "success"
                ? "mb-6 bg-green-500/20 border-green-500/30"
                : "mb-6 bg-red-500/20 border-red-500/30"
            }
          >
            <AlertTitle>{saveMessageType === "success" ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{saveMessage}</AlertDescription>
          </Alert>
        )}

        {application.status === "draft" && (
          <Alert className="mb-6 bg-blue-500/20 border-blue-500/30 text-white">
            <AlertTriangle className="h-4 w-4 mr-2" stroke="white" />
            <AlertTitle className="text-white">Draft Mode</AlertTitle>
            <AlertDescription className="text-white">
              This application is in draft mode. Complete all required fields before submitting.
            </AlertDescription>
          </Alert>
        )}

        {uploadedFiles.length > 0 && (
          <div className="mb-8 bg-white/5 p-4 rounded-lg border border-white/10">
            <h3 className="text-white font-medium mb-3">Uploaded Documents</h3>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-white/5 p-2 rounded">
                  <span className="text-sm text-white/80">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white">Part 450 License Application Form</h1>
            <p className="text-white/60 mt-2">Complete all sections of the pre application form to schedule your consultation with the FAA</p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex gap-10 mt-8 items-start">
            <div className="w-[300px] mt-20">
              <TabsList className="flex flex-col w-full min-h-[500px] gap-4 bg-black">
                {part450FormTemplate.sections.map((section, index) => (
                  <TabsTrigger
                    key={`section-${index}`}
                    value={`section-${index}`}
                    className="relative flex items-center gap-4 w-full bg-transparent hover:bg-zinc-900/50
                      data-[state=active]:bg-zinc-900 data-[state=active]:text-white
                      px-4 py-4 text-white/70 justify-start text-left rounded-lg
                      hover:text-white transition-all duration-200 border border-transparent
                      data-[state=active]:border-white/10"
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center
                        data-[state=active]:bg-gradient-to-r from-blue-500 to-purple-500"
                        data-state={activeTab === `section-${index}` ? 'active' : ''}>
                        <span className="text-sm font-medium">{index + 1}</span>
                        </div>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {section.title === "Preliminary Risk or Safety Considerations"
                            ? (<>
                                Preliminary Risk or Safety<br />Considerations
                              </>)
                          : section.title === "Planned Launch/Reentry Location(s)"
                            ? (<>
                                Planned Launch/Reentry<br />Location(s)
                              </>)
                          : section.title === "Concept of Operations (CONOPS)"
                            ? (<>
                                Concept of Operations<br />(CONOPS)
                              </>)
                            : section.title}
                        </span>
                        <span className="text-sm text-white/50">Section {index + 1} of {part450FormTemplate.sections.length}</span>
                      </div>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="flex-1 min-w-0 pr-4">
              {part450FormTemplate.sections.map((section, sectionIndex) => (
                <TabsContent
                  key={`section-content-${sectionIndex}`}
                  value={`section-${sectionIndex}`}
                  className="space-y-8 mt-0 focus-visible:outline-none focus-visible:ring-0"
                >
                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                      {section.title === "Preliminary Risk or Safety Considerations"
                        ? (<>
                            Preliminary Risk or Safety<br />Considerations
                          </>)
                        : section.title === "Planned Launch/Reentry Location(s)"
                          ? (<>
                              Planned Launch/Reentry<br />Location(s)
                            </>)
                          : section.title === "Concept of Operations (CONOPS)"
                            ? (<>
                                Concept of Operations<br />(CONOPS)
                              </>)
                            : section.title}
                    </h2>
                    <p className="text-white/60 text-lg">
                      Complete the {section.title.toLowerCase()} details
                    </p>
                  </div>

                  <div className="space-y-6">
                    {section.fields.map((field, fieldIndex) => (
                      <div 
                        key={`field-${sectionIndex}-${fieldIndex}`} 
                        className="space-y-3 bg-zinc-900/50 p-6 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                      >
                        <label
                          htmlFor={field.name}
                          className="text-base font-medium text-white flex items-center space-x-2"
                        >
                          {field.label}
                        </label>
                        {renderField(field as FormField)}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between pt-8">
                    {sectionIndex > 0 && (
                      <Button
                        variant="outline"
                        className="border-white/10 text-white hover:bg-white/5 transition-colors px-6"
                        onClick={() => setActiveTab(`section-${sectionIndex - 1}`)}
                      >
                        Previous Section
                      </Button>
                    )}
                    {sectionIndex < part450FormTemplate.sections.length - 1 && (
                      <Button
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 transition-opacity ml-auto px-6"
                        onClick={() => setActiveTab(`section-${sectionIndex + 1}`)}
                      >
                        Next Section
                      </Button>
                    )}
                  </div>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>

        {/* AI Cursor Button */}
        <AICursorButton onClick={() => setShowAICursor(true)} />

        {/* AI Cursor Modal */}
        <AICursor
          isVisible={showAICursor}
          onClose={() => setShowAICursor(false)}
          onFillForm={handleAIFillForm}
          formFields={getAllFormFields()}
        />
      </div>
      {/* Floating Chat Button below Draft Mode alert */}
      {application?.status === "draft" && (
        <div className="flex justify-end mt-4">
          {!showFloatingChat && (
            <button
              className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-xl hover:scale-110 transition-all border-4 border-zinc-900"
              onClick={() => setShowFloatingChat(true)}
              title="Open AI Chat"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 15h8M9 9h.01M15 9h.01" /></svg>
            </button>
          )}
        </div>
      )}
      {/* Floating, Resizable, Draggable Chat */}
      {showFloatingChat && (
        // @ts-ignore
        <Rnd
          size={{ width: chatWidth, height: chatHeight }}
          minWidth={340}
          minHeight={400}
          maxWidth={600}
          maxHeight={typeof window !== 'undefined' ? window.innerHeight - 40 : 800}
          default={{ x: typeof window !== 'undefined' ? window.innerWidth - chatWidth - 40 : 100, y: typeof window !== 'undefined' ? window.innerHeight / 2 - chatHeight / 2 : 100 }}
          bounds="window"
          onResizeStop={(
            e: MouseEvent | TouchEvent,
            direction: any,
            ref: HTMLDivElement,
            delta: { width: number; height: number },
            position: { x: number; y: number }
          ) => {
            setChatWidth(ref.offsetWidth);
            setChatHeight(ref.offsetHeight);
          }}
          onDragStop={(
            e: MouseEvent | TouchEvent,
            d: { x: number; y: number }
          ) => {
            // Optionally, persist position
          }}
          className="fixed z-50"
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col h-full w-full overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-900 rounded-t-2xl cursor-move">
              <span className="font-semibold text-white text-lg flex items-center gap-2">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 15h8M9 9h.01M15 9h.01" /></svg>
                AI Assistant
              </span>
              <button
                className="text-zinc-400 hover:text-white text-xl px-2 py-1 rounded"
                onClick={() => setShowFloatingChat(false)}
                title="Close chat"
              >
                ×
              </button>
            </div>
            <AIAssistantPanel
              ref={aiPanelRef}
              onCommand={async (cmd) => {
                const lower = cmd.trim().toLowerCase();
                if (lower === "save draft") {
                  if (application?.status === "approved") {
                    aiPanelRef.current?.addAIMsg("This application is already approved and cannot be edited.");
                    return;
                  }
                  await handleSave();
                  aiPanelRef.current?.addAIMsg("Draft saved successfully.");
                  return;
                }
                if (lower === "submit application") {
                  if (application?.status === "approved") {
                    aiPanelRef.current?.addAIMsg("This application is already approved and cannot be submitted again.");
                    return;
                  }
                  handleSubmit();
                  aiPanelRef.current?.addAIMsg("Application submitted. Redirecting to dashboard...");
                  return;
                }
                // Fill section command: e.g., fill section 2 with Launch details
                const fillMatch = lower.match(/^fill section (\d+) with (.+)$/);
                if (fillMatch) {
                  const sectionIdx = parseInt(fillMatch[1], 10) - 1;
                  const fillText = fillMatch[2];
                  const section = part450FormTemplate.sections[sectionIdx];
                  if (!section) {
                    aiPanelRef.current?.addAIMsg(`Section ${fillMatch[1]} does not exist.`);
                    return;
                  }
                  // Fill all text/textarea fields in the section with the provided text
                  const updates: Record<string, string> = {};
                  section.fields.forEach((field: any) => {
                    if (["text", "textarea"].includes(field.type)) {
                      updates[field.name] = fillText;
                    }
                  });
                  setFormData((prev) => ({ ...prev, ...updates }));
                  aiPanelRef.current?.addAIMsg(`Section ${fillMatch[1]} filled with: \"${fillText}\"`);
                  return;
                }
                aiPanelRef.current?.addAIMsg("Sorry, I didn't understand that command. Try 'save draft', 'submit application', or 'fill section X with ...'.");
              }}
              onFileDrop={async (files) => {
                if (!user) return;
                for (const file of files) {
                  const newDocument: Omit<Document, "id" | "uploadedAt"> = {
                    name: file.name,
                    type: "attachment",
                    applicationId: applicationId || undefined,
                    applicationName: application?.name || undefined,
                    fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                    url: URL.createObjectURL(file),
                    userId: user.email || "",
                  };
                  await uploadDocument(newDocument);
                  aiPanelRef.current?.addAIMsg(`Document "${file.name}" uploaded successfully and added to Document Management.`);
                }
              }}
            />
          </div>
        </Rnd>
      )}
    </div>
  );
}