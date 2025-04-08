import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('token')?.value;

  const isPublicPath = path === '/' || 
    path === '/signin' || 
    path === '/signup' || 
    path === '/company' || 
    path === '/contact' || 
    path === '/privacy';

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  if ((path === '/signin' || path === '/signup') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
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