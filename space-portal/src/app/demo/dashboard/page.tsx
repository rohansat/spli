"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus, Download, Trash2, Mail } from "lucide-react";
import { useDemoStore } from "@/lib/demo-store";

export default function DemoDashboardPage() {
  const [isNewAppDialogOpen, setIsNewAppDialogOpen] = useState(false);
  const [newAppName, setNewAppName] = useState("");
  const [newAppType, setNewAppType] = useState("Part 450");
  
  const { applications, createApplication } = useDemoStore();

  const handleCreateApplication = () => {
    if (!newAppName.trim()) return;
    createApplication(newAppName, newAppType);
    setIsNewAppDialogOpen(false);
    setNewAppName("");
  };

  // Filter applications for different sections
  const pendingActions = applications.filter(app => 
    app.status === "DRAFT" || app.status === "UNDER REVIEW" || app.status === "AWAITING ACTION"
  );

  const activeApplications = applications.filter(app => 
    app.status === "ACTIVE"
  );

  const pendingApproval = applications.filter(app => 
    app.status === "UNDER REVIEW"
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Top Navigation */}
      <div className="border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-bold text-white">
                SPACE PORTAL
              </Link>
              <nav className="flex gap-6">
                <Link href="/demo/dashboard" className="text-sm text-white">HOME</Link>
                <Link href="/demo/dashboard/documents" className="text-sm text-zinc-400 hover:text-white">DOCUMENT MANAGEMENT</Link>
                <Link href="/demo/dashboard/messages" className="text-sm text-zinc-400 hover:text-white">MESSAGES</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white">JD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-medium text-white mb-2">MISSION CONTROL</h1>
            <p className="text-zinc-400 text-sm">
              Welcome back, John Doe. Manage your aerospace licensing applications.
            </p>
          </div>
          <Button 
            onClick={() => setIsNewAppDialogOpen(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            NEW APPLICATION
          </Button>
        </div>

        <div className="grid grid-cols-[2fr,1fr] gap-6 mb-8">
          {/* Pending Actions */}
          <div className="bg-[#161616] rounded-lg border border-zinc-800/50 p-6">
            <h2 className="text-white font-medium mb-1">Pending Actions</h2>
            <p className="text-sm text-zinc-400 mb-6">Applications that require your attention</p>
            
            <div className="space-y-4">
              {pendingActions.map((action) => (
                <div key={action.id} className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-medium">{action.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      action.status === "UNDER REVIEW" ? "bg-yellow-900/20 text-yellow-500" :
                      action.status === "DRAFT" ? "bg-zinc-700/20 text-zinc-400" :
                      action.status === "AWAITING ACTION" ? "bg-orange-900/20 text-orange-500" :
                      "bg-zinc-700/20 text-zinc-400"
                    }`}>
                      {action.status}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400">
                    {action.type} • Last updated {formatDate(action.updatedAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Launch Status */}
          <div className="bg-[#161616] rounded-lg border border-zinc-800/50 p-6">
            <h2 className="text-white font-medium mb-1">Launch Status</h2>
            <p className="text-sm text-zinc-400 mb-6">Recent and upcoming launches</p>
            
            <div className="space-y-4">
              {activeApplications.map((status) => (
                <div key={status.id} className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-medium text-white">ACTIVE LICENSE</span>
                  </div>
                  <h3 className="text-white mb-1">{status.name}</h3>
                  <p className="text-sm text-zinc-400">Active since {formatDate(status.updatedAt)}</p>
                </div>
              ))}
              {pendingApproval.map((status) => (
                <div key={status.id} className="p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="text-sm font-medium text-white">PENDING APPROVAL</span>
                  </div>
                  <h3 className="text-white mb-1">{status.name}</h3>
                  <p className="text-sm text-zinc-400">Submitted on {formatDate(status.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* All Applications */}
        <div className="bg-[#161616] rounded-lg border border-zinc-800/50 p-6">
          <h2 className="text-white font-medium mb-1">All Applications</h2>
          <p className="text-sm text-zinc-400 mb-6">Complete history of your license applications</p>
          
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-zinc-400">
                <th className="pb-4">Name</th>
                <th className="pb-4">Type</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Created</th>
                <th className="pb-4">Last Update</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-t border-zinc-800">
                  <td className="py-4 text-white">{app.name}</td>
                  <td className="py-4 text-zinc-400">{app.type}</td>
                  <td className="py-4">
                    <span className={`text-xs px-2 py-1 rounded ${
                      app.status === "UNDER REVIEW" ? "bg-yellow-900/20 text-yellow-500" :
                      app.status === "DRAFT" ? "bg-zinc-700/20 text-zinc-400" :
                      app.status === "ACTIVE" ? "bg-green-900/20 text-green-500" :
                      app.status === "AWAITING ACTION" ? "bg-orange-900/20 text-orange-500" :
                      "bg-zinc-700/20 text-zinc-400"
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="py-4 text-zinc-400">{formatDate(app.createdAt)}</td>
                  <td className="py-4 text-zinc-400">{formatDate(app.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center py-8 text-xs text-zinc-500">
          <div>SPLI © 2025</div>
          <div className="flex gap-6">
            <button className="hover:text-zinc-400">PRIVACY POLICY</button>
            <button className="hover:text-zinc-400">TERMS OF SERVICE</button>
            <button className="hover:text-zinc-400">CONTACT</button>
          </div>
        </div>
      </div>

      {/* New Application Dialog */}
      <Dialog open={isNewAppDialogOpen} onOpenChange={setIsNewAppDialogOpen}>
        <DialogContent className="bg-[#161616] border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Create New Application</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Fill in the details to start a new license application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Application Name</label>
              <Input
                value={newAppName}
                onChange={(e) => setNewAppName(e.target.value)}
                placeholder="e.g., Mars Lander Launch Vehicle"
                className="bg-[#0D0D0D] border-zinc-800 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Application Type</label>
              <select
                value={newAppType}
                onChange={(e) => setNewAppType(e.target.value)}
                className="w-full px-3 py-2 bg-[#0D0D0D] border border-zinc-800 text-white rounded-md"
              >
                <option value="Part 450">Part 450</option>
                <option value="License Amendment">License Amendment</option>
                <option value="Safety Approval">Safety Approval</option>
                <option value="Site License">Site License</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewAppDialogOpen(false)}
              className="border-zinc-800 text-white hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateApplication}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}