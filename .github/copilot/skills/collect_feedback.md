# Skill: collect_feedback

## Description
エージェント・スキル使用時のフィードバックを体系的に収集・記録する。
使用体験の質的・量的データを構造化して蓄積し、継続的改善の基盤を提供。

## Inputs
- session_context: 使用したエージェント・スキルの詳細
- user_experience: ユーザーの体験・感想
- success_status: タスクの完了状況（成功/部分的成功/失敗）
- additional_questions: 追加で必要だった質問や調査内容
- improvement_suggestions: 改善提案・要望

## Output
- 構造化されたフィードバックデータ
- 改善優先度の初期評価
- 関連する既存フィードバックとの関連性分析

## Behavior
- フィードバック収集時はユーザーの負担を最小限に
- 定性的情報と定量的データの両方を適切にバランス
- 収集したデータは即座に構造化して保存
- プライバシーと機密情報の適切な取り扱い
- 収集データの品質と完整性を確保

## Feedback Collection Template
```markdown
## フィードバック記録
**日時:** [自動生成]
**使用エージェント:** [agent名]
**使用スキル:** [skill名]
**タスク概要:** [実行したタスクの説明]

### 結果評価
- [ ] 完全成功 - 期待通りの結果が得られた
- [ ] 部分的成功 - 一部は有用だったが改善余地あり
- [ ] 失敗 - 期待した結果が得られなかった

### 使用体験
**良かった点:**
- [具体的に記述]

**改善が必要な点:**
- [具体的に記述]

**追加で必要だった作業:**
- [エージェント回答後に自分で調べた内容]
- [追加で質問した内容]

### 改善提案
**短期的改善:**
- [すぐに実装できそうな改善案]

**長期的改善:**
- [大きな変更が必要な改善案]

**新規スキル要望:**
- [あったら便利だと思う新しいスキル]
```

## Data Storage Structure
```json
{
  "timestamp": "ISO8601",
  "agent": "string",
  "skill": "string",
  "task_description": "string",
  "success_level": "complete|partial|failed",
  "satisfaction_score": "1-5",
  "time_saved": "minutes",
  "additional_work_required": "boolean",
  "improvement_suggestions": ["string"],
  "tags": ["string"]
}
```
