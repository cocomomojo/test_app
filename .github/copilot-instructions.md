# GitHub Copilot カスタム命令

このドキュメントは、本リポジトリの Copilot 使用時の共通ルールと プロジェクト構造を定めます。

## 📌 必須ルール

### 1. 回答言語

**すべての回答は日本語で行ってください。** コード・コマンドの英語はそのままで構いません。

### 2. プロジェクト言語設定

- **frontend**: TypeScript + Vue 3 Composition API
- **backend**: Java 17 + Spring Boot 3
- **test framework**: Vitest (frontend), JUnit 5 (backend), Playwright E2E
- **build tool**: npm (frontend), Gradle (backend)

## 🏗️ プロジェクト構造

```
test_app/
├── frontend/              # Vue 3 + Vuetify 3 + Vite
│   ├── src/
│   │   ├── components/    # Vue コンポーネント（.vue）
│   │   ├── views/         # ページコンポーネント
│   │   └── tests/         # ユニットテスト
│   ├── tests/e2e/         # Playwright E2E テスト
│   ├── package.json
│   └── vitest.config.ts
├── backend/               # Spring Boot 3
│   ├── src/main/
│   │   ├── java/          # Java ソースコード
│   │   └── resources/     # 設定ファイル
│   ├── src/test/          # テストコード
│   ├── build.gradle.kts
│   └── settings.gradle.kts
├── .github/
│   ├── workflows/         # GitHub Actions（15個）
│   ├── agents/            # Copilot Agent 定義（4個）
│   ├── skills/            # Copilot スキル
│   └── copilot-instructions.md
└── README.md
```

## 🔧 ビルド・テスト コマンド

### Frontend
```bash
npm install                 # 依存関係インストール
npm run build              # ビルド
npm run test:unit          # ユニットテスト
npm run test:e2e           # E2E テスト
```

### Backend
```bash
./gradlew build            # ビルド
./gradlew test             # テスト
./gradlew bootRun          # 実行
```

## 📝 コーディング規則

### Vue コンポーネント
- Composition API を使用（Options API は非推奨）
- `data-testid` 属性を重要な要素に付与
- 型安全な TypeScript を使用

### Java/Spring Boot
- Java 17 の機能を活用
- Spring Boot 3 の規約に従う
- JUnit 5 でテストを記述

## 🧪 テスト戦略

1. **ユニットテスト**: 各コンポーネント・メソッド単位
2. **E2E テスト**: 主要なユーザーフロー（Playwright）
3. **カバレッジ目標**:
   - Frontend: 80%+
   - Backend: 85%+

## 🔐 シークレット・認証

必須シークレット:
- `COPILOT_GITHUB_TOKEN`: Copilot 自動修正用

## 🚀 ワークフロー

本プロジェクトは 15個の GitHub Actions ワークフローで CI/CD を自動化しています。詳細は `README.md` の「ワークフロー関連性図」セクションを参照してください。

主要なワークフロー:
- **weekly-feature-issue/fix**: 週次機能改修の自動実装
- **dependabot-auto-fix**: 依存関係の自動修正
- **e2e-failure-analysis**: E2E テスト失敗の自動分析
- **issue-to-auto-fix-pr**: Issue から Draft PR 自動生成

## 📚 参考ドキュメント

- README.md: プロジェクト概要・アーキテクチャ
- .github/skills/: Copilot スキル（GitHub Actions・E2E・依存関係）
- .github/agents/: 専門 Agent 定義（CI/CD、E2E、Issue、品質管理）

## ⚠️ 重要な確認項目

修正・実装時は必ず以下を確認してください:

- [ ] ローカルでビルド・テスト成功したか
- [ ] コード規則を守っているか
- [ ] テストカバレッジは十分か
- [ ] 既存テストが壊れていないか
- [ ] secrets が含まれていないか
