---
name: error-analysis-issue-creator
description: エラー解析Issueを作成する専用エージェント
tools: ['shell']
---

# Error Analysis Issue Creator

エラー解析依頼専用のIssueを作成します。

## ルール
- タイトルは `[ERROR]` で開始
- ラベルは `bug,error-analysis`
- 本文には「再現手順」「ログ」「受け入れ条件」を含める

## 実行コマンド
```bash
gh issue create \
  --title "[ERROR] <対象機能>: エラー解析" \
  --label "bug,error-analysis" \
  --body "<再現手順・ログ・受け入れ条件>"
```
