"use client";

import React from "react";
import { Button } from "./button";
import { 
  FileText, 
  Rocket, 
  Shield, 
  MapPin, 
  Clock, 
  HelpCircle, 
  Zap,
  Lightbulb,
  Settings,
  CheckCircle
} from "lucide-react";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
  category: 'form' | 'help' | 'analysis' | 'general';
}

const quickActions: QuickAction[] = [
  // Form-related actions
  {
    id: 'auto-fill',
    title: 'Auto-fill Form',
    description: 'Automatically fill form fields from mission description',
    icon: <Zap className="h-4 w-4" />,
    prompt: 'Please analyze my mission description and auto-fill the relevant form fields',
    category: 'form'
  },
  {
    id: 'mission-description',
    title: 'Mission Description',
    description: 'Help me write a comprehensive mission description',
    icon: <Rocket className="h-4 w-4" />,
    prompt: 'Help me write a detailed mission description for my FAA Part 450 application',
    category: 'form'
  },
  {
    id: 'safety-analysis',
    title: 'Safety Analysis',
    description: 'Get help with safety considerations and risk assessment',
    icon: <Shield className="h-4 w-4" />,
    prompt: 'Help me analyze safety considerations and risks for my launch mission',
    category: 'form'
  },
  {
    id: 'site-selection',
    title: 'Launch Site Selection',
    description: 'Get guidance on launch site requirements and selection',
    icon: <MapPin className="h-4 w-4" />,
    prompt: 'Help me understand launch site requirements and select the best location',
    category: 'form'
  },
  {
    id: 'timeline-planning',
    title: 'Timeline Planning',
    description: 'Plan your application and launch timeline',
    icon: <Clock className="h-4 w-4" />,
    prompt: 'Help me plan the timeline for my FAA application and launch schedule',
    category: 'form'
  },

  // Help and guidance
  {
    id: 'faa-process',
    title: 'FAA Process Guide',
    description: 'Understand the FAA Part 450 application process',
    icon: <HelpCircle className="h-4 w-4" />,
    prompt: 'Explain the FAA Part 450 application process and requirements',
    category: 'help'
  },
  {
    id: 'compliance-check',
    title: 'Compliance Check',
    description: 'Check if your application meets all requirements',
    icon: <CheckCircle className="h-4 w-4" />,
    prompt: 'Review my application and check for compliance with FAA Part 450 requirements',
    category: 'help'
  },
  {
    id: 'best-practices',
    title: 'Best Practices',
    description: 'Learn industry best practices for applications',
    icon: <Lightbulb className="h-4 w-4" />,
    prompt: 'What are the best practices for preparing a successful FAA Part 450 application?',
    category: 'help'
  },

  // Analysis and review
  {
    id: 'application-review',
    title: 'Application Review',
    description: 'Get a comprehensive review of your application',
    icon: <FileText className="h-4 w-4" />,
    prompt: 'Please review my application and provide feedback on completeness and quality',
    category: 'analysis'
  },
  {
    id: 'risk-assessment',
    title: 'Risk Assessment',
    description: 'Conduct a thorough risk assessment',
    icon: <Shield className="h-4 w-4" />,
    prompt: 'Help me conduct a comprehensive risk assessment for my launch mission',
    category: 'analysis'
  },
  {
    id: 'technical-review',
    title: 'Technical Review',
    description: 'Review technical specifications and requirements',
    icon: <Settings className="h-4 w-4" />,
    prompt: 'Review my technical specifications and ensure they meet FAA requirements',
    category: 'analysis'
  }
];

interface AIQuickActionsProps {
  onActionSelect: (prompt: string) => void;
  showCategories?: boolean;
  maxActions?: number;
}

export function AIQuickActions({ 
  onActionSelect, 
  showCategories = true, 
  maxActions = 12 
}: AIQuickActionsProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<'all' | 'form' | 'help' | 'analysis' | 'general'>('all');

  const filteredActions = selectedCategory === 'all' 
    ? quickActions.slice(0, maxActions)
    : quickActions.filter(action => action.category === selectedCategory).slice(0, maxActions);

  const categories = [
    { id: 'all', label: 'All Actions', count: quickActions.length },
    { id: 'form', label: 'Form Help', count: quickActions.filter(a => a.category === 'form').length },
    { id: 'help', label: 'Guidance', count: quickActions.filter(a => a.category === 'help').length },
    { id: 'analysis', label: 'Analysis', count: quickActions.filter(a => a.category === 'analysis').length },
  ];

  const handleActionClick = (prompt: string) => {
    console.log('Quick action clicked:', prompt);
    onActionSelect(prompt);
  };

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      {showCategories && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-zinc-600 text-zinc-100'
                  : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600 hover:text-zinc-300'
              }`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredActions.map((action) => (
                                  <button
              key={action.id}
              onClick={() => handleActionClick(action.prompt)}
              className="group p-3 bg-zinc-700 border border-zinc-600 rounded-lg hover:border-zinc-500 hover:bg-zinc-600 transition-all duration-200 text-left"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-2 bg-zinc-600 rounded-lg group-hover:bg-zinc-500 transition-all">
                  <div className="text-zinc-300 group-hover:text-zinc-200">
                    {action.icon}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredActions.length === 0 && (
        <div className="text-center py-8">
          <div className="text-zinc-500 text-sm">
            No actions available for this category
          </div>
        </div>
      )}
    </div>
  );
} 