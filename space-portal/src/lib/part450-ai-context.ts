import { PART450_SCHEMA, PART450_SECTIONS } from '@/lib/part450-schema';

export function buildPart450AIKnowledgeBlock(): string {
  const sectionBlocks = PART450_SECTIONS.map((section, index) => {
    const fields = section.fields.map((f) => `  - ${f.label} (${f.name})`).join('\n');
    return `Section ${index + 1}: ${section.title.replace(/\n/g, ' ')}\n${fields}`;
  }).join('\n\n');

  const crossRefs = PART450_SCHEMA.sections
    .flatMap((s) => s.crossReferences)
    .map((ref) => `- ${ref.description}`)
    .filter((line, index, arr) => arr.indexOf(line) === index)
    .join('\n');

  return `FAA PART 450 APPLICATION (Pre-Application Draft Package — ${PART450_SCHEMA.totalFields} fields across 7 sections):

${sectionBlocks}

REGULATORY STANDARDS:
- 14 CFR Part 450 governs launch and reentry licensing; pre-application content should be factual, specific, and FAA-reviewable.
- CONOPS (Section 1) must describe mission objective, vehicle, launch/reentry sequence, trajectory, safety, and ground ops with enough detail for public safety analysis.
- Vehicle Overview (Section 2) must align with CONOPS vehicle description — dimensions, mass, stages, propulsion, recovery, and ground support.
- Locations (Section 3) and Launch Information (Section 4) must be consistent on site names, coordinates, flight path, and launch window.
- Safety (Section 5) must connect hazards in CONOPS to early risk assessments, public safety challenges, and planned tools (e.g. DEBRIS, SARA, flight termination).
- Timeline & Intent (Section 6) should state license type sought and intended launch/reentry window.
- FAA Questions (Section 7) is for clarifications and unique/international aspects — only populate when the mission text supports it.

CROSS-SECTION ALIGNMENT:
${crossRefs}`;
}
