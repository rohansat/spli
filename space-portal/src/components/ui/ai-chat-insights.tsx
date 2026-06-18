'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { AiChatMessage, ChatMessage, FormSuggestion } from '@/components/ui/ai-chat-message';
import { AiMentionMenu } from '@/components/ui/ai-mention-menu';
import {
  expandMentionsInText,
  filterMentions,
  getMentionQueryAtCursor,
  MentionItem,
} from '@/lib/ai-mentions';
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
  MessageSquare,
  Sparkles,
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
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "I'm **SPLI Chat**, your copilot for FAA Part 450 applications.\n\nI draft responses from your docs, flag section inconsistencies, and log FAA feedback — **you review and submit**.",
  timestamp: new Date(),
  followUpPrompts: [
    'Check my application for cross-section inconsistencies',
    'Help me draft CONOPS from my mission description',
    'What are the key Part 450 requirements?',
  ],
};

const QUICK_PROMPTS = [
  { label: 'Draft form', icon: FileText, prompt: 'Draft Part 450 field content from my mission details — I will review before applying' },
  { label: 'Inconsistencies', icon: CheckCircle, prompt: 'Review my application for cross-section inconsistencies and flag conflicts' },
  { label: 'Analyze docs', icon: MessageSquare, prompt: 'Analyze my uploaded documents and extract relevant application data' },
  { label: 'Best practices', icon: Sparkles, prompt: 'What are best practices for a successful Part 450 application?' },
];

export function AIChatInsights({
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
}: AIChatInsightsProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{ sender: string; content: string }>>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [attachedDocuments, setAttachedDocuments] = useState<ParsedDocument[]>([]);

  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState(0);
  const [mentionSelectedIndex, setMentionSelectedIndex] = useState(0);
  const [mentionItems, setMentionItems] = useState<MentionItem[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  const isEmptyState = messages.length <= 1 && !isLoading;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

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

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const expandedContent = expandMentionsInText(trimmed);
    const docNames = attachedDocuments.map((d) => d.name);
    const userDisplayContent =
      trimmed ||
      `Analyze the attached document${docNames.length > 1 ? 's' : ''}: ${docNames.join(', ')}`;

    const apiInput = hasDocs
      ? `${expandedContent || 'Analyze the attached documents for Part 450 application relevance. Extract technical specifications, mission objectives, safety considerations, timeline information, missing information, compliance requirements, and integration suggestions.'}`
      : expandedContent;

    if (!isRetry) {
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: 'user',
          content: userDisplayContent,
          timestamp: new Date(),
          attachedFiles: docNames.length > 0 ? docNames : undefined,
        },
      ]);
    }

    setInput('');
    setMentionOpen(false);
    setIsLoading(true);

    const docsForRequest = attachedDocuments.map((d) => ({ name: d.name, content: d.content }));
    setAttachedDocuments([]);

    const assistantId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', timestamp: new Date(), isStreaming: true },
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
          mode: hasDocs ? 'analysis' : 'chat',
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
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: streamedText } : m))
              );
            }

            if (event.type === 'done') {
              const finalContent =
                event.mode === 'chat'
                  ? event.message || streamedText
                  : streamedText || event.message;

              finalizeAssistantMessage(assistantId, finalContent, {
                suggestions: event.suggestions,
                confidence: event.confidence,
                nextSteps: event.nextSteps,
                warnings: event.warnings,
                followUpPrompts: event.followUpPrompts,
                documentInsights: event.documentInsights,
                mode: event.mode,
                inconsistencies: event.inconsistencies,
              });

              if (event.suggestions?.length && copilotState && onCopilotStateChange) {
                let nextState = copilotState;
                for (const s of event.suggestions) {
                  const { state } = recordAISuggestion(nextState, {
                    field: s.field,
                    suggestedValue: s.value,
                    messageId: assistantId,
                  });
                  nextState = state;
                }
                onCopilotStateChange(nextState);
              }

              setConversationHistory((prev) => [
                ...prev,
                { sender: 'user', content: userDisplayContent },
                { sender: 'assistant', content: finalContent },
              ]);
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
      <div className={`flex-1 overflow-y-auto spli-chat-messages ${isInline ? 'px-4 py-4' : 'p-4'} ai-chat-scrollbar`}>
        <div className="space-y-5 max-w-none">
          {inconsistencies.length > 0 && (
            <div className="border border-amber-900/40 bg-amber-950/15 px-3 py-2.5">
              <p className="spli-chat-label text-amber-500/90 mb-1">
                Cross-section alert · {inconsistencies.length}
              </p>
              <p className="text-[11px] text-amber-200/70 leading-relaxed font-light">
                {inconsistencies[0].message}
                {inconsistencies.length > 1 ? ` (+${inconsistencies.length - 1} in Memory)` : ''}
              </p>
            </div>
          )}

          {isEmptyState && (
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
              previousUserMessage={getPreviousUserMessage(index)}
              onRetry={handleRetry}
              onApplySuggestions={onFormUpdate ? (s) => onFormUpdate(s) : undefined}
              onFollowUp={(prompt) => sendMessageWithContent(prompt)}
            />
          ))}

          {isLoading && !streamingMessageId && (
            <div className="flex items-center gap-2.5 px-1 py-2">
              <div className="flex gap-1">
                <span className="h-1 w-1 rounded-full bg-zinc-500 animate-pulse" />
                <span className="h-1 w-1 rounded-full bg-zinc-500 animate-pulse [animation-delay:150ms]" />
                <span className="h-1 w-1 rounded-full bg-zinc-500 animate-pulse [animation-delay:300ms]" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">Processing</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Composer */}
      <div className="flex-shrink-0 spli-chat-composer p-4">
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
          <div className="mb-3 border border-zinc-800/80 bg-zinc-950/80 px-3 py-2.5">
            <div className="flex items-center justify-between mb-2">
              <span className="spli-chat-label">Attachments</span>
              <button
                type="button"
                onClick={() =>
                  sendMessageWithContent(
                    'Analyze the attached documents for Part 450 application relevance'
                  )
                }
                className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Analyze
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {attachedDocuments.map((doc, index) => (
                <span
                  key={`${doc.name}-${index}`}
                  className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 border border-zinc-800 bg-black text-zinc-400"
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

        <div className="border border-zinc-800/90 bg-zinc-950/90 focus-within:border-zinc-600 transition-colors duration-200">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              handleInputChange(e);
              const t = e.target;
              t.style.height = 'auto';
              t.style.height = `${Math.min(t.scrollHeight, 160)}px`;
            }}
            onKeyDown={handleKeyDown}
            onClick={(e) =>
              updateMentionState(input, (e.target as HTMLTextAreaElement).selectionStart ?? 0)
            }
            placeholder="Message SPLI Copilot…"
            className="w-full min-h-[48px] max-h-[160px] px-4 pt-3.5 pb-2 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 resize-none focus:outline-none font-light"
            disabled={isLoading}
            rows={1}
            style={{ height: '48px', lineHeight: '1.55' }}
          />

          <div className="flex items-center justify-between px-2 pb-2 pt-0">
            <div className="flex items-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                title="Attach document"
                className="h-8 w-8 p-0 rounded-none text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900"
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
                  className={`h-8 w-8 p-0 rounded-none hover:bg-zinc-900 ${
                    isListening ? 'text-red-400' : 'text-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              )}
              {isListening && (
                <span className="text-[10px] uppercase tracking-wider text-red-400/80 ml-1">Rec</span>
              )}
            </div>

            <Button
              type="button"
              onClick={() => sendMessageWithContent(input)}
              disabled={!canSend}
              size="sm"
              className="h-8 px-4 gap-2 rounded-none border border-zinc-600 bg-zinc-100 text-zinc-900 hover:bg-white hover:border-zinc-400 disabled:opacity-25 disabled:border-zinc-800 disabled:bg-zinc-800 disabled:text-zinc-600 text-[10px] font-bold uppercase tracking-[0.12em]"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
