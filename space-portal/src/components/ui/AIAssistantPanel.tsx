'use client';

import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { AIChatInsights } from './ai-chat-insights';
import { AIContextMenu } from './ai-context-menu';
import { Button } from './button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { MessageSquare, Sparkles, Bot } from 'lucide-react';

interface AIAssistantPanelProps {
  onFormUpdate?: (suggestions: any[]) => void;
  onCommand?: (command: string) => void;
  onFileDrop?: (files: FileList | File[]) => void;
  hideTabs?: boolean;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isFloating?: boolean;
  applicationId?: string;
  formSummary?: string;
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
  onFileDrop,
  className,
  isCollapsed = false,
  onToggleCollapse,
  isFloating = false,
  applicationId,
  formSummary,
  hideTabs = false,
}, ref) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [quickActionPrompt, setQuickActionPrompt] = useState('');

  useEffect(() => {
    if (quickActionPrompt) {
      const timer = setTimeout(() => setQuickActionPrompt(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [quickActionPrompt]);

  useImperativeHandle(ref, () => ({
    addAIMsg: () => {},
    addDiffMsg: () => {},
    addDocumentAnalysisMsg: () => {},
    showTypingIndicator: () => {},
    hideTypingIndicator: () => {},
  }));

  const handleContextAction = (_action: string, prompt?: string) => {
    setActiveTab('chat');
    if (prompt) setQuickActionPrompt(prompt);
  };

  if (isCollapsed && isFloating) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          onClick={onToggleCollapse}
          className="h-11 w-11 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white shadow-lg"
        >
          <Bot className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  if (isCollapsed && !isFloating) return null;

  const containerClasses = isFloating
    ? `fixed bottom-4 right-4 z-50 w-96 max-h-[600px] ${className}`
    : `w-full h-full flex flex-col min-h-0 ${className}`;

  const chatContent = (
    <AIChatInsights
      onFormUpdate={onFormUpdate}
      onFileDrop={onFileDrop}
      className="flex-1 min-h-0"
      isInline
      initialPrompt={quickActionPrompt}
      applicationId={applicationId}
      formSummary={formSummary}
    />
  );

  return (
    <div className={containerClasses}>
      <div className="flex flex-col h-full min-h-0 rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        {hideTabs ? (
          chatContent
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full min-h-0">
            <div className="flex-shrink-0 px-3 pt-3 pb-2 border-b border-zinc-800">
              <TabsList className="grid w-full grid-cols-2 h-9 bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg">
                <TabsTrigger
                  value="chat"
                  className="rounded-md text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-500"
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                  Chat
                </TabsTrigger>
                <TabsTrigger
                  value="actions"
                  className="rounded-md text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-500"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Actions
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 mt-0 data-[state=inactive]:hidden">
              {chatContent}
            </TabsContent>

            <TabsContent value="actions" className="flex-1 min-h-0 mt-0 overflow-y-auto ai-chat-scrollbar p-3 data-[state=inactive]:hidden">
              <AIContextMenu onAction={handleContextAction} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
});

AIAssistantPanel.displayName = 'AIAssistantPanel';

export function FloatingAIButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white shadow-lg"
    >
      <Bot className="h-5 w-5" />
    </Button>
  );
}
