import type { ChatMessage } from '@/components/ui/ai-chat-message';

export interface ChatSession {
  id: string;
  title: string;
  applicationId: string;
  messages: ChatMessage[];
  conversationHistory: Array<{ sender: string; content: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSessionStore {
  activeSessionId: string | null;
  sessions: ChatSession[];
}
