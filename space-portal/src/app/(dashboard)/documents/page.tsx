"use client";

import { useState, useEffect } from "react";
import { useApplication } from "@/components/providers/ApplicationProvider";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  FileUp, 
  FileText, 
  Mail, 
  File, 
  Download, 
  Search, 
  Filter, 
  Trash2, 
  Upload, 
  ExternalLink,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Calendar,
  Tag,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Document } from "@/types";
import { Footer } from "@/components/Footer";
import { useToast } from "@/components/ui/use-toast";

interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'document';
  children?: TreeNode[];
  document?: Document;
  isExpanded?: boolean;
  status?: 'draft' | 'review' | 'approved' | 'expired';
  tags?: string[];
  expirationDate?: string;
  uploadedAt?: string;
}

export default function DocumentManagement() {
  const { documents, applications, uploadDocument, removeDocument, refreshDocuments } = useApplication();
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Tree View");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedApplication, setSelectedApplication] = useState("");
  const [documentType, setDocumentType] = useState<Document["type"]>("attachment");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isDocumentDetailsOpen, setIsDocumentDetailsOpen] = useState(false);
  const { toast } = useToast();

  // Debug: Log documents when they change
  useEffect(() => {
    console.log('Documents updated:', documents.length, 'documents');
    console.log('Document types:', documents.map(d => ({ id: d.id, type: d.type, name: d.name, applicationId: d.applicationId })));
  }, [documents]);

  // Expand/Collapse all functionality
  const expandAll = () => {
    const allFolderIds = new Set<string>();
    applications.forEach(app => allFolderIds.add(app.id));
    if (documents.some(doc => !doc.applicationId)) {
      allFolderIds.add('unassigned');
    }
    setExpandedFolders(allFolderIds);
  };

  const collapseAll = () => {
    setExpandedFolders(new Set());
  };

  // Build tree structure from applications and documents
  const buildTreeStructure = (): TreeNode[] => {
    const tree: TreeNode[] = [];
    
    // Create folder for each application
    applications.forEach(app => {
      const appDocuments = documents.filter(doc => doc.applicationId === app.id);
      
      const appNode: TreeNode = {
        id: app.id,
        name: app.name,
        type: 'folder',
        isExpanded: expandedFolders.has(app.id),
        children: appDocuments.map(doc => ({
          id: doc.id,
          name: doc.name,
          type: 'document' as const,
          document: doc,
          status: getDocumentStatus(doc),
          tags: getDocumentTags(doc),
          expirationDate: getDocumentExpiration(doc),
          uploadedAt: doc.uploadedAt
        }))
      };
      
      tree.push(appNode);
    });

    // Add documents without applications to "Unassigned" folder
    const unassignedDocs = documents.filter(doc => !doc.applicationId);
    if (unassignedDocs.length > 0) {
      const unassignedNode: TreeNode = {
        id: 'unassigned',
        name: 'Unassigned Documents',
        type: 'folder',
        isExpanded: expandedFolders.has('unassigned'),
        children: unassignedDocs.map(doc => ({
          id: doc.id,
          name: doc.name,
          type: 'document' as const,
          document: doc,
          status: getDocumentStatus(doc),
          tags: getDocumentTags(doc),
          expirationDate: getDocumentExpiration(doc),
          uploadedAt: doc.uploadedAt
        }))
      };
      tree.push(unassignedNode);
    }

    return tree;
  };

  // Helper functions for document metadata
  const getDocumentStatus = (doc: Document): 'draft' | 'review' | 'approved' | 'expired' => {
    // Get the associated application to determine status
    const associatedApp = doc.applicationId ? applications.find(app => app.id === doc.applicationId) : null;
    
    // License documents - check if expired
    if (doc.type === 'license') {
      const expirationDate = getDocumentExpiration(doc);
      if (expirationDate && new Date(expirationDate) < new Date()) {
        return 'expired';
      }
      return 'approved';
    }
    
    // Application documents - follow application status
    if (doc.type === 'application') {
      if (!associatedApp) return 'draft';
      
      switch (associatedApp.status) {
        case 'draft':
          return 'draft';
        case 'under_review':
        case 'submitted':
        case 'pending_approval':
          return 'review';
        case 'approved':
          return 'approved';
        default:
          return 'draft';
      }
    }
    
    // Email documents - follow application status if associated
    if (doc.type === 'email') {
      if (!associatedApp) return 'draft';
      
      switch (associatedApp.status) {
        case 'draft':
          return 'draft';
        case 'under_review':
        case 'submitted':
        case 'pending_approval':
          return 'review';
        case 'approved':
          return 'approved';
        default:
          return 'draft';
      }
    }
    
    // Attachment documents - follow application status if associated
    if (doc.type === 'attachment') {
      if (!associatedApp) return 'draft';
      
      switch (associatedApp.status) {
        case 'draft':
          return 'draft';
        case 'under_review':
        case 'submitted':
        case 'pending_approval':
          return 'review';
        case 'approved':
          return 'approved';
        default:
          return 'draft';
      }
    }
    
    // Default to draft for unassigned documents
    return 'draft';
  };

  const getDocumentTags = (doc: Document): string[] => {
    const tags: string[] = [doc.type];
    const associatedApp = doc.applicationId ? applications.find(app => app.id === doc.applicationId) : null;
    
    if (doc.applicationId) {
      tags.push('associated');
      
      // Add application status tag
      if (associatedApp) {
        switch (associatedApp.status) {
          case 'draft':
            tags.push('draft');
            break;
          case 'under_review':
            tags.push('reviewing');
            break;
          case 'submitted':
            tags.push('submitted');
            break;
          case 'pending_approval':
            tags.push('pending');
            break;
          case 'approved':
            tags.push('approved');
            break;
        }
      }
    } else {
      tags.push('unassigned');
    }
    
    // Document type specific tags
    if (doc.type === 'license') {
      tags.push('official');
      const expirationDate = getDocumentExpiration(doc);
      if (expirationDate && new Date(expirationDate) < new Date()) {
        tags.push('expired');
      }
    }
    if (doc.type === 'email') tags.push('communication');
    if (doc.type === 'application') tags.push('primary');
    if (doc.type === 'attachment') tags.push('supporting');
    
    return tags;
  };

  const getDocumentExpiration = (doc: Document): string | undefined => {
    // Add expiration logic - for now, licenses expire in 1 year
    if (doc.type === 'license') {
      const uploadDate = new Date(doc.uploadedAt);
      const expirationDate = new Date(uploadDate);
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      return expirationDate.toISOString();
    }
    return undefined;
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'review': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'expired': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-500';
      case 'review': return 'text-yellow-500';
      case 'expired': return 'text-red-500';
      default: return 'text-blue-500';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'review': return 'Under Review';
      case 'expired': return 'Expired';
      case 'draft': return 'Draft';
      default: return 'Unknown';
    }
  };

  const treeStructure = buildTreeStructure();

  // Filter tree based on search query
  const filterTree = (nodes: TreeNode[], query: string): TreeNode[] => {
    if (!query) return nodes;
    
    return nodes.filter(node => {
      if (node.type === 'folder') {
        const filteredChildren = filterTree(node.children || [], query);
        node.children = filteredChildren;
        return filteredChildren.length > 0 || node.name.toLowerCase().includes(query.toLowerCase());
      } else {
        return node.name.toLowerCase().includes(query.toLowerCase()) ||
               node.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
      }
    });
  };

  const filteredTree = filterTree(treeStructure, searchQuery);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !user) return;

    const newDocument = {
      name: selectedFile.name,
      type: documentType,
      applicationId: selectedApplication || undefined,
      fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
      url: URL.createObjectURL(selectedFile),
      userId: user?.email || "",
    };

    uploadDocument(newDocument);
    setIsUploadDialogOpen(false);
    setSelectedFile(null);
    setSelectedApplication("");
  };

  const handleDownload = (doc: Document) => {
    if (doc.type === 'email' && doc.emailMetadata) {
      // For email documents, create a text file with email content
      const emailContent = `Email Details
================

To: ${doc.emailMetadata.recipient}
Subject: ${doc.emailMetadata.subject}
Sent: ${new Date(doc.emailMetadata.sentAt).toLocaleString()}

Message:
${doc.emailMetadata.body}

---
Application Data:
${Object.entries(doc.emailMetadata.applicationData)
  .filter(([_, value]) => value && value.trim() !== '')
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}
`;

      const blob = new Blob([emailContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${doc.name}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // For other documents, use the existing URL
      const link = document.createElement('a');
      link.href = doc.url;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDelete = (docId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      removeDocument(docId);
    }
  };

  const handleDocumentClick = (doc: Document) => {
    setSelectedDocument(doc);
    setIsDocumentDetailsOpen(true);
  };

  const renderTreeNode = (node: TreeNode, level: number = 0) => {
    const indent = level * 20;
    
    if (node.type === 'folder') {
      const isExpanded = expandedFolders.has(node.id);
      const hasChildren = node.children && node.children.length > 0;
      
      return (
        <div key={node.id}>
          <div 
            className={cn(
              "flex items-center py-2 px-3 hover:bg-zinc-800/50 cursor-pointer transition-colors",
              "border-l-2 border-transparent hover:border-blue-500"
            )}
            style={{ paddingLeft: `${indent + 12}px` }}
            onClick={() => toggleFolder(node.id)}
          >
            <div className="flex items-center gap-2 flex-1">
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-zinc-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-zinc-400" />
                )
              ) : (
                <div className="w-4 h-4" />
              )}
              {isExpanded ? (
                <FolderOpen className="h-5 w-5 text-blue-500" />
              ) : (
                <Folder className="h-5 w-5 text-blue-400" />
              )}
              <span className="text-white font-medium">{node.name}</span>
              <span className="text-zinc-500 text-sm">({node.children?.length || 0})</span>
            </div>
          </div>
          
          {isExpanded && node.children && (
            <div>
              {node.children.map(child => renderTreeNode(child, level + 1))}
            </div>
          )}
        </div>
      );
    } else {
      const doc = node.document!;
      const isExpired = node.expirationDate && new Date(node.expirationDate) < new Date();
      
      return (
        <div 
          key={node.id}
          className={cn(
            "flex items-center py-2 px-3 hover:bg-zinc-800/50 cursor-pointer transition-colors",
            "border-l-2 border-transparent hover:border-green-500"
          )}
          style={{ paddingLeft: `${indent + 32}px` }}
          onClick={() => handleDocumentClick(doc)}
        >
          <div className="flex items-center gap-3 flex-1">
            {doc.type === 'email' ? (
              <Mail className="h-4 w-4 text-blue-400" />
            ) : (
              <FileText className="h-4 w-4 text-zinc-400" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white truncate">{node.name}</span>
                {getStatusIcon(node.status || 'draft')}
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span>{doc.fileSize}</span>
                <span>•</span>
                <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                {doc.type === 'email' && doc.emailMetadata && (
                  <>
                    <span>•</span>
                    <span className="text-blue-400">To: {doc.emailMetadata.recipient}</span>
                  </>
                )}
                {node.expirationDate && (
                  <>
                    <span>•</span>
                    <span className={isExpired ? "text-red-500" : "text-zinc-500"}>
                      Expires: {new Date(node.expirationDate).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {node.tags?.map(tag => (
              <span 
                key={tag}
                className="px-2 py-1 text-xs bg-zinc-700 text-zinc-300 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-zinc-800"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(doc);
              }}
              title="Download"
            >
              <Download className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-zinc-800"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(doc.id);
              }}
              title="Delete"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <main className="flex-1 px-8 pt-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-[28px] font-medium text-white mb-2">DOCUMENT MANAGEMENT</h1>
              <p className="text-zinc-500">
                Manage all documents organized by application folders
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={async () => {
                  console.log('Manual refresh triggered');
                  await refreshDocuments();
                  toast({
                    title: "Documents refreshed!",
                    description: `Found ${documents.length} documents in your account.`,
                  });
                }}
                variant="outline"
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 gap-2 px-4 py-2 rounded-md flex items-center"
              >
                <RefreshCw className="h-4 w-4" />
                REFRESH ({documents.length})
              </Button>
              <Button 
                onClick={() => {
                  console.log('Current documents:', documents);
                  console.log('Current applications:', applications);
                  
                  // Check for email documents specifically
                  const emailDocs = documents.filter(doc => doc.type === 'email');
                  console.log('Email documents found:', emailDocs);
                  
                  toast({
                    title: "Debug Info",
                    description: `${documents.length} total docs, ${emailDocs.length} email docs, ${applications.length} applications`,
                  });
                }}
                variant="outline"
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 gap-2 px-4 py-2 rounded-md flex items-center"
              >
                DEBUG
              </Button>
              <Button 
                onClick={async () => {
                  console.log('Testing document refresh...');
                  console.log('User email:', user?.email);
                  
                  // Force a refresh
                  await refreshDocuments();
                  
                  // Check again after refresh
                  const emailDocs = documents.filter(doc => doc.type === 'email');
                  console.log('After refresh - Email documents found:', emailDocs);
                  
                  toast({
                    title: "Refresh Test",
                    description: `Refreshed: ${documents.length} docs, ${emailDocs.length} emails`,
                  });
                }}
                variant="outline"
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 gap-2 px-4 py-2 rounded-md flex items-center"
              >
                TEST REFRESH
              </Button>
              <Button 
                onClick={async () => {
                  console.log('Creating test email document...');
                  
                  // Create a test email document
                  const testEmailDoc = {
                    name: `Test Email: ${new Date().toLocaleString()}`,
                    type: 'email' as const,
                    applicationId: applications[0]?.id || undefined,
                    applicationName: applications[0]?.name || 'Test Application',
                    fileSize: '1.2 KB',
                    url: 'data:text/plain;base64,VGVzdCBlbWFpbCBjb250ZW50',
                    uploadedAt: new Date().toISOString(),
                    userId: user?.email || "",
                    emailMetadata: {
                      recipient: 'test@example.com',
                      subject: 'Test Email',
                      body: 'This is a test email document',
                      sentAt: new Date().toISOString(),
                      applicationData: {},
                      applicationName: 'Test Application'
                    }
                  };
                  
                  try {
                    await uploadDocument(testEmailDoc);
                    console.log('✅ Test email document created successfully');
                    toast({
                      title: "Test Email Created",
                      description: "A test email document has been added to your documents.",
                    });
                  } catch (error) {
                    console.error('❌ Error creating test email document:', error);
                    toast({
                      title: "Error",
                      description: "Failed to create test email document.",
                    });
                  }
                }}
                variant="outline"
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 gap-2 px-4 py-2 rounded-md flex items-center"
              >
                CREATE TEST EMAIL
              </Button>
              <Button 
                onClick={async () => {
                  console.log('Testing email document API...');
                  
                  try {
                    const response = await fetch('/api/test-email-doc', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      }
                    });

                    const data = await response.json();
                    console.log('Test API response:', data);

                    if (response.ok && data.success) {
                      console.log('✅ Test email document created via API');
                      toast({
                        title: "API Test Success",
                        description: `Test email document created with ID: ${data.documentId}`,
                      });
                      
                      // Refresh documents to show the new one
                      await refreshDocuments();
                    } else {
                      throw new Error(data.error || 'API test failed');
                    }
                  } catch (error) {
                    console.error('❌ Error testing email document API:', error);
                    toast({
                      title: "API Test Failed",
                      description: "Failed to create test email document via API.",
                    });
                  }
                }}
                variant="outline"
                className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 gap-2 px-4 py-2 rounded-md flex items-center"
              >
                TEST API
              </Button>
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-white hover:bg-white/90 text-black gap-2 px-4 py-2 rounded-md flex items-center"
                  >
                    <Upload className="h-4 w-4" />
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
                        onChange={handleFileUpload}
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
          </div>

          <div className="flex gap-3 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search documents and folders..."
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
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-medium text-white mb-1">Document Tree</h2>
                  <p className="text-sm text-zinc-400">Organized by application folders</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={expandAll}
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    Expand All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={collapseAll}
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  >
                    Collapse All
                  </Button>
                </div>
              </div>
              
              {/* Status Legend */}
              <div className="flex gap-4 mb-6 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-zinc-400">Approved</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs text-zinc-400">Under Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-zinc-400">Draft</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-xs text-zinc-400">Expired</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-xs text-zinc-500">• Status follows application state</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">• Licenses expire after 1 year</span>
                </div>
              </div>
              
              <div className="space-y-1">
                {filteredTree.length === 0 ? (
                  <div className="py-12 text-center">
                    <Folder className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400 text-sm">No documents found</p>
                  </div>
                ) : (
                  filteredTree.map(node => renderTreeNode(node))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Document Details Dialog */}
      <Dialog open={isDocumentDetailsOpen} onOpenChange={setIsDocumentDetailsOpen}>
        <DialogContent className="bg-black border border-zinc-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-medium">Document Details</DialogTitle>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-zinc-400">Document Name</label>
                  <p className="text-white">{selectedDocument.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-400">Type</label>
                  <p className="text-white capitalize">{selectedDocument.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-400">Status</label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(getDocumentStatus(selectedDocument))}
                    <span className={getStatusColor(getDocumentStatus(selectedDocument))}>
                      {getStatusText(getDocumentStatus(selectedDocument))}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-400">File Size</label>
                  <p className="text-white">{selectedDocument.fileSize}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-400">Uploaded</label>
                  <p className="text-white">{new Date(selectedDocument.uploadedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-400">Associated Application</label>
                  <p className="text-white">
                    {selectedDocument.applicationId 
                      ? applications.find(app => app.id === selectedDocument.applicationId)?.name || 'Unknown'
                      : 'None'
                    }
                  </p>
                </div>
              </div>
              
              {/* Email-specific information */}
              {selectedDocument.type === 'email' && selectedDocument.emailMetadata && (
                <div className="space-y-4">
                  <div className="border-t border-zinc-800 pt-4">
                    <h4 className="text-sm font-medium text-zinc-300 mb-3">Email Details</h4>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="text-xs font-medium text-zinc-400">To</label>
                        <p className="text-white text-sm">{selectedDocument.emailMetadata.recipient}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-zinc-400">Subject</label>
                        <p className="text-white text-sm">{selectedDocument.emailMetadata.subject}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-zinc-400">Sent At</label>
                        <p className="text-white text-sm">{new Date(selectedDocument.emailMetadata.sentAt).toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-zinc-400">Message</label>
                        <div className="bg-zinc-800 p-3 rounded text-sm text-white max-h-32 overflow-y-auto">
                          {selectedDocument.emailMetadata.body}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Tags */}
              <div>
                <label className="text-sm font-medium text-zinc-400 mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {getDocumentTags(selectedDocument).map(tag => (
                    <span 
                      key={tag}
                      className="px-2 py-1 text-xs bg-zinc-700 text-zinc-300 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownload(selectedDocument)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDocumentDetailsOpen(false)}
                  className="border-zinc-800 text-white hover:bg-zinc-800"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
