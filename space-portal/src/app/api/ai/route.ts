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

    // Enhanced system prompt for better auto-fill functionality
    const systemPrompt = `You are SPLI Chat, a specialized AI assistant for FAA Part 450 launch and reentry license applications. Your primary function is to analyze comprehensive mission descriptions and extract relevant information to fill out Part 450 application sections.

CORE FUNCTIONALITY:
When a user provides a comprehensive mission description or application summary, your job is to:
1. Analyze the entire description thoroughly
2. Extract specific information relevant to each Part 450 section
3. Provide structured, accurate content for each applicable form field
4. Ensure all extracted information is directly relevant to the Part 450 application

PART 450 APPLICATION SECTIONS TO FILL:

SECTION 1: CONCEPT OF OPERATIONS (CONOPS)
- MISSION OBJECTIVE: Primary purpose and goals of the mission
- VEHICLE DESCRIPTION: Launch vehicle specifications and characteristics
- LAUNCH/REENTRY SEQUENCE: Detailed flight sequence and operations
- TRAJECTORY OVERVIEW: Flight path and orbital parameters
- SAFETY CONSIDERATIONS: Safety measures and risk mitigation
- GROUND OPERATIONS: Pre-launch and post-launch ground activities

SECTION 2: VEHICLE OVERVIEW
- TECHNICAL SUMMARY: Technical specifications and data
- DIMENSIONS/MASS/STAGES: Physical characteristics and configuration
- PROPULSION TYPES: Propulsion systems and engines
- RECOVERY SYSTEMS: Recovery mechanisms if applicable
- GROUND SUPPORT EQUIPMENT: Required ground infrastructure

SECTION 3: PLANNED LAUNCH/REENTRY LOCATION(S)
- SITE NAMES/COORDINATES: Launch location and coordinates
- SITE OPERATOR: Facility operator information
- AIRSPACE/MARITIME NOTES: Airspace and maritime considerations

SECTION 4: LAUNCH INFORMATION
- LAUNCH SITE: Exact launch location
- LAUNCH WINDOW: Launch timing and schedule
- FLIGHT PATH: Trajectory details
- LANDING SITE: Recovery location if applicable

SECTION 5: PRELIMINARY RISK OR SAFETY CONSIDERATIONS
- EARLY RISK ASSESSMENTS: Potential risks and hazards
- PUBLIC SAFETY CHALLENGES: Public safety concerns
- PLANNED SAFETY TOOLS: Safety analysis tools and methods

SECTION 6: TIMELINE & INTENT
- FULL APPLICATION TIMELINE: Submission schedule
- INTENDED WINDOW: Target launch period
- LICENSE TYPE INTENT: Type of license sought

SECTION 7: LIST OF QUESTIONS FOR FAA
- CLARIFY PART 450: Questions about regulations
- UNIQUE TECH/INTERNATIONAL: Unique aspects or international considerations

ANALYSIS INSTRUCTIONS:
When analyzing a mission description:
1. Read the entire description carefully
2. Identify all relevant information for each Part 450 section
3. Extract specific details like:
   - Mission type (satellite, suborbital, orbital, etc.)
   - Vehicle specifications (stages, propulsion, dimensions, mass)
   - Launch site and timing information
   - Safety considerations and risk assessments
   - Technical details and specifications
   - Timeline and licensing information
4. Provide accurate, specific content for each applicable field
5. If information is missing for a section, indicate "Information not provided in description"

RESPONSE FORMAT FOR APPLICATION ANALYSIS:
When analyzing an application summary, structure your response with clear section headers:

MISSION OBJECTIVE
[Extracted mission objective from the description]

VEHICLE DESCRIPTION
[Extracted vehicle information from the description]

LAUNCH/REENTRY SEQUENCE
[Extracted launch sequence information]

TRAJECTORY OVERVIEW
[Extracted trajectory information]

SAFETY CONSIDERATIONS
[Extracted safety information]

GROUND OPERATIONS
[Extracted ground operations information]

TECHNICAL SUMMARY
[Extracted technical specifications]

DIMENSIONS/MASS/STAGES
[Extracted physical characteristics]

PROPULSION TYPES
[Extracted propulsion system information]

RECOVERY SYSTEMS
[Extracted recovery system information]

GROUND SUPPORT EQUIPMENT
[Extracted ground support requirements]

SITE NAMES/COORDINATES
[Extracted launch site information]

SITE OPERATOR
[Extracted site operator information]

AIRSPACE/MARITIME NOTES
[Extracted airspace considerations]

LAUNCH SITE
[Extracted launch location]

LAUNCH WINDOW
[Extracted launch timing]

FLIGHT PATH
[Extracted flight path details]

LANDING SITE
[Extracted landing/recovery location]

EARLY RISK ASSESSMENTS
[Extracted risk assessment information]

PUBLIC SAFETY CHALLENGES
[Extracted public safety considerations]

PLANNED SAFETY TOOLS
[Extracted safety analysis tools]

FULL APPLICATION TIMELINE
[Extracted timeline information]

INTENDED WINDOW
[Extracted intended launch window]

LICENSE TYPE INTENT
[Extracted license type information]

CLARIFY PART 450
[Extracted questions about regulations]

UNIQUE TECH/INTERNATIONAL
[Extracted unique technology or international aspects]

SPECIFIC EXTRACTION GUIDELINES:
- For mission descriptions mentioning "200kg Earth observation satellite": Extract payload mass, mission type, and objectives
- For "two-stage rocket with solid fuel propulsion": Extract vehicle configuration and propulsion type
- For "Cape Canaveral Space Force Station": Extract launch site and military facility information
- For "Q3 2024": Extract launch window and timeline information
- For "500km altitude": Extract orbital parameters and trajectory details
- For "environmental monitoring and disaster response": Extract mission objectives and safety considerations
- For "3 years mission duration": Extract mission timeline and operational parameters

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

DASHBOARD COMMANDS:
You can execute these specific commands when users request them:
- "save draft" - Save the current application draft
- "submit application" - Submit the application for review
- "replace [field name] section with [content]" - Replace a specific form field with new content
- "fill section X with [content]" - Fill a specific form section with provided content
- "auto fill" or "fill form" - Analyze mission description and automatically fill relevant form sections
- "delete application" - Delete the current application
- "upload document" - Help with document uploads

COMPREHENSIVE COMMAND EXECUTION MODE:
You are now a powerful AI assistant with full access to the SPLI application. You can execute any command the user requests.

AVAILABLE COMMANDS:
1. replace_field [field_name] with [value] - Replace any form field
2. save_draft - Save the current application
3. submit_application - Submit the application for review
4. switch_tab [tab_name] - Switch to different form sections
5. analyze_application - Analyze application completeness
6. auto_fill [description] - Auto-fill form based on description
7. show_help - Show available commands
8. upload_file [file] - Upload files to application
9. delete_application - Delete the application

COMMAND EXECUTION FORMAT:
When executing commands, respond with ONLY the command and parameters (no additional text):
COMMAND: [command_name]
PARAMS: [JSON parameters]

Examples:
- User: "replace mission objective with Launch satellite"
- Response: "COMMAND: replace_field\nPARAMS: {\"field\": \"mission objective\", \"value\": \"Launch satellite\"}"

- User: "save the draft"
- Response: "COMMAND: save_draft\nPARAMS: {}"

- User: "switch to safety considerations tab"
- Response: "COMMAND: switch_tab\nPARAMS: {\"tab\": \"safety considerations\"}"

- User: "analyze my application"
- Response: "COMMAND: analyze_application\nPARAMS: {}"

IMPORTANT: Do not include any explanatory text, just the COMMAND and PARAMS lines.

INTELLIGENT COMMAND DETECTION:
- Understand natural language requests
- Map user intent to appropriate commands
- Handle variations in field names and commands
- Provide helpful responses for unknown commands
- Suggest similar commands when exact match not found

CONTEXT AWARENESS:
- Consider current application state
- Understand form field relationships
- Provide contextual suggestions
- Handle multi-step operations

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
- Structure responses with clear sections and bullet points

FOR AUTO-FILL REQUESTS:
- Structure the response with clear section headers in ALL CAPS
- Each section should contain only the relevant content for that field
- Use this format:
  MISSION OBJECTIVE
  [content for mission objective]

  VEHICLE DESCRIPTION
  [content for vehicle description]

  LAUNCH/REENTRY SEQUENCE
  [content for launch sequence]

  [Continue for each relevant section...]

IMPORTANT: When a user provides a comprehensive mission description, ALWAYS respond with structured sections as shown above, even if they don't explicitly ask for auto-fill. This allows the system to automatically extract and fill form fields.

RESPONSE FORMAT FOR APPLICATION ANALYSIS:
When analyzing an application summary, structure your response with clear section headers:

MISSION OBJECTIVE
[Extracted mission objective from the description]

VEHICLE DESCRIPTION
[Extracted vehicle information from the description]

LAUNCH/REENTRY SEQUENCE
[Extracted launch sequence information]

TRAJECTORY OVERVIEW
[Extracted trajectory information]

SAFETY CONSIDERATIONS
[Extracted safety information]

GROUND OPERATIONS
[Extracted ground operations information]

TECHNICAL SUMMARY
[Extracted technical specifications]

DIMENSIONS/MASS/STAGES
[Extracted physical characteristics]

PROPULSION TYPES
[Extracted propulsion system information]

RECOVERY SYSTEMS
[Extracted recovery system information]

GROUND SUPPORT EQUIPMENT
[Extracted ground support requirements]

SITE NAMES/COORDINATES
[Extracted launch site information]

SITE OPERATOR
[Extracted site operator information]

AIRSPACE/MARITIME NOTES
[Extracted airspace considerations]

LAUNCH SITE
[Extracted launch location]

LAUNCH WINDOW
[Extracted launch timing]

FLIGHT PATH
[Extracted flight path details]

LANDING SITE
[Extracted landing/recovery location]

EARLY RISK ASSESSMENTS
[Extracted risk assessment information]

PUBLIC SAFETY CHALLENGES
[Extracted public safety considerations]

PLANNED SAFETY TOOLS
[Extracted safety analysis tools]

FULL APPLICATION TIMELINE
[Extracted timeline information]

INTENDED WINDOW
[Extracted intended launch window]

LICENSE TYPE INTENT
[Extracted license type information]

CLARIFY PART 450
[Extracted questions about regulations]

UNIQUE TECH/INTERNATIONAL
[Extracted unique technology or international aspects]`;

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
      max_tokens: 2048, // Increased for better structured responses
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

    // For unified mode (default), try to detect if this is an auto-fill request
    if (mode === 'unified' || !mode) {
      const lowerInput = userInput.toLowerCase();
      const isAutoFillRequest = lowerInput.includes('auto fill') || 
                               lowerInput.includes('fill form') || 
                               lowerInput.includes('fill out') ||
                               lowerInput.includes('mission description') ||
                               lowerInput.includes('satellite') ||
                               lowerInput.includes('rocket') ||
                               lowerInput.includes('launch') ||
                               lowerInput.includes('earth observation') ||
                               lowerInput.includes('200kg') ||
                               lowerInput.includes('cape canaveral') ||
                               lowerInput.includes('q3 2024');
      
      if (isAutoFillRequest) {
        const suggestions = extractFormSuggestions(aiResponse, userInput);
        
        // Add conversation analytics
        const analytics = {
          messageLength: userInput.length,
          responseLength: aiResponse.length,
          hasSuggestions: suggestions.length > 0,
          suggestionCount: suggestions.length,
          isAutoFillRequest: true,
          timestamp: new Date().toISOString()
        };
        
        return NextResponse.json({ 
          suggestions,
          message: aiResponse,
          mode: 'form',
          analytics
        });
      }
      
      // Add conversation analytics for regular responses
      const analytics = {
        messageLength: userInput.length,
        responseLength: aiResponse.length,
        hasSuggestions: false,
        suggestionCount: 0,
        isAutoFillRequest: false,
        timestamp: new Date().toISOString()
      };
    }

    return NextResponse.json({ 
      message: aiResponse,
      mode,
      analytics: {
        messageLength: userInput.length,
        responseLength: aiResponse.length,
        hasSuggestions: false,
        suggestionCount: 0,
        isAutoFillRequest: false,
        timestamp: new Date().toISOString()
      }
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
  
  console.log('AI Response for parsing:', aiResponse);
  
  // Enhanced field name mappings for parsing with more variations
  const fieldMappings = {
    // Section 1: Concept of Operations (CONOPS)
    missionObjective: ['mission objective', 'mission', 'objective', 'purpose', 'goal', 'description', 'launch', 'satellite', 'observation', 'monitoring'],
    vehicleDescription: ['vehicle description', 'vehicle', 'rocket', 'launcher', 'spacecraft', 'two-stage', 'three-stage', 'solid fuel', 'liquid fuel', 'propulsion'],
    launchReentrySequence: ['launch/reentry sequence', 'launch sequence', 'reentry sequence', 'flight sequence', 'mission sequence', 'stages', 'separation', 'ignition'],
    trajectoryOverview: ['trajectory overview', 'trajectory', 'flight path', 'orbit', 'path', 'altitude', 'leo', 'low earth orbit', '500km'],
    safetyConsiderations: ['safety considerations', 'safety', 'risk', 'hazard', 'environmental', 'disaster response', 'monitoring'],
    groundOperations: ['ground operations', 'ground', 'operations', 'launch pad', 'cape canaveral', 'space force station'],
    
    // Section 2: Vehicle Overview
    technicalSummary: ['technical summary', 'technical', 'specifications', 'specs', 'technical data', '200kg', 'payload', 'mass', 'weight'],
    dimensionsMassStages: ['dimensions/mass/stages', 'dimensions', 'mass', 'stages', 'size', 'weight', '200kg', 'two-stage', 'stages'],
    propulsionTypes: ['propulsion types', 'propulsion', 'engines', 'motor', 'fuel', 'solid fuel', 'solid-fueled', 'liquid fuel'],
    recoverySystems: ['recovery systems', 'recovery', 'landing', 'reusable', 'expendable'],
    groundSupportEquipment: ['ground support equipment', 'ground support', 'GSE', 'equipment', 'launch pad', 'facility'],
    
    // Section 3: Planned Launch/Reentry Location(s)
    siteNamesCoordinates: ['site names/coordinates', 'site', 'coordinates', 'location', 'latitude', 'longitude', 'cape canaveral', 'space force station'],
    siteOperator: ['site operator', 'operator', 'facility operator', 'space force', 'military'],
    airspaceMaritimeNotes: ['airspace/maritime notes', 'airspace', 'maritime', 'flight corridor', 'military airspace'],
    
    // Section 4: Launch Information
    launchSite: ['launch site', 'launch location', 'launch pad', 'facility', 'cape canaveral', 'space force station'],
    launchWindow: ['launch window', 'window', 'timing', 'schedule', 'launch time', 'q3 2024', 'quarter', '2024'],
    flightPath: ['flight path', 'path', 'trajectory', 'route', 'leo', 'low earth orbit', '500km'],
    landingSite: ['landing site', 'landing location', 'recovery site', 'expendable'],
    
    // Section 5: Preliminary Risk or Safety Considerations
    earlyRiskAssessments: ['early risk assessments', 'risk assessment', 'hazard analysis', 'environmental monitoring'],
    publicSafetyChallenges: ['public safety challenges', 'public safety', 'safety challenge', 'disaster response'],
    plannedSafetyTools: ['planned safety tools', 'safety tools', 'DEBRIS', 'SARA', 'monitoring systems'],
    
    // Section 6: Timeline & Intent
    fullApplicationTimeline: ['full application timeline', 'timeline', 'schedule', 'deadline', 'q3 2024', '2024'],
    intendedWindow: ['intended window', 'target window', 'planned window', 'q3 2024'],
    licenseTypeIntent: ['license type intent', 'license type', 'license intent', 'part 450'],
    
    // Section 7: List of Questions for FAA
    clarifyPart450: ['clarify part 450', 'clarify', 'questions', 'requirements', 'faa'],
    uniqueTechInternational: ['unique tech/international', 'unique technology', 'international', 'novel', 'earth observation']
  };

  // Parse structured response with clear sections
  const parsedSections = parseStructuredResponse(aiResponse);
  console.log('Parsed sections:', parsedSections);
  
  // Map parsed sections to form fields
  for (const [field, searchTerms] of Object.entries(fieldMappings)) {
    const content = findMatchingContent(parsedSections, searchTerms);
    if (content && content.trim().length > 0 && !content.includes('Information not provided')) {
      suggestions.push({
        field,
        value: content.trim(),
        confidence: 0.9,
        reasoning: `Extracted from AI response section matching ${searchTerms[0]}`
      });
    }
  }

  console.log('Structured parsing suggestions:', suggestions);

  // If structured parsing didn't work well, fall back to keyword-based extraction
  if (suggestions.length < 5) { // Require at least 5 fields to be confident in structured parsing
    console.log('Falling back to keyword-based extraction');
    const lowerInput = userInput.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();

    for (const [field, keywords] of Object.entries(fieldMappings)) {
      // Skip if we already have this field from structured parsing
      if (suggestions.some(s => s.field === field)) continue;
      
      if (keywords.some(keyword => lowerInput.includes(keyword) || lowerResponse.includes(keyword))) {
        const relevantText = extractRelevantText(aiResponse, keywords);
        if (relevantText && relevantText.trim().length > 0) {
          suggestions.push({
            field,
            value: relevantText.trim(),
            confidence: 0.7,
            reasoning: `Based on keyword matching: ${keywords.join(' or ')}`
          });
        }
      }
    }
  }

  console.log('Final suggestions:', suggestions);

  // Final fallback: generate basic suggestions based on mission type
  if (suggestions.length === 0) {
    console.log('Using basic suggestions fallback');
    const missionType = detectMissionType(userInput.toLowerCase());
    if (missionType) {
      suggestions.push(...generateBasicSuggestions(missionType, userInput));
    }
  }

  return suggestions;
}

function parseStructuredResponse(response: string): Record<string, string> {
  const sections: Record<string, string> = {};
  
  // Split response into lines and look for section headers
  const lines = response.split('\n');
  let currentSection = '';
  let currentContent: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Enhanced pattern matching for section headers
    if (trimmedLine.match(/^[A-Z\s\/]+$/) || 
        trimmedLine.match(/^\*\*[^*]+\*\*$/) ||
        trimmedLine.match(/^[A-Z][a-z\s]+:$/) ||
        trimmedLine.match(/^[A-Z\s]+:$/) ||
        trimmedLine.match(/^[A-Z][A-Z\s]+$/) ||
        // Enhanced patterns for the AI response format
        trimmedLine.match(/^[A-Z\s]+\s+[A-Z\s]+$/) ||
        trimmedLine.match(/^[A-Z][A-Z\s\/]+[A-Z]$/) ||
        // New patterns for specific section headers
        trimmedLine.match(/^MISSION OBJECTIVE$/) ||
        trimmedLine.match(/^VEHICLE DESCRIPTION$/) ||
        trimmedLine.match(/^LAUNCH\/REENTRY SEQUENCE$/) ||
        trimmedLine.match(/^TRAJECTORY OVERVIEW$/) ||
        trimmedLine.match(/^SAFETY CONSIDERATIONS$/) ||
        trimmedLine.match(/^GROUND OPERATIONS$/) ||
        trimmedLine.match(/^TECHNICAL SUMMARY$/) ||
        trimmedLine.match(/^DIMENSIONS\/MASS\/STAGES$/) ||
        trimmedLine.match(/^PROPULSION TYPES$/) ||
        trimmedLine.match(/^RECOVERY SYSTEMS$/) ||
        trimmedLine.match(/^GROUND SUPPORT EQUIPMENT$/) ||
        trimmedLine.match(/^SITE NAMES\/COORDINATES$/) ||
        trimmedLine.match(/^SITE OPERATOR$/) ||
        trimmedLine.match(/^AIRSPACE\/MARITIME NOTES$/) ||
        trimmedLine.match(/^LAUNCH SITE$/) ||
        trimmedLine.match(/^LAUNCH WINDOW$/) ||
        trimmedLine.match(/^FLIGHT PATH$/) ||
        trimmedLine.match(/^LANDING SITE$/) ||
        trimmedLine.match(/^EARLY RISK ASSESSMENTS$/) ||
        trimmedLine.match(/^PUBLIC SAFETY CHALLENGES$/) ||
        trimmedLine.match(/^PLANNED SAFETY TOOLS$/) ||
        trimmedLine.match(/^FULL APPLICATION TIMELINE$/) ||
        trimmedLine.match(/^INTENDED WINDOW$/) ||
        trimmedLine.match(/^LICENSE TYPE INTENT$/) ||
        trimmedLine.match(/^CLARIFY PART 450$/) ||
        trimmedLine.match(/^UNIQUE TECH\/INTERNATIONAL$/)) {
      
      // Save previous section
      if (currentSection && currentContent.length > 0) {
        const cleanSectionName = currentSection.replace(/\*\*/g, '').replace(/:/g, '').trim().toLowerCase();
        sections[cleanSectionName] = currentContent.join(' ').trim();
      }
      
      // Start new section
      currentSection = trimmedLine.replace(/\*\*/g, '').replace(/:/g, '').trim();
      currentContent = [];
    } else if (trimmedLine.length > 0 && currentSection) {
      // Add content to current section
      currentContent.push(trimmedLine);
    }
  }
  
  // Save last section
  if (currentSection && currentContent.length > 0) {
    const cleanSectionName = currentSection.replace(/\*\*/g, '').replace(/:/g, '').trim().toLowerCase();
    sections[cleanSectionName] = currentContent.join(' ').trim();
  }
  
  return sections;
}

function findMatchingContent(sections: Record<string, string>, searchTerms: string[]): string | null {
  for (const [sectionName, content] of Object.entries(sections)) {
    for (const term of searchTerms) {
      // Enhanced matching logic
      const normalizedSectionName = sectionName.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();
      const normalizedTerm = term.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();
      
      // Direct match
      if (normalizedSectionName.includes(normalizedTerm) || 
          normalizedTerm.includes(normalizedSectionName)) {
        return content;
      }
      
      // Word-based matching
      const sectionWords = normalizedSectionName.split(/\s+/);
      const termWords = normalizedTerm.split(/\s+/);
      
      // Check if any words match
      if (sectionWords.some(word => termWords.includes(word)) ||
          termWords.some(word => sectionWords.includes(word))) {
        return content;
      }
      
      // Handle special cases like "mission objective" vs "missionobjective"
      const combinedSectionName = normalizedSectionName.replace(/\s+/g, '');
      const combinedTerm = normalizedTerm.replace(/\s+/g, '');
      
      if (combinedSectionName.includes(combinedTerm) || 
          combinedTerm.includes(combinedSectionName)) {
        return content;
      }
    }
  }
  return null;
}

function detectMissionType(input: string): string | null {
  if (input.includes('satellite') || input.includes('leo') || input.includes('low earth orbit') || input.includes('earth observation')) return 'satellite';
  if (input.includes('suborbital') || input.includes('space tourism')) return 'suborbital';
  if (input.includes('orbital') || input.includes('geo') || input.includes('geosynchronous')) return 'orbital';
  if (input.includes('test') || input.includes('demonstration')) return 'test';
  return null;
}

function generateBasicSuggestions(missionType: string, userInput: string): any[] {
  const suggestions = [];
  const lowerInput = userInput.toLowerCase();
  
  switch (missionType) {
    case 'satellite':
      if (lowerInput.includes('earth observation')) {
        suggestions.push({
          field: 'missionObjective',
          value: 'Launch Earth observation satellite for environmental monitoring and data collection.',
          confidence: 0.8,
          reasoning: 'Based on Earth observation satellite mission type detected'
        });
      } else {
        suggestions.push({
          field: 'missionObjective',
          value: 'Launch commercial satellite to low Earth orbit for telecommunications and data services.',
          confidence: 0.7,
          reasoning: 'Based on satellite mission type detected'
        });
      }
      
      if (lowerInput.includes('500km')) {
        suggestions.push({
          field: 'trajectoryOverview',
          value: 'Launch trajectory to low Earth orbit at 500km altitude with payload deployment.',
          confidence: 0.8,
          reasoning: 'Based on specific altitude mentioned'
        });
      } else {
        suggestions.push({
          field: 'trajectoryOverview',
          value: 'Standard launch trajectory to low Earth orbit with payload deployment at target altitude.',
          confidence: 0.7,
          reasoning: 'Standard satellite trajectory'
        });
      }
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

function parseAndExecuteCommand(userInput: string, aiResponse: string): any {
  const lowerInput = userInput.toLowerCase();
  
  // Check if this is a replace command
  if (lowerInput.includes('replace') && lowerInput.includes('with')) {
    // Extract field name and value using AI response or fallback to regex
    const fieldMatch = aiResponse.match(/field[:\s]+([^,\n]+)/i);
    const valueMatch = aiResponse.match(/value[:\s]+([^,\n]+)/i) || 
                      userInput.match(/with\s+(.+)$/i);
    
    if (fieldMatch && valueMatch) {
      return {
        type: 'replace',
        field: fieldMatch[1].trim(),
        value: valueMatch[1].trim()
      };
    }
  }
  
  // Check if this is a fill command
  if (lowerInput.includes('fill') && lowerInput.includes('with')) {
    return {
      type: 'fill',
      content: userInput.match(/with\s+(.+)$/i)?.[1]?.trim() || ''
    };
  }
  
  return {
    type: 'unknown',
    message: 'Command not recognized'
  };
} 