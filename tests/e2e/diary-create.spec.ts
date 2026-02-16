import { test, expect } from '@playwright/test';
import { authenticateAsTestUser } from '../helpers/auth';

// TODO: Activate when DLD-370 is implemented (일기 작성 기능 구현 완료 후 skip 제거)
test.describe.skip('Diary Create Page - FAB Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
  });

  test('should navigate to /diary/new when clicking FAB button', async ({ page }) => {
    // Arrange
    await page.goto('/diary');
    await page.waitForSelector('[data-testid="diary-list"]');

    // Act
    const fabButton = page.locator('[data-testid="fab-create-diary"]');
    await fabButton.click();

    // Assert
    await page.waitForURL(/\/diary\/new/);
    await expect(page).toHaveURL(/\/diary\/new/);
  });

  test('should display FAB button on diary list page', async ({ page }) => {
    // Act
    await page.goto('/diary');

    // Assert
    const fabButton = page.locator('[data-testid="fab-create-diary"]');
    await expect(fabButton).toBeVisible();
  });

  test('should display FAB with proper styling and position', async ({ page }) => {
    // Act
    await page.goto('/diary');

    // Assert
    const fabButton = page.locator('[data-testid="fab-create-diary"]');
    await expect(fabButton).toBeVisible();
    await expect(fabButton).toHaveCSS('position', 'fixed');
  });
});

// TODO: Activate when DLD-370 is implemented
test.describe.skip('Diary Create Page - Form Display', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
    await page.goto('/diary/new');
  });

  test('should display today\'s date automatically', async ({ page }) => {
    // Assert
    const dateDisplay = page.locator('[data-testid="diary-date"]');
    await expect(dateDisplay).toBeVisible();

    // Check if date is today's date
    const today = new Date();
    const expectedDate = today.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    await expect(dateDisplay).toContainText(new RegExp(today.getFullYear().toString()));
  });

  test('should display empty textarea for content input', async ({ page }) => {
    // Assert
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    await expect(contentTextarea).toBeVisible();
    await expect(contentTextarea).toHaveValue('');
  });

  test('should display character count at zero initially', async ({ page }) => {
    // Assert
    const charCount = page.locator('[data-testid="char-count"]');
    await expect(charCount).toBeVisible();
    await expect(charCount).toContainText('0');
  });

  test('should display save button', async ({ page }) => {
    // Assert
    const saveButton = page.getByRole('button', { name: /저장|save/i });
    await expect(saveButton).toBeVisible();
  });

  test('should display cancel or back button', async ({ page }) => {
    // Assert
    const cancelButton = page.getByRole('button', { name: /취소|뒤로|cancel|back/i });
    await expect(cancelButton).toBeVisible();
  });
});

// TODO: Activate when DLD-370 is implemented
test.describe.skip('Diary Create Page - Character Count', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
    await page.goto('/diary/new');
  });

  test('should update character count in real-time when typing', async ({ page }) => {
    // Arrange
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    const charCount = page.locator('[data-testid="char-count"]');

    // Act
    await contentTextarea.fill('안녕하세요');

    // Assert
    await expect(charCount).toContainText('5');
  });

  test('should show correct character count for multiline text', async ({ page }) => {
    // Arrange
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    const charCount = page.locator('[data-testid="char-count"]');

    // Act
    const multilineText = '첫 번째 줄\n두 번째 줄\n세 번째 줄';
    await contentTextarea.fill(multilineText);

    // Assert - Should count all characters including newlines
    await expect(charCount).toContainText(multilineText.length.toString());
  });

  test('should update character count when deleting text', async ({ page }) => {
    // Arrange
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    const charCount = page.locator('[data-testid="char-count"]');

    // Act - Type and then delete
    await contentTextarea.fill('Hello World');
    await expect(charCount).toContainText('11');

    await contentTextarea.fill('Hello');

    // Assert
    await expect(charCount).toContainText('5');
  });

  test('should show character count with visual styling', async ({ page }) => {
    // Assert
    const charCount = page.locator('[data-testid="char-count"]');
    await expect(charCount).toBeVisible();

    // Character count should be in a specific location (e.g., bottom of form)
    const boundingBox = await charCount.boundingBox();
    expect(boundingBox).not.toBeNull();
  });
});

// TODO: Activate when DLD-370 is implemented
test.describe.skip('Diary Create Page - Save Success Flow', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
    await page.goto('/diary/new');
  });

  test('should save diary and navigate to detail page when clicking save button', async ({ page }) => {
    // Arrange
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    const testContent = '오늘은 정말 좋은 날이었다. 새로운 것을 배우고 성장하는 느낌이 들어서 기분이 좋다.';

    // Act
    await contentTextarea.fill(testContent);

    const saveButton = page.getByRole('button', { name: /저장|save/i });
    await saveButton.click();

    // Assert - Should navigate to diary detail page
    await page.waitForURL(/\/diary\/[a-z0-9]+/);
    await expect(page).toHaveURL(/\/diary\/[a-z0-9]+/);
  });

  test('should display saved content on detail page after saving', async ({ page }) => {
    // Arrange
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    const testContent = '테스트 일기 내용입니다. 이 내용이 저장되어야 합니다.';

    // Act
    await contentTextarea.fill(testContent);
    await page.getByRole('button', { name: /저장|save/i }).click();

    // Assert - Wait for navigation and check content
    await page.waitForURL(/\/diary\/[a-z0-9]+/);
    await expect(page.locator('[data-testid="diary-content"]')).toContainText(testContent);
  });

  test('should display saved diary in diary list after creation', async ({ page }) => {
    // Arrange
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    const testContent = '목록에 표시될 일기 내용입니다.';

    // Act - Create diary
    await contentTextarea.fill(testContent);
    await page.getByRole('button', { name: /저장|save/i }).click();
    await page.waitForURL(/\/diary\/[a-z0-9]+/);

    // Navigate back to list
    await page.goto('/diary');

    // Assert - New diary should be in the list
    const firstDiaryCard = page.locator('[data-testid="diary-card"]').first();
    await expect(firstDiaryCard.locator('[data-testid="diary-preview"]')).toContainText(testContent);
  });

  test('should show loading state while saving diary', async ({ page }) => {
    // Arrange
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    await contentTextarea.fill('저장 중 로딩 테스트');

    // Act
    const saveButton = page.getByRole('button', { name: /저장|save/i });
    await saveButton.click();

    // Assert - Should show loading state (button disabled or loading text)
    await expect(saveButton).toBeDisabled();
  });
});

// TODO: Activate when DLD-370 is implemented
test.describe.skip('Diary Create Page - Validation Errors', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
    await page.goto('/diary/new');
  });

  test('should disable save button when content is empty', async ({ page }) => {
    // Assert
    const saveButton = page.getByRole('button', { name: /저장|save/i });
    await expect(saveButton).toBeDisabled();
  });

  test('should enable save button when content is entered', async ({ page }) => {
    // Arrange
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    const saveButton = page.getByRole('button', { name: /저장|save/i });

    // Act
    await contentTextarea.fill('최소 한 글자 이상');

    // Assert
    await expect(saveButton).toBeEnabled();
  });

  test('should show validation error when trying to save empty content', async ({ page }) => {
    // Arrange
    const saveButton = page.getByRole('button', { name: /저장|save/i });

    // Act - Try to click save button (should be disabled or show error)
    if (await saveButton.isEnabled()) {
      await saveButton.click();

      // Assert - Should show error message
      await expect(page.getByText(/내용을 입력해주세요|content is required/i)).toBeVisible();
    } else {
      // Assert - Button should be disabled
      await expect(saveButton).toBeDisabled();
    }
  });

  test('should not navigate away when save fails due to empty content', async ({ page }) => {
    // Arrange
    const saveButton = page.getByRole('button', { name: /저장|save/i });

    // Act - Try to save with empty content (if button is enabled)
    if (await saveButton.isEnabled()) {
      await saveButton.click();
      await page.waitForTimeout(500);

      // Assert - Should stay on create page
      await expect(page).toHaveURL(/\/diary\/new/);
    }
  });
});

// TODO: Activate when DLD-370 is implemented
test.describe.skip('Diary Create Page - Unsaved Changes Warning', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
    await page.goto('/diary/new');
  });

  test('should show confirmation modal when clicking back button with unsaved content', async ({ page }) => {
    // Arrange
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    await contentTextarea.fill('저장하지 않은 내용');

    // Act
    const backButton = page.getByRole('button', { name: /취소|뒤로|cancel|back/i });
    await backButton.click();

    // Assert - Confirmation modal should appear
    await expect(page.getByText(/저장하지 않고 나갈까요|leave without saving/i)).toBeVisible();
  });

  test('should display "나가기" and "취소" buttons in confirmation modal', async ({ page }) => {
    // Arrange
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    await contentTextarea.fill('모달 테스트 내용');

    // Act
    const backButton = page.getByRole('button', { name: /취소|뒤로|cancel|back/i });
    await backButton.click();

    // Assert
    await expect(page.getByRole('button', { name: /나가기|leave/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /취소|cancel|계속 작성/i })).toBeVisible();
  });

  test('should navigate to /diary when clicking "나가기" in confirmation modal', async ({ page }) => {
    // Arrange
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    await contentTextarea.fill('나가기 테스트');

    // Act
    const backButton = page.getByRole('button', { name: /취소|뒤로|cancel|back/i });
    await backButton.click();

    const leaveButton = page.getByRole('button', { name: /나가기|leave/i });
    await leaveButton.click();

    // Assert
    await page.waitForURL(/\/diary$/);
    await expect(page).toHaveURL(/\/diary$/);
  });

  test('should stay on create page when clicking "취소" in confirmation modal', async ({ page }) => {
    // Arrange
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    const testContent = '계속 작성 테스트';
    await contentTextarea.fill(testContent);

    // Act
    const backButton = page.getByRole('button', { name: /취소|뒤로|cancel|back/i });
    await backButton.click();

    const cancelButton = page.getByRole('button', { name: /취소|cancel|계속 작성/i });
    await cancelButton.click();

    // Assert - Should stay on create page
    await expect(page).toHaveURL(/\/diary\/new/);

    // Content should be preserved
    await expect(contentTextarea).toHaveValue(testContent);
  });

  test('should not show confirmation modal when content is empty', async ({ page }) => {
    // Act - Click back button with empty content
    const backButton = page.getByRole('button', { name: /취소|뒤로|cancel|back/i });
    await backButton.click();

    // Assert - Should navigate directly without modal
    await page.waitForURL(/\/diary$/);
    await expect(page).toHaveURL(/\/diary$/);
  });

  test('should preserve content after dismissing confirmation modal', async ({ page }) => {
    // Arrange
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    const testContent = '내용 보존 테스트입니다. 이 내용은 모달을 닫아도 유지되어야 합니다.';
    await contentTextarea.fill(testContent);

    // Act
    const backButton = page.getByRole('button', { name: /취소|뒤로|cancel|back/i });
    await backButton.click();

    // Dismiss modal
    const cancelButton = page.getByRole('button', { name: /취소|cancel|계속 작성/i });
    await cancelButton.click();

    // Assert - Content should still be there
    await expect(contentTextarea).toHaveValue(testContent);
  });
});

// TODO: Activate when DLD-370 is implemented
test.describe.skip('Diary Create Page - Authentication Guard', () => {
  test('should redirect to /login when unauthenticated user tries to access /diary/new', async ({ page }) => {
    // Arrange - Clear auth cookies
    await page.context().clearCookies();

    // Act
    await page.goto('/diary/new');

    // Assert
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });
});

// TODO: Activate when DLD-370 is implemented
test.describe.skip('Diary Create Page - Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
  });

  test('should display properly on mobile viewport', async ({ page }) => {
    // Arrange
    await page.setViewportSize({ width: 375, height: 667 });

    // Act
    await page.goto('/diary/new');

    // Assert
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    await expect(contentTextarea).toBeVisible();

    const saveButton = page.getByRole('button', { name: /저장|save/i });
    await expect(saveButton).toBeVisible();
  });

  test('should display properly on tablet viewport', async ({ page }) => {
    // Arrange
    await page.setViewportSize({ width: 768, height: 1024 });

    // Act
    await page.goto('/diary/new');

    // Assert
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    await expect(contentTextarea).toBeVisible();

    const saveButton = page.getByRole('button', { name: /저장|save/i });
    await expect(saveButton).toBeVisible();
  });

  test('should display properly on desktop viewport', async ({ page }) => {
    // Arrange
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Act
    await page.goto('/diary/new');

    // Assert
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    await expect(contentTextarea).toBeVisible();

    const saveButton = page.getByRole('button', { name: /저장|save/i });
    await expect(saveButton).toBeVisible();
  });
});

// TODO: Activate when DLD-370 is implemented
test.describe.skip('Diary Create Page - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
    await page.goto('/diary/new');
  });

  test('should display error message when save API fails', async ({ page }) => {
    // Note: This test would require mocking API failure
    // For now, documenting expected behavior

    // Arrange
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    await contentTextarea.fill('API 실패 테스트');

    // Act - Save (would need to mock 500 error)
    const saveButton = page.getByRole('button', { name: /저장|save/i });
    // await page.route('/api/diary', route => route.abort());
    // await saveButton.click();

    // Assert - Should show error message
    // await expect(page.getByText(/저장에 실패했습니다|failed to save/i)).toBeVisible();
  });

  test('should allow retry when save fails', async ({ page }) => {
    // Note: This test would require mocking API failure and recovery
    // For now, documenting expected behavior

    // Arrange
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    await contentTextarea.fill('재시도 테스트');

    // Act - First attempt fails, second succeeds
    // Mock failure then success

    // Assert - Should eventually save successfully
    // await expect(page).toHaveURL(/\/diary\/[a-z0-9]+/);
  });

  test('should preserve content when save fails', async ({ page }) => {
    // Note: This test would require mocking API failure
    // For now, documenting expected behavior

    // Arrange
    const contentTextarea = page.locator('[data-testid="diary-content-input"]');
    const testContent = '내용 보존 테스트 (실패 시)';
    await contentTextarea.fill(testContent);

    // Act - Save fails
    // await page.route('/api/diary', route => route.abort());
    // await page.getByRole('button', { name: /저장|save/i }).click();

    // Assert - Content should still be there
    // await expect(contentTextarea).toHaveValue(testContent);
  });
});
