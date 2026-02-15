import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/diary', '/settings'];

// Public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Get auth token from cookie
  const token = request.cookies.get('auth-token')?.value;

  // If trying to access protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token if present
  if (token) {
    try {
      await verifyToken(token);
    } catch (error) {
      // Token is invalid, clear it and redirect to login if on protected route
      const response = isProtectedRoute
        ? NextResponse.redirect(new URL('/login', request.url))
        : NextResponse.next();

      response.cookies.set({
        name: 'auth-token',
        value: '',
        maxAge: 0,
        path: '/',
      });

      return response;
    }
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
