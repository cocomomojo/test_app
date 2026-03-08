# Issue 作成運用ガイド

## 方針

Issue 作成は次の **4分類のみ** を使います。

1. **E2Eテスト作成**
2. **操作マニュアル作成**
3. **アプリ機能改修**
4. **エラー解析**

各分類は、**専用Issue Form + 専用Issue Creator Agent** で運用します。

## 正本（Source of Truth）

- Issue Forms
  - `.github/ISSUE_TEMPLATE/01-e2e-test-request.yml`
  - `.github/ISSUE_TEMPLATE/02-manual-request.yml`
  - `.github/ISSUE_TEMPLATE/03-feature-request.yml`
  - `.github/ISSUE_TEMPLATE/04-error-analysis-request.yml`
  - `.github/ISSUE_TEMPLATE/config.yml`
- Agents
  - `.github/agents/e2e-issue-creator.agent.md`
  - `.github/agents/manual-issue-creator.agent.md`
  - `.github/agents/feature-issue-creator.agent.md`
  - `.github/agents/error-analysis-issue-creator.agent.md`

## 作成手順

### 1) GitHub UI から作成（推奨）

1. `Issues` → `New issue`
2. 対応する Form を選択
3. 必須項目を入力して作成

### 2) エージェント経由で作成

- E2E: `e2e-issue-creator`
- Manual: `manual-issue-creator`
- Feature: `feature-issue-creator`
- Error: `error-analysis-issue-creator`

### 3) 具体例（そのまま使えるサンプル）

#### 例A: GitHub UI で作る（E2Eテスト作成）

`Issues` → `New issue` → `E2Eテスト作成` を選び、次のように入力します。

- 対象機能: `ログイン機能`
- テストシナリオ:
  - `正常系: 正しいID/PWでログイン成功`
  - `異常系: パスワード誤りでエラーメッセージ表示`
- 受け入れ条件:
  - `[ ] ローカルでテスト成功`
  - `[ ] CIでテスト成功`

作成されるタイトル例: `[E2E] ログイン機能`

#### 例B: エージェントに依頼して作る（Feature）

`feature-issue-creator` に以下のように依頼します。

> ログイン画面のユーザーID入力欄の上に「こんにちは」ラベルを追加するIssueを作成してください。
> 改修種別はUI/UX改善。受け入れ条件は「既存ログイン機能に影響なし」「テスト成功」です。

作成されるタイトル例: `[FEATURE] ログイン画面: 改修`

#### 例C: 4分類の依頼文テンプレート（コピペ用）

- E2E（`e2e-issue-creator`）
  - `「<対象機能> のE2Eテスト作成Issueを作成。正常系/異常系を含め、受け入れ条件はCI成功」`
- Manual（`manual-issue-creator`）
  - `「<対象機能> のユーザー向け操作マニュアル作成Issueを作成。スクリーンショット必須」`
- Feature（`feature-issue-creator`）
  - `「<対象機能> の機能改修Issueを作成。改修種別:<UI/UX改善|性能改善|新機能>、受け入れ条件を明記」`
- Error（`error-analysis-issue-creator`）
  - `「<対象機能> のエラー解析Issueを作成。再現手順・ログ・期待結果を含める」`

## 運用ルール

- Issue の分類は 4種類以外を追加しない。
- タイトル接頭辞は Form/Agent の定義に従う（`[E2E]`, `[MANUAL]`, `[FEATURE]`, `[ERROR]`）。
- PR本文には必ず `Closes #<Issue番号>` を入れる。

## 注意事項

- GitHub Copilot Pro（個人）では、Issueコメント起点の自動実装・自動PR作成は利用できません。
- そのため本リポジトリは、Issue作成を標準化し、実装〜PRは通常の開発フローで実施します。

## Copilot Pro での実装フロー

Copilot Pro では、Issueコメント起点の自動実装・自動PR作成が使えないため、次のどちらかで対応します。

#### 1) GitHub.com のチャットで直接 PR 作成を依頼

1. GitHub.com で Copilot Chat を開く
2. 次の文面をそのまま入力

  - `このIssue #13 を解決するPRを作成してください。リポジトリ: cocomomojo/test_app`

3. 提案内容を確認し、差分・テスト・PR本文（`Closes #13`）をチェック

#### 2) IDE（VS Code など）で Copilot Chat を使用

1. Issue #13 の内容（要件・受け入れ条件）をコピー
2. Copilot Chat に次を入力

  - `このIssue #13 を実装してください。要件: <貼り付けた内容>`

3. 生成コードを確認して適用
4. ローカルでテスト実行
5. 手動で commit & PR 作成（PR本文に `Closes #13` を記載）

### どちらを選ぶべきか

- 素早く試す: **GitHub.comチャット（方法1）**
- 実装を細かく調整しながら進める: **IDEチャット（方法2）**

## 変更履歴（本改訂）

- 旧方式（ActionsでのIssue自動生成 / 旧Prompt / 旧Script / 旧統合Agent / 旧feature自動実装トリガーWorkflow）を削除。
- 4分類の Issue Forms と専用 Issue Creator Agents に一本化。
