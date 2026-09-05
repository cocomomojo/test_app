---
name: playwright-e2e-testing
description: Playwright E2E テストの設計・実装・デバッグ。Vue コンポーネントと統合テストを高品質に実装する際に使用してください。
---

## Playwright E2E テスト設計・実装

このスキルは、本プロジェクトの Playwright E2E テストを効率的に設計・実装・デバッグするための手順を提供します。

### テスト設計の原則

1. **セレクタ戦略**
   - 推奨: `data-testid` 属性を使用（最も安定）
   - 回避: CSS クラスや HTML 構造に依存（脆弱性が高い）
   - 例: `await page.getByTestId('login-button').click()`

2. **待機戦略**
   - API レスポンス待機: `await page.waitForResponse(res => ...)`
   - DOM 要素待機: `await page.getByTestId('result').isVisible()`
   - タイムアウト: 最大30秒（デフォルト）

3. **テストファイル配置**
   - 場所: `frontend/tests/e2e/`
   - 命名: `[機能].spec.ts`
   - 例: `frontend/tests/e2e/login.spec.ts`

### よくあるエラーと修正

| エラー | 原因 | 修正方法 |
|---|---|---|
| `error: target page, context or browser has been closed` | ブラウザ予期終了 | ワークフロー内のタイムアウト延長またはテスト最適化 |
| `Timeout 30000ms exceeded` | 要素が見つからない | `data-testid` が正しいか確認、待機時間調整 |
| `Target closed` | リソース不足 | メモリリーク確認、テストを分割 |

### 実装チェックリスト

- [ ] `data-testid` 属性が付与されているか確認
- [ ] `npm run test:e2e` で成功するか確認
- [ ] エラー時のスクリーンショット生成を確認
- [ ] 既存テストが壊れていないか確認
