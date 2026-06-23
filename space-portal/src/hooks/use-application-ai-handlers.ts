'use client';

import { useCallback } from 'react';
import type { FormSuggestion } from '@/components/ui/ai-chat-message';
import {
  applyFormSuggestions,
  isInternalCommandMessage,
  parseInternalCommand,
  tryParseApplicationCommand,
  type ApplicationActionResult,
} from '@/lib/application-ai-actions';
import {
  loadCopilotState,
  markSuggestionApplied,
  recordChange,
  saveCopilotState,
} from '@/lib/copilot-service';

interface UseApplicationAIHandlersOptions {
  applicationId: string;
  userEmail?: string;
  formData: Record<string, string>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleSave: (dataOverride?: Record<string, string>) => Promise<void>;
  navigateToField: (fieldName: string) => void;
  onFieldApplied?: (fieldName: string) => void;
  executeCommand: (
    command: string,
    params?: Record<string, string>
  ) => Promise<{ success: boolean; message: string }>;
  toast: (props: { title: string; description?: string }) => void;
}

export function useApplicationAIHandlers({
  applicationId,
  userEmail,
  formData,
  setFormData,
  handleSave,
  navigateToField,
  onFieldApplied,
  executeCommand,
  toast,
}: UseApplicationAIHandlersOptions) {
  const applySuggestions = useCallback(
    (suggestions: FormSuggestion[]) => {
      if (!suggestions.length || !userEmail) return;

      let newFormData: Record<string, string> = {};
      let firstField: string | undefined;

      setFormData((prev) => {
        const result = applyFormSuggestions({
          formData: prev,
          suggestions,
          userEmail,
          applicationId,
        });
        newFormData = result.newFormData;
        firstField = result.firstField;
        return newFormData;
      });

      void handleSave(newFormData);

      if (firstField) {
        navigateToField(firstField);
        onFieldApplied?.(firstField);
      }

      toast({
        title: `${suggestions.length} draft${suggestions.length > 1 ? 's' : ''} applied`,
        description: 'Review the updated fields before submitting.',
      });
    },
    [applicationId, handleSave, navigateToField, onFieldApplied, setFormData, toast, userEmail]
  );

  const handleApplicationInput = useCallback(
    async (input: string): Promise<ApplicationActionResult> => {
      const parsed = tryParseApplicationCommand(input);
      if (!parsed.handled) return { handled: false };

      if (parsed.navigateToField) {
        navigateToField(parsed.navigateToField);
        return parsed;
      }

      if (input.startsWith('auto_fill_suggestions:')) {
        try {
          const suggestions = JSON.parse(
            input.replace('auto_fill_suggestions:', '')
          ) as FormSuggestion[];
          if (suggestions.length > 0) {
            applySuggestions(suggestions);
            return {
              handled: true,
              message: `Applied ${suggestions.length} field draft${suggestions.length > 1 ? 's' : ''} to your application and saved.`,
            };
          }
        } catch {
          return {
            handled: true,
            message: 'Could not apply the suggested field updates. Please try again.',
          };
        }
      }

      if (isInternalCommandMessage(parsed.message)) {
        const { command, params } = parseInternalCommand(parsed.message);
        const result = await executeCommand(command, params);
        return { handled: true, message: result.message };
      }

      return parsed;
    },
    [applySuggestions, executeCommand, navigateToField]
  );

  return { applySuggestions, handleApplicationInput };
}
