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
├── prompts/
│   └── create-issue.prompt.md         ← カスタムコマンド（4種対応）
└── ...

scripts/
└── create-issue.js                    ← Node.js スクリプト（4種対応）
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

## 💡 ベストプラクティス

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

## 📚 関連ドキュメント

- [GitHub Copilot カスタムコマンド vs カスタムエージェント比較](./12-カスタムコマンドVSカスタムエージェント比較.md)
- [E2E テスト自動生成ガイド](./13-E2Eテスト自動生成ガイド.md)
- [E2E テスト専門エージェントガイド](./14-E2Eテスト専門エージェントガイド.md)

---

## 🎯 まとめ

| 項目 | 説明 |
|------|------|
| **目的** | 4種類のGitHub Issueの自動生成とタスク管理の効率化 |
| **対応Issueタイプ** | 1. E2Eテスト作成<br>2. 操作マニュアル作成<br>3. アプリ機能改修<br>4. エラー解析 |
| **3つの実装方法** | GitHub Actions、CLI/スクリプト、カスタムコマンド |
| **推奨** | GitHub Actions（定期実行）+ カスタムコマンド（手動実行） |
| **効果** | タスク作成の完全自動化、開発効率化、品質向上 |

### 各Issueタイプの特徴

| タイプ | 自動アサイン | 主な用途 | 頻度 |
|--------|-------------|---------|------|
| **E2Eテスト** | ✅ @e2e-test-specialist | テスト自動化 | 週次 |
| **操作マニュアル** | ✅ @manual-specialist | ドキュメント整備 | 月次 |
| **機能改修** | ❌ 手動 | 機能強化・改善 | 随時 |
| **エラー解析** | ❌ 手動 | バグ修正・調査 | 随時 |

このガイドに従うことで、GitHub Issue から実装までのワークフローが効率化され、開発生産性が向上します。

---

**作成日**: 2026年1月  
**最終更新**: 2026年1月10日
