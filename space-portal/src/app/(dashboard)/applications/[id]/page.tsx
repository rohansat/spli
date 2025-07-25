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
  const [aiLastUpdated, setAiLastUpdated] = useState<string | null>(null);

  const applicationId = params?.id as string;
  const application = applicationId ? getApplicationById(applicationId) : undefined;

  // Debug: Log form data changes
  useEffect(() => {
    console.log('Form data changed:', formData);
  }, [formData]);

  // Comprehensive command registry for AI
  const commandRegistry: Record<string, {
    description: string;
    execute: (params?: any) => Promise<{ success: boolean; message: string }>;
  }> = {
    // Form field operations
    'replace_field': {
      description: 'Replace a form field with new content',
      execute: async (params: { field: string; value: string }) => {
        const fieldMapping: Record<string, string> = {
          'mission objective': 'missionObjective',
          'missionobjective': 'missionObjective',
          'mission': 'missionObjective',
          'objective': 'missionObjective',
          'vehicle description': 'vehicleDescription',
          'vehicledescription': 'vehicleDescription',
          'vehicle': 'vehicleDescription',
          'launch reentry sequence': 'launchReentrySequence',
          'launchreentrysequence': 'launchReentrySequence',
          'launch sequence': 'launchReentrySequence',
          'reentry sequence': 'launchReentrySequence',
          'trajectory overview': 'trajectoryOverview',
          'trajectoryoverview': 'trajectoryOverview',
          'trajectory': 'trajectoryOverview',
          'safety considerations': 'safetyConsiderations',
          'safetyconsiderations': 'safetyConsiderations',
          'safety': 'safetyConsiderations',
          'ground operations': 'groundOperations',
          'groundoperations': 'groundOperations',
          'ground ops': 'groundOperations',
          'technical summary': 'technicalSummary',
          'technicalsummary': 'technicalSummary',
          'technical': 'technicalSummary',
          'dimensions mass stages': 'dimensionsMassStages',
          'dimensionsmassstages': 'dimensionsMassStages',
          'dimensions': 'dimensionsMassStages',
          'mass stages': 'dimensionsMassStages',
          'propulsion types': 'propulsionTypes',
          'propulsiontypes': 'propulsionTypes',
          'propulsion': 'propulsionTypes',
          'recovery systems': 'recoverySystems',
          'recoverysystems': 'recoverySystems',
          'recovery': 'recoverySystems',
          'ground support equipment': 'groundSupportEquipment',
          'groundsupportequipment': 'groundSupportEquipment',
          'ground support': 'groundSupportEquipment',
          'site names coordinates': 'siteNamesCoordinates',
          'sitenamescoordinates': 'siteNamesCoordinates',
          'site coordinates': 'siteNamesCoordinates',
          'coordinates': 'siteNamesCoordinates',
          'site operator': 'siteOperator',
          'siteoperator': 'siteOperator',
          'operator': 'siteOperator',
          'airspace maritime notes': 'airspaceMaritimeNotes',
          'airspacemaritimenotes': 'airspaceMaritimeNotes',
          'airspace notes': 'airspaceMaritimeNotes',
          'maritime notes': 'airspaceMaritimeNotes',
          'launch site': 'launchSite',
          'launchsite': 'launchSite',
          'launch location': 'launchSite',
          'launch window': 'launchWindow',
          'launchwindow': 'launchWindow',
          'window': 'launchWindow',
          'flight path': 'flightPath',
          'flightpath': 'flightPath',
          'path': 'flightPath',
          'landing site': 'landingSite',
          'landingsite': 'landingSite',
          'landing location': 'landingSite',
          'early risk assessments': 'earlyRiskAssessments',
          'earlyriskassessments': 'earlyRiskAssessments',
          'risk assessments': 'earlyRiskAssessments',
          'public safety challenges': 'publicSafetyChallenges',
          'publicsafetychallenges': 'publicSafetyChallenges',
          'safety challenges': 'publicSafetyChallenges',
          'planned safety tools': 'plannedSafetyTools',
          'plannedsafetytools': 'plannedSafetyTools',
          'safety tools': 'plannedSafetyTools',
          'full application timeline': 'fullApplicationTimeline',
          'fullapplicationtimeline': 'fullApplicationTimeline',
          'application timeline': 'fullApplicationTimeline',
          'timeline': 'fullApplicationTimeline',
          'intended window': 'intendedWindow',
          'intendedwindow': 'intendedWindow',
          'intended': 'intendedWindow',
          'license type intent': 'licenseTypeIntent',
          'licensetypeintent': 'licenseTypeIntent',
          'license intent': 'licenseTypeIntent',
          'license type': 'licenseTypeIntent',
          'clarify part450': 'clarifyPart450',
          'clarifypart450': 'clarifyPart450',
          'part450': 'clarifyPart450',
          'part 450': 'clarifyPart450',
          'unique tech international': 'uniqueTechInternational',
          'uniquetechinternational': 'uniqueTechInternational',
          'unique tech': 'uniqueTechInternational',
          'international': 'uniqueTechInternational'
        };

        const actualFieldName = fieldMapping[params.field.toLowerCase()];
        console.log('replace_field command:', {
          inputField: params.field,
          inputValue: params.value,
          mappedField: actualFieldName,
          availableFields: Object.keys(fieldMapping)
        });
        
        if (actualFieldName) {
          setFormData((prev) => {
            const updated = { ...prev, [actualFieldName]: params.value };
            console.log('Form data updated:', {
              previous: prev,
              updated: updated,
              changedField: actualFieldName,
              newValue: params.value
            });
            return updated;
          });
          setAiLastUpdated(actualFieldName);
          setTimeout(() => setAiLastUpdated(null), 3000); // Clear after 3 seconds
          return { success: true, message: `Updated ${params.field} with: "${params.value}"` };
        } else {
          return { success: false, message: `Field "${params.field}" not found. Available fields: ${Object.keys(fieldMapping).join(', ')}` };
        }
      }
    },

    // Application operations
    'save_draft': {
      description: 'Save the current application draft',
      execute: async () => {
        if (application?.status === "approved") {
          return { success: false, message: "This application is already approved and cannot be edited." };
        }
        await handleSave();
        return { success: true, message: "Draft saved successfully." };
      }
    },

    'submit_application': {
      description: 'Submit the application for review',
      execute: async () => {
        if (application?.status === "approved") {
          return { success: false, message: "This application is already approved and cannot be submitted again." };
        }
        handleSubmit();
        return { success: true, message: "Opening email dialog to submit application to FAA officials." };
      }
    },

    'delete_application': {
      description: 'Delete the current application',
      execute: async () => {
        // Implementation for deleting application
        return { success: true, message: "Application deleted successfully." };
      }
    },

    // Navigation operations
    'switch_tab': {
      description: 'Switch to a different form section tab',
      execute: async (params: { tab: string }) => {
        const tabMapping: Record<string, string> = {
          'concept of operations': 'section-0',
          'vehicle overview': 'section-1',
          'launch location': 'section-2',
          'launch information': 'section-3',
          'safety considerations': 'section-4',
          'timeline': 'section-5',
          'questions': 'section-6'
        };
        
        const tabId = tabMapping[params.tab.toLowerCase()];
        if (tabId) {
          setActiveTab(tabId);
          return { success: true, message: `Switched to ${params.tab} section.` };
        } else {
          return { success: false, message: `Tab "${params.tab}" not found. Available tabs: ${Object.keys(tabMapping).join(', ')}` };
        }
      }
    },

    // File operations
    'upload_file': {
      description: 'Upload a file to the application',
      execute: async (params: { file: File }) => {
        // Implementation for file upload
        return { success: true, message: `File "${params.file.name}" uploaded successfully.` };
      }
    },

    // Analysis operations
    'analyze_application': {
      description: 'Analyze the current application for completeness and compliance',
      execute: async () => {
        const filledFields = Object.keys(formData).filter(key => formData[key] && formData[key].trim() !== '');
        const totalFields = getAllFormFields().length;
        const completionPercentage = Math.round((filledFields.length / totalFields) * 100);
        
        const missingFields = getAllFormFields()
          .filter(field => !formData[field.name] || formData[field.name].trim() === '')
          .map(field => field.label);
        
        return {
          success: true,
          message: `Application Analysis:\n- Completion: ${completionPercentage}%\n- Filled fields: ${filledFields.length}/${totalFields}\n- Missing fields: ${missingFields.join(', ')}`
        };
      }
    },

    // Auto-fill operations
    'auto_fill': {
      description: 'Automatically fill form fields based on mission description',
      execute: async (params: { description: string }) => {
        try {
          const response = await fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userInput: params.description,
              mode: 'unified',
              conversationHistory: []
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            // Parse structured response and update form
            const sections = parseStructuredResponse(data.message);
            setFormData((prev) => ({ ...prev, ...sections }));
            return { success: true, message: "Form auto-filled based on your description." };
          }
          return { success: false, message: "Failed to auto-fill form." };
        } catch (error) {
          return { success: false, message: "Failed to auto-fill form." };
        }
      }
    },

    // Help operations
    'show_help': {
      description: 'Show available commands and help information',
      execute: async () => {
        const commands = Object.entries(commandRegistry).map(([key, cmd]) => 
          `- ${key}: ${cmd.description}`
        ).join('\n');
        
        return {
          success: true,
          message: `Available Commands:\n${commands}\n\nYou can also ask me to:\n- Replace any form field\n- Switch between sections\n- Analyze your application\n- Auto-fill based on descriptions\n- Save or submit your application`
        };
      }
    }
  };

  // Enhanced command execution function
  const executeCommand = async (command: string, params?: any) => {
    const cmd = commandRegistry[command as keyof typeof commandRegistry];
    if (cmd) {
      try {
        const result = await cmd.execute(params || {});
        return result;
      } catch (error) {
        return { success: false, message: `Error executing command: ${error}` };
      }
    } else {
      return { success: false, message: `Unknown command: ${command}` };
    }
  };

  // Parse structured response from AI
  const parseStructuredResponse = (response: string): Record<string, string> => {
    const sections: Record<string, string> = {};
    const lines = response.split('\n');
    let currentSection = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Check if this is a section header
      if (trimmed.match(/^[A-Z\s\/]+$/)) {
        currentSection = trimmed.toLowerCase().replace(/\s+/g, '');
      } else if (currentSection) {
        // Map section names to field names
        const fieldMapping: Record<string, string> = {
          'missionobjective': 'missionObjective',
          'vehicledescription': 'vehicleDescription',
          'launchreentrysequence': 'launchReentrySequence',
          'trajectoryoverview': 'trajectoryOverview',
          'safetyconsiderations': 'safetyConsiderations',
          'groundoperations': 'groundOperations',
          'technicalsummary': 'technicalSummary',
          'dimensionsmassstages': 'dimensionsMassStages',
          'propulsiontypes': 'propulsionTypes',
          'recoverysystems': 'recoverySystems',
          'groundsupportequipment': 'groundSupportEquipment',
          'sitenamescoordinates': 'siteNamesCoordinates',
          'siteoperator': 'siteOperator',
          'airspacemaritimenotes': 'airspaceMaritimeNotes',
          'launchsite': 'launchSite',
          'launchwindow': 'launchWindow',
          'flightpath': 'flightPath',
          'landingsite': 'landingSite',
          'earlyriskassessments': 'earlyRiskAssessments',
          'publicsafetychallenges': 'publicSafetyChallenges',
          'plannedsafetytools': 'plannedSafetyTools',
          'fullapplicationtimeline': 'fullApplicationTimeline',
          'intendedwindow': 'intendedWindow',
          'licensetypeintent': 'licenseTypeIntent',
          'clarifypart450': 'clarifyPart450',
          'uniquetechinternational': 'uniqueTechInternational'
        };
        
        const fieldName = fieldMapping[currentSection];
        if (fieldName) {
          sections[fieldName] = trimmed;
        }
      }
    }
    
    return sections;
  };

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
    const isRecentlyUpdated = aiLastUpdated === field.name;
    
    switch (field.type) {
      case "text":
      case "email":
        return (
          <div className="relative">
            <Input
              id={field.name}
              type={field.type}
              value={formData[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.label}
              className={`bg-white/10 border-white/20 text-white transition-all duration-300 ${
                isRecentlyUpdated ? 'border-green-400 bg-green-900/20' : ''
              }`}
            />
            {isRecentlyUpdated && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                AI Updated
              </div>
            )}
          </div>
        );
      case "textarea":
        return (
          <div className="relative">
            <Textarea
              id={field.name}
              value={formData[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.label}
              rows={4}
              className={`bg-white/10 border-white/20 text-white max-h-[300px] overflow-y-auto transition-all duration-300 ${
                isRecentlyUpdated ? 'border-green-400 bg-green-900/20' : ''
              }`}
            />
            {isRecentlyUpdated && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                AI Updated
              </div>
            )}
          </div>
        );
      case "select":
        return (
          <div className="relative">
            <select
              id={field.name}
              value={formData[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={`w-full p-2 rounded-md bg-white/10 border border-white/20 text-white transition-all duration-300 ${
                isRecentlyUpdated ? 'border-green-400 bg-green-900/20' : ''
              }`}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((option: string) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {isRecentlyUpdated && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                AI Updated
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const buttonSizeClass = showFloatingChat ? 'h-8 px-3 text-sm' : 'h-10 px-6 text-base';
  console.log('showFloatingChat:', showFloatingChat, 'buttonSizeClass:', buttonSizeClass);

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
      <div style={{ flex: showFloatingChat ? '0 1 calc(100% - 392px)' : '1 1 100%' }} className="min-w-0 transition-all duration-300">
        <div className="mb-8">
          <Link href="/dashboard" className="flex items-center text-white/70 hover:text-white transition-colors">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className={`flex flex-col ${showFloatingChat ? 'lg:flex-row' : 'md:flex-row'} justify-between items-start ${showFloatingChat ? 'lg:items-center' : 'md:items-center'} mb-8`}>
          <div className={`${showFloatingChat ? 'min-w-0 flex-1' : ''}`}>
            <h1 className={`${showFloatingChat ? 'text-2xl lg:text-3xl' : 'text-4xl'} font-bold text-white mb-3 break-words`}>{application.name}</h1>
            <div className={`flex ${showFloatingChat ? 'flex-col sm:flex-row' : 'items-center'} ${showFloatingChat ? 'gap-2' : ''}`}>
              <p className={`text-white/60 ${showFloatingChat ? 'text-sm' : 'mr-3'}`}>
                {application.type} • Created on{" "}
                {new Date(application.createdAt).toLocaleDateString()}
              </p>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium self-start ${
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

          <div className={`flex flex-col ${showFloatingChat ? 'lg:flex-row' : 'md:flex-row'} space-y-4 ${showFloatingChat ? 'lg:space-y-0 lg:space-x-2' : 'md:space-y-0 md:space-x-4'} mt-4 ${showFloatingChat ? 'lg:mt-0' : 'md:mt-0'}`}>
            <Button
              variant="outline"
              onClick={() => {
                console.log('AI Mode button clicked, setting showFloatingChat to true');
                setShowFloatingChat(true);
              }}
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

            <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
              <DialogTrigger asChild>
                <Button
                  disabled={application.status === "approved"}
                  className={`bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center ${buttonSizeClass}`}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Submit Application
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
                    className="relative flex items-start gap-4 w-full bg-transparent hover:bg-zinc-900/50
                      data-[state=active]:bg-zinc-900 data-[state=active]:text-white
                      px-4 py-4 text-white/70 justify-start text-left rounded-lg
                      hover:text-white transition-all duration-200 border border-transparent
                      data-[state=active]:border-white/10"
                  >
                    <div className="flex items-start gap-4 w-full">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center
                        data-[state=active]:bg-gradient-to-r from-blue-500 to-purple-500 mt-1"
                        data-state={activeTab === `section-${index}` ? 'active' : ''}>
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-medium text-sm leading-tight break-words whitespace-pre-line">{section.title}</span>
                        <span className="text-xs text-white/50 mt-1">Section {index + 1} of {part450FormTemplate.sections.length}</span>
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
          className="fixed top-24 right-6 z-50 w-[380px] max-w-full h-[520px] max-h-[75vh] flex flex-col shadow-2xl rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700/30 backdrop-blur-xl"
          style={{ 
            borderRadius: '1rem', 
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}
        >
          <div className="w-full h-full flex flex-col overflow-hidden relative">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent opacity-50"></div>
            
            <div className="relative flex items-center justify-between p-4 border-b border-gray-700/40 bg-gradient-to-r from-gray-800/90 via-gray-700/80 to-gray-800/90 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800 animate-pulse"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-lg tracking-tight">SPLI Assistant</span>
                  <span className="text-gray-400 text-xs font-medium">Online • Aerospace Compliance</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <button
                  className="text-gray-400 hover:text-white hover:bg-gray-700/50 p-2 rounded-lg transition-all duration-200 group"
                  onClick={() => setShowFloatingChat(false)}
                  title="Close chat"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
              <AIAssistantPanel
                ref={aiPanelRef}
                onCommand={async (cmd) => {
                  const lower = cmd.trim().toLowerCase();
                  console.log('Processing command:', cmd);
                  console.log('Lowercase command:', lower);
                  
                  // Use AI to intelligently parse and execute commands
                  try {
                    const response = await fetch('/api/ai', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        userInput: cmd,
                        context: `Current application data: ${JSON.stringify(formData)}. Available form fields: ${getAllFormFields().map(f => f.name).join(', ')}. Application status: ${application?.status}. Current tab: ${activeTab}. Parse this command and execute the appropriate action.`,
                        mode: 'command',
                        conversationHistory: []
                      }),
                    });
                    
                    if (response.ok) {
                      const data = await response.json();
                      console.log('AI command response:', data);
                      
                      // Parse the AI response to extract command and parameters
                      const commandMatch = data.message.match(/COMMAND:\s*([^\n]+)/i);
                      const paramsMatch = data.message.match(/PARAMS:\s*(\{.*\})/i);
                      
                      if (commandMatch && paramsMatch) {
                        const commandName = commandMatch[1].trim();
                        const params = JSON.parse(paramsMatch[1]);
                        
                        console.log('Executing command:', commandName, 'with params:', params);
                        const result = await executeCommand(commandName, params);
                        aiPanelRef.current?.addAIMsg(result.message);
                        return;
                      } else {
                        // If AI didn't return structured command, treat as regular response
                        aiPanelRef.current?.addAIMsg(data.message);
                        return;
                      }
                    }
                  } catch (error) {
                    console.error('AI command execution error:', error);
                  }

                  // Fallback to simple command detection
                  if (lower.includes('save') || lower.includes('save draft')) {
                    const result = await executeCommand('save_draft');
                    aiPanelRef.current?.addAIMsg(result.message);
                    return;
                  }

                  if (lower.includes('submit') || lower.includes('submit application')) {
                    const result = await executeCommand('submit_application');
                    aiPanelRef.current?.addAIMsg(result.message);
                    return;
                  }

                  if (lower.includes('analyze') || lower.includes('analysis')) {
                    const result = await executeCommand('analyze_application');
                    aiPanelRef.current?.addAIMsg(result.message);
                    return;
                  }

                  if (lower.includes('help') || lower.includes('commands')) {
                    const result = await executeCommand('show_help');
                    aiPanelRef.current?.addAIMsg(result.message);
                    return;
                  }

                  // Fallback to original regex method for field replacement
                  const replaceMatch = lower.match(/^replace (.+) with (.+)$/);
                  if (replaceMatch) {
                    const result = await executeCommand('replace_field', { field: replaceMatch[1], value: replaceMatch[2] });
                    aiPanelRef.current?.addAIMsg(result.message);
                    return;
                  }
                  
                  // For Part 450 questions, application analysis, and general help
                  if (lower.includes("part 450") || lower.includes("faa") || lower.includes("compliance") || 
                      lower.includes("regulation") || lower.includes("requirement") || lower.includes("license") ||
                      lower.includes("application") || lower.includes("mission") || lower.includes("vehicle") ||
                      lower.includes("launch") || lower.includes("safety") || lower.includes("risk") ||
                      lower.includes("trajectory") || lower.includes("ground operations") || lower.includes("recovery") ||
                      lower.includes("propulsion") || lower.includes("site") || lower.includes("timeline") ||
                      lower.includes("help") || lower.includes("how to") || lower.includes("what is") ||
                      lower.includes("explain") || lower.includes("tell me about") || lower.includes("guide") ||
                      lower.includes("process") || lower.includes("steps") || lower.includes("checklist") ||
                      lower.includes("review") || lower.includes("analyze") || lower.includes("suggest") ||
                      lower.includes("recommend") || lower.includes("improve") || lower.includes("complete") ||
                      lower.includes("missing") || lower.includes("required") || lower.includes("optional")) {
                    
                    // Use the AI service for comprehensive Part 450 assistance
                    try {
                      const response = await fetch('/api/ai', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          userInput: cmd,
                          context: `Current application data: ${JSON.stringify(formData)}. Available form fields: ${getAllFormFields().map(f => f.name).join(', ')}. Application status: ${application?.status}`,
                          mode: 'assistance',
                          conversationHistory: []
                        }),
                      });
                      
                      if (response.ok) {
                        const data = await response.json();
                        aiPanelRef.current?.addAIMsg(data.message);
                      } else {
                        aiPanelRef.current?.addAIMsg("I'm here to help with Part 450 applications, FAA compliance, and aerospace regulations. You can ask me about specific requirements, get guidance on filling out sections, or request analysis of your application.");
                      }
                    } catch (error) {
                      console.error('AI assistance error:', error);
                      aiPanelRef.current?.addAIMsg("I'm here to help with Part 450 applications, FAA compliance, and aerospace regulations. You can ask me about specific requirements, get guidance on filling out sections, or request analysis of your application.");
                    }
                    return;
                  }
                  
                  aiPanelRef.current?.addAIMsg("I can help with Part 450 applications, FAA compliance, and aerospace regulations. Try commands like 'save draft', 'submit application', 'replace [field] with [content]', 'fill section X with [content]', 'auto fill', or ask me questions about Part 450 requirements, your application, or aerospace compliance.");
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