import { redirect } from 'next/navigation';

export default function DemoPage() {
  // Create a response with the demo mode cookie
  const response = new Response(null, {
    status: 302,
    headers: {
      'Location': '/dashboard',
      'Set-Cookie': 'demoMode=true; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax'
    }
  });

  return response;
} 