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
import {
  Send,
  Loader2,
  Plus,
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
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hello! I'm **SPLI Chat**, your AI assistant for FAA Part 450 license applications.\n\nI can help you:\n- Fill out application forms from mission descriptions\n- Check regulatory compliance\n- Analyze documents and mission plans\n- Answer space licensing questions\n\n**Tips:** Type `@` to reference form fields, use the mic for voice input, or attach documents for analysis.",
  timestamp: new Date(),
  followUpPrompts: [
    'Help me fill out a Part 450 application',
    'What are the key Part 450 requirements?',
    'Review my mission for compliance gaps',
  ],
};

const QUICK_PROMPTS = [
  { label: 'Fill Form', icon: FileText, prompt: 'Help me fill out a Part 450 application with my mission details' },
  { label: 'Compliance', icon: CheckCircle, prompt: 'Check my application for FAA Part 450 compliance' },
  { label: 'Analyze', icon: MessageSquare, prompt: 'Analyze my mission description and provide insights' },
  { label: 'Best Practices', icon: Sparkles, prompt: 'What are best practices for a successful Part 450 application?' },
];

export function AIChatInsights({
  onFormUpdate,
  className = '',
  isInline = false,
  initialPrompt,
  onFileDrop,
  applicationId,
  formSummary,
}: AIChatInsightsProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{ sender: string; content: string }>>([]);
  const [showDropdown, setShowDropdown] = useState(false);
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
      const items = filterMentions(mention.query);
      setMentionOpen(true);
      setMentionQuery(mention.query);
      setMentionStartIndex(mention.startIndex);
      setMentionItems(items);
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
    const before = input.slice(0, mentionStartIndex);
    const after = input.slice(
      mentionStartIndex + mentionQuery.length + 1
    );
    const mentionText = `@${item.label} `;
    const newValue = before + mentionText + after;
    setInput(newValue);
    setMentionOpen(false);

    if (item.type === 'action' && item.prompt) {
      setInput(item.prompt);
    }

    setTimeout(() => {
      inputRef.current?.focus();
      const pos = (item.type === 'action' && item.prompt ? item.prompt : before + mentionText).length;
      inputRef.current?.setSelectionRange(pos, pos);
    }, 0);
  };

  const processFiles = async (files: FileList | File[]) => {
    const parsed = await readDocumentContents(files);
    setAttachedDocuments((prev) => [...prev, ...parsed]);

    if (onFileDrop) {
      onFileDrop(files);
    }

    const extracted = parsed.filter((d) => d.extracted).length;
    toast({
      title: `${parsed.length} document${parsed.length > 1 ? 's' : ''} attached`,
      description:
        extracted < parsed.length
          ? `${extracted} readable, ${parsed.length - extracted} need manual description`
          : 'Ready for analysis with your next message',
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
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
    if (e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
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

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userDisplayContent,
      timestamp: new Date(),
      attachedFiles: docNames.length > 0 ? docNames : undefined,
    };

    if (!isRetry) {
      setMessages((prev) => [...prev, userMessage]);
    }
    setInput('');
    setMentionOpen(false);
    setIsLoading(true);

    const docsForRequest = attachedDocuments.map((d) => ({
      name: d.name,
      content: d.content,
    }));
    setAttachedDocuments([]);

    const assistantId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: 'assistant',
        content: '',
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
          mode: hasDocs ? 'analysis' : 'chat',
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errorMsg = errData.error || 'Request failed';
        const suggestion = errData.suggestion || '';
        const details = errData.details?.message || '';
        let fullErrorMsg = errorMsg;
        if (details && details !== errorMsg) fullErrorMsg += `\n\nDetails: ${details}`;
        if (suggestion) fullErrorMsg += `\n\n${suggestion}`;
        throw new Error(fullErrorMsg);
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
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: streamedText } : m
                )
              );
            }

            if (event.type === 'done') {
              const finalContent =
                event.mode === 'chat'
                  ? (event.message || streamedText)
                  : (streamedText || event.message);

              finalizeAssistantMessage(assistantId, finalContent, {
                suggestions: event.suggestions,
                confidence: event.confidence,
                nextSteps: event.nextSteps,
                warnings: event.warnings,
                followUpPrompts: event.followUpPrompts,
                documentInsights: event.documentInsights,
                mode: event.mode,
              });

              setConversationHistory((prev) => [
                ...prev,
                { sender: 'user', content: userDisplayContent },
                { sender: 'assistant', content: finalContent },
              ]);
            }

            if (event.type === 'error') {
              throw new Error(event.error || 'Stream error');
            }
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) continue;
            throw parseErr;
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;

      console.error('Error sending message:', error);
      const errorContent =
        error instanceof Error
          ? `I encountered an error: ${error.message}\n\nPlease try again or rephrase your question.`
          : 'I apologize, but I encountered an error processing your request. Please try again.';

      finalizeAssistantMessage(assistantId, errorContent, {
        warnings: ['Request failed — please retry'],
      });
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
      abortRef.current = null;
    }
  };

  const handleRetry = (previousContent: string) => {
    setMessages((prev) => {
      const lastAssistantIdx = [...prev].reverse().findIndex((m) => m.role === 'assistant');
      if (lastAssistantIdx === -1) return prev;
      const cutIndex = prev.length - lastAssistantIdx;
      return prev.slice(0, cutIndex - 1);
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

  return (
    <div
      className={`flex flex-col h-full min-h-0 ${className} ${
        isDragOver ? 'ring-2 ring-blue-500/50 ring-inset' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`flex-1 overflow-y-auto p-4 ${isInline ? 'pb-2' : ''} ai-chat-scrollbar`}>
        <div className="space-y-4">
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
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              </div>
              <div className="bg-zinc-800 rounded-lg p-3">
                <span className="text-sm text-zinc-300">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {messages.length <= 1 && !isLoading && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((item) => (
            <button
              key={item.label}
              onClick={() => sendMessageWithContent(item.prompt)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-300 hover:border-blue-500 hover:text-blue-300 hover:bg-blue-950/30 transition-colors"
            >
              <item.icon className="h-3 w-3" />
              {item.label}
            </button>
          ))}
        </div>
      )}

      <div className={`p-4 border-t border-zinc-800 bg-zinc-900 ${isInline ? 'relative' : ''}`}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.md,.csv,.json,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          className="hidden"
        />

        {showDropdown && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-20 overflow-hidden">
            {QUICK_PROMPTS.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setInput(item.prompt);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-3 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700 flex items-center gap-2"
              >
                <item.icon className="h-3.5 w-3.5 text-blue-400" />
                {item.label}
              </button>
            ))}
          </div>
        )}

        {mentionOpen && (
          <AiMentionMenu
            items={mentionItems}
            selectedIndex={mentionSelectedIndex}
            onSelect={insertMention}
            className="absolute bottom-full left-4 right-4 mb-2 z-30"
          />
        )}

        {attachedDocuments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {attachedDocuments.map((doc, index) => (
              <span
                key={`${doc.name}-${index}`}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-blue-950/40 border border-blue-800/50 text-blue-200"
              >
                <Paperclip className="h-3 w-3" />
                {doc.name}
                {!doc.extracted && (
                  <span className="text-orange-400" title="Text not extracted">⚠</span>
                )}
                <button
                  type="button"
                  onClick={() => removeAttachedDocument(index)}
                  className="hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={() =>
                sendMessageWithContent(
                  'Analyze the attached documents for Part 450 application relevance'
                )
              }
              className="text-xs px-2.5 py-1 rounded-full border border-zinc-600 text-zinc-300 hover:border-blue-500 hover:text-blue-300"
            >
              Analyze now
            </button>
          </div>
        )}

        <div className="flex gap-2 items-end">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-8 h-8 p-0 bg-zinc-800 hover:bg-zinc-700 rounded-md"
              disabled={isLoading}
            >
              <Plus className="h-3.5 w-3.5 text-zinc-400" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="w-8 h-8 p-0 bg-zinc-800 hover:bg-zinc-700 rounded-md"
              disabled={isLoading}
              title="Attach document for analysis"
            >
              <Paperclip className="h-3.5 w-3.5 text-zinc-400" />
            </Button>
            {isSpeechSupported && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleListening}
                className={`w-8 h-8 p-0 rounded-md ${
                  isListening
                    ? 'bg-red-600/30 hover:bg-red-600/40 animate-pulse'
                    : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
                disabled={isLoading}
                title={isListening ? 'Stop listening' : 'Voice input'}
              >
                {isListening ? (
                  <MicOff className="h-3.5 w-3.5 text-red-400" />
                ) : (
                  <Mic className="h-3.5 w-3.5 text-zinc-400" />
                )}
              </Button>
            )}
          </div>

          <div className="flex-1 relative">
            {isListening && (
              <div className="absolute -top-6 left-0 text-xs text-red-400 flex items-center gap-1 z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Listening...
              </div>
            )}
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                handleInputChange(e);
                const target = e.target;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
              }}
              onKeyDown={handleKeyDown}
              onClick={(e) =>
                updateMentionState(input, (e.target as HTMLTextAreaElement).selectionStart ?? 0)
              }
              placeholder="Ask anything, type @ for fields, or attach documents..."
              className="w-full min-h-[44px] max-h-[200px] px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 resize-none overflow-y-auto focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all text-sm"
              disabled={isLoading}
              rows={1}
              style={{ height: '44px', lineHeight: '1.5' }}
            />
          </div>

          <Button
            onClick={() => sendMessageWithContent(input)}
            disabled={(!input.trim() && attachedDocuments.length === 0) || isLoading}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md flex items-center justify-center mb-1 flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
            ) : (
              <Send className="h-4 w-4 text-zinc-400" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
