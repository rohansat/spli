'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ACTION NEEDED':
        return 'bg-blue-900 text-blue-100';
      case 'DRAFT':
        return 'bg-gray-700 text-gray-100';
      case 'UNDER REVIEW':
        return 'bg-yellow-900/70 text-yellow-100';
      default:
        return 'bg-gray-700 text-gray-100';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">MISSION CONTROL</h1>
        <p className="text-xl text-gray-400">
          Welcome back, Astronaut. Manage your aerospace licensing applications.
        </p>
      </div>

      <Card className="bg-black/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl">Pending Actions</CardTitle>
          <p className="text-gray-400">Applications awaiting your attention</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingActions.map((action) => (
              <a 
                key={action.title} 
                href={action.path}
                className="block"
              >
                <div className="p-4 rounded-lg bg-gray-900/50 hover:bg-gray-800/50 transition-colors border border-gray-800 cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{action.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusStyle(action.status)}`}>
                      {action.status}
                    </span>
                  </div>
                  <p className="text-gray-400">{action.details}</p>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 