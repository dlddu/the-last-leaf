import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { signToken } from '@/lib/auth';
import { parseJsonBody, setAuthCookie } from '@/lib/api-helpers';
import { EMAIL_REGEX, AUTH_TOKEN_EXPIRY } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody<{
      email?: string;
      password?: string;
      passwordConfirm?: string;
      nickname?: string;
    }>(request);
    if (!body.success) return body.response;

    const { email, password, passwordConfirm, nickname } = body.data;

    // Validate email
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

    // Validate password
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Validate password confirmation
    if (password !== passwordConfirm) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Validate nickname
    if (!nickname || nickname.trim().length === 0) {
      return NextResponse.json(
        { error: 'Nickname is required' },
        { status: 400 }
      );
    }

    // Check for existing user (case-insensitive)
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password_hash,
        nickname: nickname.trim(),
      },
    });

    // Generate JWT token
    const token = await signToken({
      userId: user.user_id,
      email: user.email,
    }, AUTH_TOKEN_EXPIRY);

    // Create response with user data (excluding password_hash)
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
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
