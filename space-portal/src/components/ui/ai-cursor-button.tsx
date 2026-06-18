"use client";

import React, { useState } from 'react';
import { Button } from './button';
import { Bot } from 'lucide-react';

interface AICursorButtonProps {
  onClick: () => void;
  className?: string;
}

export function AICursorButton({ onClick, className = "" }: AICursorButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
      <Button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white shadow-lg p-0"
      >
        <Bot className="h-5 w-5" />

        <div
          className={`absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg shadow-lg whitespace-nowrap transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          SPLI Chat
        </div>
      </Button>
    </div>
  );
}
