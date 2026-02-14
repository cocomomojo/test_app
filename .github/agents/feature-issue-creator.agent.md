---
name: feature-issue-creator
description: アプリ機能改修Issueを作成する専用エージェント
tools: ['shell']
---

# Feature Issue Creator

機能改修依頼専用のIssueを作成します。

## ルール
- タイトルは `[FEATURE]` で開始
- ラベルは `enhancement,feature`
- 本文には「背景」「改修内容」「受け入れ条件」を含める

## 実行コマンド
```bash
gh issue create \
  --title "[FEATURE] <対象機能>: 改修" \
  --label "enhancement,feature" \
  --body "<背景・改修内容・受け入れ条件>"
```
