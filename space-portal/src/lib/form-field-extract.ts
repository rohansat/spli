import type { FormSuggestion } from '@/components/ui/ai-chat-message';
import { part450FormTemplate } from '@/lib/mock-data';

const LABEL_TO_FIELD: Record<string, string> = {};
for (const section of part450FormTemplate.sections) {
  for (const field of section.fields) {
    LABEL_TO_FIELD[field.label.toLowerCase()] = field.name;
    LABEL_TO_FIELD[field.name.toLowerCase()] = field.name;
  }
}

LABEL_TO_FIELD['launch/reentry sequence'] = 'launchReEntrySequence';
LABEL_TO_FIELD['dimensions, mass, stages'] = 'dimensionsMassStages';
LABEL_TO_FIELD['flight path description'] = 'flightPath';
LABEL_TO_FIELD['landing/recovery site (if applicable)'] = 'landingSite';
LABEL_TO_FIELD['when you plan to submit a full application'] = 'fullApplicationTimeline';
LABEL_TO_FIELD['intended launch/reentry window'] = 'intendedWindow';
LABEL_TO_FIELD['whether you seek a vehicle/operator license or mission-specific license'] =
  'licenseTypeIntent';
LABEL_TO_FIELD['clarify points about part 450 requirements'] = 'clarifyPart450';
LABEL_TO_FIELD['any unique tech or international aspects'] = 'uniqueTechInternational';
LABEL_TO_FIELD['any early risk assessments'] = 'earlyRiskAssessments';
LABEL_TO_FIELD['known public safety challenges'] = 'publicSafetyChallenges';
LABEL_TO_FIELD['any planned use of safety tools (debris, sara, etc.)'] = 'plannedSafetyTools';
LABEL_TO_FIELD['site names and coordinates'] = 'siteNamesCoordinates';
LABEL_TO_FIELD['site operator (if 3rd party)'] = 'siteOperator';
LABEL_TO_FIELD['airspace/maritime notes (if applicable)'] = 'airspaceMaritimeNotes';
LABEL_TO_FIELD['technical summary or data sheet'] = 'technicalSummary';
LABEL_TO_FIELD['propulsion type(s)'] = 'propulsionTypes';
LABEL_TO_FIELD['recovery systems (if any)'] = 'recoverySystems';

function normalizeLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/[#*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveFieldFromLabel(label: string): string | undefined {
  const norm = normalizeLabel(label);
  if (LABEL_TO_FIELD[norm]) return LABEL_TO_FIELD[norm];
  for (const [key, fieldName] of Object.entries(LABEL_TO_FIELD)) {
    if (norm === key || norm.startsWith(key) || key.startsWith(norm)) {
      return fieldName;
    }
  }
  return undefined;
}

function isSkippableLine(line: string): boolean {
  const t = line.trim();
  if (!t) return true;
  if (/^[-─—]{2,}$/.test(t)) return true;
  if (/^section\s+\d+/i.test(t)) return true;
  if (/^📋|^⚠️|^\|/.test(t)) return true;
  if (/^for human review/i.test(t)) return true;
  if (/^not a compliance/i.test(t)) return true;
  if (/^key gaps identified/i.test(t)) return true;
  if (/^suggested draft/i.test(t)) return true;
  if (/^application id:/i.test(t)) return true;
  return false;
}

function cleanFieldContent(lines: string[]): string {
  return lines
    .filter((line) => {
      const t = line.trim();
      if (!t) return false;
      if (t.startsWith('⚠️')) return false;
      if (t.startsWith('|')) return false;
      if (/^not provided/i.test(t)) return false;
      if (/^please (supply|confirm|provide|advise)/i.test(t)) return false;
      if (t.startsWith('(') && t.length > 400) return false;
      return true;
    })
    .join('\n')
    .trim();
}

export function extractFormFieldsFromText(text: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const lines = text.split('\n');
  let currentField: string | undefined;
  const chunks: Record<string, string[]> = {};

  const flush = () => {
    if (!currentField) return;
    const content = cleanFieldContent(chunks[currentField] ?? []);
    if (content.length >= 8) {
      sections[currentField] = content;
    }
    currentField = undefined;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (isSkippableLine(trimmed)) {
      if (!trimmed) flush();
      continue;
    }

    const mdHeader = trimmed.match(/^#{1,4}\s*(.+)$/)?.[1];
    const boldHeader = trimmed.match(/^\*\*(.+?)\*\*$/)?.[1];
    const capsHeader =
      !mdHeader && !boldHeader && /^[A-Z][A-Z0-9\s\/\-,()]{2,70}$/.test(trimmed)
        ? trimmed
        : null;

    const candidateLabel =
      mdHeader ??
      boldHeader ??
      capsHeader ??
      (trimmed.length <= 72 && !trimmed.startsWith('-') && !trimmed.endsWith('.') ? trimmed : null);
    if (candidateLabel) {
      const field = resolveFieldFromLabel(candidateLabel);
      if (field) {
        flush();
        currentField = field;
        chunks[field] = [];
        continue;
      }
    }

    if (currentField) {
      chunks[currentField] = chunks[currentField] ?? [];
      chunks[currentField].push(line);
    }
  }

  flush();
  return sections;
}

export function extractFormSuggestionsFromText(text: string): FormSuggestion[] {
  return Object.entries(extractFormFieldsFromText(text)).map(([field, value]) => ({
    field,
    value,
    confidence: 0.72,
    reasoning: 'Extracted from AI response text',
  }));
}
