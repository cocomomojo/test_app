# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: todo.spec.ts >> TODOをフィルターできること-すべて
- Location: tests/e2e/todo.spec.ts:18:1

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/login
Call log:
  - navigating to "http://localhost:5173/login", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from './fixtures/coverage-fixture';
  2   | 
  3   | test('TODOで登録できること', async ({ page }) => {
  4   |   await page.goto('/login');
  5   |   await page.getByLabel('ユーザ名').fill('testuser');
  6   |   await page.getByLabel('パスワード').fill('Test1234!');
  7   |   await page.getByRole('button', { name: /ログイン/ }).click();
  8   |   await page.waitForURL(/\/top/);
  9   | 
  10  |   await page.goto('/todo');
  11  | 
  12  |   const title = `e2e-todo-${Date.now()}`;
  13  |   await page.getByLabel('新しい TODO を入力').fill(title);
  14  |   await page.getByRole('button', { name: '追加' }).click();
  15  |   await expect(page.getByText(title)).toBeVisible();
  16  | });
  17  | 
  18  | test('TODOをフィルターできること-すべて', async ({ page }) => {
> 19  |   await page.goto('/login');
      |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/login
  20  |   await page.getByLabel('ユーザ名').fill('testuser');
  21  |   await page.getByLabel('パスワード').fill('Test1234!');
  22  |   await page.getByRole('button', { name: /ログイン/ }).click();
  23  |   await page.waitForURL(/\/top/);
  24  | 
  25  |   await page.goto('/todo');
  26  | 
  27  |   const completedTitle = `completed-${Date.now()}`;
  28  |   const pendingTitle = `pending-${Date.now()}`;
  29  | 
  30  |   await page.getByLabel('新しい TODO を入力').fill(completedTitle);
  31  |   await page.getByRole('button', { name: '追加' }).click();
  32  |   await expect(page.getByText(completedTitle)).toBeVisible();
  33  | 
  34  |   const checkbox = page.locator('input[type="checkbox"]').first();
  35  |   await checkbox.check();
  36  |   await page.waitForTimeout(500);
  37  | 
  38  |   await page.getByLabel('新しい TODO を入力').fill(pendingTitle);
  39  |   await page.getByRole('button', { name: '追加' }).click();
  40  |   await expect(page.getByText(pendingTitle)).toBeVisible();
  41  | 
  42  |   const allFilterChip = page.locator('[data-testid="filter-chip-all"]');
  43  |   await allFilterChip.click();
  44  | 
  45  |   await expect(page.getByText(completedTitle)).toBeVisible();
  46  |   await expect(page.getByText(pendingTitle)).toBeVisible();
  47  | });
  48  | 
  49  | test('TODOをフィルターできること-未完了のみ', async ({ page }) => {
  50  |   await page.goto('/login');
  51  |   await page.getByLabel('ユーザ名').fill('testuser');
  52  |   await page.getByLabel('パスワード').fill('Test1234!');
  53  |   await page.getByRole('button', { name: /ログイン/ }).click();
  54  |   await page.waitForURL(/\/top/);
  55  | 
  56  |   await page.goto('/todo');
  57  | 
  58  |   const completedTitle = `completed-${Date.now()}`;
  59  |   const pendingTitle = `pending-${Date.now()}`;
  60  | 
  61  |   await page.getByLabel('新しい TODO を入力').fill(completedTitle);
  62  |   await page.getByRole('button', { name: '追加' }).click();
  63  |   await expect(page.getByText(completedTitle)).toBeVisible();
  64  | 
  65  |   const checkbox = page.locator('input[type="checkbox"]').first();
  66  |   await checkbox.check();
  67  |   await page.waitForTimeout(500);
  68  | 
  69  |   await page.getByLabel('新しい TODO を入力').fill(pendingTitle);
  70  |   await page.getByRole('button', { name: '追加' }).click();
  71  |   await expect(page.getByText(pendingTitle)).toBeVisible();
  72  | 
  73  |   const pendingFilterChip = page.locator('[data-testid="filter-chip-pending"]');
  74  |   await pendingFilterChip.click();
  75  | 
  76  |   await expect(page.getByText(pendingTitle)).toBeVisible();
  77  |   await expect(page.getByText(completedTitle)).not.toBeVisible();
  78  | });
  79  | 
  80  | test('TODOをフィルターできること-完了のみ', async ({ page }) => {
  81  |   await page.goto('/login');
  82  |   await page.getByLabel('ユーザ名').fill('testuser');
  83  |   await page.getByLabel('パスワード').fill('Test1234!');
  84  |   await page.getByRole('button', { name: /ログイン/ }).click();
  85  |   await page.waitForURL(/\/top/);
  86  | 
  87  |   await page.goto('/todo');
  88  | 
  89  |   const completedTitle = `completed-${Date.now()}`;
  90  |   const pendingTitle = `pending-${Date.now()}`;
  91  | 
  92  |   await page.getByLabel('新しい TODO を入力').fill(completedTitle);
  93  |   await page.getByRole('button', { name: '追加' }).click();
  94  |   await expect(page.getByText(completedTitle)).toBeVisible();
  95  | 
  96  |   const checkbox = page.locator('input[type="checkbox"]').first();
  97  |   await checkbox.check();
  98  |   await page.waitForTimeout(500);
  99  | 
  100 |   await page.getByLabel('新しい TODO を入力').fill(pendingTitle);
  101 |   await page.getByRole('button', { name: '追加' }).click();
  102 |   await expect(page.getByText(pendingTitle)).toBeVisible();
  103 | 
  104 |   const completedFilterChip = page.locator('[data-testid="filter-chip-completed"]');
  105 |   await completedFilterChip.click();
  106 | 
  107 |   await expect(page.getByText(completedTitle)).toBeVisible();
  108 |   await expect(page.getByText(pendingTitle)).not.toBeVisible();
  109 | });
  110 | 
  111 | 
  112 | test('優先度でTODOをフィルターできること', async ({ page }) => {
  113 |   await page.goto('/login');
  114 |   await page.getByLabel('ユーザ名').fill('testuser');
  115 |   await page.getByLabel('パスワード').fill('Test1234!');
  116 |   await page.getByRole('button', { name: /ログイン/ }).click();
  117 |   await page.waitForURL(/\/top/);
  118 | 
  119 |   await page.goto('/todo');
```