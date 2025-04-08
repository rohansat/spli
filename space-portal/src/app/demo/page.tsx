'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DemoPage() {
  const router = useRouter();

  const demoFeatures = [
    {
      title: 'Dashboard Demo',
      description: 'Explore our interactive dashboard with sample data and analytics. No login required!',
      path: '/demo/dashboard'
    },
    {
      title: 'Documents Demo',
      description: 'View and manage sample documents in our document management system. Try it now!',
      path: '/demo/documents'
    },
    {
      title: 'Messages Demo',
      description: 'Experience our messaging system with pre-populated conversations. Start chatting!',
      path: '/demo/messages'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to the Interactive Demo</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
          Explore our platform's features with this fully accessible demo experience.
        </p>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          No login required - jump right in and try everything!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demoFeatures.map((feature) => (
          <Card key={feature.path} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push(feature.path)}
                className="w-full"
              >
                Try Demo Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 