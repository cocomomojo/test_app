#!/usr/bin/env node

/**
 * pr-tools.js — consolidated PR management scripts
 *
 * Subcommands:
 *   generate-pr-draft       generate-pr-draft
 *   collect-meta            collect-pr-test-assets-meta
 *   generate-assets         generate-pr-test-assets
 *   validate               validate-auto-fix-changes
 */

'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────
// Shared utilities
// ─────────────────────────────────────────────

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
}

function readJsonSafe(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return null; }
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function pathMatchesRule(candidatePath, rule) {
  if (!candidatePath || !rule) return false;
  if (rule.endsWith('/')) return candidatePath.startsWith(rule);
  return candidatePath === rule;
}

// ─────────────────────────────────────────────
// generate-pr-draft  (was: generate-pr-draft.js)
// ─────────────────────────────────────────────

function parsePrDraftArgs(argv) {
  const args = { outDir: path.join(process.cwd(), 'qa', 'test-management', 'generated') };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--fix-brief') args.fixBrief = argv[++i];
    else if (arg === '--out-dir') args.outDir = argv[++i];
  }
  return args;
}

function detectAreas(candidateFiles = []) {
  const areas = { frontend: false, backend: false, database: false, infra: false, documentation: false };
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
  const lines = body.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith('<!--'));
  return lines.slice(0, 6).join(' / ');
}

function buildTestItems(pattern) {
  const e2e = [], manual = [], integration = [];
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
  }
  if (e2e.length === 0) e2e.push('- [ ] 必要に応じて E2E 観点を追記する');
  if (manual.length === 0) manual.push('- [ ] 必要に応じて Manual 観点を追記する');
  if (integration.length === 0) integration.push('- [ ] 必要に応じて Integration Test 観点を追記する');
  return { e2e, manual, integration };
}

function buildReviewPoints(details, acceptanceCriteria) {
  const reviewPoints = [];
  for (const item of (details.changeConstraints || []).slice(0, 2)) reviewPoints.push(`- [ ] ${item}`);
  for (const item of (acceptanceCriteria || []).slice(0, 2)) {
    const normalized = item.replace(/^-\s*\[[^\]]*\]\s*/, '').replace(/^-\s*/, '').trim();
    if (normalized) reviewPoints.push(`- [ ] ${normalized}`);
  }
  return reviewPoints.length > 0 ? reviewPoints : ['- [ ] 変更理由と影響範囲が妥当か確認する', '- [ ] テスト計画が変更内容と一致しているか確認する'];
}

function buildPrDraftMarkdown(payload) {
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

function mainPrDraft(argv) {
  const args = parsePrDraftArgs(argv);
  if (!args.fixBrief) throw new Error('Usage: node scripts/pr-tools.js generate-pr-draft --fix-brief <path> [--out-dir path]');
  const payload = readJson(args.fixBrief);
  const markdown = buildPrDraftMarkdown(payload);
  const outDir = path.resolve(args.outDir);
  ensureDir(outDir);
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
}

// ─────────────────────────────────────────────
// collect-meta  (was: collect-pr-test-assets-meta.js)
// ─────────────────────────────────────────────

function extractSection(content, headingText) {
  const lines = content.split(/\r?\n/);
  const start = lines.findIndex((l) => new RegExp(`^##\\s+${headingText}\\s*$`, 'i').test(l.trim()));
  if (start < 0) return '';
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i].trim())) { end = i; break; }
  }
  return lines.slice(start, end).join('\n');
}

function countTableItems(section) {
  if (!section) return 0;
  const lines = section.split(/\r?\n/).map((l) => l.trim());
  const rows = lines.filter((l) => /^\|/.test(l));
  return rows.filter((l) => !/^\|\s*-+/.test(l) && !/^\|\s*ID\s*\|/i.test(l)).length;
}

function firstMatchByPrefix(dirPath, prefix, suffix) {
  if (!fs.existsSync(dirPath)) return null;
  const matches = fs.readdirSync(dirPath).filter((name) => name.startsWith(prefix) && name.endsWith(suffix)).sort();
  return matches.length ? path.join(dirPath, matches[0]) : null;
}

function loadPrMeta() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  let pr = null;
  if (eventPath && fs.existsSync(eventPath)) {
    const event = readJsonSafe(eventPath);
    pr = event?.pull_request || null;
  }
  if (!pr && process.env.PR_NUMBER) {
    pr = {
      number: Number(process.env.PR_NUMBER),
      title: process.env.PR_TITLE || 'Untitled PR',
      html_url: process.env.PR_URL || '',
      user: { login: process.env.PR_USER || 'unknown' },
      body: process.env.PR_BODY || '',
    };
  }
  if (!pr) { console.error('No pull_request payload found.'); process.exit(1); }
  return { number: Number(pr.number), title: pr.title || 'Untitled PR', url: pr.html_url || '', user: pr.user?.login || 'unknown', body: pr.body || '' };
}

function mainCollectMeta() {
  const root = process.env.PR_TEST_PLAN_OUTPUT_ROOT || process.cwd();
  const pr = loadPrMeta();
  const planPath = path.join(root, 'qa', 'test-management', 'pr', `PR-${pr.number}-test-plan.md`);
  if (!fs.existsSync(planPath)) {
    console.error(`テスト設計ファイルが見つかりません: ${path.relative(root, planPath)}`);
    process.exit(1);
  }
  const plan = fs.readFileSync(planPath, 'utf8');
  const e2eSection = extractSection(plan, '2\\.\\s*E2Eテスト項目');
  const manualSection = extractSection(plan, '3\\.\\s*手動テスト項目');
  const integrationSection = extractSection(plan, '4\\.\\s*総合テスト項目');
  if (!e2eSection || !manualSection) {
    console.error('テスト設計ファイルに E2E/手動 の分類セクションが不足しています。');
    process.exit(1);
  }
  const e2eCount = countTableItems(e2eSection);
  const manualCount = countTableItems(manualSection);
  const integrationCount = countTableItems(integrationSection);
  const generatedDir = path.join(root, 'frontend', 'tests', 'e2e', 'generated');
  const generatedSpecAbs = firstMatchByPrefix(generatedDir, `pr-${pr.number}-`, '.spec.ts');
  const generatedSpec = generatedSpecAbs ? path.relative(root, generatedSpecAbs).replace(/\\/g, '/') : '';
  if (e2eCount > 0 && !generatedSpec) {
    console.error(`E2E項目が ${e2eCount} 件ありますが、対応するPlaywright実装が見つかりません。期待: frontend/tests/e2e/generated/pr-${pr.number}-*.spec.ts`);
    process.exit(1);
  }
  const metaDir = path.join(root, 'qa', 'test-management', '.meta');
  ensureDir(metaDir);
  const generatedPlan = path.relative(root, planPath).replace(/\\/g, '/');
  const metaPath = path.join(metaDir, `pr-${pr.number}.json`);
  fs.writeFileSync(metaPath, JSON.stringify({ pr: pr.number, title: pr.title, url: pr.url, e2eCount, manualCount, integrationCount, generatedSpec, generatedPlan, updatedAt: new Date().toISOString() }, null, 2), 'utf8');
  console.log(`Validated assets for PR #${pr.number}`);
  console.log(`Plan: ${generatedPlan}`);
  console.log(`Spec: ${generatedSpec || '(none)'}`);
  console.log(`Meta: ${path.relative(root, metaPath)}`);
}

// ─────────────────────────────────────────────
// generate-assets  (was: generate-pr-test-assets.js)
// ─────────────────────────────────────────────

function slugify(input) {
  return String(input || '').toLowerCase().replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf\-_\s]/g, '').trim().replace(/\s+/g, '-').slice(0, 80);
}

function extractChecklistInSection(body, headingPatterns) {
  if (!body) return [];
  const lines = body.split(/\r?\n/);
  const headings = headingPatterns.map((p) => new RegExp(p, 'i'));
  let inSection = false;
  const items = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (/^##\s+/.test(line)) { inSection = headings.some((re) => re.test(line)); continue; }
    if (!inSection) continue;
    const m = line.match(/^-\s*\[( |x|X)\]\s+(.+)$/);
    if (m) items.push({ checked: /x/i.test(m[1]), text: m[2].trim() });
  }
  return items;
}

function uniqueByText(items) {
  const seen = new Set();
  return items.filter((it) => { const key = it.text; if (seen.has(key)) return false; seen.add(key); return true; });
}

function toTableRows(items, prefix) {
  if (!items.length) return `| ${prefix}-001 | (未記入) | TODO |\n`;
  return items.map((item, i) => `| ${prefix}-${String(i + 1).padStart(3, '0')} | ${item.text} | ${item.checked ? 'DONE' : 'TODO'} |`).join('\n') + '\n';
}

function buildPlanMarkdown(meta, e2eItems, manualItems, integrationItems, playwrightPath) {
  const today = new Date().toISOString();
  return `# PR #${meta.number} テスト設計・総合テスト項目\n\n` +
    `- PR: ${meta.url}\n- タイトル: ${meta.title}\n- 作成者: @${meta.user}\n- 生成日時: ${today}\n\n` +
    `## 1. テスト設計（概要）\n\n- 本PRの変更に対して、E2Eと手動テストの両方で検証します。\n- E2E項目は Playwright へ反映（雛形生成）し、実装・具体化を進めます。\n- 手動テストは受け入れ観点・探索観点を中心に実施します。\n\n` +
    `## 2. E2Eテスト項目\n\n| ID | 項目 | 状態 |\n|---|---|---|\n` +
    toTableRows(e2eItems, 'E2E') + `\nPlaywright ファイル: \`${playwrightPath}\`\n\n` +
    `## 3. 手動テスト項目\n\n| ID | 項目 | 状態 |\n|---|---|---|\n` +
    toTableRows(manualItems, 'MAN') + '\n' +
    `## 4. 総合テスト項目\n\n| ID | 項目 | 状態 |\n|---|---|---|\n` +
    toTableRows(integrationItems, 'INT') + '\n' +
    `## 5. 備考\n\n- 生成元はPR本文のチェックリストです。\n- 項目が未記入の場合は \`(未記入)\` を出力します。\n`;
}

function buildPlaywrightSpec(meta, e2eItems, integrationItems) {
  const merged = uniqueByText([...e2eItems, ...integrationItems]);
  const todos = merged.length ? merged : [{ text: 'PR本文のE2E/総合テスト項目を記入してください。' }];
  const title = meta.title.replace(/`/g, '\\`');
  return `import { test } from '@playwright/test';\n\ntest.describe('PR #${meta.number}: ${title}', () => {\n` +
    todos.map((it) => `  test.skip(${JSON.stringify(it.text)}, async () => {\n    // Generated placeholder. Replace with a concrete Playwright scenario when ready.\n  });`).join('\n\n') +
    '\n});\n';
}

function mainGenerateAssets() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  let pr = null;
  if (eventPath && fs.existsSync(eventPath)) {
    try { const event = JSON.parse(fs.readFileSync(eventPath, 'utf8')); pr = event.pull_request || null; } catch { pr = null; }
  }
  if (!pr && process.env.PR_NUMBER) {
    const decodedBody = process.env.PR_BODY_B64 ? Buffer.from(process.env.PR_BODY_B64, 'base64').toString('utf8') : '';
    pr = { number: Number(process.env.PR_NUMBER), title: process.env.PR_TITLE || 'Untitled PR', body: decodedBody, user: { login: process.env.PR_USER || 'unknown' }, html_url: process.env.PR_URL || '' };
  }
  if (!pr) { console.error('No pull_request payload found.'); process.exit(1); }
  const prMeta = { number: pr.number, title: pr.title || 'Untitled PR', body: pr.body || '', user: pr.user?.login || 'unknown', url: pr.html_url || '' };
  const e2eItems = uniqueByText(extractChecklistInSection(prMeta.body, ['^##\\s*e2e\\s*test\\s*items', '^##\\s*e2e\\s*テスト\\s*項目', '^##\\s*test\\s*design\\s*\\(e2e\\)', '^##\\s*テスト設計\\s*\\(e2e\\)']));
  const manualItems = uniqueByText(extractChecklistInSection(prMeta.body, ['^##\\s*manual\\s*test\\s*items', '^##\\s*手動\\s*テスト\\s*項目', '^##\\s*test\\s*design\\s*\\(manual\\)', '^##\\s*テスト設計\\s*\\(manual\\)']));
  const integrationItems = uniqueByText(extractChecklistInSection(prMeta.body, ['^##\\s*integration\\s*test\\s*items', '^##\\s*総合\\s*テスト\\s*項目']));
  const root = process.env.PR_TEST_PLAN_OUTPUT_ROOT || process.cwd();
  const planDir = path.join(root, 'qa', 'test-management', 'pr');
  const dashboardDataDir = path.join(root, 'qa', 'test-management', '.meta');
  const generatedE2EDir = path.join(root, 'frontend', 'tests', 'e2e', 'generated');
  ensureDir(planDir); ensureDir(dashboardDataDir); ensureDir(generatedE2EDir);
  const planPath = path.join(planDir, `PR-${prMeta.number}-test-plan.md`);
  const specPath = path.join(generatedE2EDir, `pr-${prMeta.number}-${slugify(prMeta.title) || 'feature'}.spec.ts`);
  const relativeSpecPath = path.relative(root, specPath).replace(/\\/g, '/');
  fs.writeFileSync(planPath, buildPlanMarkdown(prMeta, e2eItems, manualItems, integrationItems, relativeSpecPath), 'utf8');
  fs.writeFileSync(specPath, buildPlaywrightSpec(prMeta, e2eItems, integrationItems), 'utf8');
  const metaPath = path.join(dashboardDataDir, `pr-${prMeta.number}.json`);
  fs.writeFileSync(metaPath, JSON.stringify({ pr: prMeta.number, title: prMeta.title, url: prMeta.url, e2eCount: e2eItems.length, manualCount: manualItems.length, integrationCount: integrationItems.length, generatedSpec: relativeSpecPath, generatedPlan: path.relative(root, planPath).replace(/\\/g, '/'), updatedAt: new Date().toISOString() }, null, 2), 'utf8');
  console.log(`Generated: ${planPath}`);
  console.log(`Generated: ${specPath}`);
}

// ─────────────────────────────────────────────
// validate  (was: validate-auto-fix-changes.js)
// ─────────────────────────────────────────────

function parseValidateArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--fix-brief') args.fixBrief = argv[++i];
    else if (arg === '--out') args.out = argv[++i];
  }
  return args;
}

function listChangedFiles() {
  const tracked = execSync('git diff --name-only HEAD --', { encoding: 'utf8' }).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const untracked = execSync('git ls-files --others --exclude-standard', { encoding: 'utf8' }).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return unique([...tracked, ...untracked]);
}

function mainValidate(argv) {
  const args = parseValidateArgs(argv);
  if (!args.fixBrief) throw new Error('Usage: node scripts/pr-tools.js validate --fix-brief <path> [--out path]');
  const payload = readJson(args.fixBrief);
  const allowedRules = unique([...((payload.details && payload.details.allowedPaths) || []), ...((payload.details && payload.details.candidateFiles) || [])]);
  const changedFiles = listChangedFiles();
  if (changedFiles.length === 0) throw new Error('Auto-fix produced no repository changes.');
  const invalidFiles = changedFiles.filter((file) => !allowedRules.some((rule) => pathMatchesRule(file, rule)));
  const result = { issueNumber: payload.issue?.number, bugPattern: payload.triage?.bugPattern, allowedRules, changedFiles, invalidFiles };
  if (args.out) {
    const outputPath = path.resolve(args.out);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
  }
  if (invalidFiles.length > 0) throw new Error(`Auto-fix touched files outside allowed paths: ${invalidFiles.join(', ')}`);
  console.log(JSON.stringify(result, null, 2));
}

// ─────────────────────────────────────────────
// Dispatcher
// ─────────────────────────────────────────────

function main() {
  const command = process.argv[2];
  const argv = process.argv.slice(3);

  try {
    switch (command) {
      case 'generate-pr-draft':
        mainPrDraft(argv);
        break;
      case 'collect-meta':
        mainCollectMeta();
        break;
      case 'generate-assets':
        mainGenerateAssets();
        break;
      case 'validate':
        mainValidate(argv);
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.error('Available commands: generate-pr-draft, collect-meta, generate-assets, validate');
        process.exit(1);
    }
  } catch (error) {
    console.error(error.message || String(error));
    process.exit(1);
  }
}

main();
