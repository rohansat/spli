'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChatMarkdown } from '@/components/ui/chat-markdown';
import {
  Bot,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  Copy,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Check,
  X,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export interface FormSuggestion {
  field: string;
  value: string;
  confidence: number;
  reasoning: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: FormSuggestion[];
  confidence?: number;
  nextSteps?: string[];
  warnings?: string[];
  followUpPrompts?: string[];
  mode?: string;
  isStreaming?: boolean;
  feedback?: 'up' | 'down' | null;
  attachedFiles?: string[];
  documentInsights?: DocumentInsights;
}

export interface DocumentInsights {
  technicalSpecs?: string[];
  missionObjectives?: string[];
  safetyConsiderations?: string[];
  timelineInfo?: string[];
  missingInformation?: string[];
  complianceRequirements?: string[];
  integrationSuggestions?: string[];
}

interface AiChatMessageProps {
  message: ChatMessage;
  onRetry?: (content: string) => void;
  onApplySuggestions?: (suggestions: FormSuggestion[]) => void;
  onFollowUp?: (prompt: string) => void;
  previousUserMessage?: string;
}

function getConfidenceColor(confidence: number) {
  if (confidence >= 0.8) return 'bg-green-600';
  if (confidence >= 0.6) return 'bg-yellow-600';
  return 'bg-red-600';
}

function getConfidenceText(confidence: number) {
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.6) return 'Medium';
  return 'Low';
}

function formatFieldName(field: string) {
  return field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim();
}

const INSIGHT_SECTIONS: Array<{
  key: keyof DocumentInsights;
  label: string;
  color: string;
}> = [
  { key: 'technicalSpecs', label: 'Technical Specifications', color: 'text-blue-300' },
  { key: 'missionObjectives', label: 'Mission Objectives', color: 'text-green-300' },
  { key: 'safetyConsiderations', label: 'Safety Considerations', color: 'text-red-300' },
  { key: 'timelineInfo', label: 'Timeline Information', color: 'text-yellow-300' },
  { key: 'missingInformation', label: 'Missing Information', color: 'text-orange-300' },
  { key: 'complianceRequirements', label: 'Compliance Requirements', color: 'text-purple-300' },
  { key: 'integrationSuggestions', label: 'Integration Suggestions', color: 'text-emerald-300' },
];

function DocumentInsightsPanel({ insights }: { insights: DocumentInsights }) {
  const sections = INSIGHT_SECTIONS.filter(
    (s) => insights[s.key] && (insights[s.key] as string[]).length > 0
  );

  if (sections.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="text-xs font-medium text-zinc-300">Document Analysis</div>
      {sections.map((section) => (
        <div key={section.key} className="bg-zinc-900/80 rounded border border-zinc-700 p-2">
          <div className={`text-xs font-medium mb-1 ${section.color}`}>{section.label}</div>
          <ul className="text-xs space-y-0.5 text-zinc-400">
            {(insights[section.key] as string[]).map((item, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-zinc-500 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function AiChatMessage({
  message,
  onRetry,
  onApplySuggestions,
  onFollowUp,
  previousUserMessage,
}: AiChatMessageProps) {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(message.feedback ?? null);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<number>>(new Set());
  const [dismissedSuggestions, setDismissedSuggestions] = useState(false);

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message.content);
    toast({ title: 'Copied to clipboard' });
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    toast({ title: type === 'up' ? 'Thanks for the feedback!' : 'Feedback noted — we\'ll improve.' });
  };

  const applySuggestion = (index: number) => {
    if (!message.suggestions || !onApplySuggestions) return;
    onApplySuggestions([message.suggestions[index]]);
    setAppliedSuggestions((prev) => new Set([...prev, index]));
  };

  const applyAllSuggestions = () => {
    if (!message.suggestions || !onApplySuggestions) return;
    const remaining = message.suggestions.filter((_, i) => !appliedSuggestions.has(i));
    if (remaining.length > 0) {
      onApplySuggestions(remaining);
      setAppliedSuggestions(new Set(message.suggestions.map((_, i) => i)));
    }
  };

  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}

      <div className={`max-w-[85%] ${isUser ? '' : 'flex flex-col gap-1'}`}>
        <div
          className={`rounded-lg p-3 ${
            isUser ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-white'
          }`}
        >
          <div className="flex items-start gap-2">
            {isUser && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              {!isUser && message.mode && message.mode !== 'chat' && (
                <Badge variant="outline" className="mb-2 text-xs border-blue-500 text-blue-300">
                  {message.mode === 'form-fill' ? 'Form Fill' :
                   message.mode === 'compliance' ? 'Compliance' :
                   message.mode === 'analysis' ? 'Analysis' : message.mode}
                </Badge>
              )}

              {isUser ? (
                <p className="text-sm leading-relaxed">{message.content}</p>
              ) : (
                <ChatMarkdown content={message.content} />
              )}

              {message.isStreaming && (
                <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-0.5 align-middle" />
              )}

              {message.suggestions && message.suggestions.length > 0 && !dismissedSuggestions && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <FileText className="h-3 w-3" />
                      <span className="font-medium">Form Suggestions</span>
                      {message.confidence !== undefined && (
                        <Badge className={`text-xs ${getConfidenceColor(message.confidence)} text-white border-0`}>
                          {getConfidenceText(message.confidence)} Confidence
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs text-green-400 hover:text-green-300 hover:bg-green-900/30"
                        onClick={applyAllSuggestions}
                      >
                        Apply All
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-200"
                        onClick={() => setDismissedSuggestions(true)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {message.suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={`text-xs bg-zinc-900 p-2.5 rounded border ${
                          appliedSuggestions.has(index) ? 'border-green-600/50 opacity-60' : 'border-zinc-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-medium text-zinc-200">
                            {formatFieldName(suggestion.field)}
                          </div>
                          {!appliedSuggestions.has(index) && onApplySuggestions && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 px-1.5 text-xs text-green-400 hover:text-green-300 hover:bg-green-900/30 flex-shrink-0"
                              onClick={() => applySuggestion(index)}
                            >
                              <Check className="h-3 w-3 mr-0.5" />
                              Apply
                            </Button>
                          )}
                          {appliedSuggestions.has(index) && (
                            <span className="text-green-400 text-xs flex items-center gap-0.5">
                              <Check className="h-3 w-3" /> Applied
                            </span>
                          )}
                        </div>
                        <div className="text-zinc-400 mt-1 line-clamp-3">{suggestion.value}</div>
                        <div className="text-zinc-500 mt-1 italic text-[10px]">{suggestion.reasoning}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {message.nextSteps && message.nextSteps.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 text-xs text-zinc-300 mb-2">
                    <CheckCircle className="h-3 w-3" />
                    <span className="font-medium">Next Steps</span>
                  </div>
                  <ul className="text-xs space-y-1">
                    {message.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {message.warnings && message.warnings.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 text-xs text-orange-400 mb-2">
                    <AlertCircle className="h-3 w-3" />
                    <span className="font-medium">Warnings</span>
                  </div>
                  <ul className="text-xs space-y-1">
                    {message.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-orange-400 mt-0.5">⚠</span>
                        <span className="text-orange-300">{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {message.attachedFiles && message.attachedFiles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {message.attachedFiles.map((file, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-300"
                    >
                      <FileText className="h-3 w-3" />
                      {file}
                    </span>
                  ))}
                </div>
              )}

              {message.documentInsights && (
                <DocumentInsightsPanel insights={message.documentInsights} />
              )}
            </div>
          </div>
        </div>

        {!isUser && !message.isStreaming && (
          <div className="flex items-center gap-1 px-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-zinc-500 hover:text-zinc-300"
              onClick={copyMessage}
              title="Copy"
            >
              <Copy className="h-3 w-3" />
            </Button>
            {onRetry && previousUserMessage && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-zinc-500 hover:text-zinc-300"
                onClick={() => onRetry(previousUserMessage)}
                title="Retry"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className={`h-6 w-6 p-0 ${feedback === 'up' ? 'text-green-400' : 'text-zinc-500 hover:text-zinc-300'}`}
              onClick={() => handleFeedback('up')}
              title="Helpful"
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={`h-6 w-6 p-0 ${feedback === 'down' ? 'text-red-400' : 'text-zinc-500 hover:text-zinc-300'}`}
              onClick={() => handleFeedback('down')}
              title="Not helpful"
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </div>
        )}

        {!isUser && message.followUpPrompts && message.followUpPrompts.length > 0 && !message.isStreaming && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {message.followUpPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => onFollowUp?.(prompt)}
                className="text-xs px-2.5 py-1 rounded-full border border-zinc-700 text-zinc-300 hover:border-blue-500 hover:text-blue-300 hover:bg-blue-950/30 transition-colors text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
}
