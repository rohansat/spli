import type { FormSuggestion } from '@/components/ui/ai-chat-message';

const FIELD_RULES: Array<{ field: string; patterns: RegExp[] }> = [
  {
    field: 'missionObjective',
    patterns: [/primary objective/i, /mission is/i, /objective of the mission/i, /deploy.*into/i, /commercial orbital/i],
  },
  {
    field: 'vehicleDescription',
    patterns: [/launch vehicle/i, /two-stage/i, /liquid-propellant/i, /stages/i, /onboard flight safety/i],
  },
  {
    field: 'launchReEntrySequence',
    patterns: [/launch operations/i, /liftoff/i, /first stage/i, /second stage/i, /stage will/i, /separate at/i, /propellant loading/i, /pre-launch/i],
  },
  {
    field: 'groundOperations',
    patterns: [/payload integration/i, /vehicle assembly/i, /system verification/i, /pre-launch checks/i],
  },
  {
    field: 'technicalSummary',
    patterns: [/payload consists/i, /spacecraft designed/i, /technology demonstration/i, /onboard system performance/i],
  },
  {
    field: 'propulsionTypes',
    patterns: [/liquid-propellant/i, /propulsion/i, /engine ignition/i, /second stage will ignite/i],
  },
  {
    field: 'dimensionsMassStages',
    patterns: [/two-stage/i, /stages/i, /expendable system/i],
  },
  {
    field: 'trajectoryOverview',
    patterns: [/trajectory/i, /ascent corridor/i, /hazard areas/i, /orbital insertion/i, /designated orbit/i],
  },
  {
    field: 'flightPath',
    patterns: [/ascent corridor/i, /flight path/i, /over designated hazard/i],
  },
  {
    field: 'launchSite',
    patterns: [/launch site/i, /faa-approved launch site/i, /within the united states/i],
  },
  {
    field: 'airspaceMaritimeNotes',
    patterns: [/airspace and maritime/i, /coordinating with airspace/i, /maritime authorities/i],
  },
  {
    field: 'safetyConsiderations',
    patterns: [/safety-critical events/i, /contingency procedures/i, /flight termination/i, /risk mitigation/i, /public safety/i, /hazard controls/i],
  },
  {
    field: 'earlyRiskAssessments',
    patterns: [/safety-critical events include/i, /maximum dynamic pressure/i],
  },
  {
    field: 'plannedSafetyTools',
    patterns: [/flight termination/i, /autonomous flight termination/i, /onboard flight safety system/i],
  },
  {
    field: 'recoverySystems',
    patterns: [/reusable configuration/i, /recovery operations/i, /recovery zones/i, /controlled disposal/i, /reentry/i],
  },
  {
    field: 'landingSite',
    patterns: [/recovery zones/i, /reentry according/i, /disposal maneuver/i],
  },
  {
    field: 'licenseTypeIntent',
    patterns: [/commercial/i, /part 450/i, /applicant/i],
  },
];

export function extractRawMissionText(userInput: string): string {
  const markers = [
    'populate every field you can.',
    'populate every field you can',
    'structured section format and populate',
  ];
  for (const marker of markers) {
    const idx = userInput.toLowerCase().indexOf(marker.toLowerCase());
    if (idx !== -1) {
      const after = userInput.slice(idx + marker.length).replace(/^[.\s:\n]+/, '').trim();
      if (after.length > 80) return after;
    }
  }
  if (userInput.includes('\n\n')) {
    const parts = userInput.split('\n\n');
    const last = parts[parts.length - 1]?.trim() ?? '';
    if (last.length > 120) return last;
  }
  return userInput.trim();
}

function scoreParagraph(field: string, paragraph: string): number {
  const rule = FIELD_RULES.find((r) => r.field === field);
  if (!rule) return 0;
  return rule.patterns.reduce((score, pattern) => (pattern.test(paragraph) ? score + 1 : score), 0);
}

export function parseMissionToFormFields(missionText: string): FormSuggestion[] {
  const text = missionText.trim();
  if (text.length < 80) return [];

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => p.length > 30);

  if (paragraphs.length === 0) {
    paragraphs.push(text.replace(/\s+/g, ' ').trim());
  }

  const fieldValues: Record<string, string[]> = {};

  for (const paragraph of paragraphs) {
    let bestField = '';
    let bestScore = 0;

    for (const rule of FIELD_RULES) {
      const score = scoreParagraph(rule.field, paragraph);
      if (score > bestScore) {
        bestScore = score;
        bestField = rule.field;
      }
    }

    if (bestField && bestScore > 0) {
      fieldValues[bestField] = fieldValues[bestField] ?? [];
      if (!fieldValues[bestField].includes(paragraph)) {
        fieldValues[bestField].push(paragraph);
      }
    }
  }

  if (!fieldValues.missionObjective && paragraphs[0]) {
    fieldValues.missionObjective = [paragraphs[0]];
  }

  for (const paragraph of paragraphs) {
    if (!fieldValues.vehicleDescription && /launch vehicle|two-stage|liquid-propellant|stages/i.test(paragraph)) {
      fieldValues.vehicleDescription = [paragraph];
    }
    if (!fieldValues.launchSite && /launch site|faa-approved launch site/i.test(paragraph)) {
      fieldValues.launchSite = [paragraph];
    }
    if (!fieldValues.propulsionTypes && /liquid-propellant|propulsion|engine ignition/i.test(paragraph)) {
      fieldValues.propulsionTypes = [paragraph];
    }
    if (!fieldValues.flightPath && /ascent corridor|flight path|trajectory/i.test(paragraph)) {
      fieldValues.flightPath = [paragraph];
    }
    if (!fieldValues.airspaceMaritimeNotes && /airspace|maritime authorities/i.test(paragraph)) {
      fieldValues.airspaceMaritimeNotes = [paragraph];
    }
    if (!fieldValues.recoverySystems && /expendable|recovery|reentry|disposal/i.test(paragraph)) {
      fieldValues.recoverySystems = [paragraph];
    }
    if (!fieldValues.plannedSafetyTools && /flight termination|flight safety system/i.test(paragraph)) {
      fieldValues.plannedSafetyTools = [paragraph];
    }
    if (!fieldValues.groundOperations && /payload integration|vehicle assembly|pre-launch checks/i.test(paragraph)) {
      fieldValues.groundOperations = [paragraph];
    }
    if (!fieldValues.licenseTypeIntent && /commercial orbital|part 450|commercial launch/i.test(paragraph)) {
      fieldValues.licenseTypeIntent = [paragraph];
    }
  }

  if (fieldValues.launchReEntrySequence && fieldValues.groundOperations) {
    const launch = fieldValues.launchReEntrySequence.join(' ');
    if (/payload integration|vehicle assembly|pre-launch checks/i.test(launch)) {
      delete fieldValues.groundOperations;
    }
  }

  return Object.entries(fieldValues).map(([field, values]) => ({
    field,
    value: values.join('\n\n'),
    confidence: 0.78,
    reasoning: 'Parsed from mission description',
  }));
}

export function mergeFormSuggestions(
  primary: FormSuggestion[],
  fallback: FormSuggestion[]
): FormSuggestion[] {
  const map = new Map<string, FormSuggestion>();

  for (const suggestion of fallback) {
    map.set(suggestion.field, suggestion);
  }
  for (const suggestion of primary) {
    if (suggestion.value?.trim()) {
      map.set(suggestion.field, suggestion);
    }
  }

  return Array.from(map.values()).filter((s) => s.value.trim().length > 0);
}

export function buildFormFillSummaryMessage(
  suggestions: FormSuggestion[],
  fieldLabel: (field: string) => string
): string {
  const count = suggestions.length;
  if (count === 0) {
    return "I couldn't extract form fields from that text. Paste a fuller mission description with vehicle, launch site, trajectory, and safety details.";
  }

  const preview = suggestions.slice(0, 4).map((s) => fieldLabel(s.field));
  const remaining = count - preview.length;
  const previewText =
    remaining > 0 ? `${preview.join(', ')}, and ${remaining} more` : preview.join(', ');

  return `Done — I filled **${count} field${count === 1 ? '' : 's'}** in your application (${previewText}). Review the form on the left and edit anything before submitting.`;
}
