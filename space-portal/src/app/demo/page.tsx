"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Search, Filter, Download, Trash2, Star, Plus, Mail, MessageSquare, AlertTriangle, FileUp, FileText, File, Send, PlusCircle } from "lucide-react";

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
    id: "1",
    sender: "faa-admin@faa.gov",
    subject: "Falcon X License Application Received",
    body: "We have received your application for the Falcon X Launch Vehicle License. Your application is currently under review. We will contact you if additional information is needed.",
    createdAt: "2025-02-20T10:00:00Z",
    isRead: false,
    isAutomated: true
  },
  {
    id: "2",
    sender: "sarah.johnson@faa.gov",
    subject: "Additional Information Needed for Falcon X Application",
    body: "After reviewing your Falcon X Launch Vehicle License application, we require additional information regarding the safety protocols...",
    createdAt: "2025-03-05T15:30:00Z",
    isRead: true,
    isAutomated: false
  },
  {
    id: "3",
    sender: "faa-admin@faa.gov",
    subject: "Orbital Facility Safety Approval Granted",
    body: "Your application for Orbital Facility Safety Approval has been granted. Please find the official documentation attached...",
    createdAt: "2025-01-10T09:15:00Z",
    isRead: true,
    isAutomated: true
  },
  {
    id: "4",
    sender: "faa-admin@faa.gov",
    subject: "Launch Site Expansion Amendment Received",
    body: "We have received your Launch Site Expansion Amendment application. Our team will begin reviewing the documentation...",
    createdAt: "2025-03-05T11:45:00Z",
    isRead: true,
    isAutomated: true
  }
];

export default function DemoPage() {
  const [selectedMessage, setSelectedMessage] = useState(MESSAGES[0]);
  const [isNewAppDialogOpen, setIsNewAppDialogOpen] = useState(false);
  const [newApplicationName, setNewApplicationName] = useState("");
  const [newApplicationType, setNewApplicationType] = useState("Part 450");
  const [documentDescription, setDocumentDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    recipient: "",
    subject: "",
    body: "",
  });

  // Filter documents based on search and type
  const filteredDocuments = DOCUMENTS.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && doc.type.toLowerCase() === activeTab.slice(0, -1).toLowerCase();
  });

  // Format date for messages
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <main className="flex-grow p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">MISSION CONTROL</h1>
            <p className="text-white/60">
              Welcome to the Space Portal Demo. Explore our aerospace licensing platform.
            </p>
          </div>

          <Dialog open={isNewAppDialogOpen} onOpenChange={setIsNewAppDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
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
                    onChange={(e) => setNewApplicationType(e.target.value)}
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
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsNewAppDialogOpen(false)}
                  className="border-white/40 text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setIsNewAppDialogOpen(false)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                >
                  Create Application
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-white/10 p-0">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-white/20 data-[state=active]:text-white px-4 py-2 text-white/70"
                  >
                    All Documents
                  </TabsTrigger>
                  <TabsTrigger
                    value="applications"
                    className="data-[state=active]:bg-white/20 data-[state=active]:text-white px-4 py-2 text-white/70"
                  >
                    Applications
                  </TabsTrigger>
                  <TabsTrigger
                    value="attachments"
                    className="data-[state=active]:bg-white/20 data-[state=active]:text-white px-4 py-2 text-white/70"
                  >
                    Attachments
                  </TabsTrigger>
                  <TabsTrigger
                    value="emails"
                    className="data-[state=active]:bg-white/20 data-[state=active]:text-white px-4 py-2 text-white/70"
                  >
                    Emails
                  </TabsTrigger>
                  <TabsTrigger
                    value="licenses"
                    className="data-[state=active]:bg-white/20 data-[state=active]:text-white px-4 py-2 text-white/70"
                  >
                    Licenses
                  </TabsTrigger>
                </TabsList>
                
                <Table className="mt-4">
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
                    {filteredDocuments.map((doc, index) => (
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
              </Tabs>
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
            <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-black hover:bg-gray-200">
                  <Plus className="mr-2 h-4 w-4" />
                  NEW MESSAGE
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black text-white border border-white/20">
                <DialogHeader>
                  <DialogTitle>Compose Message</DialogTitle>
                  <DialogDescription className="text-white/60">
                    Send a message to FAA officials
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="recipient" className="text-sm font-medium">
                      To
                    </label>
                    <Input
                      id="recipient"
                      value={newMessage.recipient}
                      onChange={(e) =>
                        setNewMessage({ ...newMessage, recipient: e.target.value })
                      }
                      placeholder="recipient@faa.gov"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      value={newMessage.subject}
                      onChange={(e) =>
                        setNewMessage({ ...newMessage, subject: e.target.value })
                      }
                      placeholder="Enter subject"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="body" className="text-sm font-medium">
                      Message
                    </label>
                    <Textarea
                      id="body"
                      value={newMessage.body}
                      onChange={(e) =>
                        setNewMessage({ ...newMessage, body: e.target.value })
                      }
                      placeholder="Type your message here"
                      rows={8}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsComposeOpen(false)}
                    className="border-white/40 text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setIsComposeOpen(false)}
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-zinc-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  Inbox
                  <span className="text-sm bg-blue-600 px-2 py-1 rounded">
                    {MESSAGES.filter(m => !m.isRead).length} Unread
                  </span>
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
                        <div className="flex items-center gap-2">
                          {message.isAutomated ? (
                            <MessageSquare className="h-4 w-4 text-blue-400" />
                          ) : (
                            <Mail className="h-4 w-4 text-white/70" />
                          )}
                          <span className="text-gray-400">{message.sender}</span>
                        </div>
                        <span className="text-gray-500 text-sm">{formatDate(message.createdAt)}</span>
                      </div>
                      <div className="text-white font-medium">{message.subject}</div>
                      <div className="text-gray-400 text-sm truncate">{message.body}</div>
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
                  From: {selectedMessage.sender}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedMessage.isAutomated && (
                  <div className="bg-blue-950/50 p-4 rounded-lg mb-6">
                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      This is an automated system message
                    </div>
                  </div>
                )}
                <div className="text-gray-300 mb-6">
                  {selectedMessage.body}
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
  );
} 