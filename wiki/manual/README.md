# 操作マニュアル作成ガイド

## 概要

このディレクトリには、アプリケーションの操作マニュアルとそのテンプレート、スクリーンショットが格納されています。

## ディレクトリ構成

```
wiki/manual/
├── README.md                           # このファイル
├── templates/                          # マニュアルテンプレート
│   ├── user-manual-template.md        # ユーザー向けマニュアルのテンプレート
│   └── admin-manual-template.md       # 管理者向けマニュアルのテンプレート
├── user/                               # ユーザー向けマニュアル（作成後）
│   ├── 01-getting-started.md
│   ├── 02-login.md
│   └── ...
├── admin/                              # 管理者向けマニュアル（作成後）
│   ├── 01-system-setup.md
│   └── ...
└── screenshots/                        # スクリーンショット
    ├── user/                           # ユーザー向けスクリーンショット
    └── admin/                          # 管理者向けスクリーンショット
```

## マニュアル作成フロー

### 自動フロー（推奨）

1. **Issue 自動生成**
   ```bash
   # Node.jsスクリプトで生成
   node scripts/create-issue.js manual
   
   # または GitHub Actions で自動生成（毎週月曜日）
   ```

2. **@manual-specialist が自動アサイン**
   - Issue が作成されると自動的に `@manual-specialist` エージェントがアサインされます

3. **エージェントが自動作成**
   - アプリケーションを起動
   - スクリーンショットを撮影
   - テンプレートを使用してマニュアル作成
   - PR を作成

### 手動フロー

#### 1. アプリケーションの起動

```bash
# Docker環境を起動
cd /home/k-mano/test_app
docker-compose -f infra/docker-compose.local.yml up -d

# 起動確認
curl http://localhost:5173  # フロントエンド
curl http://localhost:8080/actuator/health  # バックエンド
```

#### 2. スクリーンショット撮影

**方法A: Playwright MCPを使用（推奨）**

VS Code Copilot Chat で：
```
ブラウザでhttp://localhost:5173を開いて、
ログイン画面のスクリーンショットを
wiki/manual/screenshots/user/01-login.png
として保存してください。
```

**方法B: 自動スクリプトを使用**

```bash
# スクリーンショット一括撮影
cd /home/k-mano/test_app/frontend
npx ts-node ../scripts/capture-manual-screenshots.ts
```

#### 3. マニュアル作成

テンプレートをコピーして編集：

```bash
# ユーザー向けマニュアル
cp wiki/manual/templates/user-manual-template.md \
   wiki/manual/user/01-getting-started.md

# 管理者向けマニュアル
cp wiki/manual/templates/admin-manual-template.md \
   wiki/manual/admin/01-system-setup.md
```

エディタで開いて内容を編集：
- 機能名を記載
- 手順を詳しく記述
- スクリーンショットのパスを設定

#### 4. レビューと確認

- [ ] リンク切れがないか確認
- [ ] スクリーンショットが正しく表示されるか確認
- [ ] 手順通りに操作できるか確認
- [ ] 誤字脱字がないか確認

#### 5. PR作成

```bash
git checkout -b docs/manual-<feature-name>
git add wiki/manual/
git commit -m "docs: <機能名>の操作マニュアルを追加"
git push origin docs/manual-<feature-name>
gh pr create --title "docs: <機能名>の操作マニュアル" \
             --body "Closes #<issue-number>"
```

## テンプレート使用方法

### ユーザー向けマニュアル

[`templates/user-manual-template.md`](templates/user-manual-template.md) には以下のセクションがあります：

- **概要**: 機能の説明
- **前提条件**: 必要な権限や環境
- **基本操作**: 主要な操作手順
- **詳細機能**: 高度な使い方
- **トラブルシューティング**: よくあるエラーと対処法
- **よくある質問**: FAQ

### 管理者向けマニュアル

[`templates/admin-manual-template.md`](templates/admin-manual-template.md) には以下のセクションがあります：

- **概要**: システム管理者の役割
- **システム設定**: 初期セットアップ
- **ユーザー管理**: ユーザー追加・権限管理
- **データ管理**: バックアップ・リストア
- **監視とメンテナンス**: ログ確認・リソース監視
- **トラブルシューティング**: 技術的な問題の解決

## スクリーンショット撮影のベストプラクティス

### 解像度
- **推奨**: 1920x1080（フルHD）
- デスクトップ向けマニュアルの場合

### ファイル形式
- **PNG形式** を使用（圧縮率と品質のバランスが良い）

### ファイル名
- 連番を付ける: `01-login.png`, `02-dashboard.png`
- 機能名を含める: `todo-create-01.png`

### 注釈
- 必要に応じて矢印やハイライトを追加
- 重要なボタンやフィールドを強調

### サイズ最適化
```bash
# ImageMagickで最適化（オプション）
convert input.png -quality 85 -resize 1920x output.png
```

## 必要なツール

### 必須
- ✅ **Docker / Docker Compose**: アプリ起動に必要
- ✅ **Playwright / Playwright MCP**: スクリーンショット撮影に推奨
- ✅ **Markdownエディタ**: VS Code など

### オプション
- **ImageMagick**: 画像編集・最適化
- **draw.io / Excalidraw**: 図の作成
- **OBS Studio**: 動画チュートリアル作成

## よくある質問

### Q: アプリが起動しない
**A:** 以下を確認してください：
```bash
# Dockerが起動しているか
docker ps

# ポートが使用中でないか
sudo lsof -i :5173
sudo lsof -i :8080

# ログを確認
docker-compose -f infra/docker-compose.local.yml logs
```

### Q: スクリーンショットが撮れない
**A:** Playwright MCPが利用可能か確認してください：
```bash
# frontendディレクトリで
npx playwright install
```

### Q: 既存のマニュアルを更新したい
**A:** 以下の手順で：
1. 該当ファイルを編集
2. 変更履歴セクションに記録
3. PRを作成

### Q: マニュアルに動画を含めたい
**A:** 以下の方法があります：
- YouTubeなどにアップロードしてリンク
- GIFアニメーションに変換して埋め込み
- `<video>` タグで埋め込み（GitHubでは制限あり）

## 関連ドキュメント

- [Issue自動生成ガイド](../15-Issue自動生成ガイド.md)
- [@manual-specialist エージェント](../../.github/agents/manual-specialist.md)
- [スクリーンショット撮影スクリプト](../../scripts/capture-manual-screenshots.ts)

---

**作成日**: 2026年1月10日  
**最終更新**: 2026年1月10日
