"use client";

import React, { useState } from 'react';
import { Button } from './button';
import { Brain, Sparkles } from 'lucide-react';

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
        className="relative group bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full w-14 h-14 p-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
      >
        <Brain className="h-6 w-6" />
        
        {/* Tooltip */}
        <div className={`absolute bottom-full right-0 mb-2 px-3 py-2 bg-zinc-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span>AI Form Assistant</span>
          </div>
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-900"></div>
        </div>
        
        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 animate-ping"></div>
      </Button>
    </div>
  );
} 