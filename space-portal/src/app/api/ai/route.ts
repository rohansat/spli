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
    const { userInput, context, mode, conversationHistory = [], documents = [] } = await request.json();
    console.log('Request data:', { userInput, mode, conversationHistoryLength: conversationHistory.length, documentsCount: documents.length });

    // Simplified system prompt for clean, focused responses
    const systemPrompt = `You are SPLI Chat, a specialized AI assistant for space, aerospace, and FAA licensing. Keep responses concise and focused.

CORE CAPABILITIES:
- Answer questions about space missions, aerospace technology, and FAA licensing
- Help fill out Part 450 application forms intelligently
- Analyze documents for application relevance
- Provide professional, FAA-ready language suggestions

RESPONSE GUIDELINES:
- Keep responses concise and to the point
- Don't overwhelm users with long lists of capabilities
- For simple questions, give direct answers
- For form filling, provide structured responses only when explicitly requested
- Use clean formatting with proper spacing
- Be helpful but not verbose

AUTO-FILL INSTRUCTIONS:
When a user provides a mission description or asks to fill out an application, ALWAYS respond with a structured FAA Part 450 application format. Extract all relevant information and organize it into clear sections.

REQUIRED FORMAT FOR MISSION DESCRIPTIONS:
When analyzing mission descriptions, structure your response exactly like this:

MISSION OBJECTIVE
[Extracted mission objective]

VEHICLE DESCRIPTION
[Extracted vehicle information]

LAUNCH SEQUENCE
[Extracted launch sequence]

TECHNICAL SUMMARY
[Extracted technical specifications]

SAFETY CONSIDERATIONS
[Extracted safety information]

GROUND OPERATIONS
[Extracted ground operations]

LAUNCH SITE
[Extracted launch site information]

TIMELINE
[Extracted timeline information]

LICENSE TYPE
[Extracted license type]

PART 450 APPLICATION SECTIONS:
- Mission Objective, Vehicle Description, Launch Sequence
- Technical Summary, Safety Considerations, Ground Operations
- Launch Site, Timeline, Risk Assessment
- License Type, FAA Questions

COMMANDS:
- "ready for FAA" - Prompt form
- "analyze documents" - Analyze uploaded documents
- "auto fill" - Fill form from mission description
- "strengthen" - Improve application quality

FORMATTING:
- Use clean, simple formatting
- Keep responses concise and focused
- Use bullet points for lists when needed
- Structure form responses clearly when requested`;

    // Build conversation messages array
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // Add system prompt as first message if no conversation history
    if (conversationHistory.length === 0) {
      messages.push({
        role: 'user',
        content: systemPrompt
      });
      messages.push({
        role: 'assistant',
        content: 'I understand. I am SPLI Chat, ready to help with space missions, aerospace technology, and FAA licensing. How can I assist you today?'
      });
    }

    // Add conversation history
    conversationHistory.forEach((msg: any) => {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // Add document context if provided
    if (documents && documents.length > 0) {
      const documentContext = `\n\nDOCUMENT ANALYSIS CONTEXT:\n${documents.map((doc: any, index: number) => 
        `Document ${index + 1}: ${doc.name}\nContent: ${doc.content}\n\n`
      ).join('')}`;
      
      messages.push({
        role: 'user',
        content: `Please analyze the following documents for application relevance:${documentContext}`
      });
    }

    // Add current user input
    messages.push({
      role: 'user',
      content: userInput
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096, // Increased for comprehensive responses
      messages: messages
    });

    const aiResponse = response.content[0].type === 'text' ? response.content[0].text : '';

    // For command execution mode, parse and execute commands
    if (mode === 'command') {
      const commandResult = parseAndExecuteCommand(userInput, aiResponse);
      return NextResponse.json({ 
        message: aiResponse,
        command: commandResult,
        mode 
      });
    }

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

    // For assistance mode, provide comprehensive Part 450 help
    if (mode === 'assistance') {
      return NextResponse.json({ 
        message: aiResponse,
        mode 
      });
    }

    // For document analysis mode
    if (mode === 'document_analysis') {
      const documentInsights = extractDocumentInsights(aiResponse);
        return NextResponse.json({ 
          message: aiResponse,
        documentInsights,
        mode 
        });
      }
      
    // For unified mode (default), try to detect if this is an auto-fill request
    const lowerInput = userInput.toLowerCase();
    const isAutoFillRequest = lowerInput.includes('mission') || 
                             lowerInput.includes('satellite') || 
                             lowerInput.includes('rocket') || 
                             lowerInput.includes('launch') ||
                             lowerInput.includes('lunar') ||
                             lowerInput.includes('nova') ||
                             lowerInput.includes('kennedy space center') ||
                             lowerInput.includes('cape canaveral') ||
                             lowerInput.includes('500kg') ||
                             lowerInput.includes('methane/oxygen') ||
                             lowerInput.includes('mare tranquillitatis');

    let suggestions: any[] = [];
    if (isAutoFillRequest) {
      suggestions = extractFormSuggestions(aiResponse, userInput);
    }

    const analytics = {
      messageLength: userInput.length,
      responseLength: aiResponse.length,
      hasSuggestions: suggestions.length > 0,
      suggestionCount: suggestions.length,
      isAutoFillRequest: isAutoFillRequest,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({ 
      message: aiResponse,
      suggestions,
      mode,
      analytics
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
  // Smart parsing of structured AI response
  const suggestions = [];
  
  // Parse structured sections from AI response
  const sections = aiResponse.split(/\n\s*\n/);
  
  for (const section of sections) {
    const lines = section.trim().split('\n');
    if (lines.length < 2) continue;
    
    const header = lines[0].trim();
    const content = lines.slice(1).join(' ').trim();
    
    if (content && content !== '[Extracted...]' && content !== 'Information not provided in description') {
      // Map section headers to field names
      const fieldMapping: Record<string, string> = {
        'MISSION OBJECTIVE': 'missionObjective',
        'VEHICLE DESCRIPTION': 'vehicleDescription',
        'LAUNCH/REENTRY SEQUENCE': 'launchReentrySequence',
        'TRAJECTORY OVERVIEW': 'trajectoryOverview',
        'SAFETY CONSIDERATIONS': 'safetyConsiderations',
        'GROUND OPERATIONS': 'groundOperations',
        'TECHNICAL SUMMARY': 'technicalSummary',
        'DIMENSIONS/MASS/STAGES': 'dimensionsMassStages',
        'PROPULSION TYPES': 'propulsionTypes',
        'RECOVERY SYSTEMS': 'recoverySystems',
        'GROUND SUPPORT EQUIPMENT': 'groundSupportEquipment',
        'SITE NAMES/COORDINATES': 'siteNamesCoordinates',
        'SITE OPERATOR': 'siteOperator',
        'AIRSPACE/MARITIME NOTES': 'airspaceMaritimeNotes',
        'LAUNCH SITE': 'launchSite',
        'LAUNCH WINDOW': 'launchWindow',
        'FLIGHT PATH': 'flightPath',
        'LANDING SITE': 'landingSite',
        'EARLY RISK ASSESSMENTS': 'earlyRiskAssessments',
        'PUBLIC SAFETY CHALLENGES': 'publicSafetyChallenges',
        'PLANNED SAFETY TOOLS': 'plannedSafetyTools',
        'FULL APPLICATION TIMELINE': 'fullApplicationTimeline',
        'INTENDED WINDOW': 'intendedWindow',
        'LICENSE TYPE INTENT': 'licenseTypeIntent',
        'CLARIFY PART 450': 'clarifyPart450',
        'UNIQUE TECH/INTERNATIONAL': 'uniqueTechInternational'
      };
      
      const fieldName = fieldMapping[header];
      if (fieldName) {
      suggestions.push({
          field: fieldName,
          value: content,
        confidence: 0.9,
          reasoning: `Extracted from AI analysis of mission description`
        });
      }
    }
  }

  return suggestions;
}

function extractDocumentInsights(aiResponse: string) {
  // Parse document analysis insights
  const insights: {
    technicalSpecifications: string[];
    missionObjectives: string[];
    safetyConsiderations: string[];
    timelineInformation: string[];
    missingInformation: string[];
    complianceRequirements: string[];
    integrationSuggestions: string[];
  } = {
    technicalSpecifications: [],
    missionObjectives: [],
    safetyConsiderations: [],
    timelineInformation: [],
    missingInformation: [],
    complianceRequirements: [],
    integrationSuggestions: []
  };
  
  // Parse structured document analysis
  const sections = aiResponse.split(/\n\s*\n/);
  
  for (const section of sections) {
    const lines = section.trim().split('\n');
    if (lines.length < 2) continue;
    
    const header = lines[0].trim();
    const content = lines.slice(1).map(line => line.trim()).filter(line => line.startsWith('•'));
    
    if (content.length > 0) {
      switch (header) {
        case 'KEY TECHNICAL SPECIFICATIONS':
          insights.technicalSpecifications = content;
          break;
        case 'MISSION OBJECTIVES':
          insights.missionObjectives = content;
          break;
        case 'SAFETY CONSIDERATIONS':
          insights.safetyConsiderations = content;
          break;
        case 'TIMELINE INFORMATION':
          insights.timelineInformation = content;
          break;
        case 'MISSING INFORMATION':
          insights.missingInformation = content;
          break;
        case 'COMPLIANCE REQUIREMENTS':
          insights.complianceRequirements = content;
          break;
        case 'INTEGRATION SUGGESTIONS':
          insights.integrationSuggestions = content;
          break;
      }
    }
  }
  
  return insights;
}

function parseAndExecuteCommand(userInput: string, aiResponse: string) {
  // Parse command execution from AI response
  const commandMatch = aiResponse.match(/COMMAND:\s*(\w+)\s*\nPARAMS:\s*({[\s\S]*})/);
  
  if (commandMatch) {
    try {
      const command = commandMatch[1];
      const params = JSON.parse(commandMatch[2]);
      
      return {
        command,
        params,
        success: true
      };
    } catch (error) {
      return {
        command: 'error',
        params: { error: 'Failed to parse command parameters' },
        success: false
      };
    }
  }
  
  return {
    command: 'none',
    params: {},
    success: false
  };
} 