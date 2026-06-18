'use client';

import React, { useState } from 'react';
import {
  FileText,
  CheckCircle,
  Target,
  Shield,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface AIContextMenuProps {
  onAction: (action: string, prompt?: string) => void;
  className?: string;
}

const quickActions = [
  {
    id: 'fill-form',
    title: 'Fill Application',
    description: 'Auto-fill from mission description',
    icon: FileText,
    prompt: 'Help me fill out a Part 450 application with my mission details',
    category: 'form',
  },
  {
    id: 'compliance-check',
    title: 'Compliance Check',
    description: 'Verify FAA Part 450 requirements',
    icon: CheckCircle,
    prompt: 'Check my application for compliance with FAA Part 450 regulations',
    category: 'compliance',
  },
  {
    id: 'mission-analysis',
    title: 'Mission Analysis',
    description: 'Detailed mission insights',
    icon: Target,
    prompt: 'Analyze my mission description and provide insights',
    category: 'analysis',
  },
  {
    id: 'safety-review',
    title: 'Safety Review',
    description: 'Risk and safety considerations',
    icon: Shield,
    prompt: 'Review safety considerations for my launch mission',
    category: 'safety',
  },
  {
    id: 'timeline-planning',
    title: 'Timeline Planning',
    description: 'Application and launch schedule',
    icon: Clock,
    prompt: 'Help me plan the timeline for my launch application',
    category: 'planning',
  },
  {
    id: 'industry-insights',
    title: 'Industry Insights',
    description: 'Trends and regulations',
    icon: TrendingUp,
    prompt: 'Provide insights about current space industry trends and regulations',
    category: 'insights',
  },
];

const categories = [
  { id: 'all', label: 'All' },
  { id: 'form', label: 'Form' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'analysis', label: 'Analysis' },
  { id: 'safety', label: 'Safety' },
  { id: 'planning', label: 'Planning' },
  { id: 'insights', label: 'Insights' },
];

export function AIContextMenu({ onAction, className = '' }: AIContextMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredActions =
    selectedCategory === 'all'
      ? quickActions
      : quickActions.filter((a) => a.category === selectedCategory);

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <p className="text-sm font-medium text-zinc-200 mb-1">Quick actions</p>
        <p className="text-xs text-zinc-500">Select an action to run in chat</p>
      </div>

      <div className="flex flex-wrap gap-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors ${
              selectedCategory === cat.id
                ? 'bg-zinc-800 border-zinc-600 text-zinc-200'
                : 'border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        {filteredActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onAction(action.id, action.prompt)}
              className="w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:border-zinc-800 hover:bg-zinc-900/60 transition-colors group"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700">
                <Icon className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-400" />
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="text-sm text-zinc-200 group-hover:text-zinc-100">{action.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{action.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
