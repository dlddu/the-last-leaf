import { Page } from '@playwright/test';
import { signToken } from '@/lib/auth';
import { prisma } from './db-cleanup';

export interface TestUser {
  user_id: string;
  email: string;
  nickname: string;
}

/**
 * Generate JWT token for test user
 */
export async function generateAuthToken(user: TestUser): Promise<string> {
  const token = await signToken({
    userId: user.user_id,
    email: user.email,
  }, '7d');

  return token;
}

/**
 * Set authentication cookie in the browser context
 */
export async function setAuthCookie(page: Page, token: string): Promise<void> {
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';
  const url = new URL(baseURL);

  await page.context().addCookies([
    {
      name: 'auth-token',
      value: token,
      domain: url.hostname,
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      expires: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    },
  ]);
}

/**
 * Get test user from database
 */
export async function getTestUser(): Promise<TestUser> {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' },
  });

  if (!user) {
    throw new Error('Test user not found. Please run database seed.');
  }

  return {
    user_id: user.user_id,
    email: user.email,
    nickname: user.nickname,
  };
}

/**
 * Authenticate as test user
 */
export async function authenticateAsTestUser(page: Page): Promise<void> {
  const testUser = await getTestUser();
  const token = await generateAuthToken(testUser);
  await setAuthCookie(page, token);
}

/**
 * Clear authentication cookies
 */
export async function clearAuth(page: Page): Promise<void> {
  await page.context().clearCookies();
}
