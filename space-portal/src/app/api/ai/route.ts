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

    // Enhanced system prompt for form filling
    const systemPrompt = `You are SPLI Chat, a specialized AI assistant for space, aerospace, and FAA licensing. Your primary role is to help users fill out Part 450 application forms by extracting information from ANY mission description.

CORE CAPABILITIES:
- Extract mission information and fill Part 450 application forms automatically from ANY mission description
- Answer questions about space missions, aerospace technology, and FAA licensing
- Analyze documents for application relevance
- Provide professional, FAA-ready language suggestions

CRITICAL INSTRUCTION FOR MISSION DESCRIPTIONS:
When a user provides ANY mission description paragraph, you MUST respond with a structured FAA Part 450 application format. Extract ALL relevant information from the description and organize it into the appropriate form fields. DO NOT provide explanations about jurisdiction or regulations - just fill out the form.

REQUIRED FORMAT FOR MISSION DESCRIPTIONS:
When analyzing ANY mission description, structure your response exactly like this with ALL sections:

MISSION OBJECTIVE
[Extract and describe the mission objective from the description]

VEHICLE DESCRIPTION
[Extract vehicle information, rocket type, stages, propulsion, dimensions, etc.]

LAUNCH SEQUENCE
[Extract launch sequence, stages, trajectory, destination]

TECHNICAL SUMMARY
[Extract technical specifications, payload details, power systems, communications, etc.]

SAFETY CONSIDERATIONS
[Extract safety measures, risk assessments, termination systems, etc.]

GROUND OPERATIONS
[Extract ground operations, facilities, mission control, etc.]

LAUNCH SITE
[Extract launch site information, coordinates, facility details]

TIMELINE
[Extract timeline information, launch windows, mission duration, etc.]

LICENSE TYPE
[Extract license type based on mission characteristics]

IMPORTANT: You MUST provide ALL sections above, even if some information is not explicitly mentioned in the description. Use "Information not provided in description" for sections where details are missing, but still include the section header.

INSTRUCTIONS:
- Analyze ANY mission description paragraph provided by the user
- Extract ALL relevant information from the description
- Fill in as many sections as possible with extracted information
- If information is not provided, use "Information not provided in description"
- Be comprehensive and thorough in extraction
- Use professional, FAA-ready language
- DO NOT provide jurisdictional advice or explanations - just fill the form
- Focus on extracting and organizing information, not explaining regulations

FORM FIELDS TO FILL:
- missionObjective, vehicleDescription, launchReentrySequence
- technicalSummary, safetyConsiderations, groundOperations
- launchSite, launchWindow, flightPath
- earlyRiskAssessments, publicSafetyChallenges, plannedSafetyTools
- fullApplicationTimeline, intendedWindow, licenseTypeIntent

RESPONSE GUIDELINES:
- For ANY mission description: ALWAYS provide structured form data
- For questions: Give direct, helpful answers
- Keep responses concise and focused
- Extract ALL relevant information from the description
- Use professional, FAA-ready language
- Be flexible and handle any type of space mission
- Focus on form filling, not explanations

COMMANDS:
- "ready for FAA" - Prompt form
- "analyze documents" - Analyze uploaded documents
- "auto fill" - Fill form from mission description
- "strengthen" - Improve application quality`;

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
    
    // Check if this looks like a mission description paragraph
    const isAutoFillRequest = 
      // If it's a long paragraph with mission details, it's likely a mission description
      userInput.length > 50 && (
        // Mission-related keywords
        lowerInput.includes('mission') || 
        lowerInput.includes('satellite') || 
        lowerInput.includes('rocket') || 
        lowerInput.includes('launcher') ||
        lowerInput.includes('launch') ||
        lowerInput.includes('spacecraft') ||
        lowerInput.includes('vehicle') ||
        
        // Destinations
        lowerInput.includes('lunar') ||
        lowerInput.includes('moon') ||
        lowerInput.includes('mars') ||
        lowerInput.includes('orbit') ||
        lowerInput.includes('leo') ||
        lowerInput.includes('geo') ||
        lowerInput.includes('suborbital') ||
        
        // Technical specifications
        lowerInput.includes('kg') ||
        lowerInput.includes('pound') ||
        lowerInput.includes('meter') ||
        lowerInput.includes('stage') ||
        lowerInput.includes('engine') ||
        lowerInput.includes('propulsion') ||
        lowerInput.includes('fuel') ||
        lowerInput.includes('payload') ||
        
        // Launch sites
        lowerInput.includes('kennedy space center') ||
        lowerInput.includes('ksc') ||
        lowerInput.includes('cape canaveral') ||
        lowerInput.includes('vandenberg') ||
        lowerInput.includes('wallops') ||
        lowerInput.includes('spaceport') ||
        
        // Mission types
        lowerInput.includes('earth observation') ||
        lowerInput.includes('communications') ||
        lowerInput.includes('research') ||
        lowerInput.includes('technology demonstration') ||
        lowerInput.includes('space tourism') ||
        lowerInput.includes('commercial') ||
        
        // Form-related keywords
        lowerInput.includes('faa application') ||
        lowerInput.includes('part 450') ||
        lowerInput.includes('license') ||
        lowerInput.includes('fill out') ||
        lowerInput.includes('fill the form') ||
        lowerInput.includes('auto fill') ||
        lowerInput.includes('complete the form') ||
        lowerInput.includes('application form') ||
        
        // Common mission description phrases
        lowerInput.includes('we are') ||
        lowerInput.includes('our mission') ||
        lowerInput.includes('planning') ||
        lowerInput.includes('deploy') ||
        lowerInput.includes('conduct') ||
        lowerInput.includes('launch from') ||
        lowerInput.includes('mission will') ||
        lowerInput.includes('timeline') ||
        lowerInput.includes('specifications') ||
        lowerInput.includes('safety') ||
        lowerInput.includes('operations')
      );

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
  
  // Map section headers to field names (comprehensive mapping)
  const fieldMapping: Record<string, string> = {
    'MISSION OBJECTIVE': 'missionObjective',
    'VEHICLE DESCRIPTION': 'vehicleDescription',
    'LAUNCH SEQUENCE': 'launchReentrySequence',
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
    'TIMELINE': 'intendedWindow',
    'LICENSE TYPE': 'licenseTypeIntent',
    'LICENSE TYPE INTENT': 'licenseTypeIntent'
  };
  
  // Split response into sections and extract content
  const sections = aiResponse.split(/\n\s*\n/);
  
  for (const section of sections) {
    const lines = section.trim().split('\n');
    if (lines.length < 2) continue;
    
    const header = lines[0].trim();
    const content = lines.slice(1).join(' ').trim();
    
    // Skip empty content or placeholder text
    if (!content || 
        content === '[Extracted...]' || 
        content === 'Information not provided in description' ||
        content.toLowerCase().includes('not provided') ||
        content.toLowerCase().includes('tbd') ||
        content.toLowerCase().includes('to be determined')) {
      continue;
    }
    
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

  // If no structured sections found, try intelligent parsing of the entire response
  if (suggestions.length === 0) {
    const lowerResponse = aiResponse.toLowerCase();
    const lowerInput = userInput.toLowerCase();
    
    // Extract mission objective from any part of the response
    if (lowerResponse.includes('mission') || lowerResponse.includes('objective') || lowerResponse.includes('purpose')) {
      // Look for mission objective patterns
      const missionPatterns = [
        /(?:mission|objective|purpose)[:\s]+([^.]+)/i,
        /(?:we are|our mission|planning to)[^.]*(?:mission|launch|deploy)[^.]*/i,
        /(?:commercial|research|technology)[^.]*(?:mission|launch)[^.]*/i
      ];
      
      for (const pattern of missionPatterns) {
        const match = aiResponse.match(pattern);
        if (match && match[1]) {
          suggestions.push({
            field: 'missionObjective',
            value: match[1].trim(),
            confidence: 0.8,
            reasoning: 'Extracted mission objective from response'
          });
          break;
        }
      }
    }
    
    // Extract vehicle description
    if (lowerResponse.includes('vehicle') || lowerResponse.includes('rocket') || lowerResponse.includes('launcher') || 
        lowerResponse.includes('stage') || lowerResponse.includes('engine') || lowerResponse.includes('propulsion')) {
      const vehiclePatterns = [
        /(?:vehicle|rocket|launcher|nova)[^.]*(?:stage|engine|propulsion)[^.]*/i,
        /(?:three-stage|two-stage|single-stage)[^.]*/i,
        /(?:methane|oxygen|solid|liquid)[^.]*(?:fuel|propulsion)[^.]*/i
      ];
      
      for (const pattern of vehiclePatterns) {
        const match = aiResponse.match(pattern);
        if (match) {
          suggestions.push({
            field: 'vehicleDescription',
            value: match[0].trim(),
            confidence: 0.8,
            reasoning: 'Extracted vehicle description from response'
          });
          break;
        }
      }
    }
    
    // Extract launch site
    const launchSites = [
      { pattern: /kennedy space center|ksc/i, value: 'Kennedy Space Center, Florida' },
      { pattern: /cape canaveral/i, value: 'Cape Canaveral Space Force Station, Florida' },
      { pattern: /vandenberg/i, value: 'Vandenberg Space Force Base, California' },
      { pattern: /wallops/i, value: 'Wallops Flight Facility, Virginia' }
    ];
    
    for (const site of launchSites) {
      if (site.pattern.test(aiResponse)) {
        suggestions.push({
          field: 'launchSite',
          value: site.value,
          confidence: 0.9,
          reasoning: 'Extracted launch site from response'
        });
        break;
      }
    }
    
    // Extract timeline information
    if (lowerResponse.includes('timeline') || lowerResponse.includes('window') || lowerResponse.includes('q1') || 
        lowerResponse.includes('q2') || lowerResponse.includes('q3') || lowerResponse.includes('q4') ||
        lowerResponse.includes('2024') || lowerResponse.includes('2025')) {
      const timelinePatterns = [
        /(?:timeline|window|launch)[^.]*(?:q[1-4]\s*\d{4}|\d{4})[^.]*/i,
        /(?:january|february|march|april|may|june|july|august|september|october|november|december)[^.]*/i
      ];
      
      for (const pattern of timelinePatterns) {
        const match = aiResponse.match(pattern);
        if (match) {
          suggestions.push({
            field: 'intendedWindow',
            value: match[0].trim(),
            confidence: 0.8,
            reasoning: 'Extracted timeline from response'
          });
          break;
        }
      }
    }
    
    // Extract safety considerations
    if (lowerResponse.includes('safety') || lowerResponse.includes('risk') || lowerResponse.includes('termination') ||
        lowerResponse.includes('autonomous') || lowerResponse.includes('gps')) {
      const safetyPatterns = [
        /(?:safety|risk|termination)[^.]*/i,
        /(?:autonomous|gps|tracking)[^.]*/i
      ];
      
      for (const pattern of safetyPatterns) {
        const match = aiResponse.match(pattern);
        if (match) {
          suggestions.push({
            field: 'safetyConsiderations',
            value: match[0].trim(),
            confidence: 0.7,
            reasoning: 'Extracted safety information from response'
          });
          break;
        }
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