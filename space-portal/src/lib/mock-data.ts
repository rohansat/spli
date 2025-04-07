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

// Sample applications
export const applications: Application[] = [
  {
    id: "app-1",
    name: "Falcon X Launch Vehicle License",
    status: "awaiting_action",
    type: "Part 450",
    createdAt: "2025-01-15T12:00:00Z",
    updatedAt: "2025-02-20T14:30:00Z",
    submittedAt: "2025-02-20T14:30:00Z",
  },
  {
    id: "app-2",
    name: "Starcruiser Reentry Vehicle",
    status: "draft",
    type: "Part 450",
    createdAt: "2025-02-27T09:15:00Z",
    updatedAt: "2025-02-27T09:15:00Z",
  },
  {
    id: "app-3",
    name: "Orbital Facility Safety Approval",
    status: "active",
    type: "Safety Approval",
    createdAt: "2024-11-05T10:00:00Z",
    updatedAt: "2025-01-10T16:45:00Z",
    submittedAt: "2024-11-07T14:20:00Z",
  },
  {
    id: "app-4",
    name: "Launch Site Expansion Amendment",
    status: "under_review",
    type: "License Amendment",
    createdAt: "2025-03-03T08:30:00Z",
    updatedAt: "2025-03-05T11:20:00Z",
    submittedAt: "2025-03-05T11:20:00Z",
  },
];

// Sample documents
export const documents: Document[] = [
  {
    id: "doc-1",
    name: "Falcon X License Application.pdf",
    type: "application",
    applicationId: "app-1",
    fileSize: "4.2 MB",
    uploadedAt: "2025-02-20T14:30:00Z",
    url: "/documents/falcon-x-license.pdf",
  },
  {
    id: "doc-2",
    name: "Flight Safety Analysis.pdf",
    type: "attachment",
    applicationId: "app-1",
    fileSize: "8.7 MB",
    uploadedAt: "2025-02-20T14:35:00Z",
    url: "/documents/flight-safety-analysis.pdf",
  },
  {
    id: "doc-3",
    name: "Environmental Assessment Report.pdf",
    type: "attachment",
    applicationId: "app-1",
    fileSize: "12.1 MB",
    uploadedAt: "2025-02-21T09:15:00Z",
    url: "/documents/environmental-assessment.pdf",
  },
  {
    id: "doc-4",
    name: "Starcruiser Draft Application.pdf",
    type: "application",
    applicationId: "app-2",
    fileSize: "3.8 MB",
    uploadedAt: "2025-02-27T09:15:00Z",
    url: "/documents/starcruiser-draft.pdf",
  },
  {
    id: "doc-5",
    name: "Orbital Facility Approval.pdf",
    type: "license",
    applicationId: "app-3",
    fileSize: "2.5 MB",
    uploadedAt: "2025-01-10T16:45:00Z",
    url: "/documents/orbital-facility-approval.pdf",
  },
  {
    id: "doc-6",
    name: "Launch Site Expansion Application.pdf",
    type: "application",
    applicationId: "app-4",
    fileSize: "5.3 MB",
    uploadedAt: "2025-03-05T11:20:00Z",
    url: "/documents/site-expansion.pdf",
  },
];

// Sample messages
export const messages: Message[] = [
  {
    id: "msg-1",
    sender: "faa-admin@faa.gov",
    recipient: "john.doe@company.com",
    subject: "Falcon X License Application Received",
    body: "We have received your application for the Falcon X Launch Vehicle License. Your application is currently under review. We will contact you if additional information is needed.",
    isRead: true,
    isAutomated: true,
    createdAt: "2025-02-20T14:35:00Z",
    applicationId: "app-1",
  },
  {
    id: "msg-2",
    sender: "sarah.johnson@faa.gov",
    recipient: "john.doe@company.com",
    subject: "Additional Information Needed for Falcon X Application",
    body: "After reviewing your Falcon X Launch Vehicle License application, we need additional information regarding the flight termination system. Please provide the requested details within 30 days.",
    isRead: false,
    isAutomated: false,
    createdAt: "2025-03-05T10:20:00Z",
    applicationId: "app-1",
  },
  {
    id: "msg-3",
    sender: "faa-admin@faa.gov",
    recipient: "john.doe@company.com",
    subject: "Orbital Facility Safety Approval Granted",
    body: "Your application for Orbital Facility Safety Approval has been approved. The official approval document has been added to your document management system.",
    isRead: true,
    isAutomated: true,
    createdAt: "2025-01-10T16:50:00Z",
    applicationId: "app-3",
  },
  {
    id: "msg-4",
    sender: "faa-admin@faa.gov",
    recipient: "john.doe@company.com",
    subject: "Launch Site Expansion Amendment Received",
    body: "We have received your Launch Site Expansion Amendment application. Your application is currently under review. We will contact you if additional information is needed.",
    isRead: false,
    isAutomated: true,
    createdAt: "2025-03-05T11:25:00Z",
    applicationId: "app-4",
  },
];

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
