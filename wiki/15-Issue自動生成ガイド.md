# Issue 作成運用ガイド（標準・最新版）

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

## 運用ルール

- Issue の分類は 4種類以外を追加しない。
- タイトル接頭辞は Form/Agent の定義に従う（`[E2E]`, `[MANUAL]`, `[FEATURE]`, `[ERROR]`）。
- PR本文には必ず `Closes #<Issue番号>` を入れる。

## 注意事項

- GitHub Copilot Pro（個人）では、Issueコメント起点の自動実装・自動PR作成は利用できません。
- そのため本リポジトリは、Issue作成を標準化し、実装〜PRは通常の開発フローで実施します。

## 変更履歴（本改訂）

- 旧方式（ActionsでのIssue自動生成 / 旧Prompt / 旧Script / 旧統合Agent / 旧feature自動実装トリガーWorkflow）を削除。
- 4分類の Issue Forms と専用 Issue Creator Agents に一本化。
