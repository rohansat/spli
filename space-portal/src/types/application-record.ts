/** System of Record — structured application entities with version history */

export type TeamOwner = 'gnc' | 'structures' | 'ops' | 'safety' | 'legal' | 'propulsion';

export type SectionStatus = 'empty' | 'draft' | 'in_review' | 'approved' | 'locked';

export interface FieldAuthorship {
  fieldName: string;
  lastModifiedBy: string;
  lastModifiedByName?: string;
  lastModifiedAt: string;
}

export interface CrossReference {
  sourceField: string;
  targetField: string;
  relationship: 'informs' | 'must_align' | 'depends_on';
  description: string;
}

export interface ApplicationSection {
  id: string;
  title: string;
  status: SectionStatus;
  fields: Record<string, string>;
  authorship: Record<string, FieldAuthorship>;
  version: number;
  lastModifiedAt: string;
  lastModifiedBy: string;
  ownerTeam: TeamOwner;
  crossReferences: CrossReference[];
}

export interface FieldDiff {
  sectionId: string;
  fieldName: string;
  fieldLabel: string;
  previousValue: string;
  newValue: string;
  changeType: 'added' | 'modified' | 'removed';
}

export interface ApplicationVersion {
  id: string;
  version: number;
  timestamp: string;
  author: string;
  authorName?: string;
  changeSummary: string;
  fieldDiffs: FieldDiff[];
  sectionsSnapshot: Record<string, { fields: Record<string, string>; status: SectionStatus }>;
}

export interface ApplicationRecord {
  id: string;
  applicationId: string;
  userEmail: string;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
  sections: Record<string, ApplicationSection>;
}

export interface WorkflowSectionState {
  sectionId: string;
  status: SectionStatus;
  isLocked: boolean;
  lockReason?: string;
  prerequisitesMet: boolean;
  missingPrerequisites: string[];
  completionPercent: number;
  ownerTeam: TeamOwner;
}

export interface BlockingItem {
  id: string;
  sectionId: string;
  sectionTitle: string;
  fieldName?: string;
  fieldLabel?: string;
  message: string;
  severity: 'blocking' | 'warning';
  ownerTeam: TeamOwner;
}

export interface WorkflowReadiness {
  overallPercent: number;
  complianceScore: number;
  canSubmit: boolean;
  blockingItems: BlockingItem[];
  sectionStates: WorkflowSectionState[];
  submissionGateMessage?: string;
}
