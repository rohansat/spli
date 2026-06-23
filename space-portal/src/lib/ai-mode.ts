import { part450FormTemplate } from '@/lib/mock-data';
import { extractRawMissionText } from '@/lib/mission-field-parser';

export type AIMode = 'chat' | 'form-fill' | 'section-edit' | 'analysis' | 'compliance';

const MISSION_KEYWORDS = [
  'mission',
  'launch',
  'payload',
  'orbit',
  'vehicle',
  'propulsion',
  'stage',
  'trajectory',
  'safety',
  'rocket',
  'spacecraft',
  'leo',
  'reentry',
  'faa',
  'commercial',
  'demonstration',
  'liftoff',
  'ascent',
  'telemetry',
];

const FORM_FILL_INTENT_PATTERNS = [
  'fill form',
  'auto fill',
  'auto-fill',
  'draft part 450',
  'draft field',
  'draft conops',
  'write content for',
  'help me complete',
  'help me write',
  'help me draft',
  'from my mission description',
  'from this description',
  'with this description',
  'populate',
  'fill out',
  'fill in',
  'extract',
  'parse',
  'mission description',
];

const FORM_FILL_CONTEXT_PATTERNS = [
  'paste your mission',
  'share your mission',
  'paste the mission',
  'mission description here',
  'draft conops',
  'fill the form',
  'fill out the form',
  'populate form',
  'form fields',
  'map it to all part 450',
  'sections (1–7)',
  'sections (1-7)',
];

const SECTION_EDIT_VERBS = [
  'update',
  'rewrite',
  'edit',
  'revise',
  'improve',
  'change',
  'fix',
  'expand',
  'shorten',
  'refine',
  'reword',
];

const SECTION_ALIASES: Record<string, number> = {
  conops: 0,
  'concept of operations': 0,
  'vehicle overview': 1,
  vehicle: 1,
  locations: 2,
  'launch location': 2,
  'launch information': 3,
  launch: 3,
  safety: 4,
  'risk or safety': 4,
  timeline: 5,
  intent: 5,
  questions: 6,
  faa: 6,
};

export function looksLikeMissionDescription(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.length < 120) return false;

  const lower = trimmed.toLowerCase();
  const keywordHits = MISSION_KEYWORDS.filter((kw) => lower.includes(kw)).length;

  if (trimmed.length >= 400 && keywordHits >= 3) return true;
  if (trimmed.length >= 200 && keywordHits >= 4) return true;

  return (
    keywordHits >= 3 &&
    (lower.includes('launch vehicle') ||
      lower.includes('launch site') ||
      lower.includes('payload') ||
      lower.includes('part 450') ||
      lower.includes('this mission'))
  );
}

export function hasFormFillIntent(input: string): boolean {
  const lower = input.toLowerCase();
  return FORM_FILL_INTENT_PATTERNS.some((pattern) => lower.includes(pattern));
}

function stripIntentPrefix(input: string): string {
  let text = input.trim();
  const colonSplit = text.match(/^[^:\n]{5,120}:\s*([\s\S]+)$/);
  if (colonSplit?.[1] && colonSplit[1].trim().length >= 80) {
    return colonSplit[1].trim();
  }
  return text;
}

export function extractMissionContentFromInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (looksLikeMissionDescription(trimmed)) {
    return extractRawMissionText(trimmed);
  }

  const paragraphs = trimmed.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length >= 2) {
    const firstLower = paragraphs[0].toLowerCase();
    const hasIntent =
      hasFormFillIntent(firstLower) ||
      FORM_FILL_INTENT_PATTERNS.some((pattern) => firstLower.includes(pattern));
    const body = paragraphs.slice(1).join('\n\n').trim();
    if (hasIntent && looksLikeMissionDescription(body)) {
      return extractRawMissionText(body);
    }
    if (hasIntent && body.length >= 120) {
      return extractRawMissionText(body);
    }
  }

  const stripped = stripIntentPrefix(trimmed);
  if (stripped !== trimmed && looksLikeMissionDescription(stripped)) {
    return extractRawMissionText(stripped);
  }

  return null;
}

export function getMissionContentForProcessing(
  input: string,
  conversationHistory?: Array<{ sender: string; content: string }>
): string | null {
  const direct = extractMissionContentFromInput(input);
  if (direct) return direct;

  if (hasRecentFormFillIntent(conversationHistory) && looksLikeMissionDescription(input)) {
    return extractRawMissionText(input);
  }

  return null;
}

function mentionsPart450Field(input: string): boolean {
  const lower = input.toLowerCase();
  return part450FormTemplate.sections.some((section) =>
    section.fields.some(
      (field) =>
        lower.includes(field.name.toLowerCase()) ||
        lower.includes(field.label.toLowerCase())
    )
  );
}

function mentionsPart450Section(input: string): boolean {
  const lower = input.toLowerCase();
  if (/section\s*[1-7]\b/.test(lower)) return true;
  return Object.keys(SECTION_ALIASES).some((alias) => lower.includes(alias));
}

export function detectSectionEditIntent(input: string): boolean {
  const lower = input.toLowerCase();
  if (!SECTION_EDIT_VERBS.some((verb) => lower.includes(verb))) return false;
  if (hasFormFillIntent(input) && !mentionsPart450Field(input) && !mentionsPart450Section(input)) {
    return false;
  }
  return mentionsPart450Field(input) || mentionsPart450Section(input);
}

function hasRecentFormFillIntent(
  conversationHistory?: Array<{ sender: string; content: string }>
): boolean {
  if (!conversationHistory?.length) return false;

  const recent = conversationHistory.slice(-8);
  return recent.some((entry) => {
    const lower = entry.content.toLowerCase();
    return (
      FORM_FILL_CONTEXT_PATTERNS.some((pattern) => lower.includes(pattern)) ||
      (entry.sender === 'user' && hasFormFillIntent(entry.content))
    );
  });
}

export function resolveAIMode(
  mode: string | undefined,
  userInput: string,
  hasDocuments: boolean,
  conversationHistory?: Array<{ sender: string; content: string }>
): AIMode {
  const lowerInput = userInput.toLowerCase();

  if (
    hasDocuments &&
    (lowerInput.includes('document') ||
      lowerInput.includes('analyze') ||
      lowerInput.includes('upload'))
  ) {
    return 'analysis';
  }

  if (hasDocuments && mode !== 'chat' && mode !== 'compliance' && mode !== 'section-edit') {
    return 'analysis';
  }

  if (
    mode === 'compliance' ||
    lowerInput.includes('compliance') ||
    lowerInput.includes('inconsist') ||
    lowerInput.includes('cross-section')
  ) {
    return 'compliance';
  }

  if (
    mode === 'analysis' ||
    (lowerInput.includes('analyze') && !getMissionContentForProcessing(userInput, conversationHistory))
  ) {
    return 'analysis';
  }

  const missionContent = getMissionContentForProcessing(userInput, conversationHistory);
  if (missionContent && looksLikeMissionDescription(missionContent)) {
    return 'form-fill';
  }

  if (detectSectionEditIntent(userInput)) {
    return 'section-edit';
  }

  if (mode === 'form-fill' && missionContent) {
    return 'form-fill';
  }

  return 'chat';
}

export function shouldAutoApplyFormSuggestions(
  mode: string | undefined,
  suggestionCount: number,
  userInput: string,
  conversationHistory?: Array<{ sender: string; content: string }>
): boolean {
  if (suggestionCount === 0) return false;

  if (mode === 'section-edit') {
    return true;
  }

  if (mode !== 'form-fill') return false;

  const missionContent = getMissionContentForProcessing(userInput, conversationHistory);
  return !!(missionContent && looksLikeMissionDescription(missionContent));
}
