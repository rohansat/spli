import { part450FormTemplate } from '@/lib/mock-data';
import type { FormSuggestion } from '@/components/ui/ai-chat-message';
import {
  loadCopilotState,
  markSuggestionApplied,
  recordChange,
  saveCopilotState,
} from '@/lib/copilot-service';

export type ApplicationActionResult =
  | { handled: true; message: string; navigateToField?: string }
  | { handled: false };

const TAB_ALIASES: Record<string, string> = {
  'concept of operations': 'section-0',
  conops: 'section-0',
  'vehicle overview': 'section-1',
  'launch location': 'section-2',
  'launch information': 'section-3',
  'safety considerations': 'section-4',
  timeline: 'section-5',
  questions: 'section-6',
};

function findFieldName(query: string): string | undefined {
  const q = query.toLowerCase().trim();
  for (const section of part450FormTemplate.sections) {
    for (const field of section.fields) {
      if (
        field.name.toLowerCase() === q ||
        field.label.toLowerCase() === q ||
        field.label.toLowerCase().includes(q)
      ) {
        return field.name;
      }
    }
  }
  return undefined;
}

export function tryParseApplicationCommand(input: string): ApplicationActionResult {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  if (!trimmed) return { handled: false };

  if (lower.includes('save draft') || lower === 'save') {
    return { handled: true, message: '__cmd__:save_draft' };
  }

  if (lower.includes('submit application') || lower === 'submit') {
    return { handled: true, message: '__cmd__:submit_application' };
  }

  if (
    lower.includes('analyze application') ||
    lower.includes('check completeness') ||
    lower.includes('application analysis')
  ) {
    return { handled: true, message: '__cmd__:analyze_application' };
  }

  const replaceMatch = trimmed.match(/^replace\s+(.+?)\s+with\s+(.+)$/i);
  if (replaceMatch) {
    return {
      handled: true,
      message: `__cmd__:replace_field:${replaceMatch[1].trim()}:${replaceMatch[2].trim()}`,
    };
  }

  const goToMatch = trimmed.match(/^(?:go to|open|jump to|navigate to|show)\s+(.+)$/i);
  if (goToMatch) {
    const fieldName = findFieldName(goToMatch[1]);
    if (fieldName) {
      return {
        handled: true,
        message: `Opened **${goToMatch[1].trim()}** in the form.`,
        navigateToField: fieldName,
      };
    }
  }

  const switchMatch = trimmed.match(/^(?:switch to|open section|go to section)\s+(.+)$/i);
  if (switchMatch) {
    const tab = TAB_ALIASES[switchMatch[1].toLowerCase().trim()];
    if (tab) {
      return { handled: true, message: `__cmd__:switch_tab:${switchMatch[1].trim()}` };
    }
  }

  if (trimmed.startsWith('auto_fill_suggestions:')) {
    return { handled: true, message: trimmed };
  }

  return { handled: false };
}

export function isInternalCommandMessage(message: string): boolean {
  return message.startsWith('__cmd__:');
}

export function parseInternalCommand(message: string): {
  command: string;
  params?: Record<string, string>;
} {
  const body = message.replace('__cmd__:', '');
  const [command, ...rest] = body.split(':');
  if (command === 'replace_field' && rest.length >= 2) {
    return { command, params: { field: rest[0], value: rest.slice(1).join(':') } };
  }
  if (command === 'switch_tab' && rest.length >= 1) {
    return { command, params: { tab: rest.join(':') } };
  }
  return { command };
}

export interface ApplySuggestionsOptions {
  formData: Record<string, string>;
  suggestions: FormSuggestion[];
  userEmail: string;
  applicationId: string;
}

export function applyFormSuggestions({
  formData,
  suggestions,
  userEmail,
  applicationId,
}: ApplySuggestionsOptions): {
  newFormData: Record<string, string>;
  firstField?: string;
} {
  const copilotState = loadCopilotState(userEmail, applicationId);
  let nextState = copilotState;
  const newFormData = { ...formData };

  suggestions.forEach((suggestion) => {
    const prev = formData[suggestion.field] ?? '';
    newFormData[suggestion.field] = suggestion.value;
    nextState = recordChange(nextState, {
      fieldName: suggestion.field,
      previousValue: prev,
      newValue: suggestion.value,
      source: 'ai_suggestion',
      attribution: 'User approved AI draft',
    });
    const pending = nextState.aiSuggestions.find(
      (s) => s.field === suggestion.field && s.status === 'pending'
    );
    if (pending) {
      nextState = markSuggestionApplied(
        nextState,
        pending.id,
        suggestion.value,
        suggestion.value !== pending.suggestedValue
      );
    }
  });

  saveCopilotState(userEmail, applicationId, nextState);

  return {
    newFormData,
    firstField: suggestions[0]?.field,
  };
}
