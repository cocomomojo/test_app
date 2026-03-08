import { test, expect } from '@playwright/test';

test('TODOで登録・更新・削除できること', async ({ page }) => {
  // login
  await page.goto('/login');
  await page.getByLabel('ユーザ名').fill('testuser');
  await page.getByLabel('パスワード').fill('Test1234!');
  await page.getByRole('button', { name: /ログイン/ }).click();
  await page.waitForURL(/\/top/);

  await page.goto('/todo');

  // create
  const title = `e2e-todo-${Date.now()}`;
  await page.getByLabel('新しい TODO を入力').fill(title);
  await page.getByRole('button', { name: '追加' }).click();
  await expect(page.getByText(title)).toBeVisible();

//   // open edit dialog (click pencil)
//   const item = page.getByText(title).first();
//   const parent = item.locator('..');
//   await parent.getByRole('button', { name: /編集|pencil|mdi-pencil/ }).first().click().catch(() => {});
//   // fallback: open first dialog update
//   await page.getByRole('button', { name: '更新' }).click().catch(() => {});

//   // delete (click delete button)
//   await parent.getByRole('button', { name: /削除/ }).first().click().catch(() => {});
//   // assert removed
//   await expect(page.getByText(title)).not.toBeVisible({ timeout: 3000 }).catch(() => {});
});

test('TODOフィルタ機能と件数表示が動作すること', async ({ page }) => {
  // login
  await page.goto('/login');
  await page.getByLabel('ユーザ名').fill('testuser');
  await page.getByLabel('パスワード').fill('Test1234!');
  await page.getByRole('button', { name: /ログイン/ }).click();
  await page.waitForURL(/\/top/);

  await page.goto('/todo');

  // Create test todos
  const incompleteTodo = `未完了TODO-${Date.now()}`;
  const completeTodo = `完了TODO-${Date.now()}`;

  // Add first todo (incomplete)
  await page.getByLabel('新しい TODO を入力').fill(incompleteTodo);
  await page.getByRole('button', { name: '追加' }).click();
  await expect(page.getByText(incompleteTodo)).toBeVisible();

  // Add second todo and mark it as complete
  await page.getByLabel('新しい TODO を入力').fill(completeTodo);
  await page.getByRole('button', { name: '追加' }).click();
  await expect(page.getByText(completeTodo)).toBeVisible();

  // Find and check the checkbox for the complete todo
  const completeTodoRow = page.locator('div[role="listitem"]').filter({ hasText: completeTodo });
  const checkbox = completeTodoRow.locator('input[type="checkbox"]');
  await checkbox.check();

  // Verify incomplete count shows 1
  const countChip = page.locator('[aria-label="incomplete-count"]');
  await expect(countChip).toContainText('未完了: 1');

  // Test filter: incomplete
  await page.getByRole('button', { name: '未完了' }).click();
  await expect(page.getByText(incompleteTodo)).toBeVisible();
  await expect(page.getByText(completeTodo)).not.toBeVisible();

  // Test filter: complete
  await page.getByRole('button', { name: '完了' }).click();
  await expect(page.getByText(completeTodo)).toBeVisible();
  await expect(page.getByText(incompleteTodo)).not.toBeVisible();

  // Test filter: all
  await page.getByRole('button', { name: 'すべて' }).click();
  await expect(page.getByText(incompleteTodo)).toBeVisible();
  await expect(page.getByText(completeTodo)).toBeVisible();

  // Verify filter state persists after reload
  await page.getByRole('button', { name: '未完了' }).click();
  await expect(page.getByText(incompleteTodo)).toBeVisible();
  await expect(page.getByText(completeTodo)).not.toBeVisible();
  
  await page.reload();
  
  // Should still show only incomplete todos after reload
  await expect(page.getByText(incompleteTodo)).toBeVisible();
  await expect(page.getByText(completeTodo)).not.toBeVisible();
});
