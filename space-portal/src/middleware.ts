import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public paths that don't require authentication
const publicPaths = ['/', '/company', '/demo', '/signin', '/signup'];

// Define protected paths that require authentication
const protectedPaths = ['/dashboard', '/documents', '/messages'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token');
  const demoMode = request.cookies.get('demoMode');

  // Allow access to public paths
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  // Allow access to protected paths if user is authenticated or in demo mode
  if (isProtectedPath && (token || demoMode)) {
    return NextResponse.next();
  }

  // Redirect to signin for protected paths without authentication
  if (isProtectedPath) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 