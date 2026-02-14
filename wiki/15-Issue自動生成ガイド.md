# Issue 自動生成ガイド

## 概要

このドキュメントは、GitHub Issue を自動生成するための複数の実装方法を解説します。

GitHub Actions、CLI スクリプト、カスタムコマンドを組み合わせることで、以下の4つのタイプのタスクを自動化できます：

1. **E2E テスト作成**: `@e2e-test-specialist` エージェントへの自動アサインが可能
2. **操作マニュアル作成**: ユーザー・管理者向けマニュアルの自動タスク化
3. **アプリ機能改修**: UI/UX改善、パフォーマンス改善、新機能追加のタスク化
4. **エラー解析**: フロントエンド・バックエンドのエラー分析タスク化

---

## 📍 ファイル配置

```
.github/
├── workflows/
│   └── auto-create-issues.yml         ← GitHub Actions ワークフロー（4種対応）
├── ISSUE_TEMPLATE/
│   ├── e2e-test.yml                   ← E2Eテスト Issue テンプレート
│   ├── manual.yml                     ← 操作マニュアル Issue テンプレート
│   ├── feature.yml                    ← 機能改修 Issue テンプレート
│   └── error-analysis.yml             ← エラー解析 Issue テンプレート
└── prompts/
    └── create-issue.prompt.md         ← カスタムコマンド（4種対応）

scripts/
├── create-issue.js                    ← Issue作成スクリプト（4種対応）
├── analyze-page-content.js            ← ページ分析スクリプト（DOM抽出）
├── generate-screenshot-steps.js       ← AI用スクリーンショット計画プロンプト生成 ★NEW
├── generate-manual-with-ai.js         ← AI用マニュアル生成プロンプト生成 ★NEW
└── capture-manual-screenshots-node.js ← Playwright スクリーンショット撮影（AI計画ベース）

wiki/manual/
├── user-manual-ログイン機能.md        ← 実装済みマニュアル（実例）
├── user-manual-メモ機能.md            ← 実装済みマニュアル（実例） ★NEW
├── screenshot-steps-memo.json         ← AI生成の撮影計画（実例） ★NEW
├── prompt-screenshot-steps-*.txt      ← AI用撮影計画プロンプト（自動保存）
├── prompt-manual-*.txt                ← AI用マニュアル生成プロンプト（自動保存）
├── screenshots/user/                  ← 撮影済みスクリーンショット（PNG）
└── ...
```

---

## 🚀 方法1: GitHub Actions でIssue を自動生成

### 概要

GitHub Actions ワークフローを使い、**スケジュール実行** や **手動トリガー** で4種類のIssueを自動作成します。

### サポートされるIssueタイプ

| タイプ | 説明 | ラベル | アサイン |
|--------|------|--------|----------|
| **e2e-test** | E2Eテスト作成 | test, e2e | @e2e-test-specialist |
| **manual** | 操作マニュアル作成 | documentation, manual | @manual-specialist |
| **feature** | アプリ機能改修 | enhancement, feature | なし |
| **error-analysis** | エラー解析 | bug, error-analysis | なし |

### メリット・デメリット

| 項目 | 説明 |
|------|------|
| ✅ メリット | 完全自動化、運用効率化、スケーラビリティ |
| ❌ デメリット | YAML 編集が必要、トリガーの設計に工数 |
| 推奨用途 | 定期実行、PR連携、大規模自動化 |

### Step 1: Issue テンプレートを作成

4種類のIssueテンプレートを作成します。

#### 1. E2Eテストテンプレート
[`.github/ISSUE_TEMPLATE/e2e-test.yml`]

```yaml
---
name: E2E テスト作成リクエスト
description: E2E テストを自動生成します
labels: ["test", "e2e"]
assignees: ["e2e-test-specialist"]
---

## 機能名
<!-- テスト対象の機能名を記載 -->

## テストシナリオ
- [ ] 正常系: 成功パターン
- [ ] 異常系: エラーハンドリング
- [ ] 境界値テスト

## 受け入れ条件
- [ ] すべてのテストがローカルで成功すること
- [ ] Allure レポートが生成されること
```

#### 2. 操作マニュアルテンプレート
[`.github/ISSUE_TEMPLATE/manual.yml`]

```yaml
---
name: 操作マニュアル作成リクエスト
description: 操作マニュアルを作成します
labels: ["documentation", "manual"]
---

## マニュアル種別
- [ ] ユーザー向けマニュアル
- [ ] 管理者向けマニュアル

## 対象機能
<!-- マニュアルを作成する対象機能を記載 -->

## 受け入れ条件
- [ ] 初心者でも理解できる明確な説明
- [ ] スクリーンショットを適切に配置
```

#### 3. 機能改修テンプレート
[`.github/ISSUE_TEMPLATE/feature.yml`]

```yaml
---
name: アプリ機能改修リクエスト
description: アプリの機能改修を行います
labels: ["enhancement", "feature"]
---

## 改修種別
- [ ] UI/UX改善
- [ ] パフォーマンス改善
- [ ] 新機能追加

## 受け入れ条件
- [ ] 既存機能に影響を与えないこと
- [ ] すべてのテストが成功すること
```

#### 4. エラー解析テンプレート
[`.github/ISSUE_TEMPLATE/error-analysis.yml`]

```yaml
---
name: エラー解析リクエスト
description: エラーの解析と修正を行います
labels: ["bug", "error-analysis"]
---

## エラー種別
- [ ] フロントエンドエラー
- [ ] バックエンドエラー
- [ ] パフォーマンス問題

## 受け入れ条件
- [ ] エラーの根本原因を特定すること
- [ ] 修正案を提示すること
```

### Step 2: GitHub Actions ワークフローを作成

4種類のIssueを自動生成するワークフローを作成します。

[`.github/workflows/auto-create-issues.yml`]

```yaml
name: 自動Issue生成

on:
  schedule:
    # 毎週月曜 09:00 UTC (18:00 JST) に実行
    - cron: '0 9 * * 1'
  workflow_dispatch:  # 手動トリガー
    inputs:
      issue_type:
        description: 'Issueタイプを選択'
        required: true
        type: choice
        options:
          - e2e-test
          - manual
          - feature
          - error-analysis
          - all

jobs:
  create-e2e-test-issue:
    runs-on: ubuntu-latest
    if: github.event.inputs.issue_type == 'e2e-test' || github.event.inputs.issue_type == 'all' || github.event_name == 'schedule'
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: E2E テスト Issue を作成
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh issue create \
            --title "[自動] E2E テスト作成 - $(date +%Y年%m月%d日)" \
            --body "..." \
            --label "test,e2e,auto-generated" \
            --assignee "e2e-test-specialist"

  create-manual-issue:
    runs-on: ubuntu-latest
    if: github.event.inputs.issue_type == 'manual' || github.event.inputs.issue_type == 'all' || github.event_name == 'schedule'
    steps:
      # 操作マニュアル Issue を作成
      ...

  create-feature-issue:
    runs-on: ubuntu-latest
    if: github.event.inputs.issue_type == 'feature' || github.event.inputs.issue_type == 'all' || github.event_name == 'schedule'
    steps:
      # 機能改修 Issue を作成
      ...

  create-error-analysis-issue:
    runs-on: ubuntu-latest
    if: github.event.inputs.issue_type == 'error-analysis' || github.event.inputs.issue_type == 'all' || github.event_name == 'schedule'
    steps:
      # エラー解析 Issue を作成
      ...
```

**実行方法：**
- 毎週月曜 09:00 UTC に全てのIssueタイプを自動実行
- GitHub UI から「Run workflow」で特定のIssueタイプを手動実行可能

### 実行結果

ワークフローが実行されると、GitHub Issues に以下のようなIssueが作成されます：

#### E2Eテストの場合
```
[自動] E2E テスト作成 - 2026年01月10日

## 背景
自動生成されたE2Eテスト作成タスクです。

## 対象機能とテストシナリオ
### ログイン機能
- [ ] 正常系: 正しい認証情報でログイン成功
...

Assignee: @e2e-test-specialist
Labels: test, e2e, auto-generated
```

#### 操作マニュアルの場合
```
[自動] 操作マニュアル作成 - 2026年01月10日

## 背景
自動生成された操作マニュアル作成タスクです。

## 対象機能
### ユーザー向け操作マニュアル
...

Labels: documentation, manual, auto-generated
```

#### 機能改修の場合
```
[自動] アプリ機能改修 - 2026年01月10日

## 背景
自動生成されたアプリ機能改修タスクです。

## 改修対象機能
...

Labels: enhancement, feature, auto-generated
```

#### エラー解析の場合
```
[自動] エラー解析 - 2026年01月10日

## 背景
自動生成されたエラー解析タスクです。

## エラー解析対象
...

Labels: bug, error-analysis, auto-generated
```

---

## 🛠️ 方法2: CLI やスクリプトで Issue を作成

### 概要

GitHub CLI（`gh`）や Node.js スクリプトを使用して、プログラマティックに4種類のIssueを作成します。

### メリット・デメリット

| 項目 | 説明 |
|------|------|
| ✅ メリット | 柔軟なカスタマイズ、開発時の動作確認が容易 |
| ❌ デメリット | 手動実行が基本、スケーリングに工数 |
| 推奨用途 | 手動トリガー、開発効率化、複雑なロジック |

### 方法2-A: GitHub CLI (`gh`) を使う

#### インストール

```bash
# Mac
brew install gh

# Ubuntu/Linux
sudo apt-get install gh

# Windows (Chocolatey)
choco install gh
```

#### 認証

```bash
gh auth login
# ブラウザで認証し、トークンを設定
```

#### 基本的な使い方

```bash
# E2E テスト Issue を作成
gh issue create \
  --title "[自動] E2E テスト作成 - $(date +%Y年%m月%d日)" \
  --body "テスト作成タスクです。" \
  --label "test,e2e,auto-generated" \
  --assignee "e2e-test-specialist"

# 操作マニュアル Issue を作成
gh issue create \
  --title "[自動] 操作マニュアル作成 - $(date +%Y年%m月%d日)" \
  --body "マニュアル作成タスクです。" \
  --label "documentation,manual,auto-generated"

# 機能改修 Issue を作成
gh issue create \
  --title "[自動] アプリ機能改修 - $(date +%Y年%m月%d日)" \
  --body "機能改修タスクです。" \
  --label "enhancement,feature,auto-generated"

# エラー解析 Issue を作成
gh issue create \
  --title "[自動] エラー解析 - $(date +%Y年%m月%d日)" \
  --body "エラー解析タスクです。" \
  --label "bug,error-analysis,auto-generated"
```

### 方法2-B: Node.js スクリプト

#### ファイル配置

[`scripts/create-issue.js`]

```javascript
#!/usr/bin/env node

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Issue タイプの定義
const ISSUE_TYPES = {
  'e2e-test': {
    title: 'E2E テスト作成',
    labels: ['test', 'e2e', 'auto-generated'],
    assignee: 'e2e-test-specialist',
    bodyTemplate: (date) => `## 背景
自動生成されたE2Eテスト作成タスクです。

## 対象機能とテストシナリオ
...

## 受け入れ条件
...
`
  },
  'manual': {
    title: '操作マニュアル作成',
    labels: ['documentation', 'manual', 'auto-generated'],
    assignee: null,
    bodyTemplate: (date) => `## 背景
自動生成された操作マニュアル作成タスクです。
...
`
  },
  'feature': {
    title: 'アプリ機能改修',
    labels: ['enhancement', 'feature', 'auto-generated'],
    assignee: null,
    bodyTemplate: (date) => `## 背景
自動生成されたアプリ機能改修タスクです。
...
`
  },
  'error-analysis': {
    title: 'エラー解析',
    labels: ['bug', 'error-analysis', 'auto-generated'],
    assignee: null,
    bodyTemplate: (date) => `## 背景
自動生成されたエラー解析タスクです。
...
`
  }
};

async function createIssue(type) {
  const config = ISSUE_TYPES[type];

  if (!config) {
    console.error(`❌ 不明なIssueタイプです: ${type}`);
    console.error(`利用可能なタイプ: ${Object.keys(ISSUE_TYPES).join(', ')}`);
    process.exit(1);
  }

  try {
    const date = new Date().toLocaleDateString('ja-JP');
    const title = `[自動] ${config.title} - ${date}`;
    const body = config.bodyTemplate(date);
    const labels = config.labels.join(',');

    let command = `gh issue create \
      --title "${title}" \
      --body "${body}" \
      --label "${labels}"`;

    if (config.assignee) {
      command += ` --assignee "${config.assignee}"`;
    }

    console.log(`📝 ${config.title}のIssue を作成中...`);
    const { stdout } = await execPromise(command);

    console.log(`✅ Issue を作成しました:`);
    console.log(stdout);

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

// コマンドライン引数からIssueタイプを取得
const type = process.argv[2];

if (!type) {
  console.log('使用方法: node scripts/create-issue.js <type>');
  console.log('利用可能なタイプ:');
  Object.keys(ISSUE_TYPES).forEach(key => {
    console.log(`  - ${key}: ${ISSUE_TYPES[key].title}`);
  });
  process.exit(1);
}

createIssue(type);
```

#### 実行方法

```bash
# E2E テスト Issue を作成
node scripts/create-issue.js e2e-test

# 操作マニュアル Issue を作成
node scripts/create-issue.js manual

# 機能改修 Issue を作成
node scripts/create-issue.js feature

# エラー解析 Issue を作成
node scripts/create-issue.js error-analysis
```

#### package.json に登録

```json
{
  "scripts": {
    "create:issue:e2e": "node scripts/create-issue.js e2e-test",
    "create:issue:manual": "node scripts/create-issue.js manual",
    "create:issue:feature": "node scripts/create-issue.js feature",
    "create:issue:error": "node scripts/create-issue.js error-analysis"
  }
}
```

```bash
# npm で実行
npm run create:issue:e2e
npm run create:issue:manual
npm run create:issue:feature
npm run create:issue:error
```

---

## 🤖 方法3: カスタムコマンドで Issue 生成

### 概要

GitHub Copilot のカスタムコマンドを使用して、Chat 内から4種類のIssueを生成します。
### 実装

[`.github/prompts/create-issue.prompt.md`]

```markdown
---
name: create-issue
description: 複数のタイプのGitHub Issueを自動生成する（E2Eテスト、操作マニュアル、機能改修、エラー解析）
tools: [shell, web]
---

# GitHub Issue 自動生成コマンド

## ゴール
4つのタイプのGitHub Issueを自動作成します：
1. **E2E テスト作成**: @e2e-test-specialist エージェントをアサインして自動でテスト実装を開始
2. **操作マニュアル作成**: ユーザー・管理者向けマニュアル作成タスク
3. **アプリ機能改修**: UI/UX改善、パフォーマンス改善、新機能追加タスク
4. **エラー解析**: フロントエンド・バックエンドのエラー分析タスク

## 実行方法

### 1. E2E テスト作成 Issue を生成
\`\`\`bash
gh issue create \
  --title "[自動] E2E テスト作成 - $(date +%Y年%m月%d日)" \
  --body "..." \
  --label "test,e2e,auto-generated" \
  --assignee "e2e-test-specialist"
\`\`\`

### 2. 操作マニュアル作成 Issue を生成
\`\`\`bash
gh issue create \
  --title "[自動] 操作マニュアル作成 - $(date +%Y年%m月%d日)" \
  --body "..." \
  --label "documentation,manual,auto-generated"
\`\`\`

### 3. アプリ機能改修 Issue を生成
\`\`\`bash
gh issue create \
  --title "[自動] アプリ機能改修 - $(date +%Y年%m月%d日)" \
  --body "..." \
  --label "enhancement,feature,auto-generated"
\`\`\`

### 4. エラー解析 Issue を生成
\`\`\`bash
gh issue create \
  --title "[自動] エラー解析 - $(date +%Y年%m月%d日)" \
  --body "..." \
  --label "bug,error-analysis,auto-generated"
\`\`\`

### スクリプトを使う場合
\`\`\`bash
node scripts/create-issue.js <type>
# type: e2e-test, manual, feature, error-analysis
\`\`\`
```

### 使用方法

VS Code の Copilot Chat で：

**E2E テストIssueを作成する場合**
```
@create-issue

E2E テスト作成のIssueを生成してください。
```

**操作マニュアルIssueを作成する場合**
```
@create-issue

操作マニュアル作成のIssueを生成してください。
```

**機能改修Issueを作成する場合**
```
@create-issue

機能改修のIssueを生成してください。
```

**エラー解析Issueを作成する場合**
```
@create-issue

エラー解析のIssueを生成してください。
```

---

## 📊 3つの方法の比較表

| 項目 | GitHub Actions | CLI / スクリプト | カスタムコマンド |
|------|:---:|:---:|:---:|
| **自動度** | 🔴 完全自動 | 🟡 半自動 | 🟡 半自動 |
| **セットアップ難易度** | 中（YAML編集） | 低（Node.js） | 低（Prompt MD） |
| **実行頻度** | 定期実行・イベント駆動 | 手動実行 | 手動実行（Chat） |
| **推奨用途** | 定期実行・大量生成 | 開発効率化 | 対話的実行 |
| **スケーラビリティ** | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| **対応Issueタイプ** | 4種類全て | 4種類全て | 4種類全て |

---

## 🚀 オプション: Local環境での完全自動化（操作マニュアル向け）

操作マニュアル作成の場合のみ、**さらに高度な自動化**が可能です：

### ワンコマンド完全自動化

実践例：TODO機能のユーザー向けマニュアル作成

#### 完全実行フロー

```
🚀 START: GitHub Issue を自動作成
     │
     ├─ 【方法A】Copilot Chat でカスタムコマンド（推奨）
     │   @create-issue → 操作マニュアル作成のIssueを生成してください。
     │   ↓
     ├─ 【方法B】CLI スクリプト直接実行
     │   node scripts/create-issue.js manual
     │   ↓
     └─ 出力: Issue #N 作成（labels: documentation, manual; @manual-specialist アサイン予定）
     │
     ▼
📋 STEP 1: ローカルマニュアル生成準備
     │
     ├─ ユーザー: npm run manual:generate:user:ai -- --feature "ログイン機能"
     │           → スクリーンショット + AI プロンプト生成
     │
     ├─ Copilot/Playwright: ページ自動分析（DOM抽出）
     └─ 出力:
         - wiki/manual/user-page-analysis.json
         - wiki/manual/screenshots/user/01-login.png
         - wiki/manual/screenshots/user/02-dashboard.png
         - wiki/manual/screenshots/user/03-menu.png
         - wiki/manual/prompt-login--.txt
     │
     ▼
🤖 STEP 2: AI による高精度マニュアル生成
     │
     ├─ ユーザー: 【方法A】@file:wiki/manual/prompt-login--.txt でドラッグ&ドロップ
     │            または
     │            【方法B】ファイルをコピーして Copilot Chat に貼り付け
     │
     ├─ Copilot Chat: プロンプト処理
     │              → Markdown マニュアルを生成
     │
     └─ 出力: Markdown マニュアル（ユーザーが保存）
     │
     ▼
💾 STEP 3: ローカルファイル保存
     │
     ├─ ユーザー: Copilot 出力を保存
     │           → wiki/manual/user-manual-ログイン機能.md
     │
     └─ 出力: マニュアルファイル完成
     │
     ▼
🔀 STEP 4: Git 操作とPR作成
     │
     ├─ ユーザー: git checkout -b feature/login-manual-1
     │           git add wiki/manual/user-manual-ログイン機能.md
     │           git add wiki/manual/screenshots/user/
     │           git commit -m "docs: ログイン機能のユーザー向けマニュアル作成"
     │           ↑ Issue 番号は GitHub UI で確認してから PR 作成時に指定
     │
     │           gh pr create --body "Closes #N"
     │                                    ↑ N = 作成した Issue 番号
     │
     └─ GitHub: PR 作成（Closes #N で Issue に自動紐付け・マージ時クローズ）
     │
     ▼
✅ COMPLETE: Issue が PR マージ時に自動クローズ
```

#### 役割分担の詳細

| フェーズ | ユーザー | Copilot | アウトプット |
|---------|---------|---------|-----------|
| **Issue 作成** | @create-issue (Chat)<br>または<br>node scripts/create-issue.js | Issue テンプレート参照 | Issue #N |
| **スクショ + プロンプト** | npm コマンド実行 | DOM 分析・プロンプト生成 | PNG 3枚 + TXT |
| **マニュアル作成** | Prompt ファイル参照<br>（@file: または ドラッグ&ドロップ） | Chat でマニュアル生成 | Markdown |
| **ファイル保存** | ファイル保存・配置 | — | wiki/manual/ |
| **Git/PR** | ブランチ・コミット・PR<br>（Closes #N で自動紐付け） | — | PR（自動クローズ） |

#### セットアップ

```bash
# セットアップ（初回のみ）
cd /home/comojo/test_app
docker-compose -f infra/docker-compose.local.yml up -d
cd frontend && npm run dev &

# ===== ステップ1: Issue 作成 =====
# 方法A: Copilot Chat でカスタムコマンド（推奨）
# @create-issue → 操作マニュアル作成のIssueを生成してください。

# 方法B: CLI スクリプト直接実行
node scripts/create-issue.js manual
# → Issue #N が作成される（N 番号をメモ）

# ===== ステップ2: マニュアル生成（別ターミナル）=====
cd frontend && npm run manual:generate:user:ai -- --feature "ログイン機能"
# → wiki/manual/prompt-login--.txt が生成

# ===== ステップ3: Copilot Chat でマニュアル作成 =====
# 方法A: @file でファイル参照（推奨）
# @file:wiki/manual/prompt-login--.txt の内容を実行してください

# 方法B: ドラッグ&ドロップ
# wiki/manual/prompt-login--.txt をチャット入力欄に D&D

# 方法C: 手動コピー
# cat wiki/manual/prompt-login--.txt でコピーして Copilot Chat に貼り付け

# ===== ステップ4: Git/PR ワークフロー =====
git checkout -b feature/login-manual-1
git add wiki/manual/ scripts/
git commit -m "docs: ログイン機能のユーザー向けマニュアル作成"

# 最新 Issue 番号を確認（方法A）
gh issue list --label manual --state open --limit 5

# または GitHub UI で Issue 番号を確認してから PR 作成
gh pr create --title "docs: ログイン機能のマニュアル作成" --body "Closes #N"
#                                                            ↑ N を置き換え（例: #5）
```

**💡 Tips: Issue 番号が不明な場合**
```bash
# 最新の manual ラベル Issue を確認
gh issue list --label manual --state open | head -1

# または最新作成のIssue
gh issue list --state open | grep "docs\|manual" | head -1
```

### 処理フロー

```
ワンコマンド実行
    ↓
Step 1: 環境チェック（Docker、フロントエンド、バックエンド）
    ↓
Step 2: ディレクトリ準備
    ↓
Step 3: スクリーンショット自動撮影（Playwright）
    ↓
Step 4: マニュアル自動生成（テンプレート + 画像埋め込み）
    ↓
Step 5: Git操作（ブランチ作成、コミット）
    ↓
Step 6: PR作成準備（PR作成コマンド表示）
    ↓
✅ 完了（約3-5分）
```

### 詳細ガイド

詳しくは [自動マニュアル生成スクリプトガイド](../wiki/manual/generate-manual-guide.md) を参照してください。

---

## 🎯 実装ステップ（最小構成）

### Step 1: GitHub Actions ワークフロー追加

```bash
mkdir -p .github/workflows
```

[`.github/workflows/auto-create-issues.yml`]を作成（詳細は上記参照）

### Step 2: Node.js スクリプト追加

```bash
mkdir -p scripts
```

[`scripts/create-issue.js`]を作成（詳細は上記参照）

### Step 3: カスタムコマンド追加

```bash
mkdir -p .github/prompts
```

[`.github/prompts/create-issue.prompt.md`]を作成（詳細は上記参照）

### Step 4: Git にコミット・プッシュ

```bash
git add .github/ scripts/
git commit -m "feat: 4種類のIssue自動生成機能を追加"
git push origin main
```

### Step 5: 動作確認

**GitHub Actionsの場合**
- GitHub リポジトリの **Actions** タブで「Run workflow」から実行

**スクリプトの場合**
```bash
node scripts/create-issue.js e2e-test
node scripts/create-issue.js manual
node scripts/create-issue.js feature
node scripts/create-issue.js error-analysis
```

**カスタムコマンドの場合**
- VS Code の Copilot Chat で `@create-issue` を使用

---

## � 方法4: AI駆動のマニュアル自動生成（実装済み）

### 概要

**新しいワークフロー**として、以下を実装しました：
1. **ページ分析**: Playwright で実DOMを抽出（DOM構造をJSON化）
2. **AI計画**: 撮影計画・マニュアル生成用プロンプトを自動生成＆保存
3. **自動撮影**: Playwright で AI計画に基づきスクリーンショット撮影
4. **自動生成**: Copilot Chat で Markdown マニュアル生成

### メリット

- ✅ プロンプトがファイル保存されるため、Copilot Chat へのコピペが簡単
- ✅ スクリーンショット撮影が自動化（JSON計画ベース）
- ✅ マニュアル生成が大幅に高速化
- ✅ 複数回の修正に対応（JSON を微調整して撮影再実行可能）

### 実装済み機能

#### 1. `generate-screenshot-steps.js`
**目的**: AI用スクリーンショット撮影計画プロンプトを生成

```bash
NODE_PATH="./frontend/node_modules" node scripts/generate-screenshot-steps.js \
  --feature "メモ機能" \
  --type user \
  --page-data wiki/manual/memo-page-analysis.json \
  --save-prompt wiki/manual/prompt-screenshot-steps-メモ機能.txt
```

**出力**:
- `wiki/manual/prompt-screenshot-steps-【feature】.txt`: AI用プロンプト（ファイル保存）
- 端末にも表示（確認用）

**`--save-prompt` オプション**: プロンプトをファイルに自動保存。Copilot Chat へのコピペが簡単に。

#### 2. `capture-manual-screenshots-node.js`
**目的**: AI が生成した JSON計画に基づいてスクリーンショットを自動撮影

```bash
NODE_PATH="./frontend/node_modules" node scripts/capture-manual-screenshots-node.js \
  --screenshot-steps wiki/manual/screenshot-steps-memo.json
```

**入力**: `screenshot-steps-【feature】.json`（AI提案の JSON計画）
```json
{
  "feature": "メモ機能",
  "steps": [
    {
      "stepNumber": 1,
      "filename": "01-memo-login-initial.png",
      "description": "ログイン画面（初期状態）",
      "actions": [
        { "type": "navigate", "target": "http://localhost:5173", ... }
      ]
    },
    ...
  ]
}
```

**出力**: `wiki/manual/screenshots/user/*.png`（複数枚のスクリーンショット）

**特徴**:
- `actions` 配列で各ステップを制御（navigate, fill, click, wait, navigate_to_path）
- ボタンテキストやセレクタを指定可能
- JSON 微調整でクリックタイムアウト等に対応

#### 3. `generate-manual-with-ai.js`
**目的**: AI用マニュアル生成プロンプトを生成

```bash
NODE_PATH="./frontend/node_modules" node scripts/generate-manual-with-ai.js \
  --feature "メモ機能" \
  --type user \
  --page-data wiki/manual/memo-page-analysis.json \
  --save-prompt wiki/manual/prompt-manual-メモ機能.txt
```

**出力**:
- `wiki/manual/prompt-manual-【feature】.txt`: AI用プロンプト（ファイル保存）
- Copilot Chat に貼り付けて Markdown 生成

### 実例: メモ機能マニュアル（Issue #7, PR #8）

| ステップ | 実行内容 | 出力 |
|---------|--------|------|
| 1 | Issue #7 作成 | GitHub Issue #7 |
| 2 | ページ分析 | `wiki/manual/memo-page-analysis.json` |
| 3 | 撮影計画プロンプト生成＆保存 | `wiki/manual/prompt-screenshot-steps-メモ機能.txt` |
| 3-AI | Copilot Chat で JSON計画を生成 | `wiki/manual/screenshot-steps-memo.json` |
| 4 | Playwright でスクリーンショット撮影 | `wiki/manual/screenshots/user/*.png`（7枚成功） |
| 5 | マニュアル生成プロンプト生成＆保存 | `wiki/manual/prompt-manual-メモ機能.txt` |
| 5-AI | Copilot Chat でMarkdown生成 | `wiki/manual/user-manual-メモ機能.md` |
| 6-7 | コミット＆PR作成＆マージ | PR #8 → main マージ → Issue #7 自動クローズ |

**成果物**:
- `wiki/manual/user-manual-メモ機能.md`: メモ機能ユーザー向けマニュアル
- `wiki/manual/screenshot-steps-memo.json`: AI生成の撮影計画
- `wiki/manual/screenshots/user/01-07/*.png`: 撮影済みスクリーンショット（7枚）

### ワークフロー

```
🚀 START: GitHub Issue を作成
   │
   ├─ gh issue create
   └─ 出力: Issue #7
   │
   ▼
📊 ページ分析
   │
   ├─ node scripts/analyze-page-content.js
   └─ 出力: memo-page-analysis.json（DOM構造）
   │
   ▼
📝 撮影計画プロンプト生成
   │
   ├─ node scripts/generate-screenshot-steps.js --save-prompt
   └─ 出力: prompt-screenshot-steps-メモ機能.txt
   │
   ▼
🤖 Copilot Chat で JSON計画を生成
   │
   ├─ @file:prompt-screenshot-steps-メモ機能.txt をドラッグ＆ドロップ
   ├─ 「JSON を返してください」と依頼
   └─ 出力: JSON計画（手動保存 → screenshot-steps-memo.json）
   │
   ▼
📸 自動スクリーンショット撮影
   │
   ├─ node scripts/capture-manual-screenshots-node.js --screenshot-steps
   └─ 出力: *.png（複数枚）
   │
   ▼
📝 マニュアル生成プロンプト生成
   │
   ├─ node scripts/generate-manual-with-ai.js --save-prompt
   └─ 出力: prompt-manual-メモ機能.txt
   │
   ▼
🤖 Copilot Chat で Markdown マニュアル生成
   │
   ├─ @file:prompt-manual-メモ機能.txt をドラッグ＆ドロップ
   ├─ 「Markdown を返してください」と依頼
   └─ 手動保存 → user-manual-メモ機能.md
   │
   ▼
🔀 Git コミット＆PR
   │
   ├─ git add wiki/manual/
   ├─ git commit -m "docs: メモ機能の操作マニュアル..."
   ├─ git commit -m "Closes #7"
   └─ gh pr create
   │
   ▼
✅ PR マージ → Issue #7 自動クローズ
```

### 使用手順（最小限）

参照: [Todo.md のワークフロー](../Todo.md#操作マニュアル作成ワークフロー確立済み)

---

## �💡 ベストプラクティス

### Issue テンプレートの設計

#### E2E テストの場合
✅ **良い例**
```markdown
## 背景
ログイン機能の品質保証のため、E2Eテストを追加する必要があります。

## テストシナリオ
- [ ] 正常系: 正しい認証情報でログイン成功
- [ ] 異常系: 空のユーザ名でエラー表示
- [ ] 異常系: 不正なパスワードでエラー表示

## 受け入れ条件
- すべてのテストがローカルで成功すること
- Allureレポートが生成されること
```

#### 操作マニュアルの場合
✅ **良い例**
```markdown
## 背景
新規ユーザーが迷わず使えるよう、操作マニュアルを整備します。

## 対象機能
- ログイン・ログアウト手順
- TODO管理機能の使い方
- メモ管理機能の使い方

## 成果物
- ユーザー向けマニュアル (Markdown形式)
- スクリーンショット付き手順書
```

#### 機能改修の場合
✅ **良い例**
```markdown
## 改修内容
レスポンシブデザイン対応により、モバイル端末での操作性を向上させます。

## 改修理由
現状、スマートフォンでの表示が崩れており、ユーザビリティが低下しています。

## 期待される効果
- モバイル端末での快適な操作
- ユーザー満足度の向上
```

#### エラー解析の場合
✅ **良い例**
```markdown
## エラー概要
ログイン後にメモ一覧が表示されないエラーが発生しています。

## 再現手順
1. ユーザーIDとパスワードを入力してログイン
2. メモ一覧画面に遷移
3. 画面が空白のまま表示される

## エラーメッセージ
コンソールに "TypeError: Cannot read property 'map' of undefined" が表示
```

❌ **悪い例（全てに共通）**
```markdown
## やってください
```

### スケジュール設定

| 用途 | Cron 式 | 説明 |
|------|--------|------|
| 毎日 | `0 9 * * *` | 毎日 09:00 UTC |
| 毎週 | `0 9 * * 1` | 毎週月曜 09:00 UTC |
| 毎月 | `0 9 1 * *` | 毎月1日 09:00 UTC |

---

## 🔄 推奨される運用フロー

### E2E テスト作成の場合
```
┌─────────────────────────────┐
│ GitHub Actions で定期生成    │
│（毎週月曜 09:00）           │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Issue が自動作成される       │
│ (@e2e-test-specialist代入)  │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ e2e-test-specialist が      │
│ テストコード実装を開始      │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Pull Request を自動作成     │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ コードレビュー              │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ マージ＆本番利用            │
└─────────────────────────────┘
```

### その他のIssueタイプの場合
```
┌─────────────────────────────┐
│ Issue 自動生成              │
│（スケジュール or 手動）     │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ 担当者がアサイン            │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ タスク実行                  │
│（マニュアル作成/改修/解析）│
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Pull Request 作成           │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ レビュー＆マージ            │
└─────────────────────────────┘
```

---

## 🤖 方法5: 機能改修IssueからCopilot自動実装→PR作成（新規）

### 概要

機能改修Issue（`feature` + `auto-generated`）が作成されると、GitHub Actions が自動で Issue に `@copilot` コメントを投稿し、実装と PR 作成を依頼します。

追加済みワークフロー:

- `.github/workflows/feature-auto-implement-pr.yml`

### 実行条件

- Issue に **`feature`** ラベルがある
- Issue に **`auto-generated`** ラベルがある

> 上記2条件を満たすIssueにのみ自動トリガーされます（重複コメント防止あり）。

### 自動化される範囲

- ✅ 担当者が改修依頼
- ✅ Issue 自動生成
- ✅ Copilot への実装依頼コメント自動投稿
- ✅ Copilot による実装・PR 作成（環境設定が有効な場合）
- ✅ 担当者レビュー
- ✅ 担当者マージ

### 前提設定（必須）

1. リポジトリで Copilot のコーディングエージェント機能が利用可能であること
2. `Settings > Actions > General` で Workflow 権限が **Read and write permissions**
3. `main` ブランチ保護（PR 経由のみ、レビュー必須）

### 運用手順（最短）

1. `auto-create-issues.yml` を `issue_type=feature` で実行
2. 生成された Issue に Actions が `@copilot` コメントを投稿
3. Copilot が実装して PR 作成
4. 担当者がレビューしてマージ

---

## 📚 関連ドキュメント

- [GitHub Copilot カスタムコマンド vs カスタムエージェント比較](./12-カスタムコマンドVSカスタムエージェント比較.md)
- [E2E テスト自動生成ガイド](./13-E2Eテスト自動生成ガイド.md)
- [E2E テスト専門エージェントガイド](./14-E2Eテスト専門エージェントガイド.md)
- [**操作マニュアル作成ワークフロー** (Todo.md)](../Todo.md#操作マニュアル作成ワークフロー確立済み)
- [メモ機能マニュアル実例](../wiki/manual/user-manual-メモ機能.md) ← Issue #7, PR #8

---

## 🎯 まとめ

| 項目 | 説明 |
|------|------|
| **目的** | 4種類のGitHub Issueの自動生成とタスク管理の効率化 |
| **対応Issueタイプ** | 1. E2Eテスト作成<br>2. 操作マニュアル作成<br>3. アプリ機能改修<br>4. エラー解析 |
| **実装方法** | GitHub Actions、CLI/スクリプト、カスタムコマンド、AI駆動マニュアル生成、機能改修のCopilot自動実装PR |
| **推奨** | GitHub Actions（定期実行）+ カスタムコマンド（手動実行） |
| **効果** | タスク作成の完全自動化、開発効率化、品質向上 |

### 各Issueタイプの特徴

| タイプ | 自動アサイン | 主な用途 | 頻度 |
|--------|-------------|---------|------|
| **E2Eテスト** | ✅ @e2e-test-specialist | テスト自動化 | 週次 |
| **操作マニュアル** | 月次 |
| **機能改修** | ❌ 手動 | 機能強化・改善 | 随時 |
| **エラー解析** | ❌ 手動 | バグ修正・調査 | 随時 |

このガイドに従うことで、GitHub Issue から実装までのワークフローが効率化され、開発生産性が向上します。

特に **操作マニュアル作成** については、AI駆動の新ワークフロー（方法4）により、従来の手作業を大幅に削減できます。詳しくは [方法4](#-方法4-ai駆動のマニュアル自動生成実装済み) と [Todo.md のワークフロー](../Todo.md#操作マニュアル作成ワークフロー確立済み) を参照してください。

---

**作成日**: 2026年1月
**最終更新**: 2026年1月12日（AI駆動マニュアル生成方法4を追加）
