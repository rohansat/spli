"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApplication } from "@/components/providers/ApplicationProvider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { part450FormTemplate } from "@/lib/mock-data";
import { ChevronLeft, Save, Send, AlertTriangle, Upload, X, Brain, Mail, Paperclip } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useSession } from 'next-auth/react';
import { AICursor } from "@/components/ui/ai-cursor";
import { AIAssistantPanel, AIAssistantPanelHandle } from "@/components/ui/AIAssistantPanel";
import type { Document } from "@/types";
// import { ComplianceDashboard } from '@/components/ui/compliance-dashboard';

interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "select";
  options?: string[];
}

export default function ApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const { getApplicationById, uploadDocument, updateApplicationStatus } = useApplication();
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
  
  // Compose message state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeMessage, setComposeMessage] = useState({
    recipient: "recipient@faa.gov",
    subject: "",
    body: ""
  });
  const [isSendingMessage, setIsSendingMessage] = useState(false);

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
    setIsComposeOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAIFillForm = (suggestions: Record<string, string>) => {
    setFormData((prev) => ({ ...prev, ...suggestions }));
  };

  const getAllFormFields = () => {
    const fields: Array<{ name: string; label: string; type: string }> = [];
    part450FormTemplate.sections.forEach((section) => {
      section.fields.forEach((field) => {
        fields.push({
          name: field.name,
          label: field.label,
          type: field.type,
        });
      });
    });
    return fields;
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
            className="bg-white/10 border-white/20 text-white max-h-[300px] overflow-y-auto"
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

  const buttonSizeClass = showFloatingChat ? 'h-8 px-3 text-sm' : 'h-10 px-6 text-base';

  const handleSendMessage = async () => {
    setIsSendingMessage(true);
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: composeMessage.recipient,
          subject: composeMessage.subject,
          body: composeMessage.body,
          applicationData: formData,
          applicationName: application?.name || 'Part 450 Application'
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (applicationId) {
          await updateApplicationStatus(applicationId, "pending_approval");
        }
        
        setIsComposeOpen(false);
        setSaveMessage(data.message || "Application submitted successfully! Status updated to Pending Approval.");
        setSaveMessageType("success");
        setTimeout(() => {
          setSaveMessage("");
          setSaveMessageType("");
        }, 5000);
        
        setComposeMessage({
          recipient: "recipient@faa.gov",
          subject: "",
          body: ""
        });
      } else {
        throw new Error(data.error || 'Failed to send email');
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setSaveMessage("Failed to send message to FAA");
      setSaveMessageType("error");
      setTimeout(() => {
        setSaveMessage("");
        setSaveMessageType("");
      }, 3000);
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="relative max-w-[1400px] mx-auto bg-black py-8 min-h-[80vh] flex flex-row gap-6">
      <div style={{ flex: showFloatingChat ? '0 1 calc(100% - 432px)' : '1 1 100%' }} className="min-w-0 transition-all duration-300">
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
            <Button
              variant="outline"
              onClick={() => setShowFloatingChat(true)}
              className={`border-white/40 text-white flex items-center justify-center ${buttonSizeClass}`}
            >
              <Brain className="mr-2 h-4 w-4" />
              AI Mode
            </Button>

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
                className={`cursor-pointer inline-flex items-center justify-center border border-white/40 rounded-md text-white hover:bg-white/5 transition-colors ${buttonSizeClass}`}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Documents
              </label>
            </div>

            <Button
              variant="outline"
              onClick={handleSave}
              disabled={isSaving || application.status === "approved"}
              className={`border-white/40 text-white flex items-center justify-center ${buttonSizeClass}`}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={application.status === "approved"}
              className={`bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center ${buttonSizeClass}`}
            >
              <Mail className="mr-2 h-4 w-4" />
              Submit Application
            </Button>
          </div>
        </div>

        {saveMessage && (
          <Alert
            className={
              saveMessageType === "success"
                ? "mb-6 bg-green-500/20 border-green-500/30 text-white"
                : "mb-6 bg-red-500/20 border-red-500/30 text-white"
            }
          >
            <AlertTitle className="text-white">{saveMessageType === "success" ? "Success" : "Error"}</AlertTitle>
            <AlertDescription className="text-white">{saveMessage}</AlertDescription>
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
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex gap-6 mt-8 items-start">
            <div className="w-[280px] mt-20">
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
                        <span className="font-medium">{section.title}</span>
                        <span className="text-sm text-white/50">Section {index + 1} of {part450FormTemplate.sections.length}</span>
                      </div>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="flex-1 min-w-0">
              {part450FormTemplate.sections.map((section, sectionIndex) => (
                <TabsContent
                  key={`section-content-${sectionIndex}`}
                  value={`section-${sectionIndex}`}
                  className="space-y-8 mt-0 focus-visible:outline-none focus-visible:ring-0"
                >
                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                      {section.title}
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

                  {sectionIndex === 6 && (
                    <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 rounded-xl border border-blue-500/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">Ready to Contact FAA?</h3>
                          <p className="text-white/70">
                            Send your application to FAA officials for review and consultation.
                          </p>
                        </div>
                        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
                          <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 transition-opacity px-6 py-3">
                              <Mail className="mr-2 h-4 w-4" />
                              Ready for FAA
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-black text-white border border-white/20">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-bold">COMPOSE MESSAGE</DialogTitle>
                              <DialogDescription className="text-white/60">
                                Send a message to FAA officials with your application attached
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <label htmlFor="recipient" className="text-sm font-medium text-white">
                                  To
                                </label>
                                <Input
                                  id="recipient"
                                  value={composeMessage.recipient}
                                  onChange={(e) =>
                                    setComposeMessage({ ...composeMessage, recipient: e.target.value })
                                  }
                                  placeholder="recipient@faa.gov"
                                  className="bg-white/10 border-white/20 text-white"
                                />
                              </div>
                              <div className="space-y-2">
                                <label htmlFor="subject" className="text-sm font-medium text-white">
                                  Subject
                                </label>
                                <Input
                                  id="subject"
                                  value={composeMessage.subject}
                                  onChange={(e) =>
                                    setComposeMessage({ ...composeMessage, subject: e.target.value })
                                  }
                                  placeholder="Enter subject"
                                  className="bg-white/10 border-white/20 text-white"
                                />
                              </div>
                              <div className="space-y-2">
                                <label htmlFor="body" className="text-sm font-medium text-white">
                                  Message
                                </label>
                                <Textarea
                                  id="body"
                                  value={composeMessage.body}
                                  onChange={(e) =>
                                    setComposeMessage({ ...composeMessage, body: e.target.value })
                                  }
                                  placeholder="Type your message here"
                                  rows={8}
                                  className="bg-white/10 border-white/20 text-white"
                                />
                              </div>
                              <div className="flex items-center gap-2 text-sm text-white/60">
                                <Paperclip className="h-4 w-4" />
                                <span>Application PDF will be attached automatically</span>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setIsComposeOpen(false)}
                                className="border-white/40 text-white"
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleSendMessage} 
                                disabled={isSendingMessage || !composeMessage.subject || !composeMessage.body}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                              >
                                <Send className="mr-2 h-4 w-4" />
                                {isSendingMessage ? "Sending..." : "SEND"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  )}
                </TabsContent>
              ))}
            </div>
          </Tabs>


        </div>

        <AICursor
          isVisible={showAICursor}
          onClose={() => setShowAICursor(false)}
          onFillForm={handleAIFillForm}
          formFields={getAllFormFields()}
        />
      </div>

      {showFloatingChat && (
        <div
          className="fixed top-24 right-10 z-50 w-[420px] max-w-full h-[600px] max-h-[80vh] flex flex-col shadow-2xl rounded-2xl bg-zinc-900 border border-zinc-800"
          style={{ borderRadius: '1rem', overflow: 'hidden' }}
        >
          <div className="w-full h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-900 rounded-t-2xl cursor-move">
              <span className="font-semibold text-white text-lg flex items-center gap-2">
                <span style={{fontSize: '1.5rem', lineHeight: 1}}>🚀</span>
                SPLI Chat
              </span>
              <button
                className="text-zinc-400 hover:text-white text-xl px-2 py-1 rounded"
                onClick={() => setShowFloatingChat(false)}
                title="Close chat"
              >
                ×
              </button>
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
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
                    aiPanelRef.current?.addAIMsg("Opening email dialog to submit application to FAA officials.");
                    return;
                  }
                  
                  aiPanelRef.current?.addAIMsg("I can help with general questions, form analysis, and dashboard commands like 'save draft', 'submit application', or 'fill section X with ...'. What would you like to do?");
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
                hideTabs={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}