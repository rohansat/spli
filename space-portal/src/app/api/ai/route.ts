import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  console.log('API route called');
  console.log('API Key present:', !!process.env.ANTHROPIC_API_KEY);
  console.log('API Key length:', process.env.ANTHROPIC_API_KEY?.length);
  
  try {
    const { userInput, context, mode, conversationHistory = [] } = await request.json();
    console.log('Request data:', { userInput, mode, conversationHistoryLength: conversationHistory.length });

    // Create conversational system prompt
    const systemPrompt = `You are SPLI Chat, a friendly and knowledgeable AI assistant for aerospace compliance and regulatory matters. You should be conversational, helpful, and context-aware.

CONVERSATION STYLE:
- Be warm, professional, and engaging
- Remember previous parts of the conversation
- Ask follow-up questions when appropriate
- Provide helpful suggestions based on context
- If someone mentions FAA processes, ask if they'd like help with their application

CAPABILITIES:
GENERAL ASSISTANCE:
- FAA Part 450 applications and compliance questions
- Launch and reentry licensing requirements
- Document management and form filling guidance
- General aerospace regulatory questions
- Application status and next steps

FORM ANALYSIS:
- Analyze mission descriptions and generate form field suggestions
- Help fill out specific sections of FAA Part 450 applications
- Provide compliance-focused recommendations
- Extract relevant information from user descriptions

DASHBOARD COMMANDS:
You can execute these specific commands when users request them:
- "save draft" - Save the current application draft
- "submit application" - Submit the application for review
- "fill section X with [content]" - Fill a specific form section with provided content
- "delete application" - Delete the current application
- "upload document" - Help with document uploads

CONVERSATION FLOW:
- If someone asks about FAA processes, ask if they'd like help with their application
- If they mention a specific mission or vehicle, offer to help fill out relevant forms
- If they seem unsure about next steps, provide guidance on the application process
- Always be encouraging and supportive of their aerospace endeavors

RESPONSE FORMAT:
- For general questions: Provide helpful, accurate information with follow-up suggestions
- For form analysis: Provide structured suggestions for form fields
- For commands: Acknowledge the command and provide guidance on what will happen
- Always be professional, accurate, and compliance-focused while maintaining a conversational tone`;

    // Build conversation messages array
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      {
        role: 'user',
        content: systemPrompt
      }
    ];

    // Add conversation history
    conversationHistory.forEach((msg: any) => {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // Add current user input
    messages.push({
      role: 'user',
      content: userInput
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: messages
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
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Not an Error object');
    console.error('API Key present:', !!process.env.ANTHROPIC_API_KEY);
    console.error('API Key length:', process.env.ANTHROPIC_API_KEY?.length);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
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