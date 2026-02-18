import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

// Protected routes that require authentication
const protectedRoutes = ['/diary', '/settings'];

// Public routes that don't require authentication
const publicRoutes = ['/auth/login', '/auth/signup', '/'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle legacy /login route - redirect to /auth/login
  if (pathname === '/login' || pathname.startsWith('/login/')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Handle /dashboard - redirect to /diary if authenticated, else /auth/login
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('auth-token')?.value;
    if (token) {
      try {
        await verifyToken(token);
        return NextResponse.redirect(new URL('/diary', request.url));
      } catch (error) {
        // Token invalid, redirect to auth/login
      }
    }
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname === route || pathname.startsWith(route + '/')
  );

  // Get auth token from cookie
  const token = request.cookies.get('auth-token')?.value;

  // If trying to access protected route without token, redirect to /auth/login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated user tries to access public auth routes, redirect to diary
  if (token && isPublicRoute && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup'))) {
    try {
      await verifyToken(token);
      return NextResponse.redirect(new URL('/diary', request.url));
    } catch (error) {
      // Token is invalid, continue to public route
    }
  }

  // Verify token if present
  if (token) {
    try {
      await verifyToken(token);
    } catch (error) {
      // Token is invalid, clear it and redirect to /auth/login if on protected route
      const response = isProtectedRoute
        ? NextResponse.redirect(new URL('/auth/login', request.url))
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
