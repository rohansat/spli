"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApplication } from "@/components/providers/ApplicationProvider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { part450FormTemplate } from "@/lib/mock-data";
import { PART450_SCHEMA, getCrossReferencesForField, TEAM_LABELS } from "@/lib/part450-schema";
import {
  loadApplicationRecord,
  saveApplicationRecord,
  getFieldAuthorship,
} from "@/lib/application-record-service";
import { workflowEngine } from "@/lib/workflow-engine";
import { WorkflowReadinessPanel } from "@/components/ui/workflow-readiness";
import { SectionHistoryPanel } from "@/components/ui/section-history-panel";
import type { ApplicationRecord } from "@/types/application-record";
import { ChevronLeft, Save, Send, AlertTriangle, Upload, X, Brain, Mail, Paperclip, ArrowRight, Lock, Link2 } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useSession } from 'next-auth/react';
import { AICursor } from "@/components/ui/ai-cursor";
import { AIAssistantPanelHandle } from "@/components/ui/AIAssistantPanel";
import { SpliChatWorkspace } from "@/components/ui/spli-chat-workspace";
import { useToast } from "@/components/ui/use-toast";
import { useApplicationAIHandlers } from "@/hooks/use-application-ai-handlers";
import type { Document } from "@/types";
import { cn } from "@/lib/utils";
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
  const [applicationRecord, setApplicationRecord] = useState<ApplicationRecord | null>(null);
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
                'launchreentrysequence': 'launchReEntrySequence',
          'launchsequence': 'launchReEntrySequence',
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
        const { record, formData: loaded } = await loadApplicationRecord(applicationId, user.email!);
        setApplicationRecord(record);
        setFormData(loaded);
      } catch (err) {
        console.error("Error loading application record:", err);
        // Fallback to legacy load
        try {
          const ref = doc(db, "applicationForms", `${user.email}_${applicationId}`);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data();
            if (data?.formData) setFormData(data.formData);
          }
        } catch {
          /* ignore */
        }
      }
    };
    fetchFormData();
  }, [applicationId, user?.email, application]);

  const formSummary = useMemo(() => {
    const fields: Array<{ name: string; label: string }> = [];
    part450FormTemplate.sections.forEach((section) => {
      section.fields.forEach((field) => {
        fields.push({ name: field.name, label: field.label });
      });
    });
    const filled = fields.filter((f) => formData[f.name]?.trim());
    const pct = fields.length > 0 ? Math.round((filled.length / fields.length) * 100) : 0;
    const filledLabels = filled.slice(0, 8).map((f) => f.label).join(', ');
    const missing = fields
      .filter((f) => !formData[f.name]?.trim())
      .slice(0, 5)
      .map((f) => f.label)
      .join(', ');
    return `Application "${application?.name || applicationId}" — ${pct}% complete (${filled.length}/${fields.length} fields). Filled: ${filledLabels || 'none'}. Missing: ${missing || 'none'}.`;
  }, [formData, application?.name, applicationId]);

  const workflowReadiness = useMemo(
    () => workflowEngine.evaluateReadiness(formData, applicationRecord ?? undefined),
    [formData, applicationRecord]
  );

  const navigateToSection = (sectionId: string) => {
    const idx = PART450_SCHEMA.sectionIds.indexOf(sectionId);
    if (idx >= 0) setActiveTab(`section-${idx}`);
  };

  const navigateToField = (fieldName: string) => {
    const idx = part450FormTemplate.sections.findIndex((s) =>
      s.fields.some((f) => f.name === fieldName)
    );
    if (idx >= 0) {
      setActiveTab(`section-${idx}`);
      setTimeout(() => document.getElementById(fieldName)?.focus(), 100);
    }
  };

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSave = async (dataOverride?: Record<string, string>) => {
    setIsSaving(true);
    const dataToSave = dataOverride ?? formData;
    try {
      if (user?.email && applicationId) {
        const baseRecord =
          applicationRecord ?? (await loadApplicationRecord(applicationId, user.email)).record;
        const { record } = await saveApplicationRecord(
          baseRecord,
          dataToSave,
          user.email,
          user.name ?? undefined
        );
        setApplicationRecord(record);
      }
      setSaveMessage("Application saved — version snapshot created");
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

  const { applySuggestions, handleApplicationInput } = useApplicationAIHandlers({
    applicationId,
    userEmail: user?.email ?? undefined,
    formData,
    setFormData,
    handleSave,
    navigateToField,
    onFieldApplied: (fieldName) => {
      setAiLastUpdated(fieldName);
      setTimeout(() => setAiLastUpdated(null), 3000);
    },
    executeCommand: async (command, params) => executeCommand(command, params),
    toast,
  });

  const handleSubmit = () => {
    if (!workflowReadiness.canSubmit) {
      toast({
        title: "Cannot submit yet",
        description: workflowReadiness.submissionGateMessage ?? "Resolve blocking items before submitting.",
        variant: "destructive",
      });
      return;
    }
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

  const formFieldClass =
    'rounded-lg border border-white/[0.08] bg-white/[0.03] text-white placeholder:text-white/30 transition-all duration-300 focus:border-white/20 focus:ring-1 focus:ring-white/10';

  const renderField = (field: FormField, sectionIndex: number) => {
    const isRecentlyUpdated = aiLastUpdated === field.name;
    const sectionId = PART450_SCHEMA.sectionIds[sectionIndex];
    const sectionState = workflowReadiness.sectionStates.find((s) => s.sectionId === sectionId);
    const isLocked = sectionState?.isLocked ?? false;
    const crossRefs = getCrossReferencesForField(field.name);
    const authorship = applicationRecord ? getFieldAuthorship(applicationRecord, field.name) : null;
    
    const fieldMeta = (
      <div className="mt-2 space-y-1">
        {authorship && (
          <p className="text-[10px] text-white/35">
            Last edited by {authorship.lastModifiedBy.split('@')[0]} ·{' '}
            {new Date(authorship.lastModifiedAt).toLocaleDateString()}
          </p>
        )}
        {crossRefs.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {crossRefs.map((ref) => (
              <button
                key={`${ref.sourceField}-${ref.targetField}`}
                type="button"
                onClick={() => navigateToField(ref.sourceField === field.name ? ref.targetField : ref.sourceField)}
                className="flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/[0.08] px-2 py-0.5 text-[10px] text-blue-200/80 transition-colors hover:border-blue-500/30 hover:bg-blue-500/12 hover:text-blue-100"
                title={ref.description}
              >
                <Link2 className="h-2.5 w-2.5 opacity-60" />
                {ref.relationship === 'must_align' ? 'Aligns with' : 'Related to'}{' '}
                {ref.sourceField === field.name ? ref.targetField : ref.sourceField}
              </button>
            ))}
          </div>
        )}
      </div>
    );

    const lockBanner = isLocked ? (
      <p className="mb-2 flex items-center gap-1 text-xs text-white/40">
        <Lock className="h-3 w-3" />
        {sectionState?.lockReason}
      </p>
    ) : null;
    
    switch (field.type) {
      case "text":
      case "email":
        return (
          <div className="relative space-y-2">
            {lockBanner}
            <Input
              id={field.name}
              type={field.type}
              value={formData[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.label}
              disabled={isLocked}
              className={cn(
                formFieldClass,
                isRecentlyUpdated && 'border-emerald-500/40 bg-emerald-500/[0.06]',
                isLocked && 'cursor-not-allowed opacity-50'
              )}
            />
            {isRecentlyUpdated && (
              <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                AI Updated
              </div>
            )}
            {fieldMeta}
          </div>
        );
      case "textarea":
        return (
          <div className="relative space-y-2">
            {lockBanner}
            <Textarea
              id={field.name}
              value={formData[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.label}
              rows={4}
              disabled={isLocked}
              className={cn(
                formFieldClass,
                'max-h-[300px] overflow-y-auto',
                isRecentlyUpdated && 'border-emerald-500/40 bg-emerald-500/[0.06]',
                isLocked && 'cursor-not-allowed opacity-50'
              )}
            />
            {isRecentlyUpdated && (
              <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                AI Updated
              </div>
            )}
            {fieldMeta}
          </div>
        );
      case "select":
        return (
          <div className="relative space-y-2">
            {lockBanner}
            <select
              id={field.name}
              value={formData[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              disabled={isLocked}
              className={cn(
                formFieldClass,
                'w-full p-2',
                isRecentlyUpdated && 'border-emerald-500/40 bg-emerald-500/[0.06]',
                isLocked && 'cursor-not-allowed opacity-50'
              )}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((option: string) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {isRecentlyUpdated && (
              <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                AI Updated
              </div>
            )}
            {fieldMeta}
          </div>
        );
      default:
        return null;
    }
  };

  const buttonSizeClass = showFloatingChat ? 'h-8 px-4 text-sm' : 'h-10 px-5 text-sm';
  const toolbarButtonClass = cn(
    'rounded-full border border-white/[0.12] bg-white/[0.03] text-white shadow-none',
    'hover:!border-white/20 hover:!bg-white/[0.08] hover:!text-white',
    buttonSizeClass
  );

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

  if (!application) {
    return null;
  }

  return (
    <div className="relative flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-black">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-48"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <div className={`relative z-10 flex-shrink-0 px-6 pt-8 pb-4 w-full ${showFloatingChat ? '' : 'max-w-[1400px] mx-auto'}`}>
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-white/50 transition-colors hover:text-white">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to dashboard
          </Link>
        </div>

        <div className="mb-2">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/40">
            Workbench
          </p>
          <h1 className={`${showFloatingChat ? 'text-2xl lg:text-3xl' : 'text-3xl'} mb-3 mt-2 break-words font-bold tracking-tight text-white`}>{application.name}</h1>
          <div className={`flex ${showFloatingChat ? 'flex-col sm:flex-row' : 'items-center'} ${showFloatingChat ? 'gap-2' : 'gap-3'}`}>
            <p className={`text-white/45 ${showFloatingChat ? 'text-sm' : 'text-sm'}`}>
              {application.type} • Created on{" "}
              {new Date(application.createdAt).toLocaleDateString()}
            </p>
            <span
              className={cn(
                'self-start rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide',
                application.status === 'draft' && 'border-white/15 bg-white/10 text-white/80',
                application.status === 'under_review' && 'border-amber-500/30 bg-amber-500/10 text-amber-200',
                application.status === 'submitted' && 'border-orange-500/30 bg-orange-500/10 text-orange-200',
                application.status === 'approved' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
                application.status === 'pending_approval' && 'border-blue-500/30 bg-blue-500/10 text-blue-200'
              )}
            >
              {application.status === "submitted" ? "SUBMITTED" : application.status.replace("_", " ").toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex min-h-0 w-full flex-1">
        <div className={`flex flex-col flex-1 min-w-0 min-h-0 ${showFloatingChat ? '' : 'max-w-[1400px] mx-auto w-full'}`}>
          <div className={`flex-shrink-0 px-6 pb-4 flex flex-col ${showFloatingChat ? 'lg:flex-row' : 'md:flex-row'} flex-wrap gap-2 ${showFloatingChat ? 'lg:items-center' : 'md:items-center'}`}>
            <Button
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.blur();
                setShowFloatingChat(!showFloatingChat);
              }}
              className={toolbarButtonClass}
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
                className={cn('inline-flex cursor-pointer items-center justify-center transition-colors', toolbarButtonClass)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Documents
              </label>
            </div>

            <Button
              variant="outline"
              onClick={() => void handleSave()}
              disabled={isSaving || application.status === "approved"}
              className={toolbarButtonClass}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={application.status === "approved" || !workflowReadiness.canSubmit}
              title={workflowReadiness.submissionGateMessage}
              className={cn(
                'rounded-full bg-white font-semibold text-black hover:bg-white/90 disabled:opacity-40',
                buttonSizeClass
              )}
            >
              <Mail className="mr-2 h-4 w-4" />
              {workflowReadiness.canSubmit ? 'Submit Application' : 'Submit Locked'}
            </Button>

            <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
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
                    className="rounded-full border-white/20 text-white hover:!bg-white/[0.08] hover:!text-white"
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

          <div className="flex-1 min-w-0 overflow-y-auto px-6 pb-8">

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

        <div className="mb-6 grid grid-cols-1 items-start gap-3 lg:grid-cols-2">
          <WorkflowReadinessPanel
            formData={formData}
            record={applicationRecord}
            onSectionClick={navigateToSection}
            onFieldClick={navigateToField}
          />
          {user?.email && (
            <SectionHistoryPanel
              applicationId={applicationId}
              userEmail={user.email}
              currentVersion={applicationRecord?.currentVersion ?? 0}
              onRollback={(data) => {
                setFormData(data);
                toast({ title: 'Restored previous version', description: 'Save to persist the rollback.' });
              }}
            />
          )}
        </div>

        {application.status === "draft" && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-200/90">Draft mode</p>
              <p className="text-xs text-white/45">
                Complete required fields in each section before submitting.
              </p>
            </div>
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <div className="mb-8 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
            <h3 className="mb-3 text-sm font-medium text-white">Uploaded documents</h3>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-black/20 p-2">
                  <span className="text-sm text-white/70">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-white/40 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex gap-8 items-start">
            <aside className="sticky top-4 w-[260px] flex-shrink-0 self-start">
              <p className="mb-3 px-1 text-[11px] font-medium uppercase tracking-wider text-white/40">
                Sections
              </p>
              <TabsList className="flex h-auto w-full flex-col gap-1 bg-transparent p-0">
                {part450FormTemplate.sections.map((section, index) => {
                  const sectionId = PART450_SCHEMA.sectionIds[index];
                  const state = workflowReadiness.sectionStates.find((s) => s.sectionId === sectionId);
                  const isActive = activeTab === `section-${index}`;
                  const completion = state?.completionPercent ?? 0;
                  return (
                  <TabsTrigger
                    key={`section-${index}`}
                    value={`section-${index}`}
                    disabled={state?.isLocked}
                    className={cn(
                      'relative flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left justify-start transition-colors',
                      'border-transparent bg-transparent text-white/45',
                      'hover:border-white/[0.06] hover:bg-white/[0.03] hover:text-white/70',
                      'data-[state=active]:border-white/[0.1] data-[state=active]:bg-white/[0.05] data-[state=active]:text-white',
                      'disabled:cursor-not-allowed disabled:opacity-40'
                    )}
                  >
                    <div className={cn(
                      'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border text-xs font-medium',
                      isActive
                        ? 'border-blue-500/30 bg-blue-500/15 text-blue-200'
                        : 'border-white/[0.08] bg-black/30 text-white/40'
                    )}>
                      {state?.isLocked ? (
                        <Lock className="h-3 w-3" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="text-xs font-medium leading-snug whitespace-pre-line">{section.title}</span>
                      <span className="mt-0.5 truncate text-[10px] text-white/30">
                        {state?.isLocked ? 'Locked' : `${completion}% complete`}
                      </span>
                    </div>
                  </TabsTrigger>
                  );
                })}
              </TabsList>
            </aside>

            <div className="min-w-0 flex-1">
              {part450FormTemplate.sections.map((section, sectionIndex) => (
                <TabsContent
                  key={`section-content-${sectionIndex}`}
                  value={`section-${sectionIndex}`}
                  className="mt-0 space-y-6 focus-visible:outline-none focus-visible:ring-0"
                >
                  <div className="border-b border-white/[0.06] pb-4">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                      Section {sectionIndex + 1} of {part450FormTemplate.sections.length}
                    </p>
                    <h2 className="mt-1 whitespace-pre-line text-xl font-semibold leading-snug text-white">
                      {section.title}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {section.fields.map((field, fieldIndex) => (
                      <div 
                        key={`field-${sectionIndex}-${fieldIndex}`} 
                        className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                      >
                        <label
                          htmlFor={field.name}
                          className="block text-xs font-medium uppercase tracking-wide text-white/60"
                        >
                          {field.label}
                        </label>
                        {renderField(field as FormField, sectionIndex)}
                      </div>
                    ))}
                  </div>

                  {sectionIndex < 6 && (
                    <div className="flex justify-end border-t border-white/[0.06] pt-4">
                      <Button
                        onClick={() => setActiveTab(`section-${sectionIndex + 1}`)}
                        variant="outline"
                        className={toolbarButtonClass}
                      >
                        Next section
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
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.06] p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="mb-2 text-xl font-bold text-white">Ready to Contact FAA?</h3>
                          <p className="text-white/60">
                            Send your application to FAA officials for review and consultation.
                          </p>
                        </div>
                        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
                          <DialogTrigger asChild>
                            <Button className="rounded-full bg-white px-6 py-3 font-semibold text-black hover:bg-white/90">
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
                                className="rounded-full border-white/20 text-white hover:!bg-white/[0.08] hover:!text-white"
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
        </div>

      {showFloatingChat && user?.email && (
        <SpliChatWorkspace
          panelRef={aiPanelRef}
          applicationId={applicationId}
          userEmail={user.email}
          formSummary={formSummary}
          formData={formData}
          onClose={() => setShowFloatingChat(false)}
          onFieldClick={navigateToField}
          onFormUpdate={applySuggestions}
          onCommand={handleApplicationInput}
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
      )}
      </div>
    </div>
  );
}