'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  History,
  MessageSquare,
  Plus,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CopilotState, SectionInconsistency } from '@/types/copilot';
import {
  addFAAComment,
  addressFAAComment,
} from '@/lib/copilot-service';

interface CopilotPanelProps {
  state: CopilotState;
  inconsistencies: SectionInconsistency[];
  onStateChange: (state: CopilotState) => void;
  onFieldClick?: (fieldName: string) => void;
  className?: string;
}

const SOURCE_LABELS: Record<string, string> = {
  user: 'You',
  ai_suggestion: 'AI draft',
  faa_request: 'FAA request',
  rollback: 'Rollback',
};

export function CopilotPanel({
  state,
  inconsistencies,
  onStateChange,
  onFieldClick,
  className = '',
}: CopilotPanelProps) {
  const [faaInput, setFaaInput] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>('inconsistencies');

  const openFaa = state.faaComments.filter((c) => c.status === 'open');
  const pendingAi = state.aiSuggestions.filter((s) => s.status === 'pending').length;

  const toggleSection = (id: string) => {
    setExpandedSection((prev) => (prev === id ? null : id));
  };

  const handleAddFaaComment = () => {
    if (!faaInput.trim()) return;
    onStateChange(addFAAComment(state, faaInput));
    setFaaInput('');
  };

  return (
    <div className={`flex flex-col h-full min-h-0 bg-black spli-chat-messages ${className}`}>
      <div className="flex-shrink-0 px-4 py-3 border-b border-zinc-800/80">
        <p className="spli-chat-label mb-1">Mission memory</p>
        <p className="text-[11px] text-zinc-600 font-light leading-relaxed">
          Tracked changes, FAA requests, and cross-section alerts.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto ai-chat-scrollbar p-4 space-y-3">

          {/* Inconsistencies */}
          <Section
            id="inconsistencies"
            title="Section inconsistencies"
            icon={AlertTriangle}
            count={inconsistencies.length}
            expanded={expandedSection === 'inconsistencies'}
            onToggle={toggleSection}
            tone={inconsistencies.length > 0 ? 'warning' : 'default'}
          >
            {inconsistencies.length === 0 ? (
              <p className="text-xs text-zinc-500 py-1">No cross-section conflicts detected.</p>
            ) : (
              <ul className="space-y-1.5">
                {inconsistencies.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => item.fieldName && onFieldClick?.(item.fieldName)}
                      className="w-full text-left text-xs p-2.5 border border-amber-900/40 bg-amber-950/10 text-amber-200/90 hover:bg-amber-950/20 transition-colors"
                    >
                      <span className="font-medium">{item.sectionTitle}</span>
                      <p className="text-orange-300/70 mt-0.5 leading-relaxed">{item.message}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {/* FAA reviewer comments */}
          <Section
            id="faa"
            title="FAA reviewer requests"
            icon={MessageSquare}
            count={openFaa.length}
            expanded={expandedSection === 'faa'}
            onToggle={toggleSection}
          >
            <div className="space-y-2 mb-3">
              <textarea
                value={faaInput}
                onChange={(e) => setFaaInput(e.target.value)}
                placeholder="Log an FAA comment or change request…"
                rows={2}
                className="w-full text-xs px-3 py-2 bg-black border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 resize-none focus:outline-none focus:border-zinc-600"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddFaaComment}
                disabled={!faaInput.trim()}
                className="h-7 text-[10px] font-bold uppercase tracking-wider rounded-none border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              >
                <Plus className="h-3 w-3 mr-1" />
                Log request
              </Button>
            </div>
            {state.faaComments.length === 0 ? (
              <p className="text-xs text-zinc-500">No FAA feedback logged yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {state.faaComments.map((comment) => (
                  <li
                    key={comment.id}
                    className={`text-xs p-2.5 rounded-lg border ${
                      comment.status === 'open'
                        ? 'border-blue-900/30 bg-blue-950/15 text-blue-200/90'
                        : 'border-zinc-800 bg-zinc-900/30 text-zinc-500'
                    }`}
                  >
                    <p className="leading-relaxed">{comment.text}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-zinc-600">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                      {comment.status === 'open' && (
                        <button
                          type="button"
                          onClick={() => onStateChange(addressFAAComment(state, comment.id))}
                          className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <Check className="h-3 w-3" />
                          Mark addressed
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {/* Change history */}
          <Section
            id="changes"
            title="Change history"
            icon={History}
            count={state.changeHistory.length}
            expanded={expandedSection === 'changes'}
            onToggle={toggleSection}
          >
            {state.changeHistory.length === 0 ? (
              <p className="text-xs text-zinc-500">Changes will appear here with attribution.</p>
            ) : (
              <ul className="space-y-1.5 max-h-48 overflow-y-auto ai-chat-scrollbar">
                {state.changeHistory.slice(0, 15).map((change) => (
                  <li
                    key={change.id}
                    className="text-xs p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-zinc-300">{change.fieldLabel}</span>
                      <Badge
                        variant="outline"
                        className="text-[9px] h-4 border-zinc-700 text-zinc-500"
                      >
                        {SOURCE_LABELS[change.source] ?? change.source}
                      </Badge>
                    </div>
                    {change.attribution && (
                      <p className="text-zinc-500 mt-1">{change.attribution}</p>
                    )}
                    <p className="text-zinc-600 mt-1 truncate">
                      {change.previousValue ? `"${change.previousValue.slice(0, 40)}…" → ` : ''}
                      "{change.newValue.slice(0, 60)}{change.newValue.length > 60 ? '…' : ''}"
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {/* AI suggestion audit */}
          <Section
            id="ai-audit"
            title="AI suggestion log"
            icon={ClipboardList}
            count={pendingAi > 0 ? pendingAi : state.aiSuggestions.length}
            expanded={expandedSection === 'ai-audit'}
            onToggle={toggleSection}
          >
            {state.aiSuggestions.length === 0 ? (
              <p className="text-xs text-zinc-500">AI suggestions will be logged here for audit.</p>
            ) : (
              <ul className="space-y-1.5 max-h-40 overflow-y-auto ai-chat-scrollbar">
                {state.aiSuggestions.slice(0, 10).map((s) => (
                  <li
                    key={s.id}
                    className="text-xs p-2 rounded-lg border border-zinc-800 bg-zinc-900/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300 font-medium">{s.fieldLabel}</span>
                      <Badge
                        variant="outline"
                        className={`text-[9px] h-4 ${
                          s.status === 'applied'
                            ? 'border-green-700 text-green-500'
                            : s.status === 'dismissed'
                              ? 'border-zinc-700 text-zinc-600'
                              : s.status === 'modified'
                                ? 'border-yellow-700 text-yellow-500'
                                : 'border-violet-700 text-violet-400'
                        }`}
                      >
                        {s.status}
                      </Badge>
                    </div>
                    <p className="text-zinc-500 mt-1 line-clamp-2">{s.suggestedValue}</p>
                  </li>
                ))}
              </ul>
            )}
          </Section>
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  icon: Icon,
  count,
  expanded,
  onToggle,
  tone = 'default',
  children,
}: {
  id: string;
  title: string;
  icon: React.ElementType;
  count: number;
  expanded: boolean;
  onToggle: (id: string) => void;
  tone?: 'default' | 'warning';
  children: React.ReactNode;
}) {
  return (
    <div className="border border-zinc-800/80 overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-zinc-950/80 hover:bg-zinc-950 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Icon
            className={`h-3 w-3 ${tone === 'warning' ? 'text-amber-400/90' : 'text-zinc-600'}`}
          />
          <span className="spli-chat-label text-zinc-400">{title}</span>
          {count > 0 && (
            <span className="text-[10px] text-zinc-600 tabular-nums font-mono">{count}</span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-zinc-600" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-zinc-600" />
        )}
      </button>
      {expanded && <div className="px-3 py-2.5 border-t border-zinc-800">{children}</div>}
    </div>
  );
}
