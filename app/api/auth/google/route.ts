import { NextRequest, NextResponse } from 'next/server';
import { generateGoogleAuthUrl } from '@/lib/google-oauth';

export async function GET(_request: NextRequest) {
  try {
    const authUrl = generateGoogleAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'Google OAuth not configured' },
      { status: 500 }
    );
  }
}
