import { test, expect } from '@playwright/test';
import { authenticateAsTestUser, authenticateAsUser, generateAuthToken } from '../helpers/auth';
import { prisma } from '../helpers/db-cleanup';

test.describe('Diary Delete - Success Flow', () => {
  let diaryId: string;
  const testContent = '삭제 테스트용 일기 내용입니다. 이 일기는 삭제될 예정입니다.';

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
        content: testContent,
      },
    });

    diaryId = diary.diary_id;

    await authenticateAsTestUser(page);
  });

  test('should open DeleteConfirmModal when clicking delete button on detail page', async ({ page }) => {
    // Act
    await page.goto(`/diary/${diaryId}`);

    const deleteButton = page.getByRole('button', { name: /삭제/i });
    await deleteButton.click();

    // Assert - DeleteConfirmModal (바텀시트) should be visible
    const modal = page.getByRole('dialog', { name: '일기 삭제 확인' });
    await expect(modal).toBeVisible();
  });

  test('should navigate to /diary and remove deleted diary from list after confirming delete', async ({ page }) => {
    // Act
    await page.goto(`/diary/${diaryId}`);

    const deleteButton = page.getByRole('button', { name: /삭제/i });
    await deleteButton.click();

    const modal = page.getByRole('dialog', { name: '일기 삭제 확인' });
    await expect(modal).toBeVisible();

    const confirmDeleteButton = modal.getByRole('button', { name: '삭제' });
    await confirmDeleteButton.click();

    // Assert - Should navigate to diary list page
    await page.waitForURL(/\/diary$/);
    await expect(page).toHaveURL(/\/diary$/);

    // Assert - Deleted diary should not appear in the list
    const diaryCards = page.locator('[data-testid="diary-card"]');
    const diaryCardTexts = await diaryCards.allTextContents();
    const isDeletedDiaryPresent = diaryCardTexts.some((text) =>
      text.includes(testContent)
    );
    expect(isDeletedDiaryPresent).toBe(false);
  });
});

test.describe('Diary Delete - Cancel Flow', () => {
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
        content: '취소 테스트용 일기 내용입니다.',
      },
    });

    diaryId = diary.diary_id;

    await authenticateAsTestUser(page);
  });

  test('should close modal and stay on detail page when clicking cancel in DeleteConfirmModal', async ({ page }) => {
    // Arrange
    await page.goto(`/diary/${diaryId}`);

    const deleteButton = page.getByRole('button', { name: /삭제/i });
    await deleteButton.click();

    const modal = page.getByRole('dialog', { name: '일기 삭제 확인' });
    await expect(modal).toBeVisible();

    // Act
    const cancelButton = modal.getByRole('button', { name: '취소' });
    await cancelButton.click();

    // Assert - Modal should be hidden
    await expect(modal).not.toBeVisible();

    // Assert - Should remain on the detail page
    await expect(page).toHaveURL(new RegExp(`/diary/${diaryId}$`));
  });
});

test.describe('Diary Delete - Authorization', () => {
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
        content: '이 일기는 다른 사용자의 일기입니다. 삭제할 수 없어야 합니다.',
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

  test('should return 403 or 404 when attempting to delete another user\'s diary via API', async ({ request }) => {
    // Arrange - Generate auth token for test user (not the owner of the diary)
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!testUser) {
      throw new Error('Test user not found. Please run database seed.');
    }

    const token = await generateAuthToken({
      user_id: testUser.user_id,
      email: testUser.email,
      nickname: testUser.nickname,
    });

    // Act - Attempt to DELETE another user's diary via API directly
    const response = await request.delete(`/api/diary/${otherUserDiaryId}`, {
      headers: {
        Cookie: `auth-token=${token}`,
      },
    });

    // Assert - Should return 403 Forbidden or 404 Not Found
    expect([403, 404]).toContain(response.status());
  });
});
