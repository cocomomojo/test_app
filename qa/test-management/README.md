# QA Test Management

このディレクトリは、Feature PRごとのテスト設計・実行計画を管理します。

## 生成物

- `pr/PR-<番号>-test-plan.md`: PR単位のテスト計画
- `.meta/pr-<番号>.json`: ダッシュボード集計用メタ情報
- `dashboard.md`: 全PRの集計ダッシュボード

## Enterprise（自動）

- Workflow: `.github/workflows/feature-pr-test-management-enterprise.yml`
- 事前設定: `COPILOT_ENTERPRISE_AUTOMATION=true`

## Pro（代替）

- Workflow: `.github/workflows/feature-pr-test-management-pro.yml`
- `workflow_dispatch` で `pr_number` を指定して実行

## 補足

- E2E/総合項目は `frontend/tests/e2e/generated/` 配下の Playwright 雛形に反映されます。
