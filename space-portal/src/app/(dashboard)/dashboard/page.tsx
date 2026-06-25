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
import { Clock, FilePlus, Rocket, Trash2, AlertCircle, CheckCircle2, FileText, Plus, Upload, ChevronDown } from "lucide-react";
import { useSession } from 'next-auth/react';
import { cn } from "@/lib/utils";
import { Footer } from "@/components/Footer";
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

  const getStatusBadgeClass = (status: Application["status"]) => {
    switch (status) {
      case "draft":
        return "border-white/15 bg-white/10 text-white/80";
      case "under_review":
        return "border-amber-500/30 bg-amber-500/10 text-amber-200";
      case "submitted":
        return "border-orange-500/30 bg-orange-500/10 text-orange-200";
      case "approved":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
      case "pending_approval":
        return "border-blue-500/30 bg-blue-500/10 text-blue-200";
      default:
        return "border-white/15 bg-white/10 text-white/80";
    }
  };

  const applicationListItemClass =
    'min-h-[96px] rounded-xl border border-white/[0.06] bg-black/30 p-4';

  const getStatusDotClass = (status: Application["status"]) => {
    switch (status) {
      case "approved":
        return "bg-emerald-400";
      case "pending_approval":
        return "bg-blue-400";
      case "under_review":
        return "bg-amber-400";
      case "submitted":
        return "bg-orange-400";
      default:
        return "bg-white/40";
    }
  };

  const getStatusLabel = (status: Application["status"]) => {
    switch (status) {
      case "approved":
        return "ACTIVE LICENSE";
      case "pending_approval":
        return "PENDING APPROVAL";
      case "under_review":
        return "UNDER REVIEW";
      case "submitted":
        return "SUBMITTED";
      default:
        return getStatusDisplay(status).toUpperCase();
    }
  };

  const draftApplications = applications.filter(
    (app) => app.status !== "pending_approval" && app.status !== "approved"
  );
  const launchApplications = applications.filter(
    (app) =>
      app.status === "approved" ||
      app.status === "under_review" ||
      app.status === "pending_approval"
  );
  const dialogFieldClass =
    'w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/35 transition-colors focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10';

  const stats = [
    {
      label: "Total applications",
      value: applications.length,
      icon: FileText,
    },
    {
      label: "Needs action",
      value: draftApplications.length,
      icon: AlertCircle,
    },
    {
      label: "Pending approval",
      value: applications.filter((a) => a.status === "pending_approval").length,
      icon: Clock,
    },
    {
      label: "Approved",
      value: applications.filter((a) => a.status === "approved").length,
      icon: CheckCircle2,
    },
  ];

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
    <div className="relative min-h-screen flex flex-col bg-black">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <main className="relative flex-1 px-6 pt-24 pb-32 lg:px-10">
        <div className="mx-auto max-w-[1400px]">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white" />
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/40">
                    Mission control
                  </p>
                  <h1 className="mt-3 text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-tight text-white">
                    WORKBENCH
                  </h1>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/50">
                    Welcome back, {user?.name || user?.email?.split('@')[0] || 'John Doe'}. Manage your aerospace licensing applications.
                  </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="h-11 gap-2 rounded-full border-0 bg-white px-6 text-sm font-semibold text-black hover:bg-white/90">
                      <Plus className="h-4 w-4" />
                      NEW APPLICATION
                    </Button>
                  </DialogTrigger>
                    <DialogContent className="max-w-md w-full overflow-hidden border border-white/[0.08] bg-black/95 p-0 text-white shadow-2xl shadow-black/50 backdrop-blur-xl sm:rounded-2xl [&>button]:right-5 [&>button]:top-5 [&>button]:rounded-full [&>button]:border [&>button]:border-white/[0.08] [&>button]:bg-white/[0.03] [&>button]:p-2 [&>button]:text-white/50 [&>button]:opacity-100 [&>button]:transition-colors [&>button]:hover:bg-white/[0.06] [&>button]:hover:text-white">
                      <div className="border-b border-white/[0.06] px-6 pb-4 pt-6">
                        <DialogHeader className="space-y-0">
                          <div className="flex items-start gap-3 pr-8">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]">
                              <FilePlus className="h-4 w-4 text-blue-300/80" />
                            </div>
                            <div>
                              <DialogTitle className="text-sm font-semibold uppercase tracking-wide text-white">
                                Create new application
                              </DialogTitle>
                              <DialogDescription className="mt-1 text-xs leading-relaxed text-white/45">
                                Fill in the details to start a new license application.
                              </DialogDescription>
                            </div>
                          </div>
                        </DialogHeader>
                      </div>

                      <div className="space-y-5 px-6 py-5">
                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wide text-white/60">
                            Application name
                          </label>
                          <Input
                            value={newApplicationName}
                            onChange={(e) => setNewApplicationName(e.target.value)}
                            placeholder="e.g., Mars Lander Launch Vehicle"
                            className={dialogFieldClass}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wide text-white/60">
                            Application type
                          </label>
                          <div className="relative">
                            <select
                              value={newApplicationType}
                              onChange={(e) => setNewApplicationType(e.target.value as Application["type"])}
                              className={cn(dialogFieldClass, 'appearance-none pr-10')}
                            >
                              <option value="Part 450">Part 450</option>
                              <option value="License Amendment">License Amendment</option>
                              <option value="Safety Approval">Safety Approval</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-medium uppercase tracking-wide text-white/60">
                            Upload document
                          </label>
                          <input
                            type="file"
                            id="application-upload"
                            className="hidden"
                            onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                          />
                          <label htmlFor="application-upload" className="block cursor-pointer">
                            <div
                              className={cn(
                                'flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors',
                                uploadedFile
                                  ? 'border-white/[0.12] bg-white/[0.04]'
                                  : 'border-dashed border-white/[0.12] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                              )}
                            >
                              {uploadedFile ? (
                                <span className="truncate text-sm text-white">{uploadedFile.name}</span>
                              ) : (
                                <span className="text-sm text-white/35">e.g., Relevant Documents</span>
                              )}
                              <Upload className="ml-auto h-4 w-4 shrink-0 text-white/40" />
                            </div>
                          </label>
                        </div>
                      </div>

                      <DialogFooter className="gap-2 border-t border-white/[0.06] px-6 py-4 sm:justify-end">
                        <Button
                          variant="ghost"
                          onClick={() => setIsDialogOpen(false)}
                          className="h-10 rounded-full border border-white/[0.12] bg-transparent px-6 text-sm text-white/70 hover:bg-white/[0.04] hover:text-white"
                          type="button"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateApplication}
                          className="h-10 rounded-full bg-white px-6 text-sm font-semibold text-black hover:bg-white/90"
                          disabled={isCreating}
                          type="button"
                        >
                          {isCreating ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-black" />
                              Creating...
                            </>
                          ) : (
                            'Create'
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
              </Dialog>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {stats.map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="h-4 w-4 text-blue-300/70" />
                      <span className="text-2xl font-semibold tabular-nums text-white">{value}</span>
                    </div>
                    <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-white/40">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-xl shadow-black/20">
                  <div className="border-b border-white/[0.06] px-6 py-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-300/80" />
                      <h2 className="text-sm font-semibold uppercase tracking-wide text-white">
                        Pending Actions
                      </h2>
                    </div>
                    <p className="mt-1 text-xs text-white/45">
                      Applications that require your attention
                    </p>
                  </div>
                  <div className="p-4">
                {applications.length === 0 ? (
                  <div className="py-10 text-center">
                    <FilePlus className="mx-auto mb-3 h-8 w-8 text-white/20" />
                    <p className="text-sm text-white/50">No active applications</p>
                    <p className="text-xs text-white/30">Create your first application to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {draftApplications.map((app) => (
                      <Link
                        key={app.id}
                        href={`/applications/${app.id}`}
                        className={cn(
                          applicationListItemClass,
                          'block transition-colors hover:border-white/12 hover:bg-white/[0.04]'
                        )}
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <div className={cn('h-1.5 w-1.5 rounded-full', getStatusDotClass(app.status))} />
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-white/70">
                            {getStatusLabel(app.status)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-white">{app.name}</p>
                        <p className="mt-1 text-xs text-white/40">
                          {app.type} • Last updated {formatDate(app.updatedAt)}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
                  </div>
                </Card>

                <Card className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-xl shadow-black/20">
                  <div className="border-b border-white/[0.06] px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Rocket className="h-4 w-4 text-blue-300/80" />
                      <h2 className="text-sm font-semibold uppercase tracking-wide text-white">
                        Launch Status
                      </h2>
                    </div>
                    <p className="mt-1 text-xs text-white/45">Recent and upcoming launches</p>
                  </div>
                  <div className="p-4">
                {applications.length === 0 ? (
                  <div className="py-10 text-center">
                    <Rocket className="mx-auto mb-3 h-8 w-8 text-white/20" />
                    <p className="text-sm text-white/50">No launches yet</p>
                    <p className="text-xs text-white/30">Your approved launches will appear here</p>
                  </div>
                ) : launchApplications.length === 0 ? (
                  <div className="py-10 text-center">
                    <Rocket className="mx-auto mb-3 h-8 w-8 text-white/20" />
                    <p className="text-sm text-white/50">No launches in review yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {launchApplications.map((app) => (
                        <div key={app.id} className={applicationListItemClass}>
                          <div className="mb-2 flex items-center gap-2">
                            <div className={cn('h-1.5 w-1.5 rounded-full', getStatusDotClass(app.status))} />
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-white/70">
                              {getStatusLabel(app.status)}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-white">{app.name}</p>
                          <p className="mt-1 text-xs text-white/40">
                            {app.status === "approved"
                              ? "May 15, 2025 - June 30, 2025"
                              : `Submitted on ${formatDate(app.updatedAt)}`}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
                  </div>
                </Card>
              </div>

              <Card className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-xl shadow-black/20">
                <div className="border-b border-white/[0.06] px-6 py-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-white">
                    All Applications
                  </h2>
                  <p className="mt-1 text-xs text-white/45">
                    Complete history of your license applications
                  </p>
                </div>
                <div className="p-4 lg:p-6">
              {applications.length === 0 ? (
                <div className="py-10 text-center">
                  <FilePlus className="mx-auto mb-3 h-8 w-8 text-white/20" />
                  <p className="text-sm text-white/50">No applications yet</p>
                  <p className="text-xs text-white/30">Create your first application to get started</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="border-b border-white/[0.08] text-left">
                        <th className="pb-3 text-[11px] font-semibold uppercase tracking-wide text-white/40">Name</th>
                        <th className="pb-3 text-[11px] font-semibold uppercase tracking-wide text-white/40">Type</th>
                        <th className="pb-3 text-[11px] font-semibold uppercase tracking-wide text-white/40">Status</th>
                        <th className="pb-3 text-[11px] font-semibold uppercase tracking-wide text-white/40">Created</th>
                        <th className="pb-3 text-[11px] font-semibold uppercase tracking-wide text-white/40">Last Update</th>
                        <th className="pb-3 text-right text-[11px] font-semibold uppercase tracking-wide text-white/40">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr
                          key={app.id}
                          className="cursor-pointer border-b border-white/[0.06] transition-colors hover:bg-white/[0.03]"
                          onClick={() => router.push(`/applications/${app.id}`)}
                        >
                          <td className="py-4 text-sm font-medium text-white">{app.name}</td>
                          <td className="py-4 text-sm text-white/50">{app.type}</td>
                          <td className="py-4">
                            <span
                              className={cn(
                                'inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide',
                                getStatusBadgeClass(app.status)
                              )}
                            >
                              {getStatusDisplay(app.status)}
                            </span>
                          </td>
                          <td className="py-4 text-sm text-white/50">{formatDate(app.createdAt)}</td>
                          <td className="py-4 text-sm text-white/50">{formatDate(app.updatedAt)}</td>
                          <td className="py-4 text-right">
                              <button
                                className="inline-flex items-center justify-center rounded-lg p-2 text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleDeleteApplication(app.id);
                                }}
                                title="Delete Application"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
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
