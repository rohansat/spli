'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DemoPage() {
  const router = useRouter();

  const demoFeatures = [
    {
      title: 'Dashboard Demo',
      description: 'Explore our interactive dashboard with sample data and analytics.',
      path: '/demo/dashboard'
    },
    {
      title: 'Documents Demo',
      description: 'View and manage sample documents in our document management system.',
      path: '/demo/documents'
    },
    {
      title: 'Messages Demo',
      description: 'Experience our messaging system with pre-populated conversations.',
      path: '/demo/messages'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to the Demo</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Explore our platform's features with this interactive demo experience.
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
                Try Demo
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 