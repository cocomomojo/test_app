import { test, expect } from './fixtures/coverage-fixture';

test('memoでファイルアップロード画面が表示されること', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('ユーザ名').fill('testuser');
  await page.getByLabel('パスワード').fill('Test1234!');
  await page.getByRole('button', { name: /ログイン/ }).click();
  await page.waitForURL(/\/top/);

  await page.goto('/memo');
  await expect(page.getByLabel('タイトルを入力')).toBeVisible();
});

