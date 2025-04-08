import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow unrestricted access to demo routes
  if (path.startsWith('/demo')) {
    return NextResponse.next();
  }

  // Check if the path is public
  const isPublicPath = path === '/login' || path === '/signup' || path === '/';

  // Get the token from the cookies
  const token = request.cookies.get('token')?.value || '';

  // Redirect logic for non-demo routes
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!isPublicPath && !token) {
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
    '/demo/:path*'
  ]
}; 