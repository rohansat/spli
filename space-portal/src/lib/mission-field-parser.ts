import type { FormSuggestion } from '@/components/ui/ai-chat-message';
import { part450FormTemplate } from '@/lib/mock-data';

const FIELD_RULES: Array<{ field: string; patterns: RegExp[]; maxLength?: number }> = [
  {
    field: 'missionObjective',
    patterns: [/primary objective/i, /this mission is/i, /objective of the mission/i, /deploy.*into/i, /commercial orbital/i],
    maxLength: 500,
  },
  {
    field: 'vehicleDescription',
    patterns: [/launch vehicle/i, /two-stage/i, /liquid-propellant/i, /onboard flight safety/i, /expendable system/i],
    maxLength: 450,
  },
  {
    field: 'launchReEntrySequence',
    patterns: [/following launch/i, /first stage/i, /second stage/i, /liftoff/i, /separate at/i, /orbital insertion/i, /propellant loading/i],
    maxLength: 600,
  },
  {
    field: 'groundOperations',
    patterns: [/payload integration/i, /vehicle assembly/i, /system verification/i, /pre-launch checks/i, /propellant loading/i],
    maxLength: 450,
  },
  {
    field: 'technicalSummary',
    patterns: [/payload consists/i, /spacecraft designed/i, /technology demonstration/i, /onboard system performance/i],
    maxLength: 450,
  },
  {
    field: 'propulsionTypes',
    patterns: [/liquid-propellant/i, /liquid propellant/i, /propulsion system/i],
    maxLength: 280,
  },
  {
    field: 'dimensionsMassStages',
    patterns: [/gross liftoff mass/i, /golom/i, /\d+\s*(kg|lb|tons)/i, /dimensions/i, /mass breakdown/i],
    maxLength: 280,
  },
  {
    field: 'trajectoryOverview',
    patterns: [/mission trajectory/i, /trajectory will/i, /ascent corridor/i, /designated orbit/i, /orbital insertion parameters/i],
    maxLength: 450,
  },
  {
    field: 'flightPath',
    patterns: [/ascent corridor/i, /flight path/i, /over designated hazard/i],
    maxLength: 400,
  },
  {
    field: 'launchSite',
    patterns: [/faa-approved launch site/i, /launch site located/i, /conducted from an? faa-approved/i, /launch operations will be conducted from/i],
    maxLength: 220,
  },
  {
    field: 'airspaceMaritimeNotes',
    patterns: [/airspace and maritime/i, /coordinating with airspace/i, /maritime authorities/i],
    maxLength: 350,
  },
  {
    field: 'safetyConsiderations',
    patterns: [/safety-critical events/i, /contingency procedures/i, /risk mitigation measures/i, /hazard controls/i, /public safety/i],
    maxLength: 600,
  },
  {
    field: 'earlyRiskAssessments',
    patterns: [/safety-critical events include/i, /maximum dynamic pressure/i, /early risk/i],
    maxLength: 400,
  },
  {
    field: 'plannedSafetyTools',
    patterns: [/flight termination/i, /autonomous flight termination/i, /onboard flight safety system/i],
    maxLength: 350,
  },
  {
    field: 'recoverySystems',
    patterns: [/reusable configuration/i, /recovery operations/i, /recovery zones/i, /controlled disposal maneuver/i, /debris mitigation/i],
    maxLength: 400,
  },
  {
    field: 'landingSite',
    patterns: [/recovery zones/i, /reentry according/i, /disposal maneuver/i, /landing\/recovery/i],
    maxLength: 280,
  },
  {
    field: 'siteNamesCoordinates',
    patterns: [/coordinates/i, /latitude/i, /longitude/i, /\d{1,3}°/],
    maxLength: 200,
  },
  {
    field: 'siteOperator',
    patterns: [/site operator/i, /third.?party operator/i, /launch provider/i],
    maxLength: 200,
  },
  {
    field: 'groundSupportEquipment',
    patterns: [/ground support equipment/i, /mobile service tower/i, /\bgse\b/i],
    maxLength: 300,
  },
  {
    field: 'publicSafetyChallenges',
    patterns: [/public safety challenge/i, /overflight/i, /population/i, /debris corridor/i, /minimize risk to the public/i],
    maxLength: 400,
  },
  {
    field: 'launchWindow',
    patterns: [/launch window/i, /target launch date/i, /intended launch/i],
    maxLength: 200,
  },
  {
    field: 'fullApplicationTimeline',
    patterns: [/submit.*full application/i, /full application timeline/i],
    maxLength: 250,
  },
  {
    field: 'intendedWindow',
    patterns: [/intended launch/i, /reentry window/i, /launch\/reentry window/i],
    maxLength: 250,
  },
  {
    field: 'licenseTypeIntent',
    patterns: [/vehicle\/operator license/i, /mission-specific license/i, /license type intent/i],
    maxLength: 250,
  },
  {
    field: 'clarifyPart450',
    patterns: [/clarify.*part 450/i, /question.*faa/i],
    maxLength: 400,
  },
  {
    field: 'uniqueTechInternational',
    patterns: [/international aspect/i, /export control/i, /unique technolog/i, /\bitar\b/i],
    maxLength: 350,
  },
];

const FIELD_SENTENCE_PATTERNS: Partial<Record<string, RegExp[]>> = {
  launchSite: [
    /launch operations will be conducted from an? faa-approved launch site[^.]*\./i,
    /from an? faa-approved launch site[^.]*\./i,
  ],
  missionObjective: [
    /the primary objective of the mission is[^.]*\./i,
    /this mission is a commercial orbital launch[^.]*\./i,
  ],
  vehicleDescription: [
    /the mission will utilize a two-stage liquid-propellant launch vehicle[^.]*\./i,
    /two-stage liquid-propellant launch vehicle[^.]*\./i,
    /the launch vehicle is designed as an expendable system[^.]*\./i,
  ],
  launchReEntrySequence: [
    /following launch, the first stage[^.]*\./i,
    /the vehicle will undergo payload integration[^.]*\./i,
  ],
  technicalSummary: [
    /the payload consists of a technology demonstration spacecraft[^.]*\./i,
    /upon reaching the designated orbit, the payload[^.]*\./i,
  ],
  trajectoryOverview: [/the mission trajectory will follow[^.]*\./i],
  flightPath: [/approved ascent corridor over designated hazard areas[^.]*\./i],
  airspaceMaritimeNotes: [/while coordinating with airspace and maritime authorities[^.]*\./i],
  publicSafetyChallenges: [/minimize risk to the public/i],
  safetyConsiderations: [
    /safety-critical events include[^.]*\./i,
    /the mission incorporates contingency procedures[^.]*\./i,
  ],
  plannedSafetyTools: [/autonomous flight termination capabilities/i],
  recoverySystems: [
    /if a reusable configuration is employed, recovery operations[^.]*\./i,
    /remaining vehicle components will either perform a controlled disposal maneuver[^.]*\./i,
  ],
  groundOperations: [
    /the vehicle will undergo payload integration, vehicle assembly, system verification[^.]*\./i,
  ],
  propulsionTypes: [/two-stage liquid-propellant launch vehicle/i],
};

const FIELD_PRIORITY = [
  'missionObjective',
  'launchSite',
  'vehicleDescription',
  'launchReEntrySequence',
  'technicalSummary',
  'trajectoryOverview',
  'flightPath',
  'safetyConsiderations',
  'groundOperations',
  'recoverySystems',
  'airspaceMaritimeNotes',
  'publicSafetyChallenges',
  'plannedSafetyTools',
  'earlyRiskAssessments',
  'landingSite',
  'propulsionTypes',
];

function splitIntoSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 25);
}

function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => p.length >= 30);
}

function scoreUnit(field: string, unit: string): number {
  const rule = FIELD_RULES.find((r) => r.field === field);
  if (!rule) return 0;
  return rule.patterns.reduce((score, pattern) => (pattern.test(unit) ? score + 1 : score), 0);
}

function extractBySentencePatterns(missionText: string): Record<string, string> {
  const extracted: Record<string, string> = {};
  const normalized = missionText.replace(/\s+/g, ' ');

  for (const [field, patterns] of Object.entries(FIELD_SENTENCE_PATTERNS)) {
    for (const pattern of patterns ?? []) {
      const match = normalized.match(pattern);
      if (match?.[0]) {
        extracted[field] = match[0].trim();
        break;
      }
    }
  }

  return extracted;
}

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

function dedupeFieldValues(fieldValues: Record<string, string>): Record<string, string> {
  const valueOwners = new Map<string, string>();

  for (const field of FIELD_PRIORITY) {
    const value = fieldValues[field];
    if (!value) continue;
    const key = value.replace(/\s+/g, ' ').trim().toLowerCase();
    if (valueOwners.has(key)) {
      delete fieldValues[field];
    } else {
      valueOwners.set(key, field);
    }
  }

  for (const [field, value] of Object.entries({ ...fieldValues })) {
    const key = value.replace(/\s+/g, ' ').trim().toLowerCase();
    if (valueOwners.get(key) !== field) {
      delete fieldValues[field];
    }
  }

  return fieldValues;
}

export function parseMissionToFormFields(missionText: string): FormSuggestion[] {
  const text = missionText.trim();
  if (text.length < 80) return [];

  const fieldValues: Record<string, string> = { ...extractBySentencePatterns(text) };
  const usedUnits = new Set(
    Object.values(fieldValues).map((v) => v.replace(/\s+/g, ' ').trim().toLowerCase())
  );

  const paragraphs = splitIntoParagraphs(text);
  const units = paragraphs.length > 1 ? paragraphs : splitIntoSentences(text);

  for (const unit of units) {
    if (unit.length > 700) continue;
    const unitKey = unit.replace(/\s+/g, ' ').trim().toLowerCase();
    if (usedUnits.has(unitKey)) continue;

    let bestField = '';
    let bestScore = 0;

    for (const rule of FIELD_RULES) {
      if (fieldValues[rule.field]) continue;
      const score = scoreUnit(rule.field, unit);
      if (score > bestScore) {
        bestScore = score;
        bestField = rule.field;
      }
    }

    if (bestField && bestScore > 0) {
      fieldValues[bestField] = unit;
      usedUnits.add(unitKey);
    }
  }

  if (!fieldValues.missionObjective) {
    const firstSentence = splitIntoSentences(text)[0];
    if (firstSentence && /mission|objective|commercial orbital/i.test(firstSentence)) {
      fieldValues.missionObjective = firstSentence;
    }
  }

  const deduped = dedupeFieldValues(fieldValues);

  return Object.entries(deduped).map(([field, value]) => ({
    field,
    value: value.trim(),
    confidence: 0.78,
    reasoning: 'Parsed from mission description',
  }));
}

export function sanitizeFormSuggestions(
  suggestions: FormSuggestion[],
  missionText?: string
): FormSuggestion[] {
  const normalizedMission = missionText?.replace(/\s+/g, ' ').trim().toLowerCase() ?? '';
  const missionLen = normalizedMission.length;

  const themeMarkers = [
    'primary objective of the mission',
    'payload consists',
    'safety-critical events include',
    'mission trajectory will follow',
    'launch operations will be conducted',
  ];

  return suggestions.filter((s) => {
    const val = s.value.replace(/\s+/g, ' ').trim();
    if (!val || val.length < 8) return false;
    if (/^information not provided$/i.test(val)) return false;
    if (/^not provided/i.test(val)) return false;
    if (/^⚠️/.test(val)) return false;

    const normVal = val.toLowerCase();
    const rule = FIELD_RULES.find((r) => r.field === s.field);
    const maxLen = rule?.maxLength ?? 700;
    if (val.length > maxLen) return false;

    if (missionLen > 200) {
      if (normVal.length >= missionLen * 0.75) return false;
      if (normalizedMission === normVal) return false;
    }

    const themeHits = themeMarkers.filter((marker) => normVal.includes(marker)).length;
    if (themeHits >= 2 && s.field !== 'missionObjective') return false;

    return true;
  });
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

export function getUnfilledFieldLabels(filledFields: Set<string>): string[] {
  const labels: string[] = [];
  for (const section of part450FormTemplate.sections) {
    for (const field of section.fields) {
      if (!filledFields.has(field.name)) {
        labels.push(field.label);
      }
    }
  }
  return labels;
}

export function buildFormFillSummaryMessage(
  suggestions: FormSuggestion[],
  fieldLabel: (field: string) => string,
  missionText?: string
): string {
  const count = suggestions.length;

  if (count === 0) {
    return "I couldn't extract reliable field values from that description. Add more specific details (launch site name, vehicle specs, timeline) or edit fields manually.";
  }

  const preview = suggestions.slice(0, 4).map((s) => fieldLabel(s.field));
  const remaining = count - preview.length;
  const previewText =
    remaining > 0 ? `${preview.join(', ')}, and ${remaining} more` : preview.join(', ');

  const filledSet = new Set(suggestions.map((s) => s.field));
  const missing = getUnfilledFieldLabels(filledSet);
  const keyMissing = missing.filter((label) =>
    /launch site|coordinates|window|timeline|license|dimensions|propulsion|ground support|site operator/i.test(label)
  );

  let message = `Done — I filled **${count} field${count === 1 ? '' : 's'}** (${previewText}). Review the form on the left and edit before submitting.`;

  if (keyMissing.length > 0) {
    const gapPreview = keyMissing.slice(0, 6).join(', ');
    const more = keyMissing.length > 6 ? `, and ${keyMissing.length - 6} more` : '';
    message += `\n\n**Not in your description** (left blank): ${gapPreview}${more}. Add these manually or paste more detail.`;
  }

  return message;
}
