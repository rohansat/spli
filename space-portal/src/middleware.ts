import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow unrestricted access to ALL demo-related paths and features
  if (path.startsWith('/demo') || path.includes('demo')) {
    return NextResponse.next();
  }

  // Only apply authentication checks to non-demo routes
  const isPublicPath = path === '/login' || path === '/signup' || path === '/';
  const token = request.cookies.get('token')?.value || '';

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!isPublicPath && !token && !path.includes('demo')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/dashboard/:path*',
    '/documents/:path*',
    '/messages/:path*',
    '/profile/:path*',
    '/demo/:path*',
    '/api/:path*'
  ]
}; 