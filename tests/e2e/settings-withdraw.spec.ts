// DLD-385: E2E tests for /settings/withdraw — activated after implementation (DLD-384)
import { test, expect } from '@playwright/test';
import { authenticateAsTestUser, clearAuth, generateAuthToken } from '../helpers/auth';
import { prisma, cleanupUserByEmail } from '../helpers/db-cleanup';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const WITHDRAW_USER_EMAIL = 'withdraw-test@example.com';
const WITHDRAW_USER_PASSWORD = 'password123';

async function getTestUserId(): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' },
  });
  if (!user) {
    throw new Error('Test user not found. Please run database seed.');
  }
  return user.user_id;
}

/**
 * 탈퇴 전용 임시 유저를 DB에 직접 생성합니다.
 * 탈퇴 실행 테스트에서는 시드 유저(test@example.com)를 탈퇴시키면
 * 다른 테스트에 영향을 주기 때문에 별도 유저를 사용합니다.
 */
async function createWithdrawTestUser(): Promise<string> {
  await cleanupUserByEmail(WITHDRAW_USER_EMAIL);

  const bcrypt = await import('bcrypt');
  const passwordHash = await bcrypt.hash(WITHDRAW_USER_PASSWORD, 10);

  const user = await prisma.user.create({
    data: {
      email: WITHDRAW_USER_EMAIL,
      password_hash: passwordHash,
      nickname: 'WithdrawTestUser',
      timer_status: 'inactive',
      timer_idle_threshold_sec: 300,
    },
  });

  return user.user_id;
}

/**
 * 탈퇴 전용 유저로 인증 쿠키를 설정하고 seed 데이터를 반환합니다.
 */
async function setupWithdrawUserSession(page: import('@playwright/test').Page): Promise<{
  userId: string;
  diaryId: string;
}> {
  const userId = await createWithdrawTestUser();

  // 일기 1건 생성 (cascade 삭제 검증용)
  const diary = await prisma.diary.create({
    data: {
      user_id: userId,
      content: '탈퇴 테스트용 일기입니다. cascade 삭제 검증에 사용됩니다.',
    },
  });

  const token = await generateAuthToken({
    user_id: userId,
    email: WITHDRAW_USER_EMAIL,
    nickname: 'WithdrawTestUser',
  });

  const baseURL = process.env.BASE_URL || 'http://localhost:3000';
  const url = new URL(baseURL);

  await page.context().addCookies([
    {
      name: 'auth-token',
      value: token,
      domain: url.hostname,
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      expires: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    },
  ]);

  return { userId, diaryId: diary.diary_id };
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

test.describe('Settings Withdraw - Navigation', () => {

  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
    await page.goto('/settings');
  });

  test('should navigate to /settings/withdraw when clicking "계정 탈퇴" menu item', async ({ page }) => {
    // Act
    await page.getByText('계정 탈퇴').click();

    // Assert
    await page.waitForURL(/\/settings\/withdraw/);
    await expect(page).toHaveURL(/\/settings\/withdraw/);
  });

  test('should display withdraw page heading after navigation', async ({ page }) => {
    // Act
    await page.getByText('계정 탈퇴').click();
    await page.waitForURL(/\/settings\/withdraw/);

    // Assert
    await expect(page.getByRole('heading', { name: /계정 탈퇴/i, level: 1 })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Deletion Items List
// ---------------------------------------------------------------------------

test.describe('Settings Withdraw - Deletion Items List', () => {

  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
    await page.goto('/settings/withdraw');
  });

  test('should display the list of items that will be deleted on withdraw page', async ({ page }) => {
    // Assert — 삭제될 항목 4가지가 모두 표시되어야 한다
    const deletionList = page.locator('[data-testid="withdraw-deletion-list"]');
    await expect(deletionList.getByText(/일기/i)).toBeVisible();
    await expect(deletionList.getByText(/자서전/i)).toBeVisible();
    await expect(deletionList.getByText(/프로필/i)).toBeVisible();
    await expect(deletionList.getByText(/계정/i)).toBeVisible();
  });

  test('should display all four deletion item categories in a list', async ({ page }) => {
    // Assert — 삭제 항목 리스트 컨테이너가 존재하고 4개 항목을 포함해야 한다
    const deletionList = page.locator('[data-testid="withdraw-deletion-list"]');
    await expect(deletionList).toBeVisible();

    const items = deletionList.locator('[data-testid="withdraw-deletion-item"]');
    await expect(items).toHaveCount(4);
  });
});

// ---------------------------------------------------------------------------
// Consent Checkbox
// ---------------------------------------------------------------------------

test.describe('Settings Withdraw - Consent Checkbox', () => {

  test.beforeEach(async ({ page }) => {
    await authenticateAsTestUser(page);
    await page.goto('/settings/withdraw');
  });

  test('should have withdraw button disabled when consent checkbox is unchecked', async ({ page }) => {
    // Arrange — 페이지 진입 시 체크박스는 미체크 상태여야 한다
    const checkbox = page.locator('[data-testid="withdraw-consent-checkbox"]');
    await expect(checkbox).not.toBeChecked();

    // Assert — 탈퇴하기 버튼이 비활성화(disabled) 상태여야 한다
    const withdrawButton = page.getByRole('button', { name: /탈퇴하기/i });
    await expect(withdrawButton).toBeDisabled();
  });

  test('should enable withdraw button when consent checkbox is checked', async ({ page }) => {
    // Arrange
    const checkbox = page.locator('[data-testid="withdraw-consent-checkbox"]');
    const withdrawButton = page.getByRole('button', { name: /탈퇴하기/i });

    // Act
    await checkbox.check();

    // Assert — 버튼이 활성화되어야 한다
    await expect(checkbox).toBeChecked();
    await expect(withdrawButton).toBeEnabled();
  });

  test('should display withdraw button in red (active style) when consent checkbox is checked', async ({ page }) => {
    // Arrange
    const checkbox = page.locator('[data-testid="withdraw-consent-checkbox"]');
    const withdrawButton = page.getByRole('button', { name: /탈퇴하기/i });

    // Act
    await checkbox.check();

    // Assert — 버튼에 빨간색 활성 스타일 클래스가 적용되어야 한다
    await expect(withdrawButton).toHaveClass(/red|danger|destructive|withdraw-active/i);
  });

  test('should disable withdraw button again when consent checkbox is unchecked after being checked', async ({ page }) => {
    // Arrange
    const checkbox = page.locator('[data-testid="withdraw-consent-checkbox"]');
    const withdrawButton = page.getByRole('button', { name: /탈퇴하기/i });

    await checkbox.check();
    await expect(withdrawButton).toBeEnabled();

    // Act
    await checkbox.uncheck();

    // Assert — 다시 비활성화 상태로 돌아와야 한다
    await expect(withdrawButton).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// Withdraw Execution
// ---------------------------------------------------------------------------

test.describe('Settings Withdraw - Withdraw Execution', () => {

  test.afterEach(async () => {
    // 탈퇴 전용 유저가 남아 있다면 정리한다 (탈퇴 API가 이미 삭제했을 수 있으므로 catch 처리)
    await cleanupUserByEmail(WITHDRAW_USER_EMAIL).catch(() => {});
  });

  test('should redirect to /auth/login after completing account withdrawal', async ({ page }) => {
    // Arrange — 탈퇴 전용 유저로 세션 설정
    await setupWithdrawUserSession(page);
    await page.goto('/settings/withdraw');

    const checkbox = page.locator('[data-testid="withdraw-consent-checkbox"]');
    const withdrawButton = page.getByRole('button', { name: /탈퇴하기/i });

    // Act
    await checkbox.check();
    await withdrawButton.click();

    // Assert — 탈퇴 완료 후 /auth/login 으로 리다이렉트되어야 한다
    await page.waitForURL(/\/auth\/login|\/login/);
    await expect(page).toHaveURL(/\/auth\/login|\/login/);
  });

  test('should fail to login with the withdrawn user email after account withdrawal', async ({ page }) => {
    // Arrange — 탈퇴 전용 유저로 세션 설정 후 탈퇴 실행
    await setupWithdrawUserSession(page);
    await page.goto('/settings/withdraw');

    const checkbox = page.locator('[data-testid="withdraw-consent-checkbox"]');
    const withdrawButton = page.getByRole('button', { name: /탈퇴하기/i });

    await checkbox.check();
    await withdrawButton.click();
    await page.waitForURL(/\/auth\/login|\/login/);

    // Act — 탈퇴한 이메일로 로그인 시도
    await page.getByLabel(/이메일|email/i).fill(WITHDRAW_USER_EMAIL);
    await page.getByLabel(/비밀번호|password/i).fill(WITHDRAW_USER_PASSWORD);
    await page.getByRole('button', { name: /로그인|sign in|login/i }).click();

    // Assert — 로그인 실패 에러 메시지가 표시되어야 한다
    await expect(
      page.getByText(/존재하지 않는|탈퇴|없는 계정|이메일 또는 비밀번호|로그인 실패|invalid/i)
    ).toBeVisible();

    // Assert — /login 페이지에 머물러야 한다 (대시보드로 이동하지 않아야 한다)
    await expect(page).toHaveURL(/\/auth\/login|\/login/);
  });

  test('should return zero diaries for the withdrawn user (cascade delete verified)', async ({ page }) => {
    // Arrange — 탈퇴 전용 유저로 세션 설정 (일기 1건 포함)
    const { userId } = await setupWithdrawUserSession(page);

    // Arrange — 탈퇴 전 일기가 존재하는지 DB에서 확인
    const diariesBeforeWithdraw = await prisma.diary.findMany({
      where: { user_id: userId },
    });
    expect(diariesBeforeWithdraw.length).toBeGreaterThan(0);

    // Act — 탈퇴 실행
    await page.goto('/settings/withdraw');

    const checkbox = page.locator('[data-testid="withdraw-consent-checkbox"]');
    const withdrawButton = page.getByRole('button', { name: /탈퇴하기/i });

    await checkbox.check();
    await withdrawButton.click();
    await page.waitForURL(/\/auth\/login|\/login/);

    // Assert — 탈퇴 후 해당 유저의 일기 조회 결과가 0건이어야 한다 (cascade 삭제)
    const diariesAfterWithdraw = await prisma.diary.findMany({
      where: { user_id: userId },
    });
    expect(diariesAfterWithdraw).toHaveLength(0);
  });

  test('should delete the user record from the database after account withdrawal', async ({ page }) => {
    // Arrange
    const { userId } = await setupWithdrawUserSession(page);

    // Act — 탈퇴 실행
    await page.goto('/settings/withdraw');

    const checkbox = page.locator('[data-testid="withdraw-consent-checkbox"]');
    const withdrawButton = page.getByRole('button', { name: /탈퇴하기/i });

    await checkbox.check();
    await withdrawButton.click();
    await page.waitForURL(/\/auth\/login|\/login/);

    // Assert — 유저 레코드가 DB에서 삭제되어야 한다
    const deletedUser = await prisma.user.findUnique({
      where: { user_id: userId },
    });
    expect(deletedUser).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Authentication Guard
// ---------------------------------------------------------------------------

test.describe('Settings Withdraw - Authentication Guard', () => {
  test('should redirect to /login when unauthenticated user accesses /settings/withdraw', async ({ page }) => {
    // Arrange
    await clearAuth(page);

    // Act
    await page.goto('/settings/withdraw');

    // Assert
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });
});
