# Dependabot 設定ガイド

## 概要

このリポジトリの Dependabot は**マイナーチェンジとパッチ更新のみ**に制限されています。メジャーバージョンアップは自動的に除外されます。

## 設定概要

| エコシステム | ディレクトリ | 更新タイプ | スケジュール |
|-------------|-----------|---------|-----------|
| npm (Frontend) | `/frontend` | Minor + Patch | 月1回（1日 9:00 JST） |
| Gradle (Backend) | `/backend` | Minor + Patch | 月1回（1日 9:00 JST） |
| GitHub Actions | `/` | Minor + Patch | 月1回（1日 9:00 JST） |

## 詳細設定

### 1. Frontend (npm)

**設定ファイル:** `.github/dependabot.yml` (lines 4-32)

#### 依存関係グループ

- **production-dependencies**: 本番依存関係（axios, vue, vue-router など）
  - 更新タイプ: `minor`, `patch` のみ
  - メジャーバージョン: 自動的に除外

- **development-dependencies**: 開発依存関係（@playwright/test, vitest など）
  - 更新タイプ: `minor`, `patch` のみ
  - メジャーバージョン: 自動的に除外

#### 自動マージ対象
- ラベル: `dependencies`, `frontend`, `automerge`
- Dependabot Auto-merge ワークフローにより、テスト合格時に自動マージ

### 2. Backend (Gradle)

**設定ファイル:** `.github/dependabot.yml` (lines 35-78)

#### 依存関係グループ

- **spring-boot**: Spring Boot 関連パッケージ
  - パターン: `org.springframework.boot:*`, `org.springframework:*`
  - 更新タイプ: `minor`, `patch` のみ

- **aws-sdk**: AWS SDK 関連パッケージ
  - パターン: `software.amazon.awssdk:*`
  - 更新タイプ: `minor`, `patch` のみ

- **other-dependencies**: その他の依存関係
  - パターン: `*` (上記2つは除外)
  - 更新タイプ: `minor`, `patch` のみ

#### 自動マージ対象
- ラベル: `dependencies`, `backend`, `automerge`
- Dependabot Auto-merge ワークフローにより、テスト合格時に自動マージ

### 3. GitHub Actions

**設定ファイル:** `.github/dependabot.yml` (lines 80-103)

#### 依存関係グループ

- **github-actions-dependencies**: すべての GitHub Actions
  - パターン: `*`
  - 更新タイプ: `minor`, `patch` のみ
  - メジャーバージョン: 自動的に除外

#### 自動マージ対象
- ラベル: `dependencies`, `github-actions`, `automerge`
- Dependabot Auto-merge ワークフローにより、テスト合格時に自動マージ

## なぜメジャーバージョンアップを除外するのか？

Issue #267 で報告された通り、メジャーバージョンアップは**破壊的変更（Breaking Changes）**を含む可能性があり、以下の問題が発生します：

1. **テスト失敗**: API 変更、廃止されたメソッドの削除など
2. **ビルド失敗**: 型定義の変更、設定ファイル形式の変更など
3. **互換性問題**: 既存コードとの非互換性

そのため、メジャーバージョンアップは**手動でレビューし、テストしてから実施する**方が安全です。

マイナーチェンジ（新機能追加）とパッチ（バグ修正）は後方互換性を保証しているため、自動マージで対応できます。

## 設定の更新方法

### 新しい依存関係を追加する場合

1. `.github/dependabot.yml` を編集
2. 該当する `update-types` に `minor`, `patch` のみを指定
3. 必要に応じて新しいグループを作成
4. PR を作成してレビュー・マージ

### 特定の依存関係を除外する場合

現在の設定では、すべての依存関係が `update-types` レベルで制限されているため、個別の `ignore` ルールは不要です。

ただし、特定の依存関係で例外が必要な場合は、以下の方法で対応してください：

```yaml
ignore:
  - dependency-name: "package-name"
    update-types:
      - "major"
```

## 検証方法

### PR の確認

1. Dependabot PR が作成されたら、PR のタイトルで更新タイプを確認
   - 例: `Bump vite from 6.0.0 to 6.1.0` (マイナー/パッチ)
   - 例: `Bump vue from 3.0.0 to 4.0.0` (メジャー・作成されないはず)

2. PR コメントで更新内容を確認
   - `update-type: version-update:semver-minor`
   - `update-type: version-update:semver-patch`

### 定期的なチェック

毎月の Dependabot 実行後、以下の項目をチェック：

- [ ] メジャーバージョン更新の PR が作成されていない
- [ ] マイナー/パッチ更新の PR が作成されている
- [ ] テストが成功している
- [ ] PR が自動マージされている

## 参考資料

- [Dependabot 公式ドキュメント](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-dependency-updates)
- [Dependabot Auto-merge ワークフロー](../.github/workflows/dependabot-auto-merge.yml)
- [PR Quality Checks ワークフロー](../.github/workflows/pr-quality.yml)
- Issue #267: [Dependabotをマイナーチェンジのみにする](https://github.com/cocomomojo/test_app/issues/267)

## トラブルシューティング

### メジャーバージョン更新の PR が作成されてしまった

1. 原因を調査
   - `.github/dependabot.yml` の設定を確認
   - PR のコメントで更新タイプを確認

2. 対応方法
   - 設定に誤りがないか確認
   - 必要に応じて `ignore` ルールを追加
   - PR を閉じてドキュメントを更新

### テストが失敗している（マイナー/パッチ更新）

1. 詳細なエラーログを確認
   - PR の GitHub Actions ログを確認
   - ローカルで再現できるか試す

2. 対応方法
   - バグの原因を特定
   - 必要に応じて依存関係を除外（ignore ルール追加）
   - 関連メンテナーに報告
