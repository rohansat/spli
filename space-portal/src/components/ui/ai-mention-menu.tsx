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
      <div className={`bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl p-3 text-sm text-zinc-400 ${className}`}>
        No matches found
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      className={`bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden max-h-52 overflow-y-auto ${className}`}
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(item);
            }}
            className={`w-full text-left px-3 py-2 flex items-start gap-2.5 transition-colors ${
              index === selectedIndex
                ? 'bg-blue-600/20 border-l-2 border-blue-500'
                : 'hover:bg-zinc-700 border-l-2 border-transparent'
            }`}
          >
            <Icon className="h-3.5 w-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-sm text-white truncate">{item.label}</div>
              {item.description && (
                <div className="text-xs text-zinc-400 truncate">{item.description}</div>
              )}
            </div>
            <span className="text-[10px] uppercase tracking-wide text-zinc-500 flex-shrink-0 mt-0.5">
              {item.type}
            </span>
          </button>
        );
      })}
    </div>
  );
}
