// AI Service for Part 450 Form Assistance
// This service analyzes user input and generates form field suggestions

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

// Part 450 field mapping for better AI understanding
const FIELD_MAPPINGS = {
  // Concept of Operations
  missionObjective: ['mission', 'objective', 'purpose', 'goal', 'aim', 'target'],
  vehicleDescription: ['vehicle', 'rocket', 'launcher', 'spacecraft', 'craft', 'system'],
  launchReentrySequence: ['launch sequence', 'reentry sequence', 'flight sequence', 'mission sequence', 'operation sequence'],
  trajectoryOverview: ['trajectory', 'flight path', 'orbit', 'path', 'route'],
  safetyConsiderations: ['safety', 'risk', 'hazard', 'protection', 'precaution'],
  groundOperations: ['ground', 'launch pad', 'facility', 'infrastructure', 'support'],

  // Vehicle Overview
  technicalSummary: ['technical', 'specification', 'data sheet', 'specs', 'technical data'],
  dimensionsMassStages: ['dimension', 'mass', 'weight', 'size', 'stage', 'configuration'],
  propulsionTypes: ['propulsion', 'engine', 'motor', 'fuel', 'thrust', 'power'],
  recoverySystems: ['recovery', 'landing', 'reusable', 'return', 'retrieval'],
  groundSupportEquipment: ['ground support', 'equipment', 'facility', 'infrastructure', 'support system'],

  // Launch/Reentry Locations
  siteNamesCoordinates: ['site', 'location', 'coordinates', 'latitude', 'longitude', 'facility'],
  siteOperator: ['operator', 'site operator', 'facility operator', 'third party'],
  airspaceMaritimeNotes: ['airspace', 'maritime', 'flight corridor', 'exclusion zone', 'restricted area'],

  // Launch Information
  launchSite: ['launch site', 'launch pad', 'facility', 'location'],
  launchWindow: ['launch window', 'timing', 'schedule', 'window'],
  flightPath: ['flight path', 'trajectory', 'route', 'path'],
  landingSite: ['landing site', 'recovery site', 'landing location'],

  // Risk/Safety
  earlyRiskAssessments: ['risk assessment', 'hazard analysis', 'safety analysis', 'risk evaluation'],
  publicSafetyChallenges: ['public safety', 'safety challenge', 'risk to public', 'safety concern'],
  plannedSafetyTools: ['safety tool', 'DEBRIS', 'SARA', 'safety software', 'risk modeling'],

  // Timeline & Intent
  fullApplicationTimeline: ['timeline', 'schedule', 'deadline', 'application timeline'],
  intendedWindow: ['intended window', 'target window', 'planned window', 'launch window'],
  licenseTypeIntent: ['license type', 'vehicle license', 'operator license', 'mission specific'],

  // Questions for FAA
  clarifyPart450: ['clarify', 'question', 'requirement', 'regulation', 'compliance'],
  uniqueTechInternational: ['unique technology', 'international', 'novel', 'innovative', 'foreign']
};

// Keywords that indicate different types of missions
const MISSION_KEYWORDS = {
  satellite: ['satellite', 'payload', 'telecommunications', 'communications', 'earth observation', 'remote sensing'],
  suborbital: ['suborbital', 'space tourism', 'research', 'microgravity', 'parabolic'],
  orbital: ['orbital', 'low earth orbit', 'leo', 'geosynchronous', 'geo', 'medium earth orbit', 'meo'],
  interplanetary: ['mars', 'moon', 'interplanetary', 'deep space', 'planetary'],
  test: ['test', 'demonstration', 'prototype', 'experimental', 'validation']
};

// Extract relevant information from user input
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

  // Extract vehicle information
  const vehicleInfo = {
    hasReusableFirstStage: lowerInput.includes('reusable') || lowerInput.includes('landing'),
    isLiquidFueled: lowerInput.includes('liquid') || lowerInput.includes('fuel'),
    isSolidFueled: lowerInput.includes('solid'),
    hasMultipleStages: lowerInput.includes('stage') || lowerInput.includes('multi'),
    payloadCapacity: extractPayloadCapacity(lowerInput)
  };

  // Extract location information
  const locationInfo = {
    launchSite: extractLaunchSite(lowerInput),
    hasRecovery: lowerInput.includes('landing') || lowerInput.includes('recovery'),
    isSuborbital: missionType === 'suborbital'
  };

  return { missionType, vehicleInfo, locationInfo };
}

function extractPayloadCapacity(input: string): string {
  const capacityMatch = input.match(/(\d+)\s*(kg|lb|ton)/i);
  if (capacityMatch) {
    return `${capacityMatch[1]} ${capacityMatch[2].toLowerCase()}`;
  }
  return 'TBD';
}

function extractLaunchSite(input: string): string {
  const sites = [
    'cape canaveral', 'kennedy space center', 'vandenberg', 'wallops', 
    'spaceport america', 'blue origin', 'spacex', 'boca chica'
  ];
  
  for (const site of sites) {
    if (input.includes(site)) {
      return site;
    }
  }
  return 'TBD';
}

// Generate form suggestions based on extracted information
function generateSuggestions(missionInfo: any, userInput: string): AIFormSuggestion[] {
  const suggestions: AIFormSuggestion[] = [];

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

  // Safety Considerations
  suggestions.push({
    field: 'safetyConsiderations',
    value: 'Comprehensive range safety system, flight termination capability, exclusion zones established, real-time telemetry monitoring, and emergency response procedures.',
    confidence: 0.87,
    reasoning: 'Standard safety measures required for all commercial launch operations.'
  });

  // Launch Site
  if (missionInfo.locationInfo.launchSite !== 'TBD') {
    suggestions.push({
      field: 'launchSite',
      value: missionInfo.locationInfo.launchSite,
      confidence: 0.95,
      reasoning: 'Launch site identified from the description.'
    });
  }

  // Site Names and Coordinates
  if (missionInfo.locationInfo.launchSite !== 'TBD') {
    const coordinates = getSiteCoordinates(missionInfo.locationInfo.launchSite);
    if (coordinates) {
      suggestions.push({
        field: 'siteNamesCoordinates',
        value: `${missionInfo.locationInfo.launchSite} - ${coordinates}`,
        confidence: 0.90,
        reasoning: 'Coordinates for the identified launch site.'
      });
    }
  }

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

// Main AI analysis function
export async function analyzeUserInput(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
  const { userInput, formFields } = request;
  
  // Extract mission information from user input
  const missionInfo = extractMissionInfo(userInput);
  
  // Generate suggestions based on extracted information
  const suggestions = generateSuggestions(missionInfo, userInput);
  
  // Create a summary
  const summary = `Analyzed mission description for ${missionInfo.missionType} mission with ${suggestions.length} field suggestions generated.`;
  
  return {
    suggestions,
    summary
  };
}

// Mock AI service for development (replace with actual AI API)
export async function mockAIAnalysis(userInput: string): Promise<AIAnalysisResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Use the actual analysis logic
  return analyzeUserInput({
    userInput,
    formFields: []
  });
} 