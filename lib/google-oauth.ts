/**
 * Google OAuth Utilities
 * Handles Google OAuth 2.0 authentication flow
 */

/**
 * Generate a random state string for CSRF protection
 */
function generateState(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate Google OAuth authorization URL
 * @returns Google OAuth URL with required parameters
 * @throws Error if required environment variables are not set
 */
export function generateGoogleAuthUrl(): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is not configured');
  }

  if (!redirectUri) {
    throw new Error('GOOGLE_REDIRECT_URI is not configured');
  }

  const state = generateState();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'email profile',
    access_type: 'offline',
    prompt: 'consent',
    state: state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Token response from Google
 */
export interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

/**
 * Exchange authorization code for access token
 * @param code - Authorization code from Google OAuth callback
 * @returns Token data including access token
 * @throws Error if token exchange fails or required environment variables are not set
 */
export async function exchangeCodeForToken(code: string): Promise<GoogleTokenResponse> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is not configured');
  }

  if (!clientSecret) {
    throw new Error('GOOGLE_CLIENT_SECRET is not configured');
  }

  if (!redirectUri) {
    throw new Error('GOOGLE_REDIRECT_URI is not configured');
  }

  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token exchange failed: ${error.error || 'Unknown error'}`);
  }

  return await response.json();
}

/**
 * Google user info response
 */
export interface GoogleUserInfo {
  email: string;
  name?: string;
  picture?: string;
  sub: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
}

/**
 * Get user information from Google
 * @param accessToken - Access token from Google OAuth
 * @returns User information
 * @throws Error if user info request fails
 */
export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get user info: ${error.error || 'Unknown error'}`);
  }

  return await response.json();
}
