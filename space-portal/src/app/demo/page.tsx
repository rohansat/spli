'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApplicationProvider } from "@/components/providers/ApplicationProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Application } from "@/types";
import { FilePlus, Rocket, PlusCircle, Upload, X } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock user data
const DEMO_USER = {
  name: "Demo User",
  initials: "DU",
  email: "demo@example.com"
};

// Mock applications data
const MOCK_APPLICATIONS = [
  {
    id: "app-1",
    name: "Falcon Heavy Launch Vehicle",
    type: "Part 450",
    status: "In Progress",
    lastUpdated: "2024-03-20",
  },
  {
    id: "app-2",
    name: "Starship Orbital Test",
    type: "License Amendment",
    status: "Under Review",
    lastUpdated: "2024-03-18",
  },
  {
    id: "app-3",
    name: "Cape Canaveral Launch Site",
    type: "Site License",
    status: "Approved",
    lastUpdated: "2024-03-15",
  }
];

export default function DemoPage() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newApplicationName, setNewApplicationName] = useState("");
  const [newApplicationType, setNewApplicationType] = useState<Application["type"]>("Part 450");
  const [documentDescription, setDocumentDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [applications, setApplications] = useState(MOCK_APPLICATIONS);

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
    setIsDialogOpen(false);
    setNewApplicationName("");
    setDocumentDescription("");
    setUploadedFiles([]);
    router.push('/demo');
  };

  return (
    <ApplicationProvider>
      <div className="min-h-screen flex flex-col bg-black">
        <Navbar userInitials={DEMO_USER.initials} />
        <div className="flex-grow pt-16">
          <div className="space-container py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">MISSION CONTROL</h1>
                <p className="text-white/60">
                  Welcome to the demo, {DEMO_USER.name}. Manage your aerospace licensing applications.
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

            <div className="grid gap-6">
              <Card className="space-card">
                <CardHeader>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>View and manage your license applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Application Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{app.name}</TableCell>
                          <TableCell>{app.type}</TableCell>
                          <TableCell>
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                              app.status === "Approved" ? "bg-green-100 text-green-800" :
                              app.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                              "bg-yellow-100 text-yellow-800"
                            )}>
                              {app.status}
                            </span>
                          </TableCell>
                          <TableCell>{app.lastUpdated}</TableCell>
                          <TableCell>
                            <Button
                              onClick={() => router.push(`/demo/applications/${app.id}`)}
                              variant="ghost"
                              className="text-white/70 hover:text-white"
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="space-card min-h-[800px]">
                <CardHeader>
                  <CardTitle>Part 450 License Application</CardTitle>
                  <CardDescription>Complete your application form</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="section1" className="w-full">
                    <div className="flex flex-col gap-8">
                      <TabsList className="w-full flex flex-col gap-8">
                        <TabsTrigger value="section1" className="flex items-center space-x-6 py-6 px-4 rounded-2xl hover:bg-zinc-900/40 transition-colors">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-semibold">1</div>
                          <div className="text-left">
                            <div className="text-xl font-medium tracking-wide">General Information</div>
                            <div className="text-sm text-white/60">Basic details about your application</div>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger value="section2" className="flex items-center space-x-6 py-6 px-4 rounded-2xl hover:bg-zinc-900/40 transition-colors">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center text-xl font-semibold">2</div>
                          <div className="text-left">
                            <div className="text-xl font-medium tracking-wide">Vehicle Description</div>
                            <div className="text-sm text-white/60">Details about your launch vehicle</div>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger value="section3" className="flex items-center space-x-6 py-6 px-4 rounded-2xl hover:bg-zinc-900/40 transition-colors">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center text-xl font-semibold">3</div>
                          <div className="text-left">
                            <div className="text-xl font-medium tracking-wide">Launch Operations</div>
                            <div className="text-sm text-white/60">Launch site and operations</div>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger value="section4" className="flex items-center space-x-6 py-6 px-4 rounded-2xl hover:bg-zinc-900/40 transition-colors">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center text-xl font-semibold">4</div>
                          <div className="text-left">
                            <div className="text-xl font-medium tracking-wide">Safety Analysis</div>
                            <div className="text-sm text-white/60">Risk assessment and mitigation</div>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger value="section5" className="flex items-center space-x-6 py-6 px-4 rounded-2xl hover:bg-zinc-900/40 transition-colors">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center text-xl font-semibold">5</div>
                          <div className="text-left">
                            <div className="text-xl font-medium tracking-wide">Environmental Assessment</div>
                            <div className="text-sm text-white/60">Environmental impact analysis</div>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger value="section6" className="flex items-center space-x-6 py-6 px-4 rounded-2xl hover:bg-zinc-900/40 transition-colors">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center text-xl font-semibold">6</div>
                          <div className="text-left">
                            <div className="text-xl font-medium tracking-wide">Additional Documents</div>
                            <div className="text-sm text-white/60">Supporting documentation</div>
                          </div>
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="section1" className="mt-6">
                      <div className="space-y-8">
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold">General Information</h3>
                          <div className="grid gap-4">
                            <Input placeholder="Application Name" className="bg-white/10 border-white/20" />
                            <Input placeholder="Company Name" className="bg-white/10 border-white/20" />
                            <Input placeholder="Point of Contact" className="bg-white/10 border-white/20" />
                            <Input placeholder="Email" type="email" className="bg-white/10 border-white/20" />
                            <Input placeholder="Phone" type="tel" className="bg-white/10 border-white/20" />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="section2" className="mt-6">
                      <div className="space-y-8">
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold">Vehicle Description</h3>
                          <div className="grid gap-4">
                            <Input placeholder="Vehicle Name" className="bg-white/10 border-white/20" />
                            <Textarea placeholder="Vehicle Description" className="bg-white/10 border-white/20 min-h-[100px]" />
                            <Input placeholder="Maximum Thrust" className="bg-white/10 border-white/20" />
                            <Input placeholder="Propellant Type" className="bg-white/10 border-white/20" />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="section3" className="mt-6">
                      <div className="space-y-8">
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold">Launch Operations</h3>
                          <div className="grid gap-4">
                            <Input placeholder="Launch Site Name" className="bg-white/10 border-white/20" />
                            <Input placeholder="Launch Date" type="date" className="bg-white/10 border-white/20" />
                            <Textarea placeholder="Launch Operations Description" className="bg-white/10 border-white/20 min-h-[100px]" />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="section4" className="mt-6">
                      <div className="space-y-8">
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold">Safety Analysis</h3>
                          <div className="grid gap-4">
                            <Textarea placeholder="Risk Assessment" className="bg-white/10 border-white/20 min-h-[100px]" />
                            <Textarea placeholder="Safety Measures" className="bg-white/10 border-white/20 min-h-[100px]" />
                            <Textarea placeholder="Emergency Procedures" className="bg-white/10 border-white/20 min-h-[100px]" />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="section5" className="mt-6">
                      <div className="space-y-8">
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold">Environmental Assessment</h3>
                          <div className="grid gap-4">
                            <Textarea placeholder="Environmental Impact Analysis" className="bg-white/10 border-white/20 min-h-[100px]" />
                            <Textarea placeholder="Mitigation Measures" className="bg-white/10 border-white/20 min-h-[100px]" />
                            <Input placeholder="Environmental Compliance Officer" className="bg-white/10 border-white/20" />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="section6" className="mt-6">
                      <div className="space-y-8">
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold">Additional Documents</h3>
                          <div className="grid gap-4">
                            <div className="flex items-center justify-center w-full">
                              <label className="w-full flex flex-col items-center justify-center px-4 py-6 bg-white/10 border-2 border-white/20 border-dashed rounded-lg cursor-pointer hover:bg-white/5">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <Upload className="h-8 w-8 text-white/60 mb-2" />
                                  <p className="mb-2 text-sm text-white/80">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                  </p>
                                  <p className="text-xs text-white/60">PDF, DOC, DOCX up to 10MB</p>
                                </div>
                                <input type="file" className="hidden" />
                              </label>
                            </div>
                            <Textarea placeholder="Additional Notes" className="bg-white/10 border-white/20 min-h-[100px]" />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </ApplicationProvider>
  );
} 