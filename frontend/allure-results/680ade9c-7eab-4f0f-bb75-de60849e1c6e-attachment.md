# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: theme.spec.ts >> ダークモード切り替え機能 >> ログインページにテーマ切り替えボタンが表示される
- Location: tests/e2e/theme.spec.ts:4:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/login
Call log:
  - navigating to "http://localhost:5173/login", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from './fixtures/coverage-fixture';
  2  | 
  3  | test.describe('ダークモード切り替え機能', () => {
  4  |   test('ログインページにテーマ切り替えボタンが表示される', async ({ page }) => {
  5  |     // Don't clear localStorage, just navigate directly to login
> 6  |     await page.goto('/login');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/login
  7  |     
  8  |     const themeToggleBtn = page.locator('[data-testid="theme-toggle-btn"]');
  9  |     await expect(themeToggleBtn).toBeVisible();
  10 |   });
  11 | 
  12 |   test('テーマ切り替えボタンはアイコンを持つ', async ({ page }) => {
  13 |     await page.goto('/login');
  14 |     
  15 |     const themeToggleBtn = page.locator('[data-testid="theme-toggle-btn"]');
  16 |     const icon = themeToggleBtn.locator('.v-icon');
  17 |     
  18 |     // Button should contain an icon
  19 |     await expect(icon).toBeVisible();
  20 |   });
  21 | 
  22 |   test('ボタンをクリック可能', async ({ page }) => {
  23 |     await page.goto('/login');
  24 |     
  25 |     const themeToggleBtn = page.locator('[data-testid="theme-toggle-btn"]');
  26 |     
  27 |     // Click should succeed without error
  28 |     await themeToggleBtn.click();
  29 |     
  30 |     // Button should still be visible after click
  31 |     await expect(themeToggleBtn).toBeVisible();
  32 |   });
  33 | 
  34 |   test('ボタンが常に表示される', async ({ page }) => {
  35 |     await page.goto('/login');
  36 |     
  37 |     const themeToggleBtn = page.locator('[data-testid="theme-toggle-btn"]');
  38 |     
  39 |     // Initially visible
  40 |     await expect(themeToggleBtn).toBeVisible();
  41 |     
  42 |     // After click, still visible
  43 |     await themeToggleBtn.click();
  44 |     await expect(themeToggleBtn).toBeVisible();
  45 |     
  46 |     // After another click, still visible
  47 |     await themeToggleBtn.click();
  48 |     await expect(themeToggleBtn).toBeVisible();
  49 |   });
  50 | 
  51 |   test('ボタンには title属性がある', async ({ page }) => {
  52 |     await page.goto('/login');
  53 |     
  54 |     const themeToggleBtn = page.locator('[data-testid="theme-toggle-btn"]');
  55 |     
  56 |     const title = await themeToggleBtn.getAttribute('title');
  57 |     expect(title).toBeTruthy();
  58 |     expect(['ダークモード', 'ライトモード']).toContain(title);
  59 |   });
  60 | 
  61 |   test('複数回クリック後もボタンは機能する', async ({ page }) => {
  62 |     await page.goto('/login');
  63 |     
  64 |     const themeToggleBtn = page.locator('[data-testid="theme-toggle-btn"]');
  65 |     
  66 |     // Click multiple times
  67 |     for (let i = 0; i < 5; i++) {
  68 |       await themeToggleBtn.click();
  69 |       await page.waitForTimeout(200);
  70 |     }
  71 |     
  72 |     // Button should still be visible and responsive
  73 |     await expect(themeToggleBtn).toBeVisible();
  74 |   });
  75 | 
  76 |   test('ボタンのアイコンクラスが変わる', async ({ page }) => {
  77 |     await page.goto('/login');
  78 |     
  79 |     const themeToggleBtn = page.locator('[data-testid="theme-toggle-btn"]');
  80 |     const icon = themeToggleBtn.locator('.v-icon');
  81 |     
  82 |     // Get initial content
  83 |     const initialContent = await icon.textContent();
  84 |     
  85 |     // Click to toggle
  86 |     await themeToggleBtn.click();
  87 |     await page.waitForTimeout(300);
  88 |     
  89 |     // Icon should still exist
  90 |     await expect(icon).toBeVisible();
  91 |   });
  92 | });
  93 | 
```