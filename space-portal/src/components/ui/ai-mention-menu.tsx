'use client';

import React, { useEffect, useRef } from 'react';
import { MentionItem } from '@/lib/ai-mentions';

interface AiMentionMenuProps {
  items: MentionItem[];
  selectedIndex: number;
  onSelect: (item: MentionItem) => void;
  className?: string;
}

export function AiMentionMenu({
  items,
  selectedIndex,
  onSelect,
  className = '',
}: AiMentionMenuProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (items.length === 0) {
    return (
      <div
        className={`rounded-lg border border-zinc-700/80 bg-zinc-900 p-3 text-sm text-zinc-500 shadow-lg ${className}`}
      >
        No matches found
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      className={`overflow-hidden border border-zinc-800 bg-zinc-950 shadow-xl max-h-48 overflow-y-auto ${className}`}
    >
      <div className="px-3 py-2 border-b border-zinc-800 spli-chat-label">
        Reference
      </div>
      {items.map((item, index) => {
        const Icon = item.icon;
        const selected = index === selectedIndex;
        return (
          <button
            key={item.id}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(item);
            }}
            className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors ${
              selected ? 'bg-zinc-900 border-l-2 border-l-zinc-500' : 'hover:bg-zinc-900/60'
            }`}
          >
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-zinc-800 border border-zinc-700/50">
              <Icon className="h-3.5 w-3.5 text-zinc-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm text-zinc-200 truncate">{item.label}</div>
              {item.description && (
                <div className="text-xs text-zinc-500 truncate">{item.description}</div>
              )}
            </div>
            <span className="text-[10px] uppercase tracking-wide text-zinc-600 flex-shrink-0">
              {item.type}
            </span>
          </button>
        );
      })}
    </div>
  );
}
