# Playwright Planner Prompt (Template)

以下を **Playwright Test Agents の planner** に入力してください。

---

対象Issue: #21
URL: https://github.com/cocomomojo/test_app/issues/21
リポジトリ: cocomomojo/test_app

あなたは Playwright Test Agents の planner です。  
Issue #21（[FEATURE] TODO完了管理の強化）に対するE2Eテスト計画を作成してください。

## 目的
- 変更要件を E2E / Integration 観点で漏れなくカバーするテスト計画を作成する。
- 生成結果は `specs/issue-21-feature-todo完了管理の強化.md` に保存する想定で作成する。

## 改修内容
### 改修種別

UI/UX改善

### 改修内容

- TODOに「完了/未完了」の状態を持たせる
- 一覧で状態を切替できる（チェックボックス等）
- フィルタを追加（すべて / 未完了 / 完了）
- 件数表示を追加（未完了件数）

### 受け入れ条件

- [ ]  TODO作成後、完了/未完了を切替できる
- [ ]  フィルタで表示が正しく切り替わる
- [ ]  未完了件数が状態変更に応じて更新される
- [ ]  画面再読み込み後も状態が保持される
- [ ]  既存機能（作成・削除・遷移）に影響がない
- [ ]  テスト成功（unit/e2e）


## 受け入れ条件（必須カバー）
- Issue本文のチェック項目をすべてトレースすること

## コンテキスト
- アプリ: Vue3 + Vuetify
- E2E: Playwright
- 既存ページ: `/login`, `/top`, `/todo`, `/memo`
- 既存テスト: `frontend/tests/e2e/*.spec.ts`

## seed test 指示
- ログイン済み状態で対象ページへ到達する seed を前提に計画すること。
- 必要なら seed 内で `localStorage` 初期化やテストデータ準備を明記すること。

## 出力要件
次の構造で Markdown を出力してください。

1. Scope（対象/非対象）
2. Assumptions（前提条件）
3. Test Data（入力データ）
4. E2E Scenarios（正常系・異常系・保持系）
5. Integration Flows（画面横断導線）
6. Non-functional checks（最低限）
7. Risks & Flaky mitigations（待機戦略・セレクタ方針）
8. Traceability Matrix（受け入れ条件 ↔ シナリオ対応表）

## 制約
- 各シナリオは「1シナリオ1意図」で分割
- 既存テストとの重複を避ける
- 抽象表現を避け、検証可能な記述にする
- 失敗時に原因を切り分けしやすい粒度にする

## 期待する最終成果
- `generator` がそのままテストコード化できる具体度の計画
- `healer` が修復しやすいよう、待機条件と観測点（assertion候補）を明記

---

（補足）
この計画の後、generator に渡して `frontend/tests/e2e/generated/issue-21-*.spec.ts` を生成する予定です。
