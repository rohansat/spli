import { workflowEngine } from '@/lib/workflow-engine';
import { getSectionByField } from '@/lib/part450-schema';
import type {
  AISuggestionRecord,
  ChangeEvent,
  ChangeSource,
  CopilotState,
  FAAReviewerComment,
  SectionInconsistency,
} from '@/types/copilot';

const STORAGE_PREFIX = 'spli-copilot';

function storageKey(userEmail: string, applicationId: string) {
  return `${STORAGE_PREFIX}:${userEmail}_${applicationId}`;
}

function emptyState(): CopilotState {
  return {
    faaComments: [],
    changeHistory: [],
    aiSuggestions: [],
    updatedAt: new Date().toISOString(),
  };
}

export function loadCopilotState(
  userEmail: string,
  applicationId: string
): CopilotState {
  if (typeof window === 'undefined') return emptyState();
  try {
    const raw = localStorage.getItem(storageKey(userEmail, applicationId));
    if (!raw) return emptyState();
    return { ...emptyState(), ...JSON.parse(raw) };
  } catch {
    return emptyState();
  }
}

export function saveCopilotState(
  userEmail: string,
  applicationId: string,
  state: CopilotState
): void {
  if (typeof window === 'undefined') return;
  const next = { ...state, updatedAt: new Date().toISOString() };
  localStorage.setItem(storageKey(userEmail, applicationId), JSON.stringify(next));
}

/** Detect cross-section conflicts using the workflow engine. */
export function detectInconsistencies(
  formData: Record<string, string>
): SectionInconsistency[] {
  const readiness = workflowEngine.evaluateReadiness(formData);
  return readiness.blockingItems
    .filter(
      (item) =>
        item.id.startsWith('xref-') ||
        item.message.includes('misaligned') ||
        item.message.includes('out of sync')
    )
    .map((item) => ({
      id: item.id,
      severity: item.severity,
      message: item.message,
      sectionTitle: item.sectionTitle,
      fieldName: item.fieldName,
      fieldLabel: item.fieldLabel,
    }));
}

export function addFAAComment(
  state: CopilotState,
  text: string,
  relatedFields: string[] = []
): CopilotState {
  const comment: FAAReviewerComment = {
    id: `faa-${Date.now()}`,
    text: text.trim(),
    relatedFields,
    status: 'open',
    createdAt: new Date().toISOString(),
  };
  return { ...state, faaComments: [comment, ...state.faaComments] };
}

export function addressFAAComment(
  state: CopilotState,
  commentId: string
): CopilotState {
  return {
    ...state,
    faaComments: state.faaComments.map((c) =>
      c.id === commentId
        ? { ...c, status: 'addressed' as const, addressedAt: new Date().toISOString() }
        : c
    ),
  };
}

export function recordChange(
  state: CopilotState,
  params: {
    fieldName: string;
    previousValue: string;
    newValue: string;
    source: ChangeSource;
    attribution?: string;
    faaCommentId?: string;
    aiSuggestionId?: string;
  }
): CopilotState {
  if (params.previousValue === params.newValue) return state;

  const section = getSectionByField(params.fieldName);
  const fieldLabel =
    section?.fields.find((f) => f.name === params.fieldName)?.label ?? params.fieldName;

  const event: ChangeEvent = {
    id: `change-${Date.now()}-${params.fieldName}`,
    fieldName: params.fieldName,
    fieldLabel,
    previousValue: params.previousValue,
    newValue: params.newValue,
    source: params.source,
    attribution: params.attribution,
    faaCommentId: params.faaCommentId,
    aiSuggestionId: params.aiSuggestionId,
    timestamp: new Date().toISOString(),
  };

  const changeHistory = [event, ...state.changeHistory].slice(0, 100);
  return { ...state, changeHistory };
}

export function recordAISuggestion(
  state: CopilotState,
  params: {
    field: string;
    suggestedValue: string;
    messageId?: string;
  }
): { state: CopilotState; record: AISuggestionRecord } {
  const section = getSectionByField(params.field);
  const record: AISuggestionRecord = {
    id: `ai-${Date.now()}-${params.field}`,
    field: params.field,
    fieldLabel: section?.fields.find((f) => f.name === params.field)?.label ?? params.field,
    suggestedValue: params.suggestedValue,
    status: 'pending',
    timestamp: new Date().toISOString(),
    messageId: params.messageId,
  };
  return {
    state: { ...state, aiSuggestions: [record, ...state.aiSuggestions].slice(0, 50) },
    record,
  };
}

export function markSuggestionApplied(
  state: CopilotState,
  suggestionId: string,
  appliedValue: string,
  modified: boolean
): CopilotState {
  return {
    ...state,
    aiSuggestions: state.aiSuggestions.map((s) =>
      s.id === suggestionId
        ? {
            ...s,
            status: modified ? 'modified' : 'applied',
            appliedValue,
          }
        : s
    ),
  };
}

export function markSuggestionDismissed(
  state: CopilotState,
  suggestionId: string
): CopilotState {
  return {
    ...state,
    aiSuggestions: state.aiSuggestions.map((s) =>
      s.id === suggestionId ? { ...s, status: 'dismissed' } : s
    ),
  };
}

export function buildCopilotContextSummary(
  state: CopilotState,
  inconsistencies: SectionInconsistency[]
): string {
  const parts: string[] = [];

  parts.push(
    'COPILOT ROLE: You draft and suggest — the human reviews, decides, and submits. Never claim final compliance approval or auto-submit.'
  );

  if (inconsistencies.length > 0) {
    parts.push(
      `SECTION INCONSISTENCIES (${inconsistencies.length}): ${inconsistencies
        .slice(0, 5)
        .map((i) => i.message)
        .join('; ')}`
    );
  }

  const openFaa = state.faaComments.filter((c) => c.status === 'open');
  if (openFaa.length > 0) {
    parts.push(
      `OPEN FAA REVIEWER REQUESTS (${openFaa.length}): ${openFaa
        .slice(0, 3)
        .map((c) => c.text)
        .join('; ')}`
    );
  }

  const recentChanges = state.changeHistory.slice(0, 3);
  if (recentChanges.length > 0) {
    parts.push(
      `RECENT CHANGES: ${recentChanges
        .map((c) => `${c.fieldLabel} (${c.source}${c.attribution ? `: ${c.attribution}` : ''})`)
        .join('; ')}`
    );
  }

  return parts.join('\n');
}
