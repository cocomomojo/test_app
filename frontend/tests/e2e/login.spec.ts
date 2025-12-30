import { test, expect } from '@playwright/test';

test('ログインできること', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('ユーザ名').fill('testuser');
  await page.getByLabel('パスワード').fill('Test1234!');
  await page.getByRole('button', { name: /ログイン/ }).click();
  await page.waitForURL(/\/top/);
  await expect(page.getByText('TOP 画面')).toBeVisible();
});
