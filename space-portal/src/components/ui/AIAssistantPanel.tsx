'use client';

import React, { useState } from 'react';
import { AIChatInsights } from './ai-chat-insights';
import { AIContextMenu } from './ai-context-menu';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { 
  MessageSquare, 
  Sparkles, 
  Zap, 
  Bot, 
  Settings,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface AIAssistantPanelProps {
  onFormUpdate?: (suggestions: any[]) => void;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AIAssistantPanel({ 
  onFormUpdate, 
  className,
  isCollapsed = false,
  onToggleCollapse
}: AIAssistantPanelProps) {
  const [activeTab, setActiveTab] = useState('chat');
  const [isMinimized, setIsMinimized] = useState(false);

  const handleContextAction = (action: string, prompt?: string) => {
    // This would typically trigger the chat with the specific prompt
    console.log('Context action:', action, prompt);
    setActiveTab('chat');
  };

  const handleFormUpdate = (suggestions: any[]) => {
    if (onFormUpdate) {
      onFormUpdate(suggestions);
    }
  };

  if (isCollapsed) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          onClick={onToggleCollapse}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full w-12 h-12 shadow-lg"
        >
          <Bot className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 w-96 max-h-[600px] ${className}`}>
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5" />
              SPLI AI Assistant
              <Badge variant="secondary" className="ml-2">
                <Zap className="h-3 w-3 mr-1" />
                Professional
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/10 h-8 w-8 p-0"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              {onToggleCollapse && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleCollapse}
                  className="text-white hover:bg-white/10 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                <TabsTrigger 
                  value="chat" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </TabsTrigger>
                <TabsTrigger 
                  value="actions" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Actions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-0">
                <AIChatInsights 
                  onFormUpdate={handleFormUpdate}
                  className="border-0 shadow-none"
                />
              </TabsContent>

              <TabsContent value="actions" className="mt-0">
                <div className="max-h-[500px] overflow-y-auto">
                  <AIContextMenu 
                    onAction={handleContextAction}
                    className="p-4"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// Floating AI Button for mobile/compact view
export function FloatingAIButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full w-14 h-14 shadow-lg animate-pulse"
    >
      <Bot className="h-6 w-6" />
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