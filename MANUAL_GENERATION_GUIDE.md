# 📖 操作マニュアル自動生成 - クイックリファレンス

## 🎯 概要

このプロジェクトでは、**3つの方法**で操作マニュアルを自動生成できます：

1. **通常モード（テンプレートベース）** - 基本的なマニュアルを数分で生成
2. **AI統合モード（推奨）** - 画面から情報を抽出し、高精度なマニュアルを自動生成
3. **GitHub Actions** - Issue作成から自動的にマニュアル生成

---

## ⚡ クイックスタート

### 最速！AI統合モードで生成

```bash
# 1. フロントエンド起動（別ターミナル）
cd /home/k-mano/test_app/frontend
npm run dev

# 2. マニュアル生成実行
npm run manual:generate:user:ai -- --feature "ログイン機能" --frontend-url "http://localhost:5173"

# 3. 出力されたプロンプトをGitHub Copilot Chatに貼り付け

# 4. Copilotが生成したマニュアルをファイルに保存
```

**所要時間: 約5分で完成！**

---

## 📚 使い方（3つのモード）

### 1️⃣ 通常モード（テンプレートベース）

基本的なテンプレートから手動で編集するマニュアルを生成します。

```bash
# ユーザー向け
npm run manual:generate:user -- --feature "ログイン機能" --frontend-url "http://localhost:5173"

# 管理者向け
npm run manual:generate:admin -- --feature "システム設定" --frontend-url "http://localhost:5173"
```

**生成内容**:
- ✅ テンプレートをコピー
- ✅ 機能名を自動置換
- ✅ スクリーンショット撮影
- ✅ 日付を自動更新
- ⚠️ プレースホルダー（〇〇など）は手動で埋める必要あり

---

### 2️⃣ AI統合モード（推奨・高精度）

画面から情報を自動抽出し、AIが具体的な説明を生成します。

```bash
# ユーザー向け（AI統合）
npm run manual:generate:user:ai -- --feature "ログイン機能" --frontend-url "http://localhost:5173"

# 管理者向け（AI統合）
npm run manual:generate:admin:ai -- --feature "システム設定" --frontend-url "http://localhost:5173"
```

**生成フロー**:

```
1. Playwrightでページ解析
   → ボタン名、入力フィールド、リンクなど抽出
   ↓
2. スクリーンショット撮影
   → 画像ファイル保存
   ↓
3. AI用プロンプト自動生成
   → GitHub Copilot用に最適化
   ↓
4. プロンプトをCopilotに貼り付け（手動）
   ↓
5. AIが高精度マニュアル生成
   → プレースホルダーなし、実画面に基づいた説明
   ↓
6. 生成されたMarkdownを保存
```

**特徴**:
- ✅ **プレースホルダーなし**: 「〇〇」などの手動編集不要
- ✅ **実画面ベース**: 実際のボタン名や入力フィールド名を自動引用
- ✅ **高精度な利用シーン**: AIが具体的な使用例を生成
- ✅ **詳細なトラブルシューティング**: 実際のエラーメッセージ例を含む

**詳細**: [AI統合ガイド](wiki/manual/ai-integration-guide.md)

---

### 3️⃣ GitHub Actions（完全自動）

Issue作成から自動的にマニュアル生成まで実行します。

```bash
# Issueを作成
node scripts/create-issue.js manual

# または GitHub Actions で自動生成（毎週月曜日9:00 JST）
# .github/workflows/auto-create-issues.yml が自動実行
```

**自動処理**:
1. Issue自動作成（`@manual-specialist` に自動アサイン）
2. スクリーンショット撮影
3. マニュアル生成
4. PR自動作成

---

## 🔧 実行フロー詳細

### AI統合モードの内部処理

```
┌─────────────────────────────────────┐
│ npm run manual:generate:user:ai     │
└────────────┬────────────────────────┘
             ▼
┌─────────────────────────────────────┐
│ Step 1: 環境チェック                │
│  ✅ Docker稼働確認                  │
│  ✅ バックエンド稼働確認(8080)      │
│  ✅ フロントエンド稼働確認(5173)    │
└────────────┬────────────────────────┘
             ▼
┌─────────────────────────────────────┐
│ Step 2: ディレクトリ準備             │
│  📁 wiki/manual/screenshots/user/   │
│  📁 wiki/manual/user/               │
└────────────┬────────────────────────┘
             ▼
┌─────────────────────────────────────┐
│ Step 3: ページ内容解析（AI専用）     │
│  🔍 Playwrightで画面解析            │
│  📊 JSON出力:                       │
│     - ボタン名リスト                │
│     - 入力フィールドリスト          │
│     - リンクリスト                  │
│     - アイコンリスト                │
│     - テキストコンテンツ            │
└────────────┬────────────────────────┘
             ▼
┌─────────────────────────────────────┐
│ Step 4: スクリーンショット撮影       │
│  📸 ログイン画面                    │
│  📸 ダッシュボード                  │
│  📸 メニュー/ナビゲーション          │
└────────────┬────────────────────────┘
             ▼
┌─────────────────────────────────────┐
│ Step 5: AIプロンプト生成             │
│  🤖 ページ解析結果を元に            │
│  📝 Copilot用プロンプト生成         │
│  💾 wiki/manual/prompt-*.txt保存    │
│  📺 ターミナルに表示                │
└────────────┬────────────────────────┘
             ▼
┌─────────────────────────────────────┐
│ 👤 手動ステップ:                    │
│  1. プロンプトをコピー              │
│  2. GitHub Copilot Chatに貼り付け  │
│  3. 生成されたマニュアルを保存      │
└─────────────────────────────────────┘
```

---

## 🔄 機能変更時のメンテナンス

### 画面の変更が発生した場合

アプリケーションの画面や機能が変更された場合、以下を更新してください。

#### 1. ボタン名や入力フィールドが変更された場合

**影響範囲**:
- `scripts/capture-manual-screenshots-node.js` - スクリーンショット撮影スクリプト
- 既存のマニュアル（`wiki/manual/user/*.md`）

**対処方法**:

```bash
# 1. AI統合モードで再生成
npm run manual:generate:user:ai -- --feature "ログイン機能" --frontend-url "http://localhost:5173"

# 2. 新しいプロンプトでCopilotに再生成させる

# 3. 既存マニュアルを新しい内容で置き換える
```

**または手動で修正**:

```bash
# 既存マニュアルを直接編集
code wiki/manual/user/02-login-feature-ai-generated.md

# 変更箇所:
# - ボタン名: 「ログイン」→「サインイン」など
# - 入力フィールド名: 「ユーザ名」→「メールアドレス」など
```

#### 2. 新しいページが追加された場合

**対処方法**:

```bash
# 1. スクリーンショット撮影スクリプトを更新
code scripts/capture-manual-screenshots-node.js

# 2. 新しいページの撮影ロジックを追加
```

**編集例**:

```javascript
// scripts/capture-manual-screenshots-node.js

// 新しいページ「設定画面」を追加
console.log('   4. 設定画面');
await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
await page.screenshot({
  path: path.join(SCREENSHOT_DIR, manualType, '04-settings.png'),
  fullPage: true,
});
console.log('      ✅ 撮影完了: 04-settings.png');
```

#### 3. DOM構造が変更された場合（Vuetifyバージョンアップなど）

**影響範囲**:
- `scripts/analyze-page-content.js` - ページ解析スクリプト

**対処方法**:

```bash
# 1. 解析スクリプトのセレクタを更新
code scripts/analyze-page-content.js
```

**編集例**:

```javascript
// 変更前（Vuetify 3）
document.querySelectorAll('.v-btn').forEach(...)

// 変更後（新しいクラス名に対応）
document.querySelectorAll('.v-btn, .custom-button').forEach(...)
```

#### 4. テンプレートを変更したい場合

**影響範囲**:
- `wiki/manual/templates/user-manual-template.md`
- `wiki/manual/templates/admin-manual-template.md`

**対処方法**:

```bash
# 1. テンプレートを直接編集
code wiki/manual/templates/user-manual-template.md

# 2. 新しいセクションを追加
## セキュリティ上の注意
...

# 3. 次回生成時から新テンプレートが適用される
npm run manual:generate:user -- --feature "新機能" --frontend-url "http://localhost:5173"
```

---

## 📋 チェックリスト

### 初回セットアップ時

- [ ] Docker Desktop インストール済み
- [ ] Node.js (v18以上) インストール済み
- [ ] フロントエンド依存関係インストール済み（`cd frontend && npm install`）
- [ ] バックエンド起動済み（`docker-compose -f infra/docker-compose.local.yml up -d`）
- [ ] フロントエンド起動済み（`npm run dev`）
- [ ] ポート確認（5173 or 5175）

### マニュアル生成前

- [ ] フロントエンドが正常に動作している（`curl http://localhost:5173` → 200 OK）
- [ ] バックエンドが正常に動作している（`curl http://localhost:8080/actuator/health` → 200 OK）
- [ ] 対象機能がブラウザでアクセス可能

### AI統合モード使用時

- [ ] GitHub Copilot が有効になっている
- [ ] ページ解析JSONが正常に生成されている（`wiki/manual/*-page-analysis.json`）
- [ ] スクリーンショットが撮影されている（`wiki/manual/screenshots/user/*.png`）
- [ ] プロンプトが表示されている（ターミナルまたは `wiki/manual/prompt-*.txt`）

### マニュアル生成後

- [ ] Markdownファイルが生成されている（`wiki/manual/user/*.md`）
- [ ] スクリーンショットパスが正しい
- [ ] 機能名が正しく置換されている
- [ ] 日付が今日の日付になっている
- [ ] リンク切れがない
- [ ] ブランチが作成されている
- [ ] コミットが作成されている

---

## 🚨 トラブルシューティング

### Q1. フロントエンドが5173で起動しない

**A**: Viteは5173が使用中の場合、自動的に5175に切り替わります。

```bash
# 実際のポートを確認
curl http://localhost:5173  # 失敗する場合
curl http://localhost:5175  # こちらが成功する場合、5175を使用

# マニュアル生成時に正しいポートを指定
npm run manual:generate:user:ai -- --feature "ログイン機能" --frontend-url "http://localhost:5175"
```

### Q2. Playwrightでエラーが出る

**A**: NODE_PATHの設定を確認してください。

```bash
# frontendディレクトリから実行する場合は不要
cd frontend
npm run manual:generate:user:ai -- --feature "ログイン機能"

# プロジェクトルートから実行する場合はNODE_PATH設定が必要
NODE_PATH="./frontend/node_modules" ./scripts/generate-manual.sh --ai --feature "ログイン機能"
```

### Q3. スクリーンショットが撮れない

**A**: ページのセレクタが変更されている可能性があります。

```bash
# 1. 手動でページを確認
# ブラウザで http://localhost:5173 にアクセスして正常に表示されるか確認

# 2. スクリプトのセレクタを更新
code scripts/capture-manual-screenshots-node.js

# 3. Playwright Inspector でデバッグ
PWDEBUG=1 node scripts/capture-manual-screenshots-node.js --type user
```

### Q4. AIプロンプトが表示されない

**A**: ページ解析JSONファイルが生成されているか確認してください。

```bash
# JSON生成確認
ls -la wiki/manual/*-page-analysis.json

# 手動でページ解析を実行
NODE_PATH="./frontend/node_modules" node scripts/analyze-page-content.js \
  --url "http://localhost:5173" \
  --output "wiki/manual/test-analysis.json"

# JSON内容確認
cat wiki/manual/test-analysis.json | jq .
```

---

## 📖 関連ドキュメント

- **[AI統合ガイド](wiki/manual/ai-integration-guide.md)** - AI統合モードの詳細説明
- **[generate-manual.sh ガイド](wiki/manual/generate-manual-guide.md)** - スクリプトの詳細仕様
- **[マニュアル作成ガイド](wiki/manual/README.md)** - 全体の概要
- **[Issue自動生成ガイド](wiki/15-Issue自動生成ガイド.md)** - GitHub Actions統合

---

## 🚀 今後の課題・拡張

### 1. GitHub Actionsでのマニュアル作成完全自動化 ⭐

**現状**: Issue作成は自動、マニュアル生成は手動

```
✅ Issue自動作成（毎週月曜 or 手動）
   ↓
✅ @manual-specialistへ自動アサイン
   ↓
❌ 手動: manual-specialistがローカルでスクリプト実行
   ↓
❌ 手動: PR作成・レビュー
```

**目標**: Issue作成 → マニュアル生成 → PR作成まで完全自動化

```yaml
# .github/workflows/auto-generate-manual.yml（実装案）

name: Auto Generate Manual

on:
  issues:
    types: [opened]

jobs:
  generate-manual:
    if: contains(github.event.issue.labels.*.name, 'manual')
    runs-on: ubuntu-latest
    
    steps:
      # 1. サービス起動（Docker Compose）
      - name: Start Services
        run: |
          docker-compose -f infra/docker-compose.ci.yml up -d
          cd frontend && npm install && npm run build
          npx serve -s dist -l 5173 &
      
      # 2. Playwright環境構築
      - name: Setup Playwright
        run: cd frontend && npx playwright install --with-deps
      
      # 3. マニュアル生成（通常モード）
      - name: Generate Manual
        run: |
          npm run manual:generate:user -- \
            --feature "ログイン機能" \
            --frontend-url "http://localhost:5173"
      
      # 4. PR自動作成
      - name: Create PR
        run: |
          git checkout -b docs/auto-manual-$(date +%s)
          git add wiki/manual/
          git commit -m "docs: 自動生成マニュアル追加"
          gh pr create --title "マニュアル自動生成" --body "Issueから自動生成"
```

**メリット**:
- ✅ Issue作成からPR作成まで完全自動
- ✅ manual-specialistの作業負荷軽減
- ✅ 定期的な自動実行が可能

**課題**:
- ⚠️ AI統合モードは使えない（Copilot API未対応）
- ⚠️ 通常モード（テンプレートベース）のみ
- ⚠️ プレースホルダー（〇〇）が残る
- ⚠️ CI環境でのフロントエンド起動が必要
- ⚠️ 対象機能をIssue本文から自動抽出する仕組みが必要

**段階的実装案**:
1. **Phase 1**: 通常モードの自動化（テンプレートベース）
2. **Phase 2**: Copilot API連携でAI統合モード対応
3. **Phase 3**: PlaywrightMCP統合で高精度化

**優先度**: 高（実装可能な状態）

---

### 2. PlaywrightMCP統合による完全自動化 ⭐

**現状**: プロンプトのコピペが必要（手動ステップ1回）

**目標**: Copilotが完全なAIエージェントとして全自動実行

```
ユーザー: 「ログイン機能のマニュアルを作って」
↓
Copilot（AIエージェント）:
  1. PlaywrightMCPでブラウザ起動
  2. ページ内容を自動取得（snapshot）
  3. スクリーンショット自動撮影
  4. マニュアル自動生成
  5. ファイル自動保存
↓
完成！（手動ステップなし）
```

**メリット**:
- ✅ 手動ステップ完全排除
- ✅ 対話的に改善可能（「もっと詳しく」など）
- ✅ リアルタイムでページ探索

**課題**:
- ⚠️ PlaywrightMCPサーバーのセットアップが必要
- ⚠️ 環境依存性が増加
- ⚠️ 対話的なため、バッチ処理より遅い

**実装案**: [scripts/generate-manual-with-mcp.md](scripts/generate-manual-with-mcp.md)

**優先度**: 中（将来的な検討課題）

---

### 3. 完全自動化（Copilot API連携）

GitHub Copilot APIが一般公開されれば、プロンプト送信からマニュアル生成まで完全自動化可能。

### 4. 多言語対応

プロンプトに言語指定を追加することで、英語、中国語などの多言語マニュアル生成。

### 5. スクリーンショットの自動埋め込み

撮影したスクリーンショットを自動的にマニュアル内の適切な箇所に挿入。

---

## 🎓 学習リソース

### 初めての方

1. **[クイックスタート](wiki/02-クイックスタート.md)** - プロジェクト全体の理解
2. **通常モードで試す** - テンプレートベースのマニュアル生成
3. **AI統合モードで試す** - 高精度マニュアル生成
4. **GitHub Actionsで自動化** - Issue作成から自動生成

### 上級者向け

- Playwrightスクリプトのカスタマイズ
- AI プロンプトの最適化
- テンプレートの拡張
- GitHub Actions ワークフローの改善
- PlaywrightMCP統合の検討

---

## 💡 ベストプラクティス

### マニュアル生成時

1. **常にAI統合モードを使用**: 高精度で時間短縮
2. **フロントエンドを最新状態に**: 画面変更を反映
3. **プロンプトをカスタマイズ**: 必要に応じて追加要求を記載
4. **生成後は必ずレビュー**: AIの出力を確認・修正

### メンテナンス時

1. **画面変更時は即座に再生成**: 古いマニュアルは混乱の元
2. **テンプレートは定期的に見直し**: プロジェクトの成長に合わせて更新
3. **スクリーンショットは最新に保つ**: 画面変更があれば即座に再撮影
4. **バージョン管理**: Gitブランチで変更履歴を管理

---

**更新日**: 2026年1月10日  
**バージョン**: 1.0
