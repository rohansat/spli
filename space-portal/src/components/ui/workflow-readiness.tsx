'use client';

import { useMemo, useState } from 'react';
import { workflowEngine } from '@/lib/workflow-engine';
import { getSectionById, TEAM_LABELS } from '@/lib/part450-schema';
import type { ApplicationRecord } from '@/types/application-record';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Lock,
  Users,
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
    <Card className="bg-zinc-900/80 border-zinc-800">
      <CardHeader
        className="pb-2 cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-white text-base flex items-center gap-2 min-w-0">
            <ClipboardCheck className="h-4 w-4 text-zinc-400 flex-shrink-0" />
            <span className="truncate">Application Readiness</span>
          </CardTitle>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!isOpen && (
              <>
                <span
                  className={`text-sm font-semibold tabular-nums ${
                    readiness.overallPercent >= 72 ? 'text-green-400' : 'text-yellow-400'
                  }`}
                >
                  {readiness.overallPercent}%
                </span>
                <span className="text-xs text-zinc-500 hidden sm:inline">
                  · {readiness.complianceScore}/100 compliance
                </span>
                {blocking.length > 0 && (
                  <Badge variant="outline" className="border-red-500/40 text-red-400 text-[10px] h-5">
                    {blocking.length} blocking
                  </Badge>
                )}
                {readiness.canSubmit ? (
                  <Badge className="bg-green-600/15 text-green-400 border-green-600/25 text-[10px] h-5">
                    Ready
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-yellow-500/40 text-yellow-400 text-[10px] h-5">
                    Gated
                  </Badge>
                )}
              </>
            )}
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-zinc-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            )}
          </div>
        </div>
        {!isOpen && readiness.submissionGateMessage && blocking.length > 0 && (
          <p className="text-xs text-zinc-500 mt-1.5 line-clamp-1">{readiness.submissionGateMessage}</p>
        )}
      </CardHeader>

      {isOpen && (
        <CardContent className="pt-0 space-y-5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {readiness.canSubmit ? (
              <Badge className="bg-green-600/15 text-green-400 border-green-600/25">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ready to submit
              </Badge>
            ) : (
              <Badge variant="outline" className="border-yellow-500/40 text-yellow-400">
                <Lock className="h-3 w-3 mr-1" />
                Submission gated
              </Badge>
            )}
            {readiness.submissionGateMessage && (
              <p className="text-xs text-yellow-400/80 flex-1 min-w-[200px]">
                {readiness.submissionGateMessage}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-zinc-400">Overall completion</span>
                <span className="text-white font-medium tabular-nums">{readiness.overallPercent}%</span>
              </div>
              <Progress value={readiness.overallPercent} className="h-1.5" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-zinc-400">Compliance score</span>
                <span className="text-white font-medium tabular-nums">{readiness.complianceScore}/100</span>
              </div>
              <Progress value={readiness.complianceScore} className="h-1.5" />
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">
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
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-colors ${
                      state.isLocked
                        ? 'border-zinc-800 bg-zinc-950/50 opacity-60 cursor-not-allowed'
                        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/30'
                    }`}
                    disabled={state.isLocked}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {state.isLocked ? (
                        <Lock className="h-3.5 w-3.5 text-zinc-600 flex-shrink-0" />
                      ) : state.completionPercent >= 100 ? (
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border border-zinc-600 flex-shrink-0" />
                      )}
                      <span className="text-xs text-zinc-200 truncate">
                        {section?.title ?? state.sectionId}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-[10px] text-zinc-600">{TEAM_LABELS[state.ownerTeam]}</span>
                      <span className="text-xs text-zinc-400 tabular-nums w-8 text-right">
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
              <h4 className="text-[11px] font-medium text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Blocking ({blocking.length})
              </h4>
              <ul className="space-y-1.5">
                {blocking.slice(0, 5).map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => item.fieldName && onFieldClick?.(item.fieldName)}
                      className="w-full text-left text-xs p-2.5 rounded-lg bg-red-950/20 border border-red-900/30 text-red-200/90 hover:bg-red-950/30 transition-colors"
                    >
                      <span className="font-medium text-red-200">{item.sectionTitle}</span>
                      {item.fieldLabel && (
                        <span className="text-red-300/60"> · {item.fieldLabel}</span>
                      )}
                      <p className="text-red-300/70 mt-0.5 leading-relaxed">{item.message}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {warnings.length > 0 && (
            <div>
              <h4 className="text-[11px] font-medium text-yellow-500/80 uppercase tracking-wider mb-2">
                Warnings ({warnings.length})
              </h4>
              <ul className="space-y-1">
                {warnings.slice(0, 3).map((item) => (
                  <li
                    key={item.id}
                    className="text-xs text-yellow-200/70 p-2 rounded-lg bg-yellow-950/15 border border-yellow-900/25"
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
