'use client';

import { Plus, MessageSquare, Trash2, PanelLeftClose, PanelLeft } from 'lucide-react';
import type { ChatSession } from '@/types/chat-session';

interface ChatHistoryRailProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function ChatHistoryRail({
  sessions,
  activeSessionId,
  collapsed,
  onToggleCollapse,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}: ChatHistoryRailProps) {
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  if (collapsed) {
    return (
      <div className="flex w-11 flex-shrink-0 flex-col items-center gap-0.5 border-r border-white/[0.06] bg-black/40 py-2">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
          title="Show chat history"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onNewChat}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
          title="New chat"
        >
          <Plus className="h-4 w-4" />
        </button>
        <div className="ai-chat-scrollbar flex w-full flex-1 flex-col items-center gap-0.5 overflow-y-auto py-2">
          {sorted.slice(0, 10).map((session) => (
            <button
              key={session.id}
              type="button"
              onClick={() => onSelectSession(session.id)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                session.id === activeSessionId
                  ? 'border border-white/[0.1] bg-white/[0.08] text-white'
                  : 'text-white/30 hover:bg-white/[0.04] hover:text-white/60'
              }`}
              title={session.title}
            >
              <MessageSquare className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-[172px] flex-shrink-0 flex-col border-r border-white/[0.06] bg-black/40">
      <div className="space-y-2 p-3">
        <button
          type="button"
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:border-white/[0.16] hover:bg-white/[0.06] hover:text-white"
        >
          <Plus className="h-3.5 w-3.5" />
          New chat
        </button>
        <div className="flex items-center justify-between px-1 pt-0.5">
          <span className="spli-chat-label">Recent</span>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex h-6 w-6 items-center justify-center rounded-md text-white/30 transition-colors hover:bg-white/[0.04] hover:text-white/60"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="ai-chat-scrollbar flex-1 overflow-y-auto px-2 py-1">
        {sorted.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs leading-relaxed text-white/30">
            Start a conversation about your application
          </p>
        ) : (
          sorted.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                className={`group relative mb-1 flex items-center rounded-lg ${
                  isActive ? 'spli-chat-history-item-active' : 'hover:bg-white/[0.04]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectSession(session.id)}
                  className="min-w-0 flex-1 px-2.5 py-2 pr-7 text-left"
                >
                  <p
                    className={`truncate text-xs leading-snug ${
                      isActive ? 'text-white' : 'text-white/55 group-hover:text-white/80'
                    }`}
                  >
                    {session.title}
                  </p>
                  <p className="mt-0.5 text-[10px] text-white/30">
                    {formatRelativeTime(session.updatedAt)}
                  </p>
                </button>
                {sorted.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="absolute right-1 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-white/25 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
