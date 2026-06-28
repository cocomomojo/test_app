# Moto セットアップガイド

> AWS S3 のモック環境として [Moto](https://github.com/getmoto/moto) を使用します。LocalStack から置き換えることで、軽量かつシンプルな開発環境を実現します。

## 概要

このプロジェクトでは AWS S3 操作のモックに **Moto Server** (`motoserver/moto`) Docker イメージを使用します。  
Moto は Python ライブラリとして有名ですが、`motoserver` イメージを使えば任意の言語のアプリケーションと HTTP 経由で連携できます。

| 項目 | LocalStack | Moto |
|---|---|---|
| イメージサイズ | ~1GB+ | ~200MB |
| 起動速度 | 遅め | 高速 |
| S3 互換性 | ほぼ完全 | ほぼ完全 |
| 追加設定 | 多い | 最小限 |
| ライセンス | Community / Pro | Apache 2.0 |

---

## ローカル開発環境のセットアップ

### 前提条件

- Docker Desktop がインストール済みであること
- `docker compose` コマンドが使えること

### 起動手順

```bash
# プロジェクトルートから
cd infra
docker compose -f docker-compose.local.yml up -d
```

以下のサービスが起動します:

| サービス | URL |
|---|---|
| MySQL | `localhost:3306` |
| Moto (S3 モック) | `http://localhost:5000` |
| Spring Boot バックエンド | `http://localhost:8080` |
| フロントエンド | `http://localhost:5173` |

### バケットの自動作成

Spring Boot 起動時に `S3BucketInitializer` が自動的に S3 バケット (`memo-bucket`) を作成します。  
初回起動時もバケット不在エラーは発生しません。

### Moto の動作確認

```bash
# Moto のリセット API（ヘルスチェック兼用）
curl http://localhost:5000/moto-api/reset

# バケット一覧確認
aws --endpoint-url http://localhost:5000 s3 ls \
  --no-sign-request \
  --region ap-northeast-1
```

---

## Spring Boot の設定

`application-local.yml` で Moto エンドポイントを指定しています:

```yaml
aws:
  region: ap-northeast-1
  endpoint: http://localhost:5000   # Moto Server
  s3:
    bucket: memo-bucket
```

Docker Compose 環境内（コンテナ間通信）では `AWS_ENDPOINT=http://moto:5000` 環境変数で上書きされます。

---

## Moto Server の主要エンドポイント

| エンドポイント | 説明 |
|---|---|
| `GET /moto-api/reset` | 全データリセット（ヘルスチェック） |
| `GET /moto-api/data` | 保存されたデータ確認 |
| `PUT /moto-api/reset` | 全データリセット |

---

## トラブルシューティング

### `Connection refused` エラー

Moto コンテナが起動前にバックエンドが起動しようとした場合に発生します。  
`depends_on` + `healthcheck` で制御しているため、再起動で解消されることが多いです:

```bash
docker compose -f docker-compose.local.yml restart backend
```

### バケットが存在しない

`S3BucketInitializer` がエラーをログに出力しますが、アプリは継続起動します。  
Moto サービスが正常に動作しているか確認してください:

```bash
docker compose -f docker-compose.local.yml logs moto
```

### Moto のデータをリセットしたい

```bash
curl -X PUT http://localhost:5000/moto-api/reset
```

---

## 参考リンク

- [Moto GitHub](https://github.com/getmoto/moto)
- [Moto Docker Hub](https://hub.docker.com/r/motoserver/moto)
- [Moto Server モード ドキュメント](https://docs.getmoto.org/en/latest/docs/server_mode.html)
