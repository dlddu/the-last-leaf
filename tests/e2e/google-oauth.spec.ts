import { test, expect } from '@playwright/test';
import { clearAuth } from '../helpers/auth';
import { prisma } from '../helpers/db-cleanup';

// TODO: Activate when DLD-366 is implemented
test.describe.skip('Google OAuth - Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should display Google login button on login page', async ({ page }) => {
    // Act
    await page.goto('/login');

    // Assert
    const googleLoginButton = page.getByRole('button', { name: /google|구글/i });
    await expect(googleLoginButton).toBeVisible();
  });

  test('should display Google login button on signup page', async ({ page }) => {
    // Act
    await page.goto('/auth/signup');

    // Assert
    const googleLoginButton = page.getByRole('button', { name: /google|구글/i });
    await expect(googleLoginButton).toBeVisible();
  });

  test('should have correct Google OAuth button styling and icon', async ({ page }) => {
    // Arrange
    await page.goto('/login');

    // Assert
    const googleButton = page.getByRole('button', { name: /google|구글/i });
    await expect(googleButton).toBeVisible();

    // Check if Google icon/logo is present (common patterns)
    const hasGoogleIcon = await googleButton.locator('svg, img[alt*="Google"], img[alt*="구글"]').count() > 0;
    expect(hasGoogleIcon).toBeTruthy();
  });
});

// TODO: Activate when DLD-366 is implemented
test.describe.skip('Google OAuth - New User Registration', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should create new user account after successful Google OAuth callback', async ({ page }) => {
    // Arrange - Mock OAuth callback with test token
    const testGoogleUser = {
      email: 'newuser@gmail.com',
      name: 'New Google User',
      picture: 'https://example.com/picture.jpg',
    };

    // Act - Simulate OAuth callback (this would be handled by Google in production)
    // Using test bypass endpoint for E2E testing
    await page.goto('/api/auth/google/callback?code=test_new_user_code');

    // Assert - Should redirect to /diary after successful login
    await page.waitForURL(/\/diary/);
    await expect(page).toHaveURL(/\/diary/);

    // Assert - User should be created in database
    const createdUser = await prisma.user.findUnique({
      where: { email: testGoogleUser.email },
    });

    expect(createdUser).toBeTruthy();
    expect(createdUser?.email).toBe(testGoogleUser.email);
  });

  test('should set JWT auth cookie after successful new user registration', async ({ page }) => {
    // Arrange - Mock OAuth callback
    const testEmail = 'newuser2@gmail.com';

    // Act
    await page.goto(`/api/auth/google/callback?code=test_new_user_${Date.now()}`);
    await page.waitForURL(/\/diary/);

    // Assert - Auth cookie should be set
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(cookie => cookie.name === 'auth-token');

    expect(authCookie).toBeTruthy();
    expect(authCookie?.httpOnly).toBe(true);
    expect(authCookie?.sameSite).toBe('Lax');
  });

  test('should auto-generate nickname for new Google OAuth user', async ({ page }) => {
    // Arrange
    const testEmail = `newuser${Date.now()}@gmail.com`;

    // Act
    await page.goto('/api/auth/google/callback?code=test_auto_nickname');
    await page.waitForURL(/\/diary/);

    // Assert - User should have auto-generated nickname
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    expect(user).toBeTruthy();
    expect(user?.nickname).toBeTruthy();
    expect(user?.nickname.length).toBeGreaterThan(0);
  });

  test('should store Google profile picture URL for new user', async ({ page }) => {
    // Arrange
    const testGoogleProfile = {
      email: `pictureuser${Date.now()}@gmail.com`,
      picture: 'https://lh3.googleusercontent.com/a/test-picture',
    };

    // Act
    await page.goto('/api/auth/google/callback?code=test_with_picture');
    await page.waitForURL(/\/diary/);

    // Assert - Profile picture should be stored (if schema supports it)
    const user = await prisma.user.findUnique({
      where: { email: testGoogleProfile.email },
    });

    expect(user).toBeTruthy();
    // Uncomment when profile_picture field is added to User schema
    // expect(user?.profile_picture).toBe(testGoogleProfile.picture);
  });
});

// TODO: Activate when DLD-366 is implemented
test.describe.skip('Google OAuth - Existing User Login', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should login existing user without creating duplicate account', async ({ page }) => {
    // Arrange - Create existing user with Google email
    const existingEmail = 'existing.google.user@gmail.com';

    const existingUser = await prisma.user.create({
      data: {
        email: existingEmail,
        nickname: 'Existing User',
        password_hash: 'oauth_no_password', // Google OAuth users may not have password
      },
    });

    const initialUserCount = await prisma.user.count();

    // Act - Login with same Google account
    await page.goto('/api/auth/google/callback?code=test_existing_user');
    await page.waitForURL(/\/diary/);

    // Assert - No new user created
    const finalUserCount = await prisma.user.count();
    expect(finalUserCount).toBe(initialUserCount);

    // Assert - Same user is logged in
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(cookie => cookie.name === 'auth-token');
    expect(authCookie).toBeTruthy();

    // Cleanup
    await prisma.user.delete({ where: { user_id: existingUser.user_id } });
  });

  test('should update last login timestamp for returning Google OAuth user', async ({ page }) => {
    // Arrange
    const existingEmail = 'returning.user@gmail.com';

    const existingUser = await prisma.user.create({
      data: {
        email: existingEmail,
        nickname: 'Returning User',
        password_hash: 'oauth_no_password',
      },
    });

    // Wait a bit to ensure timestamp difference
    await page.waitForTimeout(1000);

    // Act
    await page.goto('/api/auth/google/callback?code=test_returning_user');
    await page.waitForURL(/\/diary/);

    // Assert - Check if last_login or updated_at is updated (if schema supports it)
    const updatedUser = await prisma.user.findUnique({
      where: { user_id: existingUser.user_id },
    });

    expect(updatedUser).toBeTruthy();
    // Uncomment when last_login field is added
    // expect(updatedUser?.last_login).not.toBeNull();

    // Cleanup
    await prisma.user.delete({ where: { user_id: existingUser.user_id } });
  });

  test('should preserve existing user data when logging in via Google OAuth', async ({ page }) => {
    // Arrange
    const existingUser = await prisma.user.create({
      data: {
        email: 'preserve.data@gmail.com',
        nickname: 'Original Nickname',
        password_hash: 'oauth_no_password',
      },
    });

    // Act
    await page.goto('/api/auth/google/callback?code=test_preserve_data');
    await page.waitForURL(/\/diary/);

    // Assert - User data should remain unchanged
    const userAfterLogin = await prisma.user.findUnique({
      where: { user_id: existingUser.user_id },
    });

    expect(userAfterLogin?.nickname).toBe('Original Nickname');
    expect(userAfterLogin?.email).toBe('preserve.data@gmail.com');

    // Cleanup
    await prisma.user.delete({ where: { user_id: existingUser.user_id } });
  });
});

// TODO: Activate when DLD-366 is implemented
test.describe.skip('Google OAuth - Redirect Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should redirect to /diary after successful Google OAuth login', async ({ page }) => {
    // Act
    await page.goto('/api/auth/google/callback?code=test_redirect');

    // Assert
    await page.waitForURL(/\/diary/);
    await expect(page).toHaveURL(/\/diary/);
  });

  test('should redirect to originally requested page after Google OAuth (if state parameter used)', async ({ page }) => {
    // Arrange - User tries to access protected route
    const protectedRoute = '/settings';

    // Act - Simulate OAuth flow with state parameter
    await page.goto(`/api/auth/google/callback?code=test_state&state=${encodeURIComponent(protectedRoute)}`);

    // Assert - Should redirect to original destination
    await page.waitForURL(/\/settings/);
    await expect(page).toHaveURL(/\/settings/);
  });

  test('should redirect authenticated Google user away from /login page', async ({ page }) => {
    // Arrange - Complete Google OAuth login
    await page.goto('/api/auth/google/callback?code=test_auth_guard');
    await page.waitForURL(/\/diary/);

    // Act - Try to access login page
    await page.goto('/login');

    // Assert - Should be redirected to /diary (authenticated user guard)
    await page.waitForURL(/\/diary/);
    await expect(page).toHaveURL(/\/diary/);
  });

  test('should redirect authenticated Google user away from /auth/signup page', async ({ page }) => {
    // Arrange
    await page.goto('/api/auth/google/callback?code=test_signup_guard');
    await page.waitForURL(/\/diary/);

    // Act
    await page.goto('/auth/signup');

    // Assert
    await page.waitForURL(/\/diary/);
    await expect(page).toHaveURL(/\/diary/);
  });
});

// TODO: Activate when DLD-366 is implemented
test.describe.skip('Google OAuth - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should show error message when OAuth callback fails', async ({ page }) => {
    // Act - Simulate failed OAuth callback
    await page.goto('/api/auth/google/callback?error=access_denied');

    // Assert - Should redirect to login with error message
    await page.waitForURL(/\/login/);
    await expect(page.getByText(/google.*로그인.*실패|google.*login.*failed/i)).toBeVisible();
  });

  test('should handle missing authorization code gracefully', async ({ page }) => {
    // Act - Access callback without code parameter
    await page.goto('/api/auth/google/callback');

    // Assert - Should show error or redirect to login
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });

  test('should handle invalid authorization code', async ({ page }) => {
    // Act
    await page.goto('/api/auth/google/callback?code=invalid_code_123');

    // Assert - Should redirect to login with error
    await page.waitForURL(/\/login/);
    await expect(page.getByText(/인증.*실패|authentication.*failed/i)).toBeVisible();
  });

  test('should handle Google API server errors gracefully', async ({ page }) => {
    // Act - Simulate server error scenario
    await page.goto('/api/auth/google/callback?code=simulate_server_error');

    // Assert
    await page.waitForURL(/\/login/);
    await expect(page.getByText(/오류가.*발생|error.*occurred/i)).toBeVisible();
  });

  test('should not create partial user data if Google OAuth flow fails', async ({ page }) => {
    // Arrange
    const initialUserCount = await prisma.user.count();

    // Act - Simulate failed OAuth
    await page.goto('/api/auth/google/callback?error=server_error');
    await page.waitForURL(/\/login/);

    // Assert - No new user should be created
    const finalUserCount = await prisma.user.count();
    expect(finalUserCount).toBe(initialUserCount);
  });
});

// TODO: Activate when DLD-366 is implemented
test.describe.skip('Google OAuth - Security', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should use HTTP-only cookie for Google OAuth session', async ({ page }) => {
    // Act
    await page.goto('/api/auth/google/callback?code=test_httponly');
    await page.waitForURL(/\/diary/);

    // Assert
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(cookie => cookie.name === 'auth-token');

    expect(authCookie?.httpOnly).toBe(true);
  });

  test('should set SameSite attribute on auth cookie', async ({ page }) => {
    // Act
    await page.goto('/api/auth/google/callback?code=test_samesite');
    await page.waitForURL(/\/diary/);

    // Assert
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(cookie => cookie.name === 'auth-token');

    expect(authCookie?.sameSite).toBe('Lax');
  });

  test('should set secure flag on auth cookie in production', async ({ page }) => {
    // Note: This test would need to run in production-like environment
    // Act
    await page.goto('/api/auth/google/callback?code=test_secure');
    await page.waitForURL(/\/diary/);

    // Assert
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(cookie => cookie.name === 'auth-token');

    // In production, secure should be true
    // In development/test, it may be false for localhost
    expect(authCookie).toBeTruthy();
  });

  test('should validate state parameter to prevent CSRF attacks', async ({ page }) => {
    // Act - Send callback without valid state
    await page.goto('/api/auth/google/callback?code=test_code&state=invalid_state');

    // Assert - Should reject and redirect to login
    await page.waitForURL(/\/login/);
  });

  test('should not expose sensitive Google tokens in client-side JavaScript', async ({ page }) => {
    // Act
    await page.goto('/api/auth/google/callback?code=test_token_security');
    await page.waitForURL(/\/diary/);

    // Assert - Check that Google access token is not in DOM or localStorage
    const hasAccessTokenInLocalStorage = await page.evaluate(() => {
      return localStorage.getItem('google_access_token') !== null ||
             localStorage.getItem('access_token') !== null;
    });

    expect(hasAccessTokenInLocalStorage).toBe(false);
  });
});

// TODO: Activate when DLD-366 is implemented
test.describe.skip('Google OAuth - Database Integrity', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should create user with valid email format', async ({ page }) => {
    // Arrange
    const testEmail = `validformat${Date.now()}@gmail.com`;

    // Act
    await page.goto('/api/auth/google/callback?code=test_email_format');
    await page.waitForURL(/\/diary/);

    // Assert
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    expect(user).toBeTruthy();
    expect(user?.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  test('should generate unique user_id for new Google OAuth user', async ({ page }) => {
    // Act - Create two users
    await page.goto('/api/auth/google/callback?code=test_unique_1');
    await page.waitForURL(/\/diary/);

    await clearAuth(page);

    await page.goto('/api/auth/google/callback?code=test_unique_2');
    await page.waitForURL(/\/diary/);

    // Assert - All users should have unique IDs
    const users = await prisma.user.findMany({
      select: { user_id: true },
    });

    const userIds = users.map(u => u.user_id);
    const uniqueIds = new Set(userIds);
    expect(uniqueIds.size).toBe(userIds.length);
  });

  test('should enforce email uniqueness constraint', async ({ page }) => {
    // Arrange - Create user with specific email
    const duplicateEmail = 'duplicate@gmail.com';

    await prisma.user.create({
      data: {
        email: duplicateEmail,
        nickname: 'First User',
        password_hash: 'oauth_no_password',
      },
    });

    // Act - Try to create another user with same email via OAuth
    await page.goto('/api/auth/google/callback?code=test_duplicate_email');

    // Assert - Should login existing user, not create duplicate
    await page.waitForURL(/\/diary/);

    const userCount = await prisma.user.count({
      where: { email: duplicateEmail },
    });

    expect(userCount).toBe(1);

    // Cleanup
    await prisma.user.delete({ where: { email: duplicateEmail } });
  });

  test('should handle concurrent Google OAuth requests for same user', async ({ page, context }) => {
    // Arrange - Create two browser contexts simulating concurrent requests
    const page2 = await context.newPage();
    const testEmail = 'concurrent@gmail.com';

    // Act - Simulate concurrent OAuth callbacks
    await Promise.all([
      page.goto('/api/auth/google/callback?code=test_concurrent_1'),
      page2.goto('/api/auth/google/callback?code=test_concurrent_2'),
    ]);

    await Promise.all([
      page.waitForURL(/\/diary/),
      page2.waitForURL(/\/diary/),
    ]);

    // Assert - Only one user should be created
    const userCount = await prisma.user.count({
      where: { email: testEmail },
    });

    expect(userCount).toBeLessThanOrEqual(1);

    // Cleanup
    await page2.close();
  });
});
