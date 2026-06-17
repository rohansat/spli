import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  PART450_SECTIONS,
  sectionsFromFlatFormData,
  flatFormDataFromSections,
} from '@/lib/part450-schema';
import type {
  ApplicationRecord,
  ApplicationSection,
  ApplicationVersion,
  FieldDiff,
  SectionStatus,
} from '@/types/application-record';

function recordDocId(userEmail: string, applicationId: string) {
  return `${userEmail}_${applicationId}`;
}

function emptySection(
  sectionDef: (typeof PART450_SECTIONS)[0],
  author: string
): ApplicationSection {
  return {
    id: sectionDef.id,
    title: sectionDef.title,
    status: 'empty',
    fields: {},
    authorship: {},
    version: 0,
    lastModifiedAt: new Date().toISOString(),
    lastModifiedBy: author,
    ownerTeam: sectionDef.ownerTeam,
    crossReferences: sectionDef.crossReferences,
  };
}

function deriveSectionStatus(fields: Record<string, string>, fieldDefs: typeof PART450_SECTIONS[0]['fields']): SectionStatus {
  const requiredFields = fieldDefs.filter((f) => f.required);
  const filled = requiredFields.filter((f) => fields[f.name]?.trim());
  if (filled.length === 0) return 'empty';
  if (filled.length < requiredFields.length) return 'draft';
  return 'draft';
}

function computeFieldDiffs(
  previous: ApplicationRecord,
  next: ApplicationRecord
): FieldDiff[] {
  const diffs: FieldDiff[] = [];

  for (const sectionDef of PART450_SECTIONS) {
    const prevSection = previous.sections[sectionDef.id];
    const nextSection = next.sections[sectionDef.id];

    for (const fieldDef of sectionDef.fields) {
      const prevVal = prevSection?.fields[fieldDef.name] ?? '';
      const nextVal = nextSection?.fields[fieldDef.name] ?? '';

      if (prevVal === nextVal) continue;

      let changeType: FieldDiff['changeType'] = 'modified';
      if (!prevVal && nextVal) changeType = 'added';
      if (prevVal && !nextVal) changeType = 'removed';

      diffs.push({
        sectionId: sectionDef.id,
        fieldName: fieldDef.name,
        fieldLabel: fieldDef.label,
        previousValue: prevVal,
        newValue: nextVal,
        changeType,
      });
    }
  }

  return diffs;
}

function buildChangeSummary(diffs: FieldDiff[]): string {
  if (diffs.length === 0) return 'No field changes';
  if (diffs.length === 1) {
    return `Updated ${diffs[0].fieldLabel}`;
  }
  const sections = [...new Set(diffs.map((d) => d.sectionId))];
  return `Updated ${diffs.length} fields across ${sections.length} section(s)`;
}

export function createEmptyRecord(
  applicationId: string,
  userEmail: string,
  authorName?: string
): ApplicationRecord {
  const now = new Date().toISOString();
  const sections: Record<string, ApplicationSection> = {};

  for (const sectionDef of PART450_SECTIONS) {
    sections[sectionDef.id] = emptySection(sectionDef, userEmail);
  }

  return {
    id: recordDocId(userEmail, applicationId),
    applicationId,
    userEmail,
    currentVersion: 0,
    createdAt: now,
    updatedAt: now,
    sections,
  };
}

export function recordFromFlatFormData(
  applicationId: string,
  userEmail: string,
  formData: Record<string, string>,
  existing?: ApplicationRecord
): ApplicationRecord {
  const now = new Date().toISOString();
  const sectionFields = sectionsFromFlatFormData(formData);
  const base = existing ?? createEmptyRecord(applicationId, userEmail);

  const sections: Record<string, ApplicationSection> = { ...base.sections };

  for (const sectionDef of PART450_SECTIONS) {
    const fields = sectionFields[sectionDef.id] ?? {};
    const prev = base.sections[sectionDef.id];
    const authorship = { ...prev?.authorship };

    for (const fieldDef of sectionDef.fields) {
      const newVal = formData[fieldDef.name] ?? '';
      const oldVal = prev?.fields[fieldDef.name] ?? '';
      if (newVal !== oldVal && newVal.trim()) {
        authorship[fieldDef.name] = {
          fieldName: fieldDef.name,
          lastModifiedBy: userEmail,
          lastModifiedAt: now,
        };
      }
    }

    sections[sectionDef.id] = {
      ...prev,
      id: sectionDef.id,
      title: sectionDef.title,
      status: deriveSectionStatus(
        Object.fromEntries(sectionDef.fields.map((f) => [f.name, formData[f.name] ?? ''])),
        sectionDef.fields
      ),
      fields: Object.fromEntries(
        sectionDef.fields.map((f) => [f.name, formData[f.name] ?? ''])
      ),
      authorship,
      version: (prev?.version ?? 0) + (Object.keys(fields).length > 0 ? 0 : 0),
      lastModifiedAt: now,
      lastModifiedBy: userEmail,
      ownerTeam: sectionDef.ownerTeam,
      crossReferences: sectionDef.crossReferences,
    };
  }

  return {
    ...base,
    updatedAt: now,
    sections,
  };
}

export async function loadApplicationRecord(
  applicationId: string,
  userEmail: string
): Promise<{ record: ApplicationRecord; formData: Record<string, string> }> {
  const docId = recordDocId(userEmail, applicationId);
  const recordRef = doc(db, 'applicationRecords', docId);
  const legacyRef = doc(db, 'applicationForms', docId);

  const [recordSnap, legacySnap] = await Promise.all([
    getDoc(recordRef),
    getDoc(legacyRef),
  ]);

  if (recordSnap.exists()) {
    const record = recordSnap.data() as ApplicationRecord;
    const formData = flatFormDataFromSections(record.sections);
    return { record, formData };
  }

  // Migrate from legacy flat blob
  if (legacySnap.exists()) {
    const legacy = legacySnap.data();
    const formData = (legacy?.formData as Record<string, string>) ?? {};
    const record = recordFromFlatFormData(applicationId, userEmail, formData);
    record.currentVersion = 1;
    await setDoc(recordRef, record);

    const version: ApplicationVersion = {
      id: 'v1',
      version: 1,
      timestamp: record.updatedAt,
      author: userEmail,
      changeSummary: 'Migrated from legacy form storage',
      fieldDiffs: [],
      sectionsSnapshot: Object.fromEntries(
        Object.entries(record.sections).map(([id, s]) => [
          id,
          { fields: { ...s.fields }, status: s.status },
        ])
      ),
    };
    await setDoc(doc(db, 'applicationRecords', docId, 'versions', 'v1'), version);

    return { record, formData };
  }

  const record = createEmptyRecord(applicationId, userEmail);
  return { record, formData: {} };
}

export async function saveApplicationRecord(
  record: ApplicationRecord,
  formData: Record<string, string>,
  authorEmail: string,
  authorName?: string
): Promise<{ record: ApplicationRecord; version: ApplicationVersion | null }> {
  const docId = recordDocId(authorEmail, record.applicationId);
  const previous = { ...record, sections: JSON.parse(JSON.stringify(record.sections)) };
  const next = recordFromFlatFormData(record.applicationId, authorEmail, formData, record);

  const diffs = computeFieldDiffs(previous, next);
  let version: ApplicationVersion | null = null;

  if (diffs.length > 0) {
    const newVersionNum = record.currentVersion + 1;
    version = {
      id: `v${newVersionNum}`,
      version: newVersionNum,
      timestamp: new Date().toISOString(),
      author: authorEmail,
      authorName,
      changeSummary: buildChangeSummary(diffs),
      fieldDiffs: diffs,
      sectionsSnapshot: Object.fromEntries(
        Object.entries(next.sections).map(([id, s]) => [
          id,
          { fields: { ...s.fields }, status: s.status },
        ])
      ),
    };
    next.currentVersion = newVersionNum;
    await setDoc(doc(db, 'applicationRecords', docId, 'versions', version.id), version);
  }

  next.updatedAt = new Date().toISOString();
  await setDoc(doc(db, 'applicationRecords', docId), next);

  // Keep legacy collection in sync for backward compatibility
  await setDoc(
    doc(db, 'applicationForms', docId),
    {
      formData,
      userEmail: authorEmail,
      applicationId: record.applicationId,
      updatedAt: next.updatedAt,
      currentVersion: next.currentVersion,
    },
    { merge: true }
  );

  return { record: next, version };
}

export async function loadVersionHistory(
  applicationId: string,
  userEmail: string,
  maxVersions = 20
): Promise<ApplicationVersion[]> {
  const docId = recordDocId(userEmail, applicationId);
  const versionsRef = collection(db, 'applicationRecords', docId, 'versions');
  const q = query(versionsRef, orderBy('version', 'desc'), limit(maxVersions));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as ApplicationVersion);
}

export async function rollbackToVersion(
  applicationId: string,
  userEmail: string,
  targetVersion: ApplicationVersion,
  authorName?: string
): Promise<{ record: ApplicationRecord; formData: Record<string, string> }> {
  const docId = recordDocId(userEmail, applicationId);
  const recordRef = doc(db, 'applicationRecords', docId);
  const recordSnap = await getDoc(recordRef);
  if (!recordSnap.exists()) throw new Error('Application record not found');

  const current = recordSnap.data() as ApplicationRecord;
  const flat: Record<string, string> = {};

  for (const [sectionId, snapshot] of Object.entries(targetVersion.sectionsSnapshot)) {
    Object.assign(flat, snapshot.fields);
    if (current.sections[sectionId]) {
      current.sections[sectionId] = {
        ...current.sections[sectionId],
        fields: { ...snapshot.fields },
        status: snapshot.status,
      };
    }
  }

  const { record } = await saveApplicationRecord(
    current,
    flat,
    userEmail,
    authorName
  );

  // Tag rollback in version history
  const rollbackVersion: ApplicationVersion = {
    id: `v${record.currentVersion}`,
    version: record.currentVersion,
    timestamp: new Date().toISOString(),
    author: userEmail,
    authorName,
    changeSummary: `Rolled back to version ${targetVersion.version}`,
    fieldDiffs: [],
    sectionsSnapshot: targetVersion.sectionsSnapshot,
  };

  return { record, formData: flat };
}

export function getFieldAuthorship(
  record: ApplicationRecord,
  fieldName: string
): { lastModifiedBy: string; lastModifiedAt: string } | null {
  for (const section of Object.values(record.sections)) {
    const auth = section.authorship[fieldName];
    if (auth) return auth;
  }
  return null;
}
