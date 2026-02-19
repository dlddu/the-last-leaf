import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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

type AnyRouteHandler = (...args: any[]) => Promise<NextResponse>;

/**
 * Wrap an API route handler with standardized error handling.
 * Catches unhandled errors and returns a 500 response with console logging.
 * Preserves the original handler's type signature for Next.js route validation.
 */
export function withErrorHandler<T extends AnyRouteHandler>(label: string, handler: T): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error(`${label}:`, error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 },
      );
    }
  }) as T;
}

/**
 * Update the user's last_active_at timestamp.
 * Failures are logged but do not propagate.
 */
export async function updateLastActive(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { user_id: userId },
      data: { last_active_at: new Date() },
    });
  } catch (error) {
    console.error('Failed to update last_active_at:', error);
  }
}

/**
 * Validate that diary content is a non-empty string.
 * Returns a 400 NextResponse on failure, or null on success.
 */
export function validateContent(content: unknown): NextResponse | null {
  if (!content || typeof content !== 'string' || content.trim() === '') {
    return NextResponse.json(
      { error: 'Content is required and cannot be empty' },
      { status: 400 },
    );
  }
  return null;
}

/**
 * Find a diary entry and verify ownership.
 * Returns the diary on success, or a 404/403 NextResponse on failure.
 */
export async function requireDiaryOwnership(
  diaryId: string,
  userId: string,
): Promise<{ diary: Awaited<ReturnType<typeof prisma.diary.findUnique>> & {} } | { response: NextResponse }> {
  const diary = await prisma.diary.findUnique({
    where: { diary_id: diaryId },
  });

  if (!diary) {
    return { response: NextResponse.json({ error: 'Not found' }, { status: 404 }) };
  }

  if (diary.user_id !== userId) {
    return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { diary };
}
