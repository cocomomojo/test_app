# PlaywrightMCP統合による完全自動化マニュアル生成（実装案）

## 概要

PlaywrightMCPを使ってCopilotが完全なAIエージェントとしてマニュアルを自動生成する実装案です。

## 前提条件

- PlaywrightMCPサーバーが起動している
- Copilot EditorでMCPツールが利用可能

## 実装フロー

### ステップ1: Copilotにリクエスト

```
ユーザー: 「ログイン機能のユーザー向けマニュアルを作成してください」
```

### ステップ2: Copilotが自動実行

```javascript
// Copilotが内部で実行するツール呼び出し

// 1. ブラウザ起動・ページアクセス
mcp_playwright_browser_navigate({
  url: "http://localhost:5173"
})

// 2. ページ内容取得
const snapshot = mcp_playwright_browser_snapshot()

// 3. 必要に応じてクリック・入力
mcp_playwright_browser_click({
  element: "ログインボタン",
  ref: "button.v-btn"
})

// 4. スクリーンショット撮影
mcp_playwright_browser_take_screenshot({
  filename: "wiki/manual/screenshots/user/01-login.png",
  fullPage: true
})

// 5. 複数ページを巡回
mcp_playwright_browser_navigate({ url: "/top" })
mcp_playwright_browser_take_screenshot({...})

mcp_playwright_browser_navigate({ url: "/todo" })
mcp_playwright_browser_take_screenshot({...})
```

### ステップ3: Copilotがマニュアル生成

```markdown
# Copilotが生成するMarkdown

# ログイン機能 操作マニュアル

## 概要

### この機能について
[snapshotから取得した情報を元に具体的な説明を生成]

ログイン機能は、ユーザーが安全にシステムにアクセスするための認証機能です...

### 利用シーン
[実際の画面から推測した利用シーン]
- 朝の業務開始時にシステムにアクセスする
- セッション切れ後の再ログイン
...

## 基本操作

### 1. ログイン画面へのアクセス

![ログイン画面](screenshots/user/01-login.png)

[snapshotから取得したボタン名や入力フィールド名を使用]
1. 「ユーザ名」フィールドに...
2. 「ログイン」ボタンをクリック...
```

### ステップ4: ファイル保存

```javascript
// Copilotがファイル作成ツールを使用
create_file({
  filePath: "/home/k-mano/test_app/wiki/manual/user/02-login-feature.md",
  content: [生成されたMarkdown]
})
```

## メリット

### 完全自動化
- ✅ ユーザーはリクエストするだけ
- ✅ プロンプトのコピペ不要
- ✅ ファイル保存も自動

### 対話的改善
```
ユーザー: 「トラブルシューティングをもっと詳しく」
Copilot: [追加で調査 → マニュアル更新]
```

### リアルタイム探索
```
Copilot: 「ログイン後の画面を確認します」
        → navigate(/top)
        → snapshot取得
        → 「ダッシュボードに遷移しました。TODOと未読メモが表示されています」
```

## デメリット

### 1. 環境依存
- PlaywrightMCPサーバーが必要
- MCPプロトコルのサポートが必要
- 追加のセットアップコスト

### 2. 安定性
- MCPサーバーが停止するとエラー
- ブラウザ操作のタイムアウト処理が複雑

### 3. パフォーマンス
- 対話的なため、バッチ処理より遅い
- 複数ページを順次処理する必要がある

## 実装の選択基準

### 現在の実装（通常のPlaywright）を選ぶべき場合
- ✅ バッチ処理で高速に処理したい
- ✅ 環境をシンプルに保ちたい
- ✅ 手動ステップ1回は許容できる
- ✅ 安定性を重視

### PlaywrightMCPを選ぶべき場合
- ✅ 完全自動化が必須
- ✅ 対話的な改善が必要
- ✅ リアルタイムでページ探索したい
- ✅ MCPサーバーのセットアップが可能

## 結論

**現時点では通常のPlaywrightで十分**

理由:
1. 手動ステップは1回だけ（プロンプトのコピペ）
2. 高速で安定
3. 環境がシンプル

**PlaywrightMCPは将来の拡張として検討可能**

必要になったら段階的に移行できます。

---

**作成日**: 2026年1月10日
