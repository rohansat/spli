import type { ChatMessage } from '@/components/ui/ai-chat-message';
import type { ChatSession, ChatSessionStore } from '@/types/chat-session';

const STORAGE_PREFIX = 'spli-chat-sessions';

function storageKey(userEmail: string, applicationId: string) {
  return `${STORAGE_PREFIX}:${userEmail}_${applicationId}`;
}

function emptyStore(): ChatSessionStore {
  return { activeSessionId: null, sessions: [] };
}

function reviveMessages(messages: ChatSession['messages']): ChatMessage[] {
  return messages.map((m) => ({
    ...m,
    timestamp: new Date(m.timestamp),
  }));
}

export function loadChatSessions(
  userEmail: string,
  applicationId: string
): ChatSessionStore {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(storageKey(userEmail, applicationId));
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ChatSessionStore;
    return {
      activeSessionId: parsed.activeSessionId,
      sessions: parsed.sessions.map((s) => ({
        ...s,
        messages: reviveMessages(s.messages),
      })),
    };
  } catch {
    return emptyStore();
  }
}

export function saveChatSessions(
  userEmail: string,
  applicationId: string,
  store: ChatSessionStore
): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(storageKey(userEmail, applicationId), JSON.stringify(store));
}

export function createSession(
  applicationId: string,
  welcomeMessage: ChatMessage
): ChatSession {
  const now = new Date().toISOString();
  return {
    id: `chat-${Date.now()}`,
    title: 'New chat',
    applicationId,
    messages: [welcomeMessage],
    conversationHistory: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function deriveSessionTitle(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === 'user' && m.content.trim());
  if (!firstUser) return 'New chat';
  const text = firstUser.content.trim();
  return text.length > 42 ? `${text.slice(0, 42)}…` : text;
}

export function ensureActiveSession(
  store: ChatSessionStore,
  applicationId: string,
  welcomeMessage: ChatMessage
): { store: ChatSessionStore; session: ChatSession } {
  if (store.sessions.length === 0) {
    const session = createSession(applicationId, welcomeMessage);
    const next = { activeSessionId: session.id, sessions: [session] };
    return { store: next, session };
  }

  const activeId = store.activeSessionId ?? store.sessions[0].id;
  const session = store.sessions.find((s) => s.id === activeId) ?? store.sessions[0];
  return {
    store: { ...store, activeSessionId: session.id },
    session,
  };
}

export function updateSession(
  store: ChatSessionStore,
  sessionId: string,
  updates: Partial<Pick<ChatSession, 'messages' | 'conversationHistory' | 'title'>>
): ChatSessionStore {
  const now = new Date().toISOString();
  return {
    ...store,
    sessions: store.sessions.map((s) => {
      if (s.id !== sessionId) return s;
      const messages = updates.messages ?? s.messages;
      const title =
        updates.title ??
        (s.title === 'New chat' && messages.length > 1
          ? deriveSessionTitle(messages)
          : s.title);
      return {
        ...s,
        ...updates,
        title,
        messages,
        updatedAt: now,
      };
    }),
  };
}

export function deleteSession(store: ChatSessionStore, sessionId: string): ChatSessionStore {
  const sessions = store.sessions.filter((s) => s.id !== sessionId);
  const activeSessionId =
    store.activeSessionId === sessionId
      ? sessions[0]?.id ?? null
      : store.activeSessionId;
  return { activeSessionId, sessions };
}
