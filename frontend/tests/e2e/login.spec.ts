import { test, expect, type Page } from '@playwright/test';

const submitLogin = async (page: Page, username: string, password: string) => {
  await page.getByLabel('ユーザ名').fill(username);
  await page.getByLabel('パスワード').fill(password);
  await page.getByRole('button', { name: /ログイン/ }).click();
};

test.describe('ログイン機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
  });

  test('正しい認証情報でログイン成功', async ({ page }) => {
    await submitLogin(page, 'testuser', 'Test1234!');

    await page.waitForURL(/\/top/);
    await expect(page.getByText('TOP 画面')).toBeVisible();
  });

  test('空のユーザ名でエラー表示', async ({ page }) => {
    await submitLogin(page, '', 'Test1234!');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText('ログインに失敗しました')).toBeVisible();
  });

  test('不正なパスワードでエラー表示', async ({ page }) => {
    await submitLogin(page, 'testuser', 'WrongPass!');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText('ログインに失敗しました')).toBeVisible();
  });
});
