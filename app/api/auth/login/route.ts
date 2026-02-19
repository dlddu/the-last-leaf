import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { signToken } from '@/lib/auth';
import { setAuthCookie } from '@/lib/api-helpers';
import { AUTH_TOKEN_EXPIRY } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user has password (not a social login only account)
    if (!user.password_hash) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await signToken({
      userId: user.user_id,
      email: user.email,
    }, AUTH_TOKEN_EXPIRY);

    // Update last active timestamp
    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { last_active_at: new Date() },
    });

    // Create response with cookie
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
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
