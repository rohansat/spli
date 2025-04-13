"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApplication } from "@/components/providers/ApplicationProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Application } from "@/types";
import { Clock, FilePlus, Rocket } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ApplicationCardProps {
  application: Application;
  onSelect: (id: string) => void;
}

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { applications, createApplication, isLoading } = useApplication();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newApplicationName, setNewApplicationName] = useState("");
  const [newApplicationType, setNewApplicationType] = useState<Application["type"]>("Part 450");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateApplication = async () => {
    if (newApplicationName.trim() === "") return;
    
    try {
      setIsCreating(true);
      const newApp = await createApplication(newApplicationName, newApplicationType);
      setIsDialogOpen(false);
      setNewApplicationName("");
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
        return "secondary"
      case "under_review":
        return "outline"
      case "submitted":
        return "destructive"
      case "approved":
        return "default"
      default:
        return "secondary"
    }
  }

  const pendingActions = applications.filter(
    (application) => application.status === "submitted"
  );
  const activeApplications = applications.filter(
    (application) => application.status === "approved"
  );
  const pendingApproval = applications.filter(
    (application) => application.status === "under_review"
  );

  // Get launch status items
  const launchStatusItems = applications.filter(app => 
    app.status === "approved" || app.status === "under_review"
  );

  return (
    <div className="min-h-screen bg-black px-8 pt-24">
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
                    Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'John Doe'}. Manage your aerospace licensing applications.
                  </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-zinc-800 hover:bg-zinc-700 text-white border-0 gap-2 h-10 px-4">
                      <Clock className="h-4 w-4" />
                      NEW APPLICATION
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#1A1A1A] border border-zinc-800">
                    <DialogHeader>
                      <DialogTitle className="text-white text-lg">Create New Application</DialogTitle>
                      <DialogDescription className="text-zinc-400">
                        Fill in the details to start a new license application.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">
                          Application Name
                        </label>
                        <Input
                          value={newApplicationName}
                          onChange={(e) => setNewApplicationName(e.target.value)}
                          placeholder="Enter application name"
                          className="bg-[#111111] border-zinc-800 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">
                          Application Type
                        </label>
                        <select
                          value={newApplicationType}
                          onChange={(e) => setNewApplicationType(e.target.value as Application["type"])}
                          className="w-full bg-[#111111] border-zinc-800 rounded-md p-2 text-white"
                        >
                          <option value="Part 450">Part 450</option>
                          <option value="License Amendment">License Amendment</option>
                          <option value="Safety Approval">Safety Approval</option>
                        </select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        onClick={handleCreateApplication} 
                        className="bg-zinc-800 hover:bg-zinc-700 text-white border-0"
                        disabled={isCreating}
                      >
                        {isCreating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creating...
                          </>
                        ) : (
                          "Create Application"
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
                        {applications.map((app) => (
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
                              <div className="flex items-center gap-2">
                                {app.status === "submitted" && (
                                  <Badge variant={getStatusBadgeVariant(app.status)} className="ml-2">
                                    {app.status}
                                  </Badge>
                                )}
                              </div>
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
                          .filter(app => app.status === "approved" || app.status === "under_review")
                          .map((app) => (
                            <div key={app.id} className="p-4 rounded-lg bg-[#111111]">
                              <div className="flex items-center gap-2 mb-2">
                                <div className={cn(
                                  "h-1.5 w-1.5 rounded-full",
                                  app.status === "approved" ? "bg-[#22C55E]" : "bg-[#FFB224]"
                                )} />
                                <h3 className="font-medium text-white text-xs">
                                  {app.status === "approved" ? "ACTIVE LICENSE" : "PENDING APPROVAL"}
                                </h3>
                              </div>
                              <p className="text-sm text-zinc-500 mb-1">{app.name}</p>
                              <p className="text-[11px] text-zinc-600">
                                {app.status === "approved" ? "May 15, 2025 - June 30, 2025" : `Submitted on ${formatDate(app.updatedAt)}`}
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
                                <div className="flex items-center gap-2">
                                  {app.status === "submitted" && (
                                    <Badge variant={getStatusBadgeVariant(app.status)} className="ml-2">
                                      {app.status}
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="py-5 text-[15px] text-zinc-400">{formatDate(app.createdAt)}</td>
                              <td className="py-5 text-[15px] text-zinc-400">{formatDate(app.updatedAt)}</td>
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
      <Footer />
    </div>
  );
}
