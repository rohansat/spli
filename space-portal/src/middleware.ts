// If you want to protect routes, use NextAuth middleware or rely on client-side session checks.
// This file is now a placeholder after migration from Firebase Auth.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware() {
  // No-op
  return;
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/',
    '/dashboard',
    '/applications/:path*',
    '/documents/:path*',
    '/messages/:path*',
    '/signin',
    '/signup',
    '/company',
    '/contact',
    '/privacy'
  ]
}; 