// AI Service for Part 450 Form Assistance
// This service analyzes user input and generates comprehensive form field suggestions

export interface AIFormSuggestion {
  field: string;
  value: string;
  confidence: number;
  reasoning: string;
}

export interface AIAnalysisRequest {
  userInput: string;
  formFields: Array<{ name: string; label: string; type: string }>;
}

export interface AIAnalysisResponse {
  suggestions: AIFormSuggestion[];
  summary: string;
}

// Comprehensive Part 450 field mapping for all sections
const FIELD_MAPPINGS = {
  // Section 1: Concept of Operations (CONOPS)
  missionObjective: ['mission', 'objective', 'purpose', 'goal', 'aim', 'target', 'intent', 'reason'],
  vehicleDescription: ['vehicle', 'rocket', 'launcher', 'spacecraft', 'craft', 'system', 'hardware'],
  launchReentrySequence: ['launch sequence', 'reentry sequence', 'flight sequence', 'mission sequence', 'operation sequence', 'flight profile'],
  trajectoryOverview: ['trajectory', 'flight path', 'orbit', 'path', 'route', 'course', 'trajectory profile'],
  safetyConsiderations: ['safety', 'risk', 'hazard', 'protection', 'precaution', 'safety measures'],
  groundOperations: ['ground', 'launch pad', 'facility', 'infrastructure', 'support', 'ground operations'],

  // Section 2: Vehicle Overview
  technicalSummary: ['technical', 'specification', 'data sheet', 'specs', 'technical data', 'technical summary'],
  dimensionsMassStages: ['dimension', 'mass', 'weight', 'size', 'stage', 'configuration', 'physical characteristics'],
  propulsionTypes: ['propulsion', 'engine', 'motor', 'fuel', 'thrust', 'power', 'propulsion system'],
  recoverySystems: ['recovery', 'landing', 'reusable', 'return', 'retrieval', 'recovery system'],
  groundSupportEquipment: ['ground support', 'equipment', 'facility', 'infrastructure', 'support system', 'GSE'],

  // Section 3: Planned Launch/Reentry Location(s)
  siteNamesCoordinates: ['site', 'location', 'coordinates', 'latitude', 'longitude', 'facility', 'launch site'],
  siteOperator: ['operator', 'site operator', 'facility operator', 'third party', 'site management'],
  airspaceMaritimeNotes: ['airspace', 'maritime', 'flight corridor', 'exclusion zone', 'restricted area', 'airspace considerations'],

  // Section 4: Launch Information
  launchSite: ['launch site', 'launch pad', 'facility', 'location', 'launch location'],
  launchWindow: ['launch window', 'timing', 'schedule', 'window', 'launch time'],
  flightPath: ['flight path', 'trajectory', 'route', 'path', 'flight route'],
  landingSite: ['landing site', 'recovery site', 'landing location', 'recovery location'],

  // Section 5: Preliminary Risk or Safety Considerations
  earlyRiskAssessments: ['risk assessment', 'hazard analysis', 'safety analysis', 'risk evaluation', 'risk analysis'],
  publicSafetyChallenges: ['public safety', 'safety challenge', 'risk to public', 'safety concern', 'public risk'],
  plannedSafetyTools: ['safety tool', 'DEBRIS', 'SARA', 'safety software', 'risk modeling', 'safety analysis tools'],

  // Section 6: Timeline & Intent
  fullApplicationTimeline: ['timeline', 'schedule', 'deadline', 'application timeline', 'submission timeline'],
  intendedWindow: ['intended window', 'target window', 'planned window', 'launch window', 'mission window'],
  licenseTypeIntent: ['license type', 'vehicle license', 'operator license', 'mission specific', 'license intent'],

  // Section 7: List of Questions for FAA
  clarifyPart450: ['clarify', 'question', 'requirement', 'regulation', 'compliance', 'part 450'],
  uniqueTechInternational: ['unique technology', 'international', 'novel', 'innovative', 'foreign', 'unique aspects']
};

// Keywords that indicate different types of missions
const MISSION_KEYWORDS = {
  satellite: ['satellite', 'payload', 'telecommunications', 'communications', 'earth observation', 'remote sensing', 'leo', 'low earth orbit'],
  suborbital: ['suborbital', 'space tourism', 'research', 'microgravity', 'parabolic', 'space tourism'],
  orbital: ['orbital', 'low earth orbit', 'leo', 'geosynchronous', 'geo', 'medium earth orbit', 'meo', 'geostationary'],
  interplanetary: ['mars', 'moon', 'interplanetary', 'deep space', 'planetary', 'lunar', 'martian'],
  test: ['test', 'demonstration', 'prototype', 'experimental', 'validation', 'testing']
};

// Comprehensive extraction of all mission information
function extractMissionInfo(input: string): any {
  const lowerInput = input.toLowerCase();
  
  // Determine mission type
  let missionType = 'unknown';
  for (const [type, keywords] of Object.entries(MISSION_KEYWORDS)) {
    if (keywords.some(keyword => lowerInput.includes(keyword))) {
      missionType = type;
      break;
    }
  }

  // Extract comprehensive vehicle information
  const vehicleInfo = {
    hasReusableFirstStage: lowerInput.includes('reusable') || lowerInput.includes('landing') || lowerInput.includes('return'),
    isLiquidFueled: lowerInput.includes('liquid') || lowerInput.includes('fuel') || lowerInput.includes('kerosene') || lowerInput.includes('methane'),
    isSolidFueled: lowerInput.includes('solid') || lowerInput.includes('propellant'),
    hasMultipleStages: lowerInput.includes('stage') || lowerInput.includes('multi') || lowerInput.includes('two-stage') || lowerInput.includes('three-stage'),
    payloadCapacity: extractPayloadCapacity(lowerInput),
    dimensions: extractDimensions(lowerInput),
    propulsionSystem: extractPropulsionSystem(lowerInput),
    recoverySystem: extractRecoverySystem(lowerInput)
  };

  // Extract comprehensive location and timing information
  const locationInfo = {
    launchSite: extractLaunchSite(lowerInput),
    hasRecovery: lowerInput.includes('landing') || lowerInput.includes('recovery') || lowerInput.includes('return'),
    isSuborbital: missionType === 'suborbital',
    coordinates: extractCoordinates(lowerInput),
    airspaceNotes: extractAirspaceNotes(lowerInput)
  };

  // Extract timeline and intent information
  const timelineInfo = {
    launchWindow: extractLaunchWindow(lowerInput),
    applicationTimeline: extractApplicationTimeline(lowerInput),
    licenseType: extractLicenseType(lowerInput)
  };

  // Extract safety and risk information
  const safetyInfo = {
    riskAssessments: extractRiskAssessments(lowerInput),
    safetyTools: extractSafetyTools(lowerInput),
    publicSafety: extractPublicSafety(lowerInput)
  };

  return { 
    missionType, 
    vehicleInfo, 
    locationInfo, 
    timelineInfo, 
    safetyInfo,
    rawInput: input 
  };
}

function extractPayloadCapacity(input: string): string {
  const capacityMatch = input.match(/(\d+)\s*(kg|lb|ton|pound)/i);
  if (capacityMatch) {
    return `${capacityMatch[1]} ${capacityMatch[2].toLowerCase()}`;
  }
  return 'TBD';
}

function extractDimensions(input: string): string {
  const dimensionMatch = input.match(/(\d+)\s*(m|meter|ft|foot|cm|inch)/i);
  if (dimensionMatch) {
    return `${dimensionMatch[1]} ${dimensionMatch[2].toLowerCase()}`;
  }
  return 'TBD';
}

function extractPropulsionSystem(input: string): string {
  if (input.includes('liquid') && input.includes('fuel')) return 'Liquid-fueled';
  if (input.includes('solid')) return 'Solid-fueled';
  if (input.includes('hybrid')) return 'Hybrid';
  if (input.includes('electric')) return 'Electric propulsion';
  return 'TBD';
}

function extractRecoverySystem(input: string): string {
  if (input.includes('parachute')) return 'Parachute recovery system';
  if (input.includes('reusable') || input.includes('landing')) return 'Reusable landing system';
  if (input.includes('expendable')) return 'Expendable (no recovery)';
  return 'TBD';
}

function extractLaunchSite(input: string): string {
  const sites = [
    'cape canaveral', 'kennedy space center', 'ksc', 'vandenberg', 'wallops', 
    'spaceport america', 'blue origin', 'spacex', 'boca chica', 'starbase',
    'vandenberg space force base', 'wallops flight facility'
  ];
  
  for (const site of sites) {
    if (input.includes(site)) {
      return site;
    }
  }
  return 'TBD';
}

function extractCoordinates(input: string): string {
  const coordMatch = input.match(/(\d+\.?\d*)\s*[°°]\s*[NSns]\s*,?\s*(\d+\.?\d*)\s*[°°]\s*[EWew]/);
  if (coordMatch) {
    return `${coordMatch[1]}° ${coordMatch[2]}°`;
  }
  return 'TBD';
}

function extractAirspaceNotes(input: string): string {
  if (input.includes('airspace') || input.includes('flight corridor') || input.includes('exclusion zone')) {
    return 'Airspace considerations and exclusion zones will be established';
  }
  return 'TBD';
}

function extractLaunchWindow(input: string): string {
  const windowMatch = input.match(/(\d{4})|(q[1-4]\s*\d{4})|(january|february|march|april|may|june|july|august|september|october|november|december)/i);
  if (windowMatch) {
    return windowMatch[0];
  }
  return 'TBD';
}

function extractApplicationTimeline(input: string): string {
  if (input.includes('timeline') || input.includes('schedule') || input.includes('deadline')) {
    return 'Full application to be submitted within 6 months of pre-application';
  }
  return 'TBD';
}

function extractLicenseType(input: string): string {
  if (input.includes('vehicle license') || input.includes('operator license')) {
    return 'Vehicle/Operator License';
  }
  if (input.includes('mission specific') || input.includes('mission-specific')) {
    return 'Mission-Specific License';
  }
  return 'TBD';
}

function extractRiskAssessments(input: string): string {
  if (input.includes('risk') || input.includes('hazard') || input.includes('safety')) {
    return 'Comprehensive risk assessment and hazard analysis will be conducted';
  }
  return 'TBD';
}

function extractSafetyTools(input: string): string {
  if (input.includes('DEBRIS') || input.includes('SARA') || input.includes('safety tool')) {
    return 'DEBRIS, SARA, and other safety analysis tools will be utilized';
  }
  return 'TBD';
}

function extractPublicSafety(input: string): string {
  if (input.includes('public safety') || input.includes('public risk')) {
    return 'Public safety measures and exclusion zones will be established';
  }
  return 'TBD';
}

// Generate comprehensive form suggestions for all sections
function generateSuggestions(missionInfo: any, userInput: string): AIFormSuggestion[] {
  const suggestions: AIFormSuggestion[] = [];

  // Section 1: Concept of Operations (CONOPS)
  suggestions.push(...generateCONOPSSuggestions(missionInfo, userInput));
  
  // Section 2: Vehicle Overview
  suggestions.push(...generateVehicleOverviewSuggestions(missionInfo, userInput));
  
  // Section 3: Planned Launch/Reentry Location(s)
  suggestions.push(...generateLocationSuggestions(missionInfo, userInput));
  
  // Section 4: Launch Information
  suggestions.push(...generateLaunchInfoSuggestions(missionInfo, userInput));
  
  // Section 5: Preliminary Risk or Safety Considerations
  suggestions.push(...generateSafetySuggestions(missionInfo, userInput));
  
  // Section 6: Timeline & Intent
  suggestions.push(...generateTimelineSuggestions(missionInfo, userInput));
  
  // Section 7: List of Questions for FAA
  suggestions.push(...generateFAAQuestionsSuggestions(missionInfo, userInput));

  return suggestions;
}

function generateCONOPSSuggestions(missionInfo: any, userInput: string): AIFormSuggestion[] {
  const suggestions: AIFormSuggestion[] = [];
  const lowerInput = userInput.toLowerCase();

  // Mission Objective
  if (missionInfo.missionType === 'satellite') {
    suggestions.push({
      field: 'missionObjective',
      value: 'Launch a satellite payload to low Earth orbit for commercial telecommunications and data services.',
      confidence: 0.95,
      reasoning: 'Based on satellite mission keywords detected in the description.'
    });
  } else if (missionInfo.missionType === 'suborbital') {
    suggestions.push({
      field: 'missionObjective',
      value: 'Conduct suborbital flight for research, testing, or space tourism purposes.',
      confidence: 0.90,
      reasoning: 'Based on suborbital mission indicators in the description.'
    });
  } else if (missionInfo.missionType === 'orbital') {
    suggestions.push({
      field: 'missionObjective',
      value: 'Launch payload to orbital trajectory for commercial or research purposes.',
      confidence: 0.88,
      reasoning: 'Based on orbital mission indicators in the description.'
    });
  }

  // Vehicle Description
  let vehicleDesc = '';
  if (missionInfo.vehicleInfo.hasMultipleStages) {
    vehicleDesc += 'Multi-stage ';
  }
  if (missionInfo.vehicleInfo.isLiquidFueled) {
    vehicleDesc += 'liquid-fueled ';
  } else if (missionInfo.vehicleInfo.isSolidFueled) {
    vehicleDesc += 'solid-fueled ';
  }
  vehicleDesc += 'rocket';
  
  if (missionInfo.vehicleInfo.hasReusableFirstStage) {
    vehicleDesc += ' with reusable first stage';
  }
  
  if (missionInfo.vehicleInfo.payloadCapacity !== 'TBD') {
    vehicleDesc += `, capable of carrying up to ${missionInfo.vehicleInfo.payloadCapacity} to LEO`;
  }

  if (vehicleDesc) {
    suggestions.push({
      field: 'vehicleDescription',
      value: vehicleDesc + '.',
      confidence: 0.88,
      reasoning: 'Inferred from vehicle specifications mentioned in the description.'
    });
  }

  // Launch/Reentry Sequence
  if (missionInfo.vehicleInfo.hasReusableFirstStage) {
    suggestions.push({
      field: 'launchReentrySequence',
      value: 'Vertical launch from pad, first stage separation at altitude, second stage continues to orbit, first stage returns for landing and recovery.',
      confidence: 0.92,
      reasoning: 'Standard reusable rocket launch sequence based on reusable first stage mentioned.'
    });
  } else {
    suggestions.push({
      field: 'launchReentrySequence',
      value: 'Vertical launch from pad, stage separation sequence, payload deployment in target orbit.',
      confidence: 0.85,
      reasoning: 'Standard expendable rocket launch sequence.'
    });
  }

  // Trajectory Overview
  if (missionInfo.missionType === 'satellite') {
    suggestions.push({
      field: 'trajectoryOverview',
      value: 'Launch trajectory to low Earth orbit with payload deployment at target altitude and inclination.',
      confidence: 0.90,
      reasoning: 'Standard satellite launch trajectory.'
    });
  } else if (missionInfo.missionType === 'suborbital') {
    suggestions.push({
      field: 'trajectoryOverview',
      value: 'Suborbital trajectory with apogee above 100km, followed by controlled descent and recovery.',
      confidence: 0.88,
      reasoning: 'Standard suborbital flight profile.'
    });
  }

  // Safety Considerations
  suggestions.push({
    field: 'safetyConsiderations',
    value: 'Comprehensive range safety system, flight termination capability, exclusion zones established, real-time telemetry monitoring, and emergency response procedures.',
    confidence: 0.87,
    reasoning: 'Standard safety measures required for all commercial launch operations.'
  });

  // Ground Operations
  suggestions.push({
    field: 'groundOperations',
    value: 'Standard ground operations including vehicle integration, fueling, final countdown, and launch pad operations.',
    confidence: 0.85,
    reasoning: 'Standard ground operations for commercial launch.'
  });

  return suggestions;
}

function generateVehicleOverviewSuggestions(missionInfo: any, userInput: string): AIFormSuggestion[] {
  const suggestions: AIFormSuggestion[] = [];

  // Technical Summary
  suggestions.push({
    field: 'technicalSummary',
    value: `Technical specifications for ${missionInfo.missionType} launch vehicle with ${missionInfo.vehicleInfo.propulsionSystem} propulsion system.`,
    confidence: 0.85,
    reasoning: 'Based on mission type and propulsion system identified.'
  });

  // Dimensions, Mass, Stages
  if (missionInfo.vehicleInfo.hasMultipleStages) {
    suggestions.push({
      field: 'dimensionsMassStages',
      value: 'Multi-stage configuration with specific dimensions and mass properties for each stage.',
      confidence: 0.80,
      reasoning: 'Multi-stage vehicle configuration detected.'
    });
  }

  // Propulsion Types
  if (missionInfo.vehicleInfo.propulsionSystem !== 'TBD') {
    suggestions.push({
      field: 'propulsionTypes',
      value: missionInfo.vehicleInfo.propulsionSystem,
      confidence: 0.90,
      reasoning: 'Propulsion system identified from description.'
    });
  }

  // Recovery Systems
  if (missionInfo.vehicleInfo.hasReusableFirstStage) {
    suggestions.push({
      field: 'recoverySystems',
      value: 'Reusable first stage with landing and recovery capabilities.',
      confidence: 0.88,
      reasoning: 'Reusable first stage mentioned in description.'
    });
  } else {
    suggestions.push({
      field: 'recoverySystems',
      value: 'Expendable vehicle with no recovery systems.',
      confidence: 0.85,
      reasoning: 'No recovery systems mentioned, assumed expendable.'
    });
  }

  // Ground Support Equipment
  suggestions.push({
    field: 'groundSupportEquipment',
    value: 'Standard ground support equipment including fueling systems, electrical support, and launch pad infrastructure.',
    confidence: 0.80,
    reasoning: 'Standard GSE requirements for commercial launch.'
  });

  return suggestions;
}

function generateLocationSuggestions(missionInfo: any, userInput: string): AIFormSuggestion[] {
  const suggestions: AIFormSuggestion[] = [];

  // Site Names and Coordinates
  if (missionInfo.locationInfo.launchSite !== 'TBD') {
    const coordinates = getSiteCoordinates(missionInfo.locationInfo.launchSite);
    if (coordinates) {
      suggestions.push({
        field: 'siteNamesCoordinates',
        value: `${missionInfo.locationInfo.launchSite} - ${coordinates}`,
        confidence: 0.90,
        reasoning: 'Launch site and coordinates identified from description.'
      });
    }
  }

  // Site Operator
  suggestions.push({
    field: 'siteOperator',
    value: 'Site operator to be determined based on final launch site selection.',
    confidence: 0.70,
    reasoning: 'Site operator information not explicitly mentioned.'
  });

  // Airspace/Maritime Notes
  suggestions.push({
    field: 'airspaceMaritimeNotes',
    value: 'Airspace considerations and exclusion zones will be established in coordination with FAA and relevant authorities.',
    confidence: 0.85,
    reasoning: 'Standard airspace coordination requirements.'
  });

  return suggestions;
}

function generateLaunchInfoSuggestions(missionInfo: any, userInput: string): AIFormSuggestion[] {
  const suggestions: AIFormSuggestion[] = [];

  // Launch Site
  if (missionInfo.locationInfo.launchSite !== 'TBD') {
    suggestions.push({
      field: 'launchSite',
      value: missionInfo.locationInfo.launchSite,
      confidence: 0.95,
      reasoning: 'Launch site identified from the description.'
    });
  }

  // Launch Window
  if (missionInfo.timelineInfo.launchWindow !== 'TBD') {
    suggestions.push({
      field: 'launchWindow',
      value: missionInfo.timelineInfo.launchWindow,
      confidence: 0.85,
      reasoning: 'Launch window identified from description.'
    });
  }

  // Flight Path Description
  if (missionInfo.missionType === 'satellite') {
    suggestions.push({
      field: 'flightPath',
      value: 'Standard launch trajectory to low Earth orbit with payload deployment.',
      confidence: 0.88,
      reasoning: 'Standard satellite launch flight path.'
    });
  }

  // Landing/Recovery Site
  if (missionInfo.vehicleInfo.hasReusableFirstStage) {
    suggestions.push({
      field: 'landingSite',
      value: 'First stage landing site to be determined based on mission requirements.',
      confidence: 0.80,
      reasoning: 'Reusable first stage requires landing site specification.'
    });
  }

  return suggestions;
}

function generateSafetySuggestions(missionInfo: any, userInput: string): AIFormSuggestion[] {
  const suggestions: AIFormSuggestion[] = [];

  // Early Risk Assessments
  suggestions.push({
    field: 'earlyRiskAssessments',
    value: 'Comprehensive risk assessment and hazard analysis will be conducted as part of the safety review process.',
    confidence: 0.90,
    reasoning: 'Standard requirement for commercial launch operations.'
  });

  // Public Safety Challenges
  suggestions.push({
    field: 'publicSafetyChallenges',
    value: 'Public safety measures including exclusion zones and emergency procedures will be established.',
    confidence: 0.88,
    reasoning: 'Standard public safety requirements for launch operations.'
  });

  // Planned Safety Tools
  suggestions.push({
    field: 'plannedSafetyTools',
    value: 'DEBRIS, SARA, and other safety analysis tools will be utilized for comprehensive safety assessment.',
    confidence: 0.85,
    reasoning: 'Standard safety analysis tools for commercial launch.'
  });

  return suggestions;
}

function generateTimelineSuggestions(missionInfo: any, userInput: string): AIFormSuggestion[] {
  const suggestions: AIFormSuggestion[] = [];

  // Full Application Timeline
  suggestions.push({
    field: 'fullApplicationTimeline',
    value: 'Full application to be submitted within 6 months of pre-application approval.',
    confidence: 0.85,
    reasoning: 'Standard timeline for Part 450 applications.'
  });

  // Intended Launch Window
  if (missionInfo.timelineInfo.launchWindow !== 'TBD') {
    suggestions.push({
      field: 'intendedWindow',
      value: missionInfo.timelineInfo.launchWindow,
      confidence: 0.80,
      reasoning: 'Launch window identified from description.'
    });
  }

  // License Type Intent
  suggestions.push({
    field: 'licenseTypeIntent',
    value: 'Mission-specific license for this launch operation.',
    confidence: 0.75,
    reasoning: 'Standard license type for initial applications.'
  });

  return suggestions;
}

function generateFAAQuestionsSuggestions(missionInfo: any, userInput: string): AIFormSuggestion[] {
  const suggestions: AIFormSuggestion[] = [];

  // Clarify Part 450 Requirements
  suggestions.push({
    field: 'clarifyPart450',
    value: 'Seek clarification on specific Part 450 requirements and compliance procedures for this mission type.',
    confidence: 0.80,
    reasoning: 'Standard request for Part 450 clarification.'
  });

  // Unique Tech or International Aspects
  suggestions.push({
    field: 'uniqueTechInternational',
    value: 'No unique technology or international aspects identified at this time.',
    confidence: 0.70,
    reasoning: 'No unique aspects mentioned in description.'
  });

  return suggestions;
}

function getSiteCoordinates(site: string): string | null {
  const siteCoordinates: Record<string, string> = {
    'cape canaveral': '28.5729° N, 80.6490° W',
    'kennedy space center': '28.5729° N, 80.6490° W',
    'vandenberg': '34.6483° N, 120.6018° W',
    'wallops': '37.9401° N, 75.4706° W',
    'spaceport america': '32.9904° N, 106.9751° W',
    'boca chica': '25.9961° N, 97.1553° W'
  };
  
  return siteCoordinates[site.toLowerCase()] || null;
}

// Real AI analysis using Anthropic API
export async function analyzeUserInput(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
  const { userInput, formFields } = request;
  
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userInput,
        context: `Available form fields: ${formFields.map(f => f.name).join(', ')}`,
        mode: 'form',
        conversationHistory: []
      }),
    });

    if (!response.ok) {
      throw new Error('AI API request failed');
    }

    const data = await response.json();
    
    // Enhanced response handling
    if (data.suggestions && data.suggestions.length > 0) {
      return {
        suggestions: data.suggestions,
        summary: `AI analyzed mission description and extracted information for ${data.suggestions.length} Part 450 application sections.`
      };
    } else {
      // Fallback to local analysis if AI didn't provide structured suggestions
      const missionInfo = extractMissionInfo(userInput);
      const localSuggestions = generateSuggestions(missionInfo, userInput);
      
      return {
        suggestions: localSuggestions,
        summary: `Local analysis completed with ${localSuggestions.length} field suggestions.`
      };
    }
  } catch (error) {
    console.error('AI Analysis Error:', error);
    // Fallback to local analysis
    const missionInfo = extractMissionInfo(userInput);
    const localSuggestions = generateSuggestions(missionInfo, userInput);
    
    return {
      suggestions: localSuggestions,
      summary: 'Local analysis completed with fallback suggestions due to AI service error.'
    };
  }
}

// Mock AI service for development (now uses real API)
export async function mockAIAnalysis(userInput: string): Promise<AIAnalysisResponse> {
  // Use the real analysis function
  return analyzeUserInput({
    userInput,
    formFields: []
  });
} 