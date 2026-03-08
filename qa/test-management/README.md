# QA Test Management

このディレクトリは、Feature PRごとのテスト設計・実行計画を管理します。

## 生成物

- `pr/PR-<番号>-test-plan.md`: PR単位のテスト計画
- `.meta/pr-<番号>.json`: ダッシュボード集計用メタ情報
- `dashboard.md`: 全PRの集計ダッシュボード

## 現在の扱い

- 現在は過去のテスト設計生成物・補助ファイルの保管場所です。
- 現行のCI運用は `.github/workflows/e2e.yml` / `.github/workflows/e2e-failure-analysis.yml` / `.github/workflows/pr-quality.yml` に移行しています。

## 補足

- E2E/総合項目は `frontend/tests/e2e/generated/` 配下の Playwright 雛形に反映されます。
