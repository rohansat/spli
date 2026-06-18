import type Anthropic from '@anthropic-ai/sdk';
import type { Message } from '@anthropic-ai/sdk/resources/messages/messages';

/** Models to try in order — first available wins. */
export const ANTHROPIC_MODELS = [
  'claude-sonnet-4-6',
  'claude-sonnet-4-5-20250929',
  'claude-haiku-4-5',
] as const;

function getModelsToTry(): readonly string[] {
  if (process.env.ANTHROPIC_MODEL) {
    return [process.env.ANTHROPIC_MODEL];
  }
  return ANTHROPIC_MODELS;
}

export type AnthropicModel = (typeof ANTHROPIC_MODELS)[number];

type MessageCreateParams = Omit<Parameters<Anthropic['messages']['create']>[0], 'model'>;

function isModelNotFound(error: unknown): boolean {
  const err = error as { status?: number; statusCode?: number; message?: string };
  return (
    err?.status === 404 ||
    err?.statusCode === 404 ||
    (typeof err?.message === 'string' && err.message.includes('not_found'))
  );
}

export async function createMessageWithFallback(
  anthropic: Anthropic,
  params: MessageCreateParams
): Promise<Message> {
  let lastError: unknown = null;

  for (const model of getModelsToTry()) {
    try {
      const response = await anthropic.messages.create({ ...params, model, stream: false });
      return response as Message;
    } catch (error) {
      lastError = error;
      if (isModelNotFound(error)) continue;
      throw error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(
        `No available Claude models found (tried: ${getModelsToTry().join(', ')}). ` +
          'Update ANTHROPIC_MODEL or check your API key at console.anthropic.com.'
      );
}

export async function streamMessageWithFallback(
  anthropic: Anthropic,
  params: Omit<Parameters<Anthropic['messages']['stream']>[0], 'model'>,
  onChunk: (text: string) => void
): Promise<string> {
  let lastError: unknown = null;

  for (const model of getModelsToTry()) {
    try {
      const stream = anthropic.messages.stream({ ...params, model });
      let fullText = '';

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          fullText += event.delta.text;
          onChunk(event.delta.text);
        }
      }

      return fullText;
    } catch (error) {
      lastError = error;
      if (isModelNotFound(error)) continue;
      throw error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(
        `No available Claude models found (tried: ${getModelsToTry().join(', ')}). ` +
          'Update ANTHROPIC_MODEL or check your API key at console.anthropic.com.'
      );
}
