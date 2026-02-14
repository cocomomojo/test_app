# Skill: configure_playwright_testing

## Description
Vue.js + ViteアプリケーションのPlaywright E2Eテスト環境を完全自動設定。
Page Objectモデル、安定したテストスイート、CI/CD統合を実現。

## Inputs
- frontend_framework: フロントエンドフレームワーク（Vue.js, React等）
- application_pages: アプリケーションページ構成
- test_requirements: テスト要件・シナリオ
- ci_integration: CI環境統合要求

## Output
- playwright.config.ts設定
- Page Objectクラス群
- テストスイート
- CI/CD統合設定

## Behavior
- 安定性重視のテスト設計
- Page Objectパターンの実装
- 効率的なテスト実行設定
- 視覚的な結果レポート生成

## Configuration Templates

### playwright.config.ts（最適化設定）
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } }
  ],
  webServer: {
    command: 'npm run preview',
    port: 5173,
    reuseExistingServer: !process.env.CI
  }
});
```

### Page Object例（LoginPage）
```typescript
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[data-testid="email"]');
    this.passwordInput = page.locator('[data-testid="password"]');
    this.loginButton = page.locator('[data-testid="login-button"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async waitForErrorMessage() {
    await this.errorMessage.waitFor();
    return this.errorMessage.textContent();
  }
}
```

### テストスイート例
```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('認証フロー', () => {
  test('正常ログイン', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login('user@example.com', 'password123');

    await expect(page).toHaveURL('/dashboard');
    await expect(dashboardPage.welcomeMessage).toBeVisible();
  });

  test('無効な認証情報でエラー', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('invalid@example.com', 'wrongpassword');

    const errorText = await loginPage.waitForErrorMessage();
    expect(errorText).toContain('認証に失敗しました');
  });
});
```
