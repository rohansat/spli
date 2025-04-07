"use client";

import { useState } from "react";
import { useApplication } from "@/components/providers/ApplicationProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileUp, FileText, Mail, File, Download, Search, Filter, Trash2 } from "lucide-react";
import { Document } from "@/types";

export default function DocumentsPage() {
  const { documents, applications } = useApplication();
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState("");
  const [documentType, setDocumentType] = useState<"application" | "attachment" | "email" | "license">("attachment");

  // Filter documents based on search query
  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group documents by type
  const applicationDocs = filteredDocuments.filter((doc) => doc.type === "application");
  const attachmentDocs = filteredDocuments.filter((doc) => doc.type === "attachment");
  const emailDocs = filteredDocuments.filter((doc) => doc.type === "email");
  const licenseDocs = filteredDocuments.filter((doc) => doc.type === "license");

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get document icon based on type
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "application":
        return <FileText className="h-4 w-4 text-blue-400" />;
      case "email":
        return <Mail className="h-4 w-4 text-purple-400" />;
      case "attachment":
        return <File className="h-4 w-4 text-yellow-400" />;
      case "license":
        return <FileText className="h-4 w-4 text-green-400" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle file upload (mock)
  const handleUpload = () => {
    if (!selectedFile || !selectedApplicationId) return;

    // Reset form
    setIsUploadDialogOpen(false);
    setSelectedFile(null);
    setSelectedApplicationId("");
    setDocumentType("attachment");
  };

  return (
    <div className="space-container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">DOCUMENT MANAGEMENT</h1>
          <p className="text-white/60">
            Manage all documents related to your aerospace licensing applications
          </p>
        </div>

        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="spacex-button mt-4 md:mt-0">
              <FileUp className="mr-2 h-4 w-4" />
              UPLOAD DOCUMENT
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black text-white border border-white/20">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription className="text-white/60">
                Upload a document to associate with an application
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="file" className="text-sm font-medium">
                  Select File
                </label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileSelect}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="application" className="text-sm font-medium">
                  Associated Application
                </label>
                <select
                  id="application"
                  value={selectedApplicationId}
                  onChange={(e) => setSelectedApplicationId(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md"
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
                <label htmlFor="type" className="text-sm font-medium">
                  Document Type
                </label>
                <select
                  id="type"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as "application" | "attachment" | "email" | "license")}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md"
                >
                  <option value="application">Application</option>
                  <option value="attachment">Attachment</option>
                  <option value="email">Email</option>
                  <option value="license">License</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsUploadDialogOpen(false)}
                className="border-white/40 text-white"
              >
                Cancel
              </Button>
              <Button onClick={handleUpload} className="spacex-button">
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative w-full md:w-auto flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
          <Input
            placeholder="Search documents..."
            className="pl-10 bg-white/10 border-white/20 text-white w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="border-white/40 text-white">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <Card className="space-card">
        <CardHeader>
          <CardTitle>Document Library</CardTitle>
          <CardDescription className="text-white/60">
            View and manage your documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-6">
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

            <TabsContent value="all" className="space-y-4">
              <DocumentTable documents={filteredDocuments} />
            </TabsContent>

            <TabsContent value="applications" className="space-y-4">
              <DocumentTable documents={applicationDocs} />
            </TabsContent>

            <TabsContent value="attachments" className="space-y-4">
              <DocumentTable documents={attachmentDocs} />
            </TabsContent>

            <TabsContent value="emails" className="space-y-4">
              <DocumentTable documents={emailDocs} />
            </TabsContent>

            <TabsContent value="licenses" className="space-y-4">
              <DocumentTable documents={licenseDocs} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  // Document table component
  function DocumentTable({ documents }: { documents: Document[] }) {
    return documents.length > 0 ? (
      <Table>
        <TableHeader>
          <TableRow className="border-white/10">
            <TableHead className="text-white">Document</TableHead>
            <TableHead className="text-white">Type</TableHead>
            <TableHead className="text-white">Size</TableHead>
            <TableHead className="text-white">Uploaded</TableHead>
            <TableHead className="text-white">Associated Application</TableHead>
            <TableHead className="text-white w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => {
            const associatedApp = applications.find(
              (app) => app.id === doc.applicationId
            );

            return (
              <TableRow key={doc.id} className="border-white/10">
                <TableCell className="font-medium text-white flex items-center gap-2">
                  {getDocumentIcon(doc.type)}
                  {doc.name}
                </TableCell>
                <TableCell className="text-white/80 capitalize">
                  {doc.type}
                </TableCell>
                <TableCell className="text-white/60">{doc.fileSize}</TableCell>
                <TableCell className="text-white/60">
                  {formatDate(doc.uploadedAt)}
                </TableCell>
                <TableCell className="text-white/80">
                  {associatedApp ? associatedApp.name : "N/A"}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-white/40"
                    >
                      <Download className="h-4 w-4 text-white" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-white/40"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    ) : (
      <div className="text-center py-8 text-white/60">
        <File className="mx-auto h-10 w-10 mb-4 opacity-50" />
        <p>No documents found</p>
        {searchQuery && (
          <p className="text-sm">Try a different search query</p>
        )}
      </div>
    );
  }
}
