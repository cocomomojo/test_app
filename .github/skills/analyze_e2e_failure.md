# Skill: analyze_e2e_failure

## Description
E2E テストの失敗ログを解析し、flakiness の原因を特定する。
テストの安定性向上のための具体的な改善策を提示。

## Inputs
- log: テスト失敗ログ
- test_code: 失敗したテストコード
- screenshot: 失敗時のスクリーンショット
- browser_info: ブラウザ・環境情報
- execution_context: 実行時の状況

## Output
- 失敗原因の分析結果
- Flakiness の根本原因
- 具体的な修正コード
- 安定化のための改善案

## Behavior
- タイミング依存、要素未表示、ネットワーク遅延などを分類
- 改善案を提示
- 失敗パターンを学習して予防策を提案
- スクリーンショットとログを相関分析
- 環境固有の問題を特定

## Failure Analysis Categories

### タイミング関連
```markdown
⏱️ **タイミングの問題**
**症状:** Element not found, Timeout errors
**原因:**
- 要素の読み込み待機不足
- 非同期処理の完了前にアクション実行
- アニメーションの完了待ちなし

**修正方法:**
```javascript
// Before: 不安定なコード
I.click('#submit-button');
I.see('Success message');

// After: 安定化されたコード
I.click('#submit-button');
I.waitForVisible('.success-message', 10);
I.see('Success message', '.success-message');
```

### セレクタ関連
```markdown
🎯 **セレクタの問題**
**症状:** Element not found, Multiple elements found
**原因:**
- 動的に変わるID/クラス名の使用
- 不適切なセレクタの指定
- DOM構造の変更

**修正方法:**
```javascript
// Before: 不安定なセレクタ
I.click('#dynamic-id-12345');

// After: 安定したセレクタ
I.click('[data-testid="submit-button"]');
// または
I.click('button:has-text("送信")');
```

### ネットワーク関連
```markdown
🌐 **ネットワークの問題**
**症状:** Request timeout, 502/503 errors
**原因:**
- API応答の遅延
- ネットワーク接続の不安定
- サーバー負荷による遅延

**修正方法:**
```javascript
// リトライ機能付きの実装
const MAX_RETRIES = 3;
for (let i = 0; i < MAX_RETRIES; i++) {
  try {
    await page.goto('/api/data');
    break;
  } catch (error) {
    if (i === MAX_RETRIES - 1) throw error;
    await page.waitForTimeout(2000);
  }
}
```

### データ依存関連
```markdown
💾 **テストデータの問題**
**症状:** Unexpected data, State conflicts
**原因:**
- テスト間のデータ競合
- 前提データの不整合
- 外部依存サービスの状態変化

**修正方法:**
```javascript
// テスト分離の実装
test.beforeEach(async ({ page }) => {
  // テストデータのクリーンアップ
  await setupTestData();
});

test.afterEach(async ({ page }) => {
  // テスト後のクリーンアップ
  await cleanupTestData();
});
```

### 環境依存関連
```markdown
🖥️ **環境の問題**
**症状:** Works locally but fails in CI
**原因:**
- ブラウザバージョンの違い
- 画面解像度の違い
- タイムゾーンやロケールの違い

**修正方法:**
```javascript
// 環境統一の設定
// playwright.config.js
module.exports = {
  use: {
    viewport: { width: 1920, height: 1080 },
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
    ignoreHTTPSErrors: true
  }
};
```

## 改善テンプレート
```javascript
// 安定性向上のためのヘルパー関数
class StableTestHelper {
  static async waitForStableElement(page, selector, timeout = 10000) {
    await page.waitForSelector(selector, { timeout });
    await page.waitForFunction(
      sel => {
        const element = document.querySelector(sel);
        return element && element.offsetHeight > 0 && element.offsetWidth > 0;
      },
      selector,
      { timeout }
    );
  }

  static async retryAction(action, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await action();
        return;
      } catch (error) {
        if (i === MAX_RETRIES - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
}
```
