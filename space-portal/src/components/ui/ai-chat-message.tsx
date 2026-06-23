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
  onFieldClick?: (fieldName: string) => void;
  previousUserMessage?: string;
  isWelcome?: boolean;
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
    <div className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <div
        className={`flex items-center gap-2 px-3 py-2 border-b border-white/[0.05] ${
          tone === 'warning' ? 'bg-amber-500/[0.06]' : 'bg-white/[0.02]'
        }`}
      >
        <Icon className={`h-3.5 w-3.5 ${tone === 'warning' ? 'text-amber-400/90' : 'text-zinc-500'}`} />
        <span className="text-[12px] font-medium text-zinc-400">{title}</span>
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
  onFieldClick,
  previousUserMessage,
  isWelcome = false,
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
      <div className="flex justify-end pl-8">
        <div className="max-w-[92%]">
          <div className="rounded-2xl rounded-br-md bg-zinc-800/90 px-3.5 py-2.5">
            <p className="text-[13px] leading-relaxed text-zinc-100 whitespace-pre-wrap">
              {message.content}
            </p>
            {message.attachedFiles && message.attachedFiles.length > 0 && (
              <div className="mt-2 pt-2 border-t border-white/[0.06] flex flex-wrap gap-1.5">
                {message.attachedFiles.map((file, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-black/30 text-zinc-400"
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

  if (isWelcome) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[min(320px,45vh)] py-8 px-2">
        <div className="h-10 w-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
          <Sparkles className="h-4 w-4 text-zinc-400" />
        </div>
        <p className="text-[15px] font-medium text-zinc-200 mb-1.5">SPLI Copilot</p>
        <div className="text-[13px] text-zinc-500 text-center max-w-[280px] leading-relaxed mb-6">
          <ChatMarkdown content={message.content} />
        </div>
        {message.followUpPrompts && message.followUpPrompts.length > 0 && !message.isStreaming && (
          <div className="w-full max-w-[320px] space-y-1.5">
            {message.followUpPrompts.map((prompt, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onFollowUp?.(prompt)}
                className="spli-chat-prompt-chip w-full"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="group py-0.5">
      <div className="pr-2">
          {message.mode && message.mode !== 'chat' && (
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 px-2 py-0.5 rounded-md bg-white/[0.04]">
                <Sparkles className="h-3 w-3 opacity-60" />
                {MODE_LABELS[message.mode] || message.mode}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-zinc-600">
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
                    className={`border px-3 py-2.5 rounded-lg ${
                      appliedSuggestions.has(index)
                        ? 'border-zinc-800/50 bg-zinc-950/20 opacity-50'
                        : 'border-zinc-800 bg-black/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onFieldClick?.(suggestion.field)}
                        className="text-xs font-medium text-zinc-200 hover:text-white text-left"
                      >
                        {formatFieldName(suggestion.field)}
                      </button>
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
                    <button
                      type="button"
                      onClick={() => item.fieldName && onFieldClick?.(item.fieldName)}
                      className="font-medium text-orange-300 hover:text-orange-200 text-left"
                    >
                      {item.sectionTitle}:
                    </button>{' '}
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
          <div className="flex items-center gap-0.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 rounded-md text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.06]"
              onClick={copyMessage}
              title="Copy"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            {onRetry && previousUserMessage && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 rounded-md text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.06]"
                onClick={() => onRetry(previousUserMessage)}
                title="Retry"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className={`h-7 w-7 p-0 rounded-md ${feedback === 'up' ? 'text-zinc-300' : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.06]'}`}
              onClick={() => handleFeedback('up')}
              title="Helpful"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={`h-7 w-7 p-0 rounded-md ${feedback === 'down' ? 'text-zinc-300' : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.06]'}`}
              onClick={() => handleFeedback('down')}
              title="Not helpful"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {message.followUpPrompts && message.followUpPrompts.length > 0 && !message.isStreaming && (
          <div className="space-y-2 mt-3">
            <p className="spli-chat-label">Suggested</p>
            <div className="flex flex-col gap-1.5">
              {message.followUpPrompts.map((prompt, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onFollowUp?.(prompt)}
                  className="spli-chat-prompt-chip w-full"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
