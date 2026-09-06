import { test, expect } from './fixtures/coverage-fixture';

test('TODOで登録できること', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('ユーザ名').fill('testuser');
  await page.getByLabel('パスワード').fill('Test1234!');
  await page.getByRole('button', { name: /ログイン/ }).click();
  await page.waitForURL(/\/top/);

  await page.goto('/todo');

  const title = `e2e-todo-${Date.now()}`;
  await page.getByLabel('新しい TODO を入力').fill(title);
  await page.getByRole('button', { name: '追加' }).click();
  await expect(page.getByText(title)).toBeVisible();
});

test('TODOをフィルターできること-すべて', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('ユーザ名').fill('testuser');
  await page.getByLabel('パスワード').fill('Test1234!');
  await page.getByRole('button', { name: /ログイン/ }).click();
  await page.waitForURL(/\/top/);

  await page.goto('/todo');

  const completedTitle = `completed-${Date.now()}`;
  const pendingTitle = `pending-${Date.now()}`;

  await page.getByLabel('新しい TODO を入力').fill(completedTitle);
  await page.getByRole('button', { name: '追加' }).click();
  await expect(page.getByText(completedTitle)).toBeVisible();

  const checkbox = page.locator('input[type="checkbox"]').first();
  await checkbox.check();
  await page.waitForTimeout(500);

  await page.getByLabel('新しい TODO を入力').fill(pendingTitle);
  await page.getByRole('button', { name: '追加' }).click();
  await expect(page.getByText(pendingTitle)).toBeVisible();

  const allFilterChip = page.locator('[data-testid="filter-chip-all"]');
  await allFilterChip.click();

  await expect(page.getByText(completedTitle)).toBeVisible();
  await expect(page.getByText(pendingTitle)).toBeVisible();
});

test('TODOをフィルターできること-未完了のみ', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('ユーザ名').fill('testuser');
  await page.getByLabel('パスワード').fill('Test1234!');
  await page.getByRole('button', { name: /ログイン/ }).click();
  await page.waitForURL(/\/top/);

  await page.goto('/todo');

  const completedTitle = `completed-${Date.now()}`;
  const pendingTitle = `pending-${Date.now()}`;

  await page.getByLabel('新しい TODO を入力').fill(completedTitle);
  await page.getByRole('button', { name: '追加' }).click();
  await expect(page.getByText(completedTitle)).toBeVisible();

  const checkbox = page.locator('input[type="checkbox"]').first();
  await checkbox.check();
  await page.waitForTimeout(500);

  await page.getByLabel('新しい TODO を入力').fill(pendingTitle);
  await page.getByRole('button', { name: '追加' }).click();
  await expect(page.getByText(pendingTitle)).toBeVisible();

  const pendingFilterChip = page.locator('[data-testid="filter-chip-pending"]');
  await pendingFilterChip.click();

  await expect(page.getByText(pendingTitle)).toBeVisible();
  await expect(page.getByText(completedTitle)).not.toBeVisible();
});

test('TODOをフィルターできること-完了のみ', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('ユーザ名').fill('testuser');
  await page.getByLabel('パスワード').fill('Test1234!');
  await page.getByRole('button', { name: /ログイン/ }).click();
  await page.waitForURL(/\/top/);

  await page.goto('/todo');

  const completedTitle = `completed-${Date.now()}`;
  const pendingTitle = `pending-${Date.now()}`;

  await page.getByLabel('新しい TODO を入力').fill(completedTitle);
  await page.getByRole('button', { name: '追加' }).click();
  await expect(page.getByText(completedTitle)).toBeVisible();

  const checkbox = page.locator('input[type="checkbox"]').first();
  await checkbox.check();
  await page.waitForTimeout(500);

  await page.getByLabel('新しい TODO を入力').fill(pendingTitle);
  await page.getByRole('button', { name: '追加' }).click();
  await expect(page.getByText(pendingTitle)).toBeVisible();

  const completedFilterChip = page.locator('[data-testid="filter-chip-completed"]');
  await completedFilterChip.click();

  await expect(page.getByText(completedTitle)).toBeVisible();
  await expect(page.getByText(pendingTitle)).not.toBeVisible();
});

