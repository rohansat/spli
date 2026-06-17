import { complianceEngine } from '@/lib/compliance-engine';
import {
  PART450_SECTIONS,
  PART450_SCHEMA,
  getCrossReferencesForField,
  getSectionById,
} from '@/lib/part450-schema';
import type {
  ApplicationRecord,
  BlockingItem,
  SectionStatus,
  WorkflowReadiness,
  WorkflowSectionState,
} from '@/types/application-record';

const SUBMISSION_REQUIRED_SECTIONS = ['conops', 'vehicle', 'locations', 'launch', 'safety', 'timeline'];

function sectionCompletionPercent(
  sectionId: string,
  formData: Record<string, string>
): number {
  const section = getSectionById(sectionId);
  if (!section) return 0;
  const filled = section.fields.filter((f) => formData[f.name]?.trim()).length;
  return Math.round((filled / section.fields.length) * 100);
}

function sectionHasMinimumContent(
  sectionId: string,
  formData: Record<string, string>
): boolean {
  const section = getSectionById(sectionId);
  if (!section) return false;
  // At least one field with meaningful content
  return section.fields.some((f) => (formData[f.name]?.trim().length ?? 0) >= (f.minLength ?? 10));
}

function checkCrossReferenceAlignment(
  formData: Record<string, string>
): BlockingItem[] {
  const warnings: BlockingItem[] = [];

  const pairs: Array<{ a: string; b: string; sectionId: string; label: string }> = [
    { a: 'launchSite', b: 'siteNamesCoordinates', sectionId: 'launch', label: 'Launch Site / Coordinates' },
    { a: 'vehicleDescription', b: 'technicalSummary', sectionId: 'vehicle', label: 'Vehicle Description / Technical Summary' },
    { a: 'trajectoryOverview', b: 'flightPath', sectionId: 'launch', label: 'Trajectory / Flight Path' },
  ];

  for (const { a, b, sectionId, label } of pairs) {
    const valA = formData[a]?.trim() ?? '';
    const valB = formData[b]?.trim() ?? '';
    if (valA && valB) {
      // Simple alignment check: shared keywords or substring overlap
      const wordsA = new Set(valA.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
      const wordsB = new Set(valB.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
      const overlap = [...wordsA].filter((w) => wordsB.has(w));
      if (overlap.length < 2 && valA.length > 20 && valB.length > 20) {
        warnings.push({
          id: `xref-${a}-${b}`,
          sectionId,
          sectionTitle: getSectionById(sectionId)?.title ?? sectionId,
          message: `${label} may be misaligned — review cross-references between sections`,
          severity: 'warning',
          ownerTeam: getSectionById(sectionId)?.ownerTeam ?? 'ops',
          fieldName: a,
          fieldLabel: label,
        });
      }
    } else if (valA && !valB) {
      warnings.push({
        id: `xref-missing-${b}`,
        sectionId,
        sectionTitle: getSectionById(sectionId)?.title ?? sectionId,
        fieldName: b,
        fieldLabel: label.split(' / ')[1],
        message: `Related field "${b}" is empty but "${a}" is filled — sections may be out of sync`,
        severity: 'warning',
        ownerTeam: getSectionById(sectionId)?.ownerTeam ?? 'ops',
      });
    }
  }

  return warnings;
}

export class WorkflowEngine {
  evaluateSectionStates(
    formData: Record<string, string>,
    record?: ApplicationRecord
  ): WorkflowSectionState[] {
    return PART450_SECTIONS.map((sectionDef) => {
      const completionPercent = sectionCompletionPercent(sectionDef.id, formData);
      const hasContent = sectionHasMinimumContent(sectionDef.id, formData);

      const missingPrerequisites: string[] = [];
      for (const depId of sectionDef.dependsOn) {
        if (!sectionHasMinimumContent(depId, formData)) {
          const dep = getSectionById(depId);
          missingPrerequisites.push(dep?.title ?? depId);
        }
      }

      const prerequisitesMet = missingPrerequisites.length === 0;
      const isLocked = !prerequisitesMet;

      const recordSection = record?.sections[sectionDef.id];
      let status: SectionStatus = recordSection?.status ?? 'empty';
      if (isLocked) {
        status = 'locked';
      } else if (!hasContent) {
        status = 'empty';
      } else if (completionPercent < 100) {
        status = 'draft';
      } else {
        status = 'draft';
      }

      return {
        sectionId: sectionDef.id,
        status,
        isLocked,
        lockReason: isLocked
          ? `Complete ${missingPrerequisites.join(', ')} first`
          : undefined,
        prerequisitesMet,
        missingPrerequisites,
        completionPercent,
        ownerTeam: sectionDef.ownerTeam,
      };
    });
  }

  getLockedSections(formData: Record<string, string>): string[] {
    return this.evaluateSectionStates(formData)
      .filter((s) => s.isLocked)
      .map((s) => s.sectionId);
  }

  canEditSection(sectionId: string, formData: Record<string, string>): {
    allowed: boolean;
    reason?: string;
  } {
    const state = this.evaluateSectionStates(formData).find((s) => s.sectionId === sectionId);
    if (!state) return { allowed: true };
    if (state.isLocked) {
      return {
        allowed: false,
        reason: state.lockReason,
      };
    }
    return { allowed: true };
  }

  getBlockingItems(
    formData: Record<string, string>,
    record?: ApplicationRecord
  ): BlockingItem[] {
    const items: BlockingItem[] = [];
    const sectionStates = this.evaluateSectionStates(formData, record);

    // Prerequisite locks
    for (const state of sectionStates) {
      if (state.isLocked) {
        items.push({
          id: `lock-${state.sectionId}`,
          sectionId: state.sectionId,
          sectionTitle: getSectionById(state.sectionId)?.title ?? state.sectionId,
          message: state.lockReason ?? 'Section locked',
          severity: 'blocking',
          ownerTeam: state.ownerTeam,
        });
      }
    }

    // Incomplete required sections for submission
    for (const sectionId of SUBMISSION_REQUIRED_SECTIONS) {
      const section = getSectionById(sectionId);
      if (!section) continue;
      const completion = sectionCompletionPercent(sectionId, formData);
      if (completion < 50) {
        items.push({
          id: `incomplete-${sectionId}`,
          sectionId,
          sectionTitle: section.title,
          message: `${section.title} is only ${completion}% complete (minimum 50% required for submission)`,
          severity: 'blocking',
          ownerTeam: section.ownerTeam,
        });
      }
    }

    // Compliance critical issues
    const compliance = complianceEngine.validateApplication(formData);
    for (const issue of compliance.issues) {
      if (issue.severity === 'critical' || issue.severity === 'high') {
        const section = PART450_SECTIONS.find((s) =>
          s.fields.some((f) => f.name === issue.field)
        );
        items.push({
          id: `compliance-${issue.field}`,
          sectionId: section?.id ?? 'unknown',
          sectionTitle: section?.title ?? 'unknown',
          fieldName: issue.field,
          fieldLabel: section?.fields.find((f) => f.name === issue.field)?.label,
          message: issue.message,
          severity: issue.severity === 'critical' ? 'blocking' : 'warning',
          ownerTeam: section?.ownerTeam ?? 'ops',
        });
      }
    }

    // Cross-reference alignment warnings
    items.push(...checkCrossReferenceAlignment(formData));

    return items;
  }

  evaluateReadiness(
    formData: Record<string, string>,
    record?: ApplicationRecord
  ): WorkflowReadiness {
    const sectionStates = this.evaluateSectionStates(formData, record);
    const blockingItems = this.getBlockingItems(formData, record);
    const blocking = blockingItems.filter((i) => i.severity === 'blocking');

    const totalCompletion = sectionStates.reduce((sum, s) => sum + s.completionPercent, 0);
    const overallPercent = Math.round(totalCompletion / sectionStates.length);
    const complianceScore = complianceEngine.getComplianceScore(formData);

    const canSubmit =
      blocking.length === 0 &&
      overallPercent >= 72 &&
      complianceScore >= 70;

    let submissionGateMessage: string | undefined;
    if (!canSubmit) {
      if (blocking.length > 0) {
        submissionGateMessage = `Cannot submit: ${blocking.length} blocking item(s) must be resolved`;
      } else if (overallPercent < 72) {
        submissionGateMessage = `Application is ${overallPercent}% complete — minimum 72% required`;
      } else if (complianceScore < 70) {
        submissionGateMessage = `Compliance score is ${complianceScore}/100 — minimum 70 required`;
      }
    }

    return {
      overallPercent,
      complianceScore,
      canSubmit,
      blockingItems,
      sectionStates,
      submissionGateMessage,
    };
  }

  getCrossReferencesForField(fieldName: string) {
    return getCrossReferencesForField(fieldName);
  }
}

export const workflowEngine = new WorkflowEngine();

export { PART450_SCHEMA, SUBMISSION_REQUIRED_SECTIONS };
