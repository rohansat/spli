"use client";

import React, { useState, useRef, useImperativeHandle, forwardRef } from "react";
import { Paperclip, Send, UploadCloud, User, Bot, ThumbsUp, ThumbsDown, RefreshCw, Copy, Check, Sparkles, X } from "lucide-react";
import { Button } from "./button";
import dayjs from "dayjs";
import { Textarea } from './textarea';
import { AIQuickActions } from './ai-quick-actions';

interface Message {
  id: number;
  sender: "user" | "ai";
  content: string;
  timestamp: number;
  type?: "text" | "diff" | "change";
  diffData?: {
    oldContent: string;
    newContent: string;
    filePath: string;
    description: string;
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
        content: "Hi! I am SPLI, How can I help you today?",
        timestamp: Date.now()
      }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [input, setInput] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
    const [showQuickActions, setShowQuickActions] = useState(false);
    const [analytics, setAnalytics] = useState<any>(null);
    const [suggestionsUsed, setSuggestionsUsed] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
      setShowScrollButton(!atBottom);
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

      // Detect if this is an auto-fill request based on content
      const lowerMessage = userMessage.toLowerCase();
      const isAutoFillRequest = lowerMessage.includes('auto fill') || 
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
                               lowerMessage.includes('disaster response');

      // Call the unified AI API
      try {
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userInput: userMessage,
            mode: isAutoFillRequest ? 'form' : 'unified',
            conversationHistory: messages // Send conversation history for context
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
      if (onFileDrop && files.length > 0) onFileDrop(files);
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
        onFileDrop(Array.from(e.target.files));
      }
    };

    const renderTypingIndicator = () => (
      <div className="flex items-center gap-2 px-5 py-3 max-w-[75%] bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-100 rounded-3xl rounded-bl-md border-purple-400/20 shadow-lg">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <span className="text-sm text-zinc-400">AI is thinking...</span>
      </div>
    );

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
      <div className="flex flex-col h-full min-h-0">
        {/* Message List */}
        <div 
          className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 pb-2 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 rounded-2xl shadow-xl border border-zinc-800 ai-chat-scrollbar relative"
          style={{
            height: '400px',
            maxHeight: '400px'
          }}
          ref={messagesContainerRef}
          onScroll={handleScroll}
        >
          {/* Scroll to bottom button */}
          {showScrollButton && (
            <button
              onClick={() => scrollToBottom(true)}
              className="absolute bottom-4 right-4 z-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
              title="Scroll to bottom"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          )}
          {messages.length === 0 ? (
            <div className="text-zinc-500 text-center mt-10">Loading chat...</div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ai" && !msg.isTyping && (
                  <div className="flex-shrink-0 mb-1">
                    <Bot className="h-6 w-6 text-purple-400 bg-zinc-800 rounded-full p-1 shadow" />
                  </div>
                )}
                <div className="relative group">
                  {msg.isTyping ? (
                    renderTypingIndicator()
                  ) : (
                    <div
                      className={`px-5 py-3 max-w-[75%] text-sm flex flex-col gap-1 shadow-lg border transition-all duration-200 ${
                        msg.sender === "user"
                          ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-3xl rounded-br-md border-blue-400/30"
                          : "bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-100 rounded-3xl rounded-bl-md border-purple-400/20"
                      }`}
                      style={{ boxShadow: msg.sender === "user" ? "0 2px 12px 0 rgba(80,80,255,0.10)" : "0 2px 12px 0 rgba(120,80,255,0.10)" }}
                    >
                      <span>{msg.content}</span>
                      {msg.type === 'diff' && msg.diffData && (
                        renderDiff(msg.diffData.oldContent, msg.diffData.newContent)
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs ${msg.sender === "user" ? "text-blue-100/80" : "text-purple-200/80"}`}>
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
                                <Check className="h-3 w-3 text-green-400" />
                              ) : (
                                <Copy className="h-3 w-3 text-zinc-400" />
                              )}
                            </button>
                            <button
                              onClick={() => handleReaction(msg.id, 'thumbsUp')}
                              className={`p-1 rounded transition-colors ${
                                msg.reactions?.thumbsUp 
                                  ? 'text-green-400 bg-green-400/20' 
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
                            className="p-1 hover:bg-blue-600/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                            title="Retry message"
                          >
                            <RefreshCw className="h-3 w-3 text-blue-300" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {msg.sender === "user" && (
                  <div className="flex-shrink-0 mb-1">
                    <User className="h-6 w-6 text-blue-400 bg-zinc-800 rounded-full p-1 shadow" />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Quick Actions Toggle */}
        <div className="border-t border-zinc-800 p-2 bg-zinc-900">
          <button
            onClick={() => {
              console.log('Quick actions toggle clicked, current state:', showQuickActions);
              setShowQuickActions(!showQuickActions);
            }}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-blue-400 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            {showQuickActions ? 'Hide Quick Actions' : 'Show Quick Actions'}
          </button>
        </div>

        {/* Quick Actions Panel */}
        {showQuickActions && (
          <div className="border-t border-zinc-800 p-4 bg-zinc-900/50 max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-zinc-200">Quick Actions</h3>
              <button
                onClick={() => setShowQuickActions(false)}
                className="text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <AIQuickActions 
              onActionSelect={handleQuickAction}
              showCategories={false}
              maxActions={6}
            />
          </div>
        )}



        {/* Input & Drag-and-Drop */}
        <div className="border-t border-zinc-800 p-0 bg-zinc-900 flex items-center gap-2 mt-0 mb-0" style={{ marginTop: 'auto' }}>
          <div
            className={`relative p-2 rounded-2xl transition-colors shadow-lg w-full ${
              isDragging ? "bg-blue-950/30" : "bg-zinc-900"
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
            <form className="flex items-center gap-2" onSubmit={handleSend} autoComplete="off">
              <button
                type="button"
                className="text-zinc-400 hover:text-blue-400 transition-transform hover:scale-110"
                onClick={() => fileInputRef.current?.click()}
                title="Attach files"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder={isLoading ? "AI is processing..." : "Type a command, request, or drop a file..."}
                className="flex-1 bg-zinc-800/60 outline-none text-white placeholder:text-zinc-400 px-3 py-2 rounded-xl border border-zinc-700 focus:border-blue-400 transition-all min-h-[40px] max-h-[150px] overflow-y-auto"
                autoResize={true}
                disabled={isLoading}
              />
              <Button
                size="icon"
                className={`shadow-md transition-transform hover:scale-110 ${
                  isLoading 
                    ? 'bg-zinc-600 cursor-not-allowed' 
                    : 'bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
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
                <div className="bg-blue-500/80 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
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