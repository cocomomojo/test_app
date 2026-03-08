#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {
    outDir: path.join(process.cwd(), 'qa', 'test-management', 'generated'),
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--fix-brief') args.fixBrief = argv[++i];
    else if (arg === '--out-dir') args.outDir = argv[++i];
  }

  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
}

function detectAreas(candidateFiles = []) {
  const areas = {
    frontend: false,
    backend: false,
    database: false,
    infra: false,
    documentation: false,
  };

  for (const file of candidateFiles) {
    if (file.startsWith('frontend/')) areas.frontend = true;
    if (file.startsWith('backend/')) areas.backend = true;
    if (file.startsWith('infra/') || file.startsWith('.github/workflows/')) areas.infra = true;
    if (file.startsWith('wiki/') || file === 'README.md') areas.documentation = true;
    if (/schema|migration|sql|db/i.test(file)) areas.database = true;
  }

  return areas;
}

function compactIssueBody(body = '') {
  const lines = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('<!--'));

  return lines.slice(0, 6).join(' / ');
}

function buildTestItems(pattern) {
  const e2e = [];
  const manual = [];
  const integration = [];

  switch (pattern) {
    case 'frontend-ui-text':
      e2e.push('- [ ] 対象 UI 文言に対する E2E シナリオを再実行する');
      integration.push('- [ ] 実装文言とテスト期待値の source of truth を確認する');
      break;
    case 'frontend-unit-test':
      integration.push('- [ ] frontend unit test と実装の整合を確認する');
      break;
    case 'backend':
      integration.push('- [ ] `./gradlew test jacocoTestReport` の通過を確認する');
      break;
    case 'ci-config':
      integration.push('- [ ] 対象 workflow の再実行で失敗ステップが解消したことを確認する');
      break;
    case 'e2e-environment':
      e2e.push('- [ ] smoke E2E と health check の両方を確認する');
      integration.push('- [ ] compose / workflow 側の修正が実行環境に与える影響を確認する');
      break;
    case 'docs-manual':
      manual.push('- [ ] 参照ドキュメントとスクリーンショットの整合を確認する');
      integration.push('- [ ] 実装仕様との差分が説明文書のみで解消できることを確認する');
      break;
    default:
      integration.push('- [ ] fix brief に従って必要なテスト観点を補完する');
      break;
  }

  if (e2e.length === 0) e2e.push('- [ ] 必要に応じて E2E 観点を追記する');
  if (manual.length === 0) manual.push('- [ ] 必要に応じて Manual 観点を追記する');
  if (integration.length === 0) integration.push('- [ ] 必要に応じて Integration Test 観点を追記する');

  return { e2e, manual, integration };
}

function buildReviewPoints(details, acceptanceCriteria) {
  const reviewPoints = [];

  for (const item of (details.changeConstraints || []).slice(0, 2)) {
    reviewPoints.push(`- [ ] ${item}`);
  }

  for (const item of (acceptanceCriteria || []).slice(0, 2)) {
    const normalized = item.replace(/^-\s*\[[^\]]*\]\s*/, '').replace(/^-\s*/, '').trim();
    if (normalized) reviewPoints.push(`- [ ] ${normalized}`);
  }

  return reviewPoints.length > 0
    ? reviewPoints
    : ['- [ ] 変更理由と影響範囲が妥当か確認する', '- [ ] テスト計画が変更内容と一致しているか確認する'];
}

function buildMarkdown(payload) {
  const { issue, triage, details, acceptanceCriteria, prDraft } = payload;
  const areas = detectAreas(details.candidateFiles);
  const tests = buildTestItems(triage.bugPattern);
  const reviewPoints = buildReviewPoints(details, acceptanceCriteria);

  const areaLine = (checked, label) => `- [${checked ? 'x' : ' '}] ${label}`;

  return [
    '## 概要',
    '',
    `${issue.title || '(Issue title unavailable)'} に対応するための PR 下書きです。`,
    '',
    '### 変更理由',
    '',
    compactIssueBody(issue.body || ''),
    '',
    '## 関連Issue',
    '',
    `- Closes #${issue.number}`,
    '',
    '## Inputs for Test Design (Q&A)',
    '',
    `- 対象画面/機能: ${triage.bugPattern || '要分類'}`,
    `- 主要ユーザーフロー: ${issue.title || 'Issue本文を参照'}`,
    '- 変更点（何が変わるか）: fix brief の最小変更方針に従う',
    `- 影響範囲（どこに波及するか）: ${(details.candidateFiles || []).slice(0, 6).join(', ') || '要補完'}`,
    `- 既知のリスク/懸念: ${(details.changeConstraints || []).join(' / ') || '要補完'}`,
    `- 非機能観点（性能/アクセシビリティ等）: ${(details.validationSteps || []).join(' / ') || '要補完'}`,
    '',
    '## Test Design (E2E)',
    '',
    ...tests.e2e,
    '',
    '## Test Design (Manual)',
    '',
    ...tests.manual,
    '',
    '## Integration Test Items',
    '',
    ...tests.integration,
    '',
    '## 変更確認',
    '',
    '- [ ] ローカルで動作確認した',
    '- [ ] 既存機能に影響がないことを確認した',
    '- [ ] 必要に応じてテストを追加/更新した',
    '',
    '## 影響範囲',
    '',
    areaLine(areas.frontend, 'フロントエンド'),
    areaLine(areas.backend, 'バックエンド'),
    areaLine(areas.database, 'データベース'),
    areaLine(areas.infra, 'インフラ'),
    areaLine(areas.documentation, 'ドキュメント'),
    '',
    '## レビューポイント',
    '',
    ...reviewPoints,
    '',
    '## PR メタ情報',
    '',
    `- 推奨ブランチ名: \`${prDraft.branch}\``,
    `- 推奨タイトル: \`${prDraft.title}\``,
  ].join('\n');
}

function main() {
  try {
    const args = parseArgs(process.argv);
    if (!args.fixBrief) {
      throw new Error('Usage: node scripts/generate-pr-draft.js --fix-brief <path> [--out-dir path]');
    }

    const payload = readJson(args.fixBrief);
    const markdown = buildMarkdown(payload);
    const outDir = path.resolve(args.outDir);
    fs.mkdirSync(outDir, { recursive: true });

    const issueNumber = payload.issue?.number || 'unknown';
    const output = {
      title: payload.prDraft?.title || `fix: issue #${issueNumber}`,
      branch: payload.prDraft?.branch || `fix/issue-${issueNumber}`,
      body: markdown,
    };

    const jsonPath = path.join(outDir, `pr-draft-issue-${issueNumber}.json`);
    const mdPath = path.join(outDir, `pr-draft-issue-${issueNumber}.md`);
    fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf8');
    fs.writeFileSync(mdPath, markdown, 'utf8');

    console.log(JSON.stringify({ jsonPath, mdPath }, null, 2));
  } catch (error) {
    console.error(error.message || String(error));
    process.exit(1);
  }
}

main();
