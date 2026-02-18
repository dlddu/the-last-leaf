import { test, expect } from '@playwright/test';
import { authenticateAsTestUser, clearAuth } from '../helpers/auth';

// ---------------------------------------------------------------------------
// Logout - Navigation
// ---------------------------------------------------------------------------

test.describe('Settings - Logout Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
    await page.goto('/settings');
  });

  test('should navigate to /login after clicking the logout button', async ({ page }) => {
    // Act
    await page.getByRole('button', { name: /logout/i }).click();

    // Assert
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });
});

// ---------------------------------------------------------------------------
// Logout - Authentication Guard (diary)
// ---------------------------------------------------------------------------

test.describe('Settings - Logout Authentication Guard (diary)', () => {
  test('should redirect to /login when accessing /diary after logout', async ({ page }) => {
    // Arrange — log in and then log out via the settings page
    await authenticateAsTestUser(page);
    await page.goto('/settings');
    await page.getByRole('button', { name: /logout/i }).click();
    await page.waitForURL(/\/login/);

    // Act — attempt to access a protected page
    await page.goto('/diary');

    // Assert
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });
});

// ---------------------------------------------------------------------------
// Logout - Authentication Guard (settings)
// ---------------------------------------------------------------------------

test.describe('Settings - Logout Authentication Guard (settings)', () => {
  test('should redirect to /login when accessing /settings after logout', async ({ page }) => {
    // Arrange
    await authenticateAsTestUser(page);
    await page.goto('/settings');
    await page.getByRole('button', { name: /logout/i }).click();
    await page.waitForURL(/\/login/);

    // Act
    await page.goto('/settings');

    // Assert
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to /login when accessing /settings/contacts after logout', async ({ page }) => {
    // Arrange
    await authenticateAsTestUser(page);
    await page.goto('/settings');
    await page.getByRole('button', { name: /logout/i }).click();
    await page.waitForURL(/\/login/);

    // Act
    await page.goto('/settings/contacts');

    // Assert
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to /login when accessing /settings/withdraw after logout', async ({ page }) => {
    // Arrange
    await authenticateAsTestUser(page);
    await page.goto('/settings');
    await page.getByRole('button', { name: /logout/i }).click();
    await page.waitForURL(/\/login/);

    // Act
    await page.goto('/settings/withdraw');

    // Assert
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });
});

// ---------------------------------------------------------------------------
// Logout - Cookie Removal
// ---------------------------------------------------------------------------

test.describe('Settings - Logout Cookie Removal', () => {
  test('should remove the auth-token cookie after logout', async ({ page }) => {
    // Arrange
    await authenticateAsTestUser(page);
    await page.goto('/settings');

    // Act
    await page.getByRole('button', { name: /logout/i }).click();
    await page.waitForURL(/\/login/);

    // Assert — auth-token cookie must no longer exist
    const cookies = await page.context().cookies();
    const authCookie = cookies.find((cookie) => cookie.name === 'auth-token');
    expect(authCookie).toBeUndefined();
  });
});
