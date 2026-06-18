'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChatMarkdown } from '@/components/ui/chat-markdown';
import {
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
    <div className="mt-4 border border-zinc-800/80 bg-black/40 overflow-hidden">
      <div
        className={`flex items-center gap-2 px-3 py-2 border-b border-zinc-800/60 ${
          tone === 'warning' ? 'bg-amber-950/20' : 'bg-zinc-950/60'
        }`}
      >
        <Icon className={`h-3 w-3 ${tone === 'warning' ? 'text-amber-400/90' : 'text-zinc-500'}`} />
        <span className="spli-chat-label text-zinc-400">{title}</span>
      </div>
      <div className="px-3 py-3">{children}</div>
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
      <div className="flex justify-end">
        <div className="max-w-[88%]">
          <div className="border border-zinc-800 bg-zinc-950/80 px-4 py-3">
            <p className="text-sm leading-relaxed text-zinc-100 whitespace-pre-wrap font-light">
              {message.content}
            </p>
            {message.attachedFiles && message.attachedFiles.length > 0 && (
              <div className="mt-3 pt-3 border-t border-zinc-800/80 flex flex-wrap gap-1.5">
                {message.attachedFiles.map((file, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 border border-zinc-800 bg-black text-zinc-500"
                  >
                    <Paperclip className="h-3 w-3 opacity-60" />
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
    <div className="flex gap-3 items-start group">
      <div className="flex-shrink-0 w-px self-stretch min-h-[24px] bg-zinc-700/60 mt-1" aria-hidden />

      <div className="flex-1 min-w-0 space-y-2">
        <div className="border-l-2 border-l-zinc-600/80 pl-4 py-0.5">
          {message.mode && message.mode !== 'chat' && (
            <div className="mb-2.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 spli-chat-label text-zinc-400 px-2 py-1 border border-zinc-800 bg-zinc-950">
                <Sparkles className="h-3 w-3 opacity-60" />
                {MODE_LABELS[message.mode] || message.mode}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-zinc-600 tracking-wide">
                <Shield className="h-3 w-3" />
                Draft — review required
              </span>
            </div>
          )}

          <ChatMarkdown content={message.content} />
          {message.isStreaming && (
            <span className="inline-block w-0.5 h-4 bg-zinc-400 animate-pulse ml-0.5 align-middle" />
          )}

          {message.suggestions && message.suggestions.length > 0 && !dismissedSuggestions && (
            <SectionBlock title={`Suggested drafts (${message.suggestions.length})`} icon={FileText}>
              <p className="text-[11px] text-zinc-500 mb-3 flex items-center gap-1.5 font-light">
                <Shield className="h-3 w-3 opacity-60" />
                Human approval required before applying
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
                    className={`border px-3 py-2.5 ${
                      appliedSuggestions.has(index)
                        ? 'border-zinc-800/50 bg-zinc-950/20 opacity-50'
                        : 'border-zinc-800 bg-black/30'
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
          <div className="flex items-center gap-0.5 pl-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 rounded-none text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900"
              onClick={copyMessage}
              title="Copy"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            {onRetry && previousUserMessage && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 rounded-none text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900"
                onClick={() => onRetry(previousUserMessage)}
                title="Retry"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className={`h-7 w-7 p-0 rounded-none ${feedback === 'up' ? 'text-zinc-300' : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900'}`}
              onClick={() => handleFeedback('up')}
              title="Helpful"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={`h-7 w-7 p-0 rounded-none ${feedback === 'down' ? 'text-zinc-300' : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900'}`}
              onClick={() => handleFeedback('down')}
              title="Not helpful"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {message.followUpPrompts && message.followUpPrompts.length > 0 && !message.isStreaming && (
          <div className="space-y-2 pl-4">
            <p className="spli-chat-label">Follow-up</p>
            <div className="flex flex-col gap-1">
              {message.followUpPrompts.map((prompt, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onFollowUp?.(prompt)}
                  className="text-left text-[11px] px-3 py-2.5 border border-zinc-800/80 bg-black/30 text-zinc-500 hover:text-zinc-200 hover:border-zinc-600 hover:bg-zinc-950/80 transition-colors font-light leading-snug"
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
