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
- Match the user's energy and detail level
- Keep responses concise and appropriate to the question
- Don't overwhelm with information unless specifically asked

RESPONSE GUIDELINES:
- For simple greetings (hi, hello, hey): Respond briefly and warmly, then ask how you can help
- For specific questions: Provide focused, relevant answers
- For FAA process questions: Ask if they'd like help with their application
- For form field help requests: Provide intelligent suggestions and examples
- For any help requests: Jump directly into helping without any capability explanations
- For complex topics: Provide detailed information when requested
- Always be encouraging and supportive
- Never list capabilities or explain what you can do - just help directly

CAPABILITIES:
- FAA Part 450 applications and compliance questions
- Launch and reentry licensing requirements
- Document management and form filling guidance
- General aerospace regulatory questions
- Application status and next steps
- Form analysis and field suggestions
- Dashboard commands (save draft, submit application, etc.)

DASHBOARD COMMANDS:
You can execute these specific commands when users request them:
- "save draft" - Save the current application draft
- "submit application" - Submit the application for review
- "replace [field name] section with [content]" - Replace a specific form field with new content
- "fill section X with [content]" - Fill a specific form section with provided content
- "auto fill" or "fill form" - Analyze mission description and automatically fill relevant form sections
- "delete application" - Delete the current application
- "upload document" - Help with document uploads

Available field names for replacement:
- mission objective, vehicle description, launch reentry sequence, trajectory overview
- safety considerations, ground operations, technical summary, dimensions mass stages
- propulsion types, recovery systems, ground support equipment, site names coordinates
- site operator, airspace maritime notes, launch site, launch window, flight path
- landing site, early risk assessments, public safety challenges, planned safety tools
- full application timeline, intended window, license type intent, clarify part450
- unique tech international

FIELD GUIDANCE FOR SUGGESTIONS:
When users ask about specific fields, provide helpful suggestions and examples with clean formatting:

FORMATTING GUIDELINES:
- Use clear section headers with line breaks
- Use bullet points (•) for lists and examples
- Separate different topics with blank lines
- Use ALL CAPS for section titles and key terms
- Keep paragraphs concise and well-spaced
- Use numbered lists for step-by-step processes
- DO NOT use markdown formatting (##, *, etc.)
- Use simple text formatting that displays properly in chat

MISSION OBJECTIVE: 
Describe the primary purpose and goals of the mission
Example: "Launch commercial satellite to LEO for telecommunications services"

VEHICLE DESCRIPTION: 
Detail the launch vehicle specifications
Example: "Two-stage liquid-fueled rocket with reusable first stage, 50m height, 3.7m diameter"

LAUNCH/REENTRY SEQUENCE: 
Describe the flight sequence and operations with clear phases
Example: 

LAUNCH PHASE:
• Vertical launch from pad
• First stage separation at 60km altitude
• Second stage ignition

ORBITAL PHASE:
• Payload deployment at 500km altitude
• Mission operations

RECOVERY PHASE:
• First stage boostback burn
• Entry burn and landing

TRAJECTORY OVERVIEW: 
Explain the flight path and orbital parameters
Example: "Suborbital trajectory to 100km altitude, ballistic flight path, splashdown in Pacific Ocean"

SAFETY CONSIDERATIONS: 
List safety measures and risk mitigation
Example: 
• Flight termination system
• Exclusion zones
• Emergency procedures
• Range safety coordination

GROUND OPERATIONS: 
Describe pre-launch and post-launch ground activities
Example: 
• Vehicle integration
• Fueling operations
• Payload processing
• Launch pad preparation

TECHNICAL SUMMARY: 
Provide technical specifications and data
Example: "Thrust: 1.2M lbf, payload capacity: 22,800kg to LEO, propellant: RP-1/LOX"

DIMENSIONS/MASS/STAGES: 
Detail physical characteristics
Example: "Height: 50m, mass: 549,054kg, two-stage configuration, first stage: 42m, second stage: 8m"

PROPULSION TYPES: 
Specify propulsion systems
Example: "Merlin 1D engines, liquid oxygen/RP-1 propellant, sea level thrust: 190,000 lbf each"

RECOVERY SYSTEMS: 
Describe recovery mechanisms if applicable
Example: "Grid fins, landing legs, controlled descent, vertical landing on drone ship"

GROUND SUPPORT EQUIPMENT: 
List required ground infrastructure
Example: 
• Launch mount
• Fueling systems
• Electrical support
• Weather monitoring
• Communications

SITE NAMES/COORDINATES: 
Specify launch location
Example: "Cape Canaveral Space Force Station, Launch Complex 40, 28.5619°N, 80.5772°W"

SITE OPERATOR: 
Identify facility operator
Example: "Space Force, 45th Space Wing, Launch and Test Range System"

AIRSPACE/MARITIME NOTES: 
Address airspace and maritime considerations
Example: "Flight corridor coordination with FAA, maritime exclusion zones, airspace restrictions"

LAUNCH SITE: 
Specify exact launch location
Example: "Kennedy Space Center, Launch Complex 39A"

LAUNCH WINDOW: 
Define launch timing
Example: "Q2 2024, daily windows 2-4 hours, weather dependent"

FLIGHT PATH: 
Describe trajectory details
Example: "Northeast trajectory, downrange distance 500km, max altitude 100km"

LANDING SITE: 
Specify recovery location if applicable
Example: "Of Course I Still Love You drone ship, Atlantic Ocean, 400km downrange"

EARLY RISK ASSESSMENTS: 
Identify potential risks
Example: 
• Vehicle failure modes
• Range safety risks
• Environmental impacts
• Public safety considerations

PUBLIC SAFETY CHALLENGES: 
Address public safety concerns
Example: 
• Debris field analysis
• Population exposure
• Emergency response coordination

PLANNED SAFETY TOOLS: 
List safety analysis tools
Example: 
• DEBRIS software
• SARA analysis
• Range safety modeling
• Risk assessment tools

FULL APPLICATION TIMELINE: 
Specify submission schedule
Example: "Pre-application submitted Q1 2024, full application submission Q3 2024"

INTENDED WINDOW: 
Define target launch period
Example: "Q4 2024 launch window, 30-day period, weather dependent"

LICENSE TYPE INTENT: 
Specify license type sought
Example: "Mission-specific license for commercial satellite launch, vehicle/operator license for multiple missions"

CLARIFY PART 450: 
List questions about regulations
Example: 
• Payload classification clarification
• Environmental review requirements
• Insurance requirements

UNIQUE TECH/INTERNATIONAL: 
Address unique aspects
Example: 
• Novel propulsion technology
• International payload
• Foreign launch vehicle components

CONVERSATION FLOW:
- Match the user's communication style and detail level
- If someone asks about FAA processes, ask if they'd like help with their application
- For any request for help: Provide direct assistance immediately
- If they ask about specific form fields: Provide intelligent suggestions and examples
- If they mention a specific mission or vehicle, offer to help fill out relevant forms
- If they seem unsure about next steps, provide guidance on the application process
- Focus purely on action and assistance - no explanations of capabilities

RESPONSE FORMAT:
- Keep responses proportional to the user's input
- Be professional, accurate, and compliance-focused while maintaining a conversational tone
- Provide direct help without any capability explanations or lists
- Use clean, organized formatting with proper spacing and structure
- Use bullet points (•), numbered lists, and clear sections for better readability
- Separate different topics with line breaks for visual clarity
- Use ALL CAPS for section headers and key terms
- DO NOT use markdown formatting - use plain text that displays properly
- Structure responses with clear sections and bullet points`;

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
  // Enhanced extraction for comprehensive form filling
  const suggestions = [];
  
  // Comprehensive field mappings for all 25 form fields
  const fieldMappings = {
    // Section 1: Concept of Operations (CONOPS)
    missionObjective: ['mission', 'objective', 'purpose', 'goal', 'aim', 'target'],
    vehicleDescription: ['vehicle', 'rocket', 'launcher', 'spacecraft', 'craft', 'system'],
    launchReentrySequence: ['launch sequence', 'reentry sequence', 'flight sequence', 'mission sequence'],
    trajectoryOverview: ['trajectory', 'flight path', 'orbit', 'path', 'route'],
    safetyConsiderations: ['safety', 'risk', 'hazard', 'protection', 'precaution'],
    groundOperations: ['ground', 'launch pad', 'facility', 'infrastructure', 'support'],
    
    // Section 2: Vehicle Overview
    technicalSummary: ['technical', 'specification', 'data sheet', 'specs', 'technical data'],
    dimensionsMassStages: ['dimension', 'mass', 'weight', 'size', 'stage', 'configuration'],
    propulsionTypes: ['propulsion', 'engine', 'motor', 'fuel', 'thrust', 'power'],
    recoverySystems: ['recovery', 'landing', 'reusable', 'return', 'retrieval'],
    groundSupportEquipment: ['ground support', 'equipment', 'facility', 'infrastructure', 'GSE'],
    
    // Section 3: Planned Launch/Reentry Location(s)
    siteNamesCoordinates: ['site', 'location', 'coordinates', 'latitude', 'longitude'],
    siteOperator: ['operator', 'site operator', 'facility operator', 'third party'],
    airspaceMaritimeNotes: ['airspace', 'maritime', 'flight corridor', 'exclusion zone'],
    
    // Section 4: Launch Information
    launchSite: ['launch site', 'launch pad', 'facility', 'location'],
    launchWindow: ['launch window', 'timing', 'schedule', 'window'],
    flightPath: ['flight path', 'trajectory', 'route', 'path'],
    landingSite: ['landing site', 'recovery site', 'landing location'],
    
    // Section 5: Preliminary Risk or Safety Considerations
    earlyRiskAssessments: ['risk assessment', 'hazard analysis', 'safety analysis'],
    publicSafetyChallenges: ['public safety', 'safety challenge', 'risk to public'],
    plannedSafetyTools: ['safety tool', 'DEBRIS', 'SARA', 'safety software'],
    
    // Section 6: Timeline & Intent
    fullApplicationTimeline: ['timeline', 'schedule', 'deadline', 'application timeline'],
    intendedWindow: ['intended window', 'target window', 'planned window'],
    licenseTypeIntent: ['license type', 'vehicle license', 'operator license'],
    
    // Section 7: List of Questions for FAA
    clarifyPart450: ['clarify', 'question', 'requirement', 'regulation', 'compliance'],
    uniqueTechInternational: ['unique technology', 'international', 'novel', 'innovative']
  };

  const lowerInput = userInput.toLowerCase();
  const lowerResponse = aiResponse.toLowerCase();

  // Extract suggestions based on user input and AI response
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

  // If no suggestions found, try to generate basic ones based on mission type
  if (suggestions.length === 0) {
    const missionType = detectMissionType(lowerInput);
    if (missionType) {
      suggestions.push(...generateBasicSuggestions(missionType, userInput));
    }
  }

  return suggestions;
}

function detectMissionType(input: string): string | null {
  if (input.includes('satellite') || input.includes('leo') || input.includes('low earth orbit')) return 'satellite';
  if (input.includes('suborbital') || input.includes('space tourism')) return 'suborbital';
  if (input.includes('orbital') || input.includes('geo') || input.includes('geosynchronous')) return 'orbital';
  if (input.includes('test') || input.includes('demonstration')) return 'test';
  return null;
}

function generateBasicSuggestions(missionType: string, userInput: string): any[] {
  const suggestions = [];
  
  switch (missionType) {
    case 'satellite':
      suggestions.push({
        field: 'missionObjective',
        value: 'Launch commercial satellite to low Earth orbit for telecommunications and data services.',
        confidence: 0.7,
        reasoning: 'Based on satellite mission type detected'
      });
      suggestions.push({
        field: 'trajectoryOverview',
        value: 'Standard launch trajectory to low Earth orbit with payload deployment at target altitude.',
        confidence: 0.7,
        reasoning: 'Standard satellite trajectory'
      });
      break;
    case 'suborbital':
      suggestions.push({
        field: 'missionObjective',
        value: 'Conduct suborbital flight for research, testing, or space tourism purposes.',
        confidence: 0.7,
        reasoning: 'Based on suborbital mission type detected'
      });
      suggestions.push({
        field: 'trajectoryOverview',
        value: 'Suborbital trajectory with apogee above 100km, followed by controlled descent.',
        confidence: 0.7,
        reasoning: 'Standard suborbital trajectory'
      });
      break;
  }
  
  return suggestions;
}

function extractRelevantText(aiResponse: string, keywords: string[]): string | null {
  // Enhanced extraction - look for sentences containing keywords
  const sentences = aiResponse.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    if (keywords.some(keyword => lowerSentence.includes(keyword))) {
      return sentence.trim();
    }
  }
  
  // If no specific sentence found, return a relevant portion
  const lowerResponse = aiResponse.toLowerCase();
  for (const keyword of keywords) {
    if (lowerResponse.includes(keyword)) {
      const start = Math.max(0, lowerResponse.indexOf(keyword) - 50);
      const end = Math.min(aiResponse.length, lowerResponse.indexOf(keyword) + 100);
      return aiResponse.substring(start, end).trim();
    }
  }
  
  return null;
} 