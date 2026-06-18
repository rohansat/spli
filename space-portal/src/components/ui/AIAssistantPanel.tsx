'use client';

import React, { useState, forwardRef, useImperativeHandle, useEffect, useCallback } from 'react';
import { AIChatInsights } from './ai-chat-insights';
import { AIContextMenu } from './ai-context-menu';
import { CopilotPanel } from './copilot-panel';
import { Button } from './button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { MessageSquare, Sparkles, Bot, Shield } from 'lucide-react';
import type { CopilotState } from '@/types/copilot';
import {
  detectInconsistencies,
  loadCopilotState,
  saveCopilotState,
} from '@/lib/copilot-service';

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
  formData?: Record<string, string>;
  userEmail?: string;
  onFieldClick?: (fieldName: string) => void;
  onCopilotStateChange?: (state: CopilotState) => void;
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
  formData = {},
  userEmail,
  onFieldClick,
  onCopilotStateChange,
  hideTabs = false,
}, ref) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [quickActionPrompt, setQuickActionPrompt] = useState('');
  const [copilotState, setCopilotState] = useState<CopilotState>(() =>
    userEmail && applicationId
      ? loadCopilotState(userEmail, applicationId)
      : { faaComments: [], changeHistory: [], aiSuggestions: [], updatedAt: '' }
  );

  const inconsistencies = detectInconsistencies(formData);

  useEffect(() => {
    if (userEmail && applicationId) {
      setCopilotState(loadCopilotState(userEmail, applicationId));
    }
  }, [userEmail, applicationId]);

  const updateCopilotState = useCallback(
    (next: CopilotState) => {
      setCopilotState(next);
      if (userEmail && applicationId) {
        saveCopilotState(userEmail, applicationId, next);
      }
      onCopilotStateChange?.(next);
    },
    [userEmail, applicationId, onCopilotStateChange]
  );

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
    ? `fixed bottom-4 right-4 z-50 w-[420px] max-h-[640px] ${className}`
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
      formData={formData}
      copilotState={copilotState}
      onCopilotStateChange={updateCopilotState}
      inconsistencies={inconsistencies}
    />
  );

  return (
    <div className={containerClasses}>
      <div className="flex flex-col h-full min-h-0 rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl shadow-black/20">
        <div className="flex-shrink-0 px-4 py-3 border-b border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-violet-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-100">SPLI Chat</p>
              <p className="text-[11px] text-zinc-500 truncate">Copilot — drafts for your review</p>
            </div>
            {inconsistencies.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-950/40 border border-orange-800/40 text-orange-400">
                {inconsistencies.length} flag{inconsistencies.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-zinc-600">
            <Shield className="h-3 w-3" />
            <span>You review and submit — AI does not override compliance</span>
          </div>
        </div>

        {hideTabs ? (
          chatContent
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
            <div className="flex-shrink-0 px-3 pt-2 pb-1.5">
              <TabsList className="grid w-full grid-cols-3 h-8 bg-zinc-900/80 border border-zinc-800 p-0.5 rounded-lg">
                <TabsTrigger
                  value="chat"
                  className="rounded-md text-[11px] data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-500"
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Chat
                </TabsTrigger>
                <TabsTrigger
                  value="copilot"
                  className="rounded-md text-[11px] data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-500"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  Memory
                </TabsTrigger>
                <TabsTrigger
                  value="actions"
                  className="rounded-md text-[11px] data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-500"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Actions
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 mt-0 data-[state=inactive]:hidden">
              {chatContent}
            </TabsContent>

            <TabsContent value="copilot" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden">
              <CopilotPanel
                state={copilotState}
                inconsistencies={inconsistencies}
                onStateChange={updateCopilotState}
                onFieldClick={onFieldClick}
                className="h-full"
              />
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
