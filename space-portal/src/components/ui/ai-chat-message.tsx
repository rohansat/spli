'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChatMarkdown } from '@/components/ui/chat-markdown';
import {
  Bot,
  FileText,
  CheckCircle,
  AlertCircle,
  Copy,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Check,
  X,
  Sparkles,
  Paperclip,
  Shield,
  AlertTriangle,
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
  inconsistencies?: Array<{
    id: string;
    severity: 'blocking' | 'warning';
    message: string;
    sectionTitle: string;
    fieldName?: string;
    fieldLabel?: string;
  }>;
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

const MODE_LABELS: Record<string, string> = {
  'form-fill': 'Form Fill',
  compliance: 'Compliance',
  analysis: 'Analysis',
};

const INSIGHT_SECTIONS: Array<{ key: keyof DocumentInsights; label: string }> = [
  { key: 'technicalSpecs', label: 'Technical Specifications' },
  { key: 'missionObjectives', label: 'Mission Objectives' },
  { key: 'safetyConsiderations', label: 'Safety Considerations' },
  { key: 'timelineInfo', label: 'Timeline' },
  { key: 'missingInformation', label: 'Missing Information' },
  { key: 'complianceRequirements', label: 'Compliance' },
  { key: 'integrationSuggestions', label: 'Integration' },
];

function formatFieldName(field: string) {
  return field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim();
}

function SectionBlock({
  title,
  icon: Icon,
  children,
  tone = 'default',
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  tone?: 'default' | 'warning';
}) {
  return (
    <div className="mt-4 rounded-lg border border-zinc-700/60 bg-zinc-900/50 overflow-hidden">
      <div
        className={`flex items-center gap-2 px-3 py-2 border-b border-zinc-700/40 ${
          tone === 'warning' ? 'bg-orange-950/20' : 'bg-zinc-800/40'
        }`}
      >
        <Icon className={`h-3.5 w-3.5 ${tone === 'warning' ? 'text-orange-400' : 'text-zinc-400'}`} />
        <span className="text-xs font-medium text-zinc-300">{title}</span>
      </div>
      <div className="px-3 py-2.5">{children}</div>
    </div>
  );
}

function DocumentInsightsPanel({ insights }: { insights: DocumentInsights }) {
  const sections = INSIGHT_SECTIONS.filter(
    (s) => insights[s.key] && (insights[s.key] as string[]).length > 0
  );
  if (sections.length === 0) return null;

  return (
    <SectionBlock title="Document Analysis" icon={FileText}>
      <div className="space-y-3">
        {sections.map((section) => (
          <div key={section.key}>
            <div className="text-xs font-medium text-zinc-400 mb-1">{section.label}</div>
            <ul className="space-y-1">
              {(insights[section.key] as string[]).map((item, i) => (
                <li key={i} className="flex gap-2 text-xs text-zinc-300 leading-relaxed">
                  <span className="text-zinc-600 mt-0.5">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SectionBlock>
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

  const isUser = message.role === 'user';

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message.content);
    toast({ title: 'Copied to clipboard' });
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    toast({ title: type === 'up' ? 'Thanks for the feedback' : 'Feedback noted' });
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

  if (isUser) {
    return (
      <div className="flex justify-end group">
        <div className="max-w-[85%] space-y-1">
          <div className="rounded-2xl rounded-br-md bg-violet-600/15 border border-violet-500/20 px-4 py-2.5">
            <p className="text-sm leading-relaxed text-zinc-100 whitespace-pre-wrap">
              {message.content}
            </p>
            {message.attachedFiles && message.attachedFiles.length > 0 && (
              <div className="mt-2.5 pt-2.5 border-t border-zinc-700/50 flex flex-wrap gap-1.5">
                {message.attachedFiles.map((file, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-zinc-900/80 text-zinc-400 border border-zinc-700/50"
                  >
                    <Paperclip className="h-3 w-3" />
                    {file}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 items-start group">
      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600/15 to-blue-600/15 border border-violet-500/15 flex items-center justify-center mt-0.5">
        <Bot className="h-3.5 w-3.5 text-violet-300" />
      </div>

      <div className="flex-1 min-w-0 max-w-[90%] space-y-1.5">
        <div className="rounded-2xl rounded-tl-md border border-zinc-800/80 bg-zinc-900/50 px-4 py-3">
          {message.mode && message.mode !== 'chat' && (
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-violet-300/80 px-2 py-0.5 rounded-md bg-violet-950/30 border border-violet-800/30">
                <Sparkles className="h-3 w-3" />
                {MODE_LABELS[message.mode] || message.mode}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-zinc-600">
                <Shield className="h-3 w-3" />
                Draft — review before applying
              </span>
            </div>
          )}

          <ChatMarkdown content={message.content} />
          {message.isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-zinc-400 animate-pulse ml-0.5 align-middle rounded-sm" />
          )}

          {message.suggestions && message.suggestions.length > 0 && !dismissedSuggestions && (
            <SectionBlock title={`Suggested drafts (${message.suggestions.length})`} icon={FileText}>
              <p className="text-[11px] text-zinc-500 mb-3 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Review each suggestion — nothing is applied without your approval
              </p>
              <div className="flex items-center justify-between gap-2 mb-3">
                {message.confidence !== undefined && (
                  <span className="text-[11px] text-zinc-500">
                    Confidence: {Math.round(message.confidence * 100)}%
                  </span>
                )}
                <div className="flex gap-1 ml-auto">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-700"
                    onClick={applyAllSuggestions}
                  >
                    Apply all
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-300"
                    onClick={() => setDismissedSuggestions(true)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                {message.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`rounded-md border px-3 py-2.5 ${
                      appliedSuggestions.has(index)
                        ? 'border-zinc-700/40 bg-zinc-900/30 opacity-60'
                        : 'border-zinc-700/60 bg-zinc-950/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-medium text-zinc-200">
                        {formatFieldName(suggestion.field)}
                      </span>
                      {appliedSuggestions.has(index) ? (
                        <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Applied
                        </span>
                      ) : (
                        onApplySuggestions && (
                          <button
                            type="button"
                            onClick={() => applySuggestion(index)}
                            className="text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
                          >
                            Apply
                          </button>
                        )
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {suggestion.value}
                    </p>
                  </div>
                ))}
              </div>
            </SectionBlock>
          )}

          {message.nextSteps && message.nextSteps.length > 0 && (
            <SectionBlock title="Next Steps" icon={CheckCircle}>
              <ul className="space-y-1.5">
                {message.nextSteps.map((step, index) => (
                  <li key={index} className="flex gap-2 text-xs text-zinc-300 leading-relaxed">
                    <span className="text-zinc-600">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </SectionBlock>
          )}

          {message.warnings && message.warnings.length > 0 && (
            <SectionBlock title="Warnings" icon={AlertCircle} tone="warning">
              <ul className="space-y-1.5">
                {message.warnings.map((warning, index) => (
                  <li key={index} className="text-xs text-orange-200/90 leading-relaxed">
                    {warning}
                  </li>
                ))}
              </ul>
            </SectionBlock>
          )}

          {message.inconsistencies && message.inconsistencies.length > 0 && (
            <SectionBlock title="Section inconsistencies" icon={AlertTriangle} tone="warning">
              <ul className="space-y-1.5">
                {message.inconsistencies.map((item) => (
                  <li key={item.id} className="text-xs text-orange-200/90 leading-relaxed">
                    <span className="font-medium text-orange-300">{item.sectionTitle}:</span>{' '}
                    {item.message}
                  </li>
                ))}
              </ul>
            </SectionBlock>
          )}

          {message.documentInsights && (
            <DocumentInsightsPanel insights={message.documentInsights} />
          )}
        </div>

        {!message.isStreaming && (
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-0.5">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-zinc-600 hover:text-zinc-400"
                onClick={copyMessage}
                title="Copy"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              {onRetry && previousUserMessage && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-zinc-600 hover:text-zinc-400"
                  onClick={() => onRetry(previousUserMessage)}
                  title="Retry"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className={`h-7 w-7 p-0 ${feedback === 'up' ? 'text-zinc-300' : 'text-zinc-600 hover:text-zinc-400'}`}
                onClick={() => handleFeedback('up')}
                title="Helpful"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className={`h-7 w-7 p-0 ${feedback === 'down' ? 'text-zinc-300' : 'text-zinc-600 hover:text-zinc-400'}`}
                onClick={() => handleFeedback('down')}
                title="Not helpful"
              >
                <ThumbsDown className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {message.followUpPrompts && message.followUpPrompts.length > 0 && !message.isStreaming && (
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-600 px-1">
              Suggested
            </p>
            <div className="flex flex-col gap-1">
              {message.followUpPrompts.map((prompt, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onFollowUp?.(prompt)}
                  className="text-left text-xs px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800/50 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
