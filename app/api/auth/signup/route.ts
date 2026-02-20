import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { signToken } from '@/lib/auth';
import { parseJsonBody, setAuthCookie, withErrorHandler } from '@/lib/api-helpers';
import { AUTH_TOKEN_EXPIRY } from '@/lib/constants';
import { validateSignupInput } from '@/lib/validation';

export const POST = withErrorHandler('Signup error', async (request: NextRequest) => {
  const body = await parseJsonBody<{
    email?: string;
    password?: string;
    passwordConfirm?: string;
    nickname?: string;
  }>(request);
  if (!body.success) return body.response;

  const validationError = validateSignupInput(body.data);
  if (validationError) return validationError;

  const { email, password, nickname } = body.data as {
    email: string;
    password: string;
    nickname: string;
  };

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: 'Email already exists' },
      { status: 409 }
    );
  }

  const password_hash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password_hash,
      nickname: nickname.trim(),
    },
  });

  const token = await signToken({
    userId: user.user_id,
    email: user.email,
  }, AUTH_TOKEN_EXPIRY);

  const response = NextResponse.json(
    {
      user: {
        email: user.email,
        nickname: user.nickname,
      },
    },
    { status: 201 }
  );

  setAuthCookie(response, token);

  return response;
});
