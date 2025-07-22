"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApplication } from "@/components/providers/ApplicationProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Application } from "@/types";
import { Clock, FilePlus, Rocket, Trash2 } from "lucide-react";
import { useSession } from 'next-auth/react';
import { cn } from "@/lib/utils";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { AICursor } from "@/components/ui/ai-cursor";
import { AICursorButton } from "@/components/ui/ai-cursor-button";

export default function Dashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const { applications, createApplication, uploadDocument, isLoading, removeApplication } = useApplication();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newApplicationName, setNewApplicationName] = useState("");
  const [newApplicationType, setNewApplicationType] = useState<Application["type"]>("Part 450");
  const [isCreating, setIsCreating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showAICursor, setShowAICursor] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appIdToDelete, setAppIdToDelete] = useState<string | null>(null);

  const handleCreateApplication = async () => {
    if (newApplicationName.trim() === "") return;
    
    try {
      setIsCreating(true);
      const newApp = await createApplication(newApplicationName, newApplicationType);
      if (uploadedFile) {
        await uploadDocument({
          name: uploadedFile.name,
          type: "attachment",
          applicationId: newApp.id,
          applicationName: newApp.name,
          fileSize: `${(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB`,
          url: URL.createObjectURL(uploadedFile),
          userId: user?.email || ""
        });
      }
    setIsDialogOpen(false);
    setNewApplicationName("");
      setUploadedFile(null);
    router.push(`/applications/${newApp.id}`);
    } catch (error) {
      console.error("Error creating application:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeVariant = (status: Application["status"]) => {
    switch (status) {
      case "draft":
        return "secondary";
      case "under_review":
        return "outline";
      case "submitted":
        return "destructive";
      case "approved":
        return "default";
      case "pending_approval":
        return "default";
      default:
        return "secondary";
    }
  };

  const getStatusDisplay = (status: Application["status"]) => {
    switch (status) {
      case "draft":
        return "Draft";
      case "under_review":
        return "Under Review";
      case "submitted":
        return "Submitted";
      case "approved":
        return "Approved";
      case "pending_approval":
        return "Pending Approval";
      default:
        return status;
    }
  };

  const handleDeleteApplication = (appId: string) => {
    setAppIdToDelete(appId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteApplication = async () => {
    if (appIdToDelete) {
      await removeApplication(appIdToDelete);
      setAppIdToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const cancelDeleteApplication = () => {
    setAppIdToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleAIFillForm = (suggestions: Record<string, string>) => {
    // For dashboard, we'll use the suggestions to pre-fill the application name
    if (suggestions.missionObjective) {
      setNewApplicationName(suggestions.missionObjective);
    }
  };

  // Dashboard form fields for AI
  const dashboardFormFields = [
    { name: 'missionObjective', label: 'Mission Objective', type: 'textarea' },
    { name: 'applicationName', label: 'Application Name', type: 'text' },
    { name: 'applicationType', label: 'Application Type', type: 'select' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <main className="flex-1 px-8 pt-24 pb-32">
        <div className="max-w-[1400px] mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            <>
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[28px] font-medium text-white mb-1">MISSION CONTROL</h1>
              <p className="text-zinc-500">
                Welcome back, {user?.name || user?.email?.split('@')[0] || 'John Doe'}. Manage your aerospace licensing applications.
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-zinc-800 hover:bg-zinc-700 text-white border-0 gap-2 h-10 px-4">
                  <Clock className="h-4 w-4" />
                  NEW APPLICATION
                </Button>
              </DialogTrigger>
                    <DialogContent className="bg-black border border-[#222] rounded-xl p-8 max-w-md w-full text-white font-sans">
                <DialogHeader>
                        <DialogTitle className="text-white text-2xl font-bold tracking-tight mb-1">CREATE NEW APPLICATION</DialogTitle>
                        <DialogDescription className="text-zinc-400 text-base mb-6">
                    Fill in the details to start a new license application.
                  </DialogDescription>
                </DialogHeader>
                      <div className="space-y-6">
                  <div className="space-y-2">
                          <label className="text-base font-semibold text-white">Application Name</label>
                    <Input
                      value={newApplicationName}
                      onChange={(e) => setNewApplicationName(e.target.value)}
                            placeholder="e.g., Mars Lander Launch Vehicle"
                            className="bg-[#181818] border border-[#444] text-white text-base px-4 py-3 rounded-md placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#444]"
                    />
                  </div>
                  <div className="space-y-2">
                          <label className="text-base font-semibold text-white">Application Type</label>
                    <select
                      value={newApplicationType}
                      onChange={(e) => setNewApplicationType(e.target.value as Application["type"])}
                            className="w-full bg-[#181818] border border-[#444] rounded-md px-4 py-3 text-base text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#444]"
                    >
                      <option value="Part 450">Part 450</option>
                      <option value="License Amendment">License Amendment</option>
                      <option value="Safety Approval">Safety Approval</option>
                    </select>
                  </div>
                        <div className="space-y-2">
                          <label className="text-base font-semibold text-white">Upload Document</label>
                          <input
                            type="file"
                            id="application-upload"
                            className="hidden"
                            onChange={e => setUploadedFile(e.target.files?.[0] || null)}
                          />
                          <label htmlFor="application-upload" className="block cursor-pointer">
                            <div className="bg-[#181818] border border-[#444] text-white rounded-md px-4 py-3 w-full flex items-center gap-2 placeholder-zinc-400">
                              {uploadedFile ? (
                                <span className="truncate text-base">{uploadedFile.name}</span>
                              ) : (
                                <span className="text-zinc-400 text-base">e.g., Relevant Documents</span>
                              )}
                              <svg className="ml-auto" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                            </div>
                          </label>
                        </div>
                </div>
                      <DialogFooter className="flex justify-end gap-2 mt-8">
                        <Button
                          variant="ghost"
                          onClick={() => setIsDialogOpen(false)}
                          className="bg-transparent border border-[#444] text-white px-8 py-2 rounded-md hover:bg-[#222]"
                          type="button"
                        >
                          Cancel
                        </Button>
                  <Button 
                    onClick={handleCreateApplication} 
                          className="bg-white text-black font-semibold px-8 py-2 rounded-md hover:bg-zinc-200"
                          disabled={isCreating}
                          type="button"
                        >
                          {isCreating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                              Creating...
                            </>
                          ) : (
                            "CREATE"
                          )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <Card className="bg-[#1A1A1A] border-zinc-800/50 rounded-xl overflow-hidden">
              <div className="p-6">
                <h2 className="text-base font-medium text-white mb-1">Pending Actions</h2>
                <p className="text-sm text-zinc-500 mb-6">Applications that require your attention</p>
                
                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <FilePlus className="mx-auto h-8 w-8 text-zinc-700 mb-3" />
                    <p className="text-zinc-400">No active applications</p>
                    <p className="text-zinc-600 text-sm">Create your first application to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {applications
                      .filter(app => app.status !== "pending_approval")
                      .map((app) => (
                      <Link
                        key={app.id}
                        href={`/applications/${app.id}`}
                        className="block p-4 rounded-lg bg-[#111111] hover:bg-[#161616] transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-white text-sm mb-1">{app.name}</h3>
                            <p className="text-xs text-zinc-500">
                              {app.type} • Last updated {formatDate(app.updatedAt)}
                            </p>
                          </div>
                                <Badge variant={getStatusBadgeVariant(app.status)} className="ml-2">
                                  {getStatusDisplay(app.status)}
                                </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            <Card className="bg-[#1A1A1A] border-zinc-800/50 rounded-xl overflow-hidden">
              <div className="p-6">
                <h2 className="text-base font-medium text-white mb-1">Launch Status</h2>
                <p className="text-sm text-zinc-500 mb-6">Recent and upcoming launches</p>
                
                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <Rocket className="mx-auto h-8 w-8 text-zinc-700 mb-3" />
                    <p className="text-zinc-400">No launches yet</p>
                    <p className="text-zinc-600 text-sm">Your approved launches will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications
                      .filter(app => app.status === "approved" || app.status === "under_review" || app.status === "pending_approval")
                      .map((app) => (
                        <div key={app.id} className="p-4 rounded-lg bg-[#111111]">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              app.status === "approved" ? "bg-[#22C55E]" : 
                              app.status === "pending_approval" ? "bg-[#3B82F6]" : "bg-[#FFB224]"
                            )} />
                            <h3 className="font-medium text-white text-xs">
                              {app.status === "approved" ? "ACTIVE LICENSE" : 
                               app.status === "pending_approval" ? "PENDING APPROVAL" : "UNDER REVIEW"}
                            </h3>
                          </div>
                          <p className="text-sm text-zinc-500 mb-1">{app.name}</p>
                          <p className="text-[11px] text-zinc-600">
                            {app.status === "approved" ? "May 15, 2025 - June 30, 2025" : 
                             app.status === "pending_approval" ? `Submitted on ${formatDate(app.updatedAt)}` :
                             `Submitted on ${formatDate(app.updatedAt)}`}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          <Card className="bg-[#1A1A1A] border-zinc-800/50 rounded-xl overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-white mb-1">All Applications</h2>
              <p className="text-sm text-zinc-500 mb-8">Complete history of your license applications</p>
              
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <FilePlus className="mx-auto h-8 w-8 text-zinc-700 mb-3" />
                  <p className="text-zinc-400">No applications yet</p>
                  <p className="text-zinc-600 text-sm">Create your first application to get started</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-zinc-800/50">
                        <th className="pb-4 text-sm font-medium text-white">Name</th>
                        <th className="pb-4 text-sm font-medium text-white">Type</th>
                        <th className="pb-4 text-sm font-medium text-white">Status</th>
                        <th className="pb-4 text-sm font-medium text-white">Created</th>
                        <th className="pb-4 text-sm font-medium text-white">Last Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr
                          key={app.id}
                          className="border-b border-zinc-800/50 hover:bg-[#111111] cursor-pointer transition-colors"
                          onClick={() => router.push(`/applications/${app.id}`)}
                        >
                          <td className="py-5 text-[15px] font-medium text-white">{app.name}</td>
                          <td className="py-5 text-[15px] text-zinc-400">{app.type}</td>
                          <td className="py-5">
                                  <Badge variant={getStatusBadgeVariant(app.status)} className="ml-2">
                                    {getStatusDisplay(app.status)}
                                  </Badge>
                          </td>
                          <td className="py-5 text-[15px] text-zinc-400">{formatDate(app.createdAt)}</td>
                          <td className="py-5 text-[15px] text-zinc-400">
                            <div className="flex items-center justify-between w-full">
                              <span>{formatDate(app.updatedAt)}</span>
                              <button
                                className="ml-8 inline-flex items-center justify-center text-zinc-400 hover:text-red-500"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleDeleteApplication(app.id);
                                }}
                                title="Delete Application"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        </div>
            </>
          )}
      </div>
      </main>
      <Footer />

      {/* AI Cursor Button */}
      <AICursorButton onClick={() => setShowAICursor(true)} />

      {/* AI Cursor Modal */}
      <AICursor
        isVisible={showAICursor}
        onClose={() => setShowAICursor(false)}
        onFillForm={async (suggestions) => {
          // Detect delete command in user input (simple regex for 'delete application ...')
          const deleteRegex = /delete application (.+)/i;
          const userInput = suggestions?.__userInput || '';
          let matchedApp = null;
          if (deleteRegex.test(userInput)) {
            const match = userInput.match(deleteRegex);
            const appName = match && match[1] ? match[1].trim().toLowerCase() : '';
            matchedApp = applications.find(app => app.name.toLowerCase() === appName);
            if (matchedApp) {
              setAppIdToDelete(matchedApp.id);
              setDeleteDialogOpen(true);
              return;
            }
          }
          // Fallback: if user says 'delete my application' and only one exists
          if (/delete my application/i.test(userInput) && applications.length === 1) {
            setAppIdToDelete(applications[0].id);
            setDeleteDialogOpen(true);
            return;
          }
          // Otherwise, normal fill form
          handleAIFillForm(suggestions);
        }}
        formFields={dashboardFormFields}
      />

      {/* Delete Application Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-black border border-[#222] rounded-xl p-8 max-w-md w-full text-white font-sans">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl font-bold tracking-tight mb-1">Delete Application?</DialogTitle>
            <DialogDescription className="text-zinc-400 text-base mb-6">
              Are you sure you want to delete this application? This action cannot be undone and will remove all associated documents.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-8">
            <Button
              variant="ghost"
              onClick={cancelDeleteApplication}
              className="bg-transparent border border-[#444] text-white px-8 py-2 rounded-md hover:bg-[#222]"
              type="button"
            >
              Keep Application
            </Button>
            <Button
              onClick={confirmDeleteApplication}
              className="bg-red-600 text-white font-semibold px-8 py-2 rounded-md hover:bg-red-700"
              type="button"
            >
              Delete Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
