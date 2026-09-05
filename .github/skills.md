# 📚 GitHub Copilot Skills & Patterns

プロジェクト独自のスキル、パターン、ベストプラクティスを定義します。
Copilot と各 Agent がこれらのスキルを理解することで、より正確で効率的な開発支援が可能になります。

---

## 🎯 プロジェクト概要スキル

### プロジェクト構造
**重要:** このプロジェクトは **AI支援型 E2E テスト自動化プラットフォーム** です。

**技術スタック:**
- **フロントエンド**: Vue.js 3 + Vuetify 3 + Vite 6
- **バックエンド**: Spring Boot 3 + MySQL
- **テスト**: Playwright E2E テスト + Allure レポート
- **CI/CD**: GitHub Actions 15 ワークフロー
- **インフラ**: Docker Compose（ローカル + CI環境）

### 主なディレクトリ構造
```
test_app/
├── frontend/          # Vue.js フロントエンド + E2E テスト
├── backend/           # Spring Boot バックエンド
├── infra/             # Docker Compose 設定
├── qa/                # QA・テスト関連資料
├── scripts/           # 自動化スクリプト
└── .github/           # GitHub Actions + Agents
    ├── workflows/     # 15個のワークフロー
    ├── agents/        # 4個の専門 Agent
    └── ISSUE_TEMPLATE/
```

---

## 🤖 AI（Copilot）使用シーン

### 1️⃣ **E2E テスト失敗時の分析・Issue 作成**

**シーン:** E2E テストが失敗

**Copilot の役割:**
- 失敗ログを解析
- 根本原因を特定
- 修正手順を提案
- Issue を自動作成

**使用ワークフロー:**
```
e2e.yml (失敗) 
  → e2e-failure-analysis.yml (Copilot が分析)
    → Issue 自動作成
```

**Copilot に期待される出力:**
```
🐛 E2E Test Failure Analysis
- 失敗テスト: login.spec.ts - "ログイン画面でユーザーが正常にログインできる"
- 失敗原因: セレクタ `[data-testid="username"]` が見つからない
- 根本原因推測: Vue コンポーネント更新で属性が変更された
- 修正案: 
  1. login.vue の data-testid 属性を確認
  2. テストのセレクタを最新に更新
  3. 新しいセレクタで E2E テスト実行
```

---

### 2️⃣ **Issue から自動修正 PR 作成**

**シーン:** Issue が作成される → `ai-fixable` ラベルが付与される

**Copilot の役割:**
- Issue の内容を解析
- 修正案（Fix Brief）を生成
- コード修正を実装
- Draft PR を作成

**使用ワークフロー:**
```
Issue 作成 
  → issue-to-triage.yml (自動分類、ai-fixable ラベル付与)
    → issue-to-fix-brief.yml (修正案生成)
      → issue-to-auto-fix-pr.yml (Copilot が修正実装)
        → Draft PR 自動作成
```

**対象条件（Pilot）:**
- Bug パターン: `frontend-ui-text` (UI テキスト関連)
- 深刻度: `low`, `medium`
- その他: `backend`, `ci-config` 等は現在未対応

**Copilot に期待される出力:**
```
✅ 修正完了
- 修正ファイル: frontend/src/components/Login.vue
- 変更内容: セレクタ属性 data-testid="login-username" → "username-field"
- テスト実行: PASS (4/4 tests)
- Draft PR #42 作成完了
```

---

### 3️⃣ **Dependabot PR テスト失敗時の自動修正**

**シーン:** Dependabot が PR を作成 → テストが失敗

**Copilot の役割:**
- 依存関係の互換性問題を分析
- 修正方法を特定
- コードを修正
- 修正をコミット

**使用ワークフロー:**
```
Dependabot PR 作成 
  → dependabot-label-setup.yml (ラベル付与)
    → PR Quality Checks (テスト実行、失敗)
      → dependabot-auto-fix.yml (Copilot が修正)
        → dependabot-auto-merge.yml (成功時に自動マージ)
```

**修正パターン例:**
```
# パターン1: 依存関係ピニング
undici@^6.0.0 をインストール（jsdom 互換性問題解決）

# パターン2: 依存関係の再インストール
rm -rf node_modules package-lock.json && npm install

# パターン3: Gradle ラッパーの更新
./gradlew wrapper --gradle-version=8.14.3
```

---

### 4️⃣ **週次機能改修の自動実装**

**シーン:** 毎週月曜日 09:00 UTC に自動実行

**Copilot の役割:**
- Issue を検出
- テスト設計・実装
- 機能を実装
- テストを実行
- PR を作成

**使用ワークフロー:**
```
毎週月曜 09:00 UTC
  → weekly-feature-issue.yml (Issue 自動作成)
    → 毎週月曜 10:00 UTC
      → weekly-feature-fix.yml (Copilot が実装、最大3回リトライ)
```

**リトライ戦略:**
- 最大3回まで自動リトライ
- リトライ回数をコメントに記録
- テスト成功時に自動停止

---

## 🛠️ CI/CD パイプラインスキル

### ワークフロー関連性パターン

**パターン1: 定期実行フロー**
```
Weekly Feature Issue → Weekly Feature Fix (最大3回リトライ)
```

**パターン2: Dependabot 自動修正フロー**
```
Dependabot PR → Label Setup → PR Quality Check → Auto-Fix → Notification → Auto-Merge
```

**パターン3: Bug 修正フロー**
```
Issue → Triage → Fix Brief → Auto Fix PR → Human Review → Merge
```

**パターン4: E2E テスト失敗フロー**
```
E2E Test → Failure Analysis → Issue → Triage → Fix Brief → Auto Fix PR
```

### ワークフロー実行権限
- ✅ リポジトリオーナー: すべてのワークフロー実行可能
- ✅ Collaborators（書き込み権限): すべてのワークフロー実行可能
- ❌ 一般の閲覧者: 実行不可

---

## 📝 Copilot が使用すべきツール・言語

### フロントエンド修正時
**対象ファイル:** `frontend/src/**/*.{ts,tsx,vue}`

**技術スタック:**
- フレームワーク: Vue 3 + Composition API
- スタイル: Vuetify 3（Material Design）
- テスト: Playwright (`frontend/tests/e2e/**/*.spec.ts`)

**コード例:**
```typescript
// ✅ Good: Composition API + setup script
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const router = useRouter()

const handleLogin = async () => {
  // ログイン処理
  await router.push('/top')
}
</script>

<template>
  <v-card>
    <v-text-field 
      v-model="username" 
      data-testid="username-field"
      label="ユーザー名"
    />
    <v-btn @click="handleLogin">ログイン</v-btn>
  </v-card>
</template>
```

**E2E テスト例:**
```typescript
// ✅ Good: Playwright E2E テスト
test('ログイン画面でユーザーが正常にログインできる', async ({ page }) => {
  await page.goto('http://localhost:5173/login')
  
  // data-testid で要素を選択（最も安定）
  await page.fill('[data-testid="username-field"]', 'testuser')
  await page.fill('[data-testid="password-field"]', 'password123')
  await page.click('[data-testid="login-button"]')
  
  // ログイン成功を確認
  await expect(page).toHaveURL('http://localhost:5173/top')
})
```

### バックエンド修正時
**対象ファイル:** `backend/src/**/*.java`

**技術スタック:**
- フレームワーク: Spring Boot 3
- ビルド: Gradle
- テスト: JUnit 5

**コード例:**
```java
// ✅ Good: Spring Boot REST Controller
@RestController
@RequestMapping("/api/todos")
@RequiredArgsConstructor
public class TodoController {
    private final TodoService todoService;
    
    @GetMapping
    public ResponseEntity<List<TodoDTO>> getAllTodos() {
        return ResponseEntity.ok(todoService.findAll());
    }
    
    @PostMapping
    public ResponseEntity<TodoDTO> createTodo(@RequestBody TodoDTO dto) {
        TodoDTO created = todoService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
```

### GitHub Actions YAML 修正時
**対象ファイル:** `.github/workflows/*.yml`

**ルール:**
- アクション参照にはバージョンを明示（`@v7` 等）
- シークレットは `${{ secrets.XXXX }}` で参照
- 日本語コメント可

**コード例:**
```yaml
# ✅ Good: GitHub Actions workflow
name: Example Workflow
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:unit
```

---

## ⚠️ よくある修正パターン

### 1. セレクタ問題（E2E テスト失敗）

**症状:**
```
Error: locator([data-testid="old-selector"]) could not resolve
```

**修正手順:**
```typescript
// ❌ Before: 古いセレクタ
await page.click('[data-testid="submit"]')

// ✅ After: 新しいセレクタ（コンポーネント更新後）
await page.click('[data-testid="form-submit-button"]')
```

### 2. 依存関係互換性（Dependabot PR）

**症状:**
```
webidl.util.markAsUncloneable is not a function (jsdom + undici)
```

**修正パターン:**
```bash
# 互換バージョンをピニング
npm install --save-dev undici@^6.0.0
```

### 3. TypeScript コンパイルエラー

**症状:**
```
Type 'string | null' is not assignable to type 'string'
```

**修正パターン:**
```typescript
// ❌ Before: null チェックなし
const name: string = props.name

// ✅ After: null チェック
const name: string = props.name ?? 'default'
```

---

## 🔐 セキュリティ・権限パターン

### シークレット使用場面

| シークレット | 用途 | ワークフロー | 必須/オプション |
|------------|------|-----------|-------------|
| `COPILOT_GITHUB_TOKEN` | GitHub Copilot CLI 認証 | E2E Failure Analysis<br/>Issue to Auto Fix PR<br/>Weekly Feature Fix | **必須** |
| `AUTO_FIX_GITHUB_TOKEN` | Draft PR 作成認証 | Issue to Auto Fix PR | **オプション** |
| `GITHUB_TOKEN` | 標準 API アクセス | すべて（自動提供） | 自動 |

### Copilot による PR 作成時の権限
```
draft PR → 開発者がレビュー → 開発者がマージ
```

**注意:** Copilot が作成した PR は常に **Draft** で、開発者による手動レビュー後にマージされます。

---

## 🧪 テスト・品質パターン

### 必須テスト
```
- フロントエンド: npm run test:unit (Vitest)
- バックエンド: ./gradlew test (JUnit 5)
- E2E: npm run test:e2e (Playwright)
```

### テスト失敗時の Copilot 対応
1. **ログを確認** - 失敗原因を特定
2. **原因を分析** - UI 変更か、ロジック変更か
3. **修正案を提示** - コード例を含める
4. **テスト再実行** - 修正検証

### カバレッジ目標
- フロントエンド: 80%+
- バックエンド: 85%+
- E2E: 主要シナリオをカバー

---

## 📖 参考パターン・テンプレート

### Issue テンプレート

**バグ報告:**
```markdown
## 症状
ログイン画面でボタンが表示されない

## 再現手順
1. ブラウザで http://localhost:5173/login にアクセス
2. 画面を確認
3. 「ログイン」ボタンが見つからない

## 期待動作
「ログイン」ボタンが画面に表示される

## 実際の動作
ボタンが表示されない
```

**機能改修:**
```markdown
## 背景
ユーザーの使いやすさを向上させるため

## 改修内容
- ダークモード対応
- 複数言語対応

## 受け入れ条件
- [ ] ダークモード切り替えボタンが追加される
- [ ] 日本語・英語で表示可能
- [ ] E2E テストが通過
```

---

## 💡 Copilot への最適な指示パターン

### ✅ Good: 具体的で明確
```
Issue #42 の E2E テスト失敗を分析してください。
エラーログ: [ログを含める]
- 失敗テスト: login.spec.ts line 12
- エラーメッセージ: locator not found
修正案を提示し、修正コードを実装してください。
```

### ❌ Bad: 曖昧
```
テストを直してください。
```

### ✅ Good: コンテキスト付き
```
frontend-ui-text バグの修正
- ファイル: frontend/src/components/Login.vue
- セレクタ属性が変更された可能性
- E2E テストのセレクタも更新が必要
修正を実装し、テストを実行してください。
```

---

## 🎓 Copilot学習ガイド

新しい Copilot インスタンスは以下の順で理解する必要があります：

1. **プロジェクト構造** - ディレクトリ・ファイル配置
2. **技術スタック** - 使用言語・フレームワーク
3. **ワークフロー依存性** - 15個のワークフロー間の関係
4. **AI使用シーン** - どこで Copilot が活躍するか
5. **コード規約** - 命名、構造、テスト方法
6. **セキュリティ・権限** - シークレット、アクセス制御

---

**最終更新:** 2026年9月5日
**適用対象:** GitHub Copilot CLI, issue-to-auto-fix-pr.yml, weekly-feature-fix.yml, e2e-failure-analysis.yml
**言語:** 日本語
