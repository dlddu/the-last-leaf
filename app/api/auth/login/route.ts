import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { signToken } from '@/lib/auth';
import { parseJsonBody, setAuthCookie, withErrorHandler, updateLastActive } from '@/lib/api-helpers';
import { AUTH_TOKEN_EXPIRY } from '@/lib/constants';

export const POST = withErrorHandler('Login error', async (request: NextRequest) => {
  const body = await parseJsonBody<{ email?: string; password?: string }>(request);
  if (!body.success) return body.response;

  const { email, password } = body.data;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  }

  if (!user.password_hash) {
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  }

  const isValidPassword = await verifyPassword(password, user.password_hash);

  if (!isValidPassword) {
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  }

  const token = await signToken({
    userId: user.user_id,
    email: user.email,
  }, AUTH_TOKEN_EXPIRY);

  await updateLastActive(user.user_id);

  const response = NextResponse.json({
    success: true,
    user: {
      user_id: user.user_id,
      email: user.email,
      nickname: user.nickname,
    },
  });

  setAuthCookie(response, token);

  return response;
});
