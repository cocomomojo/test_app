
## 環境構築

### 構成

### 手順


---

## ローカル実行

### Backend

起動（ビルド含む）
```
cd infra
docker-compose -f docker-compose.local.yml up -d --build

```

ログ確認（直近200行）

```
cd infra
docker-compose -f docker-compose.local.yml logs backend --tail=200
# リアルタイム追跡
docker-compose -f docker-compose.local.yml logs -f backend

```

停止／削除:

```
cd infra
docker-compose -f docker-compose.local.yml down
```

コンテナに入る／コンテナログ（必要時）:
```
# 実行中コンテナの確認
docker ps

# コンテナ名が infra-backend-1 の場合
docker exec -it infra-backend-1 /bin/bash
docker logs infra-backend-1
```

ローカル（Dockerを使わない）で実行する場合

開発実行（Gradle）:
```
cd /home/k-mano/test_app/backend
./gradlew bootRun
```

ビルドして jar を実行する場合:
```
cd /home/k-mano/test_app/backend
./gradlew bootJar
java -jar build/libs/*.jar --spring.profiles.active=local
```

### Fronend

起動

```
cd fronend
npm run dev
```

終了

---

## CI実行

### 


---

## 注意事項
Cognito をローカルで完全にエミュレートするには LocalStack Pro（有料）が必要です。Community エディションでは Cognito の API がサポートされていない部分があるため、LocalStack だけで完全に再現するのは難しいです。代替は LocalStack Pro を使うか、実際の AWS Cognito を使う／ローカル用の簡易ログイン（今回追加した実装）のまま進める、です。

---

🌐 GitHub Pages の URL を知る方法（最も確実）
✔ 方法 1：GitHub の「Pages」設定画面で確認する（推奨）
- GitHub のリポジトリを開く
- Settings をクリック
- 左メニューから Pages を選択
- 「Your site is live at:」の下に URL が表示される
例：
https://<GitHubユーザー名>.github.io/<リポジトリ名>/


これが GitHub Pages の公開 URL。

🧪 GitHub Actions で Pages を使う場合の注意点
GitHub Pages を使うには、以下が必要：
- リポジトリの Settings → Pages で
Source: GitHub Actions を選択する
これを設定しておくと、
peaceiris/actions-gh-pages がデプロイした内容がそのまま公開される。



---

## TODO
　
・github上で、
・このアプリをgithub上で無料枠で起動することはできますか？
・🧪 GitHub Actions で Pages を使う場合の注意点
　GitHub Pages を使うには、以下が必要：
　- リポジトリの Settings → Pages で
　Source: GitHub Actions を選択する
