'use client';

import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { AiChatMessage, ChatMessage, FormSuggestion } from '@/components/ui/ai-chat-message';
import { AiMentionMenu } from '@/components/ui/ai-mention-menu';
import {
  expandMentionsInText,
  filterMentions,
  getMentionQueryAtCursor,
  MentionItem,
} from '@/lib/ai-mentions';
import { resolveAIMode, shouldAutoApplyFormSuggestions, getMissionContentForProcessing, looksLikeMissionDescription } from '@/lib/ai-mode';
import {
  buildFormFillSummaryMessage,
  mergeFormSuggestions,
  parseMissionToFormFields,
  sanitizeFormSuggestions,
} from '@/lib/mission-field-parser';
import { extractFormSuggestionsFromText } from '@/lib/form-field-extract';
import type { ApplicationActionResult } from '@/lib/application-ai-actions';
import { readDocumentContents, ParsedDocument } from '@/lib/document-reader';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useToast } from '@/components/ui/use-toast';
import type { CopilotState, SectionInconsistency } from '@/types/copilot';
import { recordAISuggestion } from '@/lib/copilot-service';
import {
  Send,
  Loader2,
  Paperclip,
  FileText,
  CheckCircle,
  Mic,
  MicOff,
  X,
} from 'lucide-react';

interface AIChatInsightsProps {
  onFormUpdate?: (suggestions: FormSuggestion[]) => void;
  className?: string;
  isInline?: boolean;
  onQuickAction?: (action: string, prompt: string) => void;
  initialPrompt?: string;
  onFileDrop?: (files: FileList | File[]) => void;
  applicationId?: string;
  formSummary?: string;
  formData?: Record<string, string>;
  copilotState?: CopilotState;
  onCopilotStateChange?: (state: CopilotState) => void;
  inconsistencies?: SectionInconsistency[];
  initialMessages?: ChatMessage[];
  initialConversationHistory?: Array<{ sender: string; content: string }>;
  onSessionUpdate?: (
    messages: ChatMessage[],
    conversationHistory: Array<{ sender: string; content: string }>
  ) => void;
  welcomeMessage?: ChatMessage;
  onCommand?: (input: string) => Promise<ApplicationActionResult | void>;
  onFieldClick?: (fieldName: string) => void;
}

export interface AIChatInsightsHandle {
  addAIMsg: (content: string) => void;
  addDiffMsg: (msg: string, oldContent: string, newContent: string, filePath: string, description: string) => void;
  addDocumentAnalysisMsg: (msg: string, insights: Record<string, unknown>) => void;
  showTypingIndicator: () => void;
  hideTypingIndicator: () => void;
  sendPrompt: (prompt: string) => void;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Paste a mission description and I will fill the form. You review and submit.',
  timestamp: new Date(),
  followUpPrompts: [
    'Check my application for cross-section inconsistencies',
    'Help me draft CONOPS from my mission description',
  ],
};

const QUICK_PROMPTS = [
  { label: 'Auto-fill form', icon: FileText, prompt: 'Help me draft CONOPS from my mission description' },
  { label: 'Inconsistencies', icon: CheckCircle, prompt: 'Review my application for cross-section inconsistencies' },
];

function formatFieldLabel(field: string): string {
  return field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim();
}

export const AIChatInsights = forwardRef<AIChatInsightsHandle, AIChatInsightsProps>(function AIChatInsights({
  onFormUpdate,
  className = '',
  isInline = false,
  initialPrompt,
  onFileDrop,
  applicationId,
  formSummary,
  formData,
  copilotState,
  onCopilotStateChange,
  inconsistencies = [],
  initialMessages,
  initialConversationHistory,
  onSessionUpdate,
  welcomeMessage,
  onCommand,
  onFieldClick,
}, ref) {
  const defaultWelcome = welcomeMessage ?? WELCOME_MESSAGE;
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages?.length ? initialMessages : [defaultWelcome]
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ sender: string; content: string }>
  >(initialConversationHistory ?? []);
  const [isDragOver, setIsDragOver] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [attachedDocuments, setAttachedDocuments] = useState<ParsedDocument[]>([]);

  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState(0);
  const [mentionSelectedIndex, setMentionSelectedIndex] = useState(0);
  const [mentionItems, setMentionItems] = useState<MentionItem[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const {
    isListening,
    isSupported: isSpeechSupported,
    transcript,
    toggleListening,
    clearTranscript,
  } = useSpeechRecognition();

  const isEmptyState = messages.length <= 1 && !isLoading && messages[0]?.role === 'assistant';

  const persistSession = useCallback(
    (
      nextMessages: ChatMessage[],
      nextHistory: Array<{ sender: string; content: string }>
    ) => {
      onSessionUpdate?.(nextMessages, nextHistory);
    },
    [onSessionUpdate]
  );

  const appendAssistantMessage = useCallback(
    (content: string, extras: Partial<ChatMessage> = {}) => {
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content,
        timestamp: new Date(),
        ...extras,
      };
      setMessages((prev) => {
        const next = [...prev, assistantMessage];
        setConversationHistory((history) => {
          const updatedHistory = [...history, { sender: 'assistant', content }];
          persistSession(next, updatedHistory);
          return updatedHistory;
        });
        return next;
      });
    },
    [persistSession]
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isEmptyState) {
      messagesContainerRef.current?.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }
    scrollToBottom();
  }, [messages, isLoading, isEmptyState, scrollToBottom]);

  useEffect(() => {
    if (initialPrompt?.trim()) {
      sendMessageWithContent(initialPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  useEffect(() => {
    if (transcript) {
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      clearTranscript();
    }
  }, [transcript, clearTranscript]);

  const updateMentionState = (text: string, cursorPos: number) => {
    const mention = getMentionQueryAtCursor(text, cursorPos);
    if (mention) {
      setMentionOpen(true);
      setMentionQuery(mention.query);
      setMentionStartIndex(mention.startIndex);
      setMentionItems(filterMentions(mention.query));
      setMentionSelectedIndex(0);
    } else {
      setMentionOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    updateMentionState(value, e.target.selectionStart ?? value.length);
  };

  const insertMention = (item: MentionItem) => {
    if (item.type === 'action' && item.prompt) {
      setInput(item.prompt);
      setMentionOpen(false);
      inputRef.current?.focus();
      return;
    }

    const before = input.slice(0, mentionStartIndex);
    const after = input.slice(mentionStartIndex + mentionQuery.length + 1);
    const mentionText = `@${item.label} `;
    setInput(before + mentionText + after);
    setMentionOpen(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const processFiles = async (files: FileList | File[]) => {
    const parsed = await readDocumentContents(files);
    setAttachedDocuments((prev) => [...prev, ...parsed]);
    onFileDrop?.(files);

    const extracted = parsed.filter((d) => d.extracted).length;
    toast({
      title: `${parsed.length} file${parsed.length > 1 ? 's' : ''} attached`,
      description:
        extracted < parsed.length
          ? `${extracted} readable — others may need a description`
          : 'Ready to send with your message',
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files?.length) {
      await processFiles(files);
      event.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) await processFiles(e.dataTransfer.files);
  };

  const removeAttachedDocument = (index: number) => {
    setAttachedDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const finalizeAssistantMessage = (
    assistantId: string,
    content: string,
    extras: Partial<ChatMessage>
  ) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantId ? { ...m, content, isStreaming: false, ...extras } : m
      )
    );
  };

  const sendMessageWithContent = async (content: string, isRetry = false) => {
    const trimmed = content.trim();
    const hasDocs = attachedDocuments.length > 0;
    if ((!trimmed && !hasDocs) || isLoading) return;

    if (onCommand && trimmed && !hasDocs && !isRetry) {
      const actionResult = await onCommand(trimmed);
      if (actionResult?.handled) {
        const userMessage: ChatMessage = {
          id: `user-${Date.now()}`,
          role: 'user',
          content: trimmed,
          timestamp: new Date(),
        };
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: actionResult.message,
          timestamp: new Date(),
        };
        setInput('');
        setMentionOpen(false);
        setMessages((prev) => {
          const next = [...prev, userMessage, assistantMessage];
          const nextHistory = [
            ...conversationHistory,
            { sender: 'user', content: trimmed },
            { sender: 'assistant', content: actionResult.message },
          ];
          setConversationHistory(nextHistory);
          persistSession(next, nextHistory);
          return next;
        });
        return;
      }
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const expandedContent = expandMentionsInText(trimmed);
    const docNames = attachedDocuments.map((d) => d.name);
    const userDisplayContent =
      trimmed ||
      `Analyze the attached document${docNames.length > 1 ? 's' : ''}: ${docNames.join(', ')}`;
    const resolvedMode = resolveAIMode(undefined, expandedContent, hasDocs, conversationHistory);
    const missionContent = getMissionContentForProcessing(expandedContent, conversationHistory);
    const hasMissionPaste = !!missionContent && looksLikeMissionDescription(missionContent);
    const isMissionPaste = hasMissionPaste || resolvedMode === 'form-fill';
    const isSectionEdit = resolvedMode === 'section-edit';
    const silentFormFill = hasMissionPaste;
    const missionText = missionContent ?? '';
    const localFormSuggestions = missionText ? parseMissionToFormFields(missionText) : [];
    const apiInput =
      isMissionPaste
        ? `Extract all FAA Part 450 application fields (Sections 1–7) from this mission description. Use the structured section format and populate every field you can.\n\n${missionText}`
        : isSectionEdit
          ? `Update the Part 450 application per this instruction. Output only the changed field headers and new content.\n\n${expandedContent}`
        : hasDocs
          ? `${expandedContent || 'Analyze the attached documents for Part 450 application relevance. Extract technical specifications, mission objectives, safety considerations, timeline information, missing information, compliance requirements, and integration suggestions.'}`
          : expandedContent;

    if (!isRetry) {
      setMessages((prev) => {
        const next = [
          ...prev,
          {
            id: `user-${Date.now()}`,
            role: 'user' as const,
            content: userDisplayContent,
            timestamp: new Date(),
            attachedFiles: docNames.length > 0 ? docNames : undefined,
          },
        ];
        persistSession(next, conversationHistory);
        return next;
      });
    }

    setInput('');
    setMentionOpen(false);
    setIsLoading(true);

    const docsForRequest = attachedDocuments.map((d) => ({ name: d.name, content: d.content }));
    setAttachedDocuments([]);

    const assistantId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: 'assistant',
        content: silentFormFill ? 'Parsing your mission description…' : isSectionEdit ? 'Updating your application…' : '',
        timestamp: new Date(),
        isStreaming: true,
      },
    ]);
    setStreamingMessageId(assistantId);

    try {
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          userInput: apiInput,
          conversationHistory,
          documents: docsForRequest,
          applicationId,
          formSummary,
          formData,
          copilotState,
          mode: isMissionPaste ? 'form-fill' : resolvedMode,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';
      let streamedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          try {
            const event = JSON.parse(raw);

            if (event.type === 'chunk' && event.text) {
              streamedText += event.text;
              if (!silentFormFill && !isSectionEdit) {
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, content: streamedText } : m))
                );
              }
            }

            if (event.type === 'done') {
              const historyWithCurrent = [
                ...conversationHistory,
                { sender: 'user', content: userDisplayContent },
              ];

              let suggestions = mergeFormSuggestions(parseMissionToFormFields(missionText), []);
              suggestions = mergeFormSuggestions(
                (event.suggestions ?? []) as FormSuggestion[],
                suggestions
              );
              if (streamedText.trim()) {
                suggestions = mergeFormSuggestions(
                  extractFormSuggestionsFromText(streamedText),
                  suggestions
                );
              }
              suggestions = sanitizeFormSuggestions(suggestions, missionText || expandedContent);

              const autoApply =
                shouldAutoApplyFormSuggestions(
                  event.mode as string,
                  suggestions.length,
                  expandedContent,
                  historyWithCurrent
                ) && !!onFormUpdate;

              if (autoApply) {
                onFormUpdate!(suggestions);
              }

              let finalContent =
                autoApply
                  ? buildFormFillSummaryMessage(
                      suggestions,
                      formatFieldLabel,
                      missionText || expandedContent
                    )
                  : event.mode === 'chat'
                    ? event.message || streamedText
                    : streamedText || event.message;

              if (autoApply && event.mode === 'section-edit') {
                finalContent = `Updated **${suggestions.length} field${suggestions.length === 1 ? '' : 's'}** in your application. Review the form on the left.`;
              }

              setConversationHistory((prev) => {
                const next = [
                  ...prev,
                  { sender: 'user', content: userDisplayContent },
                  { sender: 'assistant', content: finalContent },
                ];
                setMessages((current) => {
                  const updated = current.map((m) =>
                    m.id === assistantId
                      ? {
                          ...m,
                          content: finalContent,
                          isStreaming: false,
                          suggestions: autoApply ? undefined : suggestions,
                          confidence: autoApply ? undefined : event.confidence,
                          nextSteps: autoApply ? undefined : event.nextSteps,
                          warnings: autoApply ? undefined : event.warnings,
                          followUpPrompts: autoApply ? undefined : event.followUpPrompts,
                          documentInsights: event.documentInsights,
                          mode: event.mode,
                          inconsistencies: event.inconsistencies,
                          autoApplied: autoApply,
                          appliedFields: autoApply ? suggestions.map((s) => s.field) : undefined,
                        }
                      : m
                  );
                  persistSession(updated, next);
                  return updated;
                });
                return next;
              });

              if (suggestions.length && copilotState && onCopilotStateChange) {
                let nextState = copilotState;
                for (const s of suggestions) {
                  const { state } = recordAISuggestion(nextState, {
                    field: s.field,
                    suggestedValue: s.value,
                    messageId: assistantId,
                  });
                  nextState = state;
                }
                onCopilotStateChange(nextState);
              }
            }

            if (event.type === 'error') throw new Error(event.error || 'Stream error');
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) continue;
            throw parseErr;
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;

      finalizeAssistantMessage(
        assistantId,
        error instanceof Error
          ? `Something went wrong: ${error.message}`
          : 'Something went wrong. Please try again.',
        { warnings: ['Request failed'] }
      );
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
      abortRef.current = null;
    }
  };

  const handleRetry = (previousContent: string) => {
    setMessages((prev) => {
      const idx = [...prev].reverse().findIndex((m) => m.role === 'assistant');
      if (idx === -1) return prev;
      return prev.slice(0, prev.length - idx - 1);
    });
    setConversationHistory((prev) => prev.slice(0, -2));
    sendMessageWithContent(previousContent, true);
  };

  useImperativeHandle(ref, () => ({
    addAIMsg: (content: string) => appendAssistantMessage(content),
    addDiffMsg: (msg: string) => appendAssistantMessage(msg),
    addDocumentAnalysisMsg: (msg: string, insights: Record<string, unknown>) =>
      appendAssistantMessage(msg, { documentInsights: insights as ChatMessage['documentInsights'] }),
    showTypingIndicator: () => setIsLoading(true),
    hideTypingIndicator: () => setIsLoading(false),
    sendPrompt: (prompt: string) => {
      void sendMessageWithContent(prompt);
    },
  }));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionOpen && mentionItems.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionSelectedIndex((i) => (i + 1) % mentionItems.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionSelectedIndex((i) => (i - 1 + mentionItems.length) % mentionItems.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(mentionItems[mentionSelectedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setMentionOpen(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessageWithContent(input);
    }
  };

  const getPreviousUserMessage = (index: number): string | undefined => {
    for (let i = index - 1; i >= 0; i--) {
      if (messages[i].role === 'user') return messages[i].content;
    }
    return undefined;
  };

  const canSend = (input.trim().length > 0 || attachedDocuments.length > 0) && !isLoading;

  return (
    <div
      className={`flex flex-col h-full min-h-0 bg-transparent ${className} ${
        isDragOver ? 'ring-1 ring-zinc-600 ring-inset bg-zinc-950/50' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className={`flex-1 overflow-y-auto spli-chat-messages ${isInline ? 'px-4 py-4' : 'p-4'} ai-chat-scrollbar`}
      >
        <div className="space-y-5 max-w-none">
          {inconsistencies.length > 0 && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2.5">
              <p className="text-[12px] font-medium text-amber-400/90 mb-0.5">
                {inconsistencies.length} cross-section alert{inconsistencies.length !== 1 ? 's' : ''}
              </p>
              <p className="text-[11px] text-amber-200/60 leading-relaxed mb-2">
                {inconsistencies[0].message}
              </p>
              {inconsistencies[0].fieldName && onFieldClick && (
                <button
                  type="button"
                  onClick={() => onFieldClick(inconsistencies[0].fieldName!)}
                  className="text-[11px] text-amber-300/90 hover:text-amber-200 underline-offset-2 hover:underline"
                >
                  Open conflicting field in form
                </button>
              )}
            </div>
          )}

          {isEmptyState && !onSessionUpdate && (
            <div className="border border-zinc-800/60 bg-zinc-950/40 p-4">
              <p className="spli-chat-label mb-3">Quick start</p>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_PROMPTS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => sendMessageWithContent(item.prompt)}
                    className="group flex items-start gap-2.5 text-left px-3 py-3 border border-zinc-800/80 bg-black/40 text-zinc-400 hover:text-zinc-100 hover:border-zinc-600 hover:bg-zinc-900/50 transition-all duration-200"
                  >
                    <item.icon className="h-3.5 w-3.5 flex-shrink-0 text-zinc-600 group-hover:text-zinc-400 mt-0.5 transition-colors" />
                    <span className="text-[11px] font-medium leading-snug">{item.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-zinc-600 mt-3 text-center tracking-wide">
                <kbd className="px-1.5 py-0.5 border border-zinc-800 bg-zinc-950 text-zinc-500 text-[9px]">@</kbd>
                {' '}fields · attach · voice
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <AiChatMessage
              key={message.id}
              message={message}
              isWelcome={message.id === 'welcome' || message.id.startsWith('welcome-')}
              previousUserMessage={getPreviousUserMessage(index)}
              onRetry={handleRetry}
              onApplySuggestions={onFormUpdate ? (s) => onFormUpdate(s) : undefined}
              onFollowUp={(prompt) => sendMessageWithContent(prompt)}
              onFieldClick={onFieldClick}
            />
          ))}

          {isLoading && !streamingMessageId && (
            <div className="flex items-center gap-2 px-1 py-2">
              <div className="flex gap-1">
                <span className="h-1 w-1 rounded-full bg-zinc-500 animate-pulse" />
                <span className="h-1 w-1 rounded-full bg-zinc-500 animate-pulse [animation-delay:150ms]" />
                <span className="h-1 w-1 rounded-full bg-zinc-500 animate-pulse [animation-delay:300ms]" />
              </div>
              <span className="text-[12px] text-zinc-500">Thinking…</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Composer */}
      <div className="flex-shrink-0 spli-chat-composer">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.md,.csv,.json,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          className="hidden"
        />

        {mentionOpen && (
          <AiMentionMenu
            items={mentionItems}
            selectedIndex={mentionSelectedIndex}
            onSelect={insertMention}
            className="mb-2"
          />
        )}

        {attachedDocuments.length > 0 && (
          <div className="mb-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
            <div className="flex items-center justify-between mb-2">
              <span className="spli-chat-label">Attachments</span>
              <button
                type="button"
                onClick={() =>
                  sendMessageWithContent(
                    'Analyze the attached documents for Part 450 application relevance'
                  )
                }
                className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Analyze
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {attachedDocuments.map((doc, index) => (
                <span
                  key={`${doc.name}-${index}`}
                  className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md bg-white/[0.04] text-zinc-400"
                >
                  <Paperclip className="h-3 w-3 opacity-60" />
                  <span className="max-w-[140px] truncate">{doc.name}</span>
                  {!doc.extracted && <span className="text-amber-500/90">!</span>}
                  <button
                    type="button"
                    onClick={() => removeAttachedDocument(index)}
                    className="text-zinc-600 hover:text-zinc-300 ml-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="spli-chat-input-box">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              handleInputChange(e);
              const t = e.target;
              t.style.height = 'auto';
              t.style.height = `${Math.min(t.scrollHeight, 140)}px`;
            }}
            onKeyDown={handleKeyDown}
            onClick={(e) =>
              updateMentionState(input, (e.target as HTMLTextAreaElement).selectionStart ?? 0)
            }
            placeholder="Ask anything about your application…"
            className="w-full min-h-[44px] max-h-[140px] resize-none bg-transparent px-3.5 pb-1 pt-3 text-[13px] text-white placeholder:text-white/30 focus:outline-none"
            disabled={isLoading}
            rows={1}
            style={{ height: '44px', lineHeight: '1.5' }}
          />

          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                title="Attach document"
                className="h-7 w-7 rounded-md p-0 text-white/40 hover:!bg-white/[0.06] hover:!text-white"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              {isSpeechSupported && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleListening}
                  disabled={isLoading}
                  title={isListening ? 'Stop listening' : 'Voice input'}
                  className={`h-7 w-7 rounded-md p-0 hover:!bg-white/[0.06] ${
                    isListening ? 'text-red-400' : 'text-white/40 hover:!text-white'
                  }`}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              )}
            </div>

            <Button
              type="button"
              onClick={() => sendMessageWithContent(input)}
              disabled={!canSend}
              size="sm"
              className="h-8 w-8 rounded-full bg-white p-0 text-black hover:bg-white/90 disabled:bg-white/20 disabled:text-white/40"
              title="Send"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
        <p className="mt-2 text-center text-[10px] text-white/30">
          SPLI drafts suggestions — you review and submit
        </p>
      </div>
    </div>
  );
});
