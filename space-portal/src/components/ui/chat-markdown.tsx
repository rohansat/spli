'use client';

import React from 'react';

interface ChatMarkdownProps {
  content: string;
  className?: string;
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-medium text-zinc-100">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`')) {
      parts.push(
        <code
          key={match.index}
          className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-200 text-xs font-mono border border-zinc-700/50"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('*')) {
      parts.push(<em key={match.index}>{token.slice(1, -1)}</em>);
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

export function ChatMarkdown({ content, className = '' }: ChatMarkdownProps) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (listItems.length === 0 || !listType) return;
    const ListTag = listType;
    elements.push(
      <ListTag
        key={`list-${elements.length}`}
        className={`my-2 space-y-1.5 ${listType === 'ul' ? 'list-disc pl-4' : 'list-decimal pl-4'}`}
      >
        {listItems.map((item, i) => (
          <li key={i} className="text-sm leading-relaxed text-zinc-300">
            {renderInline(item)}
          </li>
        ))}
      </ListTag>
    );
    listItems = [];
    listType = null;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={index} className="text-sm font-medium text-zinc-200 mt-3 mb-1">
          {renderInline(trimmed.slice(4))}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={index} className="text-xs font-bold uppercase tracking-[0.1em] text-zinc-200 mt-4 mb-2">
          {renderInline(trimmed.slice(3))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={index} className="text-base font-semibold text-zinc-100 mt-3 mb-1.5">
          {renderInline(trimmed.slice(2))}
        </h2>
      );
      return;
    }

    const ulMatch = trimmed.match(/^[-*•]\s+(.+)/);
    if (ulMatch) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      listItems.push(ulMatch[1]);
      return;
    }

    const olMatch = trimmed.match(/^\d+\.\s+(.+)/);
    if (olMatch) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      listItems.push(olMatch[1]);
      return;
    }

    if (trimmed.startsWith('```')) return;

    flushList();
    elements.push(
      <p key={index} className="text-[13px] leading-[1.65] text-zinc-300 my-1">
        {renderInline(trimmed)}
      </p>
    );
  });

  flushList();
  return <div className={`space-y-0.5 ${className}`}>{elements}</div>;
}
