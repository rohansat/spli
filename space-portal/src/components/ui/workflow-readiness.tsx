'use client';

import { useMemo } from 'react';
import { workflowEngine } from '@/lib/workflow-engine';
import { TEAM_LABELS } from '@/lib/part450-schema';
import type { ApplicationRecord } from '@/types/application-record';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Lock, Users } from 'lucide-react';

interface WorkflowReadinessPanelProps {
  formData: Record<string, string>;
  record?: ApplicationRecord | null;
  onSectionClick?: (sectionId: string) => void;
  onFieldClick?: (fieldName: string) => void;
  compact?: boolean;
}

export function WorkflowReadinessPanel({
  formData,
  record,
  onSectionClick,
  onFieldClick,
  compact = false,
}: WorkflowReadinessPanelProps) {
  const readiness = useMemo(
    () => workflowEngine.evaluateReadiness(formData, record ?? undefined),
    [formData, record]
  );

  const blocking = readiness.blockingItems.filter((i) => i.severity === 'blocking');
  const warnings = readiness.blockingItems.filter((i) => i.severity === 'warning');

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-3 p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Readiness</span>
          <span className={`text-sm font-bold ${readiness.overallPercent >= 72 ? 'text-green-400' : 'text-yellow-400'}`}>
            {readiness.overallPercent}%
          </span>
        </div>
        <div className="w-24">
          <Progress value={readiness.overallPercent} className="h-1.5" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Compliance</span>
          <span className="text-sm font-medium text-white">{readiness.complianceScore}/100</span>
        </div>
        {blocking.length > 0 && (
          <Badge variant="outline" className="border-red-500/50 text-red-400 text-xs">
            {blocking.length} blocking
          </Badge>
        )}
        {readiness.canSubmit ? (
          <Badge className="bg-green-600/20 text-green-400 border-green-600/30 text-xs">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ready to submit
          </Badge>
        ) : (
          <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 text-xs">
            <Lock className="h-3 w-3 mr-1" />
            Gated
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="bg-zinc-900/80 border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg">Application Readiness</CardTitle>
          {readiness.canSubmit ? (
            <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
              <CheckCircle className="h-3 w-3 mr-1" />
              Ready to submit
            </Badge>
          ) : (
            <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
              <Lock className="h-3 w-3 mr-1" />
              Submission gated
            </Badge>
          )}
        </div>
        {readiness.submissionGateMessage && (
          <p className="text-sm text-yellow-400/90 mt-1">{readiness.submissionGateMessage}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-zinc-400">Overall completion</span>
              <span className="text-white font-medium">{readiness.overallPercent}%</span>
            </div>
            <Progress value={readiness.overallPercent} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-zinc-400">Compliance score</span>
              <span className="text-white font-medium">{readiness.complianceScore}/100</span>
            </div>
            <Progress value={readiness.complianceScore} className="h-2" />
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">Section status</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {readiness.sectionStates.map((state) => (
              <button
                key={state.sectionId}
                type="button"
                onClick={() => onSectionClick?.(state.sectionId)}
                className={`flex items-center justify-between p-2 rounded-lg border text-left transition-colors ${
                  state.isLocked
                    ? 'border-zinc-700 bg-zinc-800/50 opacity-60 cursor-not-allowed'
                    : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/30'
                }`}
                disabled={state.isLocked}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {state.isLocked ? (
                    <Lock className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0" />
                  ) : state.completionPercent >= 100 ? (
                    <CheckCircle className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                  ) : (
                    <div className="h-3.5 w-3.5 rounded-full border border-zinc-500 flex-shrink-0" />
                  )}
                  <span className="text-xs text-white truncate">
                    {state.sectionId.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] text-zinc-500">{TEAM_LABELS[state.ownerTeam]}</span>
                  <span className="text-xs text-zinc-400">{state.completionPercent}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {blocking.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-red-400 uppercase tracking-wide mb-2 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Blocking items ({blocking.length})
            </h4>
            <ul className="space-y-1.5">
              {blocking.slice(0, 5).map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => item.fieldName && onFieldClick?.(item.fieldName)}
                    className="w-full text-left text-xs p-2 rounded bg-red-950/30 border border-red-900/40 text-red-200 hover:bg-red-950/50"
                  >
                    <span className="font-medium">{item.sectionTitle}</span>
                    {item.fieldLabel && <span className="text-red-300/70"> · {item.fieldLabel}</span>}
                    <p className="text-red-300/80 mt-0.5">{item.message}</p>
                    <span className="text-[10px] text-red-400/60 flex items-center gap-1 mt-1">
                      <Users className="h-3 w-3" />
                      {TEAM_LABELS[item.ownerTeam]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {warnings.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-yellow-400/80 uppercase tracking-wide mb-2">
              Cross-reference warnings ({warnings.length})
            </h4>
            <ul className="space-y-1">
              {warnings.slice(0, 3).map((item) => (
                <li key={item.id} className="text-xs text-yellow-200/70 p-2 rounded bg-yellow-950/20 border border-yellow-900/30">
                  {item.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
