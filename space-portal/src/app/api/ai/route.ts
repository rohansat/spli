import { NextRequest, NextResponse } from 'next/server';
import { getSPLIAIService } from '@/lib/ai-service';

function resolveMode(
  mode: string | undefined,
  userInput: string,
  hasDocuments = false
): 'chat' | 'form-fill' | 'analysis' | 'compliance' {
  const lowerInput = userInput.toLowerCase();

  if (hasDocuments) {
    return 'analysis';
  }

  const isMissionDescription =
    userInput.length > 50 &&
    (lowerInput.includes('mission') ||
      lowerInput.includes('satellite') ||
      lowerInput.includes('rocket') ||
      lowerInput.includes('launch') ||
      lowerInput.includes('lunar') ||
      lowerInput.includes('space') ||
      lowerInput.includes('we are') ||
      lowerInput.includes('our mission') ||
      lowerInput.includes('planning') ||
      lowerInput.includes('deploy') ||
      lowerInput.includes('conduct') ||
      lowerInput.includes('kg') ||
      lowerInput.includes('stage') ||
      lowerInput.includes('engine') ||
      lowerInput.includes('propulsion') ||
      lowerInput.includes('kennedy space center') ||
      lowerInput.includes('cape canaveral') ||
      lowerInput.includes('timeline') ||
      lowerInput.includes('specifications') ||
      lowerInput.includes('safety') ||
      lowerInput.includes('operations'));

  if (
    mode === 'form-fill' ||
    userInput.toLowerCase().includes('fill form') ||
    userInput.toLowerCase().includes('application') ||
    isMissionDescription
  ) {
    return 'form-fill';
  }
  if (
    mode === 'compliance' ||
    userInput.toLowerCase().includes('compliance') ||
    userInput.toLowerCase().includes('check')
  ) {
    return 'compliance';
  }
  if (
    mode === 'analysis' ||
    userInput.toLowerCase().includes('analyze') ||
    userInput.toLowerCase().includes('review')
  ) {
    return 'analysis';
  }

  return 'chat';
}

export async function POST(request: NextRequest) {
  try {
    const {
      userInput,
      mode,
      conversationHistory = [],
      documents = [],
      applicationId,
      formSummary,
    } = await request.json();

    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input. Please provide a valid userInput string.' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          error: 'AI service is not configured. ANTHROPIC_API_KEY environment variable is missing.',
          suggestion: 'Please set ANTHROPIC_API_KEY in your environment variables or .env file.',
        },
        { status: 500 }
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

    const processingMode = resolveMode(mode, userInput, documents.length > 0);
    const response = await aiService.processUserInput(userInput, processingMode);

    return NextResponse.json({
      message: response.summary,
      suggestions: response.suggestions,
      confidence: response.confidence,
      nextSteps: response.nextSteps,
      warnings: response.warnings,
      followUpPrompts: response.followUpPrompts,
      documentInsights: response.documentInsights,
      mode: processingMode,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('AI API Error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    const err = error as { name?: string; status?: number; statusCode?: number; stack?: string };

    const errorDetails = {
      message: errorMessage,
      type: err?.name,
      status: err?.status || err?.statusCode,
      stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined,
    };

    console.error('Full error details:', errorDetails);

    let statusCode = 500;
    if (errorMessage.includes('API key') || errorMessage.includes('ANTHROPIC_API_KEY')) {
      statusCode = 401;
    } else if (errorMessage.includes('Rate limit')) {
      statusCode = 429;
    } else if (err?.status || err?.statusCode) {
      statusCode = err.status || err.statusCode || 500;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
        suggestion: errorMessage.includes('API key')
          ? 'Please check that ANTHROPIC_API_KEY is set correctly in your environment variables.'
          : undefined,
      },
      { status: statusCode }
    );
  }
}
