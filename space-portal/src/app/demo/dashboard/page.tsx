'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from "@/components/ui/button";

export default function DemoDashboard() {
  const pendingActions = [
    {
      title: "FALCON X LAUNCH VEHICLE LICENSE",
      details: "Part 450 • Last updated Feb 20, 2025",
      status: "ACTION NEEDED",
      path: "/demo/applications/falcon-x"
    },
    {
      title: "STARCRUISER REENTRY VEHICLE",
      details: "Part 450 • Last updated Feb 27, 2025",
      status: "DRAFT",
      path: "/demo/applications/starcruiser"
    },
    {
      title: "LAUNCH SITE EXPANSION AMENDMENT",
      details: "License Amendment • Last updated Mar 5, 2025",
      status: "UNDER REVIEW",
      path: "/demo/applications/site-expansion"
    }
  ];

  const launchStatus = [
    {
      title: "APPROVED LAUNCH WINDOW",
      description: "Orbital Facility Deployment",
      date: "May 15, 2025 - June 30, 2025",
      status: "approved"
    },
    {
      title: "PENDING APPROVAL",
      description: "Falcon X Launch Vehicle",
      date: "Submitted on Feb 20, 2025",
      status: "pending"
    }
  ];

  const allApplications = [
    {
      name: "Falcon X Launch Vehicle License",
      type: "Part 450",
      status: "AWAITING ACTION",
      created: "Jan 15, 2025",
      lastUpdate: "Feb 20, 2025"
    },
    {
      name: "Starcruiser Reentry Vehicle",
      type: "Part 450",
      status: "DRAFT",
      created: "Feb 27, 2025",
      lastUpdate: "Feb 27, 2025"
    }
  ];

  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTION NEEDED':
        return 'bg-blue-900 text-blue-100';
      case 'DRAFT':
        return 'bg-gray-700 text-gray-100';
      case 'UNDER REVIEW':
        return 'bg-yellow-900/70 text-yellow-100';
      case 'AWAITING ACTION':
        return 'bg-blue-900 text-blue-100';
      default:
        return 'bg-gray-700 text-gray-100';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">MISSION CONTROL</h1>
          <p className="text-xl text-gray-400">
            Welcome back, Astronaut. Manage your aerospace licensing applications.
          </p>
        </div>
        <Button variant="outline" className="bg-white text-black hover:bg-gray-200">
          <Link href="/demo/applications/new">+ NEW APPLICATION</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pending Actions */}
        <Card className="bg-black/50 border-gray-800">
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
            <p className="text-gray-400">Applications awaiting your attention</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingActions.map((action) => (
                <Link 
                  key={action.title} 
                  href={action.path}
                  className="block"
                >
                  <div className="p-4 rounded-lg bg-gray-900/50 hover:bg-gray-800/50 transition-colors border border-gray-800">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{action.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusStyle(action.status)}`}>
                        {action.status}
                      </span>
                    </div>
                    <p className="text-gray-400">{action.details}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Launch Status */}
        <Card className="bg-black/50 border-gray-800">
          <CardHeader>
            <CardTitle>Launch Status</CardTitle>
            <p className="text-gray-400">Recent and upcoming launches</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {launchStatus.map((launch) => (
                <div key={launch.title} className="p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                  <div className="flex items-center gap-2 mb-2">
                    {launch.status === 'approved' && (
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    )}
                    {launch.status === 'pending' && (
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    )}
                    <h3 className="text-lg font-semibold">{launch.title}</h3>
                  </div>
                  <p className="text-gray-300">{launch.description}</p>
                  <p className="text-gray-500 text-sm mt-1">{launch.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Applications */}
      <Card className="bg-black/50 border-gray-800">
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <p className="text-gray-400">Complete history of your license applications</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-800">
                  <th className="pb-2 text-gray-400">Name</th>
                  <th className="pb-2 text-gray-400">Type</th>
                  <th className="pb-2 text-gray-400">Status</th>
                  <th className="pb-2 text-gray-400">Created</th>
                  <th className="pb-2 text-gray-400">Last Update</th>
                </tr>
              </thead>
              <tbody>
                {allApplications.map((app) => (
                  <tr key={app.name} className="border-b border-gray-800/50 hover:bg-gray-900/30">
                    <td className="py-4">{app.name}</td>
                    <td className="py-4">{app.type}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusStyle(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-4">{app.created}</td>
                    <td className="py-4">{app.lastUpdate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 