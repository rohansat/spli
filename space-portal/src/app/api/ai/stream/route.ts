import { NextRequest } from 'next/server';
import { getSPLIAIService } from '@/lib/ai-service';
import { resolveAIMode, getMissionContentForProcessing } from '@/lib/ai-mode';
import { buildCopilotContextSummary, detectInconsistencies } from '@/lib/copilot-service';
import type { CopilotState } from '@/types/copilot';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const {
      userInput,
      mode,
      conversationHistory = [],
      documents = [],
      applicationId,
      formSummary,
      formData,
      copilotState,
    } = await request.json();

    if (!userInput || typeof userInput !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid input. Please provide a valid userInput string.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({
          error: 'AI service is not configured. ANTHROPIC_API_KEY environment variable is missing.',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const aiService = getSPLIAIService();

    if (conversationHistory.length > 0) {
      aiService.syncConversationHistory(conversationHistory);
    }

    if (documents.length > 0) {
      aiService.setDocuments(
        documents.map((doc: { name?: string; content?: string }) => ({
          name: doc.name || 'Document',
          content: doc.content || '',
        }))
      );
    }

    if (applicationId || formSummary) {
      aiService.setApplicationContext(applicationId, formSummary);
    }

    const processingMode = resolveAIMode(mode, userInput, documents.length > 0, conversationHistory);
    const sourceMissionText = getMissionContentForProcessing(userInput, conversationHistory) ?? undefined;

    const typedFormData = (formData ?? {}) as Record<string, string>;
    const inconsistencies = detectInconsistencies(typedFormData);
    const copilotContext = copilotState
      ? buildCopilotContextSummary(copilotState as CopilotState, inconsistencies)
      : inconsistencies.length > 0
        ? buildCopilotContextSummary(
            { faaComments: [], changeHistory: [], aiSuggestions: [], updatedAt: '' },
            inconsistencies
          )
        : undefined;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          send({ type: 'start', mode: processingMode });

          const result = await aiService.streamUserInput(
            userInput,
            processingMode,
            (text) => send({ type: 'chunk', text }),
            copilotContext,
            sourceMissionText
          );

          send({
            type: 'done',
            message: result.summary,
            suggestions: result.suggestions,
            confidence: result.confidence,
            nextSteps: result.nextSteps,
            warnings: result.warnings,
            followUpPrompts: result.followUpPrompts,
            documentInsights: result.documentInsights,
            mode: processingMode,
            inconsistencies,
          });
        } catch (error) {
          send({
            type: 'error',
            error: error instanceof Error ? error.message : 'Stream failed',
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('AI Stream API Error:', error);
    return new Response(
      JSON.stringify({ error: 'AI streaming service temporarily unavailable.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
