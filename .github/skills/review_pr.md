# Skill: review_pr

## Description
PR の diff を解析し、懸念点・改善案をレビューコメントとして生成する。
コード品質、セキュリティ、パフォーマンスの観点から建設的なフィードバックを提供。

## Inputs
- pr_number: レビュー対象のPR番号
- review_focus: レビューの焦点（security, performance, maintainability等）
- severity: 指摘レベル（suggestion, warning, error）

## Output
- 構造化されたレビューコメント
- 改善提案とコード例

## Behavior
- コード品質、セキュリティ、パフォーマンスの観点でレビュー
- 建設的で具体的な改善案を提示
- コード例やベストプラクティスへの参照を含める
- 重要度に応じた優先順位付け
- チーム内のコーディング規約に準拠

## Review Categories

### Security Review
```markdown
🔒 **セキュリティ懸念**
- 入力値の検証が不十分
- 認証・認可の実装に問題
- 機密情報の露出リスク

**改善案:**
- [具体的な修正方法]
- [参考リンクやドキュメント]
```

### Performance Review
```markdown
⚡ **パフォーマンス**
- N+1クエリの発生
- 不要な処理の実行
- メモリリークの可能性

**改善案:**
- [最適化手法]
- [計測結果や改善効果の予測]
```

### Code Quality Review
```markdown
🧹 **コード品質**
- 複雑度が高い関数
- 重複コードの存在
- 命名の改善余地

**改善案:**
- [リファクタリング提案]
- [設計パターンの活用]
```

### Documentation Review
```markdown
📚 **ドキュメント**
- コメントの不足
- API仕様の更新
- README更新の必要性

**改善案:**
- [必要なドキュメント]
- [記載すべき内容]
```
