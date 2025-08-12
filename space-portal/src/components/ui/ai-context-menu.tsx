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
    <div className={`space-y-6 ${className}`}>
      {/* AI Features Overview */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Sparkles className="h-5 w-5 text-blue-400" />
            SPLI AI Capabilities
            <Badge variant="secondary" className="ml-auto">
              <Zap className="h-3 w-3 mr-1" />
              Professional
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                <div className="flex-shrink-0 p-2 rounded-lg bg-blue-500/20">
                  <feature.icon className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-gray-400 mb-2">
                    {feature.description}
                  </p>
                  <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                    {feature.benefit}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <p className="text-sm text-gray-400">
            Get instant help with common tasks and AI-powered assistance
          </p>
        </CardHeader>
        <CardContent>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id 
                  ? "bg-blue-600 hover:bg-blue-700" 
                  : "border-gray-600 text-gray-300 hover:bg-gray-700"
                }
              >
                {category.name}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActions.map((action) => (
              <Card 
                key={action.id}
                className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer group"
                onClick={() => onAction(action.id, action.prompt)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 p-2 rounded-lg bg-gradient-to-r ${action.color} group-hover:scale-110 transition-transform duration-200`}>
                      <action.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white mb-1 group-hover:text-blue-400 transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed">
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
      <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Lightbulb className="h-5 w-5 text-yellow-400" />
            AI Tips for Better Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <p className="text-sm text-gray-300">
                <strong>Be Specific:</strong> Include details like payload mass, launch site, and mission objectives for better form auto-fill
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              <p className="text-sm text-gray-300">
                <strong>Use Keywords:</strong> Mention terms like "satellite", "safety", "compliance" for targeted assistance
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <p className="text-sm text-gray-300">
                <strong>Ask for Reviews:</strong> Request compliance checks and safety reviews to ensure application quality
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
              <p className="text-sm text-gray-300">
                <strong>Provide Context:</strong> Share mission documents and technical specifications for comprehensive analysis
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 