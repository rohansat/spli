'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApplicationProvider } from "@/components/providers/ApplicationProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
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

export default function DemoPage() {
  const router = useRouter();
  const [selectedMessage, setSelectedMessage] = useState(MESSAGES[0]);

  return (
    <ApplicationProvider>
      <div className="min-h-screen flex flex-col bg-black">
        <Navbar userInitials="JD" />
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
        <Footer />
      </div>
    </ApplicationProvider>
  );
} 