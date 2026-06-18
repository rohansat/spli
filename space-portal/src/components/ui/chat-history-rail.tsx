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
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
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
      <div className="flex flex-col items-center w-12 flex-shrink-0 border-r border-zinc-800/80 bg-zinc-950 py-2 gap-1">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="h-8 w-8 flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
          title="Show chat history"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onNewChat}
          className="h-8 w-8 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          title="New chat"
        >
          <Plus className="h-4 w-4" />
        </button>
        <div className="flex-1 overflow-y-auto ai-chat-scrollbar w-full flex flex-col items-center gap-0.5 py-1">
          {sorted.slice(0, 8).map((session) => (
            <button
              key={session.id}
              type="button"
              onClick={() => onSelectSession(session.id)}
              className={`h-8 w-8 flex items-center justify-center transition-colors ${
                session.id === activeSessionId
                  ? 'bg-zinc-800 text-zinc-200'
                  : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900'
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
    <div className="flex flex-col w-[220px] flex-shrink-0 border-r border-zinc-800/80 bg-zinc-950">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-800/60">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
          Chats
        </span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onNewChat}
            className="h-7 w-7 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
            title="New chat"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="h-7 w-7 flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
            title="Collapse"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto ai-chat-scrollbar py-1">
        {sorted.length === 0 ? (
          <p className="px-3 py-4 text-[11px] text-zinc-600 font-light">No saved chats yet</p>
        ) : (
          sorted.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                className={`group flex items-start gap-1 px-2 py-0.5 ${
                  isActive ? 'bg-zinc-900/80' : 'hover:bg-zinc-900/40'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectSession(session.id)}
                  className="flex-1 min-w-0 text-left px-2 py-2 transition-colors"
                >
                  <p
                    className={`text-[13px] leading-snug truncate ${
                      isActive ? 'text-zinc-100' : 'text-zinc-400 group-hover:text-zinc-200'
                    }`}
                  >
                    {session.title}
                  </p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">
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
                    className="opacity-0 group-hover:opacity-100 h-7 w-7 flex-shrink-0 flex items-center justify-center text-zinc-600 hover:text-red-400 transition-all mt-1.5"
                    title="Delete chat"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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
