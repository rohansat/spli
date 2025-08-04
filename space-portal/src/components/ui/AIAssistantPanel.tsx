"use client";

import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from "react";
import { Paperclip, Send, UploadCloud, User, Bot, ThumbsUp, ThumbsDown, RefreshCw, Copy, Check, Sparkles, X, ChevronRight, MousePointer, Search, Palette, BookOpen, Globe, Pencil, FileText, Brain, Zap, Shield, Rocket, Clock, HelpCircle, Lightbulb, Settings, CheckCircle } from "lucide-react";
import { AIContextMenu } from "./ai-context-menu";
import { Button } from "./button";
import dayjs from "dayjs";
import { part450FormTemplate } from "@/lib/mock-data";
import { Textarea } from './textarea';
import { AIQuickActions } from './ai-quick-actions';

interface Message {
  id: number;
  sender: "user" | "ai";
  content: string;
  timestamp: number;
  type?: "text" | "diff" | "change" | "document_analysis";
  diffData?: {
    oldContent: string;
    newContent: string;
    filePath: string;
    description: string;
  };
  documentInsights?: {
    technicalSpecifications: string[];
    missionObjectives: string[];
    safetyConsiderations: string[];
    timelineInformation: string[];
    missingInformation: string[];
    complianceRequirements: string[];
    integrationSuggestions: string[];
  };
  isTyping?: boolean;
  reactions?: {
    thumbsUp?: boolean;
    thumbsDown?: boolean;
  };
}

export interface AIAssistantPanelHandle {
  addAIMsg: (msg: string) => void;
  addDiffMsg: (msg: string, oldContent: string, newContent: string, filePath: string, description: string) => void;
  addDocumentAnalysisMsg: (msg: string, insights: any) => void;
  showTypingIndicator: () => void;
  hideTypingIndicator: () => void;
}

interface AIAssistantPanelProps {
  onCommand?: (command: string) => void;
  onFileDrop?: (files: FileList | File[]) => void;
  hideTabs?: boolean;
}

export const AIAssistantPanel = forwardRef<AIAssistantPanelHandle, AIAssistantPanelProps>(
  ({ onCommand, onFileDrop, hideTabs }, ref) => {
    const [messages, setMessages] = useState<Message[]>([
      {
        id: 1,
        sender: "ai",
        content: "Hi! I am SPLI. How can I help you today?",
        timestamp: Date.now()
      }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [input, setInput] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
    const [showQuickActions, setShowQuickActions] = useState(false);
    const [analytics, setAnalytics] = useState<any>(null);
    const [suggestionsUsed, setSuggestionsUsed] = useState(0);
    const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Context menu state
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
    const [contextSearchTerm, setContextSearchTerm] = useState("");
    const [cursorPosition, setCursorPosition] = useState(0);
    const [selectedField, setSelectedField] = useState<any>(null);

    // Check if user is at the bottom of the chat
    const isAtBottom = () => {
      if (!messagesContainerRef.current) return true;
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      return scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
    };

    // Smart auto-scroll that only scrolls if user is at bottom
    const scrollToBottom = (force = false) => {
      if (force || shouldAutoScroll) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    };

    // Handle scroll events to determine if we should auto-scroll
    const handleScroll = () => {
      const atBottom = isAtBottom();
      setShouldAutoScroll(atBottom);
    };

    useImperativeHandle(ref, () => ({
      addAIMsg: (msg: string) => {
        setMessages((msgs) => [
          ...msgs,
          { id: Date.now(), sender: "ai", content: msg, timestamp: Date.now() }
        ]);
        // Force scroll to bottom for AI messages
        setTimeout(() => scrollToBottom(true), 100);
      },
      addDiffMsg: (msg: string, oldContent: string, newContent: string, filePath: string, description: string) => {
        setMessages((msgs) => [
          ...msgs,
          { 
            id: Date.now(), 
            sender: "ai", 
            content: msg, 
            timestamp: Date.now(),
            type: "diff",
            diffData: {
              oldContent,
              newContent,
              filePath,
              description
            }
          }
        ]);
        // Force scroll to bottom for AI messages
        setTimeout(() => scrollToBottom(true), 100);
      },
      addDocumentAnalysisMsg: (msg: string, insights: any) => {
        setMessages((msgs) => [
          ...msgs,
          { 
            id: Date.now(), 
            sender: "ai", 
            content: msg, 
            timestamp: Date.now(),
            type: "document_analysis",
            documentInsights: insights
          }
        ]);
        // Force scroll to bottom for AI messages
        setTimeout(() => scrollToBottom(true), 100);
      },
      showTypingIndicator: () => {
        setMessages((msgs) => [
          ...msgs,
          { 
            id: Date.now(), 
            sender: "ai", 
            content: "", 
            timestamp: Date.now(),
            isTyping: true
          }
        ]);
        setTimeout(() => scrollToBottom(true), 100);
      },
      hideTypingIndicator: () => {
        setMessages((msgs) => msgs.filter(msg => !msg.isTyping));
      }
    }), []);

    // Auto-scroll to latest message only when messages change and user is at bottom
    React.useEffect(() => {
      scrollToBottom();
    }, [messages]);

    const handleReaction = (messageId: number, reaction: 'thumbsUp' | 'thumbsDown') => {
      setMessages((msgs) =>
        msgs.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                reactions: {
                  ...msg.reactions,
                  [reaction]: !msg.reactions?.[reaction]
                }
              }
            : msg
        )
      );
    };

    const copyMessage = async (content: string, messageId: number) => {
      try {
        await navigator.clipboard.writeText(content);
        setCopiedMessageId(messageId);
        setTimeout(() => setCopiedMessageId(null), 2000);
      } catch (error) {
        console.error('Failed to copy message:', error);
      }
    };

    const retryMessage = async (messageId: number) => {
      const message = messages.find(msg => msg.id === messageId);
      if (message && message.sender === 'user') {
        setInput(message.content);
        // Remove the failed message and retry
        setMessages((msgs) => msgs.filter(msg => msg.id !== messageId));
        await handleSend();
      }
    };

    const handleQuickAction = (prompt: string) => {
      console.log('Quick action selected:', prompt);
      setInput(prompt);
      setShowQuickActions(false);
    };

    const handleSend = async (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      if (!input.trim() || isLoading) return;
      
      const userMessage = input;
      setMessages((msgs) => [
        ...msgs,
        { id: Date.now(), sender: "user", content: userMessage, timestamp: Date.now() }
      ]);
      setInput("");
      setIsLoading(true);
      // Force scroll to bottom when user sends a message
      setTimeout(() => scrollToBottom(true), 100);

      // Process @ mentions and add context
      let processedMessage = userMessage;
      let formContext = "";
      
      // Extract @ mentions
      const atMentions = userMessage.match(/@([^@\s]+)/g);
      if (atMentions) {
        const contextParts: string[] = [];
        
        atMentions.forEach(mention => {
          const path = mention.substring(1); // Remove @
          const pathParts = path.split(' > ');
          
          if (pathParts.length === 2) {
            // Section > Field format
            const sectionTitle = pathParts[0];
            const fieldLabel = pathParts[1];
            
            // Find the section and field in the form template
            const section = part450FormTemplate.sections.find((s: any) => 
              s.title.toLowerCase().includes(sectionTitle.toLowerCase())
            );
            
            if (section) {
              const field = section.fields.find((f: any) => 
                f.label.toLowerCase().includes(fieldLabel.toLowerCase())
              );
              
              if (field) {
                contextParts.push(`Section: ${section.title}\nField: ${field.label}\nType: ${field.type}`);
              }
            }
          } else {
            // Just section name
            const section = part450FormTemplate.sections.find((s: any) => 
              s.title.toLowerCase().includes(path.toLowerCase())
            );
            
            if (section) {
              contextParts.push(`Section: ${section.title}\nFields: ${section.fields.map((f: any) => f.label).join(', ')}`);
            }
          }
        });
        
        if (contextParts.length > 0) {
          formContext = `\n\nForm Context:\n${contextParts.join('\n\n')}`;
          processedMessage = userMessage.replace(/@([^@\s]+)/g, (match, path) => {
            return `[${path}]`;
          });
        }
      }

      // Detect special commands and modes
      const lowerMessage = userMessage.toLowerCase();
      let mode = 'unified';
      
      if (lowerMessage.includes('ready for faa') || lowerMessage.includes('faa form')) {
        mode = 'form';
      } else if (lowerMessage.includes('analyze document') || lowerMessage.includes('document analysis')) {
        mode = 'document_analysis';
      } else if (lowerMessage.includes('strengthen') || lowerMessage.includes('enhance') || lowerMessage.includes('improve')) {
        mode = 'assistance';
      } else if (lowerMessage.includes('auto fill') || 
                 lowerMessage.includes('fill form') || 
                 lowerMessage.includes('fill out') ||
                 lowerMessage.includes('mission description') ||
                 lowerMessage.includes('satellite') ||
                 lowerMessage.includes('rocket') ||
                 lowerMessage.includes('launch') ||
                 lowerMessage.includes('earth observation') ||
                 lowerMessage.includes('200kg') ||
                 lowerMessage.includes('cape canaveral') ||
                 lowerMessage.includes('q3 2024') ||
                 lowerMessage.includes('solid fuel') ||
                 lowerMessage.includes('two-stage') ||
                 lowerMessage.includes('500km') ||
                 lowerMessage.includes('environmental monitoring') ||
                 lowerMessage.includes('disaster response')) {
        mode = 'form';
      }

      // Call the unified AI API
      try {
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userInput: processedMessage + formContext,
            mode: mode,
            conversationHistory: messages, // Send conversation history for context
            documents: uploadedDocuments // Send uploaded documents for analysis
          }),
        });

        if (!response.ok) {
          throw new Error('AI API request failed');
        }

        const data = await response.json();
        
        // Store analytics if provided
        if (data.analytics) {
          setAnalytics(data.analytics);
        }

        // Handle form suggestions if present
        if (data.suggestions && data.suggestions.length > 0) {
          const suggestionText = `I've analyzed your mission description and extracted information for ${data.suggestions.length} form fields. The form has been automatically updated with this information.`;
          
          setMessages((msgs) => [
            ...msgs,
            { id: Date.now(), sender: "ai", content: suggestionText, timestamp: Date.now() }
          ]);
          
          // Track suggestions used
          setSuggestionsUsed(prev => prev + data.suggestions.length);
          
          // If there's a command handler, call it with the suggestions
          if (onCommand) {
            onCommand(`auto_fill_suggestions:${JSON.stringify(data.suggestions)}`);
          }
        } else if (data.documentInsights) {
          // Handle document analysis results
          setMessages((msgs) => [
            ...msgs,
            { 
              id: Date.now(), 
              sender: "ai", 
              content: data.message, 
              timestamp: Date.now(),
              type: "document_analysis",
              documentInsights: data.documentInsights
            }
          ]);
        } else {
          setMessages((msgs) => [
            ...msgs,
            { id: Date.now(), sender: "ai", content: data.message, timestamp: Date.now() }
          ]);
        }

        // If there's a command handler, call it
        if (onCommand) onCommand(userMessage);
      } catch (error) {
        console.error('AI API Error:', error);
        let errorMessage = "Sorry, I'm having trouble connecting to the AI service. Please try again.";
        
        if (error instanceof Error) {
          errorMessage = `Error: ${error.message}`;
        }
        
        setMessages((msgs) => [
          ...msgs,
          { id: Date.now(), sender: "ai", content: errorMessage, timestamp: Date.now() }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (onFileDrop && files.length > 0) {
        onFileDrop(files);
        // Add files to uploaded documents for AI analysis
        files.forEach(file => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const content = e.target?.result as string;
            setUploadedDocuments(prev => [...prev, {
              name: file.name,
              content: content,
              type: file.type
            }]);
          };
          reader.readAsText(file);
        });
      }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && onFileDrop) {
        const files = Array.from(e.target.files);
        onFileDrop(files);
        // Add files to uploaded documents for AI analysis
        files.forEach(file => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const content = e.target?.result as string;
            setUploadedDocuments(prev => [...prev, {
              name: file.name,
              content: content,
              type: file.type
            }]);
          };
          reader.readAsText(file);
        });
      }
    };

    // Context menu handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setInput(value);
      
      // Check for @ mention with auto-completion
      const cursorPos = e.target.selectionStart;
      const beforeCursor = value.substring(0, cursorPos);
      const atMatch = beforeCursor.match(/@([^@\s]*)$/);
      
      if (atMatch) {
        const searchTerm = atMatch[1];
        setContextSearchTerm(searchTerm);
        
        // Calculate position for context menu - position it relative to the chat panel
        const textarea = e.target;
        const chatPanel = textarea.closest('.chat-panel') as HTMLElement;
        
        if (chatPanel) {
          const panelRect = chatPanel.getBoundingClientRect();
          const textareaRect = textarea.getBoundingClientRect();
          
          // Position relative to the chat panel, above the input area but not overlapping messages
          const x = 0; // Align to left edge of chat panel
          const y = -200; // Position above the input area with reduced height
          
          setContextMenuPosition({ x, y });
        } else {
          // Fallback to absolute positioning
          const rect = textarea.getBoundingClientRect();
          setContextMenuPosition({ x: rect.left, y: rect.top - 320 });
        }
        
        setShowContextMenu(true);
        setCursorPosition(cursorPos);
      } else {
        setShowContextMenu(false);
      }
    };

    const handleContextMenuSelect = (item: any) => {
      // Set the selected field for direct editing
      setSelectedField(item);
      
      // Replace the @ mention with the selected item
      const beforeAt = input.substring(0, cursorPosition - contextSearchTerm.length - 1);
      const afterAt = input.substring(cursorPosition);
      
      // Use the full field path for auto-completion
      const replacement = `@${item.path}`;
      const newInput = beforeAt + replacement + afterAt;
      
      setInput(newInput);
      setShowContextMenu(false);
      setContextSearchTerm("");
      
      // Focus back to textarea
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      if (textarea) {
        const newCursorPos = beforeAt.length + replacement.length;
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    };

    const handleContextMenuClose = () => {
      setShowContextMenu(false);
      setContextSearchTerm("");
    };

    // Handle clicks outside the context menu
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (showContextMenu) {
          const target = event.target as Element;
          if (!target.closest('.context-menu') && !target.closest('textarea')) {
            setShowContextMenu(false);
            setContextSearchTerm("");
          }
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [showContextMenu]);

    const renderTypingIndicator = () => (
      <div className="flex items-center gap-2 px-3 py-2 max-w-[75%] bg-zinc-800 text-zinc-200 rounded-lg rounded-bl-md border border-zinc-700">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <span className="text-sm text-zinc-400">AI is thinking...</span>
      </div>
    );

    const renderDocumentAnalysis = (insights: any) => {
      return (
        <div className="space-y-4 mt-3">
          {insights.technicalSpecifications.length > 0 && (
            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
              <h4 className="font-medium text-blue-300 mb-2 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Technical Specifications
              </h4>
              <ul className="space-y-1">
                {insights.technicalSpecifications.map((spec: string, index: number) => (
                  <li key={index} className="text-sm text-blue-200">• {spec}</li>
                ))}
              </ul>
            </div>
          )}
          
          {insights.missionObjectives.length > 0 && (
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-3">
              <h4 className="font-medium text-green-300 mb-2 flex items-center gap-2">
                <Rocket className="h-4 w-4" />
                Mission Objectives
              </h4>
              <ul className="space-y-1">
                {insights.missionObjectives.map((objective: string, index: number) => (
                  <li key={index} className="text-sm text-green-200">• {objective}</li>
                ))}
              </ul>
            </div>
          )}
          
          {insights.safetyConsiderations.length > 0 && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
              <h4 className="font-medium text-red-300 mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Safety Considerations
              </h4>
              <ul className="space-y-1">
                {insights.safetyConsiderations.map((safety: string, index: number) => (
                  <li key={index} className="text-sm text-red-200">• {safety}</li>
                ))}
              </ul>
            </div>
          )}
          
          {insights.timelineInformation.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3">
              <h4 className="font-medium text-yellow-300 mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timeline Information
              </h4>
              <ul className="space-y-1">
                {insights.timelineInformation.map((timeline: string, index: number) => (
                  <li key={index} className="text-sm text-yellow-200">• {timeline}</li>
                ))}
              </ul>
            </div>
          )}
          
          {insights.missingInformation.length > 0 && (
            <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-3">
              <h4 className="font-medium text-orange-300 mb-2 flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Missing Information
              </h4>
              <ul className="space-y-1">
                {insights.missingInformation.map((missing: string, index: number) => (
                  <li key={index} className="text-sm text-orange-200">• {missing}</li>
                ))}
              </ul>
            </div>
          )}
          
          {insights.complianceRequirements.length > 0 && (
            <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-3">
              <h4 className="font-medium text-purple-300 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Compliance Requirements
              </h4>
              <ul className="space-y-1">
                {insights.complianceRequirements.map((req: string, index: number) => (
                  <li key={index} className="text-sm text-purple-200">• {req}</li>
                ))}
              </ul>
            </div>
          )}
          
          {insights.integrationSuggestions.length > 0 && (
            <div className="bg-emerald-900/20 border border-emerald-700 rounded-lg p-3">
              <h4 className="font-medium text-emerald-300 mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Integration Suggestions
              </h4>
              <ul className="space-y-1">
                {insights.integrationSuggestions.map((suggestion: string, index: number) => (
                  <li key={index} className="text-sm text-emerald-200">• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    };

    const renderDiff = (oldContent: string, newContent: string) => {
      const oldLines = oldContent.split('\n');
      const newLines = newContent.split('\n');
      
      const diffLines: Array<{
        type: 'unchanged' | 'added' | 'removed';
        content: string;
        lineNumber?: number;
      }> = [];

      // Simple diff algorithm
      const maxLines = Math.max(oldLines.length, newLines.length);
      
      for (let i = 0; i < maxLines; i++) {
        const oldLine = oldLines[i] || '';
        const newLine = newLines[i] || '';
        
        if (oldLine === newLine) {
          diffLines.push({
            type: 'unchanged',
            content: oldLine,
            lineNumber: i + 1
          });
        } else {
          if (oldLine) {
            diffLines.push({
              type: 'removed',
              content: oldLine,
              lineNumber: i + 1
            });
          }
          if (newLine) {
            diffLines.push({
              type: 'added',
              content: newLine,
              lineNumber: i + 1
            });
          }
        }
      }

      return (
        <div className="font-mono text-xs bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 mt-2">
          <div className="bg-zinc-900 px-3 py-2 border-b border-zinc-700">
            <span className="text-zinc-400">Code Changes</span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {diffLines.map((line, index) => (
              <div
                key={index}
                className={`px-3 py-1 flex items-start ${
                  line.type === 'removed' 
                    ? 'bg-red-900/30 border-l-2 border-red-500' 
                    : line.type === 'added' 
                    ? 'bg-green-900/30 border-l-2 border-green-500' 
                    : 'bg-zinc-800'
                }`}
              >
                <div className="w-8 text-xs text-zinc-500 mr-2 flex-shrink-0">
                  {line.lineNumber}
                </div>
                <div className={`flex-1 ${
                  line.type === 'removed' 
                    ? 'text-red-300' 
                    : line.type === 'added' 
                    ? 'text-green-300' 
                    : 'text-zinc-300'
                }`}>
                  {line.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div className="flex flex-col h-full min-h-0 bg-zinc-900 border border-zinc-800 overflow-hidden chat-panel">
        {/* Header */}
        <div className="bg-zinc-800 px-4 py-3 border-b border-zinc-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-zinc-100 text-sm">SPLI Assistant</h3>
                <p className="text-zinc-400 text-xs">Space & Aerospace AI Expert</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-xs text-zinc-400">Online</span>
            </div>
          </div>
        </div>

        {/* Selected Field Display */}
        {selectedField && (
          <div className="bg-zinc-800 px-4 py-2 border-b border-zinc-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-zinc-400" />
                <span className="text-sm text-zinc-200 font-medium">
                  Editing: {selectedField.title}
                </span>
                {selectedField.sectionTitle && (
                  <span className="text-xs text-zinc-500">
                    ({selectedField.sectionTitle})
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedField(null)}
                className="text-zinc-400 hover:text-zinc-300 transition-colors"
                title="Close field editor"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Message List */}
        <div 
          className="flex-1 min-h-0 overflow-y-auto space-y-3 p-3 bg-zinc-900 relative"
          style={{
            height: '400px',
            maxHeight: '400px'
          }}
          ref={messagesContainerRef}
          onScroll={handleScroll}
        >

          {messages.length === 0 ? (
            <div className="text-zinc-500 text-center mt-10">Loading chat...</div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ai" && !msg.isTyping && (
                  <div className="flex-shrink-0 mb-1">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                      <Brain className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}
                <div className="relative group">
                  {msg.isTyping ? (
                    renderTypingIndicator()
                  ) : (
                    <div
                      className={`px-3 py-2 max-w-[75%] text-sm flex flex-col gap-1 transition-all duration-200 ${
                        msg.sender === "user"
                          ? "bg-zinc-700 text-zinc-100 rounded-lg rounded-br-md"
                          : "bg-zinc-800 text-zinc-200 rounded-lg rounded-bl-md border border-zinc-700"
                      }`}
                    >
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                      {msg.type === 'diff' && msg.diffData && (
                        renderDiff(msg.diffData.oldContent, msg.diffData.newContent)
                      )}
                      {msg.type === 'document_analysis' && msg.documentInsights && (
                        renderDocumentAnalysis(msg.documentInsights)
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs ${msg.sender === "user" ? "text-zinc-300" : "text-zinc-500"}`}>
                          {dayjs(msg.timestamp).format("HH:mm")}
                        </span>
                        {msg.sender === "ai" && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => copyMessage(msg.content, msg.id)}
                              className="p-1 hover:bg-zinc-700 rounded transition-colors"
                              title="Copy message"
                            >
                              {copiedMessageId === msg.id ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3 text-zinc-400" />
                              )}
                            </button>
                            <button
                              onClick={() => handleReaction(msg.id, 'thumbsUp')}
                              className={`p-1 rounded transition-colors ${
                                msg.reactions?.thumbsUp 
                                  ? 'text-emerald-400 bg-emerald-400/20' 
                                  : 'text-zinc-400 hover:bg-zinc-700'
                              }`}
                              title="Helpful"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleReaction(msg.id, 'thumbsDown')}
                              className={`p-1 rounded transition-colors ${
                                msg.reactions?.thumbsDown 
                                  ? 'text-red-400 bg-red-400/20' 
                                  : 'text-zinc-400 hover:bg-zinc-700'
                              }`}
                              title="Not helpful"
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                        {msg.sender === "user" && (
                          <button
                            onClick={() => retryMessage(msg.id)}
                            className="p-1 hover:bg-zinc-700 rounded transition-colors opacity-0 group-hover:opacity-100"
                            title="Retry message"
                          >
                            <RefreshCw className="h-3 w-3 text-zinc-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {msg.sender === "user" && (
                  <div className="flex-shrink-0 mb-1">
                    <div className="w-6 h-6 bg-zinc-700 rounded flex items-center justify-center">
                      <User className="h-3 w-3 text-zinc-300" />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions Dropdown */}
        {showQuickActions && (
          <div className="absolute bottom-16 left-3 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 min-w-48 max-h-64 overflow-y-auto">
            <div className="p-2">
              <AIQuickActions 
                onActionSelect={handleQuickAction}
                showCategories={false}
                maxActions={8}
              />
            </div>
          </div>
        )}

        {/* Input & Drag-and-Drop */}
        <div className="border-t border-zinc-700 p-3 bg-zinc-800 flex items-center gap-3 relative" style={{ marginTop: 'auto' }}>
          {/* Context Menu */}
          <AIContextMenu
            isVisible={showContextMenu}
            position={contextMenuPosition}
            onSelect={handleContextMenuSelect}
            onClose={handleContextMenuClose}
            searchTerm={contextSearchTerm}
          />
          <div
            className={`relative flex-1 transition-colors ${
              isDragging ? "bg-zinc-700" : ""
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileInputChange}
            />
            <form className="flex items-center gap-3 w-full" onSubmit={handleSend} autoComplete="off">
              <button
                type="button"
                className="text-zinc-400 hover:text-zinc-300 transition-colors p-2 rounded hover:bg-zinc-700"
                onClick={() => fileInputRef.current?.click()}
                title="Attach files"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="text-zinc-400 hover:text-zinc-300 transition-colors p-2 rounded hover:bg-zinc-700"
                onClick={() => setShowQuickActions(!showQuickActions)}
                title="Quick actions"
              >
                <Sparkles className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="text-zinc-400 hover:text-zinc-300 transition-colors p-2 rounded hover:bg-zinc-700"
                onClick={() => {
                  setInput(input + '@');
                  setShowContextMenu(true);
                  setContextSearchTerm("");
                  setContextMenuPosition({ x: 0, y: -200 });
                }}
                title="Add context"
              >
                <span className="text-lg font-bold">@</span>
              </button>
              <Textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder={isLoading ? "AI is processing..." : "Type a message..."}
                className="flex-1 bg-zinc-700 outline-none text-zinc-100 placeholder:text-zinc-400 px-3 py-2 rounded border border-zinc-600 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all min-h-[40px] max-h-[150px] overflow-y-auto resize-none"
                autoResize={true}
                disabled={isLoading}
              />
              <Button
                size="icon"
                className={`transition-all ${
                  isLoading 
                    ? 'bg-zinc-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                }`}
                onClick={handleSend}
                title="Send"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </form>
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-zinc-600 text-zinc-100 px-4 py-2 rounded-lg shadow-lg animate-pulse">
                  Drop files to upload
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

// Add display name for forwardRef component
AIAssistantPanel.displayName = "AIAssistantPanel"; 