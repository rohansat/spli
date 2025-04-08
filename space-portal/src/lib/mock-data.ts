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
      title: "Applicant Information",
      fields: [
        { name: "applicantName", label: "Applicant Name", type: "text" },
        { name: "applicantAddress", label: "Applicant Address", type: "text" },
        { name: "pointOfContact", label: "Point of Contact", type: "text" },
        { name: "telephone", label: "Telephone", type: "text" },
        { name: "email", label: "Email", type: "email" },
      ],
    },
    {
      title: "Vehicle Information",
      fields: [
        { name: "vehicleName", label: "Vehicle Name", type: "text" },
        { name: "vehicleType", label: "Vehicle Type", type: "select", options: ["Expendable Launch Vehicle", "Reusable Launch Vehicle", "Reentry Vehicle"] },
        { name: "vehicleDescription", label: "Vehicle Description", type: "textarea" },
        { name: "propellantType", label: "Propellant Type", type: "text" },
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
      title: "Safety Analysis",
      fields: [
        { name: "safetySystemDescription", label: "Safety System Description", type: "textarea" },
        { name: "flightTerminationSystem", label: "Flight Termination System", type: "textarea" },
        { name: "hazardAnalysis", label: "Hazard Analysis Summary", type: "textarea" },
        { name: "debrisAnalysis", label: "Debris Analysis", type: "textarea" },
      ],
    },
    {
      title: "Environmental Assessment",
      fields: [
        { name: "environmentalImpact", label: "Environmental Impact Assessment", type: "textarea" },
        { name: "noiseLevels", label: "Expected Noise Levels", type: "text" },
        { name: "mitigationMeasures", label: "Mitigation Measures", type: "textarea" },
      ],
    },
    {
      title: "Financial Responsibility",
      fields: [
        { name: "insuranceProvider", label: "Insurance Provider", type: "text" },
        { name: "coverageAmount", label: "Coverage Amount", type: "text" },
        { name: "policyNumber", label: "Policy Number", type: "text" },
      ],
    },
  ],
};
