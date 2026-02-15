# E2E Testing Guide

This document provides comprehensive instructions for running End-to-End (E2E) tests using Playwright.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Running Tests](#running-tests)
- [Test Database Setup](#test-database-setup)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 20.x or higher
- Docker and Docker Compose
- PostgreSQL 15 (via Docker)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Playwright Browsers

```bash
npx playwright install chromium
```

### 3. Start Test Database

```bash
docker compose up -d postgres-test
```

Wait for the database to be ready (health check passes):

```bash
docker compose ps
```

### 4. Setup Test Database Schema and Seed Data

```bash
npm run db:test:setup
```

This command will:
- Push the Prisma schema to the test database
- Seed test data (test user, diaries, contacts)

### 5. Run E2E Tests

```bash
npm run test:e2e
```

## Running Tests

### All Tests

```bash
npm run test:e2e
```

### UI Mode (Interactive)

```bash
npm run test:e2e:ui
```

This opens Playwright's interactive UI where you can:
- Select specific tests to run
- Watch tests execute in real-time
- Inspect DOM and network requests
- Time-travel through test steps

### Debug Mode

```bash
npm run test:e2e:debug
```

Runs tests in debug mode with Playwright Inspector.

### Specific Test File

```bash
npx playwright test tests/e2e/health.spec.ts
```

### View Test Report

After tests run, view the HTML report:

```bash
npm run test:e2e:report
```

## Test Database Setup

### Environment Variables

E2E tests use `.env.test` for configuration:

```env
DATABASE_URL="postgresql://test:test@localhost:5433/test_db?sslmode=disable"
JWT_SECRET="test-jwt-secret-key-for-testing-purposes-only"
NODE_ENV="test"
BASE_URL="http://localhost:3000"
```

### Docker Compose

The test database runs on port **5433** (not 5432) to avoid conflicts with development databases.

```yaml
services:
  postgres-test:
    image: postgres:15-alpine
    ports:
      - "5433:5432"
```

### Database Commands

**Start test database:**
```bash
docker compose up -d postgres-test
```

**Stop test database:**
```bash
docker compose down
```

**Reset database to seed state:**
```bash
npm run db:test:reset
```

**Re-run seed script only:**
```bash
npm run db:seed
```

## Writing Tests

### Test Structure

Tests are located in `tests/e2e/` directory.

Example test structure:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    // Arrange
    await page.goto('/');

    // Act
    await page.click('button[type="submit"]');

    // Assert
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

### Authentication Helpers

Use the auth helper to authenticate users in tests:

```typescript
import { authenticateAsTestUser } from '../helpers/auth';

test('authenticated user can access dashboard', async ({ page }) => {
  // Authenticate as test user
  await authenticateAsTestUser(page);

  // Navigate to protected route
  await page.goto('/dashboard');

  // Assert user is logged in
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

### Database Cleanup

Use the database cleanup helper to ensure test isolation:

```typescript
import { cleanupDatabase, prisma } from '../helpers/db-cleanup';

test.beforeEach(async () => {
  await cleanupDatabase();
  // Create fresh test data
});

test.afterAll(async () => {
  await prisma.$disconnect();
});
```

### Test Data

Default seed data:

**Test User:**
- Email: `test@example.com`
- Password: `testpassword123`
- Nickname: `Test User`

**Test Diaries:**
- 2 diary entries created for test user

**Test Contact:**
- Email: `emergency@example.com`
- Phone: `+1-555-0100`

## CI/CD Integration

E2E tests run automatically in GitHub Actions on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### CI Workflow

The workflow:
1. Starts PostgreSQL test database (Docker)
2. Sets up database schema and seeds data
3. Installs Playwright browsers
4. Runs E2E tests
5. Uploads test report as artifact
6. Stops database

### Retry Policy

- **Local:** No retries
- **CI:** 2 retries for flaky tests

### Viewing CI Test Reports

1. Go to GitHub Actions tab
2. Select the workflow run
3. Download the `playwright-report` artifact
4. Extract and open `index.html` in browser

## Troubleshooting

### Database Connection Issues

**Problem:** Cannot connect to database

**Solutions:**
1. Ensure Docker is running: `docker ps`
2. Check database is healthy: `docker compose ps`
3. Verify port 5433 is not in use: `lsof -i :5433`
4. Restart database: `docker compose down && docker compose up -d`

### Playwright Browser Installation

**Problem:** Browsers not found

**Solution:**
```bash
npx playwright install chromium --with-deps
```

### Test Failures Due to Data

**Problem:** Tests fail because of stale data

**Solution:**
```bash
npm run db:test:reset
npm run db:test:setup
```

### Port Already in Use

**Problem:** Port 3000 or 5433 already in use

**Solutions:**
- Kill process using port 3000: `lsof -ti:3000 | xargs kill -9`
- Change test database port in `docker-compose.yml` and `.env.test`

### Timeouts

**Problem:** Tests timeout waiting for server

**Solution:**
- Increase timeout in `playwright.config.ts`:
```typescript
webServer: {
  timeout: 180 * 1000, // 3 minutes
}
```

### Debugging Failed Tests

1. Run in UI mode: `npm run test:e2e:ui`
2. Run in debug mode: `npm run test:e2e:debug`
3. Check screenshots in `test-results/` directory
4. View trace in HTML report

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on state from other tests
2. **Cleanup**: Always clean up test data in `afterEach` or `afterAll` hooks
3. **Selectors**: Use stable selectors (data-testid) rather than CSS classes
4. **Waits**: Use Playwright's auto-waiting instead of manual delays
5. **Assertions**: Use Playwright's web-first assertions (`expect(locator).toBeVisible()`)
6. **Parallelization**: Keep tests independent to benefit from parallel execution
7. **Seed Data**: Use consistent seed data to make tests predictable

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Prisma Seeding](https://www.prisma.io/docs/guides/database/seed-database)
