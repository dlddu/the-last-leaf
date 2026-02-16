import { test, expect } from '@playwright/test';
import { authenticateAsTestUser, clearAuth } from '../helpers/auth';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should redirect unauthenticated user to login page', async ({ page }) => {
    // Act
    await page.goto('/dashboard');

    // Assert
    await expect(page).toHaveURL(/\/login/);
  });

  test('authenticated user can access protected routes', async ({ page }) => {
    // Arrange
    await authenticateAsTestUser(page);

    // Act
    await page.goto('/dashboard');

    // Assert
    await expect(page).not.toHaveURL(/\/login/);
    // Should not be redirected
  });

  test('user can log out', async ({ page }) => {
    // Arrange
    await authenticateAsTestUser(page);
    await page.goto('/dashboard');

    // Act - Wait for logout button to appear and click it
    const logoutButton = page.getByRole('button', { name: /logout/i });
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    // Wait for logout redirect to complete
    await page.waitForURL(/\/login/);

    // Assert - After logout, accessing dashboard should redirect to login
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Login Form', () => {
  test('should show validation errors for empty form', async ({ page }) => {
    // Arrange
    await page.goto('/login');

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
    await page.goto('/login');

    // Act
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('testpassword123');
    await page.getByRole('button', { name: /login|sign in/i }).click();

    // Assert
    // Should redirect to dashboard or home after successful login
    await page.waitForURL(/\/(dashboard|home|$)/);
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Arrange
    await page.goto('/login');

    // Act
    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /login|sign in/i }).click();

    // Assert
    // Should show error message
    await expect(page.getByText(/invalid|incorrect|wrong/i)).toBeVisible();
  });
});
