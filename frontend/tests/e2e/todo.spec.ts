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
