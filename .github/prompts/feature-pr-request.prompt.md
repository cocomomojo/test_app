---
name: feature-pr-request
description: 機能改修IssueからPR作成依頼文を標準フォーマットで生成する
tools: [read, search]
---

# Feature PR Request Template

以下のフォーマットで、GitHub Copilot (Web/IDE) への依頼文を作成してください。
不足情報があれば、Q&A形式で必要最小限だけ質問してください。

## 入力
- Issue番号
- リポジトリ名
- 改修内容
- 受け入れ条件

## 出力フォーマット（そのまま貼り付け）

このIssue #<ISSUE_NUMBER> を解決するPRを作成してください。
リポジトリ: <OWNER/REPO>
Issue: https://github.com/<OWNER/REPO>/issues/<ISSUE_NUMBER>

実装方針:
- 最小変更で実装し、既存機能を壊さない
- 受け入れ条件を満たす

テスト方針:
- Unit/E2E を追加・更新する
- E2EはPlaywrightで主要導線・異常系・保持系をカバーする
- 可能なら公式 Playwright Test Agents（planner/generator/healer）を使用する

PR要件:
- PR本文はテンプレートに従う
- `Inputs for Test Design (Q&A)` を埋める
- `Test Design (E2E) / Test Design (Manual) / Integration Test Items` を埋める
- 本文に `Closes #<ISSUE_NUMBER>` を含める
- 変更点・テスト結果・影響範囲を明記する
