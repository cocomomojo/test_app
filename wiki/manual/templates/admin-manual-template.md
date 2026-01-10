# [システム名] 管理者マニュアル

## 目次
1. [概要](#概要)
2. [システム設定](#システム設定)
3. [ユーザー管理](#ユーザー管理)
4. [データ管理](#データ管理)
5. [バックアップとリストア](#バックアップとリストア)
6. [監視とメンテナンス](#監視とメンテナンス)
7. [トラブルシューティング](#トラブルシューティング)

---

## 概要

### 管理者の役割
このマニュアルは、システム管理者向けの技術的な操作手順を説明します。

### 前提知識
- Linux コマンドの基本操作
- Docker / Docker Compose の基礎知識
- ネットワークの基礎知識

---

## システム設定

### 初期セットアップ

#### 1. 環境構築

```bash
# リポジトリのクローン
git clone https://github.com/your-org/test_app.git
cd test_app

# Docker環境の起動
docker-compose -f infra/docker-compose.local.yml up -d
```

![Docker起動確認](screenshots/admin/setup-01.png)

#### 2. 環境変数の設定

`.env` ファイルを編集します：

```bash
# データベース設定
DB_HOST=localhost
DB_PORT=5432
DB_NAME=testapp
DB_USER=admin
DB_PASSWORD=secure_password

# アプリケーション設定
APP_ENV=production
APP_PORT=8080
```

#### 3. 起動確認

```bash
# ヘルスチェック
curl http://localhost:8080/actuator/health

# レスポンス例
{
  "status": "UP"
}
```

---

## ユーザー管理

### ユーザーの追加

#### 手順
1. 管理画面にログイン
   
   ![管理画面ログイン](screenshots/admin/user-mgmt-01.png)

2. 「ユーザー管理」メニューを選択
   
   ![ユーザー管理メニュー](screenshots/admin/user-mgmt-02.png)

3. 「新規ユーザー追加」をクリック
   
   ![新規ユーザー追加](screenshots/admin/user-mgmt-03.png)

4. 必要な情報を入力
   - **ユーザーID**: 半角英数字
   - **氏名**: フルネーム
   - **メールアドレス**: 有効なメールアドレス
   - **権限**: 適切な権限レベルを選択

5. 「登録」ボタンをクリック

---

### ユーザー権限の変更

#### 権限レベル

| 権限 | 説明 | できること |
|------|------|-----------|
| **Admin** | システム管理者 | 全ての操作 |
| **User** | 一般ユーザー | データの閲覧・編集 |
| **Guest** | ゲスト | データの閲覧のみ |

#### 変更手順
1. ユーザー一覧から対象ユーザーを選択
2. 「権限変更」をクリック
3. 新しい権限レベルを選択
4. 「更新」をクリック

---

## データ管理

### データベースのバックアップ

#### 自動バックアップの設定

```bash
# バックアップスクリプトの配置
cp scripts/backup.sh /usr/local/bin/

# cron設定（毎日午前3時に実行）
crontab -e
```

crontab に以下を追加：
```
0 3 * * * /usr/local/bin/backup.sh
```

#### 手動バックアップ

```bash
# PostgreSQLのバックアップ
docker exec postgres pg_dump -U admin testapp > backup_$(date +%Y%m%d).sql

# バックアップの確認
ls -lh backup_*.sql
```

---

### データのリストア

```bash
# リストアの実行
docker exec -i postgres psql -U admin testapp < backup_20260110.sql

# リストア後の確認
docker exec postgres psql -U admin -d testapp -c "SELECT COUNT(*) FROM users;"
```

---

## バックアップとリストア

### 完全バックアップ

システム全体をバックアップする手順：

```bash
# アプリケーション停止
docker-compose -f infra/docker-compose.local.yml down

# データボリュームのバックアップ
docker run --rm -v testapp_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/full-backup-$(date +%Y%m%d).tar.gz /data

# アプリケーション再起動
docker-compose -f infra/docker-compose.local.yml up -d
```

### バックアップの保管

- **保管場所**: `/backup/` ディレクトリ
- **保管期間**: 30日間
- **世代管理**: 直近7日分は日次、それ以降は週次

---

## 監視とメンテナンス

### ログ確認

#### アプリケーションログ

```bash
# リアルタイムでログを確認
docker-compose -f infra/docker-compose.local.yml logs -f backend

# 過去のログを確認
docker-compose -f infra/docker-compose.local.yml logs --tail=100 backend
```

#### エラーログの確認

```bash
# エラーレベルのログのみ抽出
docker-compose logs backend | grep ERROR
```

---

### リソース監視

#### CPU・メモリ使用状況

```bash
# Docker コンテナのリソース使用状況
docker stats

# 特定コンテナの詳細
docker stats backend
```

#### ディスク使用状況

```bash
# ディスク使用量確認
df -h

# Dockerボリュームの使用量
docker system df -v
```

---

### 定期メンテナンス

#### 週次メンテナンス
- [ ] ログファイルのローテーション
- [ ] ディスク使用量の確認
- [ ] バックアップの動作確認

#### 月次メンテナンス
- [ ] セキュリティアップデートの適用
- [ ] パフォーマンスレポートの確認
- [ ] 古いバックアップの削除

---

## トラブルシューティング

### コンテナが起動しない

**症状**  
`docker-compose up` でコンテナが起動しない

**確認事項**
```bash
# ポートの競合確認
sudo lsof -i :8080
sudo lsof -i :5432

# Dockerログの確認
docker-compose logs

# ディスク容量の確認
df -h
```

**解決方法**
1. 既存のコンテナを停止
   ```bash
   docker-compose down
   ```

2. 不要なコンテナ・イメージを削除
   ```bash
   docker system prune -a
   ```

3. 再起動
   ```bash
   docker-compose up -d
   ```

---

### データベース接続エラー

**症状**  
アプリケーションがデータベースに接続できない

**原因**
- データベースコンテナが起動していない
- 接続情報が間違っている
- ネットワーク設定の問題

**解決方法**
```bash
# データベースの起動確認
docker ps | grep postgres

# データベースへの接続テスト
docker exec postgres psql -U admin -d testapp -c "SELECT 1;"

# 環境変数の確認
docker exec backend env | grep DB_
```

---

### パフォーマンス低下

**症状**  
アプリケーションの応答が遅い

**確認事項**
1. リソース使用状況の確認
   ```bash
   docker stats
   ```

2. データベースのインデックス確認
   ```bash
   docker exec postgres psql -U admin -d testapp -c "\d+ users"
   ```

3. ログでのスロークエリ確認
   ```bash
   docker logs backend | grep "slow query"
   ```

**対処方法**
- データベースのインデックス追加
- 不要なデータの削除
- キャッシュの有効化

---

## セキュリティ対策

### アクセス制限

#### IPアドレス制限
```nginx
# nginx.conf
location / {
    allow 192.168.1.0/24;
    deny all;
}
```

#### HTTPS の設定
```bash
# Let's Encrypt で証明書取得
certbot --nginx -d yourdomain.com
```

---

### セキュリティアップデート

```bash
# システムパッケージの更新
sudo apt update
sudo apt upgrade

# Dockerイメージの更新
docker-compose pull
docker-compose up -d
```

---

## 関連ドキュメント

- [ユーザー向けマニュアル](../user/)
- [アーキテクチャドキュメント](../../03-アーキテクチャ.md)
- [デプロイメントガイド](../../09-デプロイメント.md)

---

## 変更履歴

| 日付 | バージョン | 変更内容 | 作成者 |
|------|-----------|---------|--------|
| 2026/01/10 | 1.0 | 初版作成 | manual-specialist |

---

**作成日**: 2026年1月10日  
**最終更新**: 2026年1月10日  
**作成者**: @manual-specialist
