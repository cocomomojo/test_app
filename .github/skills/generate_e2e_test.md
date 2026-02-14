# Skill: generate_e2e_test

## Description
仕様書や Issue を元に Playwright + CodeceptJS の E2E テストを生成する。
Page Objectパターンと安定性を重視したテストコードを自動生成。

## Inputs
- requirements: テスト要件・仕様
- target_pages: テスト対象ページ
- test_scenarios: テストシナリオ
- browser_config: ブラウザ設定
- test_data: テストデータ

## Output
- E2Eテストコード
- Page Objectファイル
- テスト設定ファイル
- テスト実行手順

## Behavior
- Page Object パターンで生成
- 安定性を考慮した待機処理を追加
- テストデータの外部化を実装
- 並列実行対応の構造
- スクリーンショット・レポート機能を組み込み

## Test Structure Templates

### CodeceptJS Test
```javascript
// tests/login_test.js
Feature('ログイン機能');

Scenario('正常なログインができる', ({ I, loginPage, dashboardPage }) => {
  loginPage.visit();
  loginPage.enterCredentials('testuser@example.com', 'password123');
  loginPage.clickLoginButton();
  dashboardPage.waitForPageLoad();
  dashboardPage.verifyUserIsLoggedIn('testuser@example.com');
});

Scenario('不正な認証情報でログインが失敗する', ({ I, loginPage }) => {
  loginPage.visit();
  loginPage.enterCredentials('invalid@example.com', 'wrongpassword');
  loginPage.clickLoginButton();
  loginPage.verifyErrorMessage('認証に失敗しました');
});
```

### Page Object
```javascript
// pages/LoginPage.js
const { I } = inject();

class LoginPage {
  constructor() {
    this.fields = {
      email: '#email',
      password: '#password',
      loginButton: '[data-testid="login-button"]',
      errorMessage: '.error-message'
    };
  }

  visit() {
    I.amOnPage('/login');
    I.waitForElement(this.fields.email, 10);
  }

  enterCredentials(email, password) {
    I.clearField(this.fields.email);
    I.fillField(this.fields.email, email);
    I.clearField(this.fields.password);
    I.fillField(this.fields.password, password);
  }

  clickLoginButton() {
    I.click(this.fields.loginButton);
  }

  verifyErrorMessage(expectedMessage) {
    I.waitForVisible(this.fields.errorMessage, 5);
    I.see(expectedMessage, this.fields.errorMessage);
  }
}

module.exports = LoginPage;
```

### Playwright Test
```javascript
// tests/login.spec.js
import { test, expect } from '@playwright/test';

test.describe('ログイン機能', () => {
  test('正常なログインができる', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#email', 'testuser@example.com');
    await page.fill('#password', 'password123');
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-name"]')).toContainText('testuser@example.com');
  });

  test('不正な認証情報でログインが失敗する', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#email', 'invalid@example.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('認証に失敗しました');
  });
});
```

### Configuration
```javascript
// codecept.conf.js
exports.config = {
  tests: './tests/*_test.js',
  output: './output',
  helpers: {
    Playwright: {
      url: process.env.BASE_URL || 'http://localhost:3000',
      show: process.env.HEADLESS !== 'true',
      browser: 'chromium',
      waitForAction: 500,
      waitForNavigation: 'networkidle0',
      timeout: 30000
    }
  },
  include: {
    I: './steps_file.js',
    loginPage: './pages/LoginPage.js',
    dashboardPage: './pages/DashboardPage.js'
  },
  plugins: {
    screenshotOnFail: {
      enabled: true
    },
    retryFailedStep: {
      enabled: true,
      retries: 2
    }
  }
};
```
