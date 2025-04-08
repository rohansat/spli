"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, X } from "lucide-react";
import { useApplication } from "@/components/providers/ApplicationProvider";

export default function DashboardPage() {
  const router = useRouter();
  const { applications, createApplication } = useApplication();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newApplicationName, setNewApplicationName] = useState("");
  const [documentDescription, setDocumentDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setNewApplicationName("");
    setDocumentDescription("");
    setUploadedFiles([]);
  };

  const handleCreateApplication = async () => {
    setIsCreating(true);
    try {
      // Here you would typically upload the files to your storage service
      // and get back URLs or file identifiers
      
      const newApplication = await createApplication({
        name: newApplicationName,
        documents: documentDescription,
        // Add file references here once implemented
      });
      
      closeDialog();
      router.push(`/applications/${newApplication.id}`);
    } catch (error) {
      console.error("Error creating application:", error);
    }
    setIsCreating(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create New Application</Button>
      </DialogTrigger>
      <DialogContent className="bg-black text-white border border-white/20">
        <DialogHeader>
          <DialogTitle>Create New Application</DialogTitle>
          <DialogDescription className="text-white/60">
            Start a new Part 450 License Application
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
              placeholder="e.g., Falcon Heavy Launch License"
              className="bg-white/10 border-white/20 text-white"
            />
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
          <Button variant="outline" onClick={closeDialog} className="border-white/40 text-white">
            Cancel
          </Button>
          <Button onClick={handleCreateApplication} disabled={isCreating} className="spacex-button">
            {isCreating ? "Creating..." : "Create Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 