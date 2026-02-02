# 🚀 Qase導入ガイド

> Vue.js + Spring Boot + Playwright環境向け完全セットアップガイド

## 📋 目次

1. [Qaseとは](#qaseとは)
2. [アカウント作成](#アカウント作成)
3. [プロジェクト設定](#プロジェクト設定)
4. [テストケース作成](#テストケース作成)
5. [自動テスト連携](#自動テスト連携)
6. [CI/CD連携](#cicd連携)
7. [チーム運用](#チーム運用)

---

## 🤔 Qaseとは

```
┌─────────────────────────────────────────────────────────────────┐
│                         Qase の特徴                              │
├─────────────────────────────────────────────────────────────────┤
│  🆓 無料プラン    │ 3ユーザーまで無料                            │
│  🎨 モダンUI      │ 直感的で使いやすいインターフェース           │
│  🔌 豊富な連携    │ Playwright, JUnit, Vitest対応               │
│  📊 レポート機能  │ テスト結果を自動集計・可視化                 │
│  🤖 AI機能        │ テストケース作成をAIがサポート               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📝 Step 1: アカウント作成

### 1-1. Qaseにアクセス

```
🌐 https://qase.io にアクセス
```

### 1-2. サインアップ

```
┌─────────────────────────────────────────┐
│          🔐 Sign Up                      │
├─────────────────────────────────────────┤
│                                         │
│  📧 Email: your-email@example.com       │
│  🔑 Password: ••••••••                  │
│                                         │
│  または                                  │
│                                         │
│  🔵 Sign up with Google                 │
│  ⚫ Sign up with GitHub  ← おすすめ！    │
│                                         │
└─────────────────────────────────────────┘
```

> 💡 **ヒント**: GitHubアカウントでサインアップすると、後のCI/CD連携がスムーズです

### 1-3. ワークスペース作成

| 項目 | 入力例 |
|:-----|:------|
| Workspace name | `MyProject-QA` |
| Workspace URL | `myproject-qa` |

---

## 🏗️ Step 2: プロジェクト設定

### 2-1. 新規プロジェクト作成

```
Dashboard → ＋ Create new project
```

### 2-2. プロジェクト情報入力

| 項目 | 設定値 | 説明 |
|:-----|:------|:-----|
| 📝 Project name | `WebApp Testing` | プロジェクト名 |
| 🔑 Project code | `WAT` | 短縮コード（テストID接頭辞） |
| 📄 Description | `Vue.js + Spring Boot Webアプリのテスト管理` | 説明 |
| 🔒 Access type | `Private` | アクセス権限 |

### 2-3. プロジェクト構成（推奨）

```
📁 WebApp Testing (WAT)
├── 📂 Unit Tests
│   ├── 📂 Frontend (Vitest)
│   │   ├── 📄 Components
│   │   ├── 📄 Composables
│   │   └── 📄 Utils
│   └── 📂 Backend (JUnit)
│       ├── 📄 Controllers
│       ├── 📄 Services
│       └── 📄 Repositories
├── 📂 E2E Tests
│   ├── 📂 Playwright
│   │   ├── 📄 Authentication
│   │   ├── 📄 Dashboard
│   │   └── 📄 CRUD Operations
│   └── 📂 Codeceptjs
├── 📂 Manual Tests
│   ├── 📄 UI/UX確認
│   ├── 📄 受入テスト
│   └── 📄 探索的テスト
└── 📂 Performance Tests
    ├── 📄 負荷テスト
    └── 📄 性能計測
```

---

## ✏️ Step 3: テストケース作成

### 3-1. Suiteの作成（テストをグループ化）

```
Repository → ＋ Create suite
```

| 項目 | 入力例 |
|:-----|:------|
| Suite name | `ログイン機能` |
| Description | `ユーザー認証に関するテストケース` |
| Parent suite | `E2E Tests > Authentication` |

### 3-2. テストケース作成

```
Suite内 → ＋ Create case
```

#### 📝 テストケース例：ログイン成功

| セクション | 項目 | 入力内容 |
|:----------|:-----|:---------|
| **Basic** | Title | ✅ 正常なログイン |
| | Description | 有効な認証情報でログインできること |
| | Severity | 🔴 Critical |
| | Priority | ⬆️ High |
| | Type | ✅ Functional |
| | Automation | 🤖 Automated |
| **Steps** | Step 1 | ログインページにアクセスする |
| | Expected 1 | ログインフォームが表示される |
| | Step 2 | メールアドレスを入力する |
| | Expected 2 | 入力フィールドに値が設定される |
| | Step 3 | パスワードを入力する |
| | Expected 3 | パスワードがマスク表示される |
| | Step 4 | ログインボタンをクリックする |
| | Expected 4 | ダッシュボードに遷移する |

### 3-3. テストケーステンプレート

```markdown
## 🧪 テストケーステンプレート

### 基本情報
- **ID**: WAT-XXX
- **タイトル**: [機能名] - [テスト内容]
- **重要度**: Critical / Major / Normal / Minor
- **優先度**: High / Medium / Low
- **種別**: Functional / Smoke / Regression / Security

### 前提条件
- 条件1
- 条件2

### テストステップ
| # | 操作 | 期待結果 |
|:--|:-----|:---------|
| 1 | XXXする | YYYになる |
| 2 | XXXする | YYYになる |

### テストデータ
| 項目 | 値 |
|:-----|:---|
| ユーザー名 | test@example.com |
| パスワード | Password123! |
```

---

## 🔌 Step 4: 自動テスト連携

### 4-1. APIトークンの取得

```
Settings → API tokens → ＋ Create token
```

| 項目 | 設定値 |
|:-----|:------|
| Token name | `CI/CD Integration` |
| Expiration | `Never` |

> ⚠️ **重要**: トークンは一度しか表示されません！安全な場所に保存してください

### 4-2. Playwright連携

#### パッケージインストール

```bash
cd frontend
npm install -D playwright-qase-reporter
```

#### playwright.config.ts の設定

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // ... 既存の設定

  reporter: [
    ['list'],
    ['html'],
    // 🆕 Qase Reporter追加
    ['playwright-qase-reporter', {
      apiToken: process.env.QASE_API_TOKEN,
      projectCode: 'WAT',
      runComplete: true,
      basePath: 'https://api.qase.io/v1',
      logging: true,
      uploadAttachments: true,
    }]
  ],
});
```

#### テストへのQase IDの付与

```typescript
// tests/login.spec.ts
import { test, expect } from '@playwright/test';

// Qaseのテストケースと紐付け
test('WAT-1 正常なログイン @QaseID=WAT-1', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'Password123!');
  await page.click('[data-testid="login-button"]');
  await expect(page).toHaveURL('/dashboard');
});

// 複数のQase IDに紐付け
test('WAT-2 ログインエラー表示 @QaseID=WAT-2,WAT-3', async ({ page }) => {
  // テスト内容
});
```

#### 環境変数の設定

```bash
# .env.local
QASE_API_TOKEN=your_api_token_here
QASE_PROJECT_CODE=WAT
```

#### テスト実行

```bash
# Qaseにレポート送信しながらテスト実行
QASE_REPORT=1 npx playwright test
```

---

### 4-3. Vitest連携

#### パッケージインストール

```bash
cd frontend
npm install -D qase-vitest
```

#### vite.config.ts の設定

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    reporters: [
      'default',
      // 🆕 Qase Reporter追加
      ['qase-vitest', {
        apiToken: process.env.QASE_API_TOKEN,
        projectCode: 'WAT',
        runComplete: true,
      }]
    ],
  },
});
```

#### テストへのQase IDの付与

```typescript
// src/components/__tests__/LoginForm.spec.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LoginForm from '../LoginForm.vue';

describe('LoginForm', () => {
  // @qaseId でテストケースと紐付け
  it.concurrent('WAT-10 フォームが正しく表示される', async () => {
    // @qaseId WAT-10
    const wrapper = mount(LoginForm);
    expect(wrapper.find('[data-testid="email"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="password"]').exists()).toBe(true);
  });

  it.concurrent('WAT-11 バリデーションエラーが表示される', async () => {
    // @qaseId WAT-11
    const wrapper = mount(LoginForm);
    await wrapper.find('form').trigger('submit');
    expect(wrapper.find('.error-message').exists()).toBe(true);
  });
});
```

---

### 4-4. JUnit連携（Spring Boot）

#### 依存関係追加（build.gradle）

```groovy
dependencies {
    // 既存の依存関係

    // 🆕 Qase JUnit5 Reporter
    testImplementation 'io.qase:qase-junit5-reporter:4.0.0'
}

test {
    useJUnitPlatform()

    // Qase設定
    systemProperty 'QASE_API_TOKEN', System.getenv('QASE_API_TOKEN')
    systemProperty 'QASE_PROJECT_CODE', 'WAT'
    systemProperty 'QASE_RUN_COMPLETE', 'true'
}
```

#### テストへのQase IDの付与

```java
// src/test/java/com/example/controller/AuthControllerTest.java
package com.example.controller;

import io.qase.api.annotation.QaseId;
import io.qase.api.annotation.QaseTitle;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class AuthControllerTest {

    @Test
    @QaseId(100)
    @QaseTitle("正常なログインAPI呼び出し")
    void testLoginSuccess() {
        // テスト実装
        assertThat(result.getStatusCode()).isEqualTo(200);
    }

    @Test
    @QaseId(101)
    @QaseTitle("無効な認証情報でのログイン失敗")
    void testLoginFailure() {
        // テスト実装
        assertThat(result.getStatusCode()).isEqualTo(401);
    }
}
```

---

## 🔄 Step 5: CI/CD連携

### 5-1. GitHub Actions設定

```yaml
# .github/workflows/test.yml
name: Test with Qase Reporting

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  QASE_API_TOKEN: ${{ secrets.QASE_API_TOKEN }}
  QASE_PROJECT_CODE: WAT

jobs:
  # ====================================
  # 🧪 フロントエンド Unit テスト
  # ====================================
  frontend-unit-test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Run Vitest with Qase
        run: npm run test:unit
        env:
          QASE_REPORT: 1

  # ====================================
  # 🧪 バックエンド Unit テスト
  # ====================================
  backend-unit-test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend

    steps:
      - uses: actions/checkout@v4

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          cache: 'gradle'

      - name: Run JUnit with Qase
        run: ./gradlew test
        env:
          QASE_REPORT: 1

  # ====================================
  # 🌐 E2E テスト
  # ====================================
  e2e-test:
    runs-on: ubuntu-latest
    needs: [frontend-unit-test, backend-unit-test]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Playwright
        run: |
          cd frontend
          npm ci
          npx playwright install --with-deps

      - name: Start application
        run: |
          docker-compose -f infra/docker-compose.local.yml up -d
          sleep 30

      - name: Run Playwright with Qase
        run: |
          cd frontend
          npx playwright test
        env:
          QASE_REPORT: 1

      - name: Stop application
        if: always()
        run: docker-compose -f infra/docker-compose.local.yml down
```

### 5-2. GitHub Secretsの設定

```
Repository Settings → Secrets and variables → Actions → New repository secret
```

| Secret Name | Value |
|:------------|:------|
| `QASE_API_TOKEN` | （取得したAPIトークン） |

---

## 👥 Step 6: チーム運用

### 6-1. メンバー招待

```
Workspace Settings → Members → ＋ Invite members
```

### 6-2. ロール設定

| ロール | 権限 | 対象者 |
|:------|:-----|:-------|
| 👑 Owner | 全権限 | プロジェクト責任者 |
| 🔧 Admin | 設定変更可 | QAリード |
| ✏️ Member | テスト実行・編集 | QAエンジニア |
| 👀 Read | 閲覧のみ | 開発者・PM |

### 6-3. テスト実行ワークフロー

```
┌─────────────────────────────────────────────────────────────────┐
│                    📋 テスト実行フロー                           │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────┐     ┌──────────┐     ┌──────────┐
    │ 1️⃣ 計画  │ ──▶ │ 2️⃣ 実行  │ ──▶ │ 3️⃣ 報告  │
    └──────────┘     └──────────┘     └──────────┘
         │               │               │
         ▼               ▼               ▼
    Test Run作成    テスト実施      結果確認
    担当者割当     Pass/Fail記録    レポート出力
    期限設定       欠陥起票         振り返り

```

### 6-4. Test Runの作成

```
Test Runs → ＋ Start new test run
```

| 項目 | 設定例 |
|:-----|:------|
| Title | `Sprint 10 - リリース前テスト` |
| Description | `v2.0.0リリース前の回帰テスト` |
| Environment | `Staging` |
| Milestone | `v2.0.0 Release` |
| Test cases | 対象テストケースを選択 |
| Assignee | 担当者を割り当て |

---

## 📊 レポート・分析

### ダッシュボード

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 Test Run Summary                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ✅ Passed: 85    ❌ Failed: 5    ⏭️ Skipped: 3    🔄 Blocked: 2│
│                                                                  │
│   [████████████████████░░] 89% Complete                         │
│                                                                  │
│   📈 Trend: ↑ 5% improvement from last run                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 欠陥管理との連携

| 連携先 | 設定方法 |
|:------|:---------|
| 🐙 GitHub Issues | Settings → Integrations → GitHub |
| 📋 Jira | Settings → Integrations → Jira |
| 🎯 Azure DevOps | Settings → Integrations → Azure |

---

## 🛠️ トラブルシューティング

### よくある問題と解決策

| 問題 | 原因 | 解決策 |
|:-----|:-----|:-------|
| ❌ APIトークンエラー | トークンが無効 | 新しいトークンを再発行 |
| ❌ テストがQaseに送信されない | 環境変数未設定 | `QASE_REPORT=1`を確認 |
| ❌ テストケースIDが見つからない | ID不一致 | Qase上のIDと一致確認 |
| ❌ CI/CDでエラー | Secretsの設定ミス | GitHub Secrets再確認 |

### デバッグモード

```bash
# 詳細ログを出力
QASE_LOGGING=true QASE_REPORT=1 npx playwright test
```

---

## 🔄 日常運用手順

### 週次テスト管理サイクル

#### 📅 月曜日: 週次計画
```
1. 🎯 優先テストケースの選定
   - Critical/High優先度のテストケースレビュー
   - 前週の失敗テストケース再実行計画

2. 📋 Test Run作成
   - タイトル: "Weekly Regression - Sprint XX"
   - 期限: 金曜日まで
   - 担当者アサイン
```

#### 🔬 火〜木曜日: テスト実行期間
```
1. 👤 担当者別タスク確認
   Dashboard → Assigned to me → Execute pending tests

2. ⚡ テスト実行手順
   - Test Runを開く
   - テストケースを選択
   - 実行状況をリアルタイム更新
   - 失敗時は即座にDefect登録

3. 📊 進捗確認（日次）
   - Test Run進捗率チェック
   - 遅れがある場合は担当者フォロー
```

#### 📈 金曜日: 週次レポート・振り返り
```
1. 🎯 結果サマリー作成
   Reports → Test Run report → Export

2. 🔍 品質分析
   - Pass率分析
   - 失敗傾向の特定
   - カテゴリ別品質確認

3. 💬 チーム振り返り
   - 発見された改善点の共有
   - 来週のテスト計画調整
```

### 月次品質レビュー

#### 第1週: テストケースメンテナンス
```
1. 📋 テストケース監査
   Repository → Test cases → Last executed > 30 days

2. 🔄 古いテストケースの更新
   - 仕様変更に伴う手順修正
   - 期待結果の見直し
   - 不要テストケースの削除/アーカイブ

3. 📝 新規テストケース追加
   - 新機能に対応するテストケース
   - バグ修正に対応する回帰テスト
```

#### 第2-3週: 実行・分析期間
```
1. 🧪 集中テスト実行期間
   - 更新されたテストケースの検証
   - 回帰テストの実行

2. 📊 品質メトリクス収集
   - 欠陥検出率
   - テスト実行効率
   - カバレッジ分析
```

#### 第4週: 改善計画策定
```
1. 📈 月次品質レポート作成
   Reports → Generate monthly report

2. 🎯 改善アクションプラン
   - テストプロセス改善点
   - ツール機能活用改善
   - チームスキル向上計画
```

---

## 🚀 継続的改善手順

### A. テスト効率化

#### 1. 自動化率向上
```bash
# 手動テストの自動化候補特定
# Qase API を使用してメトリクス取得

curl -H "Token: $QASE_API_TOKEN" \
  https://api.qase.io/v1/project/$PROJECT_CODE/case \
  | jq '.result[] | select(.automation == 0 and .priority <= 2)'
```

#### 2. テストデータ最適化
```
1. 📊 実行時間分析
   Reports → Execution time by test case

2. ⚡ 長時間テストの最適化
   - 並列実行可能性検討
   - テストデータの軽量化
   - ステップ統合による効率化

3. 🔄 テスト順序最適化
   - 依存関係の明確化
   - 失敗率の高いテストの優先実行
```

#### 3. CI/CD パイプライン改善
```yaml
# .github/workflows/optimize-qase-integration.yml
name: Optimize Qase Integration

on:
  schedule:
    - cron: '0 6 * * 1'  # 毎週月曜 6時

jobs:
  analyze-test-performance:
    runs-on: ubuntu-latest
    steps:
      - name: Fetch Test Execution Data
        run: |
          # Qase APIから実行データを取得
          curl -H "Token: $QASE_API_TOKEN" \
            "https://api.qase.io/v1/project/$QASE_PROJECT_CODE/run" \
            > execution-data.json

      - name: Analyze Performance
        run: |
          # テスト実行時間の分析
          node analyze-performance.js

      - name: Generate Optimization Report
        run: |
          # 最適化提案レポートを生成
          node generate-optimization-report.js

      - name: Create Issue for Review
        run: |
          gh issue create \
            --title "📊 Weekly Test Performance Analysis" \
            --body-file optimization-report.md \
            --label "qase,optimization"
```

### B. 品質メトリクス向上

#### 1. 欠陥予防分析
```javascript
// scripts/defect-prevention-analysis.js
const qaseAPI = require('./qase-client');

async function analyzeDefectPatterns() {
  // 過去3ヶ月の欠陥データを取得
  const defects = await qaseAPI.getDefects({
    created_after: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  });

  // パターン分析
  const patterns = {
    byComponent: {},
    byCategory: {},
    byPriority: {},
    timeline: {}
  };

  defects.forEach(defect => {
    // コンポーネント別分析
    const component = defect.custom_fields.component;
    patterns.byComponent[component] = (patterns.byComponent[component] || 0) + 1;

    // カテゴリ別分析
    patterns.byCategory[defect.severity] = (patterns.byCategory[defect.severity] || 0) + 1;
  });

  // 予防策提案
  const recommendations = generatePreventionRecommendations(patterns);

  return {
    patterns,
    recommendations,
    summary: {
      totalDefects: defects.length,
      avgPerWeek: defects.length / 12,
      topRiskAreas: Object.entries(patterns.byComponent)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
    }
  };
}
```

#### 2. テストカバレッジ改善
```bash
# テストカバレッジ分析スクリプト
#!/bin/bash

echo "📊 Qase Test Coverage Analysis"
echo "=============================="

# 要件に対するテストカバレッジ
echo "## 📋 Requirement Coverage"
curl -s -H "Token: $QASE_API_TOKEN" \
  "https://api.qase.io/v1/project/$QASE_PROJECT_CODE/case" \
  | jq -r '.result[] | .custom_fields.requirement_id' \
  | sort | uniq -c | sort -nr

# 未テスト機能の特定
echo "## 🚨 Untested Features"
curl -s -H "Token: $QASE_API_TOKEN" \
  "https://api.qase.io/v1/project/$QASE_PROJECT_CODE/case" \
  | jq -r '.result[] | select(.stats.runs_count == 0) | .title'

# カバレッジレポート生成
generate_coverage_report() {
  cat > coverage-report.md << EOF
# 📊 Test Coverage Report $(date +%Y-%m-%d)

## 📈 Overall Metrics
- Total Test Cases: $(curl -s -H "Token: $QASE_API_TOKEN" "https://api.qase.io/v1/project/$QASE_PROJECT_CODE/case" | jq '.result | length')
- Executed Cases: $(curl -s -H "Token: $QASE_API_TOKEN" "https://api.qase.io/v1/project/$QASE_PROJECT_CODE/case" | jq '[.result[] | select(.stats.runs_count > 0)] | length')
- Coverage Rate: $(echo "scale=1; $(curl -s -H "Token: $QASE_API_TOKEN" "https://api.qase.io/v1/project/$QASE_PROJECT_CODE/case" | jq '[.result[] | select(.stats.runs_count > 0)] | length') * 100 / $(curl -s -H "Token: $QASE_API_TOKEN" "https://api.qase.io/v1/project/$QASE_PROJECT_CODE/case" | jq '.result | length')" | bc)%

## 🎯 Recommendations
$(generate_coverage_recommendations)
EOF
}
```

### C. チーム習熟度向上

#### 1. トレーニングプログラム
```
📚 Phase 1: 基礎習得（Week 1-2）
├── Qase基本機能の理解
├── テストケース作成ベストプラクティス
├── CI/CD連携の基本
└── レポート機能の活用

🔧 Phase 2: 実践応用（Week 3-4）
├── 高度なテストケース設計
├── API連携・カスタマイズ
├── 品質メトリクス分析
└── チーム連携ワークフロー

🚀 Phase 3: 最適化・改善（Week 5-6）
├── プロセス改善提案
├── 自動化率向上計画
├── 品質ゲート設定
└── 継続的改善サイクル確立
```

#### 2. 知識共有メカニズム
```
🗓️ 週次 Knowledge Sharing
- 📅 毎週金曜日 30分
- 🎯 テーマ: Qase活用 Tips & Tricks
- 📝 内容: 発見した便利機能、課題解決事例

📖 月次 Best Practice Review
- 📅 月初第1営業日 1時間
- 🔍 内容: 前月の改善事例共有
- 📊 成果: メトリクス改善状況

🏆 四半期 Excellence Award
- 🎖️ 最優秀品質改善提案
- 💡 最革新的活用事例
- 📈 最高品質向上実績
```

#### 3. スキルアセスメント
```markdown
## 🎯 Qase習熟度チェックリスト

### 📊 基礎レベル (必須)
- [ ] テストケース作成・編集
- [ ] Test Run作成・実行
- [ ] 基本レポート作成
- [ ] Defect起票・管理

### 🔧 中級レベル (推奨)
- [ ] カスタムフィールド活用
- [ ] API基本操作
- [ ] CI/CD連携設定
- [ ] 高度なフィルター・検索

### 🚀 上級レベル (オプション)
- [ ] Webhook設定・活用
- [ ] カスタムレポート作成
- [ ] 外部ツール統合
- [ ] プロセス最適化提案
```

これらの手順により、導入後の実際の運用がより効果的になり、継続的な改善を通じて品質向上を実現できます。

---

## 📚 参考リンク

| リソース | URL |
|:---------|:----|
| 📖 Qase公式ドキュメント | https://docs.qase.io |
| 🔌 Playwright連携ガイド | https://docs.qase.io/integrations/playwright |
| 🔌 JUnit連携ガイド | https://docs.qase.io/integrations/junit5 |
| 💬 Qaseコミュニティ | https://community.qase.io |
| 🎥 チュートリアル動画 | https://www.youtube.com/@QaseIO |

---

## ✅ チェックリスト

導入完了の確認に使用してください：

```
□ Qaseアカウント作成
□ プロジェクト作成
□ テストケース作成（最低10件）
□ Playwright連携設定
□ Vitest連携設定
□ JUnit連携設定
□ GitHub Actions設定
□ チームメンバー招待
□ 最初のTest Run実行
□ レポート確認
```

---

> 🎉 **これでQaseの導入は完了です！**
>
> まずは手動テストケースを数件作成し、その後自動テストとの連携を進めていきましょう。
