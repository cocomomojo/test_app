# Skill: create_issue

## Description
ユーザーの指示を元に GitHub Issue を作成する。
タイトル、概要、再現手順、期待結果を Markdown 形式で生成する。

## Inputs
- title: Issue のタイトル
- description: Issue の説明内容
- repository: 対象リポジトリ
- labels: 適用するラベル（optional）
- assignee: 担当者（optional）

## Output
- Issue URL または Issue オブジェクト
- 生成された Issue の内容

## Behavior
- ユーザーの自然言語から必要情報を抽出
- 不足情報は推測して補完
- Markdown 形式で整形
- 再現手順は番号付きリストで構造化
- 関連するラベルを自動提案
- テンプレートに沿ったフォーマットで統一

## Template Structure
```markdown
## 概要
[Issue の概要を簡潔に記述]

## 再現手順
1. [手順1]
2. [手順2]
3. [手順3]

## 期待する動作
[期待される結果]

## 実際の動作
[実際に発生した問題]

## 環境情報
- OS:
- ブラウザ:
- バージョン:

## 追加情報
[補足情報やスクリーンショット]
```
