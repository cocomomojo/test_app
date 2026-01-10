# AI統合マニュアル自動生成ガイド

## 概要

このガイドでは、PlaywrightでページのDOM内容を解析し、AIに高精度なマニュアルを生成させる方法を説明します。

## 特徴

- ✅ **実画面から情報抽出**: Playwrightで実際のページからボタン名、入力フィールド、テキストを自動取得
- ✅ **AI統合**: GitHub Copilot / Claude に最適化されたプロンプト生成
- ✅ **高精度**: プレースホルダー（〇〇）なし、実画面に基づいた具体的な説明
- ✅ **完全自動化**: スクリプト一発で、解析→プロンプト生成→マニュアル作成まで対応

---

## クイックスタート

### 1. AI統合モードでマニュアル生成

```bash
cd /home/k-mano/test_app/frontend

# AI統合モード（--ai オプション付き）
npm run manual:generate:user -- --feature "ログイン機能" --frontend-url "http://localhost:5173" --ai
```

### 2. 出力されたプロンプトをCopilotに貼り付け

スクリプトが自動生成したプロンプトをGitHub Copilot Chatに貼り付けてください。

### 3. AIが生成したマニュアルを保存

Copilotが出力したMarkdownを以下のパスに保存:

```
wiki/manual/user/02-login-feature-ai-generated.md
```

---

## ワークフロー詳細

### フロー全体

```
1. フロントエンド起動確認
   ↓
2. Playwright でページDOM解析
   ↓
3. ページ情報をJSON出力
   (ボタン名、入力フィールド、リンク、アイコンなど)
   ↓
4. AI用プロンプト自動生成
   ↓
5. プロンプトをCopilotに送信（手動）
   ↓
6. 高精度マニュアル生成完了
   ↓
7. Git コミット & PR作成
```

### ステップ別詳細

#### Step 1: 環境チェック

- Docker, Docker Compose, Node.js のインストール確認
- バックエンド（8080）とフロントエンド（5173 or 5175）の稼働確認

#### Step 2: ディレクトリ準備

- `wiki/manual/screenshots/user/` 作成
- `wiki/manual/user/` 作成

#### Step 3: ページ内容解析（AI統合モードのみ）

スクリプト: `scripts/analyze-page-content.js`

取得情報:
- 見出し（h1〜h6）
- ボタン（button、.v-btn）
- 入力フィールド（input、textarea、.v-text-field）
- リンク（a）
- アイコン（.v-icon、mdi-*）
- テキストコンテンツ（p、li、.v-list-item-title）

出力: `wiki/manual/user-page-analysis.json`

#### Step 4: スクリーンショット撮影

スクリプト: `scripts/capture-manual-screenshots-node.js`

撮影内容:
- ログイン画面
- ダッシュボード
- メニュー・ナビゲーション

出力: `wiki/manual/screenshots/user/*.png`

#### Step 5: AIプロンプト生成

スクリプト: `scripts/generate-manual-with-ai.js`

プロンプト内容:
- 機能名と種別
- 実画面から取得したページ情報
- 生成してほしいマニュアル構成
- 注意事項（プレースホルダー禁止、具体性重視）

出力: 
- ターミナルに表示
- `wiki/manual/prompt-[feature].txt` に保存

#### Step 6: マニュアル生成（AI）

手動ステップ:
1. 生成されたプロンプトをコピー
2. GitHub Copilot Chatに貼り付け
3. Copilotの出力をMarkdownファイルとして保存

#### Step 7: Git操作

通常のワークフローと同様:
- ブランチ作成
- ファイルステージング
- コミット作成

#### Step 8: PR作成

GitHub CLIでPR作成:

```bash
gh pr create \
  --title "docs: ログイン機能の操作マニュアルを追加" \
  --body "AIで生成した高精度マニュアル"
```

---

## スクリプトリファレンス

### 1. analyze-page-content.js

**用途**: ページのDOM内容を解析してJSON出力

**使用方法**:
```bash
NODE_PATH="./frontend/node_modules" \
node scripts/analyze-page-content.js \
  --url "http://localhost:5173" \
  --output "wiki/manual/login-page-analysis.json"
```

**出力例**:
```json
{
  "title": "Test App",
  "url": "http://localhost:5173/login",
  "headings": [],
  "buttons": [
    {"text": "ログイン", "type": "button"}
  ],
  "inputs": [
    {"label": "ユーザ名", "type": "text"},
    {"label": "パスワード", "type": "password"}
  ],
  "links": [
    {"text": "トップ", "href": "/top"}
  ],
  "icons": ["mdi-login"]
}
```

### 2. generate-manual-with-ai.js

**用途**: ページ解析結果からAI用プロンプト生成

**使用方法**:
```bash
node scripts/generate-manual-with-ai.js \
  --feature "ログイン機能" \
  --type "user" \
  --page-data "wiki/manual/login-page-analysis.json"
```

**出力**:
- ターミナルにプロンプト表示
- `wiki/manual/prompt-[feature].txt` に保存

### 3. generate-manual.sh（AI統合モード）

**用途**: 全自動ワークフロー実行

**使用方法**:
```bash
./scripts/generate-manual.sh \
  --feature "ログイン機能" \
  --type "user" \
  --frontend-url "http://localhost:5173" \
  --ai
```

**オプション**:
- `--feature`: 機能名（必須）
- `--type`: マニュアル種別（user / admin）
- `--frontend-url`: フロントエンドURL
- `--ai`: AI統合モード有効化

---

## 生成されるマニュアルの品質

### 通常モード（テンプレートベース）

```markdown
### この機能について
この機能では、〇〇を行うことができます。

### 利用シーン
- シーン1
- シーン2
- シーン3
```

### AI統合モード

```markdown
### この機能について
ログイン機能は、ユーザーが安全にシステムにアクセスするための認証機能です。
ユーザー名とパスワードを入力して「ログイン」ボタンをクリックすることで、
個人のアカウントでシステムを利用できるようになります。

### 利用シーン
- **朝の業務開始時**: 出勤後、システムにアクセスして一日の業務を開始する
- **セッション切れ後の再ログイン**: 長時間操作しなかった場合や、
  セキュリティ上の理由でログアウトされた後、再度システムにアクセスする
- **複数デバイスからのアクセス**: オフィスのPCだけでなく、
  自宅やモバイル端末から同じアカウントでシステムを利用する
```

---

## トラブルシューティング

### ページ解析が失敗する

**症状**: `analyze-page-content.js` がエラーを出す

**原因と対処法**:
- フロントエンドが起動していない → `npm run dev` で起動
- ポート番号が違う → `--frontend-url` で正しいポートを指定
- Playwrightが未インストール → `cd frontend && npm install`

### プロンプトが生成されない

**症状**: `generate-manual-with-ai.js` が何も出力しない

**原因と対処法**:
- ページ解析JSONが見つからない → `--page-data` のパスを確認
- 機能名が指定されていない → `--feature` を必ず指定

### AIが期待通りのマニュアルを生成しない

**症状**: Copilotの出力が不十分

**対処法**:
1. プロンプトに追加要求を記載
   - 例: 「トラブルシューティングをもっと詳しく」
2. ページ解析結果を確認し、不足している要素を手動で補足
3. 生成後に手動で加筆修正

---

## ベストプラクティス

### 1. ページ解析前の準備

- ✅ フロントエンドを起動しておく
- ✅ 対象ページに直接アクセスできるURL確認
- ✅ ログインが必要な場合は、スクリプトに認証ロジック追加

### 2. プロンプトの改善

生成されたプロンプトに以下を追記するとAIの精度が上がります:

```
## 追加要求
- エラーハンドリングの説明を詳しく
- セキュリティ上の注意点を追加
- 実際のユースケースを具体的に
```

### 3. 生成後のレビュー

AIが生成したマニュアルは必ずレビューしてください:

- [ ] ボタン名、入力フィールド名が正確か
- [ ] スクリーンショットパスが正しいか
- [ ] 実際の業務フローと一致しているか
- [ ] セキュリティ上の問題がないか

---

## 🔄 機能変更時のメンテナンス

### アプリケーション画面が変更された場合の対処法

#### 1. ボタン名や入力フィールドが変更された場合

**影響範囲**:
- 既存マニュアル（`wiki/manual/user/*.md`）
- スクリーンショット撮影スクリプト（`scripts/capture-manual-screenshots-node.js`）

**対処方法（推奨）**:

```bash
# AI統合モードで再生成（最も簡単）
npm run manual:generate:user:ai -- --feature "ログイン機能" --frontend-url "http://localhost:5173"

# 1. ページ解析が自動的に新しいボタン名を取得
# 2. 新しいプロンプトでCopilotに再生成
# 3. 既存マニュアルを新しい内容で置き換え
```

**対処方法（手動）**:

```bash
# 既存マニュアルを直接編集
code wiki/manual/user/02-login-feature-ai-generated.md

# 変更例:
# Before: 「ログイン」ボタンをクリックします
# After:  「サインイン」ボタンをクリックします
```

#### 2. 新しいページが追加された場合

**影響範囲**:
- `scripts/capture-manual-screenshots-node.js`
- `scripts/analyze-page-content.js`

**対処方法**:

```bash
# 1. スクリーンショット撮影スクリプトを更新
code scripts/capture-manual-screenshots-node.js
```

**編集例**:

```javascript
// scripts/capture-manual-screenshots-node.js

// 新しいページ「設定画面」を追加
if (manualType === 'admin') {
  console.log('   3. 設定画面');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, manualType, '03-settings.png'),
    fullPage: true,
  });
  console.log('      ✅ 撮影完了: 03-settings.png');
}
```

**ページ解析スクリプトも更新（任意）**:

```javascript
// scripts/analyze-page-content.js
// 特定のページを解析したい場合は、URLを直接指定して実行

const pages = [
  { url: '/login', name: 'ログイン' },
  { url: '/top', name: 'ダッシュボード' },
  { url: '/settings', name: '設定' }, // 新規追加
];
```

#### 3. DOM構造が変更された場合（Vuetifyバージョンアップなど）

**影響範囲**:
- `scripts/analyze-page-content.js`

**対処方法**:

```bash
# 解析スクリプトのセレクタを更新
code scripts/analyze-page-content.js
```

**編集例**:

```javascript
// 変更前（Vuetify 3のクラス名）
document.querySelectorAll('button, [role="button"], .v-btn').forEach(el => {
  // ボタン取得処理
});

// 変更後（新しいバージョンに対応）
document.querySelectorAll('button, [role="button"], .v-btn, .v-button').forEach(el => {
  // ボタン取得処理
});

// 入力フィールドのセレクタも更新
document.querySelectorAll('input, textarea, .v-text-field, .v-input').forEach(el => {
  // 入力フィールド取得処理
});
```

**確認方法**:

```bash
# ページ解析を実行してJSON確認
NODE_PATH="./frontend/node_modules" node scripts/analyze-page-content.js \
  --url "http://localhost:5173" \
  --output "test-analysis.json"

# JSON内容を確認
cat test-analysis.json | jq .

# ボタンや入力フィールドが正しく取得されているか確認
cat test-analysis.json | jq '.buttons, .inputs'
```

#### 4. テンプレートを変更したい場合

**影響範囲**:
- `wiki/manual/templates/user-manual-template.md`
- `wiki/manual/templates/admin-manual-template.md`

**対処方法**:

```bash
# テンプレートを直接編集
code wiki/manual/templates/user-manual-template.md
```

**編集例（新セクション追加）**:

```markdown
## セキュリティ上の注意

### パスワード管理
- パスワードは他人と共有しないでください
- 定期的にパスワードを変更してください
- 推測されやすいパスワードは避けてください

### ログアウト
- 離席時は必ずログアウトしてください
- 共用PCでは自動ログイン機能を無効にしてください
```

**次回生成時から新テンプレートが適用される**:

```bash
npm run manual:generate:user -- --feature "新機能" --frontend-url "http://localhost:5173"
# → 新しいセクション「セキュリティ上の注意」が含まれます
```

---

## 今後の拡張

### 1. GitHub Actionsでのマニュアル作成完全自動化 ⭐⭐

**現状の制限**:
- Issue作成は自動（GitHub Actions）
- マニュアル生成は手動（manual-specialistがローカル実行）

**完全自動化後**:

```
┌─────────────────────────────────────┐
│ Issue作成（自動トリガー）            │
│  - スケジュール: 毎週月曜9:00       │
│  - 手動トリガー: gh workflow        │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ GitHub Actions Workflow（自動実行）  │
│                                     │
│ 1. Docker Composeでサービス起動     │
│    - Backend: 8080                  │
│    - Frontend: 5173                 │
│                                     │
│ 2. Playwright環境構築               │
│    - npx playwright install         │
│                                     │
│ 3. マニュアル生成（通常モード）      │
│    - スクリーンショット撮影         │
│    - テンプレート適用               │
│                                     │
│ 4. Git操作                          │
│    - ブランチ作成                   │
│    - コミット                       │
│                                     │
│ 5. PR自動作成                       │
│    - タイトル・本文自動生成         │
└─────────────────────────────────────┘
             ↓
        PR作成完了！
```

**メリット**:
- ✅ **完全自動化**: Issue → マニュアル生成 → PR作成
- ✅ **作業負荷軽減**: manual-specialistの手動作業不要
- ✅ **定期実行**: 週次で自動的にマニュアル更新
- ✅ **実装可能**: 現在の技術スタックで実現可能

**課題**:
- ⚠️ AI統合モード未対応（Copilot API必要）
- ⚠️ 通常モード（テンプレートベース）のみ
- ⚠️ プレースホルダー（〇〇）が残る
- ⚠️ 対象機能の自動判定が必要

**実装ステップ**:

**Phase 1**: 基本的な自動化
```yaml
# .github/workflows/auto-generate-manual.yml
on:
  issues:
    types: [opened]

jobs:
  generate:
    if: contains(github.event.issue.labels.*.name, 'manual')
    steps:
      - Start services (docker-compose)
      - Generate manual (template mode)
      - Create PR
```

**Phase 2**: Copilot API連携
```yaml
- name: Generate with AI
  run: |
    # Copilot APIで高精度生成
    copilot-api generate-manual \
      --feature "${{ github.event.issue.title }}" \
      --page-data page-analysis.json
```

**Phase 3**: PlaywrightMCP統合
```yaml
- name: AI Agent Mode
  run: |
    # PlaywrightMCPでCopilotが完全自動実行
    mcp-agent generate-manual --interactive
```

**優先度**: 高（現在の技術で実装可能）

---

### 2. PlaywrightMCP統合による完全自動化 ⭐

**現状の制限**:
- 手動ステップが1回必要（プロンプトのコピー＆ペースト）
- Copilot Chatへの手動貼り付けが必要

**PlaywrightMCP統合後**:

```
┌─────────────────────────────────────┐
│ ユーザー:                           │
│ 「ログイン機能のマニュアルを作って」 │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ 🤖 Copilot（完全自動AIエージェント）│
│                                     │
│ 1. mcp_playwright_browser_navigate  │
│    → http://localhost:5173          │
│                                     │
│ 2. mcp_playwright_browser_snapshot  │
│    → ボタン名・入力フィールド取得   │
│                                     │
│ 3. mcp_playwright_browser_take_screenshot │
│    → 画像自動保存                   │
│                                     │
│ 4. マニュアル自動生成               │
│    → 実画面ベースの具体的な説明     │
│                                     │
│ 5. create_file                      │
│    → wiki/manual/user/*.md 保存    │
└─────────────────────────────────────┘
             ↓
        完成！（手動ステップなし）
```

**メリット**:
- ✅ **完全自動化**: 手動ステップ完全排除
- ✅ **対話的改善**: 「もっと詳しく」などリアルタイムで調整可能
- ✅ **動的探索**: ページを巡回しながら情報収集
- ✅ **エラー自動検出**: 画面にエラーがあれば即座に報告

**デメリット**:
- ⚠️ PlaywrightMCPサーバーのセットアップが必要
- ⚠️ MCPプロトコルのサポートが必要
- ⚠️ 対話的処理のため、バッチ処理より遅い
- ⚠️ 環境依存性が増加

**実装案**:
- 詳細は [scripts/generate-manual-with-mcp.md](../../scripts/generate-manual-with-mcp.md) を参照

**現在の選択理由**:
- 通常のPlaywrightで十分な品質を実現
- 手動ステップは1回のみで許容範囲
- 高速で安定した動作
- 環境がシンプル

**優先度**: 中（将来的な検討課題）

---

### 3. 完全自動化（Copilot API連携）

GitHub Copilot APIが一般公開されれば、プロンプト送信→マニュアル生成まで完全自動化できます。

**実装イメージ**:
```javascript
// Copilot APIを直接呼び出し
const response = await copilot.generateManual({
  pageData: analyzedData,
  featureName: "ログイン機能",
  type: "user"
});

fs.writeFileSync(outputFile, response.markdown);
```

### 4. 多言語対応

プロンプトに言語指定を追加することで、英語、中国語などの多言語マニュアル生成も可能です。

**実装イメージ**:
```bash
npm run manual:generate:user:ai -- \
  --feature "Login" \
  --language "en" \
  --frontend-url "http://localhost:5173"
```

### 5. スクリーンショットの自動埋め込み

撮影したスクリーンショットを自動的にマニュアル内の適切な箇所に挿入する機能を追加予定です。

**実装イメージ**:
- AIが操作手順を生成する際、該当するスクリーンショットを自動的に参照
- 画像ファイル名と操作ステップを自動マッピング

---

## まとめ

AI統合モードを使うことで、以下のメリットがあります:

✅ **時間削減**: 手動記入が不要、数分でマニュアル生成  
✅ **高品質**: プレースホルダーなし、実画面に基づいた説明  
✅ **一貫性**: テンプレート構造に従った統一フォーマット  
✅ **保守性**: 画面変更時も再実行で自動更新

ぜひAI統合モードをご活用ください！
