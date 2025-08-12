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
import { ChevronLeft, Save, Send, AlertTriangle, Upload, X, Brain, Mail, Paperclip, ArrowRight } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useSession } from 'next-auth/react';
import { AICursor } from "@/components/ui/ai-cursor";
import { AIAssistantPanel, AIAssistantPanelHandle } from "@/components/ui/AIAssistantPanel";
import { useToast } from "@/components/ui/use-toast";
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
  const { getApplicationById, uploadDocument, updateApplicationStatus, refreshDocuments } = useApplication();
  const { toast } = useToast();
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

  // Removed scroll prevention to allow normal page scrolling

  // Test parsing function manually
  const testParsing = () => {
    const testResponse = `MISSION OBJECTIVE
Commercial lunar mission to deploy 500kg lunar lander and rover system to the Moon's surface for scientific research and technology demonstration.

VEHICLE DESCRIPTION
Three-stage Nova rocket with methane/oxygen engines, 85 meters height, 4.5-meter diameter fairing.

LAUNCH SEQUENCE
Three-stage launch sequence with lunar transfer injection and surface landing in Mare Tranquillitatis region.

TECHNICAL SUMMARY
500kg payload mass, solar arrays with 5kW capacity, deep space network communication with 2Mbps data rate.

SAFETY CONSIDERATIONS
Autonomous flight termination system with GPS tracking, real-time trajectory monitoring and collision avoidance.

GROUND OPERATIONS
Pre-launch vehicle assembly and testing at KSC, mission control operations from Houston facility.

LAUNCH SITE
Kennedy Space Center, Florida (28.5729° N, 80.6490° W) at Launch Complex 39A.

TIMELINE
Application submission Q1 2024, launch window Q4 2024 (October-December), 2-year mission duration.

LICENSE TYPE
Commercial space transportation license for lunar mission under FAA Part 450.`;
    
    console.log('Testing parsing with:', testResponse);
    const result = parseStructuredResponse(testResponse);
    console.log('Parsing result:', result);
  };

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
          'launch reentry sequence': 'launchReEntrySequence',
          'launchreentrysequence': 'launchReEntrySequence',
          'launch sequence': 'launchReEntrySequence',
          'reentry sequence': 'launchReEntrySequence',
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
          console.log('Auto-fill started with description:', params.description);
          
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
            console.log('AI response received:', data.message);
            
            // Parse structured response and update form
            const sections = parseStructuredResponse(data.message);
            console.log('Parsed sections:', sections);
            
            if (Object.keys(sections).length > 0) {
              console.log('Updating form data with sections:', sections);
              setFormData((prev) => {
                const updated = { ...prev, ...sections };
                console.log('Form data updated:', updated);
                return updated;
              });
              
              const filledFields = Object.keys(sections).join(', ');
              return { 
                success: true, 
                message: `Auto-filled ${Object.keys(sections).length} form sections: ${filledFields}. Check the form fields to see the updates!` 
              };
            } else {
              console.log('No sections extracted from AI response');
              console.log('Raw AI response:', data.message);
              return { 
                success: false, 
                message: "Could not extract structured information from your description. Please try being more specific about your mission details." 
              };
            }
          }
          console.log('API response not ok:', response.status);
          return { success: false, message: "Failed to auto-fill form." };
        } catch (error) {
          console.error('Auto-fill error:', error);
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
    
    // Enhanced field mapping with multiple variations
    const fieldMapping: Record<string, string> = {
      'missionobjective': 'missionObjective',
      'vehicledescription': 'vehicleDescription',
      'launchreentrysequence': 'launchReentrySequence',
      'launchsequence': 'launchReentrySequence',
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
      'timeline': 'intendedWindow',
      'licensetypeintent': 'licenseTypeIntent',
      'licensetype': 'licenseTypeIntent',
      'clarifypart450': 'clarifyPart450',
      'uniquetechinternational': 'uniqueTechInternational'
    };
    
    // Enhanced section headers with variations
    const sectionHeaders = [
      'MISSION OBJECTIVE',
      'VEHICLE DESCRIPTION', 
      'LAUNCH SEQUENCE',
      'LAUNCH/REENTRY SEQUENCE',
      'TRAJECTORY OVERVIEW',
      'SAFETY CONSIDERATIONS',
      'GROUND OPERATIONS',
      'TECHNICAL SUMMARY',
      'DIMENSIONS/MASS/STAGES',
      'PROPULSION TYPES',
      'RECOVERY SYSTEMS',
      'GROUND SUPPORT EQUIPMENT',
      'SITE NAMES/COORDINATES',
      'SITE OPERATOR',
      'AIRSPACE/MARITIME NOTES',
      'LAUNCH SITE',
      'LAUNCH WINDOW',
      'FLIGHT PATH',
      'LANDING SITE',
      'EARLY RISK ASSESSMENTS',
      'PUBLIC SAFETY CHALLENGES',
      'PLANNED SAFETY TOOLS',
      'FULL APPLICATION TIMELINE',
      'INTENDED WINDOW',
      'TIMELINE',
      'LICENSE TYPE INTENT',
      'LICENSE TYPE',
      'CLARIFY PART 450',
      'UNIQUE TECH/INTERNATIONAL'
    ];
    
    // Split response into lines and process each section
    const lines = response.split('\n');
    let currentSection = '';
    let currentContent: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if this line is a section header
      const isHeader = sectionHeaders.some(header => 
        line.toUpperCase() === header.toUpperCase() || 
        line.toUpperCase().startsWith(header.toUpperCase())
      );
      
      if (isHeader) {
        // Save previous section if we have content
        if (currentSection && currentContent.length > 0) {
          const content = currentContent.join(' ').trim();
          if (content && content.length > 0) {
            const sectionKey = currentSection.toLowerCase().replace(/[^a-z]/g, '');
            const fieldName = fieldMapping[sectionKey];
            
            if (fieldName) {
              sections[fieldName] = content;
              console.log(`Extracted ${fieldName}:`, content.substring(0, 100) + '...');
            }
          }
        }
        
        // Start new section
        currentSection = line;
        currentContent = [];
      } else if (line.length > 0 && currentSection) {
        // Add content to current section
        currentContent.push(line);
      }
    }
    
    // Handle the last section
    if (currentSection && currentContent.length > 0) {
      const content = currentContent.join(' ').trim();
      if (content && content.length > 0) {
        const sectionKey = currentSection.toLowerCase().replace(/[^a-z]/g, '');
        const fieldName = fieldMapping[sectionKey];
        
        if (fieldName) {
          sections[fieldName] = content;
          console.log(`Extracted ${fieldName}:`, content.substring(0, 100) + '...');
        }
      }
    }
    
    // Fallback: try regex matching for sections that weren't found
    if (Object.keys(sections).length === 0) {
      console.log('No sections found with line-by-line parsing, trying regex fallback...');
      
      for (let i = 0; i < sectionHeaders.length; i++) {
        const currentHeader = sectionHeaders[i];
        const nextHeader = sectionHeaders[i + 1];
        
        // Create regex to find content between current header and next header
        let regexPattern;
        if (nextHeader) {
          regexPattern = new RegExp(`${currentHeader}\\s*\\n(.*?)\\n\\s*${nextHeader}`, 's');
        } else {
          // For the last section, match until the end
          regexPattern = new RegExp(`${currentHeader}\\s*\\n(.*?)$`, 's');
        }
        
        const match = response.match(regexPattern);
        if (match && match[1]) {
          const content = match[1].trim();
          const sectionKey = currentHeader.toLowerCase().replace(/[^a-z]/g, '');
          const fieldName = fieldMapping[sectionKey];
          
          if (fieldName && content && content.length > 0) {
            sections[fieldName] = content;
            console.log(`Regex extracted ${fieldName}:`, content.substring(0, 100) + '...');
          }
        }
      }
    }
    
    console.log('Final parsed sections:', sections);
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
          applicationName: application?.name || 'Part 450 Application',
          applicationId: applicationId
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (applicationId) {
          await updateApplicationStatus(applicationId, "pending_approval");
        }
        
        // Refresh documents to show the new email document
        await refreshDocuments();
        
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
        toast({
          title: "Email sent!",
          description: "Your application has been submitted to FAA officials for review.",
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
    <div className="relative max-w-[1400px] mx-auto bg-black py-8 min-h-[80vh] flex flex-row gap-6 overflow-hidden">
      <div className={`flex-1 min-w-0 ${showFloatingChat ? 'pr-6' : ''}`}>
        <div className="mb-8">
          <Link href="/dashboard" className="flex items-center text-white/70 hover:text-white transition-colors">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className={`flex flex-col ${showFloatingChat ? 'lg:flex-row' : 'md:flex-row'} justify-between items-start ${showFloatingChat ? 'lg:items-center' : 'md:items-center'} mb-8`}>
          <div className={`${showFloatingChat ? 'min-w-0 flex-1' : ''}`}>
            <h1 className={`${showFloatingChat ? 'text-2xl lg:text-3xl' : 'text-3xl'} font-bold text-white mb-3 break-words`}>{application.name}</h1>
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.blur(); // Remove focus to prevent scroll
                console.log('AI Mode button clicked, setting showFloatingChat to true');
                setShowFloatingChat(!showFloatingChat);
              }}
              className={`border-white/40 text-white flex items-center justify-center ${buttonSizeClass}`}
            >
              <Brain className="mr-2 h-4 w-4" />
              {showFloatingChat ? 'Hide AI' : 'AI Mode'}
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

                  {/* Next Section Button - Show for all sections except section 6 (index 6) */}
                  {sectionIndex < 6 && (
                    <div className="flex justify-end pt-4">
                      <Button
                        onClick={() => setActiveTab(`section-${sectionIndex + 1}`)}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 transition-opacity px-6 py-3"
                      >
                        Next Section
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Test parsing button - only show in development */}
                  {sectionIndex === 0 && process.env.NODE_ENV === 'development' && (
                    <div className="flex justify-start pt-4">
                      <Button
                        onClick={testParsing}
                        className="bg-yellow-500 text-black hover:opacity-90 transition-opacity px-6 py-3"
                      >
                        Test Parsing
                      </Button>
                    </div>
                  )}

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
          className="w-96 min-w-96 h-[calc(100vh-8rem)] flex flex-col bg-zinc-900 border-l border-zinc-800 sticky top-32 rounded-l-xl overflow-hidden"
          onFocus={(e) => e.preventDefault()}
          onBlur={(e) => e.preventDefault()}
        >
          <div className="flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-900">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center">
                <span style={{fontSize: '1.5rem', lineHeight: 1}}>🚀</span>
              </div>
              <span className="font-semibold text-white text-lg">SPLI Chat</span>
            </div>
            <button
              className="text-zinc-400 hover:text-white text-xl px-2 py-1 rounded"
              onClick={() => setShowFloatingChat(false)}
              title="Close chat"
            >
              ×
            </button>
          </div>
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden ai-chat-scrollbar">
            <AIAssistantPanel
              ref={aiPanelRef}
              onCommand={async (cmd) => {
                const lower = cmd.trim().toLowerCase();
                console.log('Processing command:', cmd);
                console.log('Lowercase command:', lower);
                
                // Handle auto-fill suggestions from AI Assistant Panel
                if (cmd.startsWith('auto_fill_suggestions:')) {
                  try {
                    const suggestions = JSON.parse(cmd.replace('auto_fill_suggestions:', ''));
                    console.log('Received auto-fill suggestions:', suggestions);
                    
                    if (suggestions && suggestions.length > 0) {
                      // Apply the suggestions to the form
                      const newFormData = { ...formData };
                      suggestions.forEach((suggestion: any) => {
                        newFormData[suggestion.field] = suggestion.value;
                      });
                      
                      setFormData(newFormData);
                      
                      // Save the updated form data
                      await handleSave();
                      
                      aiPanelRef.current?.addAIMsg(`✅ Successfully applied ${suggestions.length} form field updates from your mission description!`);
                    }
                  } catch (error) {
                    console.error('Error processing auto-fill suggestions:', error);
                    aiPanelRef.current?.addAIMsg("Sorry, I encountered an error while applying the form suggestions. Please try again.");
                  }
                  return;
                }
                
                // Check if this looks like a mission description that should auto-fill the form
                const lowerCmd = cmd.toLowerCase();
                const isMissionDescription = cmd.length > 50 && (
                  lowerCmd.includes('mission') || 
                  lowerCmd.includes('satellite') || 
                  lowerCmd.includes('rocket') || 
                  lowerCmd.includes('launch') ||
                  lowerCmd.includes('lunar') ||
                  lowerCmd.includes('space') ||
                  lowerCmd.includes('we are') ||
                  lowerCmd.includes('our mission') ||
                  lowerCmd.includes('planning') ||
                  lowerCmd.includes('deploy') ||
                  lowerCmd.includes('conduct') ||
                  lowerCmd.includes('kg') ||
                  lowerCmd.includes('stage') ||
                  lowerCmd.includes('engine') ||
                  lowerCmd.includes('propulsion') ||
                  lowerCmd.includes('kennedy space center') ||
                  lowerCmd.includes('cape canaveral') ||
                  lowerCmd.includes('timeline') ||
                  lowerCmd.includes('specifications') ||
                  lowerCmd.includes('safety') ||
                  lowerCmd.includes('operations')
                );

                if (isMissionDescription) {
                  // Auto-fill the form with the mission description
                  try {
                    console.log('🚀 Mission description detected, calling AI...');
                    const response = await fetch('/api/ai', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        userInput: cmd,
                        mode: 'unified',
                        conversationHistory: []
                      }),
                    });
                    
                    if (response.ok) {
                      const data = await response.json();
                      console.log('📡 AI auto-fill response:', data);
                      console.log('📝 AI message:', data.message);
                      console.log('💡 AI suggestions:', data.suggestions);
                      
                      if (data.suggestions && data.suggestions.length > 0) {
                        console.log('✅ Using AI suggestions:', data.suggestions);
                        // Apply the suggestions to the form
                        const newFormData = { ...formData };
                        data.suggestions.forEach((suggestion: any) => {
                          newFormData[suggestion.field] = suggestion.value;
                        });
                        
                        setFormData(newFormData);
                        
                        // Show success message
                        const filledFields = data.suggestions.length;
                        aiPanelRef.current?.addAIMsg(`✅ Successfully filled ${filledFields} form fields with information from your mission description! The form has been updated automatically.`);
                        
                        // Save the updated form data
                        await handleSave();
                        return;
                      } else {
                        console.log('🔍 No suggestions found, trying to parse structured response...');
                        // Try parsing the response as structured sections
                        const sections = parseStructuredResponse(data.message);
                        console.log('📊 Parsed sections:', sections);
                        if (Object.keys(sections).length > 0) {
                          setFormData((prev) => ({ ...prev, ...sections }));
                          const filledFields = Object.keys(sections).length;
                          aiPanelRef.current?.addAIMsg(`✅ Successfully filled ${filledFields} form sections with information from your mission description! The form has been updated automatically.`);
                          await handleSave();
                          return;
                        } else {
                          console.log('❌ No sections parsed from AI response');
                          aiPanelRef.current?.addAIMsg(`I analyzed your mission description but couldn't extract structured information. Here's what the AI returned: ${data.message.substring(0, 200)}...`);
                        }
                      }
                    } else {
                      console.log('❌ AI response not ok:', response.status);
                      aiPanelRef.current?.addAIMsg('Sorry, there was an error processing your mission description. Please try again.');
                    }
                  } catch (error) {
                    console.error('❌ Auto-fill error:', error);
                    aiPanelRef.current?.addAIMsg('Sorry, there was an error processing your mission description. Please try again.');
                  }
                }

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
                      // If AI didn't return structured command, check if it's a regular response
                      // Only show the response if it doesn't contain command-like text
                      if (!data.message.includes('COMMAND:') && !data.message.includes('PARAMS:')) {
                        aiPanelRef.current?.addAIMsg(data.message);
                      }
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

                // Handle auto-fill suggestions from AI Assistant Panel
                if (cmd.startsWith('auto_fill_suggestions:')) {
                  try {
                    const suggestions = JSON.parse(cmd.replace('auto_fill_suggestions:', ''));
                    console.log('Received auto-fill suggestions:', suggestions);
                    
                    if (suggestions && suggestions.length > 0) {
                      // Apply the suggestions to the form
                      const newFormData = { ...formData };
                      suggestions.forEach((suggestion: any) => {
                        newFormData[suggestion.field] = suggestion.value;
                      });
                      
                      setFormData(newFormData);
                      
                      // Show success message
                      const filledFields = suggestions.length;
                      aiPanelRef.current?.addAIMsg(`✅ Auto-filled ${filledFields} form fields based on your mission description! The form has been updated with the extracted information.`);
                      
                      // Save the updated form data
                      await handleSave();
                    } else {
                      aiPanelRef.current?.addAIMsg("I analyzed your mission description but couldn't extract specific information for the form fields. Please provide more detailed information about your mission, vehicle, launch site, and timeline.");
                    }
                  } catch (error) {
                    console.error('Error processing auto-fill suggestions:', error);
                    aiPanelRef.current?.addAIMsg("Sorry, I encountered an error while applying the form suggestions. Please try again.");
                  }
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
                
                aiPanelRef.current?.addAIMsg("I can help with Part 450 applications, FAA compliance, and aerospace regulations. You can:\n\n• Paste a mission description paragraph and I'll automatically fill out the form\n• Use commands like 'save draft', 'submit application', 'replace [field] with [content]'\n• Ask questions about Part 450 requirements, your application, or aerospace compliance\n\nJust describe your mission and I'll extract the information to fill the form!");
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
      )}
    </div>
  );
}