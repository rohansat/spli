'use client';

import { useState, useEffect } from 'react';
import { loadVersionHistory, rollbackToVersion } from '@/lib/application-record-service';
import type { ApplicationVersion } from '@/types/application-record';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, RotateCcw, ChevronDown, ChevronUp, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionHistoryPanelProps {
  applicationId: string;
  userEmail: string;
  currentVersion: number;
  onRollback?: (formData: Record<string, string>) => void;
}

export function SectionHistoryPanel({
  applicationId,
  userEmail,
  currentVersion,
  onRollback,
}: SectionHistoryPanelProps) {
  const [versions, setVersions] = useState<ApplicationVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null);
  const [rollingBack, setRollingBack] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !userEmail) return;
    setLoading(true);
    loadVersionHistory(applicationId, userEmail)
      .then(setVersions)
      .finally(() => setLoading(false));
  }, [applicationId, userEmail, isOpen, currentVersion]);

  const handleRollback = async (version: ApplicationVersion) => {
    if (!confirm(`Roll back to version ${version.version}? Current unsaved changes will be lost.`)) return;
    setRollingBack(version.version);
    try {
      const { formData } = await rollbackToVersion(applicationId, userEmail, version);
      onRollback?.(formData);
      const updated = await loadVersionHistory(applicationId, userEmail);
      setVersions(updated);
    } finally {
      setRollingBack(null);
    }
  };

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
            <History className="h-4 w-4 flex-shrink-0 text-blue-300/80" />
            <span className="truncate">Version history</span>
            <Badge variant="outline" className="ml-1 h-5 shrink-0 border-white/15 bg-white/[0.04] text-[10px] text-white/50">
              v{currentVersion}
            </Badge>
          </CardTitle>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-white/40" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-white/40" />
          )}
        </div>
        {!isOpen && (
          <p className="mt-1.5 line-clamp-1 min-h-4 text-xs text-white/40">
            Track saves and restore previous versions
          </p>
        )}
      </CardHeader>

      {isOpen && (
        <CardContent className="px-5 py-4">
          {loading ? (
            <p className="py-4 text-center text-sm text-white/40">Loading history...</p>
          ) : versions.length === 0 ? (
            <p className="py-4 text-center text-sm text-white/40">No versions yet — save to create the first snapshot</p>
          ) : (
            <ul className="ai-chat-scrollbar max-h-64 space-y-2 overflow-y-auto">
              {versions.map((version) => (
                <li
                  key={version.id}
                  className="overflow-hidden rounded-lg border border-white/[0.06] bg-black/20"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-white/[0.03]"
                    onClick={() =>
                      setExpandedVersion(expandedVersion === version.version ? null : version.version)
                    }
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">v{version.version}</span>
                        {version.version === currentVersion && (
                          <Badge className="border-0 bg-blue-500/15 text-[10px] text-blue-300">current</Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-white/45">{version.changeSummary}</p>
                    </div>
                    <div className="text-right text-[10px] text-white/35">
                      <div className="flex items-center justify-end gap-1">
                        <User className="h-3 w-3" />
                        {version.authorName || version.author.split('@')[0]}
                      </div>
                      <div className="mt-0.5 flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(version.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </button>

                  {expandedVersion === version.version && (
                    <div className="border-t border-white/[0.06] px-3 pb-3">
                      {version.fieldDiffs.length > 0 ? (
                        <ul className="mt-2 space-y-1">
                          {version.fieldDiffs.map((diff, i) => (
                            <li key={i} className="text-xs text-white/45">
                              <span className="text-white/70">{diff.fieldLabel}</span>
                              <span className="mx-1 text-white/25">·</span>
                              <span className={
                                diff.changeType === 'added' ? 'text-emerald-400' :
                                diff.changeType === 'removed' ? 'text-red-400' : 'text-amber-400'
                              }>
                                {diff.changeType}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-xs text-white/35">No field-level diffs recorded</p>
                      )}

                      {version.version !== currentVersion && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 h-7 border-white/15 text-xs text-white/70 hover:bg-white/[0.04] hover:text-white"
                          disabled={rollingBack === version.version}
                          onClick={() => handleRollback(version)}
                        >
                          <RotateCcw className="mr-1 h-3 w-3" />
                          {rollingBack === version.version ? 'Rolling back...' : `Restore v${version.version}`}
                        </Button>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      )}
    </Card>
  );
}
