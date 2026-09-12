# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: memo.spec.ts >> memoでファイルアップロード画面が表示されること
- Location: tests/e2e/memo.spec.ts:3:1

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
  3  | test('memoでファイルアップロード画面が表示されること', async ({ page }) => {
> 4  |   await page.goto('/login');
     |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/login
  5  |   await page.getByLabel('ユーザ名').fill('testuser');
  6  |   await page.getByLabel('パスワード').fill('Test1234!');
  7  |   await page.getByRole('button', { name: /ログイン/ }).click();
  8  |   await page.waitForURL(/\/top/);
  9  | 
  10 |   await page.goto('/memo');
  11 |   await expect(page.getByLabel('タイトルを入力')).toBeVisible();
  12 | });
  13 | 
  14 | 
```