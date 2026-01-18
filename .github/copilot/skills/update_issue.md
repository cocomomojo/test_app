# Skill: update_issue

## Description
既存の Issue にコメント追加、ステータス変更、内容更新を行う。
Issue の進捗状況や新たな発見を効率的に記録・共有する。

## Inputs
- issue_number: 更新対象のIssue番号
- update_content: 更新内容
- status_change: ステータス変更（open/closed）
- labels: ラベルの追加/削除

## Output
- 更新されたコメントまたはIssue内容
- 変更確認メッセージ

## Behavior
- 変更内容を Markdown で整形
- Issue の文脈を保持したまま更新
- 進捗状況を明確に記録
- 関係者への適切な通知を考慮
- タイムスタンプと変更理由を記録

## Update Types
### Progress Update
```markdown
## 進捗更新
[進捗状況の説明]

### 完了した作業
- [作業項目1]
- [作業項目2]

### 次のステップ
- [次に実行する作業]

### ブロッカー
- [障害となっている問題]
```

### Solution Found
```markdown
## 解決策発見
[解決策の概要]

### 実装方法
[具体的な実装手順]

### テスト結果
[検証結果]
```
