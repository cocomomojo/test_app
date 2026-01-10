# 自動マニュアル生成スクリプト（generate-manual.sh）

## 概要

Local環境で**ワンコマンド**でマニュアルを完全自動生成するスクリプトです。

GitHub Actionsのワークフローと同じ処理を、Local環境で実行できます。

## 流れ

```
┌─────────────────────────────────────┐
│ ./scripts/generate-manual.sh を実行  │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Step 1: 環境チェック                │
│  ・Docker稼働確認                   │
│  ・フロントエンド稼働確認            │
│  ・バックエンド稼働確認              │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Step 2: ディレクトリ準備             │
│  ・wiki/manual/screenshots/ 作成    │
│  ・wiki/manual/user/ 作成           │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Step 3: スクリーンショット撮影       │
│  ・ブラウザでページをキャプチャ      │
│  ・複数画面を自動撮影                │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Step 4: マニュアル生成               │
│  ・テンプレートをコピー              │
│  ・機能名を自動置換                  │
│  ・スクリーンショットを埋め込み      │
│  ・日付を自動更新                    │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Step 5: Git操作                      │
│  ・ブランチ作成                      │
│  ・ファイルをステージング            │
│  ・コミット作成                      │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Step 6: PR作成準備                   │
│  ・PR作成コマンド表示                │
│  ・手動でPR作成実行                  │
└─────────────────────────────────────┘
```

## セットアップ

### 1. 前提条件確認

```bash
# 必須ツール
docker --version          # Docker
docker-compose --version  # Docker Compose
node --version            # Node.js (v16以上推奨)
npm --version             # npm
git --version             # Git
```

### 2. リポジトリのセットアップ

```bash
cd /home/k-mano/test_app

# Docker環境起動
docker-compose -f infra/docker-compose.local.yml up -d

# フロントエンド依存関係インストール
cd frontend
npm install
```

### 3. スクリプト権限設定

```bash
cd /home/k-mano/test_app
chmod +x scripts/generate-manual.sh
```

## 使用方法

### 基本的な実行方法

```bash
# 直接実行
./scripts/generate-manual.sh --feature "ログイン機能" --type "user"

# npm経由
npm run manual:generate -- --feature "ログイン機能" --type "user"
```

### オプション

| オプション | 説明 | 例 |
|----------|------|-----|
| `--feature` | マニュアル対象の機能名（必須） | `"ログイン機能"` |
| `--type` | マニュアルタイプ（デフォルト: user） | `user` または `admin` |

### 実行例

#### ユーザー向けマニュアル作成

```bash
./scripts/generate-manual.sh --feature "ログイン機能" --type "user"
```

出力：
```
ℹ️  ==========================================
ℹ️  操作マニュアル自動生成ツール
ℹ️  ==========================================
ℹ️  機能名: ログイン機能
ℹ️  マニュアル種別: user
ℹ️  
ℹ️  【Step 1】環境チェック
...
✅ 環境チェック完了
✅ スクリーンショット撮影完了
✅ マニュアルコンテンツ生成完了
...
✅ ========================================
✅ マニュアル自動生成完了！
✅ ==========================================
```

#### 管理者向けマニュアル作成

```bash
./scripts/generate-manual.sh --feature "システム設定" --type "admin"
```

### npm 短縮コマンド

```bash
# ユーザー向け
npm run manual:generate:user -- --feature "TODO管理"

# 管理者向け
npm run manual:generate:admin -- --feature "ユーザー管理"
```

## 生成されるファイル

### マニュアル本体

```
wiki/manual/user/
├── 01-login.md              # ログイン機能
├── 02-todo-management.md    # TODO管理
└── ...

wiki/manual/admin/
├── 01-system-setup.md       # システム設定
├── 02-user-management.md    # ユーザー管理
└── ...
```

### スクリーンショット

```
wiki/manual/screenshots/
├── user/
│   ├── 01-login.png
│   ├── 02-dashboard.png
│   └── ...
└── admin/
    ├── 01-dashboard.png
    └── ...
```

### Git変更

- 新ブランチ作成: `docs/manual-<機能名>-<タイムスタンプ>`
- コミット作成: `docs: <機能名>の操作マニュアルを追加`

## 実行後の確認と次のステップ

### 1. マニュアルプレビュー

```bash
# VS Code でマニュアルを開く
code wiki/manual/user/01-login.md

# Markdown プレビュー表示
# Ctrl+Shift+V でプレビュー
```

### 2. 変更確認

```bash
# Git の変更確認
git status
git diff wiki/manual/user/01-login.md

# スクリーンショット確認
ls -la wiki/manual/screenshots/user/
```

### 3. PR作成

スクリプト実行後、以下が表示されます：

```bash
2. 内容に問題がなければPRを作成
   gh pr create \
     --title "docs: ログイン機能の操作マニュアルを追加" \
     --body "..." \
     --head docs/manual-login-1234567890
```

このコマンドをコピーして実行：

```bash
gh pr create \
  --title "docs: ログイン機能の操作マニュアルを追加" \
  --body "..." \
  --head docs/manual-login-1234567890
```

または対話形式で作成：

```bash
gh pr create
```

### 4. レビュー後にマージ

```bash
# PRが承認されたら
git checkout main
git pull
git merge docs/manual-login-1234567890
git push origin main

# ローカルブランチ削除
git branch -d docs/manual-login-1234567890
```

## トラブルシューティング

### エラー: コマンドが見つかりません

```bash
# スクリプトに実行権限がない場合
chmod +x scripts/generate-manual.sh

# 再実行
./scripts/generate-manual.sh --feature "機能名" --type "user"
```

### エラー: Docker が起動していない

```bash
# Docker 起動
docker-compose -f infra/docker-compose.local.yml up -d

# 確認
docker-compose -f infra/docker-compose.local.yml ps
```

### エラー: フロントエンドが起動していない

```bash
# 別ターミナルでフロントエンド起動
cd frontend
npm install
npm run dev

# http://localhost:5173 でアクセス可能か確認
curl http://localhost:5173
```

### エラー: バックエンド接続エラー

```bash
# ヘルスチェック
curl http://localhost:8080/actuator/health

# ダッシュボードで確認
docker-compose -f infra/docker-compose.local.yml logs backend
```

### エラー: スクリーンショット撮影失敗

```bash
# Playwright が正しくインストールされているか確認
cd frontend
npm list @playwright/test

# 再インストール
npm install @playwright/test
```

## よくある質問

### Q: 毎回フロントエンドを起動する必要がありますか？

**A:** はい。スクリプトはフロントエンドの稼働を確認します。最初に起動すれば、その間に複数回実行可能です。

```bash
# ターミナル1: フロントエンド起動（保持）
cd frontend && npm run dev

# ターミナル2: スクリプト実行（複数回可）
./scripts/generate-manual.sh --feature "機能1" --type "user"
./scripts/generate-manual.sh --feature "機能2" --type "user"
./scripts/generate-manual.sh --feature "管理機能" --type "admin"
```

### Q: スクリプトをカスタマイズできますか？

**A:** はい。以下のファイルを編集可能です：
- `scripts/generate-manual.sh` - メインスクリプト
- `scripts/capture-manual-screenshots-node.js` - スクリーンショット撮影
- `wiki/manual/templates/*.md` - テンプレート

### Q: GitHub Actions との違いは？

| 項目 | Local（generate-manual.sh） | GitHub Actions |
|------|--------------------------|-----------------|
| 実行環境 | ローカル開発環境 | 自動実行環境 |
| トリガー | 手動コマンド実行 | Issue作成or定期 |
| 結果 | ローカルでPR作成 | 自動PR作成 |
| 編集・確認 | リアルタイム可能 | PR経由で確認 |

### Q: PR作成を自動化できますか？

**A:** 可能です。スクリプト最後の PR作成コマンドを自動実行する場合：

```bash
# スクリプト実行後、自動でPR作成
./scripts/generate-manual.sh --feature "ログイン機能" --type "user" && \
gh pr create --title "docs: ログイン機能の操作マニュアルを追加"
```

### Q: マニュアルの内容をカスタマイズしたいです

**A:** スクリプト実行後にマニュアルファイルを手動編集できます：

```bash
./scripts/generate-manual.sh --feature "ログイン機能" --type "user"

# 生成されたファイルを編集
code wiki/manual/user/01-login.md

# 編集後、同じブランチにコミット
git add wiki/manual/user/01-login.md
git commit -m "docs: ログイン機能マニュアルを修正"
```

## 関連ドキュメント

- [マニュアル作成ガイド](./README.md)
- [@manual-specialist エージェント](../../.github/agents/manual-specialist.md)
- [Issue自動生成ガイド](../15-Issue自動生成ガイド.md)

---

**最終更新**: 2026年1月10日
