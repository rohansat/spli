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
    <div className="min-h-screen bg-black pt-24">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-[28px] font-medium text-white mb-1">MISSION CONTROL</h1>
            <p className="text-zinc-500">
              Welcome back, {user?.displayName || user?.email?.split('@')[0] || 'John Doe'}. Manage your aerospace licensing applications.
            </p>
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
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[11px] font-medium",
                            app.status === "under_review" ? "bg-[#423A19] text-[#FFB224]" :
                            app.status === "draft" ? "bg-zinc-800 text-zinc-300" :
                            "bg-[#4A3524] text-[#FF9351]"
                          )}>
                            {app.status === "under_review" ? "UNDER REVIEW" :
                             app.status === "draft" ? "DRAFT" :
                             "AWAITING ACTION"}
                          </span>
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
              <h2 className="text-base font-medium text-white mb-1">All Applications</h2>
              <p className="text-sm text-zinc-500 mb-6">Complete history of your license applications</p>
              
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
                        <th className="pb-3 text-xs font-medium text-white">Name</th>
                        <th className="pb-3 text-xs font-medium text-white">Type</th>
                        <th className="pb-3 text-xs font-medium text-white">Status</th>
                        <th className="pb-3 text-xs font-medium text-white">Created</th>
                        <th className="pb-3 text-xs font-medium text-white">Last Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr
                          key={app.id}
                          className="border-b border-zinc-800 hover:bg-[#111111] cursor-pointer"
                          onClick={() => router.push(`/applications/${app.id}`)}
                        >
                          <td className="py-4 text-sm text-white">{app.name}</td>
                          <td className="py-4 text-sm text-zinc-400">{app.type}</td>
                          <td className="py-4">
                            <span className={cn(
                              "px-2.5 py-1 rounded-full text-[11px] font-medium",
                              app.status === "under_review" ? "bg-[#423A19] text-[#FFB224]" :
                              app.status === "draft" ? "bg-zinc-800 text-zinc-300" :
                              app.status === "approved" ? "bg-[#1C3829] text-[#22C55E]" :
                              "bg-[#4A3524] text-[#FF9351]"
                            )}>
                              {app.status === "under_review" ? "UNDER REVIEW" :
                               app.status === "draft" ? "DRAFT" :
                               app.status === "approved" ? "ACTIVE" :
                               "AWAITING ACTION"}
                            </span>
                          </td>
                          <td className="py-4 text-sm text-zinc-400">{formatDate(app.createdAt)}</td>
                          <td className="py-4 text-sm text-zinc-400">{formatDate(app.updatedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
