# Dependabot自動化ワークフロー

このディレクトリには、Dependabotの依存関係更新PRを自動的に処理するワークフローが含まれています。

## Dependabotグループ化設定

すべての依存関係更新はエコシステムごとにグループ化されます：

### フロントエンド (npm)
- **production-dependencies**: プロダクション依存関係のマイナー/パッチアップデート
- **development-dependencies**: 開発依存関係のマイナー/パッチアップデート  
- **production-major**: プロダクション依存関係のメジャーアップデート
- **development-major**: 開発依存関係のメジャーアップデート

### バックエンド (Gradle)
- **spring-boot**: Spring Boot関連のマイナー/パッチアップデート
- **aws-sdk**: AWS SDK関連のマイナー/パッチアップデート
- **other-dependencies**: その他の依存関係のマイナー/パッチアップデート
- **major-updates**: すべてのメジャーアップデート

### GitHub Actions
- **github-actions-dependencies**: すべてのアクションのマイナー/パッチアップデート
- **github-actions-major**: すべてのアクションのメジャーアップデート

これにより、個別のPRではなく、まとまったPRが作成されます。

## ワークフロー概要

### 1. dependabot-auto-merge.yml
**目的**: Dependabot PRのテスト検証と手動マージ支援

**動作**:
- Dependabotが作成したPRに対して自動的にトリガー
- `automerge`ラベルが付いているPRのみ処理
- フロントエンド/バックエンドのテストを実行
- テストが成功した場合、手動マージが必要であることをコメント
- テストが失敗した場合、auto-fixワークフローの起動を促すコメントを追加

### 2. dependabot-auto-fix.yml
**目的**: テスト失敗時の自動修正

**動作**:
- PR Quality Checksワークフローが失敗した場合に自動的にトリガー
- Dependabot PRの場合のみ処理
- フロントエンド、バックエンド、GitHub Actionsの更新に対応
- 一般的なエラーパターンを検出して自動修正を試行:
  - jsdom/undiciの互換性問題 → 互換性のあるバージョンにピン留め
  - モジュール不足・インポート解決エラー → 依存関係の再インストール
  - Gradle設定エラー → Gradleラッパーの更新
- 修正が成功した場合、変更をコミットしてPRに追加
- 修正結果をPRにコメント

### 3. pr-quality.yml
**目的**: すべてのPRの品質チェック

**動作**:
- すべてのPRに対してフロントエンド/バックエンドのユニットテストを実行
- テスト結果をPRにコメント
- カバレッジレポートをアーティファクトとしてアップロード

## 自動化フロー

```
Dependabotが依存関係更新PRを作成
        ↓
dependabot-auto-merge.yml実行
        ↓
テスト実行 (pr-quality.ymlトリガー)
        ↓
    ┌───テスト成功?───┐
    YES              NO
    ↓                ↓
手動レビュー/マージ  dependabot-auto-fix.ymlトリガー
                       ↓
                  エラーパターン検出
                       ↓
                   自動修正試行
                       ↓
                   ┌─成功?─┐
                  YES     NO
                   ↓       ↓
              変更コミット  マニュアル対応が必要
                   ↓       (PRにコメント)
              再テスト実行
                   ↓
              手動レビュー/マージ
```

## サポートされている自動修正パターン

### フロントエンド
1. **jsdom/undici互換性問題**
   - エラー: `webidl.util.markAsUncloneable is not a function`
   - 修正: undiciを互換性のあるバージョン(^6.0.0)にピン留め

2. **モジュール不足・インポート解決エラー**
   - エラー: `Cannot find module`, `Failed to resolve import`
   - 修正: 依存関係の再インストール

### バックエンド
1. **Gradle設定エラー**
   - エラー: `Could not find method`
   - 修正: Gradleラッパーを推奨バージョンに更新

### GitHub Actions
- GitHub Actionsの更新によるフロントエンド/バックエンドテスト失敗も自動修正の対象
- アクション更新が原因で依存関係の問題が発生した場合、上記のパターンで修正を試行

## 設定

### 必要な権限
ワークフローには以下の権限が必要です:
- `contents: write` - コード変更のコミット用
- `pull-requests: write` - PRへのコメント/承認用
- `actions: read` - 他のワークフロー実行状態の読み取り用
- `checks: read` - チェック状態の読み取り用

### Dependabot設定
`.github/dependabot.yml`で以下を設定:
```yaml
labels:
  - "automerge"  # テスト検証トリガーとして使うラベル
```

## トラブルシューティング

### テスト成功時に手動マージの案内が出ない
1. `automerge`ラベルが付いているか確認
2. テストが成功しているか確認
3. レビュー担当者が手動でマージするか確認

### 自動修正が動作しない
1. エラーパターンがサポートされているか確認
2. ワークフローのログで詳細なエラーメッセージを確認
3. 必要に応じてマニュアルで修正し、新しいエラーパターンをワークフローに追加

### 新しいエラーパターンの追加
`dependabot-auto-fix.yml`の該当セクションに新しいエラーパターンと修正方法を追加してください:

```yaml
elif grep -q "新しいエラーパターン" /tmp/test-output.txt; then
  echo "新しいエラーを検出"
  # 修正コマンド
  npm install 修正パッケージ
  # 再テスト
  npm run test:unit
fi
```

## 今後の改善案

1. より多くのエラーパターンのサポート追加
2. 機械学習を使用したエラー検出と修正提案
3. 修正履歴の分析とパターン学習
4. 複数の修正戦略の優先順位付け
5. 修正失敗時の代替戦略の自動試行
