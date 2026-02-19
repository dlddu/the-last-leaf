import { test, expect } from '@playwright/test';
import { authenticateAsTestUser } from '../helpers/auth';
import { prisma } from '../helpers/db-cleanup';

test.describe('Diary Edit Page - Success Flow', () => {
  let diaryId: string;
  const originalContent = '수정 전 원본 내용입니다. 오늘은 맑은 날이었다.';

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
        content: originalContent,
      },
    });

    diaryId = diary.diary_id;

    await authenticateAsTestUser(page);
  });

  test('should navigate to /diary/:id/edit when clicking edit button on detail page', async ({ page }) => {
    // Act
    await page.goto(`/diary/${diaryId}`);

    const editButton = page.getByRole('button', { name: /수정|edit/i });
    await editButton.click();

    // Assert
    await page.waitForURL(new RegExp(`/diary/${diaryId}/edit`));
    await expect(page).toHaveURL(new RegExp(`/diary/${diaryId}/edit`));
  });

  test('should pre-fill textarea with existing diary content on edit page', async ({ page }) => {
    // Act
    await page.goto(`/diary/${diaryId}/edit`);

    // Assert
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    await expect(contentTextarea).toBeVisible();
    await expect(contentTextarea).toHaveValue(originalContent);
  });

  test('should save updated content and navigate to /diary/:id after clicking save', async ({ page }) => {
    // Arrange
    const updatedContent = '수정된 내용입니다. 오늘은 흐린 날이었다.';

    // Act
    await page.goto(`/diary/${diaryId}/edit`);

    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    await contentTextarea.fill(updatedContent);

    const saveButton = page.getByRole('button', { name: /저장|save/i });
    await saveButton.click();

    // Assert - Should navigate back to detail page
    await page.waitForURL(new RegExp(`/diary/${diaryId}$`));
    await expect(page).toHaveURL(new RegExp(`/diary/${diaryId}$`));
  });

  test('should reflect updated content on detail page after saving', async ({ page }) => {
    // Arrange
    const updatedContent = '저장 후 반영될 수정 내용입니다.';

    // Act
    await page.goto(`/diary/${diaryId}/edit`);

    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    await contentTextarea.fill(updatedContent);

    await page.getByRole('button', { name: /저장|save/i }).click();

    // Assert - Detail page should show updated content
    await page.waitForURL(new RegExp(`/diary/${diaryId}$`));
    const contentElement = page.locator('[data-testid="diary-content"]');
    await expect(contentElement).toContainText(updatedContent);
  });
});

test.describe('Diary Edit Page - Cancel and Back Navigation', () => {
  let diaryId: string;
  const originalContent = '뒤로가기 테스트용 원본 내용입니다.';

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
        content: originalContent,
      },
    });

    diaryId = diary.diary_id;

    await authenticateAsTestUser(page);
  });

  test('should navigate directly to /diary/:id without modal when going back with no changes', async ({ page }) => {
    // Act - Visit detail page first so router.back() has somewhere to go
    await page.goto(`/diary/${diaryId}`);
    await page.waitForLoadState('networkidle');
    await page.goto(`/diary/${diaryId}/edit`);

    // Go back without making any changes
    const backButton = page.getByRole('button', { name: /뒤로|back|취소|cancel/i });
    await backButton.click();

    // Assert - Should navigate directly without showing modal
    await page.waitForURL(new RegExp(`/diary/${diaryId}$`));
    await expect(page).toHaveURL(new RegExp(`/diary/${diaryId}$`));

    // ConfirmLeaveModal should NOT be visible
    const modal = page.getByRole('dialog', { name: '저장하지 않고 나가기 확인' });
    await expect(modal).not.toBeVisible();
  });

  test('should show ConfirmLeaveModal when going back after making changes', async ({ page }) => {
    // Arrange
    await page.goto(`/diary/${diaryId}/edit`);

    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    await contentTextarea.fill('수정 중인 내용 - 저장 안 함');

    // Act
    const backButton = page.getByRole('button', { name: /뒤로|back|취소|cancel/i });
    await backButton.click();

    // Assert - ConfirmLeaveModal should appear
    const modal = page.getByRole('dialog', { name: '저장하지 않고 나가기 확인' });
    await expect(modal).toBeVisible();
    await expect(page.getByText('저장하지 않고 나갈까요?')).toBeVisible();
  });

  test('should navigate to /diary/:id without saving when clicking "나가기" in ConfirmLeaveModal', async ({ page }) => {
    // Arrange - Visit detail page first so router.back() has somewhere to go
    await page.goto(`/diary/${diaryId}`);
    await page.waitForLoadState('networkidle');
    await page.goto(`/diary/${diaryId}/edit`);

    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    await contentTextarea.fill('저장되지 않을 수정 내용');

    // Act - Trigger modal and click "나가기"
    const backButton = page.getByRole('button', { name: /뒤로|back|취소|cancel/i });
    await backButton.click();

    const modal = page.getByRole('dialog', { name: '저장하지 않고 나가기 확인' });
    await expect(modal).toBeVisible();

    const leaveButton = modal.getByRole('button', { name: '나가기' });
    await leaveButton.click();

    // Assert - Should navigate to detail page without saving changes
    await page.waitForURL(new RegExp(`/diary/${diaryId}$`));
    await expect(page).toHaveURL(new RegExp(`/diary/${diaryId}$`));

    // Assert - Original content should still be shown (changes not saved)
    const contentElement = page.locator('[data-testid="diary-content"]');
    await expect(contentElement).toContainText(originalContent);
  });

  test('should stay on edit page and preserve unsaved changes when clicking "취소" in ConfirmLeaveModal', async ({ page }) => {
    // Arrange
    const unsavedContent = '계속 수정할 내용입니다.';
    await page.goto(`/diary/${diaryId}/edit`);

    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    await contentTextarea.fill(unsavedContent);

    // Act - Trigger modal and click "취소"
    const backButton = page.getByRole('button', { name: /뒤로|back|취소|cancel/i });
    await backButton.click();

    const modal = page.getByRole('dialog', { name: '저장하지 않고 나가기 확인' });
    await expect(modal).toBeVisible();

    const cancelButton = modal.getByRole('button', { name: '취소' });
    await cancelButton.click();

    // Assert - Should remain on edit page
    await expect(page).toHaveURL(new RegExp(`/diary/${diaryId}/edit`));

    // Assert - Unsaved content should be preserved
    await expect(contentTextarea).toHaveValue(unsavedContent);
  });
});

test.describe('Diary Edit Page - Authorization', () => {
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
        content: '이 일기는 다른 사용자의 일기입니다. 수정할 수 없어야 합니다.',
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

  test('should return 403 or 404 when attempting to edit another user\'s diary', async ({ page }) => {
    // Arrange - Authenticate as test user (not the owner of the diary)
    await authenticateAsTestUser(page);

    // Act
    await page.goto(`/diary/${otherUserDiaryId}/edit`);

    // Assert - Should show 403 or 404 error page
    const isErrorPage =
      (await page.locator('text=403').isVisible()) ||
      (await page.locator('text=404').isVisible()) ||
      (await page.locator('text=/찾을 수 없|not found|forbidden|권한/i').isVisible());

    expect(isErrorPage).toBeTruthy();
  });

  test('should not display edit form when accessing another user\'s diary edit page', async ({ page }) => {
    // Arrange
    await authenticateAsTestUser(page);

    // Act
    await page.goto(`/diary/${otherUserDiaryId}/edit`);

    // Assert - Edit form (textarea) should not be visible
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    await expect(contentTextarea).not.toBeVisible();
  });
});
