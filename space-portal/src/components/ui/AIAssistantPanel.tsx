'use client';

import React, { useState, forwardRef, useImperativeHandle, useEffect, useCallback, useRef } from 'react';
import { AIChatInsights, AIChatInsightsHandle } from './ai-chat-insights';
import { AIContextMenu } from './ai-context-menu';
import { CopilotPanel } from './copilot-panel';
import { Button } from './button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { MessageSquare, Sparkles, Bot, Shield, X } from 'lucide-react';
import type { CopilotState } from '@/types/copilot';
import type { ApplicationActionResult } from '@/lib/application-ai-actions';
import {
  detectInconsistencies,
  loadCopilotState,
  saveCopilotState,
} from '@/lib/copilot-service';

interface AIAssistantPanelProps {
  onFormUpdate?: (suggestions: any[]) => void;
  onCommand?: (command: string) => Promise<ApplicationActionResult | void>;
  onFileDrop?: (files: FileList | File[]) => void;
  hideTabs?: boolean;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isFloating?: boolean;
  embedded?: boolean;
  workspace?: boolean;
  onClose?: () => void;
  applicationId?: string;
  formSummary?: string;
  formData?: Record<string, string>;
  userEmail?: string;
  onFieldClick?: (fieldName: string) => void;
  onCopilotStateChange?: (state: CopilotState) => void;
  initialMessages?: import('./ai-chat-message').ChatMessage[];
  initialConversationHistory?: Array<{ sender: string; content: string }>;
  onSessionUpdate?: (
    messages: import('./ai-chat-message').ChatMessage[],
    conversationHistory: Array<{ sender: string; content: string }>
  ) => void;
  welcomeMessage?: import('./ai-chat-message').ChatMessage;
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
  onFileDrop,
  className,
  isCollapsed = false,
  onToggleCollapse,
  isFloating = false,
  embedded = false,
  workspace = false,
  onClose,
  applicationId,
  formSummary,
  formData = {},
  userEmail,
  onFieldClick,
  onCopilotStateChange,
  hideTabs = false,
  initialMessages,
  initialConversationHistory,
  onSessionUpdate,
  welcomeMessage,
}, ref) => {
  const chatRef = useRef<AIChatInsightsHandle>(null);
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
    addAIMsg: (msg: string) => chatRef.current?.addAIMsg(msg),
    addDiffMsg: (msg: string, oldContent: string, newContent: string, filePath: string, description: string) =>
      chatRef.current?.addDiffMsg(msg, oldContent, newContent, filePath, description),
    addDocumentAnalysisMsg: (msg: string, insights: unknown) =>
      chatRef.current?.addDocumentAnalysisMsg(msg, insights as Record<string, unknown>),
    showTypingIndicator: () => chatRef.current?.showTypingIndicator(),
    hideTypingIndicator: () => chatRef.current?.hideTypingIndicator(),
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
          className="h-11 w-11 rounded-none border border-zinc-700 bg-black text-zinc-300 hover:bg-zinc-900 hover:text-white"
        >
          <Bot className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  if (isCollapsed && !isFloating) return null;

  const containerClasses = isFloating
    ? `fixed bottom-6 right-6 z-50 w-[400px] h-[min(640px,calc(100vh-6rem))] ${className}`
    : `w-full h-full flex flex-col min-h-0 ${className}`;

  const chatContent = (
    <AIChatInsights
      ref={chatRef}
      onFormUpdate={onFormUpdate}
      onCommand={onCommand}
      onFieldClick={onFieldClick}
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
      initialMessages={initialMessages}
      initialConversationHistory={initialConversationHistory}
      onSessionUpdate={onSessionUpdate}
      welcomeMessage={welcomeMessage}
    />
  );

  const shellClass = workspace
    ? 'flex h-full min-h-0 flex-col overflow-hidden bg-transparent'
    : embedded
      ? 'spli-chat-shell flex h-full min-h-0 flex-col overflow-hidden'
      : 'spli-chat-shell flex h-full min-h-0 flex-col overflow-hidden shadow-2xl shadow-black/40';

  const showPanelHeader = !workspace;

  return (
    <div className={containerClasses}>
      <div className={shellClass}>
        {showPanelHeader && (
        <div className="flex-shrink-0 border-b border-zinc-800/80 bg-black/90 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center border border-zinc-800 bg-zinc-950">
              <Bot className="h-4 w-4 text-zinc-300" />
              <span className="spli-chat-status-dot absolute -bottom-0.5 -right-0.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-100">SPLI Copilot</p>
                {inconsistencies.length > 0 && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 border border-amber-800/50 bg-amber-950/30 text-amber-400/90">
                    {inconsistencies.length} alert{inconsistencies.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5 tracking-wide">
                Part 450 · Human-reviewed drafts
              </p>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center border border-transparent text-zinc-500 hover:border-zinc-800 hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        )}

        {hideTabs ? (
          chatContent
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
            {!workspace && (
            <div className="flex-shrink-0 px-4 py-2.5 border-b border-zinc-800/60 bg-zinc-950/50">
              <TabsList className="grid w-full grid-cols-3 h-9 bg-zinc-900/60 border border-zinc-800/80 p-1 rounded-none gap-1">
                <TabsTrigger value="chat" className="spli-chat-tab rounded-none h-full data-[state=active]:border data-[state=active]:border-zinc-700/60">
                  <MessageSquare className="h-3 w-3 mr-1.5 opacity-60" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="copilot" className="spli-chat-tab rounded-none h-full data-[state=active]:border data-[state=active]:border-zinc-700/60">
                  <Shield className="h-3 w-3 mr-1.5 opacity-60" />
                  Memory
                </TabsTrigger>
                <TabsTrigger value="actions" className="spli-chat-tab rounded-none h-full data-[state=active]:border data-[state=active]:border-zinc-700/60">
                  <Sparkles className="h-3 w-3 mr-1.5 opacity-60" />
                  Actions
                </TabsTrigger>
              </TabsList>
            </div>
            )}

            {workspace && (
            <div className="flex h-11 flex-shrink-0 items-center justify-between border-b border-white/[0.06] bg-black/30 pl-1 pr-2">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className={`spli-chat-tab ${activeTab === 'chat' ? 'spli-chat-tab-active' : 'hover:text-white/70'}`}
                >
                  Chat
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('copilot')}
                  className={`spli-chat-tab ${activeTab === 'copilot' ? 'spli-chat-tab-active' : 'hover:text-white/70'}`}
                >
                  Memory
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('actions')}
                  className={`spli-chat-tab ${activeTab === 'actions' ? 'spli-chat-tab-active' : 'hover:text-white/70'}`}
                >
                  Actions
                </button>
              </div>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="mr-1 flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-white/40 transition-colors hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-white"
                  title="Close panel"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            )}

            <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 mt-0 data-[state=inactive]:hidden">
              {chatContent}
            </TabsContent>

            <TabsContent value="copilot" className="mt-0 min-h-0 flex-1 data-[state=inactive]:hidden">
              <CopilotPanel
                state={copilotState}
                inconsistencies={inconsistencies}
                onStateChange={updateCopilotState}
                onFieldClick={onFieldClick}
                className="h-full"
              />
            </TabsContent>

            <TabsContent value="actions" className="ai-chat-scrollbar mt-0 min-h-0 flex-1 overflow-y-auto p-4 data-[state=inactive]:hidden">
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
      className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-none border border-zinc-700 bg-black text-zinc-300 hover:bg-zinc-900 hover:text-white"
    >
      <Bot className="h-5 w-5" />
    </Button>
  );
}
