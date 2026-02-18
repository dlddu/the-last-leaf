// Activated: DLD-383 — /settings/preferences page implemented.
import { test, expect } from '@playwright/test';
import { authenticateAsTestUser, clearAuth } from '../helpers/auth';
import { prisma } from '../helpers/db-cleanup';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getTestUserId(): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' },
  });
  if (!user) {
    throw new Error('Test user not found. Please run database seed.');
  }
  return user.user_id;
}

async function resetTestUserPreferences(userId: string): Promise<void> {
  await prisma.user.update({
    where: { user_id: userId },
    data: {
      timer_status: 'inactive',
      timer_idle_threshold_sec: 300,
    },
  });
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

test.describe('Settings Preferences - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    const userId = await getTestUserId();
    await resetTestUserPreferences(userId);
    await authenticateAsTestUser(page);
    await page.goto('/settings');
  });

  test('should navigate to /settings/preferences when clicking "타이머 일시 중지" menu item', async ({ page }) => {
    // Act
    await page.getByText(/타이머 일시 중지/i).click();

    // Assert
    await page.waitForURL(/\/settings\/preferences/);
    await expect(page).toHaveURL(/\/settings\/preferences/);
  });

  test('should display preferences page heading after navigation', async ({ page }) => {
    // Act
    await page.getByText(/타이머 일시 중지/i).click();
    await page.waitForURL(/\/settings\/preferences/);

    // Assert
    await expect(page.getByRole('heading', { name: /환경설정|preferences|타이머/i })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Timer Toggle — OFF to ON
// ---------------------------------------------------------------------------

test.describe('Settings Preferences - Timer Toggle OFF to ON', () => {
  test.beforeEach(async ({ page }) => {
    // Arrange — ensure timer is in inactive state before each test
    const userId = await getTestUserId();
    await resetTestUserPreferences(userId);
    await authenticateAsTestUser(page);
    await page.goto('/settings/preferences');
  });

  test('should show warning banner when timer toggle is switched from OFF to ON', async ({ page }) => {
    // Arrange
    const toggle = page.locator('[data-testid="timer-pause-toggle"]');
    await expect(toggle).toBeVisible();

    // Act
    await toggle.click();

    // Assert — warning banner must appear
    await expect(
      page.getByText(/타이머가 중지된 동안에는/i)
    ).toBeVisible();
  });

  test('should display the warning banner with correct message content when timer is paused', async ({ page }) => {
    // Arrange
    const toggle = page.locator('[data-testid="timer-pause-toggle"]');

    // Act
    await toggle.click();

    // Assert — banner element is visible
    const banner = page.locator('[data-testid="timer-pause-warning-banner"]');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText(/타이머가 중지된 동안에는/i);
  });

  test('should reflect toggle as checked/on state after clicking', async ({ page }) => {
    // Arrange
    const toggle = page.locator('[data-testid="timer-pause-toggle"]');

    // Act
    await toggle.click();

    // Assert — toggle reports checked state
    await expect(toggle).toBeChecked();
  });
});

// ---------------------------------------------------------------------------
// Timer Toggle — ON to OFF
// ---------------------------------------------------------------------------

test.describe('Settings Preferences - Timer Toggle ON to OFF', () => {
  test.beforeEach(async ({ page }) => {
    // Arrange — seed timer as paused so the toggle starts in ON state
    const userId = await getTestUserId();
    await prisma.user.update({
      where: { user_id: userId },
      data: { timer_status: 'paused' },
    });
    await authenticateAsTestUser(page);
    await page.goto('/settings/preferences');
  });

  test('should hide warning banner when timer toggle is switched from ON to OFF', async ({ page }) => {
    // Arrange — banner should be visible initially (timer is paused)
    const banner = page.locator('[data-testid="timer-pause-warning-banner"]');
    await expect(banner).toBeVisible();
    const toggle = page.locator('[data-testid="timer-pause-toggle"]');

    // Act — switch OFF
    await toggle.click();

    // Assert — banner disappears
    await expect(banner).not.toBeVisible();
  });

  test('should reflect toggle as unchecked/off state after clicking OFF', async ({ page }) => {
    // Arrange
    const toggle = page.locator('[data-testid="timer-pause-toggle"]');
    await expect(toggle).toBeChecked();

    // Act
    await toggle.click();

    // Assert
    await expect(toggle).not.toBeChecked();
  });
});

// ---------------------------------------------------------------------------
// Timer Toggle — Persistence after reload
// ---------------------------------------------------------------------------

test.describe('Settings Preferences - Timer Toggle Persistence', () => {
  test.beforeEach(async ({ page }) => {
    const userId = await getTestUserId();
    await resetTestUserPreferences(userId);
    await authenticateAsTestUser(page);
    await page.goto('/settings/preferences');
  });

  test('should persist timer toggle ON state after page reload', async ({ page }) => {
    // Arrange
    const toggle = page.locator('[data-testid="timer-pause-toggle"]');
    await toggle.click();
    await expect(toggle).toBeChecked();

    // Act
    await page.reload();

    // Assert — toggle stays ON after reload
    await expect(page.locator('[data-testid="timer-pause-toggle"]')).toBeChecked();
    await expect(page.getByText(/타이머가 중지된 동안에는/i)).toBeVisible();
  });

  test('should persist timer toggle OFF state after page reload', async ({ page }) => {
    // Arrange — turn ON then turn OFF
    const toggle = page.locator('[data-testid="timer-pause-toggle"]');
    await toggle.click();
    await expect(toggle).toBeChecked();
    await toggle.click();
    await expect(toggle).not.toBeChecked();

    // Act
    await page.reload();

    // Assert — toggle stays OFF after reload
    await expect(page.locator('[data-testid="timer-pause-toggle"]')).not.toBeChecked();
    await expect(page.locator('[data-testid="timer-pause-warning-banner"]')).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Idle Period Selection
// ---------------------------------------------------------------------------

test.describe('Settings Preferences - Idle Period Selection', () => {
  test.beforeEach(async ({ page }) => {
    const userId = await getTestUserId();
    await resetTestUserPreferences(userId);
    await authenticateAsTestUser(page);
    await page.goto('/settings/preferences');
  });

  test('should show "30일" button as selected when clicked', async ({ page }) => {
    // Act
    await page.locator('[data-testid="idle-period-30"]').click();

    // Assert
    await expect(page.locator('[data-testid="idle-period-30"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('should show "60일" button as selected when clicked', async ({ page }) => {
    // Act
    await page.locator('[data-testid="idle-period-60"]').click();

    // Assert
    await expect(page.locator('[data-testid="idle-period-60"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('should show "90일" button as selected when clicked', async ({ page }) => {
    // Act
    await page.locator('[data-testid="idle-period-90"]').click();

    // Assert
    await expect(page.locator('[data-testid="idle-period-90"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('should show "180일" button as selected when clicked', async ({ page }) => {
    // Act
    await page.locator('[data-testid="idle-period-180"]').click();

    // Assert
    await expect(page.locator('[data-testid="idle-period-180"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('should deselect previously selected period when a new period is clicked', async ({ page }) => {
    // Arrange — select 30일 first
    await page.locator('[data-testid="idle-period-30"]').click();
    await expect(page.locator('[data-testid="idle-period-30"]')).toHaveAttribute('aria-pressed', 'true');

    // Act — select 90일
    await page.locator('[data-testid="idle-period-90"]').click();

    // Assert — 90일 selected, 30일 deselected
    await expect(page.locator('[data-testid="idle-period-90"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-testid="idle-period-30"]')).toHaveAttribute('aria-pressed', 'false');
  });

  test('should persist selected idle period after page reload', async ({ page }) => {
    // Arrange
    await page.locator('[data-testid="idle-period-60"]').click();
    await expect(page.locator('[data-testid="idle-period-60"]')).toHaveAttribute('aria-pressed', 'true');

    // Act
    await page.reload();

    // Assert — 60일 remains selected after reload
    await expect(page.locator('[data-testid="idle-period-60"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('should persist 180일 idle period selection after page reload', async ({ page }) => {
    // Arrange
    await page.locator('[data-testid="idle-period-180"]').click();
    await expect(page.locator('[data-testid="idle-period-180"]')).toHaveAttribute('aria-pressed', 'true');

    // Act
    await page.reload();

    // Assert
    await expect(page.locator('[data-testid="idle-period-180"]')).toHaveAttribute('aria-pressed', 'true');
  });
});

// ---------------------------------------------------------------------------
// API Reflection
// ---------------------------------------------------------------------------

test.describe('Settings Preferences - API Reflection', () => {
  test.beforeEach(async ({ page }) => {
    const userId = await getTestUserId();
    await resetTestUserPreferences(userId);
    await authenticateAsTestUser(page);
    await page.goto('/settings/preferences');
  });

  test('should return timer_status "paused" from GET /api/user/preferences after enabling toggle', async ({ page }) => {
    // Arrange
    const toggle = page.locator('[data-testid="timer-pause-toggle"]');

    // Act
    await toggle.click();
    await expect(toggle).toBeChecked();

    // Assert — API reflects updated timer_status
    const response = await page.request.get('/api/user/preferences');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.timer_status).toBe('paused');
  });

  test('should return timer_status "inactive" from GET /api/user/preferences after disabling toggle', async ({ page }) => {
    // Arrange — seed paused state, then turn off via UI
    const userId = await getTestUserId();
    await prisma.user.update({
      where: { user_id: userId },
      data: { timer_status: 'paused' },
    });
    await page.reload();
    const toggle = page.locator('[data-testid="timer-pause-toggle"]');
    await expect(toggle).toBeChecked();

    // Act
    await toggle.click();
    await expect(toggle).not.toBeChecked();

    // Assert — API reflects updated timer_status
    const response = await page.request.get('/api/user/preferences');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.timer_status).toBe('inactive');
  });

  test('should return updated timer_idle_threshold_sec from GET /api/user/preferences after selecting 30일', async ({ page }) => {
    // Act
    await page.locator('[data-testid="idle-period-30"]').click();

    // Assert — 30일 = 30 * 24 * 60 * 60 = 2592000 seconds
    const response = await page.request.get('/api/user/preferences');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.timer_idle_threshold_sec).toBe(2592000);
  });

  test('should return updated timer_idle_threshold_sec from GET /api/user/preferences after selecting 60일', async ({ page }) => {
    // Act
    await page.locator('[data-testid="idle-period-60"]').click();

    // Assert — 60일 = 60 * 24 * 60 * 60 = 5184000 seconds
    const response = await page.request.get('/api/user/preferences');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.timer_idle_threshold_sec).toBe(5184000);
  });

  test('should return updated timer_idle_threshold_sec from GET /api/user/preferences after selecting 90일', async ({ page }) => {
    // Act
    await page.locator('[data-testid="idle-period-90"]').click();

    // Assert — 90일 = 90 * 24 * 60 * 60 = 7776000 seconds
    const response = await page.request.get('/api/user/preferences');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.timer_idle_threshold_sec).toBe(7776000);
  });

  test('should return updated timer_idle_threshold_sec from GET /api/user/preferences after selecting 180일', async ({ page }) => {
    // Act
    await page.locator('[data-testid="idle-period-180"]').click();

    // Assert — 180일 = 180 * 24 * 60 * 60 = 15552000 seconds
    const response = await page.request.get('/api/user/preferences');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.timer_idle_threshold_sec).toBe(15552000);
  });

  test('should reflect both timer_status and timer_idle_threshold_sec in a single GET /api/user/preferences call', async ({ page }) => {
    // Arrange
    const toggle = page.locator('[data-testid="timer-pause-toggle"]');

    // Act — enable toggle and select 90일
    await toggle.click();
    await expect(toggle).toBeChecked();
    await page.locator('[data-testid="idle-period-90"]').click();

    // Assert — both fields are updated in one response
    const response = await page.request.get('/api/user/preferences');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.timer_status).toBe('paused');
    expect(body.timer_idle_threshold_sec).toBe(7776000);
  });
});

// ---------------------------------------------------------------------------
// Authentication Guard
// ---------------------------------------------------------------------------

test.describe('Settings Preferences - Authentication Guard', () => {
  test('should redirect to /login when unauthenticated user accesses /settings/preferences', async ({ page }) => {
    // Arrange
    await clearAuth(page);

    // Act
    await page.goto('/settings/preferences');

    // Assert
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });
});
