# PR Test Plan 生成物の branch反映ポリシー

## 🎯 目的

PR test plan 自動生成で作られた成果物を、**どのPRで branch に戻してよいか** を明確にするためのポリシーです。

対象の生成物は次の4つです。

- `qa/test-management/pr/PR-<番号>-test-plan.md`
- `qa/test-management/.meta/pr-<番号>.json`
- `qa/test-management/dashboard.md`
- `frontend/tests/e2e/generated/pr-<番号>-*.spec.ts`

---

## ✅ 基本ルール

| 条件 | branch反映 |
|---|---|
| fork PR | しない |
| draft PR | しない |
| 同一リポジトリPR + opt-in無効 | しない |
| 同一リポジトリPR + required labelなし | しない |
| 同一リポジトリPR + opt-in有効 + labelあり + tokenあり | する |

---

## 🚫 fork PR で branch反映しない理由

- 権限モデルが複雑で、write token の扱いが危険になりやすい
- 外部コントリビューションに対して自動commitを返す運用は事故が起きやすい
- まずは artifact と workflow summary で十分にレビュー可能

そのため、fork PR は **summary + artifact 提供のみ** を標準とします。

---

## 🔓 branch反映を許可する条件

以下をすべて満たすときだけ、workflow が PR branch に commit / push します。

1. PR が同一リポジトリから作成されている
2. PR が draft ではない
3. Repository Variable `PR_TEST_PLAN_PUSH_ENABLED` が `true`
4. Repository Variable `PR_TEST_PLAN_PUSH_LABEL` で指定された label が付いている
5. Repository Secret `PR_TEST_PLAN_GITHUB_TOKEN` が設定されている

### デフォルトの required label

特に設定しない場合、required label は `test-plan-sync` を使います。

---

## 📁 push 対象パスの制限

branch 反映で push してよいのは、次の生成物だけです。

- `qa/test-management/pr/PR-<番号>-test-plan.md`
- `qa/test-management/.meta/pr-<番号>.json`
- `qa/test-management/dashboard.md`
- `frontend/tests/e2e/generated/pr-<番号>-*.spec.ts`

workflow は、これ以外の差分を検知した場合は push を中止します。

---

## 🧭 推奨運用

### 初期導入時

- `PR_TEST_PLAN_PUSH_ENABLED` は **false のまま** にする
- `PR_TEST_PLAN_PUSH_LABEL` は `test-plan-sync` を設定する
- まずは artifact / workflow summary / PRコメントだけで運用を固める

### 運用が安定した後

- 同一リポジトリPRだけ `PR_TEST_PLAN_PUSH_ENABLED=true` にする
- bot 用 token を使って branch 反映を有効化する
- 実際に push したいPRだけ required label を付ける
- 生成物がノイズにならないかを 1〜2 スプリント観察する

---

## ⚙️ GitHub 管理画面での設定

1. リポジトリの `Settings` を開く
2. `Secrets and variables` → `Actions` を開く
3. Variables に次を追加する
	- `PR_TEST_PLAN_PUSH_ENABLED`
	- `PR_TEST_PLAN_PUSH_LABEL`
4. Secrets に `PR_TEST_PLAN_GITHUB_TOKEN` を追加する

### 推奨設定例

| 種別 | 名前 | 値の例 |
|---|---|---|
| Variable | `PR_TEST_PLAN_PUSH_ENABLED` | `false` |
| Variable | `PR_TEST_PLAN_PUSH_LABEL` | `test-plan-sync` |
| Secret | `PR_TEST_PLAN_GITHUB_TOKEN` | bot token |

---

## 📝 レビュー時の見方

workflow summary / PRコメントには、次の情報が出ます。

- artifact 名
- branch sync enabled
- required label
- policy
- branch sync result

これにより、

- そもそも反映対象だったのか
- なぜ push されなかったのか
- push が成功したのか

を追跡できます。

---

## ✅ 結論

- **デフォルトは branch に戻さない**
- **fork PR は常に戻さない**
- **draft PR は戻さない**
- **同一リポジトリPRのみ opt-in + label 指定で戻す**

このルールにすると、安全性を保ちながら段階導入しやすくなります。