import type { FormSuggestion } from '@/components/ui/ai-chat-message';

const HEADER_TO_FIELD: Record<string, string> = {
  'mission objective': 'missionObjective',
  missionobjective: 'missionObjective',
  objective: 'missionObjective',
  'vehicle description': 'vehicleDescription',
  vehicledescription: 'vehicleDescription',
  vehicle: 'vehicleDescription',
  'launch reentry sequence': 'launchReEntrySequence',
  'launch/reentry sequence': 'launchReEntrySequence',
  launchreentrysequence: 'launchReEntrySequence',
  'launch sequence': 'launchReEntrySequence',
  'reentry sequence': 'launchReEntrySequence',
  'trajectory overview': 'trajectoryOverview',
  trajectoryoverview: 'trajectoryOverview',
  trajectory: 'trajectoryOverview',
  'safety considerations': 'safetyConsiderations',
  safetyconsiderations: 'safetyConsiderations',
  safety: 'safetyConsiderations',
  'ground operations': 'groundOperations',
  groundoperations: 'groundOperations',
  'ground ops': 'groundOperations',
  'technical summary': 'technicalSummary',
  technicalsummary: 'technicalSummary',
  technical: 'technicalSummary',
  'dimensions mass stages': 'dimensionsMassStages',
  'dimensions/mass/stages': 'dimensionsMassStages',
  dimensionsmassstages: 'dimensionsMassStages',
  dimensions: 'dimensionsMassStages',
  'mass stages': 'dimensionsMassStages',
  'propulsion types': 'propulsionTypes',
  propulsiontypes: 'propulsionTypes',
  propulsion: 'propulsionTypes',
  'recovery systems': 'recoverySystems',
  recoverysystems: 'recoverySystems',
  recovery: 'recoverySystems',
  'ground support equipment': 'groundSupportEquipment',
  groundsupportequipment: 'groundSupportEquipment',
  'ground support': 'groundSupportEquipment',
  'site names coordinates': 'siteNamesCoordinates',
  'site names/coordinates': 'siteNamesCoordinates',
  sitenamescoordinates: 'siteNamesCoordinates',
  'site coordinates': 'siteNamesCoordinates',
  coordinates: 'siteNamesCoordinates',
  'site operator': 'siteOperator',
  siteoperator: 'siteOperator',
  operator: 'siteOperator',
  'airspace maritime notes': 'airspaceMaritimeNotes',
  'airspace/maritime notes': 'airspaceMaritimeNotes',
  airspacemaritimenotes: 'airspaceMaritimeNotes',
  'airspace notes': 'airspaceMaritimeNotes',
  'maritime notes': 'airspaceMaritimeNotes',
  'launch site': 'launchSite',
  launchsite: 'launchSite',
  'launch location': 'launchSite',
  'launch window': 'launchWindow',
  launchwindow: 'launchWindow',
  window: 'launchWindow',
  'flight path': 'flightPath',
  flightpath: 'flightPath',
  path: 'flightPath',
  'landing site': 'landingSite',
  landingsite: 'landingSite',
  'landing location': 'landingSite',
  'early risk assessments': 'earlyRiskAssessments',
  earlyriskassessments: 'earlyRiskAssessments',
  'risk assessments': 'earlyRiskAssessments',
  'public safety challenges': 'publicSafetyChallenges',
  publicsafetychallenges: 'publicSafetyChallenges',
  'public safety': 'publicSafetyChallenges',
  'planned safety tools': 'plannedSafetyTools',
  plannedsafetytools: 'plannedSafetyTools',
  'safety tools': 'plannedSafetyTools',
  'full application timeline': 'fullApplicationTimeline',
  fullapplicationtimeline: 'fullApplicationTimeline',
  timeline: 'fullApplicationTimeline',
  'intended window': 'intendedWindow',
  intendedwindow: 'intendedWindow',
  'license type intent': 'licenseTypeIntent',
  licensetypeintent: 'licenseTypeIntent',
  'license intent': 'licenseTypeIntent',
  'license type': 'licenseTypeIntent',
  'clarify part450': 'clarifyPart450',
  'clarify part 450': 'clarifyPart450',
  clarifypart450: 'clarifyPart450',
  part450: 'clarifyPart450',
  'part 450': 'clarifyPart450',
  'unique tech international': 'uniqueTechInternational',
  'unique tech/international': 'uniqueTechInternational',
  uniquetechinternational: 'uniqueTechInternational',
  'unique tech': 'uniqueTechInternational',
  international: 'uniqueTechInternational',
};

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[#*_\s]+/g, ' ').trim();
}

function resolveField(header: string): string | undefined {
  const norm = normalizeHeader(header);
  if (HEADER_TO_FIELD[norm]) return HEADER_TO_FIELD[norm];
  for (const [key, fieldName] of Object.entries(HEADER_TO_FIELD)) {
    const keyNorm = key.replace(/\//g, ' ');
    if (norm === keyNorm || norm.includes(keyNorm) || keyNorm.includes(norm)) {
      return fieldName;
    }
  }
  return undefined;
}

export function extractFormFieldsFromText(text: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const lines = text.split('\n');
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
    if (content && content.length >= 8 && !/^information not provided$/i.test(content)) {
      sections[field] = content;
    }
  }

  return sections;
}

export function extractFormSuggestionsFromText(text: string): FormSuggestion[] {
  return Object.entries(extractFormFieldsFromText(text)).map(([field, value]) => ({
    field,
    value,
    confidence: 0.72,
    reasoning: 'Extracted from AI response text',
  }));
}
