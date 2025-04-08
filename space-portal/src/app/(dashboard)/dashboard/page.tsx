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
import { Clock, FilePlus, Rocket } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { applications, createApplication } = useApplication();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newApplicationName, setNewApplicationName] = useState("");
  const [newApplicationType, setNewApplicationType] = useState<Application["type"]>("Part 450");

  const handleCreateApplication = () => {
    if (newApplicationName.trim() === "") return;
    const newApp = createApplication(newApplicationName, newApplicationType);
    setIsDialogOpen(false);
    setNewApplicationName("");
    router.push(`/applications/${newApp.id}`);
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
        return "bg-zinc-500/20 text-zinc-300";
      case "under_review":
        return "bg-yellow-500/20 text-yellow-300";
      case "submitted":
        return "bg-blue-500/20 text-blue-300";
      case "approved":
        return "bg-green-500/20 text-green-300";
      default:
        return "bg-zinc-500/20 text-zinc-300";
    }
  };

  // Get active applications (not completed)
  const activeApplications = applications.filter(app => 
    app.status === "draft" || app.status === "under_review" || app.status === "submitted"
  );

  // Get launch status items
  const launchStatusItems = applications.filter(app => 
    app.status === "approved" || app.status === "under_review"
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-3xl font-semibold text-white mb-2">Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'John Doe'}.</h1>
          <p className="text-lg text-zinc-400">
            Manage your aerospace licensing applications.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-white text-black hover:bg-white/90 font-medium">
              <Clock className="mr-2 h-4 w-4" />
              NEW APPLICATION
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black border border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Application</DialogTitle>
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
                  className="bg-zinc-900 border-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Application Type
                </label>
                <select
                  value={newApplicationType}
                  onChange={(e) => setNewApplicationType(e.target.value as Application["type"])}
                  className="w-full bg-zinc-900 border-zinc-700 rounded-md p-2 text-white"
                >
                  <option value="Part 450">Part 450</option>
                  <option value="License Amendment">License Amendment</option>
                  <option value="Safety Approval">Safety Approval</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateApplication} className="bg-white text-black hover:bg-white/90">
                Create Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-[2fr,1fr] gap-4 mb-4">
        <Card className="bg-[#1A1A1A] border-zinc-800/50">
          <div className="p-6">
            <h2 className="text-lg font-medium text-white mb-1">ACTIVE APPLICATIONS</h2>
            <p className="text-zinc-500 text-sm mb-4">Your current licensing applications</p>
            
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <FilePlus className="mx-auto h-8 w-8 text-zinc-700 mb-3" />
                <p className="text-zinc-400">No active applications</p>
                <p className="text-zinc-600 text-sm">Create your first application to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <Link
                    key={app.id}
                    href={`/applications/${app.id}`}
                    className="block p-4 rounded-lg bg-black border border-zinc-800 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-white mb-1">{app.name}</h3>
                        <p className="text-sm text-zinc-500">
                          {app.type} • Last updated {formatDate(app.updatedAt)}
                        </p>
                      </div>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium uppercase",
                        getStatusBadgeClass(app.status)
                      )}>
                        {app.status.replace("_", " ")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="bg-[#1A1A1A] border-zinc-800/50">
          <div className="p-6">
            <h2 className="text-lg font-medium text-white mb-1">LAUNCH STATUS</h2>
            <p className="text-zinc-500 text-sm mb-4">Recent and upcoming launches</p>
            
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <Rocket className="mx-auto h-8 w-8 text-zinc-700 mb-3" />
                <p className="text-zinc-400">No launches yet</p>
                <p className="text-zinc-600 text-sm">Your approved launches will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications
                  .filter(app => app.status === "approved" || app.status === "under_review")
                  .map((app) => (
                    <div key={app.id} className="p-4 rounded-lg bg-black border border-zinc-800">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          app.status === "approved" ? "bg-green-500" : "bg-yellow-500"
                        )} />
                        <h3 className="font-medium text-white">
                          {app.status === "approved" ? "APPROVED LAUNCH WINDOW" : "PENDING APPROVAL"}
                        </h3>
                      </div>
                      <p className="text-sm text-zinc-500 mb-1">{app.name}</p>
                      <p className="text-xs text-zinc-600">
                        {app.status === "approved" ? "May 15, 2025 - June 30, 2025" : `Submitted on ${formatDate(app.updatedAt)}`}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="bg-[#1A1A1A] border-zinc-800/50">
        <div className="p-6">
          <h2 className="text-lg font-medium text-white mb-1">ALL APPLICATIONS</h2>
          <p className="text-zinc-500 text-sm mb-4">Complete history of your license applications</p>
          
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
                  <tr className="text-left border-b border-zinc-800">
                    <th className="pb-3 text-sm font-medium text-white">Name</th>
                    <th className="pb-3 text-sm font-medium text-white">Type</th>
                    <th className="pb-3 text-sm font-medium text-white">Status</th>
                    <th className="pb-3 text-sm font-medium text-white">Created</th>
                    <th className="pb-3 text-sm font-medium text-white">Last Update</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr
                      key={app.id}
                      className="border-b border-zinc-800 hover:bg-black/50 cursor-pointer"
                      onClick={() => router.push(`/applications/${app.id}`)}
                    >
                      <td className="py-4 text-white">{app.name}</td>
                      <td className="py-4 text-zinc-400">{app.type}</td>
                      <td className="py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-medium",
                          getStatusBadgeClass(app.status)
                        )}>
                          {app.status.replace("_", " ").toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 text-zinc-400">{formatDate(app.createdAt)}</td>
                      <td className="py-4 text-zinc-400">{formatDate(app.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
