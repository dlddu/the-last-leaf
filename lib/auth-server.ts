import { cookies } from 'next/headers';
import { verifyToken } from './auth';
import { redirect } from 'next/navigation';

export interface AuthUser {
  userId: string;
  email: string;
}

/**
 * Get authenticated user from cookie
 * Returns null if not authenticated
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyToken(token);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Require authentication - redirects to login if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}
