# Skill: use_official_playwright_test_agents

目的: 公式 Playwright Test Agents（planner / generator / healer）で、テスト設計→実装→修復を標準化する。

## 前提
- 公式ドキュメント: https://playwright.dev/docs/test-agents
- VS Code は 1.105 以降（agentic experience 対応）
- Playwright を更新したら agent definitions を再生成する

## 初期化
1. プロジェクトルート（Playwright構成がある場所）で実行
2. `npx playwright init-agents --loop=vscode`
3. 生成された定義・構成ファイルをコミット

## 推奨フロー（PR単位）
1. planner
   - 入力: Issue要件、PR本文の `Inputs for Test Design (Q&A)`、必要なら seed test
   - 出力: `specs/*.md` のテスト計画
2. generator
   - 入力: `specs/*.md`
   - 出力: 実行可能な Playwright tests
3. healer
   - 入力: failing test 名
   - 出力: 修正提案またはパッチ

## 本リポジトリ運用の接続
- PR本文の `Test Design (E2E)` / `Integration Test Items` は維持
- 生成されたテストは `frontend/tests/e2e/` 配下に反映
- 必要に応じて `frontend/tests/e2e/generated/` の雛形から昇格

## 成果物チェック
- [ ] specs が要件をカバー
- [ ] tests が実行可能
- [ ] flaky要因（wait不足・脆いselector）を修正
- [ ] PR本文にテスト結果を記録
