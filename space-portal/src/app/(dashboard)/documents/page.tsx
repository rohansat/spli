"use client";

import { useState } from "react";
import { useApplication } from "@/components/providers/ApplicationProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileUp, FileText, Mail, File, Download, Search, Filter, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Document } from "@/types";

export default function DocumentManagement() {
  const { documents, applications, uploadDocument } = useApplication();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All Documents");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<string>("");
  const [documentType, setDocumentType] = useState<Document["type"]>("attachment");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !documentType) return;

    const newDocument = {
      name: selectedFile.name,
      type: documentType,
      applicationId: selectedApplication || undefined,
      fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
      url: URL.createObjectURL(selectedFile),
    };

    uploadDocument(newDocument);
    setIsUploadDialogOpen(false);
    setSelectedFile(null);
    setSelectedApplication("");
    setDocumentType("attachment");
  };

  return (
    <div className="min-h-screen bg-black px-8 pt-24">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-[28px] font-medium text-white mb-2">DOCUMENT MANAGEMENT</h1>
            <p className="text-zinc-500">
              Manage all documents related to your aerospace licensing applications
            </p>
          </div>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-white hover:bg-white/90 text-black gap-2 px-4 py-2 rounded-md flex items-center"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                UPLOAD DOCUMENT
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black border border-zinc-800 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-medium">UPLOAD DOCUMENT</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Upload a document to associate with an application
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <label className="text-lg font-medium text-white">Select File</label>
                  <div className="relative">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.txt"
                    />
                    <div 
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="w-full h-10 bg-[#161616] border border-zinc-800 rounded-md pl-4 pr-10 text-sm text-zinc-400 flex items-center cursor-pointer"
                    >
                      {selectedFile ? selectedFile.name : "Choose File"}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-lg font-medium text-white">Associated Application</label>
                  <select
                    value={selectedApplication}
                    onChange={(e) => setSelectedApplication(e.target.value)}
                    className="w-full h-10 bg-[#161616] border border-zinc-800 rounded-md px-4 text-sm text-white appearance-none cursor-pointer"
                  >
                    <option value="">Select an application</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-lg font-medium text-white">Document Type</label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as Document["type"])}
                    className="w-full h-10 bg-[#161616] border border-zinc-800 rounded-md px-4 text-sm text-white appearance-none cursor-pointer"
                  >
                    <option value="attachment">Attachment</option>
                    <option value="application">Application</option>
                    <option value="email">Email</option>
                    <option value="license">License</option>
                  </select>
                </div>
              </div>

              <DialogFooter className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsUploadDialogOpen(false)}
                  className="border-zinc-800 text-white hover:bg-zinc-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile}
                  className="bg-white text-black hover:bg-white/90"
                >
                  UPLOAD
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-[#161616] border border-zinc-800 rounded-md pl-10 pr-4 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>
          <Button 
            variant="outline" 
            className="border-zinc-800 hover:bg-[#161616] text-white gap-2 px-4 h-10"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        <div className="bg-[#111111] rounded-lg border border-zinc-800/50 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-medium text-white mb-1">Document Library</h2>
            <p className="text-sm text-zinc-400">View and manage your documents</p>
            
            <div className="flex gap-6 mt-6 mb-6">
              {["All Documents", "Applications", "Attachments", "Emails", "Licenses"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "text-sm pb-2 border-b-2",
                    activeTab === tab
                      ? "text-white border-white"
                      : "text-zinc-400 border-transparent hover:text-white"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-[2fr,1fr,1fr,2fr,0.5fr] gap-4 py-4 text-sm text-zinc-400 border-b border-zinc-800">
              <div>Document</div>
              <div>Type</div>
              <div>Size</div>
              <div>Associated Application</div>
              <div className="text-right">Actions</div>
            </div>

            {documents.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-zinc-400 text-sm">No documents found</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {documents.map((doc) => (
                  <div key={doc.id} className="grid grid-cols-[2fr,1fr,1fr,2fr,0.5fr] gap-4 py-4 text-sm items-center">
                    <div className="flex items-center gap-2 text-white">
                      <FileText className="h-4 w-4 text-blue-400" />
                      {doc.name}
                    </div>
                    <div className="text-zinc-400">{doc.type}</div>
                    <div className="text-zinc-400">{doc.fileSize}</div>
                    <div className="text-zinc-400">{doc.applicationId}</div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
