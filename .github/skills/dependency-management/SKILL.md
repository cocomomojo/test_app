---
name: dependency-management
description: npm・Gradle 依存関係管理とセキュリティ脆弱性対応。Dependabot PR の修正と依存関係の互換性調整の際に使用してください。
---

## 依存関係管理と脆弱性対応

このスキルは、npm・Gradle 依存関係の管理とセキュリティ脆弱性への対応を効率化します。

### 依存関係の互換性チェック

1. **npm 依存関係**
   - 確認: `npm ls` で重複・競合を検出
   - ピニング: 互換性問題が発生した場合は特定バージョンに固定
   - 例: `vue-router` は 4.x、`Vite` は 6.x で固定

2. **Gradle 依存関係**
   - 確認: `./gradlew dependencies` でツリーを確認
   - アップグレード: Gradle Wrapper を定期的に更新
   - セキュリティ: 脆弱性データベースで定期スキャン

### よくあるエラーと修正

| エラー | 対応 |
|---|---|
| `peer dep missing` | package.json で互換バージョンを指定、再インストール |
| `npm ERR! conflicting versions` | `npm ci` で lock ファイルから再インストール |
| `Gradle build failed` | Wrapper バージョンを確認、`./gradlew clean build` |

### セキュリティ脆弱性の対応優先度

- 🔴 CRITICAL/HIGH: 即座に対応（その日中）
- 🟠 MEDIUM: 1週間以内に対応
- 🟡 LOW: 次の定期更新時に対応

### 実装チェックリスト

- [ ] Dependabot PR のテストが成功するか確認
- [ ] `npm install` で依存関係が解決されるか確認
- [ ] ビルド・テストが成功するか確認
- [ ] セキュリティ脆弱性スキャンをクリアしているか確認
