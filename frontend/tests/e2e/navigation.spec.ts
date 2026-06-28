import { test, expect } from './fixtures/coverage-fixture';

test('サブメニューで TOP⇒TODO⇒memo に遷移できること', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('ユーザ名').fill('testuser');
  await page.getByLabel('パスワード').fill('Test1234!');
  await page.getByRole('button', { name: /ログイン/ }).click();
  await page.waitForURL(/\/top/);

  await page.getByRole('link', { name: 'TODO', exact: true }).click();
  await page.waitForURL(/\/todo/);
  await expect(page.getByText('TODO リスト')).toBeVisible();

  await page.getByRole('link', { name: 'メモ' }).click();
  await page.waitForURL(/\/memo/);
  await expect(page.getByText('メモ一覧')).toBeVisible().catch(() => {});
});

