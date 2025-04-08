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

// Mock user data
const DEMO_USER = {
  name: "Demo User",
  initials: "DU",
  email: "demo@example.com"
};

export default function DemoPage() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newApplicationName, setNewApplicationName] = useState("");
  const [newApplicationType, setNewApplicationType] = useState<Application["type"]>("Part 450");
  const [documentDescription, setDocumentDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

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
                      <TableRow>
                        <TableCell>Starship Launch Vehicle</TableCell>
                        <TableCell>Part 450</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-300">
                            Under Review
                          </span>
                        </TableCell>
                        <TableCell>Mar 15, 2024</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Falcon Heavy Amendment</TableCell>
                        <TableCell>License Amendment</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-300">
                            Active
                          </span>
                        </TableCell>
                        <TableCell>Mar 10, 2024</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
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