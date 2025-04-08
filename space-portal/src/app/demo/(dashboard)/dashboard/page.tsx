"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApplication } from "@/components/providers/ApplicationProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Application } from "@/types";
import { FilePlus, Rocket, PlusCircle, Upload, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Search, Filter, Download, Trash2, Star, Plus } from "lucide-react";

// Mock data
const ACTIVE_APPLICATIONS = [
  {
    name: "FALCON X LAUNCH VEHICLE LICENSE",
    type: "Part 450",
    lastUpdated: "Feb 20, 2025",
    status: "UNDER REVIEW"
  },
  {
    name: "STARCRUISER REENTRY VEHICLE",
    type: "Part 450",
    lastUpdated: "Feb 27, 2025",
    status: "DRAFT"
  },
  {
    name: "LAUNCH SITE EXPANSION AMENDMENT",
    type: "License Amendment",
    lastUpdated: "Mar 5, 2025",
    status: "SUBMITTED"
  }
];

const LAUNCH_STATUS = [
  {
    type: "APPROVED LAUNCH WINDOW",
    name: "Orbital Facility Deployment",
    date: "May 15, 2025 - June 30, 2025",
    status: "approved"
  },
  {
    type: "PENDING APPROVAL",
    name: "Falcon X Launch Vehicle",
    date: "Submitted on Feb 20, 2025",
    status: "pending"
  }
];

const DOCUMENTS = [
  {
    name: "Falcon X License Application.pdf",
    type: "Application",
    size: "4.2 MB",
    uploaded: "Feb 20, 2025",
    application: "Falcon X Launch Vehicle License"
  },
  {
    name: "Flight Safety Analysis.pdf",
    type: "Attachment",
    size: "8.7 MB",
    uploaded: "Feb 20, 2025",
    application: "Falcon X Launch Vehicle License"
  },
  {
    name: "Environmental Assessment Report.pdf",
    type: "Attachment",
    size: "12.1 MB",
    uploaded: "Feb 21, 2025",
    application: "Falcon X Launch Vehicle License"
  },
  {
    name: "Starcruiser Draft Application.pdf",
    type: "Application",
    size: "3.8 MB",
    uploaded: "Feb 27, 2025",
    application: "Starcruiser Reentry Vehicle"
  },
  {
    name: "Orbital Facility Approval.pdf",
    type: "License",
    size: "2.5 MB",
    uploaded: "Jan 10, 2025",
    application: "Orbital Facility Safety Approval"
  }
];

const MESSAGES = [
  {
    from: "faa-admin@faa.gov",
    subject: "Falcon X License Application Received",
    preview: "We have received your application for the Falcon X Laun...",
    date: "Feb 20",
    unread: true
  },
  {
    from: "sarah.johnson@faa.gov",
    subject: "Additional Information Needed for Falcon X Ap...",
    preview: "After reviewing your Falcon X Launch Vehicle License ap...",
    date: "Mar 5",
    unread: false
  },
  {
    from: "faa-admin@faa.gov",
    subject: "Orbital Facility Safety Approval Granted",
    preview: "Your application for Orbital Facility Safety Approval has ...",
    date: "Jan 10",
    unread: false
  },
  {
    from: "faa-admin@faa.gov",
    subject: "Launch Site Expansion Amendment Received",
    preview: "We have received your Launch Site Expansion Amendm...",
    date: "Mar 5",
    unread: false
  }
];

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { applications, createApplication } = useApplication();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newApplicationName, setNewApplicationName] = useState("");
  const [newApplicationType, setNewApplicationType] = useState<Application["type"]>("Part 450");
  const [documentDescription, setDocumentDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedMessage, setSelectedMessage] = useState(MESSAGES[0]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateApplication = () => {
    if (newApplicationName.trim() === "") return;

    const newApp = createApplication(newApplicationName, newApplicationType);
    setIsDialogOpen(false);
    setNewApplicationName("");
    setDocumentDescription("");
    setUploadedFiles([]);

    // Redirect to the new application form
    router.push(`/applications/${newApp.id}`);
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status badge class based on status
  const getStatusBadgeClass = (status: Application["status"]) => {
    switch (status) {
      case "draft":
        return "bg-gray-500/20 text-gray-200";
      case "under_review":
        return "bg-yellow-500/20 text-yellow-300";
      case "awaiting_action":
        return "bg-blue-500/20 text-blue-300";
      case "active":
        return "bg-green-500/20 text-green-300";
      default:
        return "bg-gray-500/20 text-gray-200";
    }
  };

  return (
    <div className="space-container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">MISSION CONTROL</h1>
          <p className="text-white/60">
            Welcome back, {user?.displayName || 'Astronaut'}. Manage your aerospace licensing applications.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="spacex-button mt-4 md:mt-0">
              <PlusCircle className="mr-2 h-4 w-4" />
              NEW APPLICATION
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black text-white border border-white/20">
            <DialogHeader>
              <DialogTitle>Create New Application</DialogTitle>
              <DialogDescription className="text-white/60">
                Fill in the details to start a new license application.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Application Name
                </label>
                <Input
                  id="name"
                  value={newApplicationName}
                  onChange={(e) => setNewApplicationName(e.target.value)}
                  placeholder="e.g., Mars Lander Launch Vehicle"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="type" className="text-sm font-medium">
                  Application Type
                </label>
                <select
                  id="type"
                  value={newApplicationType}
                  onChange={(e) => setNewApplicationType(e.target.value as Application["type"])}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md"
                >
                  <option value="Part 450">Part 450</option>
                  <option value="License Amendment">License Amendment</option>
                  <option value="Safety Approval">Safety Approval</option>
                  <option value="Site License">Site License</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="documents" className="text-sm font-medium">
                  Important Documents
                </label>
                <Textarea
                  id="documents"
                  value={documentDescription}
                  onChange={(e) => setDocumentDescription(e.target.value)}
                  placeholder="e.g., Important Documents Needed For Licensing"
                  className="bg-white/10 border-white/20 text-white min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="file-upload" className="text-sm font-medium">
                  Upload Documents
                </label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="file-upload" className="w-full flex flex-col items-center justify-center px-4 py-6 bg-white/10 border-2 border-white/20 border-dashed rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-8 w-8 text-white/60 mb-2" />
                      <p className="mb-2 text-sm text-white/80">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-white/60">PDF, DOC, DOCX, or TXT (MAX. 10MB)</p>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      multiple
                    />
                  </label>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-white/5 p-2 rounded">
                        <span className="text-sm text-white/80">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-white/60 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setNewApplicationName("");
                  setDocumentDescription("");
                  setUploadedFiles([]);
                }}
                className="border-white/40 text-white"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateApplication} className="spacex-button">
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card className="space-card bg-gradient-to-br from-black to-zinc-900">
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
            <CardDescription className="text-white/60">
              Applications awaiting your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {applications.length > 0 ? (
              <div className="space-y-2">
                {applications.filter(app => app.status !== 'active').map((app) => (
                  <Link
                    key={app.id}
                    href={`/applications/${app.id}`}
                    className="block p-4 border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-white font-medium">{app.name}</h3>
                        <p className="text-sm text-white/60">
                          {app.type} • Last updated {formatDate(app.updatedAt)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                          app.status
                        )}`}
                      >
                        {app.status === 'awaiting_action' ? 'ACTION NEEDED' : app.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                <FilePlus className="mx-auto h-10 w-10 mb-4 opacity-50" />
                <p>No pending actions</p>
                <p className="text-sm">Create a new application to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="space-card bg-gradient-to-br from-black to-zinc-900">
          <CardHeader>
            <CardTitle>Launch Status</CardTitle>
            <CardDescription className="text-white/60">
              Recent and upcoming launches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-white/10 bg-white/5">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <h3 className="text-white font-medium">Approved Launch Window</h3>
                </div>
                <p className="text-sm text-white/60 mb-1">
                  Orbital Facility Deployment
                </p>
                <p className="text-xs text-white/40">
                  May 15, 2025 - June 30, 2025
                </p>
              </div>

              <div className="p-4 border border-white/10 bg-white/5">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  <h3 className="text-white font-medium">Pending Approval</h3>
                </div>
                <p className="text-sm text-white/60 mb-1">
                  Falcon X Launch Vehicle
                </p>
                <p className="text-xs text-white/40">
                  Submitted on {formatDate("2025-02-20T14:30:00Z")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="space-card">
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <CardDescription className="text-white/60">
            Complete history of your license applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-white">Name</TableHead>
                <TableHead className="text-white">Type</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Created</TableHead>
                <TableHead className="text-white">Last Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow
                  key={app.id}
                  className="border-white/10 hover:bg-white/5 cursor-pointer"
                  onClick={() => router.push(`/applications/${app.id}`)}
                >
                  <TableCell className="font-medium text-white">{app.name}</TableCell>
                  <TableCell className="text-white/80">{app.type}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                        app.status
                      )}`}
                    >
                      {app.status.replace("_", " ").toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-white/60">{formatDate(app.createdAt)}</TableCell>
                  <TableCell className="text-white/60">{formatDate(app.updatedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <main className="flex-grow p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Active Applications */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Active Applications</h2>
            <p className="text-gray-400 mb-6">Your current licensing applications</p>
            <div className="space-y-4">
              {ACTIVE_APPLICATIONS.map((app, index) => (
                <div key={index} className="bg-zinc-900/50 p-6 rounded-lg border border-white/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-semibold">{app.name}</h3>
                      <p className="text-gray-400">{app.type} • Last updated {app.lastUpdated}</p>
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded text-sm font-medium",
                      app.status === "UNDER REVIEW" && "bg-[#4A4A00] text-[#FFED4A]",
                      app.status === "DRAFT" && "bg-gray-700 text-gray-200",
                      app.status === "SUBMITTED" && "bg-blue-900 text-blue-200"
                    )}>
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Launch Status */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Launch Status</h2>
            <p className="text-gray-400 mb-6">Recent and upcoming launches</p>
            <div className="space-y-4">
              {LAUNCH_STATUS.map((launch, index) => (
                <div key={index} className="bg-zinc-900/50 p-6 rounded-lg border border-white/10">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2",
                      launch.status === "approved" ? "bg-green-500" : "bg-yellow-500"
                    )} />
                    <div>
                      <h3 className="text-white font-semibold">{launch.type}</h3>
                      <p className="text-gray-400">{launch.name}</p>
                      <p className="text-gray-500">{launch.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Document Management */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">DOCUMENT MANAGEMENT</h2>
                <p className="text-gray-400">Manage all documents related to your aerospace licensing applications</p>
              </div>
              <Button className="bg-white text-black hover:bg-gray-200">
                <Plus className="mr-2 h-4 w-4" />
                UPLOAD DOCUMENT
              </Button>
            </div>
            
            <div className="flex gap-4 mb-6">
              <div className="flex-grow relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search documents..."
                  className="pl-10 bg-zinc-900/50 border-white/10 text-white"
                />
              </div>
              <Button variant="outline" className="border-white/10 text-white">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>

            <Card className="bg-zinc-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Document Library</CardTitle>
                <CardDescription className="text-gray-400">View and manage your documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Button variant="ghost" className="text-white">All Documents</Button>
                  <Button variant="ghost" className="text-gray-400">Applications</Button>
                  <Button variant="ghost" className="text-gray-400">Attachments</Button>
                  <Button variant="ghost" className="text-gray-400">Emails</Button>
                  <Button variant="ghost" className="text-gray-400">Licenses</Button>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead>Document</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>Associated Application</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DOCUMENTS.map((doc, index) => (
                      <TableRow key={index} className="border-white/10">
                        <TableCell className="font-medium text-white">{doc.name}</TableCell>
                        <TableCell className="text-gray-400">{doc.type}</TableCell>
                        <TableCell className="text-gray-400">{doc.size}</TableCell>
                        <TableCell className="text-gray-400">{doc.uploaded}</TableCell>
                        <TableCell className="text-gray-400">{doc.application}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4 text-gray-400" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-gray-400" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>

          {/* Messages */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">MESSAGES</h2>
                <p className="text-gray-400">Communicate with FAA officials and receive automated notifications</p>
              </div>
              <Button className="bg-white text-black hover:bg-gray-200">
                <Plus className="mr-2 h-4 w-4" />
                NEW MESSAGE
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card className="bg-zinc-900/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    Inbox
                    <span className="text-sm bg-blue-600 px-2 py-1 rounded">0 Unread</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {MESSAGES.map((message, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedMessage(message)}
                        className="w-full text-left p-4 rounded hover:bg-white/5 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-gray-400">{message.from}</span>
                          <span className="text-gray-500 text-sm">{message.date}</span>
                        </div>
                        <div className="text-white font-medium">{message.subject}</div>
                        <div className="text-gray-400 text-sm truncate">{message.preview}</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    {selectedMessage.subject}
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Star className="h-4 w-4 text-gray-400" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    From: {selectedMessage.from} | To: john.doe@company.com
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-950/50 p-4 rounded-lg mb-6">
                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      This is an automated system message
                    </div>
                    <div className="text-gray-300">
                      Related to application: app-1
                    </div>
                  </div>
                  <div className="text-gray-300 mb-6">
                    We have received your application for the Falcon X Launch Vehicle License. Your application is currently under review. We will contact you if additional information is needed.
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Reply</h4>
                    <textarea
                      placeholder="Type your reply here..."
                      className="w-full h-32 bg-zinc-900/50 border border-white/10 rounded-lg p-4 text-white resize-none"
                    />
                    <div className="flex justify-end">
                      <Button className="bg-white text-black hover:bg-gray-200">
                        SEND REPLY
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
