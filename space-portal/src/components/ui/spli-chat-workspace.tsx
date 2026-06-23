'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AIAssistantPanel, AIAssistantPanelHandle } from './AIAssistantPanel';
import { ChatHistoryRail } from './chat-history-rail';
import { useResizablePanel } from '@/hooks/use-resizable-panel';
import type { ChatMessage, FormSuggestion } from './ai-chat-message';
import type { ApplicationActionResult } from '@/lib/application-ai-actions';
import type { CopilotState } from '@/types/copilot';
import type { ChatSessionStore } from '@/types/chat-session';
import {
  loadChatSessions,
  saveChatSessions,
  createSession,
  ensureActiveSession,
  updateSession,
  deleteSession,
} from '@/lib/chat-session-service';

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Draft Part 450 field content, flag cross-section inconsistencies, and track FAA feedback — you review and submit.',
  timestamp: new Date(),
  followUpPrompts: [
    'Check my application for cross-section inconsistencies',
    'Help me draft CONOPS from my mission description',
    'What are the key Part 450 requirements?',
  ],
};

interface SpliChatWorkspaceProps {
  applicationId: string;
  userEmail: string;
  formSummary?: string;
  formData?: Record<string, string>;
  onClose: () => void;
  onFormUpdate?: (suggestions: FormSuggestion[]) => void;
  onCommand?: (command: string) => Promise<ApplicationActionResult | void>;
  onFileDrop?: (files: FileList | File[]) => void;
  onFieldClick?: (fieldName: string) => void;
  onCopilotStateChange?: (state: CopilotState) => void;
  panelRef?: React.Ref<AIAssistantPanelHandle>;
}

export function SpliChatWorkspace({
  applicationId,
  userEmail,
  formSummary,
  formData = {},
  onClose,
  onFormUpdate,
  onCommand,
  onFileDrop,
  onFieldClick,
  onCopilotStateChange,
  panelRef,
}: SpliChatWorkspaceProps) {
  const [historyCollapsed, setHistoryCollapsed] = useState(false);
  const [sessionStore, setSessionStore] = useState<ChatSessionStore>(() =>
    loadChatSessions(userEmail, applicationId)
  );
  const [sessionKey, setSessionKey] = useState(0);

  const { width, isResizing, handleMouseDown } = useResizablePanel({
    storageKey: `spli-chat-width-${userEmail}_${applicationId}`,
    defaultWidth: 440,
    minWidth: 340,
    maxWidth: 720,
    edge: 'left',
  });

  const activeSession = useMemo(() => {
    const id = sessionStore.activeSessionId;
    return sessionStore.sessions.find((s) => s.id === id) ?? null;
  }, [sessionStore]);

  useEffect(() => {
    const loaded = loadChatSessions(userEmail, applicationId);
    const { store, session } = ensureActiveSession(loaded, applicationId, WELCOME_MESSAGE);
    setSessionStore(store);
    saveChatSessions(userEmail, applicationId, store);
    if (session.id !== loaded.activeSessionId || loaded.sessions.length === 0) {
      setSessionKey((k) => k + 1);
    }
  }, [userEmail, applicationId]);

  const persistStore = useCallback(
    (next: ChatSessionStore) => {
      setSessionStore(next);
      saveChatSessions(userEmail, applicationId, next);
    },
    [userEmail, applicationId]
  );

  const handleNewChat = useCallback(() => {
    const session = createSession(applicationId, {
      ...WELCOME_MESSAGE,
      id: `welcome-${Date.now()}`,
      timestamp: new Date(),
    });
    const next: ChatSessionStore = {
      activeSessionId: session.id,
      sessions: [session, ...sessionStore.sessions],
    };
    persistStore(next);
    setSessionKey((k) => k + 1);
  }, [applicationId, sessionStore.sessions, persistStore]);

  const handleSelectSession = useCallback(
    (id: string) => {
      persistStore({ ...sessionStore, activeSessionId: id });
      setSessionKey((k) => k + 1);
    },
    [sessionStore, persistStore]
  );

  const handleDeleteSession = useCallback(
    (id: string) => {
      let next = deleteSession(sessionStore, id);
      if (next.sessions.length === 0) {
        const session = createSession(applicationId, {
          ...WELCOME_MESSAGE,
          id: `welcome-${Date.now()}`,
          timestamp: new Date(),
        });
        next = { activeSessionId: session.id, sessions: [session] };
      }
      persistStore(next);
      setSessionKey((k) => k + 1);
    },
    [sessionStore, applicationId, persistStore]
  );

  const handleSessionUpdate = useCallback(
    (messages: ChatMessage[], conversationHistory: Array<{ sender: string; content: string }>) => {
      if (!sessionStore.activeSessionId) return;
      const next = updateSession(sessionStore, sessionStore.activeSessionId, {
        messages,
        conversationHistory,
      });
      persistStore(next);
    },
    [sessionStore, persistStore]
  );

  return (
    <div className="flex-shrink-0 self-stretch min-h-0 pl-2 pr-4 pb-4 pt-0.5">
      <div
        className="relative flex h-full min-h-0 spli-chat-shell"
        style={{ width }}
      >
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize chat panel"
          onMouseDown={handleMouseDown}
          className={`absolute left-0 top-0 bottom-0 w-[3px] z-10 cursor-col-resize group transition-colors ${
            isResizing ? 'bg-zinc-500/40' : 'hover:bg-white/[0.08]'
          }`}
        />

        <div className="flex flex-1 min-w-0 min-h-0">
          <ChatHistoryRail
            sessions={sessionStore.sessions}
            activeSessionId={sessionStore.activeSessionId}
            collapsed={historyCollapsed}
            onToggleCollapse={() => setHistoryCollapsed((c) => !c)}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
            onDeleteSession={handleDeleteSession}
          />

          <div className="flex-1 min-w-0 flex flex-col min-h-0 bg-[#0c0c0e]">
            <AIAssistantPanel
              ref={panelRef}
              key={`${sessionStore.activeSessionId}-${sessionKey}`}
              embedded
              workspace
              onClose={onClose}
              applicationId={applicationId}
              formSummary={formSummary}
              formData={formData}
              userEmail={userEmail}
              onFieldClick={onFieldClick}
              onFormUpdate={onFormUpdate}
              onCommand={onCommand}
              onFileDrop={onFileDrop}
              onCopilotStateChange={onCopilotStateChange}
              initialMessages={activeSession?.messages}
              initialConversationHistory={activeSession?.conversationHistory}
              onSessionUpdate={handleSessionUpdate}
              welcomeMessage={WELCOME_MESSAGE}
              className="flex-1 min-h-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
