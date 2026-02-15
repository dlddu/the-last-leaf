import { Page } from '@playwright/test';

/**
 * Mock data for Google OAuth tests
 */
interface MockGoogleUser {
  email: string;
  name: string;
  picture?: string;
  sub: string;
}

/**
 * Setup Google OAuth API mocks for E2E tests
 * Mocks the Google OAuth token exchange and user info endpoints
 */
export async function setupGoogleOAuthMocks(page: Page): Promise<void> {
  // Mock Google OAuth token exchange endpoint
  await page.route('https://oauth2.googleapis.com/token', async (route) => {
    const request = route.request();
    const postData = request.postData();

    if (!postData) {
      await route.fulfill({
        status: 400,
        json: { error: 'invalid_request' },
      });
      return;
    }

    const params = new URLSearchParams(postData);
    const code = params.get('code');

    // Simulate error scenarios
    if (code?.includes('invalid_code')) {
      await route.fulfill({
        status: 400,
        json: { error: 'invalid_grant' },
      });
      return;
    }

    if (code?.includes('server_error')) {
      await route.fulfill({
        status: 500,
        json: { error: 'server_error' },
      });
      return;
    }

    // Return mock access token
    await route.fulfill({
      status: 200,
      json: {
        access_token: `mock_access_token_${code}`,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: `mock_refresh_token_${code}`,
      },
    });
  });

  // Mock Google user info endpoint
  await page.route('https://www.googleapis.com/oauth2/v2/userinfo', async (route) => {
    const request = route.request();
    const authHeader = request.headers()['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      await route.fulfill({
        status: 401,
        json: { error: 'unauthorized' },
      });
      return;
    }

    const accessToken = authHeader.replace('Bearer ', '');

    // Extract code from access token for test scenarios
    const mockData = getMockUserDataFromToken(accessToken);

    await route.fulfill({
      status: 200,
      json: mockData,
    });
  });
}

/**
 * Get mock user data based on the access token (which contains the test code)
 */
function getMockUserDataFromToken(accessToken: string): MockGoogleUser {
  // Extract code from token
  const code = accessToken.replace('mock_access_token_', '');

  // Return different user data based on test code
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
    const timestamp = Date.now();
    return {
      email: `pictureuser${timestamp}@gmail.com`,
      name: 'Picture User',
      picture: 'https://lh3.googleusercontent.com/a/test-picture',
      sub: `google_sub_picture_${timestamp}`,
    };
  }

  if (code.includes('auto_nickname')) {
    const timestamp = Date.now();
    return {
      email: `newuser${timestamp}@gmail.com`,
      name: 'Auto Nickname User',
      sub: `google_sub_auto_${timestamp}`,
    };
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
 * Clear Google OAuth mocks
 */
export async function clearGoogleOAuthMocks(page: Page): Promise<void> {
  await page.unroute('https://oauth2.googleapis.com/token');
  await page.unroute('https://www.googleapis.com/oauth2/v2/userinfo');
}
