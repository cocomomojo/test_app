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

test('フィルター機能で未完了TODOのみ表示できること', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('ユーザ名').fill('testuser');
  await page.getByLabel('パスワード').fill('Test1234!');
  await page.getByRole('button', { name: /ログイン/ }).click();
  await page.waitForURL(/\/top/);

  await page.goto('/todo');

  // 2つのTODOを作成
  const title1 = `filter-test-1-${Date.now()}`;
  const title2 = `filter-test-2-${Date.now()}`;
  
  await page.getByLabel('新しい TODO を入力').fill(title1);
  await page.getByRole('button', { name: '追加' }).click();
  await expect(page.getByText(title1)).toBeVisible();

  await page.getByLabel('新しい TODO を入力').fill(title2);
  await page.getByRole('button', { name: '追加' }).click();
  await expect(page.getByText(title2)).toBeVisible();

  // 1つ目をチェック(完了)
  const checkboxes = await page.locator('input[type="checkbox"]').all();
  await checkboxes[0].check();
  await page.waitForTimeout(500);

  // 「未完了」フィルターをクリック
  await page.getByTestId('filter-incomplete').click();
  await page.waitForTimeout(500);

  // title1は表示されず、title2のみ表示されることを確認
  await expect(page.getByText(title1)).not.toBeVisible();
  await expect(page.getByText(title2)).toBeVisible();
});

test('フィルター機能で完了TODOのみ表示できること', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('ユーザ名').fill('testuser');
  await page.getByLabel('パスワード').fill('Test1234!');
  await page.getByRole('button', { name: /ログイン/ }).click();
  await page.waitForURL(/\/top/);

  await page.goto('/todo');

  // 2つのTODOを作成
  const title1 = `filter-test-3-${Date.now()}`;
  const title2 = `filter-test-4-${Date.now()}`;
  
  await page.getByLabel('新しい TODO を入力').fill(title1);
  await page.getByRole('button', { name: '追加' }).click();
  await expect(page.getByText(title1)).toBeVisible();

  await page.getByLabel('新しい TODO を入力').fill(title2);
  await page.getByRole('button', { name: '追加' }).click();
  await expect(page.getByText(title2)).toBeVisible();

  // 1つ目をチェック(完了)
  const checkboxes = await page.locator('input[type="checkbox"]').all();
  await checkboxes[0].check();
  await page.waitForTimeout(500);

  // 「完了」フィルターをクリック
  await page.getByTestId('filter-complete').click();
  await page.waitForTimeout(500);

  // title1のみ表示されることを確認
  await expect(page.getByText(title1)).toBeVisible();
  await expect(page.getByText(title2)).not.toBeVisible();
});

test('フィルター機能で「すべて」を選択すると全TODOが表示されること', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('ユーザ名').fill('testuser');
  await page.getByLabel('パスワード').fill('Test1234!');
  await page.getByRole('button', { name: /ログイン/ }).click();
  await page.waitForURL(/\/top/);

  await page.goto('/todo');

  // 2つのTODOを作成
  const title1 = `filter-test-5-${Date.now()}`;
  const title2 = `filter-test-6-${Date.now()}`;
  
  await page.getByLabel('新しい TODO を入力').fill(title1);
  await page.getByRole('button', { name: '追加' }).click();
  await expect(page.getByText(title1)).toBeVisible();

  await page.getByLabel('新しい TODO を入力').fill(title2);
  await page.getByRole('button', { name: '追加' }).click();
  await expect(page.getByText(title2)).toBeVisible();

  // 1つ目をチェック(完了)
  const checkboxes = await page.locator('input[type="checkbox"]').all();
  await checkboxes[0].check();
  await page.waitForTimeout(500);

  // 「未完了」フィルターをクリック
  await page.getByTestId('filter-incomplete').click();
  await page.waitForTimeout(500);

  // 「すべて」フィルターをクリック
  await page.getByTestId('filter-all').click();
  await page.waitForTimeout(500);

  // 両方表示されることを確認
  await expect(page.getByText(title1)).toBeVisible();
  await expect(page.getByText(title2)).toBeVisible();
});

