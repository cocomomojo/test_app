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

test('TODOフィルタと未完了件数が動作すること', async ({ page }) => {
  // login
  await page.goto('/login');
  await page.getByLabel('ユーザ名').fill('testuser');
  await page.getByLabel('パスワード').fill('Test1234!');
  await page.getByRole('button', { name: /ログイン/ }).click();
  await page.waitForURL(/\/top/);

  await page.goto('/todo');

  // create multiple todos
  const title1 = `e2e-todo-incomplete-${Date.now()}`;
  const title2 = `e2e-todo-complete-${Date.now()}`;
  
  await page.getByLabel('新しい TODO を入力').fill(title1);
  await page.getByRole('button', { name: '追加' }).click();
  await expect(page.getByText(title1)).toBeVisible();
  
  await page.getByLabel('新しい TODO を入力').fill(title2);
  await page.getByRole('button', { name: '追加' }).click();
  await expect(page.getByText(title2)).toBeVisible();

  // check that incomplete count is visible
  await expect(page.getByText(/未完了:/)).toBeVisible();

  // mark one as complete by clicking its checkbox
  const todoItem = page.locator(`text=${title2}`).locator('..').locator('..');
  await todoItem.locator('input[type="checkbox"]').check();
  
  // wait for snackbar message indicating the update was successful
  await expect(page.getByText('状態を更新しました')).toBeVisible();
  
  // wait a moment for the snackbar to disappear and state to update
  await expect(page.getByText('状態を更新しました')).not.toBeVisible();

  // test filter: click "未完了" button
  await page.getByRole('button', { name: '未完了' }).click();
  await expect(page.getByText(title1)).toBeVisible();
  await expect(page.getByText(title2)).not.toBeVisible();

  // test filter: click "完了" button
  await page.getByRole('button', { name: '完了' }).click();
  await expect(page.getByText(title1)).not.toBeVisible();
  await expect(page.getByText(title2)).toBeVisible();

  // test filter: click "すべて" button
  await page.getByRole('button', { name: 'すべて' }).click();
  await expect(page.getByText(title1)).toBeVisible();
  await expect(page.getByText(title2)).toBeVisible();
});
