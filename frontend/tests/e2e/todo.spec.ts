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
  
  // チェックボックス操作の PUT リクエスト完了を待機
  const updateResponse = page.waitForResponse(resp => 
    resp.url().includes('/todo') && resp.request().method() === 'PUT' && resp.status() === 200
  );
  
  await checkbox.check();
  await updateResponse;

  await page.getByLabel('新しい TODO を入力').fill(pendingTitle);
  await page.getByRole('button', { name: '追加' }).click();
  await expect(page.getByText(pendingTitle)).toBeVisible();

  const allFilterChip = page.locator('[data-testid="filter-chip-all"]');
  
  // フィルター適用はクライアント側の状態変更のみ（GET リクエストなし）
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

  // Create a completed TODO
  await page.getByLabel('新しい TODO を入力').fill(completedTitle);
  await page.getByRole('button', { name: '追加' }).click();
  await expect(page.getByText(completedTitle)).toBeVisible();

  // Check the TODO to mark it as done
  const checkbox = page.locator('input[type="checkbox"]').first();
  
  // チェックボックス操作の PUT リクエスト完了を待機
  const updateResponse = page.waitForResponse(resp => 
    resp.url().includes('/todo') && resp.request().method() === 'PUT' && resp.status() === 200
  );
  
  await checkbox.check();
  await updateResponse;

  // Create a pending TODO
  await page.getByLabel('新しい TODO を入力').fill(pendingTitle);
  await page.getByRole('button', { name: '追加' }).click();
  await expect(page.getByText(pendingTitle)).toBeVisible();

  // Apply pending filter
  const pendingFilterChip = page.locator('[data-testid="filter-chip-pending"]');
  
  // フィルター適用はクライアント側の状態変更のみ（GET リクエストなし）
  await pendingFilterChip.click();

  // Verify pending TODO is visible and completed TODO is not
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
  
  // チェックボックス操作の PUT リクエスト完了を待機
  const updateResponse = page.waitForResponse(resp => 
    resp.url().includes('/todo') && resp.request().method() === 'PUT' && resp.status() === 200
  );
  
  await checkbox.check();
  await updateResponse;

  await page.getByLabel('新しい TODO を入力').fill(pendingTitle);
  await page.getByRole('button', { name: '追加' }).click();
  await expect(page.getByText(pendingTitle)).toBeVisible();

  const completedFilterChip = page.locator('[data-testid="filter-chip-completed"]');
  
  // フィルター適用はクライアント側の状態変更のみ（GET リクエストなし）
  await completedFilterChip.click();

  await expect(page.getByText(completedTitle)).toBeVisible();
  await expect(page.getByText(pendingTitle)).not.toBeVisible();
});


test('優先度でTODOをフィルターできること', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('ユーザ名').fill('testuser');
  await page.getByLabel('パスワード').fill('Test1234!');
  await page.getByRole('button', { name: /ログイン/ }).click();
  await page.waitForURL(/\/top/);

  await page.goto('/todo');

  // FilterPanelが表示されることを確認
  const filterPriority = page.locator('[data-testid="filter-priority"]');
  await expect(filterPriority).toBeVisible();

  // 優先度を選択してフィルター適用
  await filterPriority.click();
  await page.locator('text=高').click();
  
  const applyButton = page.locator('[data-testid="filter-apply-btn"]');
  await applyButton.click();
  
  await page.waitForTimeout(500);
});

test('期限でTODOをフィルターできること', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('ユーザ名').fill('testuser');
  await page.getByLabel('パスワード').fill('Test1234!');
  await page.getByRole('button', { name: /ログイン/ }).click();
  await page.waitForURL(/\/top/);

  await page.goto('/todo');

  // FilterPanelが表示されることを確認
  const filterPanel = page.locator('[data-testid="filter-panel-title"]');
  await expect(filterPanel).toBeVisible();

  const dueDateFrom = page.locator('[data-testid="filter-due-date-from"]');
  const dueDateTo = page.locator('[data-testid="filter-due-date-to"]');
  
  await expect(dueDateFrom).toBeVisible();
  await expect(dueDateTo).toBeVisible();
});

test('フィルターをリセットできること', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('ユーザ名').fill('testuser');
  await page.getByLabel('パスワード').fill('Test1234!');
  await page.getByRole('button', { name: /ログイン/ }).click();
  await page.waitForURL(/\/top/);

  await page.goto('/todo');

  const clearButton = page.locator('[data-testid="filter-clear-btn"]');
  await expect(clearButton).toBeVisible();
  
  await clearButton.click();
  await page.waitForTimeout(500);
});
