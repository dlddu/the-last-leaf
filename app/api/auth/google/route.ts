import { NextRequest, NextResponse } from 'next/server';
import { generateGoogleAuthUrl } from '@/lib/google-oauth';

export async function GET(request: NextRequest) {
  try {
    // Generate Google OAuth authorization URL
    const authUrl = generateGoogleAuthUrl();

    // Redirect to Google OAuth page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Google OAuth initiation error:', error);

    return NextResponse.json(
      { error: 'Google OAuth not configured' },
      { status: 500 }
    );
  }
}
