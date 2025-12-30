import { test, expect } from '@playwright/test';

test('memoで登録・削除できること', async ({ page }) => {
  // login
  await page.goto('/login');
  await page.getByLabel('ユーザ名').fill('testuser');
  await page.getByLabel('パスワード').fill('Test1234!');
  await page.getByRole('button', { name: /ログイン/ }).click();
  await page.waitForURL(/\/top/);

  await page.goto('/memo');

  const title = `e2e-memo-${Date.now()}`;
  await page.getByLabel('タイトルを入力').fill(title);
  // attach file
//   const filePath = require('path').resolve(__dirname, '../fixtures/test-upload.txt');
//   await page.setInputFiles('input[type="file"]', filePath);
//   await page.getByRole('button', { name: /アップロード/ }).click();
//   await expect(page.getByText(title)).toBeVisible();

  await page.getByRole('textbox', { name: 'タイトルを入力' }).click();
  await page.getByRole('textbox', { name: 'タイトルを入力' }).fill(title);
  await page.getByRole('button', { name: 'ファイルを選択 prepended action' }).click();
//   await page.getByRole('button', { name: 'ファイルを選択 ファイルを選択' }).setInputFiles('image1.png');
//   await page.getByRole('button', { name: 'アップロード' }).click();
//   await expect(page.getByText(title)).toBeVisible();
});
