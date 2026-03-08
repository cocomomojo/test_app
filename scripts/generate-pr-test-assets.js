#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf\-_\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

function extractChecklistInSection(body, headingPatterns) {
  if (!body) return [];
  const lines = body.split(/\r?\n/);
  const headings = headingPatterns.map((p) => new RegExp(p, 'i'));

  let inSection = false;
  const items = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (/^##\s+/.test(line)) {
      inSection = headings.some((re) => re.test(line));
      continue;
    }

    if (!inSection) continue;

    const m = line.match(/^-\s*\[( |x|X)\]\s+(.+)$/);
    if (m) {
      items.push({
        checked: /x/i.test(m[1]),
        text: m[2].trim(),
      });
    }
  }
  return items;
}

function uniqueByText(items) {
  const seen = new Set();
  return items.filter((it) => {
    const key = it.text;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function toTableRows(items, prefix) {
  if (!items.length) {
    return `| ${prefix}-001 | (未記入) | TODO |\n`;
  }
  return items
    .map((item, i) => `| ${prefix}-${String(i + 1).padStart(3, '0')} | ${item.text} | ${item.checked ? 'DONE' : 'TODO'} |`)
    .join('\n') + '\n';
}

function buildPlanMarkdown(meta, e2eItems, manualItems, integrationItems, playwrightPath) {
  const today = new Date().toISOString();
  return `# PR #${meta.number} テスト設計・総合テスト項目\n\n` +
`- PR: ${meta.url}\n` +
`- タイトル: ${meta.title}\n` +
`- 作成者: @${meta.user}\n` +
`- 生成日時: ${today}\n\n` +
`## 1. テスト設計（概要）\n\n` +
`- 本PRの変更に対して、E2Eと手動テストの両方で検証します。\n` +
`- E2E項目は Playwright へ反映（雛形生成）し、実装・具体化を進めます。\n` +
`- 手動テストは受け入れ観点・探索観点を中心に実施します。\n\n` +
`## 2. E2Eテスト項目\n\n` +
`| ID | 項目 | 状態 |\n|---|---|---|\n` +
toTableRows(e2eItems, 'E2E') + '\n' +
`Playwright ファイル: \`${playwrightPath}\`\n\n` +
`## 3. 手動テスト項目\n\n` +
`| ID | 項目 | 状態 |\n|---|---|---|\n` +
toTableRows(manualItems, 'MAN') + '\n' +
`## 4. 総合テスト項目\n\n` +
`| ID | 項目 | 状態 |\n|---|---|---|\n` +
toTableRows(integrationItems, 'INT') + '\n' +
`## 5. 備考\n\n` +
`- 生成元はPR本文のチェックリストです。\n` +
`- 項目が未記入の場合は \`(未記入)\` を出力します。\n`;
}

function buildPlaywrightSpec(meta, e2eItems, integrationItems) {
  const merged = uniqueByText([...e2eItems, ...integrationItems]);
  const todos = merged.length ? merged : [{ text: 'PR本文のE2E/総合テスト項目を記入してください。' }];

  const title = meta.title.replace(/`/g, '\\`');

  return `import { test } from '@playwright/test';\n\n` +
`test.describe('PR #${meta.number}: ${title}', () => {\n` +
todos.map((it) =>
  `  test.skip(${JSON.stringify(it.text)}, async () => {\n` +
  `    // Generated placeholder. Replace with a concrete Playwright scenario when ready.\n` +
  `  });`
).join('\n\n') + '\n' +
`});\n`;
}

function main() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  let pr = null;
  if (eventPath && fs.existsSync(eventPath)) {
    try {
      const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
      pr = event.pull_request || null;
    } catch {
      pr = null;
    }
  }

  // workflow_dispatch など pull_request ペイロードが無い場合のフォールバック
  if (!pr && process.env.PR_NUMBER) {
    const decodedBody = process.env.PR_BODY_B64
      ? Buffer.from(process.env.PR_BODY_B64, 'base64').toString('utf8')
      : '';
    pr = {
      number: Number(process.env.PR_NUMBER),
      title: process.env.PR_TITLE || 'Untitled PR',
      body: decodedBody,
      user: { login: process.env.PR_USER || 'unknown' },
      html_url: process.env.PR_URL || '',
    };
  }

  if (!pr) {
    console.error('No pull_request payload found.');
    process.exit(1);
  }

  const prMeta = {
    number: pr.number,
    title: pr.title || 'Untitled PR',
    body: pr.body || '',
    user: pr.user?.login || 'unknown',
    url: pr.html_url || '',
  };

  const e2eItems = uniqueByText(extractChecklistInSection(prMeta.body, [
    '^##\\s*e2e\\s*test\\s*items',
    '^##\\s*e2e\\s*テスト\\s*項目',
    '^##\\s*test\\s*design\\s*\\(e2e\\)',
    '^##\\s*テスト設計\\s*\\(e2e\\)',
  ]));

  const manualItems = uniqueByText(extractChecklistInSection(prMeta.body, [
    '^##\\s*manual\\s*test\\s*items',
    '^##\\s*手動\\s*テスト\\s*項目',
    '^##\\s*test\\s*design\\s*\\(manual\\)',
    '^##\\s*テスト設計\\s*\\(manual\\)',
  ]));

  const integrationItems = uniqueByText(extractChecklistInSection(prMeta.body, [
    '^##\\s*integration\\s*test\\s*items',
    '^##\\s*総合\\s*テスト\\s*項目',
  ]));

  const root = process.cwd();
  const planDir = path.join(root, 'qa', 'test-management', 'pr');
  const dashboardDataDir = path.join(root, 'qa', 'test-management', '.meta');
  const generatedE2EDir = path.join(root, 'frontend', 'tests', 'e2e', 'generated');
  ensureDir(planDir);
  ensureDir(dashboardDataDir);
  ensureDir(generatedE2EDir);

  const planPath = path.join(planDir, `PR-${prMeta.number}-test-plan.md`);
  const specPath = path.join(generatedE2EDir, `pr-${prMeta.number}-${slugify(prMeta.title) || 'feature'}.spec.ts`);

  const relativeSpecPath = path.relative(root, specPath).replace(/\\/g, '/');
  const planContent = buildPlanMarkdown(prMeta, e2eItems, manualItems, integrationItems, relativeSpecPath);
  fs.writeFileSync(planPath, planContent, 'utf8');

  const specContent = buildPlaywrightSpec(prMeta, e2eItems, integrationItems);
  fs.writeFileSync(specPath, specContent, 'utf8');

  const metaPath = path.join(dashboardDataDir, `pr-${prMeta.number}.json`);
  fs.writeFileSync(metaPath, JSON.stringify({
    pr: prMeta.number,
    title: prMeta.title,
    url: prMeta.url,
    e2eCount: e2eItems.length,
    manualCount: manualItems.length,
    integrationCount: integrationItems.length,
    generatedSpec: relativeSpecPath,
    generatedPlan: path.relative(root, planPath).replace(/\\/g, '/'),
    updatedAt: new Date().toISOString(),
  }, null, 2), 'utf8');

  console.log(`Generated: ${planPath}`);
  console.log(`Generated: ${specPath}`);
}

main();
