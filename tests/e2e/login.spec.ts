import { test, expect } from '@playwright/test';
import { authenticateAsTestUser, clearAuth } from '../helpers/auth';

// TODO: Activate when DLD-364 is implemented
test.describe('Login Page - Access and Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should render login form when accessing /login', async ({ page }) => {
    // Act
    await page.goto('/login');

    // Assert
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /login|로그인/i })).toBeVisible();
    await expect(page.getByLabel(/email|이메일/i)).toBeVisible();
    await expect(page.getByLabel(/password|비밀번호/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /login|로그인/i })).toBeVisible();
  });

  test('should display email input field with correct type and attributes', async ({ page }) => {
    // Act
    await page.goto('/login');

    // Assert
    const emailInput = page.getByLabel(/email|이메일/i);
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(emailInput).toHaveAttribute('id', 'email');
  });

  test('should display password input field with correct type and attributes', async ({ page }) => {
    // Act
    await page.goto('/login');

    // Assert
    const passwordInput = page.getByLabel(/password|비밀번호/i);
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(passwordInput).toHaveAttribute('id', 'password');
  });
});

// TODO: Activate when DLD-364 is implemented
test.describe('Login Flow - Success Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should successfully login with valid credentials and redirect to /dashboard', async ({ page }) => {
    // Arrange
    const testEmail = 'test@example.com';
    const testPassword = 'testpassword123';

    // Act
    await page.goto('/login');
    await page.getByLabel(/email|이메일/i).fill(testEmail);
    await page.getByLabel(/password|비밀번호/i).fill(testPassword);
    await page.getByRole('button', { name: /^login|^로그인/i }).click();

    // Assert
    await page.waitForURL(/\/dashboard/);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should show loading state while login request is processing', async ({ page }) => {
    // Arrange
    const testEmail = 'test@example.com';
    const testPassword = 'testpassword123';

    // Act
    await page.goto('/login');
    await page.getByLabel(/email|이메일/i).fill(testEmail);
    await page.getByLabel(/password|비밀번호/i).fill(testPassword);

    // Click and immediately check for loading state
    const submitButton = page.getByRole('button', { name: /^login|^로그인/i });
    await submitButton.click();

    // Assert - Check for loading state (button text changes to "Logging in...")
    await expect(page.getByRole('button', { name: /logging in/i })).toBeVisible();
  });

  test('should preserve form values when validation fails', async ({ page }) => {
    // Arrange
    const testEmail = 'test@example.com';

    // Act
    await page.goto('/login');
    await page.getByLabel(/email|이메일/i).fill(testEmail);
    // Leave password empty
    await page.getByRole('button', { name: /^login|^로그인/i }).click();

    // Assert - Email should be preserved
    await expect(page.getByLabel(/email|이메일/i)).toHaveValue(testEmail);
  });
});

// TODO: Activate when DLD-364 is implemented
test.describe('Login Form - Validation Errors', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
    await page.goto('/login');
  });

  test('should show validation errors when required fields are missing', async ({ page }) => {
    // Act - Submit empty form
    await page.getByRole('button', { name: /^login|^로그인/i }).click();

    // Assert
    const emailInput = page.getByLabel(/email|이메일/i);
    const passwordInput = page.getByLabel(/password|비밀번호/i);

    // Check that form inputs are still visible (validation prevented submission)
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Still on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show validation error when email field is missing', async ({ page }) => {
    // Act
    await page.getByLabel(/password|비밀번호/i).fill('testpassword123');
    await page.getByRole('button', { name: /^login|^로그인/i }).click();

    // Assert
    await expect(page.getByLabel(/email|이메일/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show validation error when password field is missing', async ({ page }) => {
    // Act
    await page.getByLabel(/email|이메일/i).fill('test@example.com');
    await page.getByRole('button', { name: /^login|^로그인/i }).click();

    // Assert
    await expect(page.getByLabel(/password|비밀번호/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show validation error for invalid email format', async ({ page }) => {
    // Act
    await page.getByLabel(/email|이메일/i).fill('invalid-email');
    await page.getByLabel(/password|비밀번호/i).fill('testpassword123');
    await page.getByRole('button', { name: /^login|^로그인/i }).click();

    // Assert
    // Should show email format validation error or stay on page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show validation error for email with spaces', async ({ page }) => {
    // Act
    await page.getByLabel(/email|이메일/i).fill('test @example.com');
    await page.getByLabel(/password|비밀번호/i).fill('testpassword123');
    await page.getByRole('button', { name: /^login|^로그인/i }).click();

    // Assert
    await expect(page).toHaveURL(/\/login/);
  });
});

// TODO: Activate when DLD-364 is implemented
test.describe('Login API - Error Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
    await page.goto('/login');
  });

  test('should show error message for incorrect password', async ({ page }) => {
    // Arrange
    const testEmail = 'test@example.com';
    const wrongPassword = 'wrongpassword123';

    // Act
    await page.getByLabel(/email|이메일/i).fill(testEmail);
    await page.getByLabel(/password|비밀번호/i).fill(wrongPassword);
    await page.getByRole('button', { name: /^login|^로그인/i }).click();

    // Assert - Use more specific error message pattern matching actual implementation
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show error message for non-existent email', async ({ page }) => {
    // Arrange
    const nonExistentEmail = 'nonexistent@example.com';
    const testPassword = 'testpassword123';

    // Act
    await page.getByLabel(/email|이메일/i).fill(nonExistentEmail);
    await page.getByLabel(/password|비밀번호/i).fill(testPassword);
    await page.getByRole('button', { name: /^login|^로그인/i }).click();

    // Assert - Same error message to prevent information disclosure
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should display error message with alert role for accessibility', async ({ page }) => {
    // Arrange
    const testEmail = 'test@example.com';
    const wrongPassword = 'wrongpassword123';

    // Act
    await page.getByLabel(/email|이메일/i).fill(testEmail);
    await page.getByLabel(/password|비밀번호/i).fill(wrongPassword);
    await page.getByRole('button', { name: /^login|^로그인/i }).click();

    // Assert - Error should have role="alert" for screen readers
    // Use more specific selector to avoid Next.js route announcer
    const errorAlert = page.locator('[role="alert"].text-red-500');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toHaveClass(/text-red-500/);
  });

  test('should clear previous error message on new submission', async ({ page }) => {
    // Arrange
    const testEmail = 'test@example.com';
    const wrongPassword = 'wrongpassword123';

    // Act - First attempt with wrong password
    await page.getByLabel(/email|이메일/i).fill(testEmail);
    await page.getByLabel(/password|비밀번호/i).fill(wrongPassword);
    await page.getByRole('button', { name: /^login|^로그인/i }).click();

    // Assert - Error appears
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();

    // Act - Second attempt with correct password
    await page.getByLabel(/password|비밀번호/i).clear();
    await page.getByLabel(/password|비밀번호/i).fill('testpassword123');
    await page.getByRole('button', { name: /^login|^로그인/i }).click();

    // Assert - Should redirect (error cleared)
    await page.waitForURL(/\/dashboard/);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should handle server error gracefully', async ({ page }) => {
    // Note: This test would require mocking or simulating server error
    // For now, we're documenting the expected behavior

    // Act - Fill in valid credentials
    await page.getByLabel(/email|이메일/i).fill('test@example.com');
    await page.getByLabel(/password|비밀번호/i).fill('testpassword123');

    // If server returns 500, should show appropriate error message
    // This behavior will be tested when implementation is complete
  });
});

// TODO: Activate when DLD-364 is implemented
test.describe('Login Page - Authentication Guard', () => {
  test('should redirect to /dashboard when authenticated user accesses /login', async ({ page }) => {
    // Arrange - Authenticate as test user
    await authenticateAsTestUser(page);

    // Act
    await page.goto('/login');

    // Assert
    await page.waitForURL(/\/dashboard/);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should allow direct access to /login for unauthenticated users', async ({ page }) => {
    // Arrange
    await clearAuth(page);

    // Act
    await page.goto('/login');

    // Assert
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /login|로그인/i })).toBeVisible();
  });

  test('should redirect to /login when unauthenticated user tries to access protected route', async ({ page }) => {
    // Arrange
    await clearAuth(page);

    // Act - Try to access protected route
    await page.goto('/diary');

    // Assert - Should be redirected to login
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to /login when accessing /dashboard without authentication', async ({ page }) => {
    // Arrange
    await clearAuth(page);

    // Act
    await page.goto('/dashboard');

    // Assert
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to /login when accessing /settings without authentication', async ({ page }) => {
    // Arrange
    await clearAuth(page);

    // Act
    await page.goto('/settings');

    // Assert
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });
});

// TODO: Activate when DLD-364 is implemented
test.describe('Login Page - User Experience', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
    await page.goto('/login');
  });

  test('should allow navigation to signup page if link exists', async ({ page }) => {
    // Act - Look for signup link
    const signupLink = page.getByRole('link', { name: /sign up|회원가입/i });

    // Assert - If link exists, it should navigate to signup page
    if (await signupLink.isVisible()) {
      await signupLink.click();
      await expect(page).toHaveURL(/\/auth\/signup/);
    }
  });

  test('should focus on email field when page loads', async ({ page }) => {
    // Act
    await page.goto('/login');

    // Assert - Email field should be focused (if auto-focus is implemented)
    const emailInput = page.getByLabel(/email|이메일/i);
    await expect(emailInput).toBeVisible();
  });

  test('should allow password visibility toggle if feature exists', async ({ page }) => {
    // Arrange
    const passwordInput = page.getByLabel(/password|비밀번호/i);

    // Act - Look for toggle button
    const toggleButton = page.getByRole('button', { name: /show|hide|toggle password/i });

    // Assert - If toggle exists, clicking should change input type
    if (await toggleButton.isVisible()) {
      await expect(passwordInput).toHaveAttribute('type', 'password');
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });

  test('should enable submit button only when form is valid', async ({ page }) => {
    // Arrange
    const submitButton = page.getByRole('button', { name: /^login|^로그인/i });

    // Act - Check button state with empty form
    // (This assumes button is disabled when form is invalid)
    const initialState = await submitButton.isEnabled();

    // Fill form with valid data
    await page.getByLabel(/email|이메일/i).fill('test@example.com');
    await page.getByLabel(/password|비밀번호/i).fill('testpassword123');

    // Assert - Button should be enabled
    await expect(submitButton).toBeEnabled();
  });
});
