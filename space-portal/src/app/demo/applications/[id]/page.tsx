'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";

export default function DemoApplicationPage() {
  const params = useParams();
  const id = params.id as string;

  // Mock data for different applications
  const applications = {
    'falcon-x': {
      title: 'FALCON X LAUNCH VEHICLE LICENSE',
      status: 'ACTION NEEDED',
      details: 'Part 450 • Last updated Feb 20, 2025',
      description: 'Application for commercial space transportation license for the Falcon X launch vehicle.',
    },
    'starcruiser': {
      title: 'STARCRUISER REENTRY VEHICLE',
      status: 'DRAFT',
      details: 'Part 450 • Last updated Feb 27, 2025',
      description: 'License application for the Starcruiser reentry vehicle certification.',
    },
    'site-expansion': {
      title: 'LAUNCH SITE EXPANSION AMENDMENT',
      status: 'UNDER REVIEW',
      details: 'License Amendment • Last updated Mar 5, 2025',
      description: 'Amendment to existing launch site license for facility expansion.',
    }
  };

  const application = applications[id as keyof typeof applications];

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
        <Button
          variant="outline"
          onClick={() => window.location.href = '/demo/dashboard'}
          className="mb-4"
        >
          ← Back to Dashboard
        </Button>
        <h1 className="text-4xl font-bold mb-2">{application.title}</h1>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm ${getStatusStyle(application.status)}`}>
            {application.status}
          </span>
          <span className="text-gray-400">{application.details}</span>
        </div>
      </div>

      <Card className="bg-black/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl">Application Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300">{application.description}</p>
          
          <div className="mt-8 space-y-4">
            <Button className="w-full">View Full Application</Button>
            <Button variant="outline" className="w-full">Download PDF</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 