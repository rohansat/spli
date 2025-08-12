import { NextRequest, NextResponse } from 'next/server';
import { getSPLIAIService, AIAnalysisRequest } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const { userInput, context, mode, conversationHistory = [], documents = [] } = await request.json();
    
    // Validate input
    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input. Please provide a valid userInput string.' },
        { status: 400 }
      );
    }

    // Initialize AI service with context
    const aiService = getSPLIAIService();
    
    // Update context with conversation history and documents
    if (conversationHistory.length > 0 || documents.length > 0) {
      const contextUpdates: any = {};
      
      // Add documents to context
      if (documents.length > 0) {
        contextUpdates.documents = documents.map((doc: any, index: number) => ({
          id: `doc-${index}`,
          name: doc.name || `Document ${index + 1}`,
          content: doc.content || '',
          relevance: 0.8 // Default relevance
        }));
      }
      
      aiService.updateContext(contextUpdates);
    }

    // Determine processing mode
    let processingMode: 'chat' | 'form-fill' | 'analysis' | 'compliance' = 'chat';
    
    if (mode === 'form-fill' || userInput.toLowerCase().includes('fill form') || userInput.toLowerCase().includes('application')) {
      processingMode = 'form-fill';
    } else if (mode === 'compliance' || userInput.toLowerCase().includes('compliance') || userInput.toLowerCase().includes('check')) {
      processingMode = 'compliance';
    } else if (mode === 'analysis' || userInput.toLowerCase().includes('analyze') || userInput.toLowerCase().includes('review')) {
      processingMode = 'analysis';
    }

    // Process user input with AI service
    const response = await aiService.processUserInput(userInput, processingMode);

    // Return structured response
    return NextResponse.json({
      message: response.summary,
      suggestions: response.suggestions,
      confidence: response.confidence,
      nextSteps: response.nextSteps,
      warnings: response.warnings,
      mode: processingMode,
      timestamp: new Date().toISOString()
    });

      } catch (error) {
      console.error('AI API Error:', error);
      
      return NextResponse.json(
        { 
          error: 'AI service temporarily unavailable. Please try again.',
          details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
        },
        { status: 500 }
      );
    }
} 