import { test, expect } from '@playwright/test';
import { authenticateAsTestUser, authenticateAsUser, clearAuth } from '../helpers/auth';
import { prisma } from '../helpers/db-cleanup';

test.describe('Diary Detail Page - Navigation from List', () => {
  let diaryId: string;

  test.beforeEach(async ({ page }) => {
    // Arrange - Reset test user's diaries and create a known diary
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!testUser) {
      throw new Error('Test user not found. Please run database seed.');
    }

    await prisma.diary.deleteMany({
      where: { user_id: testUser.user_id },
    });

    const diary = await prisma.diary.create({
      data: {
        user_id: testUser.user_id,
        content: '목록에서 클릭하여 이동하는 테스트 일기입니다.',
      },
    });

    diaryId = diary.diary_id;

    await authenticateAsTestUser(page);
  });

  test('should navigate to /diary/:id when clicking diary card from list', async ({ page }) => {
    // Act
    await page.goto('/diary');
    await page.waitForSelector('[data-testid="diary-card"]');

    const firstDiaryCard = page.locator('[data-testid="diary-card"]').first();
    await firstDiaryCard.click();

    // Assert
    await page.waitForURL(/\/diary\/.+/);
    await expect(page).toHaveURL(new RegExp(`/diary/${diaryId}`));
  });

  test('should land on correct detail page URL after clicking diary card', async ({ page }) => {
    // Act
    await page.goto('/diary');
    await page.waitForSelector('[data-testid="diary-card"]');

    const firstDiaryCard = page.locator('[data-testid="diary-card"]').first();
    await firstDiaryCard.click();

    // Assert - URL should contain the diary ID
    await page.waitForURL(/\/diary\/[a-z0-9-]+/);
    await expect(page).toHaveURL(/\/diary\/[a-z0-9-]+/);
  });
});

test.describe('Diary Detail Page - Content Display', () => {
  let diaryId: string;
  const testContent = '오늘은 정말 맑은 날이었다. 공원을 산책하며 생각을 정리했다.';

  test.beforeEach(async ({ page }) => {
    // Arrange - Create a diary with known content and timestamp
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!testUser) {
      throw new Error('Test user not found. Please run database seed.');
    }

    await prisma.diary.deleteMany({
      where: { user_id: testUser.user_id },
    });

    const diary = await prisma.diary.create({
      data: {
        user_id: testUser.user_id,
        content: testContent,
      },
    });

    diaryId = diary.diary_id;

    await authenticateAsTestUser(page);
  });

  test('should display diary date on detail page', async ({ page }) => {
    // Act
    await page.goto(`/diary/${diaryId}`);

    // Assert
    const dateElement = page.locator('[data-testid="diary-detail-date"]');
    await expect(dateElement).toBeVisible();

    // Should contain the current year
    const currentYear = new Date().getFullYear().toString();
    await expect(dateElement).toContainText(currentYear);
  });

  test('should display diary written time on detail page', async ({ page }) => {
    // Act
    await page.goto(`/diary/${diaryId}`);

    // Assert - diary-detail-date contains both date and time
    const dateElement = page.locator('[data-testid="diary-detail-date"]');
    await expect(dateElement).toBeVisible();

    // Should contain time format (HH:MM pattern)
    await expect(dateElement).toContainText(/\d{1,2}:\d{2}/);
  });

  test('should display diary body text on detail page', async ({ page }) => {
    // Act
    await page.goto(`/diary/${diaryId}`);

    // Assert
    const contentElement = page.locator('[data-testid="diary-content"]');
    await expect(contentElement).toBeVisible();
    await expect(contentElement).toContainText(testContent);
  });

  test('should display edit button on detail page', async ({ page }) => {
    // Act
    await page.goto(`/diary/${diaryId}`);

    // Assert
    const editButton = page.getByRole('button', { name: /수정|edit/i });
    await expect(editButton).toBeVisible();
  });

  test('should display delete button on detail page', async ({ page }) => {
    // Act
    await page.goto(`/diary/${diaryId}`);

    // Assert
    const deleteButton = page.getByRole('button', { name: /삭제|delete/i });
    await expect(deleteButton).toBeVisible();
  });
});

test.describe('Diary Detail Page - Authorization', () => {
  let otherUserDiaryId: string;

  test.beforeEach(async () => {
    // Arrange - Create another user and their diary
    const otherUser = await prisma.user.upsert({
      where: { email: 'other@example.com' },
      update: {},
      create: {
        email: 'other@example.com',
        password_hash: '$2b$10$dummyhash',
        nickname: 'Other User',
        timer_status: 'inactive',
        timer_idle_threshold_sec: 300,
      },
    });

    await prisma.diary.deleteMany({
      where: { user_id: otherUser.user_id },
    });

    const otherDiary = await prisma.diary.create({
      data: {
        user_id: otherUser.user_id,
        content: '이 일기는 다른 사용자의 일기입니다.',
      },
    });

    otherUserDiaryId = otherDiary.diary_id;
  });

  test.afterEach(async () => {
    // Cleanup other user
    const otherUser = await prisma.user.findUnique({
      where: { email: 'other@example.com' },
    });

    if (otherUser) {
      await prisma.diary.deleteMany({
        where: { user_id: otherUser.user_id },
      });
      await prisma.user.delete({
        where: { user_id: otherUser.user_id },
      }).catch(() => {
        // Ignore if already deleted
      });
    }
  });

  test('should return 404 when accessing another user\'s diary by ID', async ({ page }) => {
    // Arrange - Authenticate as test user (not the owner of the diary)
    await authenticateAsTestUser(page);

    // Act
    await page.goto(`/diary/${otherUserDiaryId}`);

    // Assert - Should show 404 or 403 error page
    const status = await page.evaluate(() => {
      // Check for Next.js not-found page indicators
      return document.title;
    });

    // Either URL changes to error page or page shows 404/403 content
    const is404Page =
      (await page.locator('text=404').isVisible()) ||
      (await page.locator('text=403').isVisible()) ||
      (await page.locator('text=/찾을 수 없|not found/i').isVisible());

    expect(is404Page).toBeTruthy();
  });

  test('should not display diary content when accessing another user\'s diary', async ({ page }) => {
    // Arrange
    await authenticateAsTestUser(page);

    // Act
    await page.goto(`/diary/${otherUserDiaryId}`);

    // Assert - Diary content should not be visible
    const contentElement = page.locator('[data-testid="diary-content"]');
    await expect(contentElement).not.toBeVisible();
  });
});

test.describe('Diary Detail Page - Not Found', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
  });

  test('should return 404 when accessing non-existent diary ID', async ({ page }) => {
    // Arrange - Use a UUID that does not exist in the database
    const nonExistentDiaryId = 'non-existent-diary-id-00000000';

    // Act
    await page.goto(`/diary/${nonExistentDiaryId}`);

    // Assert - Should show 404 error page
    const is404Page =
      (await page.locator('text=404').isVisible()) ||
      (await page.locator('text=/찾을 수 없|not found/i').isVisible());

    expect(is404Page).toBeTruthy();
  });

  test('should not render diary detail UI elements when diary does not exist', async ({ page }) => {
    // Arrange
    const nonExistentDiaryId = 'non-existent-diary-id-00000000';

    // Act
    await page.goto(`/diary/${nonExistentDiaryId}`);

    // Assert - Detail page elements should not be visible
    await expect(page.locator('[data-testid="diary-detail-date"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="diary-content"]')).not.toBeVisible();
  });
});

test.describe('Diary Detail Page - Authentication Guard', () => {
  test('should redirect unauthenticated user to /login when accessing /diary/:id', async ({ page }) => {
    // Arrange - Clear all auth cookies
    await clearAuth(page);

    // Act
    await page.goto('/diary/some-diary-id');

    // Assert
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });
});
