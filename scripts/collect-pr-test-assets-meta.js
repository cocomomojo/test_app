#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function extractSection(content, headingText) {
  const lines = content.split(/\r?\n/);
  const start = lines.findIndex((l) => new RegExp(`^##\\s+${headingText}\\s*$`, 'i').test(l.trim()));
  if (start < 0) return '';

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i].trim())) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end).join('\n');
}

function countTableItems(section) {
  if (!section) return 0;
  const lines = section.split(/\r?\n/).map((l) => l.trim());
  const rows = lines.filter((l) => /^\|/.test(l));
  // header + separator rows are not items
  const itemRows = rows.filter((l) => !/^\|\s*-+/.test(l) && !/^\|\s*ID\s*\|/i.test(l));
  return itemRows.length;
}

function firstMatchByPrefix(dirPath, prefix, suffix) {
  if (!fs.existsSync(dirPath)) return null;
  const matches = fs.readdirSync(dirPath)
    .filter((name) => name.startsWith(prefix) && name.endsWith(suffix))
    .sort();
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

  if (!pr) {
    console.error('No pull_request payload found.');
    process.exit(1);
  }

  return {
    number: Number(pr.number),
    title: pr.title || 'Untitled PR',
    url: pr.html_url || '',
    user: pr.user?.login || 'unknown',
    body: pr.body || '',
  };
}

function main() {
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
  fs.writeFileSync(metaPath, JSON.stringify({
    pr: pr.number,
    title: pr.title,
    url: pr.url,
    e2eCount,
    manualCount,
    integrationCount,
    generatedSpec,
    generatedPlan,
    updatedAt: new Date().toISOString(),
  }, null, 2), 'utf8');

  console.log(`Validated assets for PR #${pr.number}`);
  console.log(`Plan: ${generatedPlan}`);
  console.log(`Spec: ${generatedSpec || '(none)'}`);
  console.log(`Meta: ${path.relative(root, metaPath)}`);
}

main();
