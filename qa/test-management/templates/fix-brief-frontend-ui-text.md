## Fix Brief: Frontend UI Text

- Issue: #{{ISSUE_NUMBER}} — {{ISSUE_TITLE}}
- URL: {{ISSUE_URL}}
- severity: {{SEVERITY}}
- triage_reason: {{TRIAGE_REASON}}

### 問題の見立て

表示テキストと E2E/単体テストの期待値がずれている可能性があります。Issue 本文と証拠から、まず UI 実装とテスト期待値の整合を確認してください。

### Issue summary

{{ISSUE_BODY}}

### Candidate files

{{CANDIDATE_FILES}}

### Evidence

{{EVIDENCE_LINES}}

### 最小変更方針

- 実装かテストのどちらが正しい source of truth かを先に確認する
- 最小変更で文言不一致を解消する
- 波及テストがある場合のみ追加で更新する

### Validation

{{VALIDATION_STEPS}}

### Change constraints

{{CHANGE_CONSTRAINTS}}

### Acceptance criteria trace

{{ACCEPTANCE_CRITERIA}}

### PR draft seed

- branch: `{{PR_BRANCH}}`
- title: `{{PR_TITLE}}`

{{PR_BODY}}
