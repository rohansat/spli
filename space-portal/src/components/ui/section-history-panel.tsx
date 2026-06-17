'use client';

import { useState, useEffect } from 'react';
import { loadVersionHistory, rollbackToVersion } from '@/lib/application-record-service';
import type { ApplicationVersion } from '@/types/application-record';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, RotateCcw, ChevronDown, ChevronUp, User, Clock } from 'lucide-react';

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
    <Card className="bg-zinc-900/80 border-zinc-800">
      <CardHeader
        className="pb-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <History className="h-4 w-4 text-blue-400" />
            Version History
            <Badge variant="outline" className="text-xs border-zinc-600 text-zinc-400 ml-1">
              v{currentVersion}
            </Badge>
          </CardTitle>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-zinc-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          )}
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="pt-0">
          {loading ? (
            <p className="text-sm text-zinc-500 py-4 text-center">Loading history...</p>
          ) : versions.length === 0 ? (
            <p className="text-sm text-zinc-500 py-4 text-center">No versions yet — save to create the first snapshot</p>
          ) : (
            <ul className="space-y-2 max-h-64 overflow-y-auto ai-chat-scrollbar">
              {versions.map((version) => (
                <li
                  key={version.id}
                  className="border border-zinc-800 rounded-lg overflow-hidden"
                >
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-3 hover:bg-zinc-800/50 text-left"
                    onClick={() =>
                      setExpandedVersion(expandedVersion === version.version ? null : version.version)
                    }
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">v{version.version}</span>
                        {version.version === currentVersion && (
                          <Badge className="text-[10px] bg-blue-600/20 text-blue-300 border-0">current</Badge>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">{version.changeSummary}</p>
                    </div>
                    <div className="text-right text-[10px] text-zinc-500">
                      <div className="flex items-center gap-1 justify-end">
                        <User className="h-3 w-3" />
                        {version.authorName || version.author.split('@')[0]}
                      </div>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        <Clock className="h-3 w-3" />
                        {new Date(version.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </button>

                  {expandedVersion === version.version && (
                    <div className="px-3 pb-3 border-t border-zinc-800">
                      {version.fieldDiffs.length > 0 ? (
                        <ul className="mt-2 space-y-1">
                          {version.fieldDiffs.map((diff, i) => (
                            <li key={i} className="text-xs text-zinc-400">
                              <span className="text-zinc-300">{diff.fieldLabel}</span>
                              <span className="text-zinc-600 mx-1">·</span>
                              <span className={
                                diff.changeType === 'added' ? 'text-green-400' :
                                diff.changeType === 'removed' ? 'text-red-400' : 'text-yellow-400'
                              }>
                                {diff.changeType}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-zinc-500 mt-2">No field-level diffs recorded</p>
                      )}

                      {version.version !== currentVersion && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 h-7 text-xs border-zinc-600 text-zinc-300 hover:text-white"
                          disabled={rollingBack === version.version}
                          onClick={() => handleRollback(version)}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
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
