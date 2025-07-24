import { Application, Document, Message, User } from "@/types";

// Sample user
export const currentUser: User = {
  id: "user-1",
  name: "John Doe",
  email: "john.doe@company.com",
  company: "Space Innovations, Inc.",
  role: "admin",
  initials: "JD",
};

// Empty initial applications state
export const applications: Application[] = [];

// Empty initial documents state
export const documents: Document[] = [];

// Empty initial messages state
export const messages: Message[] = [];

// Part 450 form template structure
export const part450FormTemplate = {
  sections: [
    {
      title: "Concept of Operations\n(CONOPS)",
      fields: [
        { name: "missionObjective", label: "Mission Objective", type: "textarea" },
        { name: "vehicleDescription", label: "Vehicle Description", type: "textarea" },
        { name: "launchReentrySequence", label: "Launch/Reentry Sequence", type: "textarea" },
        { name: "trajectoryOverview", label: "Trajectory Overview", type: "textarea" },
        { name: "safetyConsiderations", label: "Safety Considerations", type: "textarea" },
        { name: "groundOperations", label: "Ground Operations", type: "textarea" },
      ],
    },
    {
      title: "Vehicle Overview",
      fields: [
        { name: "technicalSummary", label: "Technical Summary or Data Sheet", type: "textarea" },
        { name: "dimensionsMassStages", label: "Dimensions, Mass, Stages", type: "textarea" },
        { name: "propulsionTypes", label: "Propulsion Type(s)", type: "textarea" },
        { name: "recoverySystems", label: "Recovery Systems (if any)", type: "textarea" },
        { name: "groundSupportEquipment", label: "Ground Support Equipment", type: "textarea" },
      ],
    },
    {
      title: "Planned Launch/Reentry\nLocation(s)",
      fields: [
        { name: "siteNamesCoordinates", label: "Site Names and Coordinates", type: "textarea" },
        { name: "siteOperator", label: "Site Operator (if 3rd party)", type: "textarea" },
        { name: "airspaceMaritimeNotes", label: "Airspace/Maritime Notes (if applicable)", type: "textarea" },
      ],
    },
    {
      title: "Launch Information",
      fields: [
        { name: "launchSite", label: "Launch Site", type: "text" },
        { name: "launchWindow", label: "Launch Window", type: "text" },
        { name: "flightPath", label: "Flight Path Description", type: "textarea" },
        { name: "landingSite", label: "Landing/Recovery Site (if applicable)", type: "text" },
      ],
    },
    {
      title: "Preliminary Risk or Safety\nConsiderations",
      fields: [
        { name: "earlyRiskAssessments", label: "Any Early Risk Assessments", type: "textarea" },
        { name: "publicSafetyChallenges", label: "Known Public Safety Challenges", type: "textarea" },
        { name: "plannedSafetyTools", label: "Any Planned Use of Safety Tools (DEBRIS, SARA, etc.)", type: "textarea" },
      ],
    },
    {
      title: "Timeline & Intent",
      fields: [
        { name: "fullApplicationTimeline", label: "When You Plan to Submit a Full Application", type: "textarea" },
        { name: "intendedWindow", label: "Intended Launch/Reentry Window", type: "textarea" },
        { name: "licenseTypeIntent", label: "Whether You Seek a Vehicle/Operator License or Mission-Specific License", type: "textarea" },
      ],
    },
    {
      title: "List of Questions for FAA",
      fields: [
        { name: "clarifyPart450", label: "Clarify Points About Part 450 Requirements", type: "textarea" },
        { name: "uniqueTechInternational", label: "Any Unique Tech or International Aspects", type: "textarea" },
      ],
    },
  ],
};
