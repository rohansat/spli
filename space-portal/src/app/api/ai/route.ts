import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userInput, context, mode } = await request.json();

    // Create system prompt based on mode
    let systemPrompt = '';
    if (mode === 'assistant') {
      systemPrompt = `You are SPLI Chat, an AI assistant for aerospace compliance and regulatory matters. You help users with:
- FAA Part 450 applications and compliance
- Launch and reentry licensing requirements
- Document management and form filling
- General aerospace regulatory questions
- Application status and next steps

Be helpful, accurate, and professional. If you don't know something specific about aerospace regulations, say so and suggest where they might find the information.`;
    } else if (mode === 'form') {
      systemPrompt = `You are SPLI Form Assistant, specialized in helping users fill out FAA Part 450 applications. 

Your role is to:
1. Analyze user descriptions of their mission, vehicle, and operations
2. Generate specific suggestions for form fields
3. Provide accurate, compliance-focused recommendations
4. Help users understand what information is needed for each section

When analyzing user input, extract relevant information and provide structured suggestions for form fields. Be specific and actionable.`;
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `${systemPrompt}\n\nUser input: ${userInput}${context ? `\n\nContext: ${context}` : ''}`
        }
      ]
    });

    const aiResponse = response.content[0].type === 'text' ? response.content[0].text : '';

    // For form mode, try to extract structured suggestions
    if (mode === 'form') {
      // Try to parse suggestions from the response
      const suggestions = extractFormSuggestions(aiResponse, userInput);
      return NextResponse.json({ 
        suggestions,
        message: aiResponse,
        mode 
      });
    }

    return NextResponse.json({ 
      message: aiResponse,
      mode 
    });

  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

function extractFormSuggestions(aiResponse: string, userInput: string) {
  // This is a simple extraction - you can make this more sophisticated
  const suggestions = [];
  
  // Look for common form fields and extract relevant information
  const fieldMappings = {
    missionObjective: ['mission', 'objective', 'purpose', 'goal'],
    vehicleDescription: ['vehicle', 'rocket', 'launcher', 'spacecraft'],
    launchSite: ['launch site', 'location', 'facility'],
    launchWindow: ['launch window', 'timing', 'schedule'],
    safetyConsiderations: ['safety', 'risk', 'hazard'],
    groundOperations: ['ground', 'operations', 'facility']
  };

  const lowerInput = userInput.toLowerCase();
  const lowerResponse = aiResponse.toLowerCase();

  for (const [field, keywords] of Object.entries(fieldMappings)) {
    if (keywords.some(keyword => lowerInput.includes(keyword) || lowerResponse.includes(keyword))) {
      // Extract relevant text from response
      const relevantText = extractRelevantText(aiResponse, keywords);
      if (relevantText) {
        suggestions.push({
          field,
          value: relevantText,
          confidence: 0.8,
          reasoning: `Based on user input mentioning ${keywords.join(' or ')}`
        });
      }
    }
  }

  return suggestions;
}

function extractRelevantText(response: string, keywords: string[]) {
  // Simple extraction - find sentences containing keywords
  const sentences = response.split(/[.!?]+/);
  for (const sentence of sentences) {
    if (keywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
      return sentence.trim();
    }
  }
  return null;
} 