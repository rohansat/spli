'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Bot, 
  User, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Sparkles,
  MessageSquare,
  Zap,
  Mic,
  ChevronDown,
  Upload,
  Paperclip
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: Array<{
    field: string;
    value: string;
    confidence: number;
    reasoning: string;
  }>;
  confidence?: number;
  nextSteps?: string[];
  warnings?: string[];
}

interface AIChatInsightsProps {
  onFormUpdate?: (suggestions: any[]) => void;
  className?: string;
  isInline?: boolean; // New prop to control inline vs card layout
  onQuickAction?: (action: string, prompt: string) => void; // New prop for quick actions
  initialPrompt?: string; // New prop for initial prompt from quick actions
  onFileDrop?: (files: FileList | File[]) => void; // New prop for file upload handling
}

export function AIChatInsights({ onFormUpdate, className, isInline = false, onQuickAction, initialPrompt, onFileDrop }: AIChatInsightsProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hey! How can I help you today?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle initial prompt from quick actions
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setInput(initialPrompt);
      // Send the message automatically after a short delay
      setTimeout(() => {
        sendMessageWithContent(initialPrompt);
      }, 100);
    }
  }, [initialPrompt]);

  // Removed automatic scrolling to prevent page from scrolling down when sending messages

  // File upload handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0 && onFileDrop) {
      onFileDrop(files);
      // Clear the input
      event.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0 && onFileDrop) {
      onFileDrop(files);
    }
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const sendMessageWithContent = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: content,
          conversationHistory: conversationHistory,
          mode: 'chat'
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        // Display the actual error message with helpful details
        const errorMsg = data.error || 'An error occurred';
        const suggestion = data.suggestion || '';
        const details = data.details?.message || '';
        
        let fullErrorMsg = errorMsg;
        if (details && details !== errorMsg) {
          fullErrorMsg += `\n\nDetails: ${details}`;
        }
        if (suggestion) {
          fullErrorMsg += `\n\n${suggestion}`;
        }
        
        throw new Error(fullErrorMsg);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        suggestions: data.suggestions,
        confidence: data.confidence,
        nextSteps: data.nextSteps,
        warnings: data.warnings,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationHistory(prev => [...prev, 
        { sender: 'user', content: content },
        { sender: 'assistant', content: data.message }
      ]);

      // Update form if suggestions are provided
      if (data.suggestions && data.suggestions.length > 0 && onFormUpdate) {
        onFormUpdate(data.suggestions);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Extract meaningful error message
      let errorMessage = 'I apologize, but I encountered an error processing your request. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    await sendMessageWithContent(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  // If inline mode, render without card wrapper
  if (isInline) {
    return (
      <div 
        className={`flex flex-col h-full ${className} ${isDragOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 pb-32">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-white'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.role === 'user' && (
                      <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      
                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-gray-300">
                            <FileText className="h-3 w-3" />
                            <span className="font-medium">Form Suggestions</span>
                            {message.confidence && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getConfidenceColor(message.confidence)} text-white`}
                              >
                                {getConfidenceText(message.confidence)} Confidence
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1">
                            {message.suggestions.map((suggestion, index) => (
                              <div key={index} className="text-xs bg-white p-2 rounded border">
                                <div className="font-medium text-gray-800">
                                  {suggestion.field.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                                <div className="text-gray-600 mt-1">{suggestion.value}</div>
                                <div className="text-gray-500 mt-1 italic">
                                  {suggestion.reasoning}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Next Steps */}
                      {message.nextSteps && message.nextSteps.length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
                            <CheckCircle className="h-3 w-3" />
                            <span className="font-medium">Next Steps</span>
                          </div>
                          <ul className="text-xs space-y-1">
                            {message.nextSteps.map((step, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-blue-400 mt-0.5">•</span>
                                <span className="text-white">{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Warnings */}
                      {message.warnings && message.warnings.length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2 text-xs text-orange-400 mb-2">
                            <AlertCircle className="h-3 w-3" />
                            <span className="font-medium">Warnings</span>
                          </div>
                          <ul className="text-xs space-y-1">
                            {message.warnings.map((warning, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-orange-400 mt-0.5">⚠</span>
                                <span className="text-orange-300">{warning}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                    <span className="text-sm text-white">Processing your request...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800 bg-zinc-900 z-10">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="flex gap-2 items-start">
            <Button
              onClick={handleFileUploadClick}
              variant="ghost"
              size="sm"
              className="h-[38px] w-[38px] p-0 bg-zinc-800 hover:bg-zinc-700 rounded-md flex items-center justify-center flex-shrink-0 -mt-[1px]"
              disabled={isLoading}
              title="Upload document"
            >
              <Paperclip className="h-4 w-4 text-zinc-400" />
            </Button>
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // Auto-expand textarea
                  const target = e.target;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
                }}
                onKeyPress={handleKeyPress}
                placeholder="How can I help?"
                className="w-full min-h-[38px] max-h-[200px] px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 resize-none overflow-y-auto focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all"
                disabled={isLoading}
                rows={1}
                style={{
                  height: '38px',
                  lineHeight: '1.5'
                }}
              />
            </div>
            <Button 
              onClick={sendMessage} 
              disabled={!input.trim() || isLoading}
              variant="ghost"
              size="sm"
              className="h-[38px] w-[38px] p-0 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md flex items-center justify-center flex-shrink-0 -mt-[1px]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
              ) : (
                <Send className="h-4 w-4 text-zinc-400" />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Default card layout
  return (
    <div 
      className={`w-full h-full flex flex-col bg-zinc-900 ${className} ${isDragOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex-1 min-h-0 overflow-y-auto ai-chat-scrollbar p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-zinc-700 text-white'
                    : 'bg-zinc-800 text-white'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.role === 'user' && (
                    <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{message.content}</p>
                      
                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <FileText className="h-3 w-3" />
                            <span className="font-medium">Form Suggestions</span>
                            {message.confidence && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getConfidenceColor(message.confidence)} text-white`}
                              >
                                {getConfidenceText(message.confidence)} Confidence
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1">
                            {message.suggestions.map((suggestion, index) => (
                              <div key={index} className="text-xs bg-white p-2 rounded border">
                                <div className="font-medium text-gray-800">
                                  {suggestion.field.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                                <div className="text-gray-600 mt-1">{suggestion.value}</div>
                                <div className="text-gray-500 mt-1 italic">
                                  {suggestion.reasoning}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Next Steps */}
                      {message.nextSteps && message.nextSteps.length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                            <CheckCircle className="h-3 w-3" />
                            <span className="font-medium">Next Steps</span>
                          </div>
                          <ul className="text-xs space-y-1">
                            {message.nextSteps.map((step, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">•</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Warnings */}
                      {message.warnings && message.warnings.length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2 text-xs text-orange-600 mb-2">
                            <AlertCircle className="h-3 w-3" />
                            <span className="font-medium">Warnings</span>
                          </div>
                          <ul className="text-xs space-y-1">
                            {message.warnings.map((warning, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-orange-500 mt-0.5">⚠</span>
                                <span className="text-orange-700">{warning}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-zinc-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-zinc-800 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span className="text-sm text-white">Processing your request...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900">
          <div className="flex gap-2 items-start">
            <Button 
              variant="ghost"
              size="sm"
              onClick={handleFileUploadClick}
              className="h-[38px] w-[38px] p-0 bg-zinc-800 hover:bg-zinc-700 rounded-md flex items-center justify-center flex-shrink-0 -mt-[1px]"
              title="Upload document"
            >
              <Paperclip className="h-4 w-4 text-zinc-400" />
            </Button>
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // Auto-expand textarea
                  const target = e.target;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
                }}
                onKeyPress={handleKeyPress}
                placeholder="How can I help?"
                className="w-full min-h-[38px] max-h-[200px] px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 resize-none overflow-y-auto focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all"
                disabled={isLoading}
                rows={1}
                style={{
                  height: '38px',
                  lineHeight: '1.5'
                }}
              />
            </div>
            <Button 
              onClick={sendMessage} 
              disabled={!input.trim() || isLoading}
              variant="ghost"
              size="sm"
              className="h-[38px] w-[38px] p-0 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md flex items-center justify-center flex-shrink-0 -mt-[1px]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
              ) : (
                <Send className="h-4 w-4 text-zinc-400" />
              )}
            </Button>
          </div>
        </div>
      </div>
  );
} 