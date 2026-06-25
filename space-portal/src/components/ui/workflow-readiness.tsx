'use client';

import { useMemo, useState } from 'react';
import { workflowEngine } from '@/lib/workflow-engine';
import { getSectionById, TEAM_LABELS } from '@/lib/part450-schema';
import type { ApplicationRecord } from '@/types/application-record';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Lock,
} from 'lucide-react';

interface WorkflowReadinessPanelProps {
  formData: Record<string, string>;
  record?: ApplicationRecord | null;
  onSectionClick?: (sectionId: string) => void;
  onFieldClick?: (fieldName: string) => void;
  defaultOpen?: boolean;
}

export function WorkflowReadinessPanel({
  formData,
  record,
  onSectionClick,
  onFieldClick,
  defaultOpen = false,
}: WorkflowReadinessPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const readiness = useMemo(
    () => workflowEngine.evaluateReadiness(formData, record ?? undefined),
    [formData, record]
  );

  const blocking = readiness.blockingItems.filter((i) => i.severity === 'blocking');
  const warnings = readiness.blockingItems.filter((i) => i.severity === 'warning');

  return (
    <Card className="h-fit w-full self-start overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-xl shadow-black/20 backdrop-blur-sm">
      <CardHeader
        className={cn(
          'cursor-pointer space-y-0 p-0 px-5 py-4',
          !isOpen && 'min-h-[74px]',
          isOpen && 'border-b border-white/[0.06] pb-3'
        )}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((open) => !open);
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex min-w-0 items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white">
            <ClipboardCheck className="h-4 w-4 flex-shrink-0 text-blue-300/80" />
            <span className="truncate">Application readiness</span>
          </CardTitle>
          <div className="flex flex-shrink-0 items-center gap-2">
            {!isOpen && (
              <>
                <span
                  className={`text-sm font-semibold tabular-nums ${
                    readiness.overallPercent >= 72 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {readiness.overallPercent}%
                </span>
                <span className="hidden text-xs text-white/40 sm:inline">
                  · {readiness.complianceScore}/100 compliance
                </span>
                {blocking.length > 0 && (
                  <Badge variant="outline" className="h-5 border-red-500/30 bg-red-500/10 text-[10px] text-red-300">
                    {blocking.length} blocking
                  </Badge>
                )}
                {readiness.canSubmit ? (
                  <Badge className="h-5 border-0 bg-emerald-500/15 text-[10px] text-emerald-300">
                    Ready
                  </Badge>
                ) : (
                  <Badge variant="outline" className="h-5 border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-300">
                    Gated
                  </Badge>
                )}
              </>
            )}
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-white/40" />
            ) : (
              <ChevronDown className="h-4 w-4 text-white/40" />
            )}
          </div>
        </div>
        {!isOpen && (
          <p className="mt-1.5 line-clamp-1 min-h-4 text-xs text-white/40">
            {readiness.submissionGateMessage && blocking.length > 0
              ? readiness.submissionGateMessage
              : 'Completion and compliance overview'}
          </p>
        )}
      </CardHeader>

      {isOpen && (
        <CardContent className="space-y-5 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {readiness.canSubmit ? (
              <Badge className="border-0 bg-emerald-500/15 text-emerald-300">
                <CheckCircle className="mr-1 h-3 w-3" />
                Ready to submit
              </Badge>
            ) : (
              <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300">
                <Lock className="mr-1 h-3 w-3" />
                Submission gated
              </Badge>
            )}
            {readiness.submissionGateMessage && (
              <p className="min-w-[200px] flex-1 text-xs text-amber-300/80">
                {readiness.submissionGateMessage}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="text-white/45">Overall completion</span>
                <span className="font-medium tabular-nums text-white">{readiness.overallPercent}%</span>
              </div>
              <Progress value={readiness.overallPercent} className="h-1.5 bg-white/[0.06]" />
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="text-white/45">Compliance score</span>
                <span className="font-medium tabular-nums text-white">{readiness.complianceScore}/100</span>
              </div>
              <Progress value={readiness.complianceScore} className="h-1.5 bg-white/[0.06]" />
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-white/40">
              Sections
            </h4>
            <div className="grid grid-cols-1 gap-1.5">
              {readiness.sectionStates.map((state) => {
                const section = getSectionById(state.sectionId);
                return (
                  <button
                    key={state.sectionId}
                    type="button"
                    onClick={() => onSectionClick?.(state.sectionId)}
                    className={`flex items-center justify-between rounded-lg border p-2.5 text-left transition-colors ${
                      state.isLocked
                        ? 'cursor-not-allowed border-white/[0.06] bg-black/20 opacity-60'
                        : 'border-white/[0.06] bg-black/20 hover:border-white/12 hover:bg-white/[0.03]'
                    }`}
                    disabled={state.isLocked}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      {state.isLocked ? (
                        <Lock className="h-3.5 w-3.5 flex-shrink-0 text-white/30" />
                      ) : state.completionPercent >= 100 ? (
                        <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                      ) : (
                        <div className="h-3.5 w-3.5 flex-shrink-0 rounded-full border border-white/20" />
                      )}
                      <span className="truncate text-xs text-white/80">
                        {section?.title ?? state.sectionId}
                      </span>
                    </div>
                    <div className="ml-2 flex flex-shrink-0 items-center gap-2">
                      <span className="text-[10px] text-white/30">{TEAM_LABELS[state.ownerTeam]}</span>
                      <span className="w-8 text-right text-xs tabular-nums text-white/50">
                        {state.completionPercent}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {blocking.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-red-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                Blocking ({blocking.length})
              </h4>
              <ul className="space-y-1.5">
                {blocking.slice(0, 5).map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => item.fieldName && onFieldClick?.(item.fieldName)}
                      className="w-full rounded-lg border border-red-500/20 bg-red-500/[0.06] p-2.5 text-left text-xs text-red-200/90 transition-colors hover:bg-red-500/10"
                    >
                      <span className="font-medium text-red-200">{item.sectionTitle}</span>
                      {item.fieldLabel && (
                        <span className="text-red-300/60"> · {item.fieldLabel}</span>
                      )}
                      <p className="mt-0.5 leading-relaxed text-red-300/70">{item.message}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {warnings.length > 0 && (
            <div>
              <h4 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-amber-400/80">
                Warnings ({warnings.length})
              </h4>
              <ul className="space-y-1">
                {warnings.slice(0, 3).map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-2 text-xs text-amber-200/70"
                  >
                    {item.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
