# Skill: analyze_cicd_error

## Description
CI/CD のログを解析し、原因と改善案を提示する。
エラーパターンを分類し、迅速な問題解決をサポート。

## Inputs
- log: CI/CDエラーログ
- pipeline_config: パイプライン設定
- environment: 実行環境情報
- error_context: エラー発生時の状況

## Output
- エラー原因の分析結果
- 具体的な修正案
- 再発防止策

## Behavior
- エラー原因を分類（依存関係、権限、ネットワーク、設定ミス）
- 改善案を複数提示
- ログから関連する設定ファイルを特定
- 類似エラーの過去事例を参照
- 段階的なデバッグ手順を提示

## Error Classification

### 依存関係エラー
```markdown
🔗 **依存関係の問題**
**症状:** package not found, version conflict
**原因:**
- パッケージバージョンの競合
- 欠落した依存関係
- lockファイルの不整合

**修正方法:**
1. `npm ci` または `yarn install --frozen-lockfile` を使用
2. package.json と lock ファイルの同期確認
3. キャッシュのクリア: `npm cache clean --force`
```

### 権限・認証エラー
```markdown
🔐 **権限・認証の問題**
**症状:** Permission denied, Authentication failed
**原因:**
- AWS/GCP認証情報の期限切れ
- IAMロールの権限不足
- GitHub Secretsの設定ミス

**修正方法:**
1. シークレット設定の確認
2. IAMポリシーの権限追加
3. サービスアカウントの更新
```

### ビルド・テストエラー
```markdown
🔨 **ビルド・テストの問題**
**症状:** Build failed, Test timeout
**原因:**
- コンパイルエラー
- テストの不安定性（Flaky test）
- 環境依存の問題

**修正方法:**
1. ローカル環境での再現確認
2. テストの分離とリトライ設定
3. 環境変数の統一
```

### リソース・ネットワークエラー
```markdown
🌐 **リソース・ネットワークの問題**
**症状:** Timeout, Out of memory, Network unreachable
**原因:**
- メモリ不足
- ネットワーク接続の問題
- 外部サービスの障害

**修正方法:**
1. リソース制限の調整
2. リトライとタイムアウト設定
3. ヘルスチェックの実装
```
