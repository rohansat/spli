'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  FileText, 
  CheckCircle, 
  MessageSquare, 
  Zap, 
  Lightbulb,
  Target,
  Shield,
  Clock,
  TrendingUp
} from 'lucide-react';

interface AIContextMenuProps {
  onAction: (action: string, prompt?: string) => void;
  className?: string;
}

const quickActions = [
  {
    id: 'fill-form',
    title: 'Fill Application',
    description: 'Auto-fill Part 450 form from mission description',
    icon: FileText,
    prompt: 'Help me fill out a Part 450 application with my mission details',
    color: 'from-blue-500 to-cyan-500',
    category: 'form'
  },
  {
    id: 'compliance-check',
    title: 'Compliance Check',
    description: 'Verify your application meets FAA requirements',
    icon: CheckCircle,
    prompt: 'Check my application for compliance with FAA Part 450 regulations',
    color: 'from-green-500 to-emerald-500',
    category: 'compliance'
  },
  {
    id: 'mission-analysis',
    title: 'Mission Analysis',
    description: 'Get detailed analysis of your space mission',
    icon: Target,
    prompt: 'Analyze my mission description and provide insights',
    color: 'from-purple-500 to-pink-500',
    category: 'analysis'
  },
  {
    id: 'safety-review',
    title: 'Safety Review',
    description: 'Review safety considerations and risk assessments',
    icon: Shield,
    prompt: 'Review safety considerations for my launch mission',
    color: 'from-orange-500 to-red-500',
    category: 'safety'
  },
  {
    id: 'timeline-planning',
    title: 'Timeline Planning',
    description: 'Plan your application and launch timeline',
    icon: Clock,
    prompt: 'Help me plan the timeline for my launch application',
    color: 'from-indigo-500 to-purple-500',
    category: 'planning'
  },
  {
    id: 'industry-insights',
    title: 'Industry Insights',
    description: 'Get insights about the space industry and regulations',
    icon: TrendingUp,
    prompt: 'Provide insights about current space industry trends and regulations',
    color: 'from-teal-500 to-blue-500',
    category: 'insights'
  }
];

const aiFeatures = [
  {
    title: 'Intelligent Form Filling',
    description: 'AI automatically extracts information from mission descriptions and populates Part 450 forms',
    icon: Sparkles,
    benefit: 'Save 80% of form completion time'
  },
  {
    title: 'Real-time Compliance',
    description: 'Instant validation against FAA Part 450 requirements with detailed feedback',
    icon: CheckCircle,
    benefit: '95% compliance accuracy'
  },
  {
    title: 'Smart Suggestions',
    description: 'AI-powered recommendations for improving your application quality',
    icon: Lightbulb,
    benefit: 'Reduce application rejections'
  },
  {
    title: 'Professional Guidance',
    description: 'Expert assistance with space licensing and regulatory requirements',
    icon: MessageSquare,
    benefit: 'Access to regulatory expertise'
  }
];

export function AIContextMenu({ onAction, className }: AIContextMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Actions', count: quickActions.length },
    { id: 'form', name: 'Form Filling', count: quickActions.filter(a => a.category === 'form').length },
    { id: 'compliance', name: 'Compliance', count: quickActions.filter(a => a.category === 'compliance').length },
    { id: 'analysis', name: 'Analysis', count: quickActions.filter(a => a.category === 'analysis').length },
    { id: 'safety', name: 'Safety', count: quickActions.filter(a => a.category === 'safety').length },
    { id: 'planning', name: 'Planning', count: quickActions.filter(a => a.category === 'planning').length },
    { id: 'insights', name: 'Insights', count: quickActions.filter(a => a.category === 'insights').length }
  ];

  const filteredActions = selectedCategory === 'all' 
    ? quickActions 
    : quickActions.filter(action => action.category === selectedCategory);

  return (
    <div className={`space-y-4 max-h-full overflow-y-auto ${className}`}>
      {/* Quick Actions */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
          <p className="text-sm text-zinc-400">
            Get instant help with common tasks and AI-powered assistance
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-1 mb-3 max-w-full overflow-x-auto">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`whitespace-nowrap text-xs ${
                  selectedCategory === category.id 
                    ? "bg-zinc-700 hover:bg-zinc-600" 
                    : "border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                {category.name}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-1 gap-2 max-w-full">
            {filteredActions.map((action) => (
              <Card 
                key={action.id}
                className="bg-zinc-800 border-zinc-700 hover:border-zinc-600 transition-all duration-200 cursor-pointer group"
                onClick={() => onAction(action.id, action.prompt)}
              >
                <CardContent className="p-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 p-1.5 rounded-lg bg-zinc-700 group-hover:bg-zinc-600 transition-colors">
                      <action.icon className="h-3 w-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-white mb-1 group-hover:text-blue-400 transition-colors truncate">
                        {action.title}
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Tips */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <Lightbulb className="h-5 w-5 text-yellow-400" />
            AI Tips for Better Results
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <p className="text-sm text-zinc-300">
                <strong>Be Specific:</strong> Include details like payload mass, launch site, and mission objectives for better form auto-fill
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              <p className="text-sm text-zinc-300">
                <strong>Use Keywords:</strong> Mention terms like "satellite", "safety", "compliance" for targeted assistance
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <p className="text-sm text-zinc-300">
                <strong>Ask for Reviews:</strong> Request compliance checks and safety reviews to ensure application quality
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
              <p className="text-sm text-zinc-300">
                <strong>Provide Context:</strong> Share mission documents and technical specifications for comprehensive analysis
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 