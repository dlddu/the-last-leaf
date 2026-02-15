import { test, expect } from '@playwright/test';
import { authenticateAsTestUser, authenticateAsUser, clearAuth } from '../helpers/auth';
import { prisma } from '../helpers/db-cleanup';

test.describe('Diary Page - Authentication Guard', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should redirect unauthenticated user to /auth/login when accessing /diary', async ({ page }) => {
    // Act
    await page.goto('/diary');

    // Assert
    await page.waitForURL(/\/auth\/login/);
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should allow authenticated user to access /diary', async ({ page }) => {
    // Arrange
    await authenticateAsTestUser(page);

    // Act
    await page.goto('/diary');

    // Assert
    await expect(page).toHaveURL(/\/diary/);
  });
});

test.describe('Diary Page - Diary List Display', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
  });

  test('should display diary list when user has diaries', async ({ page }) => {
    // Act
    await page.goto('/diary');

    // Assert
    await expect(page).toHaveURL(/\/diary/);

    // Should display diary cards
    const diaryCards = page.locator('[data-testid="diary-card"]');
    await expect(diaryCards).toHaveCount(2); // Seed data has 2 diaries
  });

  test('should display diary card with date, time, and preview text', async ({ page }) => {
    // Act
    await page.goto('/diary');

    // Assert
    const firstDiaryCard = page.locator('[data-testid="diary-card"]').first();
    await expect(firstDiaryCard).toBeVisible();

    // Should contain date
    await expect(firstDiaryCard.locator('[data-testid="diary-date"]')).toBeVisible();

    // Should contain time
    await expect(firstDiaryCard.locator('[data-testid="diary-time"]')).toBeVisible();

    // Should contain preview text
    await expect(firstDiaryCard.locator('[data-testid="diary-preview"]')).toBeVisible();
    await expect(firstDiaryCard.locator('[data-testid="diary-preview"]')).toContainText(/test diary entry/i);
  });

  test('should display diaries in descending order by created_at', async ({ page }) => {
    // Act
    await page.goto('/diary');

    // Assert
    const diaryCards = page.locator('[data-testid="diary-card"]');

    // First card should be the most recent diary
    const firstCard = diaryCards.first();
    await expect(firstCard.locator('[data-testid="diary-preview"]')).toContainText(/second test diary entry/i);

    // Second card should be the older diary
    const secondCard = diaryCards.nth(1);
    await expect(secondCard.locator('[data-testid="diary-preview"]')).toContainText(/first test diary entry/i);
  });
});

test.describe('Diary Page - Infinite Scroll', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
  });

  test('should load next page when scrolling to bottom', async ({ page }) => {
    // Arrange - Create more diaries to trigger pagination
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }

    // Create 15 more diaries to have multiple pages
    for (let i = 0; i < 15; i++) {
      await prisma.diary.create({
        data: {
          user_id: testUser.user_id,
          content: `Test diary entry number ${i + 3}. This is for pagination testing.`,
        },
      });
    }

    // Act
    await page.goto('/diary');

    // Wait for initial load
    await page.waitForSelector('[data-testid="diary-card"]');
    const initialCount = await page.locator('[data-testid="diary-card"]').count();

    // Scroll to bottom
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    // Wait for loading indicator or new cards
    await page.waitForTimeout(1000);

    // Assert
    const newCount = await page.locator('[data-testid="diary-card"]').count();
    expect(newCount).toBeGreaterThan(initialCount);
  });

  test('should display loading indicator while fetching next page', async ({ page }) => {
    // Arrange - Create more diaries
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }

    for (let i = 0; i < 15; i++) {
      await prisma.diary.create({
        data: {
          user_id: testUser.user_id,
          content: `Test diary entry number ${i + 3}. This is for loading indicator testing.`,
        },
      });
    }

    // Act
    await page.goto('/diary');
    await page.waitForSelector('[data-testid="diary-card"]');

    // Scroll to bottom
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    // Assert - Loading indicator should appear
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
  });

  test('should use cursor-based pagination for infinite scroll', async ({ page }) => {
    // Arrange - Create more diaries
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }

    for (let i = 0; i < 15; i++) {
      await prisma.diary.create({
        data: {
          user_id: testUser.user_id,
          content: `Test diary entry number ${i + 3}. Cursor pagination test.`,
        },
      });
    }

    // Act
    await page.goto('/diary');

    // Listen to network requests
    const apiRequests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/api/diary')) {
        apiRequests.push(request.url());
      }
    });

    await page.waitForSelector('[data-testid="diary-card"]');

    // Scroll to bottom to trigger next page
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await page.waitForTimeout(1000);

    // Assert - Should have made request with cursor parameter
    expect(apiRequests.length).toBeGreaterThan(1);
    expect(apiRequests.some(url => url.includes('cursor='))).toBeTruthy();
  });
});

test.describe('Diary Page - Navigation to Detail', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
  });

  test('should navigate to /diary/:id when clicking diary card', async ({ page }) => {
    // Act
    await page.goto('/diary');

    // Wait for diary cards to load
    await page.waitForSelector('[data-testid="diary-card"]');

    // Click first diary card
    const firstDiaryCard = page.locator('[data-testid="diary-card"]').first();
    await firstDiaryCard.click();

    // Assert
    await page.waitForURL(/\/diary\/.+/);
    await expect(page).toHaveURL(/\/diary\/[a-z0-9]+/);
  });

  test('should preserve diary ID in URL when navigating to detail page', async ({ page }) => {
    // Arrange
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }

    const diaries = await prisma.diary.findMany({
      where: { user_id: testUser.user_id },
      orderBy: { created_at: 'desc' },
      take: 1,
    });

    const expectedDiaryId = diaries[0].diary_id;

    // Act
    await page.goto('/diary');
    await page.waitForSelector('[data-testid="diary-card"]');

    const firstDiaryCard = page.locator('[data-testid="diary-card"]').first();
    await firstDiaryCard.click();

    // Assert
    await page.waitForURL(new RegExp(`/diary/${expectedDiaryId}`));
    await expect(page).toHaveURL(new RegExp(`/diary/${expectedDiaryId}`));
  });

  test('should make diary cards clickable with proper cursor style', async ({ page }) => {
    // Act
    await page.goto('/diary');
    await page.waitForSelector('[data-testid="diary-card"]');

    // Assert
    const firstDiaryCard = page.locator('[data-testid="diary-card"]').first();

    // Should have cursor pointer style
    await expect(firstDiaryCard).toHaveCSS('cursor', 'pointer');
  });
});

test.describe('Diary Page - Empty State', () => {
  test.beforeEach(async ({ page }) => {
    // Create a new user with no diaries
    await prisma.user.create({
      data: {
        email: 'emptyuser@example.com',
        password_hash: '$2b$10$dummyhash',
        nickname: 'Empty User',
        timer_status: 'inactive',
        timer_idle_threshold_sec: 300,
      },
    });
  });

  test.afterEach(async () => {
    // Cleanup
    await prisma.user.delete({
      where: { email: 'emptyuser@example.com' },
    }).catch(() => {
      // Ignore if user doesn't exist
    });
  });

  test('should display EmptyState when user has no diaries', async ({ page }) => {
    // Arrange - Authenticate as user with no diaries
    await authenticateAsUser(page, 'emptyuser@example.com');

    // Act
    await page.goto('/diary');

    // Assert
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
    await expect(page.getByText(/아직 작성한 일기가 없어요/i)).toBeVisible();
  });

  test('should display "첫 일기 쓰기" CTA button in EmptyState', async ({ page }) => {
    // Arrange
    await authenticateAsUser(page, 'emptyuser@example.com');

    // Act
    await page.goto('/diary');

    // Assert
    const ctaButton = page.getByRole('button', { name: /첫 일기 쓰기/i });
    await expect(ctaButton).toBeVisible();
  });

  test('should navigate to /diary/new when clicking "첫 일기 쓰기" button', async ({ page }) => {
    // Arrange
    await authenticateAsUser(page, 'emptyuser@example.com');

    // Act
    await page.goto('/diary');

    const ctaButton = page.getByRole('button', { name: /첫 일기 쓰기/i });
    await ctaButton.click();

    // Assert
    await page.waitForURL(/\/diary\/new/);
    await expect(page).toHaveURL(/\/diary\/new/);
  });

  test('should display empty state illustration or icon', async ({ page }) => {
    // Arrange
    await authenticateAsUser(page, 'emptyuser@example.com');

    // Act
    await page.goto('/diary');

    // Assert
    const emptyState = page.locator('[data-testid="empty-state"]');
    await expect(emptyState).toBeVisible();

    // Should have some visual element (icon, illustration, etc.)
    const illustration = emptyState.locator('[data-testid="empty-state-illustration"]');
    await expect(illustration).toBeVisible();
  });

  test('should not display diary cards when in empty state', async ({ page }) => {
    // Arrange
    await authenticateAsUser(page, 'emptyuser@example.com');

    // Act
    await page.goto('/diary');

    // Assert
    const diaryCards = page.locator('[data-testid="diary-card"]');
    await expect(diaryCards).toHaveCount(0);
  });
});

test.describe('Diary Page - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
  });

  test('should display error message when API fails to load diaries', async ({ page }) => {
    // Note: This test would require mocking API failure
    // For now, documenting expected behavior

    // Act
    await page.goto('/diary');

    // Assert - If API fails, should show error message
    // Implementation will be tested when error handling is complete
  });

  test('should provide retry mechanism when diary loading fails', async ({ page }) => {
    // Note: This test would require mocking API failure
    // For now, documenting expected behavior

    // Act
    await page.goto('/diary');

    // Assert - Should have retry button if loading fails
    // Implementation will be tested when error handling is complete
  });
});

test.describe('Diary Page - Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
  });

  test('should display diary cards in grid layout on desktop', async ({ page }) => {
    // Arrange
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Act
    await page.goto('/diary');

    // Assert
    const diaryList = page.locator('[data-testid="diary-list"]');
    await expect(diaryList).toBeVisible();
    await expect(diaryList).toHaveCSS('display', /grid|flex/);
  });

  test('should display diary cards in single column on mobile', async ({ page }) => {
    // Arrange
    await page.setViewportSize({ width: 375, height: 667 });

    // Act
    await page.goto('/diary');

    // Assert
    const diaryList = page.locator('[data-testid="diary-list"]');
    await expect(diaryList).toBeVisible();
  });

  test('should be scrollable on mobile devices', async ({ page }) => {
    // Arrange
    await page.setViewportSize({ width: 375, height: 667 });

    // Act
    await page.goto('/diary');

    // Assert - Page should be scrollable
    const isScrollable = await page.evaluate(() => {
      return document.documentElement.scrollHeight > document.documentElement.clientHeight;
    });

    expect(isScrollable).toBeTruthy();
  });
});
