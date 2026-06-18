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
      <div className="flex flex-col items-center w-11 flex-shrink-0 border-r border-white/[0.06] bg-[#0c0c0e] py-2 gap-0.5">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="h-8 w-8 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] transition-colors"
          title="Show chat history"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onNewChat}
          className="h-8 w-8 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors"
          title="New chat"
        >
          <Plus className="h-4 w-4" />
        </button>
        <div className="flex-1 overflow-y-auto ai-chat-scrollbar w-full flex flex-col items-center gap-0.5 py-2">
          {sorted.slice(0, 10).map((session) => (
            <button
              key={session.id}
              type="button"
              onClick={() => onSelectSession(session.id)}
              className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors ${
                session.id === activeSessionId
                  ? 'bg-white/[0.08] text-zinc-200'
                  : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04]'
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
    <div className="flex flex-col w-[168px] flex-shrink-0 border-r border-white/[0.06] bg-[#0c0c0e]">
      <div className="p-2.5 space-y-2">
        <button
          type="button"
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-medium text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          New chat
        </button>
        <div className="flex items-center justify-between px-1 pt-0.5">
          <span className="spli-chat-label">Recent</span>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="h-6 w-6 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04] transition-colors"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto ai-chat-scrollbar px-1.5 py-1.5">
        {sorted.length === 0 ? (
          <p className="px-2 py-6 text-[12px] text-zinc-600 text-center leading-relaxed">
            Start a conversation about your application
          </p>
        ) : (
          sorted.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                className={`group relative flex items-center rounded-lg mb-0.5 ${
                  isActive ? 'spli-chat-history-item-active' : 'hover:bg-white/[0.04]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectSession(session.id)}
                  className="flex-1 min-w-0 text-left px-2.5 py-2 pr-7"
                >
                  <p
                    className={`text-[12px] leading-snug truncate ${
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
                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded text-zinc-600 hover:text-red-400 transition-all"
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
