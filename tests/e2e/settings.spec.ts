import { test, expect } from '@playwright/test';
import { authenticateAsTestUser, clearAuth } from '../helpers/auth';

// TODO: Activate when DLD-378 is implemented
test.describe('Settings Home - BottomNav Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
    await page.goto('/diary');
  });

  test('should navigate to /settings when clicking BottomNav settings tab', async ({ page }) => {
    // Act
    await page.getByRole('button', { name: /설정/i }).click();

    // Assert
    await page.waitForURL(/\/settings/);
    await expect(page).toHaveURL(/\/settings/);
  });

  test('should display settings home page after navigating via BottomNav', async ({ page }) => {
    // Act
    await page.getByRole('button', { name: /설정/i }).click();
    await page.waitForURL(/\/settings/);

    // Assert
    await expect(page.getByRole('heading', { name: /설정/i })).toBeVisible();
  });
});

// TODO: Activate when DLD-378 is implemented
test.describe('Settings Home - UserInfoCard', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
    await page.goto('/settings');
  });

  test('should display nickname on UserInfoCard', async ({ page }) => {
    // Assert
    const userInfoCard = page.locator('[data-testid="user-info-card"]');
    await expect(userInfoCard).toBeVisible();
    await expect(userInfoCard.locator('[data-testid="user-nickname"]')).toBeVisible();
  });

  test('should display email on UserInfoCard', async ({ page }) => {
    // Assert
    const userInfoCard = page.locator('[data-testid="user-info-card"]');
    await expect(userInfoCard).toBeVisible();
    await expect(userInfoCard.locator('[data-testid="user-email"]')).toBeVisible();
    // test@example.com is the seeded test user
    await expect(userInfoCard.locator('[data-testid="user-email"]')).toContainText('test@example.com');
  });
});

// TODO: Activate when DLD-378 is implemented
test.describe('Settings Home - MenuItem Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
    await page.goto('/settings');
  });

  test('should navigate to /settings/profile when clicking profile menu item', async ({ page }) => {
    // Act
    await page.locator('[data-testid="menu-item-profile"]').click();

    // Assert
    await page.waitForURL(/\/settings\/profile/);
    await expect(page).toHaveURL(/\/settings\/profile/);
  });
});

// TODO: Activate when DLD-378 is implemented
test.describe('Settings Profile - Page Access', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
  });

  test('should navigate to /settings/profile from settings home via profile menu item', async ({ page }) => {
    // Arrange
    await page.goto('/settings');

    // Act
    await page.locator('[data-testid="menu-item-profile"]').click();

    // Assert
    await page.waitForURL(/\/settings\/profile/);
    await expect(page).toHaveURL(/\/settings\/profile/);
    await expect(page.getByRole('heading', { name: /프로필|profile/i })).toBeVisible();
  });
});

// TODO: Activate when DLD-378 is implemented
test.describe('Settings Profile - Form Fields', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
    await page.goto('/settings/profile');
  });

  test('should display email field as disabled (non-editable)', async ({ page }) => {
    // Assert
    const emailInput = page.locator('[data-testid="profile-email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toBeDisabled();
  });

  test('should save updated name and nickname and show toast message', async ({ page }) => {
    // Arrange
    const nicknameInput = page.locator('[data-testid="profile-nickname"]');
    const newNickname = `UpdatedNick${Date.now()}`;

    // Act
    await nicknameInput.clear();
    await nicknameInput.fill(newNickname);
    await page.getByRole('button', { name: /저장|save/i }).click();

    // Assert - Toast message should appear
    await expect(
      page.getByText(/저장되었습니다|변경되었습니다|saved|updated/i)
    ).toBeVisible();
  });

  test('should reflect updated nickname on settings home after saving profile changes', async ({ page }) => {
    // Arrange
    const nicknameInput = page.locator('[data-testid="profile-nickname"]');
    const newNickname = `NickReflect${Date.now()}`;

    // Act - Update nickname and save
    await nicknameInput.clear();
    await nicknameInput.fill(newNickname);
    await page.getByRole('button', { name: /저장|save/i }).click();
    await expect(
      page.getByText(/저장되었습니다|변경되었습니다|saved|updated/i)
    ).toBeVisible();

    // Navigate back to settings home
    await page.goto('/settings');

    // Assert - Changed nickname should be visible on UserInfoCard
    const userInfoCard = page.locator('[data-testid="user-info-card"]');
    await expect(userInfoCard.locator('[data-testid="user-nickname"]')).toContainText(newNickname);
  });
});

// TODO: Activate when DLD-378 is implemented
test.describe('Settings - Authentication Guard', () => {
  test('should redirect to /login when unauthenticated user accesses /settings', async ({ page }) => {
    // Arrange
    await clearAuth(page);

    // Act
    await page.goto('/settings');

    // Assert
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to /login when unauthenticated user accesses /settings/profile', async ({ page }) => {
    // Arrange
    await clearAuth(page);

    // Act
    await page.goto('/settings/profile');

    // Assert
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });
});
