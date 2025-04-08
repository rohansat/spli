import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/' || 
                      path === '/company' || 
                      path.startsWith('/demo') || 
                      path === '/signin' || 
                      path === '/signup';

  // Define protected paths that require authentication
  const isProtectedPath = path.startsWith('/dashboard') || 
                         path.startsWith('/documents') || 
                         path.startsWith('/messages');

  // Get the token from the cookies
  const token = request.cookies.get('authToken')?.value;

  // If the path is protected and there's no token, redirect to signin
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // If we have a token and we're on auth pages, redirect to dashboard
  if (token && (path === '/signin' || path === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure the paths that middleware will run on
export const config = {
  matcher: ['/', '/company', '/demo/:path*', '/signin', '/signup', '/dashboard/:path*', '/documents/:path*', '/messages/:path*']
}; 