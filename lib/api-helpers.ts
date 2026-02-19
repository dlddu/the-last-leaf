import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { AUTH_COOKIE_NAME, AUTH_COOKIE_MAX_AGE } from '@/lib/constants';

type AuthSuccess = { success: true; userId: string };
type AuthFailure = { success: false; response: NextResponse };
type AuthResult = AuthSuccess | AuthFailure;

/**
 * Extract and verify auth token from request cookies.
 * Returns the authenticated userId or a 401 response.
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  try {
    const payload = await verifyToken(token);
    return { success: true, userId: payload.userId as string };
  } catch {
    return {
      success: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
}

type JsonSuccess<T = unknown> = { success: true; data: T };
type JsonFailure = { success: false; response: NextResponse };
type JsonResult<T = unknown> = JsonSuccess<T> | JsonFailure;

/**
 * Safely parse JSON body from a request.
 * Returns the parsed data or a 400 response.
 */
export async function parseJsonBody<T = unknown>(request: NextRequest): Promise<JsonResult<T>> {
  try {
    const data = (await request.json()) as T;
    return { success: true, data };
  } catch {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 },
      ),
    };
  }
}

/**
 * Set the auth cookie on a response.
 */
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: AUTH_COOKIE_MAX_AGE,
    path: '/',
  });
}

/**
 * Clear the auth cookie on a response (for logout / account deletion).
 */
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}
