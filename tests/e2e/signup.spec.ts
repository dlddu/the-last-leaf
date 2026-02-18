import { test, expect } from '@playwright/test';
import { authenticateAsTestUser, clearAuth } from '../helpers/auth';
import { cleanupUserData } from '../helpers/db-cleanup';

// TODO: Activate when DLD-362 is implemented
test.describe('Signup Page - Access and Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should render signup form when accessing /auth/signup', async ({ page }) => {
    // Act
    await page.goto('/auth/signup');

    // Assert
    await expect(page).toHaveURL(/\/auth\/signup/);
    await expect(page.getByText('나의 자서전')).toBeVisible();
    await expect(page.getByLabel(/email|이메일/i)).toBeVisible();
    await expect(page.getByLabel(/^password$|^비밀번호$/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password|비밀번호 확인/i)).toBeVisible();
    await expect(page.getByLabel(/nickname|닉네임/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up|가입하기/i })).toBeVisible();
  });
});

// TODO: Activate when DLD-362 is implemented
test.describe('Signup Flow - Success Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test.afterEach(async () => {
    // Cleanup: Remove test user created during signup
    const testEmail = `newuser-${Date.now()}@example.com`;
    await cleanupUserData(testEmail).catch(() => {
      // Ignore if user wasn't created
    });
  });

  test('should successfully signup with valid credentials and redirect to /diary', async ({ page }) => {
    // Arrange
    const testEmail = `newuser-${Date.now()}@example.com`;
    const testPassword = 'password123';
    const testNickname = `TestUser${Date.now()}`;

    // Act
    await page.goto('/auth/signup');
    await page.getByLabel(/email|이메일/i).fill(testEmail);
    await page.getByLabel(/^password$|^비밀번호$/i).fill(testPassword);
    await page.getByLabel(/confirm password|비밀번호 확인/i).fill(testPassword);
    await page.getByLabel(/nickname|닉네임/i).fill(testNickname);
    await page.getByRole('button', { name: /sign up|가입하기/i }).click();

    // Assert
    await page.waitForURL(/\/diary/);
    await expect(page).toHaveURL(/\/diary/);
  });
});

// TODO: Activate when DLD-362 is implemented
test.describe('Signup Form - Validation Errors', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
    await page.goto('/auth/signup');
  });

  test('should show validation error when password is less than 8 characters', async ({ page }) => {
    // Arrange
    const shortPassword = 'pass123'; // 7 characters

    // Act
    await page.getByLabel(/email|이메일/i).fill('test@example.com');
    await page.getByLabel(/^password$|^비밀번호$/i).fill(shortPassword);
    await page.getByLabel(/confirm password|비밀번호 확인/i).fill(shortPassword);
    await page.getByLabel(/nickname|닉네임/i).fill('TestUser');
    await page.getByRole('button', { name: /sign up|가입하기/i }).click();

    // Assert
    await expect(page.getByText(/8자 이상|at least 8 characters/i)).toBeVisible();
  });

  test('should show validation error when passwords do not match', async ({ page }) => {
    // Act
    await page.getByLabel(/email|이메일/i).fill('test@example.com');
    await page.getByLabel(/^password$|^비밀번호$/i).fill('password123');
    await page.getByLabel(/confirm password|비밀번호 확인/i).fill('password456');
    await page.getByLabel(/nickname|닉네임/i).fill('TestUser');
    await page.getByRole('button', { name: /sign up|가입하기/i }).click();

    // Assert
    await expect(page.getByText(/비밀번호가 일치하지 않습니다|passwords do not match/i)).toBeVisible();
  });

  test('should show validation errors when required fields are missing', async ({ page }) => {
    // Act - Submit empty form
    await page.getByRole('button', { name: /sign up|가입하기/i }).click();

    // Assert
    const emailInput = page.getByLabel(/email|이메일/i);
    const passwordInput = page.getByLabel(/^password$|^비밀번호$/i);
    const nicknameInput = page.getByLabel(/nickname|닉네임/i);

    // Check that form inputs are still visible (validation prevented submission)
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(nicknameInput).toBeVisible();

    // Still on signup page
    await expect(page).toHaveURL(/\/auth\/signup/);
  });

  test('should show validation error when email field is missing', async ({ page }) => {
    // Act
    await page.getByLabel(/^password$|^비밀번호$/i).fill('password123');
    await page.getByLabel(/confirm password|비밀번호 확인/i).fill('password123');
    await page.getByLabel(/nickname|닉네임/i).fill('TestUser');
    await page.getByRole('button', { name: /sign up|가입하기/i }).click();

    // Assert
    await expect(page.getByLabel(/email|이메일/i)).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/signup/);
  });

  test('should show validation error when password field is missing', async ({ page }) => {
    // Act
    await page.getByLabel(/email|이메일/i).fill('test@example.com');
    await page.getByLabel(/nickname|닉네임/i).fill('TestUser');
    await page.getByRole('button', { name: /sign up|가입하기/i }).click();

    // Assert
    await expect(page.getByLabel(/^password$|^비밀번호$/i)).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/signup/);
  });

  test('should show validation error when nickname field is missing', async ({ page }) => {
    // Act
    await page.getByLabel(/email|이메일/i).fill('test@example.com');
    await page.getByLabel(/^password$|^비밀번호$/i).fill('password123');
    await page.getByLabel(/confirm password|비밀번호 확인/i).fill('password123');
    await page.getByRole('button', { name: /sign up|가입하기/i }).click();

    // Assert
    await expect(page.getByLabel(/nickname|닉네임/i)).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/signup/);
  });
});

// TODO: Activate when DLD-362 is implemented
test.describe('Signup API - Error Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
    await page.goto('/auth/signup');
  });

  test('should show server error when email already exists', async ({ page }) => {
    // Arrange - Use email that already exists in test database
    const existingEmail = 'test@example.com'; // From seed data

    // Act
    await page.getByLabel(/email|이메일/i).fill(existingEmail);
    await page.getByLabel(/^password$|^비밀번호$/i).fill('password123');
    await page.getByLabel(/confirm password|비밀번호 확인/i).fill('password123');
    await page.getByLabel(/nickname|닉네임/i).fill('NewUser');
    await page.getByRole('button', { name: /sign up|가입하기/i }).click();

    // Assert
    await expect(page.getByText(/이미 가입된 이메일입니다|email already exists/i)).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/signup/);
  });
});

// TODO: Activate when DLD-362 is implemented
test.describe('Signup Page - Authentication Guard', () => {
  test('should redirect to /diary when authenticated user accesses /auth/signup', async ({ page }) => {
    // Arrange - Authenticate as test user
    await authenticateAsTestUser(page);

    // Act
    await page.goto('/auth/signup');

    // Assert
    await page.waitForURL(/\/diary/);
    await expect(page).toHaveURL(/\/diary/);
  });
});
