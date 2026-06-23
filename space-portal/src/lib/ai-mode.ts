export type AIMode = 'chat' | 'form-fill' | 'analysis' | 'compliance';

export function resolveAIMode(
  mode: string | undefined,
  userInput: string,
  hasDocuments: boolean
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
    lowerInput.includes('fill form') ||
    lowerInput.includes('auto fill') ||
    lowerInput.includes('draft part 450') ||
    lowerInput.includes('draft field') ||
    lowerInput.includes('write content for') ||
    lowerInput.includes('help me complete') ||
    lowerInput.includes('help me write')
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
    lowerInput.includes('analyze') ||
    lowerInput.includes('review my application')
  ) {
    return 'analysis';
  }

  const isMissionDescription =
    userInput.length > 50 &&
    ['mission', 'satellite', 'rocket', 'launch', 'lunar', 'space', 'propulsion', 'safety'].some(
      (kw) => lowerInput.includes(kw)
    );

  if (
    isMissionDescription &&
    (lowerInput.includes('we are') ||
      lowerInput.includes('our mission') ||
      lowerInput.includes('planning to'))
  ) {
    return 'form-fill';
  }

  return 'chat';
}
