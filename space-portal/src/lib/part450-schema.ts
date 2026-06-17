import type { CrossReference, TeamOwner } from '@/types/application-record';
import { part450FormTemplate } from '@/lib/mock-data';

export interface Part450FieldDef {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'email' | 'select';
  minLength?: number;
  required?: boolean;
}

export interface Part450SectionDef {
  id: string;
  title: string;
  ownerTeam: TeamOwner;
  fields: Part450FieldDef[];
  /** Section IDs that must reach at least `draft` before this section unlocks */
  dependsOn: string[];
  crossReferences: CrossReference[];
}

const CROSS_REFS: CrossReference[] = [
  {
    sourceField: 'safetyConsiderations',
    targetField: 'earlyRiskAssessments',
    relationship: 'must_align',
    description: 'CONOPS safety considerations should align with preliminary risk assessments',
  },
  {
    sourceField: 'trajectoryOverview',
    targetField: 'flightPath',
    relationship: 'must_align',
    description: 'Trajectory overview must be consistent with flight path description',
  },
  {
    sourceField: 'trajectoryOverview',
    targetField: 'publicSafetyChallenges',
    relationship: 'informs',
    description: 'Trajectory drives public safety challenge identification',
  },
  {
    sourceField: 'vehicleDescription',
    targetField: 'technicalSummary',
    relationship: 'must_align',
    description: 'Vehicle description must match technical summary specifications',
  },
  {
    sourceField: 'vehicleDescription',
    targetField: 'dimensionsMassStages',
    relationship: 'must_align',
    description: 'Vehicle dimensions and mass must be consistent across sections',
  },
  {
    sourceField: 'siteNamesCoordinates',
    targetField: 'launchSite',
    relationship: 'must_align',
    description: 'Launch site must match planned location coordinates',
  },
  {
    sourceField: 'safetyConsiderations',
    targetField: 'plannedSafetyTools',
    relationship: 'informs',
    description: 'Safety tools (DEBRIS, SARA) should address CONOPS safety considerations',
  },
  {
    sourceField: 'propulsionTypes',
    targetField: 'launchReEntrySequence',
    relationship: 'informs',
    description: 'Propulsion type informs launch/reentry sequence',
  },
];

const SECTION_META: Array<{ id: string; ownerTeam: TeamOwner; dependsOn: string[] }> = [
  { id: 'conops', ownerTeam: 'ops', dependsOn: [] },
  { id: 'vehicle', ownerTeam: 'structures', dependsOn: ['conops'] },
  { id: 'locations', ownerTeam: 'ops', dependsOn: ['conops'] },
  { id: 'launch', ownerTeam: 'gnc', dependsOn: ['conops', 'vehicle', 'locations'] },
  { id: 'safety', ownerTeam: 'safety', dependsOn: ['conops', 'vehicle'] },
  { id: 'timeline', ownerTeam: 'ops', dependsOn: ['conops'] },
  { id: 'faa_questions', ownerTeam: 'legal', dependsOn: ['conops', 'vehicle', 'safety', 'launch'] },
];

const SECTION_IDS = SECTION_META.map((s) => s.id);

function fieldsForSection(sectionIndex: number): Part450FieldDef[] {
  return part450FormTemplate.sections[sectionIndex].fields.map((f) => ({
    name: f.name,
    label: f.label,
    type: f.type as Part450FieldDef['type'],
    required: true,
    minLength: f.type === 'text' ? 10 : 30,
  }));
}

export const PART450_SECTIONS: Part450SectionDef[] = part450FormTemplate.sections.map(
  (section, index) => {
    const meta = SECTION_META[index];
    const fieldNames = new Set(section.fields.map((f) => f.name));
    return {
      id: meta.id,
      title: section.title.replace(/\n/g, ' '),
      ownerTeam: meta.ownerTeam,
      dependsOn: meta.dependsOn,
      fields: fieldsForSection(index),
      crossReferences: CROSS_REFS.filter(
        (ref) => fieldNames.has(ref.sourceField) || fieldNames.has(ref.targetField)
      ),
    };
  }
);

export const PART450_SCHEMA = {
  sections: PART450_SECTIONS,
  sectionIds: SECTION_IDS,
  totalFields: PART450_SECTIONS.reduce((sum, s) => sum + s.fields.length, 0),
};

export function getSectionByField(fieldName: string): Part450SectionDef | undefined {
  return PART450_SECTIONS.find((s) => s.fields.some((f) => f.name === fieldName));
}

export function getSectionById(sectionId: string): Part450SectionDef | undefined {
  return PART450_SECTIONS.find((s) => s.id === sectionId);
}

export function getCrossReferencesForField(fieldName: string): CrossReference[] {
  return CROSS_REFS.filter(
    (ref) => ref.sourceField === fieldName || ref.targetField === fieldName
  );
}

export function flatFormDataFromSections(
  sections: Record<string, { fields: Record<string, string> }>
): Record<string, string> {
  const flat: Record<string, string> = {};
  for (const section of Object.values(sections)) {
    Object.assign(flat, section.fields);
  }
  return flat;
}

export function sectionsFromFlatFormData(
  formData: Record<string, string>
): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};
  for (const section of PART450_SECTIONS) {
    result[section.id] = {};
    for (const field of section.fields) {
      if (formData[field.name]) {
        result[section.id][field.name] = formData[field.name];
      }
    }
  }
  return result;
}

export const TEAM_LABELS: Record<TeamOwner, string> = {
  gnc: 'GNC',
  structures: 'Structures',
  ops: 'Operations',
  safety: 'Safety',
  legal: 'Legal',
  propulsion: 'Propulsion',
};
