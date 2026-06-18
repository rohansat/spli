export type ChangeSource = 'user' | 'ai_suggestion' | 'faa_request' | 'rollback';

export interface SectionInconsistency {
  id: string;
  severity: 'blocking' | 'warning';
  message: string;
  sectionTitle: string;
  fieldName?: string;
  fieldLabel?: string;
}

export interface FAAReviewerComment {
  id: string;
  text: string;
  relatedFields: string[];
  status: 'open' | 'addressed';
  createdAt: string;
  addressedAt?: string;
}

export interface ChangeEvent {
  id: string;
  fieldName: string;
  fieldLabel: string;
  previousValue: string;
  newValue: string;
  source: ChangeSource;
  attribution?: string;
  faaCommentId?: string;
  aiSuggestionId?: string;
  timestamp: string;
}

export interface AISuggestionRecord {
  id: string;
  field: string;
  fieldLabel: string;
  suggestedValue: string;
  status: 'pending' | 'applied' | 'modified' | 'dismissed';
  appliedValue?: string;
  timestamp: string;
  messageId?: string;
}

export interface CopilotState {
  faaComments: FAAReviewerComment[];
  changeHistory: ChangeEvent[];
  aiSuggestions: AISuggestionRecord[];
  updatedAt: string;
}
