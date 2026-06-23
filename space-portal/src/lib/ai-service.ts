// Professional AI Service for SPLI - Space Portal Licensing Interface
// High-end AI assistant for FAA Part 450 license applications

import Anthropic from '@anthropic-ai/sdk';
import { createMessageWithFallback, streamMessageWithFallback } from '@/lib/ai-models';
import {
  buildFormFillSummaryMessage,
  mergeFormSuggestions,
  parseMissionToFormFields,
} from '@/lib/mission-field-parser';

// Core AI interfaces
export interface AIFormSuggestion {
  field: string;
  value: string;
  confidence: number;
  reasoning: string;
  source?: string;
}

export interface AIAnalysisRequest {
  userInput: string;
  formFields?: Array<{ name: string; label: string; type: string }>;
  context?: string;
  mode?: 'chat' | 'form-fill' | 'analysis' | 'compliance';
}

export interface DocumentInsights {
  technicalSpecs?: string[];
  missionObjectives?: string[];
  safetyConsiderations?: string[];
  timelineInfo?: string[];
  missingInformation?: string[];
  complianceRequirements?: string[];
  integrationSuggestions?: string[];
}

export interface AIAnalysisResponse {
  suggestions: AIFormSuggestion[];
  summary: string;
  confidence: number;
  nextSteps?: string[];
  warnings?: string[];
  followUpPrompts?: string[];
  mode?: string;
  documentInsights?: DocumentInsights;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    formSection?: string;
    confidence?: number;
    action?: string;
  };
}

export interface ConversationContext {
  userId: string;
  applicationId?: string;
  currentSection?: string;
  preferences: {
    detailLevel: 'basic' | 'detailed' | 'comprehensive';
    focusArea?: string;
    complianceLevel: 'standard' | 'strict';
  };
  history: ConversationMessage[];
  documents: Array<{
    id: string;
    name: string;
    content: string;
    relevance: number;
  }>;
}

// Mock AI analysis for backward compatibility
export async function mockAIAnalysis(input: string): Promise<AIAnalysisResponse> {
  return {
    suggestions: [
      {
        field: 'missionObjective',
        value: 'Sample mission objective extracted from input',
        confidence: 0.8,
        reasoning: 'Extracted from user input'
      }
    ],
    summary: 'AI analysis completed successfully',
    confidence: 0.8
  };
}

// Dashboard AI analysis function
export async function dashboardAIAnalysis(input: string): Promise<AIAnalysisResponse> {
  const aiService = getSPLIAIService();
  return aiService.analyze(input);
}

// Professional AI Service Class
export class SPLIAIService {
  private anthropic: Anthropic;
  private context: ConversationContext;
  private cache: Map<string, any>;

  constructor(apiKey: string, context?: Partial<ConversationContext>) {
    this.anthropic = new Anthropic({ apiKey });
    this.context = {
      userId: context?.userId || 'default',
      preferences: {
        detailLevel: 'detailed',
        complianceLevel: 'strict'
      },
      history: [],
      documents: [],
      ...context
    };
    this.cache = new Map();
  }

  // Core AI processing method
  async processUserInput(
    userInput: string, 
    mode: 'chat' | 'form-fill' | 'analysis' | 'compliance' = 'chat'
  ): Promise<AIAnalysisResponse> {
    try {
      // Skip cache when conversation has history (context-dependent)
      const hasHistory = this.context.history.length > 0;
      const cacheKey = this.generateCacheKey(userInput, mode);
      if (!hasHistory && this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // Build conversation context
      const messages = this.buildConversationMessages(userInput, mode);
      
      // Get AI response
      const response = await this.getAIResponse(messages, mode);
      
      // Process and validate response
      const processedResponse = await this.processAIResponse(response, mode);
      
      // Cache result only for stateless requests
      if (!hasHistory) {
        this.cache.set(cacheKey, processedResponse);
      }
      
      // Update conversation history
      this.updateConversationHistory(userInput, processedResponse);
      
      return processedResponse;
    } catch (error) {
      console.error('AI processing error:', error);
      return this.handleError(error);
    }
  }

  // Build sophisticated conversation messages
  private buildConversationMessages(
    userInput: string,
    mode: string,
    copilotContext?: string
  ): Array<{ role: 'user' | 'assistant'; content: string }> {
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    
    // Add system prompt based on mode
    const systemPrompt = this.getSystemPrompt(mode);
    messages.push({ role: 'user', content: systemPrompt });
    messages.push({ 
      role: 'assistant', 
      content: 'I understand. I am SPLI Chat, your specialized AI assistant for space licensing and FAA Part 450 applications. How can I help you today?' 
    });

    // Add relevant conversation history (last 10 messages for context)
    const recentHistory = this.context.history.slice(-10);
    recentHistory.forEach(msg => {
      if (msg.role !== 'system') {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      }
    });

    // Add document context if available
    if (this.context.documents.length > 0) {
      const documentContext = this.buildDocumentContext();
      messages.push({
        role: 'user',
        content: `Document Context: ${documentContext}`
      });
    }

    // Add application context if available
    if (this.context.applicationId || this.context.currentSection || copilotContext) {
      const appContext = [
        this.context.applicationId ? `Application ID: ${this.context.applicationId}` : '',
        this.context.currentSection ? `Form state: ${this.context.currentSection}` : '',
        copilotContext ? `Copilot memory:\n${copilotContext}` : '',
      ].filter(Boolean).join('\n');
      messages.push({
        role: 'user',
        content: `Current Application Context:\n${appContext}`
      });
      messages.push({
        role: 'assistant',
        content: 'I have the application context. I will draft suggestions for your review — you decide what to apply and submit.'
      });
    }

    // Add current user input
    messages.push({ role: 'user', content: userInput });

    return messages;
  }

  // Get sophisticated system prompt based on mode
  private getSystemPrompt(mode: string): string {
    const basePrompt = `You are SPLI Chat, a professional AI assistant specializing in space licensing and FAA Part 450 applications. You are part of a high-end startup providing regulatory compliance solutions for the aerospace industry.

CORE IDENTITY:
- Expert in FAA Part 450 regulations and space licensing
- Professional, confident, and knowledgeable
- Focused on accuracy, compliance, and user success
- Understanding of aerospace technology and industry practices

CAPABILITIES:
- Draft initial responses from mission docs and vehicle specs
- Extract relevant data from CONOPS, risk analyses, and uploaded documents
- Flag inconsistencies across application sections (suggestions only)
- Track FAA reviewer requests when provided by the user
- Maintain awareness of recent changes and why they were made

COPILOT CONSTRAINTS (CRITICAL):
- You are a COPILOT, not an authority — draft and suggest, never decide
- Do NOT make final compliance judgments — the compliance engine validates independently
- Do NOT submit applications or claim submission readiness without human sign-off
- Do NOT override compliance logic or guarantee FAA approval
- Always frame outputs as drafts for human review
- When flagging inconsistencies, cite specific fields and suggest alignment — do not auto-correct
- Label form-fill output as "Suggested draft" requiring user review before applying

CONVERSATION STYLE:
- Professional yet approachable
- Concise but comprehensive
- Proactive and helpful
- Confident in expertise
- Clear and actionable responses`;

    switch (mode) {
      case 'form-fill':
        return `${basePrompt}

FORM FILLING MODE:
Extract mission details into FAA Part 450 fields. The application form updates automatically from your output.

OUTPUT RULES (CRITICAL):
- No introductions, summaries, questions, or follow-ups
- Never ask for more information when a mission description is provided
- Output ONLY labeled sections: header on its own line, then content
- Use professional FAA-ready language drawn from the mission text
- Populate every field you can; omit sections with no supporting detail

Use these exact headers (one per section):
MISSION OBJECTIVE
VEHICLE DESCRIPTION
LAUNCH/REENTRY SEQUENCE
TRAJECTORY OVERVIEW
SAFETY CONSIDERATIONS
GROUND OPERATIONS
TECHNICAL SUMMARY
DIMENSIONS/MASS/STAGES
PROPULSION TYPES
RECOVERY SYSTEMS
GROUND SUPPORT EQUIPMENT
SITE NAMES/COORDINATES
SITE OPERATOR
AIRSPACE/MARITIME NOTES
LAUNCH SITE
LAUNCH WINDOW
FLIGHT PATH
LANDING SITE
EARLY RISK ASSESSMENTS
PUBLIC SAFETY CHALLENGES
PLANNED SAFETY TOOLS
FULL APPLICATION TIMELINE
INTENDED WINDOW
LICENSE TYPE INTENT
CLARIFY PART 450
UNIQUE TECH/INTERNATIONAL`;

      case 'compliance':
        return `${basePrompt}

COMPLIANCE MODE:
Focus on regulatory compliance and validation:

- Check against FAA Part 450 requirements
- Identify compliance gaps and issues
- Provide specific recommendations
- Validate technical specifications
- Ensure safety requirements are met
- Suggest improvements for approval likelihood`;

      case 'analysis':
        return `${basePrompt}

ANALYSIS MODE:
Provide detailed analysis and insights:

- Technical feasibility assessment
- Risk analysis and mitigation strategies
- Industry best practices
- Competitive positioning
- Regulatory landscape analysis
- Strategic recommendations

When documents are provided, structure your analysis with these sections:
## Technical Specifications
## Mission Objectives
## Safety Considerations
## Timeline Information
## Missing Information
## Compliance Requirements
## Integration Suggestions

Use bullet points under each section.`;

      default:
        return `${basePrompt}

CHAT MODE:
- Keep replies short: 2–4 sentences unless the user asks for detail
- When the user wants CONOPS or form help but has not pasted a mission yet, ask them to paste their mission description in one sentence — do not list what to include
- Answer FAA and licensing questions clearly and directly

RESPONSE FORMAT:
- Use light markdown when it helps scannability
- End with at most 2 short follow-ups when useful, formatted as:
  FOLLOW_UP: ["question 1", "question 2"]`;
    }
  }

  // Get AI response with proper error handling
  private async getAIResponse(messages: Array<{ role: 'user' | 'assistant'; content: string }>, mode: string): Promise<string> {
    try {
      const response = await createMessageWithFallback(this.anthropic, {
        max_tokens: 4096,
        messages,
        temperature: mode === 'compliance' ? 0.1 : 0.3,
        system: this.getSystemPrompt(mode),
      });

      return response.content[0].type === 'text' ? response.content[0].text : '';
    } catch (error: unknown) {
      const err = error as { status?: number; statusCode?: number; message?: string };

      if (err?.status === 401 || err?.statusCode === 401) {
        throw new Error('Invalid API key. Please check your ANTHROPIC_API_KEY environment variable.');
      }
      if (err?.status === 429 || err?.statusCode === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (err?.status === 400 || err?.statusCode === 400) {
        throw new Error(`Invalid request: ${err?.message || 'Check your input parameters'}`);
      }
      if (err?.message) {
        throw new Error(`AI service error: ${err.message}`);
      }
      throw new Error('AI service temporarily unavailable. Please try again.');
    }
  }

  // Process AI response intelligently
  private async processAIResponse(
    response: string,
    mode: string,
    sourceMissionText?: string
  ): Promise<AIAnalysisResponse> {
    try {
      switch (mode) {
        case 'form-fill':
          return this.processFormFillResponse(response, sourceMissionText);
        case 'compliance':
          return this.processComplianceResponse(response);
        case 'analysis':
          return this.processAnalysisResponse(response);
        default:
          return this.processChatResponse(response);
      }
    } catch (error) {
      console.error('Response processing error:', error);
      return this.handleError(error);
    }
  }

  // Process form filling responses
  private processFormFillResponse(response: string, sourceMissionText?: string): AIAnalysisResponse {
    // Check if the AI is asking for more information instead of providing form data
    const isAskingForInfo = response.toLowerCase().includes('please provide') || 
                           response.toLowerCase().includes('please share') ||
                           response.toLowerCase().includes('please describe') ||
                           response.toLowerCase().includes('please tell me') ||
                           response.toLowerCase().includes('i need more information') ||
                           response.toLowerCase().includes('could you provide') ||
                           response.toLowerCase().includes('can you provide') ||
                           response.toLowerCase().includes('what is your') ||
                           response.toLowerCase().includes('tell me about');

    if (isAskingForInfo) {
      // Still try extraction — the model may ask questions and provide sections
      const sections = this.extractFormSections(response);
      if (Object.keys(sections).length === 0) {
        return {
          suggestions: [],
          summary: response,
          confidence: 0.0,
          nextSteps: [],
          warnings: [],
        };
      }
    }

    const suggestions: AIFormSuggestion[] = [];
    const sections = this.extractFormSections(response);
    
    // Process each section and include all valid suggestions
    Object.entries(sections).forEach(([section, content]) => {
      if (content && content !== 'Information not provided' && content.trim().length > 0) {
        const confidence = this.calculateConfidence(content);
        if (confidence >= 0.35) {
          suggestions.push({
            field: section,
            value: content,
            confidence: confidence,
            reasoning: `Extracted from user input based on ${section.toLowerCase()} requirements`,
            source: 'ai-extraction'
          });
        }
      }
    });

    const mergedSuggestions = sourceMissionText
      ? mergeFormSuggestions(suggestions, parseMissionToFormFields(sourceMissionText))
      : suggestions;

    const fieldLabel = (field: string) =>
      field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim();

    if (mergedSuggestions.length > 0) {
      return {
        suggestions: mergedSuggestions,
        summary: buildFormFillSummaryMessage(mergedSuggestions, fieldLabel),
        confidence: this.calculateOverallConfidence(mergedSuggestions),
        nextSteps: [],
        warnings: [],
      };
    }

    return {
      suggestions: [],
      summary: response.trim(),
      confidence: 0,
      nextSteps: [],
      warnings: [],
    };
  }

  // Extract form sections from AI response
  private extractFormSections(response: string): Record<string, string> {
    const sections: Record<string, string> = {};
    
    // Define ALL Part 450 form fields with multiple variations for comprehensive extraction
    const sectionMappings = {
      // Section 1: Concept of Operations (CONOPS)
      'mission objective': 'missionObjective',
      'missionobjective': 'missionObjective',
      'objective': 'missionObjective',
      'vehicle description': 'vehicleDescription',
      'vehicledescription': 'vehicleDescription',
      'vehicle': 'vehicleDescription',
      'launch reentry sequence': 'launchReEntrySequence',
      'launchreentrysequence': 'launchReEntrySequence',
      'launch sequence': 'launchReEntrySequence',
      'reentry sequence': 'launchReEntrySequence',
      'trajectory overview': 'trajectoryOverview',
      'trajectoryoverview': 'trajectoryOverview',
      'trajectory': 'trajectoryOverview',
      'safety considerations': 'safetyConsiderations',
      'safetyconsiderations': 'safetyConsiderations',
      'safety': 'safetyConsiderations',
      'ground operations': 'groundOperations',
      'groundoperations': 'groundOperations',
      'ground ops': 'groundOperations',
      
      // Section 2: Vehicle Overview
      'technical summary': 'technicalSummary',
      'technicalsummary': 'technicalSummary',
      'technical': 'technicalSummary',
      'dimensions mass stages': 'dimensionsMassStages',
      'dimensionsmassstages': 'dimensionsMassStages',
      'dimensions': 'dimensionsMassStages',
      'mass stages': 'dimensionsMassStages',
      'propulsion types': 'propulsionTypes',
      'propulsiontypes': 'propulsionTypes',
      'propulsion': 'propulsionTypes',
      'recovery systems': 'recoverySystems',
      'recoverysystems': 'recoverySystems',
      'recovery': 'recoverySystems',
      'ground support equipment': 'groundSupportEquipment',
      'groundsupportequipment': 'groundSupportEquipment',
      'ground support': 'groundSupportEquipment',
      
      // Section 3: Planned Launch/Reentry Location(s)
      'site names coordinates': 'siteNamesCoordinates',
      'sitenamescoordinates': 'siteNamesCoordinates',
      'site coordinates': 'siteNamesCoordinates',
      'coordinates': 'siteNamesCoordinates',
      'site operator': 'siteOperator',
      'siteoperator': 'siteOperator',
      'operator': 'siteOperator',
      'airspace maritime notes': 'airspaceMaritimeNotes',
      'airspacemaritimenotes': 'airspaceMaritimeNotes',
      'airspace notes': 'airspaceMaritimeNotes',
      'maritime notes': 'airspaceMaritimeNotes',
      
      // Section 4: Launch Information
      'launch site': 'launchSite',
      'launchsite': 'launchSite',
      'launch location': 'launchSite',
      'launch window': 'launchWindow',
      'launchwindow': 'launchWindow',
      'window': 'launchWindow',
      'flight path': 'flightPath',
      'flightpath': 'flightPath',
      'path': 'flightPath',
      'landing site': 'landingSite',
      'landingsite': 'landingSite',
      'landing location': 'landingSite',
      
      // Section 5: Preliminary Risk or Safety Considerations
      'early risk assessments': 'earlyRiskAssessments',
      'earlyriskassessments': 'earlyRiskAssessments',
      'risk assessments': 'earlyRiskAssessments',
      'public safety challenges': 'publicSafetyChallenges',
      'publicsafetychallenges': 'publicSafetyChallenges',
      'safety challenges': 'publicSafetyChallenges',
      'planned safety tools': 'plannedSafetyTools',
      'plannedsafetytools': 'plannedSafetyTools',
      'safety tools': 'plannedSafetyTools',
      
      // Section 6: Timeline & Intent
      'full application timeline': 'fullApplicationTimeline',
      'fullapplicationtimeline': 'fullApplicationTimeline',
      'application timeline': 'fullApplicationTimeline',
      'timeline': 'intendedWindow',
      'intended window': 'intendedWindow',
      'intendedwindow': 'intendedWindow',
      'intended': 'intendedWindow',
      'license type intent': 'licenseTypeIntent',
      'licensetypeintent': 'licenseTypeIntent',
      'license intent': 'licenseTypeIntent',
      'license type': 'licenseTypeIntent',
      
      // Section 7: List of Questions for FAA
      'clarify part450': 'clarifyPart450',
      'clarifypart450': 'clarifyPart450',
      'part450': 'clarifyPart450',
      'part 450': 'clarifyPart450',
      'unique tech international': 'uniqueTechInternational',
      'uniquetechinternational': 'uniqueTechInternational',
      'unique tech': 'uniqueTechInternational',
      'international': 'uniqueTechInternational'
    };

    const normalizeHeader = (header: string) =>
      header.toLowerCase().replace(/[#*_\s]+/g, ' ').trim();

    const resolveField = (header: string): string | undefined => {
      const norm = normalizeHeader(header);
      for (const [key, fieldName] of Object.entries(sectionMappings)) {
        const keyNorm = key.replace(/\//g, ' ');
        if (norm === keyNorm || norm.includes(keyNorm) || keyNorm.includes(norm)) {
          return fieldName;
        }
      }
      return undefined;
    };

    const lines = response.split('\n');
    let currentField: string | undefined;
    const chunks: Record<string, string[]> = {};

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        if (currentField) chunks[currentField].push('');
        continue;
      }

      const mdMatch = trimmed.match(/^#{1,4}\s*(.+)$/) || trimmed.match(/^\*\*(.+?)\*\*$/);
      const capsMatch =
        !mdMatch && /^[A-Z][A-Z0-9\s\/\-]{2,55}$/.test(trimmed) ? trimmed : null;
      const rawHeader = mdMatch?.[1] ?? capsMatch;
      if (rawHeader) {
        const field = resolveField(rawHeader);
        if (field) {
          currentField = field;
          chunks[field] = chunks[field] ?? [];
          continue;
        }
      }

      if (currentField) {
        chunks[currentField].push(line);
      }
    }

    for (const [field, contentLines] of Object.entries(chunks)) {
      const content = contentLines.join('\n').trim();
      if (content && content !== 'Information not provided') {
        sections[field] = content;
      }
    }

    if (Object.keys(sections).length > 0) {
      return sections;
    }

    // Try to extract sections from structured AI response first
    const sectionRegex = /^([A-Z\s\/]+)\s*\n(.+?)(?=\n[A-Z\s\/]+\s*\n|$)/gm;
    let match;
    while ((match = sectionRegex.exec(response)) !== null) {
      const sectionName = match[1].trim().toLowerCase();
      const content = match[2].trim();
      
      // Map section names to our field names
      for (const [key, fieldName] of Object.entries(sectionMappings)) {
        if (sectionName.includes(key) || key.includes(sectionName)) {
          sections[fieldName] = content;
          console.log(`Extracted ${fieldName} from section "${sectionName}":`, content.substring(0, 100) + '...');
          break;
        }
      }
    }

    // If no structured sections found, try intelligent extraction from the full response
    if (Object.keys(sections).length === 0) {
      const lowerResponse = response.toLowerCase();
      
      // Extract mission objective - comprehensive extraction
      if (lowerResponse.includes('mission') || lowerResponse.includes('objective') || lowerResponse.includes('purpose') || lowerResponse.includes('planning')) {
        // Look for comprehensive mission descriptions
        const missionPatterns = [
          /(?:we are planning|planning|mission|objective|purpose)[:\s]*([^.]*(?:commercial|lunar|research|demonstration|deploy|conduct|scientific|technology)[^.]*)/gi,
          /(?:commercial|lunar|research|demonstration|deploy|conduct)[^.]*(?:mission|objective|purpose)[^.]*/gi,
          /(?:mission|objective|purpose)[^.]*(?:scientific|technology|research|demonstration|lunar|commercial)[^.]*/gi
        ];
        
        for (const pattern of missionPatterns) {
          const matches = response.match(pattern);
          if (matches && matches.length > 0) {
            sections.missionObjective = matches[0].trim();
            break;
          }
        }
        
        // If no pattern match, extract the most comprehensive mission-related sentence
        if (!sections.missionObjective) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('mission') || lowerSentence.includes('planning') || lowerSentence.includes('objective')) && 
                (lowerSentence.includes('lunar') || lowerSentence.includes('commercial') || lowerSentence.includes('research') || lowerSentence.includes('deploy'))) {
              sections.missionObjective = sentence.trim();
              break;
            }
          }
        }
      }

      // Extract vehicle description - comprehensive extraction
      if (lowerResponse.includes('rocket') || lowerResponse.includes('vehicle') || lowerResponse.includes('stage') || lowerResponse.includes('engine') || lowerResponse.includes('nova')) {
        // Look for comprehensive vehicle descriptions
        const vehiclePatterns = [
          /(?:launch vehicle|rocket|vehicle)[^.]*(?:stage|engine|propulsion|nova|falcon)[^.]*/gi,
          /(?:three-stage|two-stage|single-stage)[^.]*(?:rocket|vehicle|nova)[^.]*/gi,
          /(?:nova|falcon|electron)[^.]*(?:rocket|vehicle|stage|engine)[^.]*/gi,
          /(?:stage|engine)[^.]*(?:methane|oxygen|propulsion|vacuum|transfer)[^.]*/gi
        ];
        
        for (const pattern of vehiclePatterns) {
          const matches = response.match(pattern);
          if (matches && matches.length > 0) {
            sections.vehicleDescription = matches[0].trim();
            break;
          }
        }
        
        // If no pattern match, extract comprehensive vehicle information
        if (!sections.vehicleDescription) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('rocket') || lowerSentence.includes('vehicle') || lowerSentence.includes('nova')) && 
                (lowerSentence.includes('stage') || lowerSentence.includes('engine') || lowerSentence.includes('propulsion'))) {
              sections.vehicleDescription = sentence.trim();
              break;
            }
          }
        }
      }

      // Extract launch sequence - comprehensive extraction
      if (lowerResponse.includes('launch') || lowerResponse.includes('sequence') || lowerResponse.includes('stage') || lowerResponse.includes('separation') || lowerResponse.includes('ignition') || lowerResponse.includes('burn') || lowerResponse.includes('transfer') || lowerResponse.includes('injection')) {
        // Look for comprehensive launch sequence information
        const launchPatterns = [
          /(?:launch|sequence|stage)[^.]*(?:separation|ignition|burn|transfer|lunar|injection)[^.]*/gi,
          /(?:first stage|second stage|third stage)[^.]*(?:separation|ignition|burn|engine)[^.]*/gi,
          /(?:stage separation|engine ignition|burn sequence)[^.]*/gi,
          /(?:lunar transfer|injection burn)[^.]*/gi,
          /(?:launch sequence|stage sequence)[^.]*/gi
        ];
        
        for (const pattern of launchPatterns) {
          const matches = response.match(pattern);
          if (matches && matches.length > 0) {
            sections.launchReEntrySequence = matches[0].trim();
            break;
          }
        }
        
        // If no pattern match, extract comprehensive launch sequence information
        if (!sections.launchReEntrySequence) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('launch') || lowerSentence.includes('sequence') || lowerSentence.includes('stage')) && 
                (lowerSentence.includes('separation') || lowerSentence.includes('ignition') || lowerSentence.includes('burn') || lowerSentence.includes('transfer') || lowerSentence.includes('injection'))) {
              sections.launchReEntrySequence = sentence.trim();
              break;
            }
          }
        }
        
        // Additional extraction for specific stage details
        if (!sections.launchReEntrySequence) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('first stage') || lowerSentence.includes('second stage') || lowerSentence.includes('third stage')) && 
                (lowerSentence.includes('engine') || lowerSentence.includes('separation') || lowerSentence.includes('burn'))) {
              sections.launchReEntrySequence = sentence.trim();
              break;
            }
          }
        }
      }

      // Extract trajectory overview - comprehensive extraction
      if (lowerResponse.includes('trajectory') || lowerResponse.includes('flight path') || lowerResponse.includes('orbital') || lowerResponse.includes('lunar surface') || lowerResponse.includes('mare tranquillitatis') || lowerResponse.includes('lunar transfer') || lowerResponse.includes('destination') || lowerResponse.includes('region')) {
        // Look for comprehensive trajectory information
        const trajectoryPatterns = [
          /(?:trajectory|flight path|lunar transfer)[^.]*(?:mare tranquillitatis|lunar surface|destination|region)[^.]*/gi,
          /(?:destination|lunar surface|mare tranquillitatis)[^.]*(?:region|surface|lunar)[^.]*/gi,
          /(?:lunar transfer|flight path)[^.]*(?:trajectory|path|route)[^.]*/gi,
          /(?:mare tranquillitatis|mare|tranquillitatis)[^.]*(?:region|surface|lunar)[^.]*/gi,
          /(?:trajectory|flight path|orbital|lunar surface|destination)[^.]*/gi
        ];
        
        for (const pattern of trajectoryPatterns) {
          const matches = response.match(pattern);
          if (matches && matches.length > 0) {
            sections.trajectoryOverview = matches[0].trim();
            break;
          }
        }
        
        // If no pattern match, extract comprehensive trajectory information
        if (!sections.trajectoryOverview) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('trajectory') || lowerSentence.includes('flight path') || lowerSentence.includes('lunar transfer') || lowerSentence.includes('destination')) && 
                (lowerSentence.includes('lunar') || lowerSentence.includes('mare') || lowerSentence.includes('tranquillitatis') || lowerSentence.includes('surface') || lowerSentence.includes('region'))) {
              sections.trajectoryOverview = sentence.trim();
              break;
            }
          }
        }
        
        // Additional extraction for specific lunar regions and coordinates
        if (!sections.trajectoryOverview) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if (lowerSentence.includes('mare tranquillitatis') || 
                (lowerSentence.includes('lunar') && lowerSentence.includes('surface')) ||
                (lowerSentence.includes('destination') && lowerSentence.includes('lunar'))) {
              sections.trajectoryOverview = sentence.trim();
              break;
            }
          }
        }
      }

      // Extract technical summary - comprehensive extraction
      if (lowerResponse.includes('technical') || lowerResponse.includes('specification') || lowerResponse.includes('capacity') || lowerResponse.includes('communication') || lowerResponse.includes('payload') || lowerResponse.includes('solar') || lowerResponse.includes('network') || lowerResponse.includes('kg') || lowerResponse.includes('kw') || lowerResponse.includes('mbps')) {
        // Look for comprehensive technical specifications
        const techPatterns = [
          /(?:technical|specification)[^.]*(?:payload|solar|communication|capacity|mass|power|data)[^.]*/gi,
          /(?:payload|solar|communication|capacity)[^.]*(?:kg|kw|mbps|watt|kilogram|kilowatt)[^.]*/gi,
          /(?:500kg|payload mass|solar arrays|5kw|2mbps|deep space network)[^.]*/gi,
          /(?:technical specifications|payload|solar|communication|capacity)[^.]*/gi
        ];
        
        for (const pattern of techPatterns) {
          const matches = response.match(pattern);
          if (matches && matches.length > 0) {
            sections.technicalSummary = matches[0].trim();
            break;
          }
        }
        
        // If no pattern match, extract comprehensive technical information
        if (!sections.technicalSummary) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('payload') || lowerSentence.includes('solar') || lowerSentence.includes('communication') || lowerSentence.includes('capacity') || lowerSentence.includes('technical')) && 
                (lowerSentence.includes('kg') || lowerSentence.includes('kw') || lowerSentence.includes('mbps') || lowerSentence.includes('watt') || lowerSentence.includes('kilogram'))) {
              sections.technicalSummary = sentence.trim();
              break;
            }
          }
        }
      }

      // Extract dimensions/mass/stages - comprehensive extraction
      if (lowerResponse.includes('dimensions') || lowerResponse.includes('mass') || lowerResponse.includes('stage') || lowerResponse.includes('meter') || lowerResponse.includes('85 meters') || lowerResponse.includes('4.5-meter') || lowerResponse.includes('diameter') || lowerResponse.includes('height') || lowerResponse.includes('total vehicle')) {
        // Look for comprehensive dimension and mass information
        const dimensionPatterns = [
          /(?:total vehicle height|vehicle height|height)[^.]*(?:85 meters|meter)[^.]*/gi,
          /(?:4\.5-meter|4.5 meter|diameter|fairing)[^.]*(?:diameter|meter)[^.]*/gi,
          /(?:85 meters|85 meter)[^.]*(?:height|total|vehicle)[^.]*/gi,
          /(?:dimensions|mass|stage)[^.]*(?:meter|diameter|height)[^.]*/gi,
          /(?:three-stage|two-stage|single-stage)[^.]*(?:rocket|vehicle|height|mass)[^.]*/gi
        ];
        
        for (const pattern of dimensionPatterns) {
          const matches = response.match(pattern);
          if (matches && matches.length > 0) {
            sections.dimensionsMassStages = matches[0].trim();
            break;
          }
        }
        
        // If no pattern match, extract comprehensive dimension information
        if (!sections.dimensionsMassStages) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('85 meters') || lowerSentence.includes('4.5-meter') || lowerSentence.includes('diameter') || lowerSentence.includes('height')) && 
                (lowerSentence.includes('total') || lowerSentence.includes('vehicle') || lowerSentence.includes('fairing') || lowerSentence.includes('meter'))) {
              sections.dimensionsMassStages = sentence.trim();
              break;
            }
          }
        }
        
        // Additional extraction for specific measurements
        if (!sections.dimensionsMassStages) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if (lowerSentence.includes('85 meters') || 
                lowerSentence.includes('4.5-meter') ||
                (lowerSentence.includes('total vehicle') && lowerSentence.includes('height')) ||
                (lowerSentence.includes('diameter') && lowerSentence.includes('fairing'))) {
              sections.dimensionsMassStages = sentence.trim();
              break;
            }
          }
        }
      }

      // Extract propulsion types - comprehensive extraction
      if (lowerResponse.includes('propulsion') || lowerResponse.includes('engine') || lowerResponse.includes('methane') || lowerResponse.includes('oxygen') || lowerResponse.includes('vacuum') || lowerResponse.includes('transfer') || lowerResponse.includes('first stage') || lowerResponse.includes('second stage') || lowerResponse.includes('third stage')) {
        // Look for comprehensive propulsion information
        const propulsionPatterns = [
          /(?:first stage|second stage|third stage)[^.]*(?:engine|methane|oxygen|propulsion)[^.]*/gi,
          /(?:methane|oxygen|engine)[^.]*(?:propulsion|vacuum|transfer|optimized)[^.]*/gi,
          /(?:vacuum-optimized|vacuum optimized)[^.]*(?:engine|propulsion)[^.]*/gi,
          /(?:lunar transfer|transfer engine)[^.]*/gi,
          /(?:5 methane|5 oxygen|2 vacuum|1 lunar)[^.]*(?:engine|propulsion)[^.]*/gi,
          /(?:propulsion|engine|methane|oxygen|vacuum|transfer)[^.]*/gi
        ];
        
        for (const pattern of propulsionPatterns) {
          const matches = response.match(pattern);
          if (matches && matches.length > 0) {
            sections.propulsionTypes = matches[0].trim();
            break;
          }
        }
        
        // If no pattern match, extract comprehensive propulsion information
        if (!sections.propulsionTypes) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('engine') || lowerSentence.includes('propulsion') || lowerSentence.includes('methane') || lowerSentence.includes('oxygen')) && 
                (lowerSentence.includes('stage') || lowerSentence.includes('vacuum') || lowerSentence.includes('transfer') || lowerSentence.includes('optimized'))) {
              sections.propulsionTypes = sentence.trim();
              break;
            }
          }
        }
        
        // Additional extraction for specific engine configurations
        if (!sections.propulsionTypes) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('first stage') || lowerSentence.includes('second stage') || lowerSentence.includes('third stage')) && 
                (lowerSentence.includes('engine') || lowerSentence.includes('methane') || lowerSentence.includes('oxygen') || lowerSentence.includes('vacuum'))) {
              sections.propulsionTypes = sentence.trim();
              break;
            }
          }
        }
      }

      // Extract recovery systems - comprehensive extraction
      if (lowerResponse.includes('recovery') || lowerResponse.includes('one-way') || lowerResponse.includes('no recovery') || lowerResponse.includes('lunar surface') || lowerResponse.includes('one way')) {
        // Look for comprehensive recovery information
        const recoveryPatterns = [
          /(?:recovery|one-way|one way|no recovery)[^.]*(?:lunar surface|mission|landing)[^.]*/gi,
          /(?:one-way mission|one way mission)[^.]*(?:lunar surface|no recovery)[^.]*/gi,
          /(?:lunar surface|landing)[^.]*(?:one-way|one way|no recovery)[^.]*/gi,
          /(?:recovery systems|recovery)[^.]*/gi,
          /(?:one-way|one way|no recovery)[^.]*/gi
        ];
        
        for (const pattern of recoveryPatterns) {
          const matches = response.match(pattern);
          if (matches && matches.length > 0) {
            sections.recoverySystems = matches[0].trim();
            break;
          }
        }
        
        // If no pattern match, extract comprehensive recovery information
        if (!sections.recoverySystems) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('one-way') || lowerSentence.includes('one way') || lowerSentence.includes('no recovery')) && 
                (lowerSentence.includes('lunar') || lowerSentence.includes('surface') || lowerSentence.includes('mission'))) {
              sections.recoverySystems = sentence.trim();
              break;
            }
          }
        }
        
        // Additional extraction for specific recovery scenarios
        if (!sections.recoverySystems) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if (lowerSentence.includes('one-way') || 
                lowerSentence.includes('one way') ||
                lowerSentence.includes('no recovery') ||
                (lowerSentence.includes('lunar') && lowerSentence.includes('surface'))) {
              sections.recoverySystems = sentence.trim();
              break;
            }
          }
        }
      }

      // Extract safety considerations - comprehensive extraction
      if (lowerResponse.includes('safety') || lowerResponse.includes('termination') || lowerResponse.includes('monitoring') || lowerResponse.includes('collision') || lowerResponse.includes('autonomous') || lowerResponse.includes('gps') || lowerResponse.includes('flight termination') || lowerResponse.includes('trajectory monitoring')) {
        // Look for comprehensive safety information
        const safetyPatterns = [
          /(?:safety considerations|safety systems|flight termination)[^.]*(?:autonomous|gps|tracking|monitoring)[^.]*/gi,
          /(?:autonomous flight termination|gps tracking|trajectory monitoring)[^.]*/gi,
          /(?:collision avoidance|lunar impact|debris mitigation)[^.]*/gi,
          /(?:public safety|deep space|safety protocols)[^.]*/gi,
          /(?:safety|termination|monitoring|collision|mitigation|autonomous|gps|tracking)[^.]*/gi
        ];
        
        for (const pattern of safetyPatterns) {
          const matches = response.match(pattern);
          if (matches && matches.length > 0) {
            sections.safetyConsiderations = matches[0].trim();
            break;
          }
        }
        
        // If no pattern match, extract comprehensive safety information
        if (!sections.safetyConsiderations) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if (lowerSentence.includes('safety') || 
                (lowerSentence.includes('autonomous') && lowerSentence.includes('termination')) ||
                (lowerSentence.includes('gps') && lowerSentence.includes('tracking')) ||
                (lowerSentence.includes('flight') && lowerSentence.includes('termination')) ||
                (lowerSentence.includes('trajectory') && lowerSentence.includes('monitoring'))) {
              sections.safetyConsiderations = sentence.trim();
              break;
            }
          }
        }
      }

      // Extract early risk assessments - comprehensive extraction
      if (lowerResponse.includes('risk') || lowerResponse.includes('assessment') || lowerResponse.includes('analysis') || lowerResponse.includes('mitigation') || lowerResponse.includes('early risk')) {
        // Look for comprehensive risk assessment information
        const riskPatterns = [
          /(?:early risk|risk assessment|risk analysis)[^.]*(?:mitigation|analysis|assessment)[^.]*/gi,
          /(?:risk|assessment|analysis)[^.]*(?:mitigation|early|preliminary)[^.]*/gi,
          /(?:preliminary risk|early risk|risk assessment)[^.]*/gi,
          /(?:risk|assessment|analysis|mitigation)[^.]*/gi
        ];
        
        for (const pattern of riskPatterns) {
          const matches = response.match(pattern);
          if (matches && matches.length > 0) {
            sections.earlyRiskAssessments = matches[0].trim();
            break;
          }
        }
        
        // If no pattern match, extract comprehensive risk information
        if (!sections.earlyRiskAssessments) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('risk') || lowerSentence.includes('assessment') || lowerSentence.includes('analysis')) && 
                (lowerSentence.includes('mitigation') || lowerSentence.includes('early') || lowerSentence.includes('preliminary'))) {
              sections.earlyRiskAssessments = sentence.trim();
              break;
            }
          }
        }
        
        // Additional extraction for specific risk scenarios
        if (!sections.earlyRiskAssessments) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if (lowerSentence.includes('early risk') || 
                lowerSentence.includes('risk assessment') ||
                lowerSentence.includes('preliminary risk') ||
                (lowerSentence.includes('risk') && lowerSentence.includes('analysis'))) {
              sections.earlyRiskAssessments = sentence.trim();
              break;
            }
          }
        }
      }

      // Extract public safety challenges - comprehensive extraction
      if (lowerResponse.includes('public safety') || lowerResponse.includes('challenge') || lowerResponse.includes('protocol') || lowerResponse.includes('deep space') || lowerResponse.includes('public safety challenges')) {
        // Look for comprehensive public safety information
        const publicSafetyPatterns = [
          /(?:public safety challenges|public safety|safety challenges)[^.]*(?:deep space|protocol|operations)[^.]*/gi,
          /(?:deep space|public safety)[^.]*(?:operations|protocol|challenges)[^.]*/gi,
          /(?:public safety protocols|safety protocols)[^.]*(?:deep space|operations)[^.]*/gi,
          /(?:public safety|challenge|protocol)[^.]*/gi
        ];
        
        for (const pattern of publicSafetyPatterns) {
          const matches = response.match(pattern);
          if (matches && matches.length > 0 && !sections.safetyConsiderations?.includes(matches[0])) {
            sections.publicSafetyChallenges = matches[0].trim();
            break;
          }
        }
        
        // If no pattern match, extract comprehensive public safety information
        if (!sections.publicSafetyChallenges) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('public safety') || lowerSentence.includes('challenge') || lowerSentence.includes('protocol')) && 
                (lowerSentence.includes('deep space') || lowerSentence.includes('operations') || lowerSentence.includes('safety')) && 
                !sections.safetyConsiderations?.includes(sentence)) {
              sections.publicSafetyChallenges = sentence.trim();
              break;
            }
          }
        }
        
        // Additional extraction for specific public safety scenarios
        if (!sections.publicSafetyChallenges) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('public safety') && lowerSentence.includes('challenges')) || 
                (lowerSentence.includes('deep space') && lowerSentence.includes('operations')) ||
                (lowerSentence.includes('public safety') && lowerSentence.includes('protocols'))) {
              sections.publicSafetyChallenges = sentence.trim();
              break;
            }
          }
        }
      }

      // Extract planned safety tools - comprehensive extraction
      if (lowerResponse.includes('safety tools') || lowerResponse.includes('debris') || lowerResponse.includes('sara') || lowerResponse.includes('planned safety') || lowerResponse.includes('safety analysis')) {
        // Look for comprehensive safety tools information
        const safetyToolsPatterns = [
          /(?:planned safety tools|safety tools|planned safety)[^.]*(?:debris|sara|analysis)[^.]*/gi,
          /(?:debris|sara|safety analysis)[^.]*(?:tools|planned|safety)[^.]*/gi,
          /(?:safety tools|planned safety)[^.]*/gi,
          /(?:debris|sara)[^.]*/gi
        ];
        
        for (const pattern of safetyToolsPatterns) {
          const matches = response.match(pattern);
          if (matches && matches.length > 0 && !sections.safetyConsiderations?.includes(matches[0])) {
            sections.plannedSafetyTools = matches[0].trim();
            break;
          }
        }
        
        // If no pattern match, extract comprehensive safety tools information
        if (!sections.plannedSafetyTools) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('safety tools') || lowerSentence.includes('debris') || lowerSentence.includes('sara')) && 
                (lowerSentence.includes('planned') || lowerSentence.includes('safety') || lowerSentence.includes('analysis')) && 
                !sections.safetyConsiderations?.includes(sentence)) {
              sections.plannedSafetyTools = sentence.trim();
              break;
            }
          }
        }
        
        // Additional extraction for specific safety tools
        if (!sections.plannedSafetyTools) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('planned') && lowerSentence.includes('safety')) || 
                (lowerSentence.includes('debris') && lowerSentence.includes('safety')) ||
                (lowerSentence.includes('sara') && lowerSentence.includes('safety'))) {
              sections.plannedSafetyTools = sentence.trim();
              break;
            }
          }
        }
      }

      // Extract ground operations - comprehensive extraction
      if (lowerResponse.includes('ground') || lowerResponse.includes('operation') || lowerResponse.includes('facility') || lowerResponse.includes('assembly') || lowerResponse.includes('ksc') || lowerResponse.includes('houston') || lowerResponse.includes('mission control') || lowerResponse.includes('pre-launch')) {
        // Look for comprehensive ground operations information
        const groundPatterns = [
          /(?:ground operations|pre-launch)[^.]*(?:assembly|testing|facility|ksc|houston)[^.]*/gi,
          /(?:mission control|houston facility)[^.]*(?:operations|tracking|lunar surface)[^.]*/gi,
          /(?:payload integration|lunar transfer vehicle)[^.]*/gi,
          /(?:post-launch tracking|lunar surface operations)[^.]*/gi,
          /(?:ground|operation|facility|assembly|testing|control|ksc|houston|mission control)[^.]*/gi
        ];
        
        for (const pattern of groundPatterns) {
          const matches = response.match(pattern);
          if (matches && matches.length > 0) {
            sections.groundOperations = matches[0].trim();
            break;
          }
        }
        
        // If no pattern match, extract comprehensive ground operations information
        if (!sections.groundOperations) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('ground') || lowerSentence.includes('ksc') || lowerSentence.includes('houston') || lowerSentence.includes('pre-launch')) && 
                (lowerSentence.includes('operation') || lowerSentence.includes('facility') || lowerSentence.includes('assembly') || lowerSentence.includes('control') || lowerSentence.includes('testing'))) {
              sections.groundOperations = sentence.trim();
              break;
            }
          }
        }
      }

      // Extract launch site - comprehensive extraction
      if (lowerResponse.includes('kennedy') || lowerResponse.includes('space center') || lowerResponse.includes('launch complex') || lowerResponse.includes('coordinates') || lowerResponse.includes('florida') || lowerResponse.includes('ksc')) {
        // Look for comprehensive launch site information
        const sitePatterns = [
          /(?:launch from|launch site|kennedy space center|ksc)[^.]*(?:florida|launch complex|39a|coordinates)[^.]*/gi,
          /(?:kennedy space center|ksc)[^.]*(?:florida|launch complex|39a)[^.]*/gi,
          /(?:launch complex|39a)[^.]*(?:kennedy|space center|florida)[^.]*/gi,
          /(?:florida|28\.5729|80\.6490)[^.]*(?:kennedy|space center|launch)[^.]*/gi
        ];
        
        for (const pattern of sitePatterns) {
          const matches = response.match(pattern);
          if (matches && matches.length > 0) {
            sections.launchSite = matches[0].trim();
            break;
          }
        }
        
        // If no pattern match, extract comprehensive launch site information
        if (!sections.launchSite) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('kennedy') || lowerSentence.includes('space center') || lowerSentence.includes('ksc') || lowerSentence.includes('launch complex')) && 
                (lowerSentence.includes('florida') || lowerSentence.includes('39a') || lowerSentence.includes('coordinates'))) {
              sections.launchSite = sentence.trim();
              break;
            }
          }
        }
      }

      // Extract site names/coordinates - comprehensive extraction
      if (lowerResponse.includes('coordinates') || lowerResponse.includes('28.5729') || lowerResponse.includes('80.6490') || lowerResponse.includes('florida') || lowerResponse.includes('cape canaveral') || lowerResponse.includes('kennedy space center') || lowerResponse.includes('ksc')) {
        // Look for comprehensive site and coordinate information
        const coordinatePatterns = [
          /(?:kennedy space center|ksc|florida)[^.]*(?:28\.5729|80\.6490|coordinates)[^.]*/gi,
          /(?:28\.5729|80\.6490)[^.]*(?:n|s|e|w|north|south|east|west|florida)[^.]*/gi,
          /(?:coordinates|28\.5729|80\.6490|florida)[^.]*/gi,
          /(?:cape canaveral|kennedy space center|ksc)[^.]*(?:florida|coordinates)[^.]*/gi,
          /(?:florida|28\.5729|80\.6490)[^.]*(?:kennedy|space center|ksc)[^.]*/gi
        ];
        
        for (const pattern of coordinatePatterns) {
          const matches = response.match(pattern);
          if (matches && matches.length > 0) {
            sections.siteNamesCoordinates = matches[0].trim();
            break;
          }
        }
        
        // If no pattern match, extract comprehensive coordinate information
        if (!sections.siteNamesCoordinates) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('28.5729') || lowerSentence.includes('80.6490') || lowerSentence.includes('coordinates')) && 
                (lowerSentence.includes('florida') || lowerSentence.includes('kennedy') || lowerSentence.includes('space center') || lowerSentence.includes('ksc'))) {
              sections.siteNamesCoordinates = sentence.trim();
              break;
            }
          }
        }
        
        // Additional extraction for specific coordinate formats
        if (!sections.siteNamesCoordinates) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if (lowerSentence.includes('28.5729') || 
                lowerSentence.includes('80.6490') ||
                (lowerSentence.includes('kennedy space center') && lowerSentence.includes('florida')) ||
                (lowerSentence.includes('coordinates') && lowerSentence.includes('florida'))) {
              sections.siteNamesCoordinates = sentence.trim();
              break;
            }
          }
        }
      }

      // Extract site operator - comprehensive extraction
      if (lowerResponse.includes('operator') || lowerResponse.includes('operated by') || lowerResponse.includes('company') || lowerResponse.includes('our company') || lowerResponse.includes('site operator')) {
        // Look for comprehensive site operator information
        const operatorPatterns = [
          /(?:site operator|operated by|operator)[^.]*(?:our company|company|facility)[^.]*/gi,
          /(?:our company|company)[^.]*(?:operates|operator|facility)[^.]*/gi,
          /(?:launch complex|39a)[^.]*(?:operated by|operator|company)[^.]*/gi,
          /(?:operator|operated by|company)[^.]*/gi
        ];
        
        for (const pattern of operatorPatterns) {
          const matches = response.match(pattern);
          if (matches && matches.length > 0) {
            sections.siteOperator = matches[0].trim();
            break;
          }
        }
        
        // If no pattern match, extract comprehensive operator information
        if (!sections.siteOperator) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('operator') || lowerSentence.includes('operated by') || lowerSentence.includes('company')) && 
                (lowerSentence.includes('our company') || lowerSentence.includes('facility') || lowerSentence.includes('launch complex'))) {
              sections.siteOperator = sentence.trim();
              break;
            }
          }
        }
        
        // Additional extraction for specific operator scenarios
        if (!sections.siteOperator) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('our company') && lowerSentence.includes('operates')) || 
                (lowerSentence.includes('launch complex') && lowerSentence.includes('operated by')) ||
                (lowerSentence.includes('site operator') && lowerSentence.includes('company'))) {
              sections.siteOperator = sentence.trim();
              break;
            }
          }
        }
      }

      // Extract launch window - comprehensive extraction
      if (lowerResponse.includes('launch window') || lowerResponse.includes('q4 2024') || lowerResponse.includes('october') || lowerResponse.includes('december') || lowerResponse.includes('q4') || lowerResponse.includes('2024') || lowerResponse.includes('window')) {
        // Look for comprehensive launch window information
        const windowPatterns = [
          /(?:launch window|q4 2024|q4)[^.]*(?:october|december|2024)[^.]*/gi,
          /(?:october|december)[^.]*(?:2024|launch window|q4)[^.]*/gi,
          /(?:q4 2024|q4)[^.]*(?:october|december|launch window)[^.]*/gi,
          /(?:launch window|q4 2024|october|december)[^.]*/gi
        ];
        
        for (const pattern of windowPatterns) {
          const matches = response.match(pattern);
          if (matches && matches.length > 0) {
            sections.launchWindow = matches[0].trim();
            break;
          }
        }
        
        // If no pattern match, extract comprehensive launch window information
        if (!sections.launchWindow) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('launch window') || lowerSentence.includes('q4') || lowerSentence.includes('2024')) && 
                (lowerSentence.includes('october') || lowerSentence.includes('december') || lowerSentence.includes('q4'))) {
              sections.launchWindow = sentence.trim();
              break;
            }
          }
        }
        
        // Additional extraction for specific launch window scenarios
        if (!sections.launchWindow) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if (lowerSentence.includes('q4 2024') || 
                (lowerSentence.includes('october') && lowerSentence.includes('december')) ||
                (lowerSentence.includes('launch window') && lowerSentence.includes('2024'))) {
              sections.launchWindow = sentence.trim();
              break;
            }
          }
        }
      }

      // Extract flight path - comprehensive extraction
      if (lowerResponse.includes('flight path') || lowerResponse.includes('lunar transfer') || lowerResponse.includes('mare tranquillitatis') || lowerResponse.includes('path') || lowerResponse.includes('trajectory') || lowerResponse.includes('route')) {
        // Look for comprehensive flight path information
        const flightPathPatterns = [
          /(?:flight path|lunar transfer|path)[^.]*(?:mare tranquillitatis|lunar|surface)[^.]*/gi,
          /(?:mare tranquillitatis|lunar transfer)[^.]*(?:flight path|path|route)[^.]*/gi,
          /(?:trajectory|flight path)[^.]*(?:lunar|transfer|path)[^.]*/gi,
          /(?:flight path|lunar transfer|mare tranquillitatis)[^.]*/gi
        ];
        
        for (const pattern of flightPathPatterns) {
          const matches = response.match(pattern);
          if (matches && matches.length > 0) {
            sections.flightPath = matches[0].trim();
            break;
          }
        }
        
        // If no pattern match, extract comprehensive flight path information
        if (!sections.flightPath) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('flight path') || lowerSentence.includes('lunar transfer') || lowerSentence.includes('path')) && 
                (lowerSentence.includes('mare') || lowerSentence.includes('tranquillitatis') || lowerSentence.includes('lunar') || lowerSentence.includes('surface'))) {
              sections.flightPath = sentence.trim();
              break;
            }
          }
        }
        
        // Additional extraction for specific flight path scenarios
        if (!sections.flightPath) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if (lowerSentence.includes('mare tranquillitatis') || 
                (lowerSentence.includes('lunar transfer') && lowerSentence.includes('path')) ||
                (lowerSentence.includes('flight path') && lowerSentence.includes('lunar'))) {
              sections.flightPath = sentence.trim();
              break;
            }
          }
        }
      }

      // Extract landing site - comprehensive extraction
      if (lowerResponse.includes('landing') || lowerResponse.includes('lunar surface') || lowerResponse.includes('mare tranquillitatis') || lowerResponse.includes('landing site') || lowerResponse.includes('destination') || lowerResponse.includes('surface')) {
        // Look for comprehensive landing site information
        const landingPatterns = [
          /(?:landing site|landing|lunar surface)[^.]*(?:mare tranquillitatis|destination|region)[^.]*/gi,
          /(?:mare tranquillitatis|destination)[^.]*(?:landing|surface|site)[^.]*/gi,
          /(?:lunar surface|landing)[^.]*(?:mare tranquillitatis|region|destination)[^.]*/gi,
          /(?:landing|lunar surface|mare tranquillitatis)[^.]*/gi
        ];
        
        for (const pattern of landingPatterns) {
          const matches = response.match(pattern);
          if (matches && matches.length > 0) {
            sections.landingSite = matches[0].trim();
            break;
          }
        }
        
        // If no pattern match, extract comprehensive landing site information
        if (!sections.landingSite) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('landing') || lowerSentence.includes('lunar surface') || lowerSentence.includes('destination')) && 
                (lowerSentence.includes('mare') || lowerSentence.includes('tranquillitatis') || lowerSentence.includes('surface') || lowerSentence.includes('region'))) {
              sections.landingSite = sentence.trim();
              break;
            }
          }
        }
        
        // Additional extraction for specific landing site scenarios
        if (!sections.landingSite) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if (lowerSentence.includes('mare tranquillitatis') || 
                (lowerSentence.includes('lunar surface') && lowerSentence.includes('landing')) ||
                (lowerSentence.includes('landing site') && lowerSentence.includes('lunar'))) {
              sections.landingSite = sentence.trim();
              break;
            }
          }
        }
      }

      // Extract timeline information - comprehensive extraction
      if (lowerResponse.includes('timeline') || lowerResponse.includes('q1') || lowerResponse.includes('q2') || lowerResponse.includes('q3') || lowerResponse.includes('q4') || lowerResponse.includes('2024') || lowerResponse.includes('window') || lowerResponse.includes('duration') || lowerResponse.includes('mission duration') || lowerResponse.includes('2 years')) {
        // Look for comprehensive timeline information
        const timelinePatterns = [
          /(?:mission timeline|timeline|mission duration)[^.]*(?:q[1-4]|2024|duration|years)[^.]*/gi,
          /(?:mission duration|duration)[^.]*(?:2 years|lunar surface|years)[^.]*/gi,
          /(?:q[1-4]|2024)[^.]*(?:timeline|application|submission)[^.]*/gi,
          /(?:timeline|application|launch window|q[1-4]|2024|duration|october|december)[^.]*/gi
        ];
        
        for (const pattern of timelinePatterns) {
          const matches = response.match(pattern);
          if (matches && matches.length > 0 && !sections.launchWindow?.includes(matches[0])) {
            sections.intendedWindow = matches[0].trim();
            break;
          }
        }
        
        // If no pattern match, extract comprehensive timeline information
        if (!sections.intendedWindow) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('timeline') || lowerSentence.includes('window') || lowerSentence.includes('duration') || lowerSentence.includes('mission duration')) && 
                (lowerSentence.includes('q1') || lowerSentence.includes('q2') || lowerSentence.includes('q3') || lowerSentence.includes('q4') || lowerSentence.includes('2024') || lowerSentence.includes('2 years')) && 
                !sections.launchWindow?.includes(sentence)) {
              sections.intendedWindow = sentence.trim();
              break;
            }
          }
        }
        
        // Additional extraction for specific timeline scenarios
        if (!sections.intendedWindow) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('mission duration') && lowerSentence.includes('2 years')) || 
                (lowerSentence.includes('timeline') && lowerSentence.includes('2024')) ||
                (lowerSentence.includes('application submission') && lowerSentence.includes('q1'))) {
              sections.intendedWindow = sentence.trim();
              break;
            }
          }
        }
      }

      // Extract full application timeline - comprehensive extraction
      if (lowerResponse.includes('application submission') || lowerResponse.includes('q1 2024') || lowerResponse.includes('application timeline') || lowerResponse.includes('submission') || lowerResponse.includes('q1')) {
        // Look for comprehensive application timeline information
        const appTimelinePatterns = [
          /(?:application submission|application timeline|full application)[^.]*(?:q1 2024|q1|submission)[^.]*/gi,
          /(?:q1 2024|q1)[^.]*(?:application|submission|timeline)[^.]*/gi,
          /(?:full application|application submission)[^.]*/gi,
          /(?:application submission|q1 2024)[^.]*/gi
        ];
        
        for (const pattern of appTimelinePatterns) {
          const matches = response.match(pattern);
          if (matches && matches.length > 0) {
            sections.fullApplicationTimeline = matches[0].trim();
            break;
          }
        }
        
        // If no pattern match, extract comprehensive application timeline information
        if (!sections.fullApplicationTimeline) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('application') || lowerSentence.includes('submission') || lowerSentence.includes('timeline')) && 
                (lowerSentence.includes('q1') || lowerSentence.includes('2024') || lowerSentence.includes('full'))) {
              sections.fullApplicationTimeline = sentence.trim();
              break;
            }
          }
        }
        
        // Additional extraction for specific application timeline scenarios
        if (!sections.fullApplicationTimeline) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('application submission') && lowerSentence.includes('q1')) || 
                (lowerSentence.includes('full application') && lowerSentence.includes('timeline')) ||
                (lowerSentence.includes('q1 2024') && lowerSentence.includes('application'))) {
              sections.fullApplicationTimeline = sentence.trim();
              break;
            }
          }
        }
      }

      // Extract license type information - comprehensive extraction
      if (lowerResponse.includes('license') || lowerResponse.includes('part 450') || lowerResponse.includes('commercial') || lowerResponse.includes('seeking') || lowerResponse.includes('space transportation') || lowerResponse.includes('license type')) {
        // Look for comprehensive license type information
        const licensePatterns = [
          /(?:license type intent|license type|license)[^.]*(?:commercial|part 450|space transportation)[^.]*/gi,
          /(?:seeking|commercial)[^.]*(?:space transportation|license|part 450)[^.]*/gi,
          /(?:space transportation|commercial space)[^.]*(?:license|part 450)[^.]*/gi,
          /(?:license|part 450|commercial|seeking|transportation)[^.]*/gi
        ];
        
        for (const pattern of licensePatterns) {
          const matches = response.match(pattern);
          if (matches && matches.length > 0) {
            sections.licenseTypeIntent = matches[0].trim();
            break;
          }
        }
        
        // If no pattern match, extract comprehensive license information
        if (!sections.licenseTypeIntent) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('license') || lowerSentence.includes('part 450') || lowerSentence.includes('commercial')) && 
                (lowerSentence.includes('seeking') || lowerSentence.includes('space transportation') || lowerSentence.includes('type'))) {
              sections.licenseTypeIntent = sentence.trim();
              break;
            }
          }
        }
        
        // Additional extraction for specific license scenarios
        if (!sections.licenseTypeIntent) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('seeking') && lowerSentence.includes('commercial')) || 
                (lowerSentence.includes('space transportation') && lowerSentence.includes('license')) ||
                (lowerSentence.includes('license type') && lowerSentence.includes('commercial'))) {
              sections.licenseTypeIntent = sentence.trim();
              break;
            }
          }
        }
      }

      // Extract clarify Part 450 - comprehensive extraction
      if (lowerResponse.includes('part 450') || lowerResponse.includes('clarify') || lowerResponse.includes('requirements') || lowerResponse.includes('part450') || lowerResponse.includes('faa requirements')) {
        // Look for comprehensive Part 450 clarification information
        const clarifyPatterns = [
          /(?:clarify part 450|part 450|part450)[^.]*(?:requirements|clarify|faa)[^.]*/gi,
          /(?:faa requirements|requirements)[^.]*(?:part 450|part450|clarify)[^.]*/gi,
          /(?:part 450|part450)[^.]*(?:clarify|requirements|faa)[^.]*/gi,
          /(?:part 450|clarify|requirements)[^.]*/gi
        ];
        
        for (const pattern of clarifyPatterns) {
          const matches = response.match(pattern);
          if (matches && matches.length > 0) {
            sections.clarifyPart450 = matches[0].trim();
            break;
          }
        }
        
        // If no pattern match, extract comprehensive clarification information
        if (!sections.clarifyPart450) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('part 450') || lowerSentence.includes('part450') || lowerSentence.includes('clarify')) && 
                (lowerSentence.includes('requirements') || lowerSentence.includes('faa') || lowerSentence.includes('clarify'))) {
              sections.clarifyPart450 = sentence.trim();
              break;
            }
          }
        }
        
        // Additional extraction for specific clarification scenarios
        if (!sections.clarifyPart450) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('clarify') && lowerSentence.includes('part 450')) || 
                (lowerSentence.includes('faa requirements') && lowerSentence.includes('part 450')) ||
                (lowerSentence.includes('part450') && lowerSentence.includes('requirements'))) {
              sections.clarifyPart450 = sentence.trim();
              break;
            }
          }
        }
      }

      // Extract unique tech/international - comprehensive extraction
      if (lowerResponse.includes('unique') || lowerResponse.includes('international') || lowerResponse.includes('lunar surface') || lowerResponse.includes('deep space') || lowerResponse.includes('unique technology') || lowerResponse.includes('international aspects')) {
        // Look for comprehensive unique tech/international information
        const uniquePatterns = [
          /(?:unique tech|unique technology|unique)[^.]*(?:international|lunar surface|deep space)[^.]*/gi,
          /(?:international aspects|international)[^.]*(?:unique|lunar surface|deep space)[^.]*/gi,
          /(?:lunar surface|deep space)[^.]*(?:unique|international|technology)[^.]*/gi,
          /(?:unique|international|lunar surface|deep space)[^.]*/gi
        ];
        
        for (const pattern of uniquePatterns) {
          const matches = response.match(pattern);
          if (matches && matches.length > 0) {
            sections.uniqueTechInternational = matches[0].trim();
            break;
          }
        }
        
        // If no pattern match, extract comprehensive unique tech information
        if (!sections.uniqueTechInternational) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('unique') || lowerSentence.includes('international') || lowerSentence.includes('technology')) && 
                (lowerSentence.includes('lunar surface') || lowerSentence.includes('deep space') || lowerSentence.includes('international'))) {
              sections.uniqueTechInternational = sentence.trim();
              break;
            }
          }
        }
        
        // Additional extraction for specific unique tech scenarios
        if (!sections.uniqueTechInternational) {
          const sentences = response.split('.');
          for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            if ((lowerSentence.includes('unique technology') && lowerSentence.includes('international')) || 
                (lowerSentence.includes('lunar surface') && lowerSentence.includes('unique')) ||
                (lowerSentence.includes('deep space') && lowerSentence.includes('international'))) {
              sections.uniqueTechInternational = sentence.trim();
              break;
            }
          }
        }
      }
    }

    return sections;
  }

  // Calculate confidence for extracted information
  private calculateConfidence(content: string): number {
    if (!content || content === 'Information not provided') return 0;
    
    // More lenient confidence calculation to encourage field population
    let confidence = 0.6; // Higher base confidence
    
    // Increase confidence for specific details
    if (content.includes('kg') || content.includes('meters') || content.includes('km')) confidence += 0.15;
    if (content.includes('Falcon') || content.includes('Electron') || content.includes('rocket') || content.includes('nova')) confidence += 0.15;
    if (content.includes('Cape Canaveral') || content.includes('Vandenberg') || content.includes('Kennedy')) confidence += 0.1;
    if (content.includes('lunar') || content.includes('mission') || content.includes('satellite')) confidence += 0.1;
    if (content.length > 30) confidence += 0.1; // Lower threshold
    
    return Math.min(confidence, 0.95);
  }

  // Calculate overall confidence
  private calculateOverallConfidence(suggestions: AIFormSuggestion[]): number {
    if (suggestions.length === 0) return 0;
    
    const totalConfidence = suggestions.reduce((sum, suggestion) => sum + suggestion.confidence, 0);
    return totalConfidence / suggestions.length;
  }

  // Generate summary
  private generateSummary(suggestions: AIFormSuggestion[]): string {
    const filledSections = suggestions.length;
    const totalFields = 22; // Total Part 450 form fields across all 7 sections
    const completionRate = Math.round((filledSections / totalFields) * 100);
    
    if (filledSections === 0) {
      return 'No form fields were extracted from the mission description. Please provide more detailed information about your mission.';
    } else if (filledSections < 5) {
      return `Extracted information for ${filledSections} out of ${totalFields} form fields (${completionRate}% completion). Please provide more detailed mission information for better form completion.`;
    } else if (filledSections < 10) {
      return `Successfully extracted information for ${filledSections} out of ${totalFields} form fields (${completionRate}% completion). Some fields need additional details.`;
    } else {
      return `Successfully extracted information for ${filledSections} out of ${totalFields} form fields (${completionRate}% completion). Ready for review and submission.`;
    }
  }

  // Generate next steps
  private generateNextSteps(suggestions: AIFormSuggestion[]): string[] {
    const steps = [];
    
    if (suggestions.length < 5) {
      steps.push('Provide more detailed mission information for better form completion');
    }
    
    steps.push('Review extracted information for accuracy');
    steps.push('Fill in any missing sections manually');
    steps.push('Run compliance check before submission');
    
    return steps;
  }

  // Generate warnings
  private generateWarnings(suggestions: AIFormSuggestion[]): string[] {
    const warnings = [];
    
    const lowConfidenceSuggestions = suggestions.filter(s => s.confidence < 0.7);
    if (lowConfidenceSuggestions.length > 0) {
      warnings.push(`${lowConfidenceSuggestions.length} fields have low confidence - please review and verify`);
    }
    
    const missingFields = 22 - suggestions.length; // Total 22 form fields
    if (missingFields > 0) {
      warnings.push(`${missingFields} fields are missing - manual completion required`);
    }
    
    return warnings;
  }

  // Process compliance responses
  private processComplianceResponse(response: string): AIAnalysisResponse {
    return {
      suggestions: [],
      summary: response,
      confidence: 0.9,
      nextSteps: ['Review compliance recommendations', 'Address identified issues', 'Re-run compliance check']
    };
  }

  // Process analysis responses
  private processAnalysisResponse(response: string): AIAnalysisResponse {
    const { cleanContent, followUpPrompts } = this.extractFollowUpPrompts(response);
    const documentInsights = this.parseDocumentInsights(cleanContent);
    return {
      suggestions: [],
      summary: cleanContent,
      confidence: 0.8,
      nextSteps: ['Review analysis', 'Consider recommendations', 'Update application if needed'],
      followUpPrompts,
      documentInsights,
    };
  }

  // Process chat responses
  private processChatResponse(response: string): AIAnalysisResponse {
    const { cleanContent, followUpPrompts } = this.extractFollowUpPrompts(response);
    return {
      suggestions: [],
      summary: cleanContent,
      confidence: 0.9,
      nextSteps: [],
      followUpPrompts,
    };
  }

  private extractFollowUpPrompts(response: string): { cleanContent: string; followUpPrompts: string[] } {
    const followUpMatch = response.match(/FOLLOW_UP:\s*(\[[\s\S]*?\])\s*$/m);
    if (!followUpMatch) {
      return { cleanContent: response.trim(), followUpPrompts: [] };
    }

    const cleanContent = response.replace(/FOLLOW_UP:\s*\[[\s\S]*?\]\s*$/m, '').trim();
    try {
      const parsed = JSON.parse(followUpMatch[1]);
      const followUpPrompts = Array.isArray(parsed)
        ? parsed.filter((p): p is string => typeof p === 'string').slice(0, 2)
        : [];
      return { cleanContent, followUpPrompts };
    } catch {
      return { cleanContent, followUpPrompts: [] };
    }
  }

  // Stream AI response for real-time chat
  async streamUserInput(
    userInput: string,
    mode: 'chat' | 'form-fill' | 'analysis' | 'compliance' = 'chat',
    onChunk: (text: string) => void,
    copilotContext?: string,
    sourceMissionText?: string
  ): Promise<AIAnalysisResponse> {
    const messages = this.buildConversationMessages(userInput, mode, copilotContext);
    const systemPrompt = this.getSystemPrompt(mode);

    const fullText = await streamMessageWithFallback(
      this.anthropic,
      {
        max_tokens: 4096,
        messages,
        temperature: mode === 'compliance' ? 0.1 : 0.3,
        system: systemPrompt,
      },
      onChunk
    );

    const processedResponse = await this.processAIResponse(fullText, mode, sourceMissionText);
    this.updateConversationHistory(userInput, processedResponse);
    return processedResponse;
  }

  // Build document context
  private buildDocumentContext(): string {
    if (this.context.documents.length === 0) return '';

    return this.context.documents
      .map(
        (doc) =>
          `--- Document: ${doc.name} ---\n${doc.content.substring(0, 12000)}${
            doc.content.length > 12000 ? '\n[...truncated]' : ''
          }`
      )
      .join('\n\n');
  }

  private parseDocumentInsights(response: string): DocumentInsights | undefined {
    const sections: DocumentInsights = {};
    const mappings: Array<{ key: keyof DocumentInsights; patterns: RegExp[] }> = [
      {
        key: 'technicalSpecs',
        patterns: [/technical specifications?[:\s]*([\s\S]*?)(?=\n(?:mission|safety|timeline|missing|compliance|integration|$))/i],
      },
      {
        key: 'missionObjectives',
        patterns: [/mission objectives?[:\s]*([\s\S]*?)(?=\n(?:technical|safety|timeline|missing|compliance|integration|$))/i],
      },
      {
        key: 'safetyConsiderations',
        patterns: [/safety considerations?[:\s]*([\s\S]*?)(?=\n(?:technical|mission|timeline|missing|compliance|integration|$))/i],
      },
      {
        key: 'timelineInfo',
        patterns: [/timeline(?:\s+information)?[:\s]*([\s\S]*?)(?=\n(?:technical|mission|safety|missing|compliance|integration|$))/i],
      },
      {
        key: 'missingInformation',
        patterns: [/missing information[:\s]*([\s\S]*?)(?=\n(?:technical|mission|safety|timeline|compliance|integration|$))/i],
      },
      {
        key: 'complianceRequirements',
        patterns: [/compliance requirements?[:\s]*([\s\S]*?)(?=\n(?:technical|mission|safety|timeline|missing|integration|$))/i],
      },
      {
        key: 'integrationSuggestions',
        patterns: [/integration suggestions?[:\s]*([\s\S]*?)(?=\n(?:technical|mission|safety|timeline|missing|compliance|$))/i],
      },
    ];

    for (const { key, patterns } of mappings) {
      for (const pattern of patterns) {
        const match = response.match(pattern);
        if (match?.[1]) {
          const items = match[1]
            .split(/\n/)
            .map((line) => line.replace(/^[-*•\d.]+\s*/, '').trim())
            .filter((line) => line.length > 10);
          if (items.length > 0) {
            sections[key] = items.slice(0, 6);
            break;
          }
        }
      }
    }

    return Object.keys(sections).length > 0 ? sections : undefined;
  }

  // Update conversation history
  private updateConversationHistory(userInput: string, response: AIAnalysisResponse): void {
    this.context.history.push({
      role: 'user',
      content: userInput,
      timestamp: new Date()
    });
    
    this.context.history.push({
      role: 'assistant',
      content: response.summary,
      timestamp: new Date(),
      metadata: {
        confidence: response.confidence,
        action: 'ai-response'
      }
    });
    
    // Keep only last 50 messages
    if (this.context.history.length > 50) {
      this.context.history = this.context.history.slice(-50);
    }
  }

  // Generate cache key
  private generateCacheKey(userInput: string, mode: string): string {
    return `${mode}:${userInput.substring(0, 100)}:${this.context.userId}`;
  }

  // Handle errors gracefully
  private handleError(error: any): AIAnalysisResponse {
    // Log the full error for debugging
    console.error('handleError called with:', error);
    
    // Extract meaningful error message
    let errorMessage = 'I apologize, but I encountered an issue processing your request. Please try again.';
    let warningMessage = 'Service temporarily unavailable';
    
    if (error instanceof Error) {
      errorMessage = error.message || errorMessage;
      warningMessage = error.message || warningMessage;
    } else if (error?.message) {
      errorMessage = error.message;
      warningMessage = error.message;
    }
    
    return {
      suggestions: [],
      summary: errorMessage,
      confidence: 0,
      warnings: [warningMessage]
    };
  }

  // Public methods for external use
  public async chat(userInput: string): Promise<AIAnalysisResponse> {
    return this.processUserInput(userInput, 'chat');
  }

  public async fillForm(userInput: string): Promise<AIAnalysisResponse> {
    return this.processUserInput(userInput, 'form-fill');
  }

  public async checkCompliance(userInput: string): Promise<AIAnalysisResponse> {
    return this.processUserInput(userInput, 'compliance');
  }

  public async analyze(userInput: string): Promise<AIAnalysisResponse> {
    return this.processUserInput(userInput, 'analysis');
  }

  // Context management
  public updateContext(updates: Partial<ConversationContext>): void {
    this.context = { ...this.context, ...updates };
  }

  public syncConversationHistory(
    history: Array<{ sender: string; content: string }>
  ): void {
    this.context.history = history.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content,
      timestamp: new Date(),
    }));
  }

  public setApplicationContext(applicationId?: string, formSummary?: string): void {
    if (applicationId) {
      this.context.applicationId = applicationId;
    }
    if (formSummary) {
      this.context.currentSection = formSummary;
    }
  }

  public setDocuments(
    documents: Array<{ name: string; content: string }>
  ): void {
    this.context.documents = documents.map((doc, index) => ({
      id: `doc-${index}`,
      name: doc.name,
      content: doc.content,
      relevance: 0.9,
    }));
  }

  public addDocument(document: { id: string; name: string; content: string; relevance: number }): void {
    this.context.documents.push(document);
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public getContext(): ConversationContext {
    return { ...this.context };
  }
}

// Export singleton instance for easy use
let aiServiceInstance: SPLIAIService | null = null;

export function getSPLIAIService(apiKey?: string, context?: Partial<ConversationContext>): SPLIAIService {
  if (!aiServiceInstance) {
    const key = apiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) {
      console.error('ANTHROPIC_API_KEY is not set in environment variables');
      throw new Error('ANTHROPIC_API_KEY is required. Please set it in your environment variables or .env file.');
    }
    
    // Validate API key format (should start with 'sk-')
    if (!key.startsWith('sk-')) {
      console.error('ANTHROPIC_API_KEY appears to be invalid. It should start with "sk-"');
      throw new Error('Invalid API key format. Anthropic API keys should start with "sk-"');
    }
    
    aiServiceInstance = new SPLIAIService(key, context);
  }
  return aiServiceInstance;
}

// Legacy compatibility functions (for existing code)
export async function analyzeUserInput(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
  const aiService = getSPLIAIService();
  return aiService.processUserInput(request.userInput, request.mode || 'chat');
}

export async function generateFormSuggestions(userInput: string): Promise<AIFormSuggestion[]> {
  const aiService = getSPLIAIService();
  const response = await aiService.fillForm(userInput);
  return response.suggestions;
}  