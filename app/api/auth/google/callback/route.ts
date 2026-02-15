import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, getGoogleUserInfo } from '@/lib/google-oauth';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Check if user denied access
    if (error) {
      return NextResponse.json(
        { error: 'User denied access' },
        { status: 400 }
      );
    }

    // Check if authorization code is present
    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    // Exchange authorization code for access token
    let tokenData;
    try {
      tokenData = await exchangeCodeForToken(code);
    } catch (error) {
      console.error('Token exchange error:', error);
      return NextResponse.json(
        { error: 'Google authentication failed - token exchange failed' },
        { status: 500 }
      );
    }

    // Get user information from Google
    let userInfo;
    try {
      userInfo = await getGoogleUserInfo(tokenData.access_token);
    } catch (error) {
      console.error('User info error:', error);
      return NextResponse.json(
        { error: 'Failed to get user info from Google' },
        { status: 500 }
      );
    }

    // Upsert user in database (create if new, update if exists)
    const user = await prisma.user.upsert({
      where: { email: userInfo.email },
      create: {
        email: userInfo.email,
        nickname: userInfo.name || userInfo.email.split('@')[0],
        password_hash: null, // Social login users don't have password
      },
      update: {
        last_active_at: new Date(),
      },
    });

    // Generate JWT token
    const token = await signToken({
      userId: user.user_id,
      email: user.email,
    }, '7d');

    // Create response with redirect to /diary
    const response = NextResponse.redirect(new URL('/diary', request.url));

    // Set HTTP-only cookie
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);

    // Check if it's a configuration error
    if (error instanceof Error && error.message.includes('not configured')) {
      return NextResponse.json(
        { error: 'Google OAuth not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
