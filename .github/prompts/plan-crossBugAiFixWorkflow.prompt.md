## Plan: 不具合横断AI修正ワークフロー設計

複数パターンの不具合を同じ流れで扱うため、Workflow を 4 層に分ける。すなわち「Triage（分類）→ Brief Generation（修正提案パック生成）→ IDE/Copilot Execution（差分案作成）→ Validation & PR Draft（検証条件とPR下書き）」である。Issue #35 は `Frontend UI text` の代表例として最初に通すが、設計自体は Backend、CI/Config、E2E environment、Docs/Manual にも同じ枠組みで適用できるようにする。初版は提案中心で、ブランチ push / 自動PR作成は対象外とする。

**Steps**
1. Phase 0: 不具合分類モデルを確定する。標準カテゴリは `frontend-ui-text`、`frontend-unit-test`、`backend`、`ci-config`、`e2e-environment`、`docs-manual` の 6 つとし、各カテゴリに「典型的な根拠」「参照ファイル」「最低限の検証ゲート」を紐づける。
2. Phase 1: Issue 入力スキーマを統一する。共通項目は `issue_number`、`issue_title`、`issue_body`、`issue_url`、`severity`、`acceptance_criteria`、`evidence_urls`、`related_run_id`、`related_run_url` とする。タイプ別項目は `failing_test_file`、`component_file`、`service_file`、`workflow_file`、`endpoint`、`doc_file` などを追加し、空欄可で扱う。 *depends on 1*
3. Phase 1: Triage workflow を設計する。`.github/workflows/issue-to-triage.yml` を新設し、`issues: opened/labeled/edited` で起動する。ここでは Issue 本文、ラベル、タイトル接頭辞、既存の自動起票マーカー（例: `<!-- automated-e2e-failure-analysis -->`）を読み、`bug_pattern`、`severity`、`ai_fixable` を決める。 *depends on 1 and 2*
4. Phase 1: Triage の判定ロジックをスクリプト化する。`scripts/classify-issue-pattern.js` を追加して、ルールベースで分類する。初版は deterministic にし、曖昧なら `needs-human-triage` を返す。 *depends on 2*
5. Phase 2: Brief generator を汎化する。既存の `scripts/create-planner-prompt.js` を拡張するか、`scripts/generate-fix-brief.js` を追加し、Issue番号を入力すると `fix-brief.json` と `fix-brief.md` を生成できるようにする。内容は「概要 / 有力原因 / 対象候補ファイル / 修正方針 / 変更禁止範囲 / 検証手順 / PR draft 素材」とする。 *depends on 3 and 4*
6. Phase 2: Triage の後段として Brief workflow を設計する。`.github/workflows/issue-to-fix-brief.yml` を新設し、`ai-fixable` ラベルが付いた Issue か `workflow_dispatch` で起動する。`bug_pattern` ごとのテンプレートを選び、artifact に `fix-brief.*` を保存し、Issue comment には要約と artifact 参照のみを残す。 *depends on 5*
7. Phase 2: パターン別テンプレートを作る。`qa/test-management/templates/` に `fix-brief-frontend-ui-text.md`、`fix-brief-frontend-unit-test.md`、`fix-brief-backend.md`、`fix-brief-ci-config.md`、`fix-brief-e2e-environment.md`、`fix-brief-docs-manual.md` を置き、共通ヘッダ + パターン別セクションの構成にする。 *depends on 5*
8. Phase 3: IDE/Copilot 実行インターフェースを固定する。fix brief は VS Code 上でそのまま Copilot に貼れる形式にし、必ず「対象ファイル」「期待する最小変更」「禁止事項」「必要テスト」を含める。将来 GitHub Actions で Copilot CLI に渡す場合も同じ文面を使えるようにする。 *parallel with 7*
9. Phase 3: Validation ルーティングを設計する。共通ゲートとして `PR template 準拠`、`Closes #Issue`、`変更対象の妥当性` を確認し、その上でカテゴリ別に以下を割り当てる。`frontend-ui-text` は E2E + 必要なら frontend unit、`frontend-unit-test` は unit + coverage、`backend` は Gradle test + JaCoCo + Sonar、`ci-config` は workflow 再実行 + Docker build/compose、`e2e-environment` は compose health + smoke E2E、`docs-manual` は markdown/link/screenshot 整合。 *depends on 6 and 7*
10. Phase 3: PR draft generator を設計する。Issue番号、カテゴリ、fix brief の要約から PR タイトル、本文、テスト項目、レビュー観点を生成し、`.github/pull_request_template.md` と `.github/skills/create_pr.md` の両方に整合する形式にする。 *depends on 5*
11. Phase 4: Pilot 導入順を明示する。Step A として Issue #35 型 `frontend-ui-text` を通す。Step B として `backend` と `ci-config` を追加し、型ごとに brief 品質と検証フローを確認する。Step C で `frontend-unit-test`、`e2e-environment`、`docs-manual` を追加する。 *depends on 6, 9, 10*
12. Phase 4: 完全自動化への境界を定義する。初版ではコード変更・commit・push・PR 作成は人手承認後とする。将来の `auto-fix-and-pr.yml` は別計画に分離し、専用トークン、対象パス制限、危険変更の自動停止条件、レビュー必須条件を揃えた後に追加する。 *after 1-11*

**Relevant files**
- `/home/coco2/work/test_app/.github/workflows/e2e-failure-analysis.yml` — 自動Issue化の既存起点。Issue本文の構造、artifact/log の扱い、Copilot CLI の呼び出し方を再利用する。
- `/home/coco2/work/test_app/.github/workflows/pr-quality.yml` — frontend/backend/Sonar の共通品質ゲートを流用する。
- `/home/coco2/work/test_app/.github/workflows/e2e.yml` — docker compose 起動、health check、Playwright 実行の再利用元。
- `/home/coco2/work/test_app/scripts/create-planner-prompt.js` — Issue→テンプレート埋め込みの既存資産。fix brief 生成のベース候補。
- `/home/coco2/work/test_app/qa/test-management/templates/planner-prompt-template.md` — 既存テンプレート構成の参考。brief template のベースにできる。
- `/home/coco2/work/test_app/.github/pull_request_template.md` — PR本文ドラフトの整形先。
- `/home/coco2/work/test_app/.github/skills/create_pr.md` — PR 説明文に含める項目の参考。
- `/home/coco2/work/test_app/.github/ISSUE_TEMPLATE/04-error-analysis-request.yml` — bug pattern / severity を取り込む更新対象。
- `/home/coco2/work/test_app/.github/agents/error-analysis-issue-creator.agent.md` — エラー解析 Issue 作成ルールの参考。
- `/home/coco2/work/test_app/.github/ISSUE_TEMPLATE/config.yml` — blank issue 無効化済みであることを前提に、Form 起点へ寄せる際の基準。
- `/home/coco2/work/test_app/frontend/tests/e2e/login.spec.ts` — `frontend-ui-text` パイロットの対象候補。
- `/home/coco2/work/test_app/frontend/src/components/LoginPage.vue` — パイロットの根拠ソース。

**Change guardrails**
- 既存 workflow の責務は維持する。`/home/coco2/work/test_app/.github/workflows/e2e-failure-analysis.yml` は「E2E失敗の証拠収集と Issue 起票」、`/home/coco2/work/test_app/.github/workflows/e2e.yml` は「E2E実行と artifact 収集」、`/home/coco2/work/test_app/.github/workflows/pr-quality.yml` は「PR品質ゲート」に責務を固定し、新しい triage / brief 生成責務を混ぜ込まない。
- 既存 workflow の trigger は原則変更しない。イベント種別、実行条件、permissions の意味を変える変更は初版スコープ外とする。
- 既存スクリプトは後方互換を優先する。`/home/coco2/work/test_app/scripts/create-planner-prompt.js` は既存用途を壊さない範囲で再利用し、責務が分岐するなら `/home/coco2/work/test_app/scripts/generate-fix-brief.js` のように新規追加する。
- 既存 Issue Form は破壊的変更を避ける。`/home/coco2/work/test_app/.github/ISSUE_TEMPLATE/04-error-analysis-request.yml` への追加は任意入力または後方互換ありの項目に限り、既存入力必須項目の意味は変えない。
- 新機能は追加型で実装する。新規追加対象は主に `/home/coco2/work/test_app/.github/workflows/issue-to-triage.yml`、`/home/coco2/work/test_app/.github/workflows/issue-to-fix-brief.yml`、`/home/coco2/work/test_app/scripts/classify-issue-pattern.js`、`/home/coco2/work/test_app/scripts/generate-fix-brief.js`、`/home/coco2/work/test_app/qa/test-management/templates/fix-brief-*.md` とする。
- パイロット段階の最小変更対象を明確化する。Phase 1 では既存ファイルの変更は `04-error-analysis-request.yml` と `create-planner-prompt.js` の判断に留め、基本は新規 workflow / script / template の追加だけで成立する構成を優先する。
- 将来の自動PR化でも、変更可能パスを `bug_pattern` ごとに制限する。例として `frontend-ui-text` は `frontend/tests/e2e/**` と `frontend/src/components/**` を主対象にし、`.github/workflows/**` や `infra/**` への変更は別パターンに限定する。

**Verification**
1. `issue-to-triage.yml` が Issue #35 を `frontend-ui-text` と判定し、`ai-fixable` を付けられることを確認する。
2. `issue-to-triage.yml` が Backend 系、CI/Config 系のサンプル Issue でも誤分類しないことを確認する。
3. `issue-to-fix-brief.yml` が Issue番号から `fix-brief.json` と `fix-brief.md` を生成し、Issue comment には概要のみを残すことを確認する。
4. `frontend-ui-text` 用 brief に `frontend/tests/e2e/login.spec.ts` と `frontend/src/components/LoginPage.vue` が候補として含まれ、E2E 再実行が必須条件として出力されることを確認する。
5. `backend` 用 brief では `./gradlew test jacocoTestReport`、`ci-config` 用 brief では対象 workflow 再実行、`e2e-environment` 用 brief では compose health + smoke test が必須として出力されることを確認する。
6. PR draft が `.github/pull_request_template.md` の `Closes #`、テスト設計、変更確認に必要な情報を満たすことを確認する。
7. 人手レビュー前提の運用手順として、Issue→triage→brief取得→Copilot に投入→差分レビュー→テスト→PR 作成、の一連の流れが wiki または README に落とし込めることを確認する。

**Decisions**
- 初版は「提案のみ」で止める。自動コード変更・自動push・自動PR作成は行わない。
- 実行基盤は GitHub Actions + VS Code/Copilot の両輪にする。Actions は構造化入力を作り、IDE は差分の妥当性レビューに向く。
- triage は初版ではルールベースにする。分類不能時は自動実行せず `needs-human-triage` に逃がす。
- fix brief の正本は artifact とし、Issue comment は短いサマリーと取得導線だけにする。
- 重要度は少なくとも `low / medium / high / critical` を持たせ、高/critical は将来の自動PR対象から除外しやすい形にする。
- Issue #35 は最初の pilot だが、テンプレートや workflow 名に Issue 固有のロジックは埋め込まない。

**Further Considerations**
1. `04-error-analysis-request.yml` に `bug_pattern` と `severity` の入力を追加するか、triage に完全委譲するかを決める。推奨は両方で、Form があるときは尊重し、ないときだけ triage が補完する。
2. `frontend-ui-text` と `docs-manual` は境界が近いため、「画面表示変更により手順書が古い」ケースをどちらへ寄せるか決める。推奨はコード差分ありなら `frontend-ui-text`、文書差分のみなら `docs-manual`。
3. `ci-config` と `e2e-environment` は似ているため、workflow YAML 起因かサービス起動起因かで分ける基準を明文化する。推奨は YAML/Actions 設定なら `ci-config`、compose/health/runtime なら `e2e-environment`。
4. 将来 `auto-fix-and-pr.yml` を作る場合は、`bug_pattern` ごとに変更可能ディレクトリを制限する。例: `frontend-ui-text` は `frontend/tests/e2e/**` と `frontend/src/components/**` のみ。
