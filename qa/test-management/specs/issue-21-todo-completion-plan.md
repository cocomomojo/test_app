# Issue #21: [FEATURE] TODO完了管理の強化 — E2E Test Plan (Playwright)

## 1. Scope（対象/非対象）
### 対象
- TODOの完了/未完了状態の付与・切替
- 一覧での状態切替（チェックボックス等）
- フィルタ（すべて / 未完了 / 完了）
- 未完了件数表示
- リロード後の状態保持
- 既存機能（作成・削除・遷移）への影響確認
- `/todo` ページのE2E

### 非対象
- API/DBレイヤの単体テスト（unit）
- デザイン検証の詳細（視覚回帰レベル）
- 他ページ（/login, /top, /memo）の詳細機能

---

## 2. Assumptions（前提条件）
- Playwrightのseedによりログイン済み状態で `/todo` に到達可能
- seed内で `localStorage` を初期化可能（必要に応じて）
- TODO一覧はテストデータで事前投入可能（seedで初期投入）
- 完了状態は UI 操作で保持され、再読み込みで復元される

---

## 3. Test Data（入力データ）
- 初期TODO:
  - `todo-1`: "Buy milk"（未完了）
  - `todo-2`: "Read book"（未完了）
  - `todo-3`: "Pay bills"（完了）
- 追加作成用TODO:
  - `todo-4`: "Write report"（未完了で作成）

---

## 4. E2E Scenarios（正常系・異常系・保持系）
> 各シナリオは1意図で分割

### 正常系
1. **TODO作成後に完了/未完了を切替できる**
   - Given: /todoで "Write report" を作成
   - When: 作成したTODOのチェックボックスをON/OFF
   - Then: 表示状態（完了表示/未完了表示）が切り替わる
   - Assertion候補: 完了スタイルのclass追加/削除、チェック状態

2. **一覧で状態を切替できる**
   - Given: 既存TODOが3件表示されている
   - When: `todo-1` のチェックボックスをON
   - Then: `todo-1` が完了状態で表示
   - Assertion候補: 完了ラベル/スタイル/aria-checked

3. **フィルタ=未完了で未完了のみ表示される**
   - Given: 完了1件・未完了2件が存在
   - When: フィルタで「未完了」を選択
   - Then: 完了TODOは非表示、未完了2件のみ
   - Assertion候補: DOM内のTODO数、完了TODOが見えない

4. **フィルタ=完了で完了のみ表示される**
   - Given: 完了1件・未完了2件が存在
   - When: フィルタで「完了」を選択
   - Then: 完了1件のみ表示
   - Assertion候補: DOM内のTODO数、未完了が非表示

5. **フィルタ=すべてで全件表示される**
   - Given: 完了1件・未完了2件が存在
   - When: フィルタで「すべて」を選択
   - Then: 3件すべて表示
   - Assertion候補: DOM内のTODO数

6. **未完了件数が状態変更に応じて更新される**
   - Given: 未完了2件・完了1件
   - When: 未完了1件を完了に変更
   - Then: 未完了件数表示が「1」になる
   - Assertion候補: 件数表示のテキスト

### 保持系
7. **画面再読み込み後も状態が保持される**
   - Given: `todo-1` を完了に変更
   - When: ページを reload
   - Then: `todo-1` が完了状態のまま
   - Assertion候補: reload後のチェック状態/完了スタイル

### 既存機能影響確認
8. **既存: TODO作成機能が影響を受けていない**
   - When: 新規TODOを作成
   - Then: 一覧に追加され、未完了件数が+1される

9. **既存: TODO削除機能が影響を受けていない**
   - When: TODOを削除
   - Then: 一覧から消える、件数が更新される

10. **既存: 遷移（/top, /memo）に影響がない**
   - When: /todo から /top に遷移し、戻る
   - Then: /todo が正常に表示される

---

## 5. Integration Flows（画面横断導線）
1. `/top` → `/todo` → フィルタ操作 → `/memo` → `/todo`
   - 期待: /todo が正常表示、状態保持

2. `/login`（seed済）→ `/todo` → 状態変更 → reload
   - 期待: 状態が保持される

---

## 6. Non-functional checks（最低限）
- ページリロード後の状態保持がUIに反映される（UX）
- フィルタ切替時の不要な遅延がない（<2s想定）
- 主要操作（チェック、フィルタ、作成、削除）が非同期で安定

---

## 7. Risks & Flaky mitigations（待機戦略・セレクタ方針）
- **待機戦略**
  - チェック切替後は `expect(locator).toHaveClass(...)` または `toHaveAttribute('aria-checked','true')`
  - フィルタ変更後は `expect(todoItems).toHaveCount(n)`
  - 件数更新は `expect(countLocator).toHaveText(...)`
- **セレクタ方針**
  - `data-testid` を優先（存在しない場合は role/label）
  - テキスト一致は完全一致より `hasText` を利用
- **フレーク対策**
  - ローディング/遅延がある場合は `page.waitForResponse` 併用
  - localStorage 初期化を seed で明記

---

## 8. Traceability Matrix（受け入れ条件 ↔ シナリオ対応表）

| 受け入れ条件 | 対応シナリオ |
|---|---|
| TODO作成後、完了/未完了を切替できる | 1 |
| フィルタで表示が正しく切り替わる | 3,4,5 |
| 未完了件数が状態変更に応じて更新される | 6,8,9 |
| 画面再読み込み後も状態が保持される | 7 |
| 既存機能（作成・削除・遷移）に影響がない | 8,9,10 |
| テスト成功（unit/e2e） | 1〜10 |
