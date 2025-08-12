// Professional AI Service for SPLI - Space Portal Licensing Interface
// High-end AI assistant for FAA Part 450 license applications

import Anthropic from '@anthropic-ai/sdk';

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

export interface AIAnalysisResponse {
  suggestions: AIFormSuggestion[];
  summary: string;
  confidence: number;
  nextSteps?: string[];
  warnings?: string[];
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
      // Check cache first
      const cacheKey = this.generateCacheKey(userInput, mode);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // Build conversation context
      const messages = this.buildConversationMessages(userInput, mode);
      
      // Get AI response
      const response = await this.getAIResponse(messages, mode);
      
      // Process and validate response
      const processedResponse = await this.processAIResponse(response, mode);
      
      // Cache result
      this.cache.set(cacheKey, processedResponse);
      
      // Update conversation history
      this.updateConversationHistory(userInput, processedResponse);
      
      return processedResponse;
    } catch (error) {
      console.error('AI processing error:', error);
      return this.handleError(error);
    }
  }

  // Build sophisticated conversation messages
  private buildConversationMessages(userInput: string, mode: string): Array<{ role: 'user' | 'assistant'; content: string }> {
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
- Intelligent form filling for Part 450 applications
- Regulatory compliance analysis and validation
- Document analysis and information extraction
- Professional guidance on space licensing
- Real-time compliance checking and suggestions

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
When users provide mission descriptions, extract ALL relevant information and populate Part 450 form sections:

REQUIRED SECTIONS:
1. MISSION OBJECTIVE - Purpose, goals, intended outcomes
2. VEHICLE DESCRIPTION - Rocket type, stages, propulsion, specifications
3. LAUNCH SEQUENCE - Flight profile, stages, trajectory
4. TECHNICAL SUMMARY - Payload details, systems, capabilities
5. SAFETY CONSIDERATIONS - Risk assessments, safety measures
6. GROUND OPERATIONS - Facilities, procedures, support equipment
7. LAUNCH SITE - Location, coordinates, facility details
8. TIMELINE - Launch windows, mission duration, schedules
9. LICENSE TYPE - Appropriate license classification

RESPONSE FORMAT:
- Structured, professional language
- Complete sections even if information is missing
- Use "Information not provided" for missing details
- Include confidence levels for extracted information
- Provide next steps and recommendations`;

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
- Strategic recommendations`;

      default:
        return `${basePrompt}

CHAT MODE:
Engage in professional conversation about:
- Space missions and aerospace technology
- FAA licensing processes and requirements
- Industry trends and developments
- Best practices and recommendations
- General questions and guidance

Always maintain professional expertise while being helpful and engaging.`;
    }
  }

  // Get AI response with proper error handling
  private async getAIResponse(messages: Array<{ role: 'user' | 'assistant'; content: string }>, mode: string): Promise<string> {
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: messages,
        temperature: mode === 'compliance' ? 0.1 : 0.3, // Lower temperature for compliance
        system: this.getSystemPrompt(mode)
      });

      return response.content[0].type === 'text' ? response.content[0].text : '';
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error('AI service temporarily unavailable. Please try again.');
    }
  }

  // Process AI response intelligently
  private async processAIResponse(response: string, mode: string): Promise<AIAnalysisResponse> {
    try {
      switch (mode) {
        case 'form-fill':
          return this.processFormFillResponse(response);
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
  private processFormFillResponse(response: string): AIAnalysisResponse {
    const suggestions: AIFormSuggestion[] = [];
    const sections = this.extractFormSections(response);
    
    // Process each section
    Object.entries(sections).forEach(([section, content]) => {
      if (content && content !== 'Information not provided') {
        suggestions.push({
          field: section,
          value: content,
          confidence: this.calculateConfidence(content),
          reasoning: `Extracted from user input based on ${section.toLowerCase()} requirements`,
          source: 'ai-extraction'
        });
      }
    });

    return {
      suggestions,
      summary: this.generateSummary(suggestions),
      confidence: this.calculateOverallConfidence(suggestions),
      nextSteps: this.generateNextSteps(suggestions),
      warnings: this.generateWarnings(suggestions)
    };
  }

  // Extract form sections from AI response
  private extractFormSections(response: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const sectionRegex = /^([A-Z\s]+):\s*(.+?)(?=\n[A-Z\s]+:|$)/gm;
    
    let match;
    while ((match = sectionRegex.exec(response)) !== null) {
      const sectionName = match[1].trim().toLowerCase().replace(/\s+/g, '');
      const content = match[2].trim();
      sections[sectionName] = content;
    }
    
    return sections;
  }

  // Calculate confidence for extracted information
  private calculateConfidence(content: string): number {
    if (!content || content === 'Information not provided') return 0;
    
    // Simple confidence calculation based on content quality
    let confidence = 0.5; // Base confidence
    
    // Increase confidence for specific details
    if (content.includes('kg') || content.includes('meters') || content.includes('km')) confidence += 0.2;
    if (content.includes('Falcon') || content.includes('Electron') || content.includes('rocket')) confidence += 0.2;
    if (content.includes('Cape Canaveral') || content.includes('Vandenberg')) confidence += 0.1;
    if (content.length > 50) confidence += 0.1;
    
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
    const totalSections = 9; // Total Part 450 sections
    const completionRate = Math.round((filledSections / totalSections) * 100);
    
    return `Successfully extracted information for ${filledSections} out of ${totalSections} Part 450 sections (${completionRate}% completion). Ready for review and submission.`;
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
      warnings.push(`${lowConfidenceSuggestions.length} sections have low confidence - please review and verify`);
    }
    
    const missingSections = 9 - suggestions.length;
    if (missingSections > 0) {
      warnings.push(`${missingSections} sections are missing - manual completion required`);
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
    return {
      suggestions: [],
      summary: response,
      confidence: 0.8,
      nextSteps: ['Review analysis', 'Consider recommendations', 'Update application if needed']
    };
  }

  // Process chat responses
  private processChatResponse(response: string): AIAnalysisResponse {
    return {
      suggestions: [],
      summary: response,
      confidence: 0.9,
      nextSteps: []
    };
  }

  // Build document context
  private buildDocumentContext(): string {
    if (this.context.documents.length === 0) return '';
    
    return this.context.documents
      .filter(doc => doc.relevance > 0.5)
      .map(doc => `${doc.name}: ${doc.content.substring(0, 200)}...`)
      .join('\n');
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
    return {
      suggestions: [],
      summary: 'I apologize, but I encountered an issue processing your request. Please try again.',
      confidence: 0,
      warnings: ['Service temporarily unavailable']
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
      throw new Error('ANTHROPIC_API_KEY is required');
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