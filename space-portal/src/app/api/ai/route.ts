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
When users ask about specific fields, provide helpful suggestions and examples:

MISSION OBJECTIVE: Describe the primary purpose and goals of the mission (e.g., "Launch commercial satellite to LEO for telecommunications services")

VEHICLE DESCRIPTION: Detail the launch vehicle specifications (e.g., "Two-stage liquid-fueled rocket with reusable first stage, 50m height, 3.7m diameter")

LAUNCH/REENTRY SEQUENCE: Describe the flight sequence and operations (e.g., "Vertical launch, first stage separation at 60km, second stage ignition, payload deployment at 500km altitude")

TRAJECTORY OVERVIEW: Explain the flight path and orbital parameters (e.g., "Suborbital trajectory to 100km altitude, ballistic flight path, splashdown in Pacific Ocean")

SAFETY CONSIDERATIONS: List safety measures and risk mitigation (e.g., "Flight termination system, exclusion zones, emergency procedures, range safety coordination")

GROUND OPERATIONS: Describe pre-launch and post-launch ground activities (e.g., "Vehicle integration, fueling operations, payload processing, launch pad preparation")

TECHNICAL SUMMARY: Provide technical specifications and data (e.g., "Thrust: 1.2M lbf, payload capacity: 22,800kg to LEO, propellant: RP-1/LOX")

DIMENSIONS/MASS/STAGES: Detail physical characteristics (e.g., "Height: 50m, mass: 549,054kg, two-stage configuration, first stage: 42m, second stage: 8m")

PROPULSION TYPES: Specify propulsion systems (e.g., "Merlin 1D engines, liquid oxygen/RP-1 propellant, sea level thrust: 190,000 lbf each")

RECOVERY SYSTEMS: Describe recovery mechanisms if applicable (e.g., "Grid fins, landing legs, controlled descent, vertical landing on drone ship")

GROUND SUPPORT EQUIPMENT: List required ground infrastructure (e.g., "Launch mount, fueling systems, electrical support, weather monitoring, communications")

SITE NAMES/COORDINATES: Specify launch location (e.g., "Cape Canaveral Space Force Station, Launch Complex 40, 28.5619°N, 80.5772°W")

SITE OPERATOR: Identify facility operator (e.g., "Space Force, 45th Space Wing, Launch and Test Range System")

AIRSPACE/MARITIME NOTES: Address airspace and maritime considerations (e.g., "Flight corridor coordination with FAA, maritime exclusion zones, airspace restrictions")

LAUNCH SITE: Specify exact launch location (e.g., "Kennedy Space Center, Launch Complex 39A")

LAUNCH WINDOW: Define launch timing (e.g., "Q2 2024, daily windows 2-4 hours, weather dependent")

FLIGHT PATH: Describe trajectory details (e.g., "Northeast trajectory, downrange distance 500km, max altitude 100km")

LANDING SITE: Specify recovery location if applicable (e.g., "Of Course I Still Love You drone ship, Atlantic Ocean, 400km downrange")

EARLY RISK ASSESSMENTS: Identify potential risks (e.g., "Vehicle failure modes, range safety risks, environmental impacts, public safety considerations")

PUBLIC SAFETY CHALLENGES: Address public safety concerns (e.g., "Debris field analysis, population exposure, emergency response coordination")

PLANNED SAFETY TOOLS: List safety analysis tools (e.g., "DEBRIS software, SARA analysis, range safety modeling, risk assessment tools")

FULL APPLICATION TIMELINE: Specify submission schedule (e.g., "Pre-application submitted Q1 2024, full application submission Q3 2024")

INTENDED WINDOW: Define target launch period (e.g., "Q4 2024 launch window, 30-day period, weather dependent")

LICENSE TYPE INTENT: Specify license type sought (e.g., "Mission-specific license for commercial satellite launch, vehicle/operator license for multiple missions")

CLARIFY PART 450: List questions about regulations (e.g., "Clarification needed on payload classification, environmental review requirements, insurance requirements")

UNIQUE TECH/INTERNATIONAL: Address unique aspects (e.g., "Novel propulsion technology, international payload, foreign launch vehicle components")

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
- Provide direct help without any capability explanations or lists`;

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