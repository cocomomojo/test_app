---
name: e2e-test-generator
description: Playwrightを使用したE2Eテストを生成するプロンプト
tools: [read, edit, search, shell]
---

# E2E Test Generator (Playwright)

## ゴール
このプロンプトは、このプロジェクトのフロントエンドアプリケーション（Vue3 + Vuetify）に対する、
Playwrightを使用した高品質なE2Eテストを生成します。

## プロジェクト情報

### アプリケーション仕様
- **フレームワーク**: Vue 3 + Vuetify 3
- **テストフレームワーク**: Playwright
- **テストランナー**: npm test:e2e
- **基本URL**: http://localhost:5173
- **主なページ**: LOGIN（/login）, TOP（/top）, TODO（/todo）, MEMO（/memo）

### テスト設定
- **テスト配置**: `frontend/tests/e2e/`
- **タイムアウト**: 30秒（テスト）, 5秒（assertion）
- **ブラウザ**: Chrome（Chromium）
- **スクリーンショット**: 失敗時のみ
- **リポート**: Allure + HTML
- **Retry**: 0回（リトライなし）

## 必須要件

### テストコードの構造
1. **ファイル配置**: `frontend/tests/e2e/` に `*.spec.ts` で配置
2. **命名規則**: 機能別にスネークケース + `.spec.ts` （例: login.spec.ts, add_todo.spec.ts）
3. **インポート**: `import { test, expect } from '@playwright/test';`

### テストケース設計

#### 1. ユーザーセレクタの選択（優先順）
```
優先度1: aria-label, role（アクセシビリティ）
優先度2: getByPlaceholder（入力フィールド）
優先度3: getByText（ボタン・テキスト）
優先度4: getByRole（汎用）
優先度5: CSS selector（最後の手段）
```

#### 2. テストケース種別と基本構造

**ポジティブテスト（正常系）**
```typescript
test('機能名が正常に動作すること', async ({ page }) => {
  // 1. ページへ遷移
  await page.goto('/path');
  
  // 2. 入力値を設定
  await page.getByLabel('ラベル').fill('値');
  
  // 3. アクションを実行
  await page.getByRole('button', { name: /ボタン名/ }).click();
  
  // 4. 結果を検証
  await page.waitForURL(/\/expected-path/);
  await expect(page.getByText('成功メッセージ')).toBeVisible();
});
```

**ネガティブテスト（異常系）**
```typescript
test('不正な入力時に警告が表示されること', async ({ page }) => {
  await page.goto('/path');
  await page.getByLabel('メールアドレス').fill('invalid-email');
  await page.getByRole('button', { name: /送信/ }).click();
  
  // エラーメッセージを検証
  await expect(page.getByText(/有効なメールアドレス/)).toBeVisible();
});
```

### テスト作成時の注意点

#### 1. 待機処理（Wait）の使い方
```typescript
// ❌ 避けるべき
await page.waitForTimeout(2000);

// ✅ 推奨
await page.waitForURL(/\/expected-path/);      // URL遷移待機
await expect(element).toBeVisible();            // 要素表示待機
await page.getByRole('button').waitFor();       // 要素出現待機
```

#### 2. テストの独立性
- 各テストは独立して実行可能であること
- 前のテスト結果に依存しないこと
- ログアウト処理を含める（必要に応じて）

#### 3. データ駆動テスト
```typescript
const testCases = [
  { username: 'user1', password: 'Pass1234!', shouldSucceed: true },
  { username: 'user2', password: 'weak', shouldSucceed: false },
];

testCases.forEach(({ username, password, shouldSucceed }) => {
  test(`${username}でログイン ${shouldSucceed ? '成功' : '失敗'}すること`, async ({ page }) => {
    // テスト処理
  });
});
```

## 出力形式

### ファイル構成
```
frontend/tests/e2e/
├── [feature].spec.ts           # 新規テストファイル
└── fixtures/                    # 必要に応じて共通フィクスチャ
    └── auth.ts                  # ログイン処理など
```

### テストファイルの基本構成
```typescript
import { test, expect } from '@playwright/test';

// フィクスチャ（共通処理）が必要な場合
const login = async (page) => {
  await page.goto('/login');
  await page.getByLabel('ユーザ名').fill('testuser');
  await page.getByLabel('パスワード').fill('Test1234!');
  await page.getByRole('button', { name: /ログイン/ }).click();
  await page.waitForURL(/\/top/);
};

// テストグループ
test.describe('[機能名] のテスト', () => {
  test('[テストケース名]', async ({ page }) => {
    // テスト処理
  });
  
  test('[別のテストケース]', async ({ page }) => {
    // テスト処理
  });
});
```

## テスト実行と検証

### ローカル実行
```bash
cd frontend
npm test:e2e                    # すべてのテスト実行
npm test:e2e -- login.spec.ts  # 特定ファイルのみ実行
```

### レポート確認
```bash
npm test:e2e:report            # Allureレポート生成・表示
```

### デバッグ
```bash
npx playwright test --debug     # デバッグモード（ステップ実行）
npx playwright codegen         # コード生成（UI操作から自動生成）
```

## テストシナリオ例

### ログイン機能
- ✅ 正しい認証情報でログイン成功
- ✅ 空のユーザ名でエラー表示
- ✅ 空のパスワードでエラー表示
- ✅ 不正なパスワードでエラー表示

### TODO管理機能
- ✅ TODOアイテムを追加できること
- ✅ 空のテキストでエラー表示
- ✅ TODOアイテムを削除できること
- ✅ TODOアイテムを完了マークできること
- ✅ 完了したTODOを未完了に戻せること

### メモ管理機能
- ✅ メモを作成できること
- ✅ メモを編集できること
- ✅ メモを削除できること
- ✅ メモのリストが表示されること

## ベストプラクティス

### 命名規則
```typescript
// ✅ 良い例：テストの意図が明確
test('ユーザーが有効なTODOを作成できること', async ({ page }) => {});
test('空のテキストでTODO作成時にエラーが表示されること', async ({ page }) => {});
test('完了したTODOを再度活動中にできること', async ({ page }) => {});

// ❌ 悪い例：意図が不明確
test('test 1', async ({ page }) => {});
test('add item', async ({ page }) => {});
```

### セレクタの使い方
```typescript
// ✅ 推奨：アクセシビリティベース
await page.getByLabel('ユーザ名').fill('user');
await page.getByRole('button', { name: /ログイン/ }).click();

// ❌ 避ける：CSS/XPath（脆弱）
await page.locator('.login-form input[type="text"]').fill('user');
await page.locator('.btn-primary').click();
```

### 検証（Assertions）
```typescript
// ✅ 推奨：複数の検証で信頼性向上
await expect(page.getByText('成功')).toBeVisible();
await expect(page.getByRole('button', { name: /削除/ })).toBeEnabled();
await expect(page.url()).toContain('/todo');

// ❌ 避ける：単一の検証のみ
await page.getByText('成功');
```

## よくある問題と解決策

| 問題 | 原因 | 解決策 |
|------|------|--------|
| タイムアウトエラー | 要素が見つからない | `waitFor()` を使用 / セレクタを確認 |
| テスト順序の依存 | 状態の引き継ぎ | 各テストで初期化処理を追加 |
| 不安定なテスト | タイミングの問題 | 待機処理（wait）を追加 |
| スクリーンショット不足 | ビューポートサイズ | 画面全体をスクロール確認 |

## チェックリスト

テストを作成する際の確認項目：

- [ ] ファイル名が `*.spec.ts` の形式か
- [ ] `import { test, expect }` が記述されているか
- [ ] 各テストが独立して実行可能か
- [ ] セレクタがアクセシビリティベースか
- [ ] 適切な待機処理があるか
- [ ] テスト名が日本語で意図が明確か
- [ ] ポジティブ・ネガティブテストが両方か
- [ ] ローカルで実行確認したか

---

## 使用例

**ユーザーリクエスト:**
```
「ログイン機能のE2Eテストを作成してください。
正常なログイン、空の入力、不正なパスワードの3パターンを含めてください。」
```

**出力:**
- `frontend/tests/e2e/login.spec.ts` ファイルが生成される
- 3つのテストケース（正常系、異常系×2）を含む
- すぐに実行可能な状態で出力される
