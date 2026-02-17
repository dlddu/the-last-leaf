import { test, expect } from '@playwright/test';
import { authenticateAsTestUser, authenticateAsUser } from '../helpers/auth';
import { prisma } from '../helpers/db-cleanup';

// TODO: Activate when DLD-374 is implemented (일기 수정 기능 구현 완료 후 skip 제거)
test.describe('Diary Edit Page - Navigation from Detail', () => {
  let diaryId: string;

  test.beforeEach(async ({ page }) => {
    // Arrange - Create a known diary for the test user
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
        content: '수정 테스트용 일기 원본 내용입니다.',
      },
    });

    diaryId = diary.diary_id;

    await authenticateAsTestUser(page);
  });

  test('should navigate to /diary/:id/edit when clicking edit button on detail page', async ({ page }) => {
    // Act
    await page.goto(`/diary/${diaryId}`);
    await page.waitForSelector('[data-testid="diary-content"]');

    const editButton = page.getByRole('button', { name: /수정|edit/i });
    await editButton.click();

    // Assert
    await page.waitForURL(new RegExp(`/diary/${diaryId}/edit`));
    await expect(page).toHaveURL(new RegExp(`/diary/${diaryId}/edit`));
  });

  test('should reach edit page directly via URL /diary/:id/edit', async ({ page }) => {
    // Act
    await page.goto(`/diary/${diaryId}/edit`);

    // Assert
    await page.waitForURL(new RegExp(`/diary/${diaryId}/edit`));
    await expect(page).toHaveURL(new RegExp(`/diary/${diaryId}/edit`));
  });
});

// TODO: Activate when DLD-374 is implemented (일기 수정 기능 구현 완료 후 skip 제거)
test.describe('Diary Edit Page - Form Display', () => {
  let diaryId: string;
  const originalContent = '수정 전 원본 일기 내용입니다. 이 내용이 pre-fill 되어야 합니다.';

  test.beforeEach(async ({ page }) => {
    // Arrange - Create a diary with known content
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
    await page.goto(`/diary/${diaryId}/edit`);
  });

  test('should pre-fill textarea with existing diary content', async ({ page }) => {
    // Assert
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    await expect(contentTextarea).toBeVisible();
    await expect(contentTextarea).toHaveValue(originalContent);
  });

  test('should display character count matching existing content length', async ({ page }) => {
    // Assert
    const charCount = page.locator('[data-testid="char-count"]');
    await expect(charCount).toBeVisible();
    await expect(charCount).toContainText(originalContent.length.toString());
  });

  test('should display diary date on edit page', async ({ page }) => {
    // Assert
    const dateDisplay = page.locator('[data-testid="diary-date"]');
    await expect(dateDisplay).toBeVisible();
    await expect(dateDisplay).toContainText(new Date().getFullYear().toString());
  });

  test('should display save button', async ({ page }) => {
    // Assert
    const saveButton = page.getByRole('button', { name: /저장|save/i });
    await expect(saveButton).toBeVisible();
  });

  test('should display back or cancel button', async ({ page }) => {
    // Assert
    const backButton = page.getByRole('button', { name: /취소|뒤로|cancel|back/i });
    await expect(backButton).toBeVisible();
  });
});

// TODO: Activate when DLD-374 is implemented (일기 수정 기능 구현 완료 후 skip 제거)
test.describe('Diary Edit Page - Save Success Flow', () => {
  let diaryId: string;
  const originalContent = '저장 성공 테스트 원본 내용입니다.';

  test.beforeEach(async ({ page }) => {
    // Arrange - Create a diary for editing
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
    await page.goto(`/diary/${diaryId}/edit`);
  });

  test('should navigate to /diary/:id after clicking save button', async ({ page }) => {
    // Arrange
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    const updatedContent = '수정된 일기 내용입니다. 저장 후 상세 페이지로 이동해야 합니다.';

    // Act
    await contentTextarea.fill(updatedContent);
    const saveButton = page.getByRole('button', { name: /저장|save/i });
    await saveButton.click();

    // Assert - Should navigate to detail page
    await page.waitForURL(new RegExp(`/diary/${diaryId}$`));
    await expect(page).toHaveURL(new RegExp(`/diary/${diaryId}$`));
  });

  test('should display updated content on detail page after saving', async ({ page }) => {
    // Arrange
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    const updatedContent = '수정 완료된 최종 내용입니다. 상세 페이지에서 확인 가능해야 합니다.';

    // Act
    await contentTextarea.fill(updatedContent);
    await page.getByRole('button', { name: /저장|save/i }).click();

    // Assert - Wait for navigation and verify updated content is shown
    await page.waitForURL(new RegExp(`/diary/${diaryId}$`));
    const contentElement = page.locator('[data-testid="diary-content"]');
    await expect(contentElement).toContainText(updatedContent);
  });

  test('should show save-status indicator reflecting save state', async ({ page }) => {
    // Arrange
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');

    // Act - Modify content
    await contentTextarea.fill('저장 상태 표시 테스트');

    // Assert - Save status should update (e.g., '저장되지 않음' or '저장 중...' or '저장됨')
    const saveStatus = page.locator('[data-testid="save-status"]');
    await expect(saveStatus).toBeVisible();
  });

  test('should disable save button while saving', async ({ page }) => {
    // Arrange
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    await contentTextarea.fill('저장 중 비활성화 테스트');

    // Act
    const saveButton = page.getByRole('button', { name: /저장|save/i });
    await saveButton.click();

    // Assert - Button should be disabled during save
    await expect(saveButton).toBeDisabled();
  });
});

// TODO: Activate when DLD-374 is implemented (일기 수정 기능 구현 완료 후 skip 제거)
test.describe('Diary Edit Page - Cancel Without Changes', () => {
  let diaryId: string;

  test.beforeEach(async ({ page }) => {
    // Arrange - Create a diary
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
        content: '변경 없이 뒤로가기 테스트용 원본 내용입니다.',
      },
    });

    diaryId = diary.diary_id;

    await authenticateAsTestUser(page);
    await page.goto(`/diary/${diaryId}/edit`);
  });

  test('should navigate directly to /diary/:id without modal when clicking back without changes', async ({ page }) => {
    // Act - Click back button without modifying content
    const backButton = page.getByRole('button', { name: /취소|뒤로|cancel|back/i });
    await backButton.click();

    // Assert - Should navigate directly without showing confirmation modal
    await page.waitForURL(new RegExp(`/diary/${diaryId}$`));
    await expect(page).toHaveURL(new RegExp(`/diary/${diaryId}$`));

    // Confirm modal should NOT appear
    const modal = page.getByRole('dialog', { name: '저장하지 않고 나가기 확인' });
    await expect(modal).not.toBeVisible();
  });
});

// TODO: Activate when DLD-374 is implemented (일기 수정 기능 구현 완료 후 skip 제거)
test.describe('Diary Edit Page - Unsaved Changes Warning (ConfirmLeaveModal)', () => {
  let diaryId: string;
  const originalContent = '모달 테스트용 원본 일기 내용입니다.';

  test.beforeEach(async ({ page }) => {
    // Arrange - Create a diary
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
    await page.goto(`/diary/${diaryId}/edit`);
  });

  test('should show ConfirmLeaveModal when clicking back button after modifying content', async ({ page }) => {
    // Arrange
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    await contentTextarea.fill('수정된 내용 - 저장 안 함');

    // Act
    const backButton = page.getByRole('button', { name: /취소|뒤로|cancel|back/i });
    await backButton.click();

    // Assert - ConfirmLeaveModal should appear
    const modal = page.getByRole('dialog', { name: '저장하지 않고 나가기 확인' });
    await expect(modal).toBeVisible();
  });

  test('should display "나가기" and "취소" buttons in ConfirmLeaveModal', async ({ page }) => {
    // Arrange
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    await contentTextarea.fill('모달 버튼 확인 테스트');

    // Act
    const backButton = page.getByRole('button', { name: /취소|뒤로|cancel|back/i });
    await backButton.click();

    // Assert
    const modal = page.getByRole('dialog', { name: '저장하지 않고 나가기 확인' });
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('button', { name: '나가기' })).toBeVisible();
    await expect(modal.getByRole('button', { name: '취소' })).toBeVisible();
  });

  test('should navigate to /diary/:id without saving when clicking "나가기" in modal', async ({ page }) => {
    // Arrange
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    const modifiedContent = '저장하지 않고 나가기 테스트 - 이 내용은 반영되지 않아야 합니다.';
    await contentTextarea.fill(modifiedContent);

    // Act
    const backButton = page.getByRole('button', { name: /취소|뒤로|cancel|back/i });
    await backButton.click();

    const modal = page.getByRole('dialog', { name: '저장하지 않고 나가기 확인' });
    await modal.getByRole('button', { name: '나가기' }).click();

    // Assert - Should navigate to detail page
    await page.waitForURL(new RegExp(`/diary/${diaryId}$`));
    await expect(page).toHaveURL(new RegExp(`/diary/${diaryId}$`));

    // Assert - Original content should still be shown (modification not saved)
    const contentElement = page.locator('[data-testid="diary-content"]');
    await expect(contentElement).toContainText(originalContent);
    await expect(contentElement).not.toContainText(modifiedContent);
  });

  test('should stay on edit page when clicking "취소" in ConfirmLeaveModal', async ({ page }) => {
    // Arrange
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    const modifiedContent = '계속 수정 테스트 - 취소 클릭 후 유지되어야 합니다.';
    await contentTextarea.fill(modifiedContent);

    // Act
    const backButton = page.getByRole('button', { name: /취소|뒤로|cancel|back/i });
    await backButton.click();

    const modal = page.getByRole('dialog', { name: '저장하지 않고 나가기 확인' });
    await modal.getByRole('button', { name: '취소' }).click();

    // Assert - Should remain on edit page
    await expect(page).toHaveURL(new RegExp(`/diary/${diaryId}/edit`));

    // Assert - Modified content should be preserved in textarea
    await expect(contentTextarea).toHaveValue(modifiedContent);
  });

  test('should preserve modified content after dismissing ConfirmLeaveModal via "취소"', async ({ page }) => {
    // Arrange
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    const modifiedContent = '내용 보존 확인 테스트입니다. 모달 취소 후에도 유지되어야 합니다.';
    await contentTextarea.fill(modifiedContent);

    // Act - Trigger modal then dismiss
    const backButton = page.getByRole('button', { name: /취소|뒤로|cancel|back/i });
    await backButton.click();

    const modal = page.getByRole('dialog', { name: '저장하지 않고 나가기 확인' });
    await modal.getByRole('button', { name: '취소' }).click();

    // Assert - Content in textarea should remain unchanged
    await expect(contentTextarea).toHaveValue(modifiedContent);
  });
});

// TODO: Activate when DLD-374 is implemented (일기 수정 기능 구현 완료 후 skip 제거)
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
    // Cleanup other user's data
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

  test('should return 404 or 403 when accessing edit page for another user\'s diary', async ({ page }) => {
    // Arrange - Authenticate as test user (not the diary owner)
    await authenticateAsTestUser(page);

    // Act
    await page.goto(`/diary/${otherUserDiaryId}/edit`);

    // Assert - Should show 404 or 403 error
    const isErrorPage =
      (await page.locator('text=404').isVisible()) ||
      (await page.locator('text=403').isVisible()) ||
      (await page.locator('text=/찾을 수 없|not found/i').isVisible());

    expect(isErrorPage).toBeTruthy();
  });

  test('should not display edit form when accessing another user\'s diary edit page', async ({ page }) => {
    // Arrange
    await authenticateAsTestUser(page);

    // Act
    await page.goto(`/diary/${otherUserDiaryId}/edit`);

    // Assert - Edit form elements should not be visible
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    await expect(contentTextarea).not.toBeVisible();
  });
});

// TODO: Activate when DLD-374 is implemented (일기 수정 기능 구현 완료 후 skip 제거)
test.describe('Diary Edit Page - Authentication Guard', () => {
  test('should redirect unauthenticated user to /login when accessing /diary/:id/edit', async ({ page }) => {
    // Arrange - Clear auth cookies
    await page.context().clearCookies();

    // Act
    await page.goto('/diary/some-diary-id/edit');

    // Assert
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });
});
