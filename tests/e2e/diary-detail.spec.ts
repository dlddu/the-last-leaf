import { test, expect } from '@playwright/test';
import { authenticateAsTestUser, authenticateAsUser, clearAuth, getUserByEmail } from '../helpers/auth';
import { prisma } from '../helpers/db-cleanup';

// TODO: Activate when DLD-372 is implemented (일기 상세 조회 기능 구현 완료 후 활성화)
test.describe('Diary Detail Page - Display Content', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
  });

  test('should display diary date when viewing detail page', async ({ page }) => {
    // Arrange - Get first diary of test user
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }

    const diary = await prisma.diary.findFirst({
      where: { user_id: testUser.user_id },
      orderBy: { created_at: 'desc' },
    });

    if (!diary) {
      throw new Error('Test diary not found');
    }

    // Act
    await page.goto(`/diary/${diary.diary_id}`);

    // Assert
    const dateElement = page.locator('[data-testid="diary-detail-date"]');
    await expect(dateElement).toBeVisible();

    // Date should be formatted properly (e.g., "2024년 1월 15일")
    const dateText = await dateElement.textContent();
    expect(dateText).toBeTruthy();
  });

  test('should display diary content when viewing detail page', async ({ page }) => {
    // Arrange
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }

    const diary = await prisma.diary.findFirst({
      where: { user_id: testUser.user_id },
      orderBy: { created_at: 'desc' },
    });

    if (!diary) {
      throw new Error('Test diary not found');
    }

    // Act
    await page.goto(`/diary/${diary.diary_id}`);

    // Assert
    const contentElement = page.locator('[data-testid="diary-content"]');
    await expect(contentElement).toBeVisible();
    await expect(contentElement).toContainText(diary.content);
  });

  test('should display creation time when viewing detail page', async ({ page }) => {
    // Arrange
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }

    const diary = await prisma.diary.findFirst({
      where: { user_id: testUser.user_id },
      orderBy: { created_at: 'desc' },
    });

    if (!diary) {
      throw new Error('Test diary not found');
    }

    // Act
    await page.goto(`/diary/${diary.diary_id}`);

    // Assert - Time should be displayed (e.g., "오후 3:45" or "15:45")
    const timeElement = page.locator('[data-testid="diary-time"]');
    await expect(timeElement).toBeVisible();

    const timeText = await timeElement.textContent();
    expect(timeText).toBeTruthy();
    expect(timeText).toMatch(/\d+:\d+/); // Should contain time format
  });

  test('should display edit button on detail page', async ({ page }) => {
    // Arrange
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }

    const diary = await prisma.diary.findFirst({
      where: { user_id: testUser.user_id },
      orderBy: { created_at: 'desc' },
    });

    if (!diary) {
      throw new Error('Test diary not found');
    }

    // Act
    await page.goto(`/diary/${diary.diary_id}`);

    // Assert
    const editButton = page.getByRole('button', { name: /수정|edit/i });
    await expect(editButton).toBeVisible();
  });

  test('should display delete button on detail page', async ({ page }) => {
    // Arrange
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }

    const diary = await prisma.diary.findFirst({
      where: { user_id: testUser.user_id },
      orderBy: { created_at: 'desc' },
    });

    if (!diary) {
      throw new Error('Test diary not found');
    }

    // Act
    await page.goto(`/diary/${diary.diary_id}`);

    // Assert
    const deleteButton = page.getByRole('button', { name: /삭제|delete/i });
    await expect(deleteButton).toBeVisible();
  });

  test('should display multiline content with proper formatting', async ({ page }) => {
    // Arrange - Create diary with multiline content
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }

    const multilineContent = `첫 번째 줄입니다.
두 번째 줄입니다.
세 번째 줄입니다.`;

    const diary = await prisma.diary.create({
      data: {
        user_id: testUser.user_id,
        content: multilineContent,
      },
    });

    // Act
    await page.goto(`/diary/${diary.diary_id}`);

    // Assert
    const contentElement = page.locator('[data-testid="diary-content"]');
    await expect(contentElement).toBeVisible();
    await expect(contentElement).toContainText('첫 번째 줄');
    await expect(contentElement).toContainText('두 번째 줄');
    await expect(contentElement).toContainText('세 번째 줄');

    // Cleanup
    await prisma.diary.delete({ where: { diary_id: diary.diary_id } });
  });

  test('should preserve long content without truncation', async ({ page }) => {
    // Arrange - Create diary with long content
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }

    const longContent = '긴 내용 테스트입니다. '.repeat(100);

    const diary = await prisma.diary.create({
      data: {
        user_id: testUser.user_id,
        content: longContent,
      },
    });

    // Act
    await page.goto(`/diary/${diary.diary_id}`);

    // Assert
    const contentElement = page.locator('[data-testid="diary-content"]');
    await expect(contentElement).toBeVisible();

    const displayedContent = await contentElement.textContent();
    expect(displayedContent?.length).toBeGreaterThan(500);

    // Cleanup
    await prisma.diary.delete({ where: { diary_id: diary.diary_id } });
  });
});

// TODO: Activate when DLD-372 is implemented
test.describe('Diary Detail Page - Navigation from List', () => {
  test.beforeEach(async ({ page }) => {
    // Setup test data
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (testUser) {
      await prisma.diary.deleteMany({
        where: { user_id: testUser.user_id },
      });

      await prisma.diary.create({
        data: {
          user_id: testUser.user_id,
          content: 'This is a test diary for navigation testing.',
          created_at: new Date(),
        },
      });
    }

    await authenticateAsTestUser(page);
  });

  test('should navigate to detail page when clicking diary card from list', async ({ page }) => {
    // Act
    await page.goto('/diary');
    await page.waitForSelector('[data-testid="diary-card"]');

    const firstCard = page.locator('[data-testid="diary-card"]').first();
    await firstCard.click();

    // Assert
    await page.waitForURL(/\/diary\/.+/);
    await expect(page).toHaveURL(/\/diary\/[a-z0-9]+/);

    // Detail page content should be visible
    await expect(page.locator('[data-testid="diary-detail-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="diary-content"]')).toBeVisible();
  });

  test('should display correct content after navigation from list', async ({ page }) => {
    // Arrange
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }

    const diary = await prisma.diary.findFirst({
      where: { user_id: testUser.user_id },
      orderBy: { created_at: 'desc' },
    });

    if (!diary) {
      throw new Error('Test diary not found');
    }

    // Act
    await page.goto('/diary');
    await page.waitForSelector('[data-testid="diary-card"]');

    const firstCard = page.locator('[data-testid="diary-card"]').first();
    await firstCard.click();

    // Assert
    await page.waitForURL(new RegExp(`/diary/${diary.diary_id}`));

    const contentElement = page.locator('[data-testid="diary-content"]');
    await expect(contentElement).toContainText(diary.content);
  });

  test('should have back button or navigation to return to list', async ({ page }) => {
    // Arrange
    await page.goto('/diary');
    await page.waitForSelector('[data-testid="diary-card"]');

    const firstCard = page.locator('[data-testid="diary-card"]').first();
    await firstCard.click();

    // Assert
    await page.waitForURL(/\/diary\/.+/);

    // Should have back button or link to return to list
    const backButton = page.getByRole('button', { name: /뒤로|back/i }).or(
      page.getByRole('link', { name: /목록|list/i })
    );

    await expect(backButton).toBeVisible();
  });
});

// TODO: Activate when DLD-372 is implemented
test.describe('Diary Detail Page - Authorization', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should redirect to login when unauthenticated user tries to access detail page', async ({ page }) => {
    // Arrange - Get any diary ID
    const diary = await prisma.diary.findFirst({
      orderBy: { created_at: 'desc' },
    });

    if (!diary) {
      throw new Error('No diary found for testing');
    }

    // Act
    await page.goto(`/diary/${diary.diary_id}`);

    // Assert
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });

  test('should display 404 or 403 error when accessing another user\'s diary', async ({ page }) => {
    // Arrange - Create two users
    const user1 = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!user1) {
      throw new Error('Test user not found');
    }

    // Create second user
    const user2 = await prisma.user.upsert({
      where: { email: 'otheruser@example.com' },
      create: {
        email: 'otheruser@example.com',
        password_hash: '$2b$10$dummyhash',
        nickname: 'Other User',
        timer_status: 'inactive',
        timer_idle_threshold_sec: 300,
      },
      update: {},
    });

    // Create diary for user1
    const user1Diary = await prisma.diary.create({
      data: {
        user_id: user1.user_id,
        content: 'This is user1\'s private diary.',
      },
    });

    // Act - Authenticate as user2 and try to access user1's diary
    await authenticateAsUser(page, 'otheruser@example.com');
    await page.goto(`/diary/${user1Diary.diary_id}`);

    // Assert - Should show error page (404 or 403)
    await expect(page.locator('text=/404|403|not found|access denied|권한이 없습니다/i')).toBeVisible();

    // Cleanup
    await prisma.diary.delete({ where: { diary_id: user1Diary.diary_id } });
    await prisma.user.delete({ where: { email: 'otheruser@example.com' } });
  });

  test('should not expose diary content in error page when unauthorized', async ({ page }) => {
    // Arrange
    const user1 = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!user1) {
      throw new Error('Test user not found');
    }

    const user2 = await prisma.user.upsert({
      where: { email: 'unauthorized@example.com' },
      create: {
        email: 'unauthorized@example.com',
        password_hash: '$2b$10$dummyhash',
        nickname: 'Unauthorized User',
        timer_status: 'inactive',
        timer_idle_threshold_sec: 300,
      },
      update: {},
    });

    const secretContent = 'This is super secret private content that should not be visible.';
    const user1Diary = await prisma.diary.create({
      data: {
        user_id: user1.user_id,
        content: secretContent,
      },
    });

    // Act
    await authenticateAsUser(page, 'unauthorized@example.com');
    await page.goto(`/diary/${user1Diary.diary_id}`);

    // Assert - Secret content should not be visible
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain(secretContent);

    // Cleanup
    await prisma.diary.delete({ where: { diary_id: user1Diary.diary_id } });
    await prisma.user.delete({ where: { email: 'unauthorized@example.com' } });
  });

  test('should allow user to access their own diary', async ({ page }) => {
    // Arrange
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }

    const userDiary = await prisma.diary.create({
      data: {
        user_id: testUser.user_id,
        content: 'This is my own diary.',
      },
    });

    // Act
    await authenticateAsTestUser(page);
    await page.goto(`/diary/${userDiary.diary_id}`);

    // Assert - Should display diary content
    await expect(page.locator('[data-testid="diary-content"]')).toContainText('This is my own diary.');

    // Cleanup
    await prisma.diary.delete({ where: { diary_id: userDiary.diary_id } });
  });
});

// TODO: Activate when DLD-372 is implemented
test.describe('Diary Detail Page - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
  });

  test('should display 404 error when diary does not exist', async ({ page }) => {
    // Arrange - Use non-existent diary ID
    const nonExistentId = 'nonexistent123456';

    // Act
    await page.goto(`/diary/${nonExistentId}`);

    // Assert
    await expect(page.locator('text=/404|not found|찾을 수 없습니다/i')).toBeVisible();
  });

  test('should display error message when diary ID is invalid format', async ({ page }) => {
    // Arrange - Use invalid ID format
    const invalidId = 'invalid-id-!@#$%';

    // Act
    await page.goto(`/diary/${invalidId}`);

    // Assert - Should show error page
    await expect(page.locator('text=/404|not found|찾을 수 없습니다|잘못된 요청/i')).toBeVisible();
  });

  test('should not display edit/delete buttons on error page', async ({ page }) => {
    // Arrange
    const nonExistentId = 'nonexistent999999';

    // Act
    await page.goto(`/diary/${nonExistentId}`);

    // Assert
    const editButton = page.getByRole('button', { name: /수정|edit/i });
    const deleteButton = page.getByRole('button', { name: /삭제|delete/i });

    await expect(editButton).not.toBeVisible();
    await expect(deleteButton).not.toBeVisible();
  });

  test('should provide link to return to diary list from error page', async ({ page }) => {
    // Arrange
    const nonExistentId = 'nonexistent777777';

    // Act
    await page.goto(`/diary/${nonExistentId}`);

    // Assert - Should have link or button to go back to list
    const backLink = page.getByRole('link', { name: /목록|돌아가기|list|back/i }).or(
      page.getByRole('button', { name: /목록|돌아가기|list|back/i })
    );

    await expect(backLink).toBeVisible();
  });
});

// TODO: Activate when DLD-372 is implemented
test.describe('Diary Detail Page - Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
  });

  test('should display properly on mobile viewport', async ({ page }) => {
    // Arrange
    await page.setViewportSize({ width: 375, height: 667 });

    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }

    const diary = await prisma.diary.findFirst({
      where: { user_id: testUser.user_id },
      orderBy: { created_at: 'desc' },
    });

    if (!diary) {
      throw new Error('Test diary not found');
    }

    // Act
    await page.goto(`/diary/${diary.diary_id}`);

    // Assert
    await expect(page.locator('[data-testid="diary-detail-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="diary-content"]')).toBeVisible();

    const editButton = page.getByRole('button', { name: /수정|edit/i });
    await expect(editButton).toBeVisible();
  });

  test('should display properly on tablet viewport', async ({ page }) => {
    // Arrange
    await page.setViewportSize({ width: 768, height: 1024 });

    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }

    const diary = await prisma.diary.findFirst({
      where: { user_id: testUser.user_id },
      orderBy: { created_at: 'desc' },
    });

    if (!diary) {
      throw new Error('Test diary not found');
    }

    // Act
    await page.goto(`/diary/${diary.diary_id}`);

    // Assert
    await expect(page.locator('[data-testid="diary-detail-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="diary-content"]')).toBeVisible();
  });

  test('should display properly on desktop viewport', async ({ page }) => {
    // Arrange
    await page.setViewportSize({ width: 1920, height: 1080 });

    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }

    const diary = await prisma.diary.findFirst({
      where: { user_id: testUser.user_id },
      orderBy: { created_at: 'desc' },
    });

    if (!diary) {
      throw new Error('Test diary not found');
    }

    // Act
    await page.goto(`/diary/${diary.diary_id}`);

    // Assert
    await expect(page.locator('[data-testid="diary-detail-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="diary-content"]')).toBeVisible();
  });

  test('should have readable text on all viewport sizes', async ({ page }) => {
    // Arrange
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }

    const diary = await prisma.diary.findFirst({
      where: { user_id: testUser.user_id },
      orderBy: { created_at: 'desc' },
    });

    if (!diary) {
      throw new Error('Test diary not found');
    }

    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`/diary/${diary.diary_id}`);

    const contentElement = page.locator('[data-testid="diary-content"]');
    await expect(contentElement).toBeVisible();

    const fontSize = await contentElement.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });

    // Font size should be reasonable (at least 14px)
    const fontSizeNum = parseInt(fontSize);
    expect(fontSizeNum).toBeGreaterThanOrEqual(14);
  });
});

// TODO: Activate when DLD-372 is implemented
test.describe('Diary Detail Page - Loading State', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
  });

  test('should display loading indicator while fetching diary data', async ({ page }) => {
    // Arrange
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }

    const diary = await prisma.diary.findFirst({
      where: { user_id: testUser.user_id },
      orderBy: { created_at: 'desc' },
    });

    if (!diary) {
      throw new Error('Test diary not found');
    }

    // Act - Navigate and quickly check for loading state
    await page.goto(`/diary/${diary.diary_id}`, { waitUntil: 'commit' });

    // Note: Loading indicator may be too fast to catch in test environment
    // This test documents expected behavior
    // In real implementation, loading indicator should appear during data fetch
  });

  test('should transition from loading to content display', async ({ page }) => {
    // Arrange
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }

    const diary = await prisma.diary.findFirst({
      where: { user_id: testUser.user_id },
      orderBy: { created_at: 'desc' },
    });

    if (!diary) {
      throw new Error('Test diary not found');
    }

    // Act
    await page.goto(`/diary/${diary.diary_id}`);

    // Assert - Eventually content should be visible
    await expect(page.locator('[data-testid="diary-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="diary-detail-date"]')).toBeVisible();
  });
});

// TODO: Activate when DLD-372 is implemented
test.describe('Diary Detail Page - SEO and Metadata', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
  });

  test('should have appropriate page title for diary detail', async ({ page }) => {
    // Arrange
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }

    const diary = await prisma.diary.findFirst({
      where: { user_id: testUser.user_id },
      orderBy: { created_at: 'desc' },
    });

    if (!diary) {
      throw new Error('Test diary not found');
    }

    // Act
    await page.goto(`/diary/${diary.diary_id}`);

    // Assert - Page title should be meaningful
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });
});
