import { test, expect } from '@playwright/test';

test.describe('Application Health Checks', () => {
  test('should load the home page', async ({ page }) => {
    // Act
    await page.goto('/');

    // Assert
    expect(page.url()).toContain('/');
    await expect(page).toHaveTitle(/.*/); // Has some title
  });

  test('should respond with 200 status', async ({ page }) => {
    // Act
    const response = await page.goto('/');

    // Assert
    expect(response).not.toBeNull();
    expect(response?.status()).toBe(200);
  });

  test('should render without JavaScript errors', async ({ page }) => {
    // Arrange
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // Act
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Assert
    expect(errors).toHaveLength(0);
  });

  test('should have no console errors', async ({ page }) => {
    // Arrange
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Act
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Assert
    expect(consoleErrors).toHaveLength(0);
  });
});
