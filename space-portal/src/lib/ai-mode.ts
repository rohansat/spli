export type AIMode = 'chat' | 'form-fill' | 'analysis' | 'compliance';

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

const FORM_FILL_PROMPT_PATTERNS = [
  'fill form',
  'auto fill',
  'draft part 450',
  'draft field',
  'draft conops',
  'write content for',
  'help me complete',
  'help me write',
  'help me draft',
  'from my mission description',
  'populate',
  'fill out',
  'fill in',
  'extract',
  'parse',
];

const FORM_FILL_CONTEXT_PATTERNS = [
  'mission description',
  'paste your mission',
  'share your mission',
  'draft conops',
  'fill the form',
  'fill out the form',
  'populate form',
  'form fields',
  'get started',
];

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

function hasRecentFormFillIntent(
  conversationHistory?: Array<{ sender: string; content: string }>
): boolean {
  if (!conversationHistory?.length) return false;

  const recent = conversationHistory.slice(-6);
  return recent.some((entry) =>
    FORM_FILL_CONTEXT_PATTERNS.some((pattern) =>
      entry.content.toLowerCase().includes(pattern)
    )
  );
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

  if (hasDocuments && mode !== 'chat' && mode !== 'compliance') {
    return 'analysis';
  }

  if (
    mode === 'form-fill' ||
    FORM_FILL_PROMPT_PATTERNS.some((pattern) => lowerInput.includes(pattern))
  ) {
    return 'form-fill';
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
    (lowerInput.includes('analyze') && !looksLikeMissionDescription(userInput))
  ) {
    return 'analysis';
  }

  if (looksLikeMissionDescription(userInput)) {
    return 'form-fill';
  }

  if (hasRecentFormFillIntent(conversationHistory) && userInput.trim().length >= 80) {
    return 'form-fill';
  }

  return 'chat';
}

export function shouldAutoApplyFormSuggestions(
  mode: string | undefined,
  suggestionCount: number
): boolean {
  return mode === 'form-fill' && suggestionCount > 0;
}
