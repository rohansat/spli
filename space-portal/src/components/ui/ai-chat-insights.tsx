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
  Zap
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
}

export function AIChatInsights({ onFormUpdate, className, isInline = false }: AIChatInsightsProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m SPLI Chat, your AI assistant for FAA Part 450 license applications. I can help you fill out forms, answer questions about space licensing, and ensure regulatory compliance. How can I assist you today?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
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
          userInput: input,
          conversationHistory: conversationHistory,
          mode: 'chat'
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
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
        { sender: 'user', content: input },
        { sender: 'assistant', content: data.message }
      ]);

      // Update form if suggestions are provided
      if (data.suggestions && data.suggestions.length > 0 && onFormUpdate) {
        onFormUpdate(data.suggestions);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
      <div className={`flex flex-col h-full ${className}`}>
        {/* Messages Area */}
        <div className="flex-1 p-4 min-h-0 overflow-y-auto">
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
                      : 'bg-gray-100 text-gray-900'
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
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-sm text-gray-600">Processing your request...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-gray-50 flex-shrink-0">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about FAA licensing, describe your mission, or get help with forms..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={sendMessage} 
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput('Help me fill out a Part 450 application')}
              disabled={isLoading}
            >
              <FileText className="h-3 w-3 mr-1" />
              Fill Form
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput('Check my application for compliance')}
              disabled={isLoading}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Check Compliance
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput('Analyze my mission description')}
              disabled={isLoading}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Analyze Mission
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Default card layout
  return (
    <Card className={`w-full max-w-4xl mx-auto ${className}`}>
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          SPLI AI Assistant
          <Badge variant="secondary" className="ml-auto">
            <Zap className="h-3 w-3 mr-1" />
            Professional
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-96 p-4 min-h-0 overflow-y-auto">
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
                      : 'bg-gray-100 text-gray-900'
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
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-sm text-gray-600">Processing your request...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about FAA licensing, describe your mission, or get help with forms..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={sendMessage} 
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput('Help me fill out a Part 450 application')}
              disabled={isLoading}
            >
              <FileText className="h-3 w-3 mr-1" />
              Fill Form
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput('Check my application for compliance')}
              disabled={isLoading}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Check Compliance
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput('Analyze my mission description')}
              disabled={isLoading}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Analyze Mission
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 