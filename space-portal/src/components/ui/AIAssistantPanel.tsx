'use client';

import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { AIChatInsights } from './ai-chat-insights';
import { AIContextMenu } from './ai-context-menu';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { 
  MessageSquare, 
  Sparkles, 
  Zap, 
  Settings
} from 'lucide-react';

interface AIAssistantPanelProps {
  onFormUpdate?: (suggestions: any[]) => void;
  onCommand?: (command: string) => void;
  onFileDrop?: (files: FileList | File[]) => void;
  hideTabs?: boolean;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isFloating?: boolean; // New prop to control positioning
}

export interface AIAssistantPanelHandle {
  addAIMsg: (msg: string) => void;
  addDiffMsg: (msg: string, oldContent: string, newContent: string, filePath: string, description: string) => void;
  addDocumentAnalysisMsg: (msg: string, insights: any) => void;
  showTypingIndicator: () => void;
  hideTypingIndicator: () => void;
}

export const AIAssistantPanel = forwardRef<AIAssistantPanelHandle, AIAssistantPanelProps>(({ 
  onFormUpdate, 
  onCommand,
  className,
  isCollapsed = false,
  onToggleCollapse,
  isFloating = false
}, ref) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [quickActionPrompt, setQuickActionPrompt] = useState<string>('');

  // Clear the prompt after it's been sent
  useEffect(() => {
    if (quickActionPrompt) {
      const timer = setTimeout(() => {
        setQuickActionPrompt('');
      }, 2000); // Clear after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [quickActionPrompt]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    addAIMsg: (msg: string) => {
      setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', content: msg, timestamp: Date.now() }]);
    },
    addDiffMsg: (msg: string, oldContent: string, newContent: string, filePath: string, description: string) => {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        sender: 'ai', 
        content: msg, 
        timestamp: Date.now(),
        type: 'diff',
        diffData: { oldContent, newContent, filePath, description }
      }]);
    },
    addDocumentAnalysisMsg: (msg: string, insights: any) => {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        sender: 'ai', 
        content: msg, 
        timestamp: Date.now(),
        type: 'document_analysis',
        documentInsights: insights
      }]);
    },
    showTypingIndicator: () => {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        sender: 'ai', 
        content: '', 
        timestamp: Date.now(),
        isTyping: true
      }]);
    },
    hideTypingIndicator: () => {
      setMessages(prev => prev.filter(msg => !msg.isTyping));
    }
  }));

  const handleContextAction = async (action: string, prompt?: string) => {
    console.log('Context action:', action, prompt);
    
    // Switch to chat tab
    setActiveTab('chat');
    
    // Set the prompt to be sent to the chat
    if (prompt) {
      setQuickActionPrompt(prompt);
    }
  };

  const handleFormUpdate = (suggestions: any[]) => {
    if (onFormUpdate) {
      onFormUpdate(suggestions);
    }
  };

  // If collapsed and floating, show floating button
  if (isCollapsed && isFloating) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          onClick={onToggleCollapse}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full w-12 h-12 shadow-lg"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <span style={{fontSize: '1.25rem', lineHeight: 1}}>🚀</span>
          </div>
        </Button>
      </div>
    );
  }

  // If collapsed and not floating, show nothing
  if (isCollapsed && !isFloating) {
    return null;
  }

  // Main component - either floating or inline
  const containerClasses = isFloating 
    ? `fixed bottom-4 right-4 z-50 w-96 max-h-[600px] ${className}`
    : `w-full h-full ${className}`;

  return (
    <div className={containerClasses}>
      <Card className="bg-zinc-900 border-zinc-800 shadow-2xl h-full">
        {(!isFloating || !isMinimized) && (
          <div className="p-3 border-b border-zinc-800 bg-zinc-900">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
                <TabsTrigger 
                  value="chat" 
                  className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </TabsTrigger>
                <TabsTrigger 
                  value="actions" 
                  className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Actions
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        {(!isFloating || !isMinimized) && (
          <div className="flex-1 flex flex-col min-h-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
              <TabsContent value="chat" className="mt-0 flex-1 flex flex-col min-h-0">
                <AIChatInsights 
                  onFormUpdate={handleFormUpdate}
                  className="border-0 shadow-none flex-1 min-h-0"
                  isInline={true}
                  initialPrompt={quickActionPrompt}
                />
              </TabsContent>

              <TabsContent value="actions" className="mt-0 flex-1 min-h-0">
                <div className="h-full overflow-y-auto ai-chat-scrollbar">
                  <AIContextMenu 
                    onAction={handleContextAction}
                    className="p-4"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </Card>
    </div>
  );
});

AIAssistantPanel.displayName = 'AIAssistantPanel';

// Floating AI Button for mobile/compact view
export function FloatingAIButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full w-14 h-14 shadow-lg animate-pulse"
    >
      <div className="w-6 h-6 flex items-center justify-center">
        <span style={{fontSize: '1.5rem', lineHeight: 1}}>🚀</span>
      </div>
    </Button>
  );
}

// AI Status Indicator
export function AIStatusIndicator({ 
  isOnline = true, 
  lastResponseTime 
}: { 
  isOnline?: boolean; 
  lastResponseTime?: string; 
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className={isOnline ? 'text-green-400' : 'text-red-400'}>
        {isOnline ? 'AI Online' : 'AI Offline'}
      </span>
      {lastResponseTime && (
        <span className="text-gray-400 text-xs">
          Last response: {lastResponseTime}
        </span>
      )}
    </div>
  );
}

// AI Quick Actions Bar
export function AIQuickActionsBar({ onAction }: { onAction: (action: string) => void }) {
  const quickActions = [
    { id: 'fill-form', label: 'Fill Form', icon: '📝' },
    { id: 'compliance', label: 'Check Compliance', icon: '✅' },
    { id: 'analyze', label: 'Analyze Mission', icon: '🔍' },
    { id: 'help', label: 'Get Help', icon: '❓' }
  ];

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg">
      {quickActions.map((action) => (
        <Button
          key={action.id}
          variant="ghost"
          size="sm"
          onClick={() => onAction(action.id)}
          className="text-gray-300 hover:text-white hover:bg-gray-700"
        >
          <span className="mr-1">{action.icon}</span>
          {action.label}
        </Button>
      ))}
    </div>
  );
} 