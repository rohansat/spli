"use client";

import React from "react";
import { 
  BarChart3, 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  Zap, 
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";

interface ChatAnalytics {
  messageLength: number;
  responseLength: number;
  hasSuggestions: boolean;
  suggestionCount: number;
  isAutoFillRequest: boolean;
  timestamp: string;
}

interface ChatInsight {
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  description: string;
  icon: React.ReactNode;
  metric?: string;
}

interface AIChatInsightsProps {
  analytics?: ChatAnalytics;
  messageCount: number;
  averageResponseTime?: number;
  suggestionsUsed?: number;
  className?: string;
}

export function AIChatInsights({ 
  analytics, 
  messageCount, 
  averageResponseTime = 2.5,
  suggestionsUsed = 0,
  className = "" 
}: AIChatInsightsProps) {
  
  const generateInsights = (): ChatInsight[] => {
    const insights: ChatInsight[] = [];
    
    if (!analytics) return insights;

    // Message length insights
    if (analytics.messageLength > 200) {
      insights.push({
        type: 'info',
        title: 'Detailed Query',
        description: 'Your message was comprehensive, which helps provide better responses',
        icon: <MessageSquare className="h-4 w-4" />,
        metric: `${analytics.messageLength} characters`
      });
    } else if (analytics.messageLength < 50) {
      insights.push({
        type: 'warning',
        title: 'Brief Query',
        description: 'Consider providing more details for better assistance',
        icon: <AlertCircle className="h-4 w-4" />,
        metric: `${analytics.messageLength} characters`
      });
    }

    // Auto-fill insights
    if (analytics.isAutoFillRequest) {
      insights.push({
        type: 'success',
        title: 'Form Auto-fill',
        description: 'AI detected form-related content and provided suggestions',
        icon: <Zap className="h-4 w-4" />,
        metric: `${analytics.suggestionCount} fields`
      });
    }

    // Suggestions insights
    if (analytics.hasSuggestions && analytics.suggestionCount > 0) {
      insights.push({
        type: 'success',
        title: 'Smart Suggestions',
        description: 'AI provided form field suggestions based on your input',
        icon: <CheckCircle className="h-4 w-4" />,
        metric: `${analytics.suggestionCount} suggestions`
      });
    }

    // Response quality insights
    if (analytics.responseLength > 500) {
      insights.push({
        type: 'info',
        title: 'Comprehensive Response',
        description: 'AI provided a detailed response with extensive information',
        icon: <TrendingUp className="h-4 w-4" />,
        metric: `${analytics.responseLength} characters`
      });
    }

    return insights;
  };

  const insights = generateInsights();

  if (insights.length === 0 && messageCount === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Chat Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-zinc-400">Messages</span>
          </div>
          <div className="text-lg font-semibold text-white mt-1">{messageCount}</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-green-400" />
            <span className="text-xs text-zinc-400">Suggestions</span>
          </div>
          <div className="text-lg font-semibold text-white mt-1">{suggestionsUsed}</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-400" />
            <span className="text-xs text-zinc-400">Avg Response</span>
          </div>
          <div className="text-lg font-semibold text-white mt-1">{averageResponseTime}s</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500/10 to-red-600/10 border border-orange-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-orange-400" />
            <span className="text-xs text-zinc-400">Efficiency</span>
          </div>
          <div className="text-lg font-semibold text-white mt-1">
            {messageCount > 0 ? Math.round((suggestionsUsed / messageCount) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-400" />
            AI Insights
          </h3>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border transition-all ${
                  insight.type === 'success' 
                    ? 'bg-green-500/10 border-green-500/20' 
                    : insight.type === 'warning'
                    ? 'bg-yellow-500/10 border-yellow-500/20'
                    : insight.type === 'error'
                    ? 'bg-red-500/10 border-red-500/20'
                    : 'bg-blue-500/10 border-blue-500/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 p-1.5 rounded ${
                    insight.type === 'success' 
                      ? 'bg-green-500/20 text-green-400' 
                      : insight.type === 'warning'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : insight.type === 'error'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {insight.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-zinc-100">
                        {insight.title}
                      </h4>
                      {insight.metric && (
                        <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
                          {insight.metric}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-zinc-200 mb-2">💡 Tips for Better AI Assistance</h3>
        <ul className="text-xs text-zinc-400 space-y-1">
          <li>• Provide detailed mission descriptions for better form auto-fill</li>
          <li>• Use specific keywords like "satellite", "launch", "safety" for targeted help</li>
          <li>• Ask for compliance checks to ensure your application meets requirements</li>
          <li>• Use the quick actions for common tasks and guidance</li>
        </ul>
      </div>
    </div>
  );
} 