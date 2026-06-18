'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AIAssistantPanel, AIAssistantPanelHandle } from './AIAssistantPanel';
import { ChatHistoryRail } from './chat-history-rail';
import { useResizablePanel } from '@/hooks/use-resizable-panel';
import type { ChatMessage, FormSuggestion } from './ai-chat-message';
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
import { X } from 'lucide-react';

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "I'm **SPLI Chat**, your copilot for FAA Part 450 applications.\n\nI draft responses from your docs, flag section inconsistencies, and log FAA feedback — **you review and submit**.",
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
  onCommand?: (command: string) => void;
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
    defaultWidth: 420,
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
    <div
      className="relative flex flex-shrink-0 h-full border-l border-zinc-800/80 bg-black"
      style={{ width }}
    >
      {/* Resize handle */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize chat panel"
        onMouseDown={handleMouseDown}
        className={`absolute left-0 top-0 bottom-0 w-1 z-10 cursor-col-resize group hover:bg-zinc-600/50 transition-colors ${
          isResizing ? 'bg-zinc-500/60' : 'bg-transparent'
        }`}
      >
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-full bg-zinc-700/0 group-hover:bg-zinc-600/80 transition-colors" />
      </div>

      <div className="flex flex-1 min-w-0 h-full pl-1">
        <ChatHistoryRail
          sessions={sessionStore.sessions}
          activeSessionId={sessionStore.activeSessionId}
          collapsed={historyCollapsed}
          onToggleCollapse={() => setHistoryCollapsed((c) => !c)}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
        />

        <div className="flex-1 min-w-0 flex flex-col h-full">
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/80 bg-zinc-950/80">
            <p className="text-sm text-zinc-300 truncate font-light">
              {activeSession?.title ?? 'New chat'}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="h-7 w-7 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors flex-shrink-0"
              title="Close panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <AIAssistantPanel
            ref={panelRef}
            key={`${sessionStore.activeSessionId}-${sessionKey}`}
            embedded
            workspace
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
  );
}
