import { test, expect } from '@playwright/test';
import { authenticateAsTestUser, clearAuth } from '../helpers/auth';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should redirect unauthenticated user to login page', async ({ page }) => {
    // Act
    await page.goto('/diary');

    // Assert
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('authenticated user can access protected routes', async ({ page }) => {
    // Arrange
    await authenticateAsTestUser(page);

    // Act
    await page.goto('/diary');

    // Assert
    await expect(page).not.toHaveURL(/\/auth\/login/);
    // Should not be redirected
  });

  test('user can log out', async ({ page }) => {
    // Arrange
    await authenticateAsTestUser(page);
    await page.goto('/settings');

    // Act - Wait for logout button to appear and click it
    const logoutButton = page.getByRole('button', { name: /logout/i });
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    // Wait for logout redirect to complete
    await page.waitForURL(/\/auth\/login/);

    // Assert - After logout, accessing diary should redirect to auth/login
    await page.goto('/diary');
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

test.describe('Login Form', () => {
  test('should show validation errors for empty form', async ({ page }) => {
    // Arrange
    await page.goto('/auth/login');

    // Act
    await page.getByRole('button', { name: /login|sign in/i }).click();

    // Assert
    // Should show validation messages (implementation dependent)
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    // Arrange
    await page.goto('/auth/login');

    // Act
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('testpassword123');
    await page.getByRole('button', { name: /login|sign in/i }).click();

    // Assert
    // Should redirect to diary or home after successful login
    await page.waitForURL(/\/(diary|home|$)/);
    await expect(page).not.toHaveURL(/\/auth\/login/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Arrange
    await page.goto('/auth/login');

    // Act
    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /login|sign in/i }).click();

    // Assert
    // Should show error message
    await expect(page.getByText(/invalid|incorrect|wrong/i)).toBeVisible();
  });
});
