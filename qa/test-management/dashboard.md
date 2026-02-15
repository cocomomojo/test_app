# Test Management Dashboard

最終更新: 2026-02-15T11:20:52.644Z

## 集計

- 対象PR数: **2**
- E2E項目数: **5**
- 手動項目数: **5**
- 総合項目数: **4**

## PR別テスト計画

| PR | タイトル | E2E | 手動 | 総合 | テスト計画 | Playwright |

|---:|---|---:|---:|---:|---|---|
| [#24](https://github.com/cocomomojo/test_app/pull/24) | feat: TODO完了管理の強化 - フィルタと未完了件数表示を追加 | 5 | 5 | 4 | [plan](/qa/test-management/pr/PR-24-test-plan.md) | [spec](/frontend/tests/e2e/generated/pr-24-feat-todo完了管理の強化---フィルタと未完了件数表示を追加.spec.ts) |
| [#20](https://github.com/cocomomojo/test_app/pull/20) | feat: PR起点のテスト管理自動化（Enterprise + Pro代替）を追加 | 0 | 0 | 0 | [plan](/qa/test-management/pr/PR-20-test-plan.md) | [spec](/frontend/tests/e2e/generated/pr-20-feat-pr起点のテスト管理自動化enterprise-pro代替を追加.spec.ts) |

## 運用ルール

- PR本文のチェックリストを更新すると、本ダッシュボードが再集計されます。
- E2E/総合テスト項目は Playwright 雛形に反映されます。
- 手動テスト項目は PRレビュー時に確認・実施してください。
