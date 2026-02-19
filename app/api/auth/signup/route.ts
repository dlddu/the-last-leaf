import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { signToken } from '@/lib/auth';
import { parseJsonBody, setAuthCookie, withErrorHandler } from '@/lib/api-helpers';
import { EMAIL_REGEX, AUTH_TOKEN_EXPIRY, PASSWORD_MIN_LENGTH } from '@/lib/constants';

export const POST = withErrorHandler('Signup error', async (request: NextRequest) => {
  const body = await parseJsonBody<{
    email?: string;
    password?: string;
    passwordConfirm?: string;
    nickname?: string;
  }>(request);
  if (!body.success) return body.response;

  const { email, password, passwordConfirm, nickname } = body.data;

  if (!email) {
    return NextResponse.json(
      { error: 'Email is required' },
      { status: 400 }
    );
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: 'Invalid email format' },
      { status: 400 }
    );
  }

  if (!password) {
    return NextResponse.json(
      { error: 'Password is required' },
      { status: 400 }
    );
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return NextResponse.json(
      { error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long` },
      { status: 400 }
    );
  }

  if (password !== passwordConfirm) {
    return NextResponse.json(
      { error: 'Passwords do not match' },
      { status: 400 }
    );
  }

  if (!nickname || nickname.trim().length === 0) {
    return NextResponse.json(
      { error: 'Nickname is required' },
      { status: 400 }
    );
  }

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
