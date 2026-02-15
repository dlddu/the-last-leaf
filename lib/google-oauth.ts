/**
 * Google OAuth Utilities
 * Handles Google OAuth 2.0 authentication flow
 */

/**
 * Check if running in E2E test mode
 */
function isE2ETestMode(): boolean {
  const isTestMode = process.env.PLAYWRIGHT_TEST_MODE === 'true';
  // Log for debugging in CI
  if (process.env.NODE_ENV === 'test') {
    console.log('[Google OAuth] PLAYWRIGHT_TEST_MODE:', process.env.PLAYWRIGHT_TEST_MODE, 'isTestMode:', isTestMode);
  }
  return isTestMode;
}

/**
 * Get mock user data based on test code
 */
function getMockUserDataFromTestCode(code: string): GoogleUserInfo {
  // Extract test scenario from code
  if (code.includes('new_user')) {
    return {
      email: 'newuser@gmail.com',
      name: 'New Google User',
      picture: 'https://example.com/picture.jpg',
      sub: 'google_sub_new_user',
    };
  }

  if (code.includes('existing_user')) {
    return {
      email: 'existing.google.user@gmail.com',
      name: 'Existing Google User',
      sub: 'google_sub_existing_user',
    };
  }

  if (code.includes('returning_user')) {
    return {
      email: 'returning.user@gmail.com',
      name: 'Returning User',
      sub: 'google_sub_returning_user',
    };
  }

  if (code.includes('preserve_data')) {
    return {
      email: 'preserve.data@gmail.com',
      name: 'Google Preserve User',
      sub: 'google_sub_preserve',
    };
  }

  if (code.includes('duplicate_email')) {
    return {
      email: 'duplicate@gmail.com',
      name: 'Duplicate Email User',
      sub: 'google_sub_duplicate',
    };
  }

  if (code.includes('concurrent')) {
    return {
      email: 'concurrent@gmail.com',
      name: 'Concurrent User',
      sub: 'google_sub_concurrent',
    };
  }

  if (code.includes('picture')) {
    // Extract timestamp from code if present, e.g., test_with_picture_1234567890
    const match = code.match(/test_with_picture(?:_(\d+))?/);
    const timestamp = match && match[1] ? match[1] : Date.now();
    return {
      email: `pictureuser${timestamp}@gmail.com`,
      name: 'Picture User',
      picture: 'https://lh3.googleusercontent.com/a/test-picture',
      sub: `google_sub_picture_${timestamp}`,
    };
  }

  if (code.includes('auto_nickname')) {
    // Extract timestamp from code if present, e.g., test_auto_nickname_1234567890
    const match = code.match(/test_auto_nickname(?:_(\d+))?/);
    const timestamp = match && match[1] ? match[1] : Date.now();
    return {
      email: `newuser${timestamp}@gmail.com`,
      name: 'Auto Nickname User',
      sub: `google_sub_auto_${timestamp}`,
    };
  }

  if (code.includes('email_format')) {
    // Extract timestamp from code if present, e.g., test_email_format_1234567890
    const match = code.match(/test_email_format(?:_(\d+))?/);
    const timestamp = match && match[1] ? match[1] : Date.now();
    return {
      email: `validformat${timestamp}@gmail.com`,
      name: 'Valid Format User',
      sub: `google_sub_format_${timestamp}`,
    };
  }

  if (code.includes('invalid_code')) {
    throw new Error('invalid_grant');
  }

  if (code.includes('server_error')) {
    throw new Error('server_error');
  }

  // Default mock user data
  const timestamp = Date.now();
  return {
    email: `testuser${timestamp}@gmail.com`,
    name: 'Test Google User',
    picture: 'https://example.com/avatar.jpg',
    sub: `google_sub_${timestamp}`,
  };
}

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
  // E2E test mode: return mock token without calling Google API
  const testMode = isE2ETestMode();
  if (process.env.NODE_ENV === 'test') {
    console.log('[exchangeCodeForToken] code:', code, 'testMode:', testMode, 'startsWithTest:', code.startsWith('test_'));
  }

  if (testMode && code.startsWith('test_')) {
    // Check for error scenarios
    if (code.includes('invalid_code')) {
      throw new Error('Token exchange failed: invalid_grant');
    }
    if (code.includes('server_error')) {
      throw new Error('Token exchange failed: server_error');
    }

    return {
      access_token: `mock_access_token_${code}`,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: `mock_refresh_token_${code}`,
    };
  }

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
  // E2E test mode: return mock user info without calling Google API
  const testMode = isE2ETestMode();
  if (process.env.NODE_ENV === 'test') {
    console.log('[getGoogleUserInfo] accessToken:', accessToken, 'testMode:', testMode, 'isMockToken:', accessToken.startsWith('mock_access_token_'));
  }

  if (testMode && accessToken.startsWith('mock_access_token_')) {
    const code = accessToken.replace('mock_access_token_', '');
    const mockData = getMockUserDataFromTestCode(code);
    if (process.env.NODE_ENV === 'test') {
      console.log('[getGoogleUserInfo] Returning mock data:', mockData);
    }
    return mockData;
  }

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
