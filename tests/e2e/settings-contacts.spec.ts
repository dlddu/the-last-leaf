// TODO: Activate when DLD-380 is implemented
// All tests in this file are skipped until /settings/contacts page is implemented.
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

async function clearTestUserContacts(userId: string): Promise<void> {
  await prisma.contact.deleteMany({
    where: { user_id: userId },
  });
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

test.describe.skip('Settings Contacts - Navigation', () => {
  // TODO: DLD-380 — activate after /settings/contacts page is implemented

  test.beforeEach(async ({ page }) => {
    const userId = await getTestUserId();
    await clearTestUserContacts(userId);
    await authenticateAsTestUser(page);
    await page.goto('/settings');
  });

  test('should navigate to /settings/contacts when clicking "연락처 관리" menu item', async ({ page }) => {
    // Act
    await page.getByText('연락처 관리').click();

    // Assert
    await page.waitForURL(/\/settings\/contacts/);
    await expect(page).toHaveURL(/\/settings\/contacts/);
  });

  test('should display contacts page heading after navigation', async ({ page }) => {
    // Act
    await page.getByText('연락처 관리').click();
    await page.waitForURL(/\/settings\/contacts/);

    // Assert
    await expect(page.getByRole('heading', { name: /연락처|contacts/i })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

test.describe.skip('Settings Contacts - Empty State', () => {
  // TODO: DLD-380 — activate after /settings/contacts page is implemented

  test.beforeEach(async ({ page }) => {
    const userId = await getTestUserId();
    await clearTestUserContacts(userId);
    await authenticateAsTestUser(page);
    await page.goto('/settings/contacts');
  });

  test('should display empty state message when user has no contacts', async ({ page }) => {
    // Assert
    // Page has no contacts — guidance text should be visible
    await expect(page.getByText(/연락처가 없습니다|등록된 연락처|아직 연락처/i)).toBeVisible();
  });

  test('should display AddContactPlaceholder when user has no contacts', async ({ page }) => {
    // Assert
    await expect(page.locator('[data-testid="add-contact-button"]')).toBeVisible();
  });

  test('should not display any ContactCard when contact list is empty', async ({ page }) => {
    // Assert
    const contactCards = page.locator('[data-testid="contact-card"]');
    await expect(contactCards).toHaveCount(0);
  });
});

// ---------------------------------------------------------------------------
// Add Contact
// ---------------------------------------------------------------------------

test.describe.skip('Settings Contacts - Add Contact', () => {
  // TODO: DLD-380 — activate after /settings/contacts page is implemented

  test.beforeEach(async ({ page }) => {
    const userId = await getTestUserId();
    await clearTestUserContacts(userId);
    await authenticateAsTestUser(page);
    await page.goto('/settings/contacts');
  });

  test('should add a blank ContactCard when clicking the add button', async ({ page }) => {
    // Arrange
    const addButton = page.locator('[data-testid="add-contact-button"]');

    // Act
    await addButton.click();

    // Assert — a new blank card should appear
    const contactCards = page.locator('[data-testid="contact-card"]');
    await expect(contactCards).toHaveCount(1);

    // Email and phone fields should be empty
    const emailInput = contactCards.first().locator('[data-testid="contact-email"]');
    const phoneInput = contactCards.first().locator('[data-testid="contact-phone"]');
    await expect(emailInput).toBeVisible();
    await expect(phoneInput).toBeVisible();
    await expect(emailInput).toHaveValue('');
    await expect(phoneInput).toHaveValue('');
  });

  test('should save contact with email and phone and show toast', async ({ page }) => {
    // Arrange
    await page.locator('[data-testid="add-contact-button"]').click();
    const card = page.locator('[data-testid="contact-card"]').first();

    // Act
    await card.locator('[data-testid="contact-email"]').fill('contact@example.com');
    await card.locator('[data-testid="contact-phone"]').fill('010-1234-5678');
    await page.getByRole('button', { name: /저장|save/i }).click();

    // Assert — toast confirmation
    await expect(page.getByText(/저장되었습니다|saved|변경되었습니다/i)).toBeVisible();
  });

  test('should persist saved contact after page reload', async ({ page }) => {
    // Arrange
    await page.locator('[data-testid="add-contact-button"]').click();
    const card = page.locator('[data-testid="contact-card"]').first();
    await card.locator('[data-testid="contact-email"]').fill('persist@example.com');
    await card.locator('[data-testid="contact-phone"]').fill('010-9999-8888');
    await page.getByRole('button', { name: /저장|save/i }).click();
    await expect(page.getByText(/저장되었습니다|saved|변경되었습니다/i)).toBeVisible();

    // Act
    await page.reload();

    // Assert — contact is still present after reload
    const contactCards = page.locator('[data-testid="contact-card"]');
    await expect(contactCards).toHaveCount(1);
    await expect(contactCards.first().locator('[data-testid="contact-email"]')).toHaveValue('persist@example.com');
    await expect(contactCards.first().locator('[data-testid="contact-phone"]')).toHaveValue('010-9999-8888');
  });

  test('should save contact with only email (phone is optional)', async ({ page }) => {
    // Arrange
    await page.locator('[data-testid="add-contact-button"]').click();
    const card = page.locator('[data-testid="contact-card"]').first();

    // Act
    await card.locator('[data-testid="contact-email"]').fill('emailonly@example.com');
    await page.getByRole('button', { name: /저장|save/i }).click();

    // Assert
    await expect(page.getByText(/저장되었습니다|saved|변경되었습니다/i)).toBeVisible();
  });

  test('should save contact with only phone (email is optional)', async ({ page }) => {
    // Arrange
    await page.locator('[data-testid="add-contact-button"]').click();
    const card = page.locator('[data-testid="contact-card"]').first();

    // Act
    await card.locator('[data-testid="contact-phone"]').fill('010-1111-2222');
    await page.getByRole('button', { name: /저장|save/i }).click();

    // Assert
    await expect(page.getByText(/저장되었습니다|saved|변경되었습니다/i)).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Delete Contact
// ---------------------------------------------------------------------------

test.describe.skip('Settings Contacts - Delete Contact', () => {
  // TODO: DLD-380 — activate after /settings/contacts page is implemented

  test.beforeEach(async ({ page }) => {
    // Seed one contact directly via DB so the delete scenario has something to work with
    const userId = await getTestUserId();
    await clearTestUserContacts(userId);
    await prisma.contact.create({
      data: {
        user_id: userId,
        email: 'to-delete@example.com',
        phone: '010-0000-1111',
      },
    });
    await authenticateAsTestUser(page);
    await page.goto('/settings/contacts');
  });

  test('should remove ContactCard from the list when clicking the delete button', async ({ page }) => {
    // Arrange
    const contactCards = page.locator('[data-testid="contact-card"]');
    await expect(contactCards).toHaveCount(1);

    // Act
    await contactCards.first().locator('[data-testid="contact-delete-button"]').click();

    // Assert — card disappears from the UI immediately
    await expect(contactCards).toHaveCount(0);
  });

  test('should persist deletion after saving and reloading', async ({ page }) => {
    // Arrange
    const contactCards = page.locator('[data-testid="contact-card"]');
    await contactCards.first().locator('[data-testid="contact-delete-button"]').click();
    await expect(contactCards).toHaveCount(0);

    // Act
    await page.getByRole('button', { name: /저장|save/i }).click();
    await expect(page.getByText(/저장되었습니다|saved|변경되었습니다/i)).toBeVisible();
    await page.reload();

    // Assert — contact is gone after reload
    await expect(page.locator('[data-testid="contact-card"]')).toHaveCount(0);
  });

  test('should show empty state after deleting the last contact and saving', async ({ page }) => {
    // Arrange
    const contactCards = page.locator('[data-testid="contact-card"]');
    await contactCards.first().locator('[data-testid="contact-delete-button"]').click();

    // Act
    await page.getByRole('button', { name: /저장|save/i }).click();
    await expect(page.getByText(/저장되었습니다|saved|변경되었습니다/i)).toBeVisible();

    // Assert — empty state guidance is visible
    await expect(page.getByText(/연락처가 없습니다|등록된 연락처|아직 연락처/i)).toBeVisible();
    await expect(page.locator('[data-testid="add-contact-button"]')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

test.describe.skip('Settings Contacts - Validation', () => {
  // TODO: DLD-380 — activate after /settings/contacts page is implemented

  test.beforeEach(async ({ page }) => {
    const userId = await getTestUserId();
    await clearTestUserContacts(userId);
    await authenticateAsTestUser(page);
    await page.goto('/settings/contacts');
  });

  test('should display email format error when invalid email is entered', async ({ page }) => {
    // Arrange
    await page.locator('[data-testid="add-contact-button"]').click();
    const card = page.locator('[data-testid="contact-card"]').first();

    // Act
    await card.locator('[data-testid="contact-email"]').fill('not-a-valid-email');
    await page.getByRole('button', { name: /저장|save/i }).click();

    // Assert — inline error message on the email field
    await expect(card.getByText(/이메일|email|올바른 형식|invalid/i)).toBeVisible();
  });

  test('should not show email error when email field is left empty', async ({ page }) => {
    // Arrange
    await page.locator('[data-testid="add-contact-button"]').click();
    const card = page.locator('[data-testid="contact-card"]').first();

    // Act — leave email empty, fill only phone, then save
    await card.locator('[data-testid="contact-phone"]').fill('010-5555-6666');
    await page.getByRole('button', { name: /저장|save/i }).click();

    // Assert — no email validation error, save succeeds
    await expect(page.getByText(/저장되었습니다|saved|변경되었습니다/i)).toBeVisible();
  });

  test('should clear email error after correcting the invalid email', async ({ page }) => {
    // Arrange
    await page.locator('[data-testid="add-contact-button"]').click();
    const card = page.locator('[data-testid="contact-card"]').first();
    await card.locator('[data-testid="contact-email"]').fill('bad-email');
    await page.getByRole('button', { name: /저장|save/i }).click();
    await expect(card.getByText(/이메일|email|올바른 형식|invalid/i)).toBeVisible();

    // Act — correct the email
    await card.locator('[data-testid="contact-email"]').clear();
    await card.locator('[data-testid="contact-email"]').fill('correct@example.com');
    await page.getByRole('button', { name: /저장|save/i }).click();

    // Assert — error gone, save succeeds
    await expect(page.getByText(/저장되었습니다|saved|변경되었습니다/i)).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Authentication Guard
// ---------------------------------------------------------------------------

test.describe.skip('Settings Contacts - Authentication Guard', () => {
  // TODO: DLD-380 — activate after /settings/contacts page is implemented

  test('should redirect to /login when unauthenticated user accesses /settings/contacts', async ({ page }) => {
    // Arrange
    await clearAuth(page);

    // Act
    await page.goto('/settings/contacts');

    // Assert
    await page.waitForURL(/\/login/);
    await expect(page).toHaveURL(/\/login/);
  });
});
