#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function main() {
  const root = process.cwd();
  const metaDir = path.join(root, 'qa', 'test-management', '.meta');
  const outputDir = path.join(root, 'qa', 'test-management');
  const outputFile = path.join(outputDir, 'dashboard.md');

  ensureDir(metaDir);
  ensureDir(outputDir);

  const rows = fs
    .readdirSync(metaDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => readJsonSafe(path.join(metaDir, f)))
    .filter(Boolean)
    .sort((a, b) => (a.pr < b.pr ? 1 : -1));

  const totals = rows.reduce(
    (acc, row) => {
      acc.pr += 1;
      acc.e2e += row.e2eCount || 0;
      acc.manual += row.manualCount || 0;
      acc.integration += row.integrationCount || 0;
      return acc;
    },
    { pr: 0, e2e: 0, manual: 0, integration: 0 }
  );

  const header = `# Test Management Dashboard\n\n` +
`最終更新: ${new Date().toISOString()}\n\n` +
`## 集計\n\n` +
`- 対象PR数: **${totals.pr}**\n` +
`- E2E項目数: **${totals.e2e}**\n` +
`- 手動項目数: **${totals.manual}**\n` +
`- 総合項目数: **${totals.integration}**\n\n` +
`## PR別テスト計画\n\n` +
`| PR | タイトル | E2E | 手動 | 総合 | テスト計画 | Playwright |
\n|---:|---|---:|---:|---:|---|---|\n`;

  const table = rows
    .map((row) => {
      const prLink = row.url ? `[#${row.pr}](${row.url})` : `#${row.pr}`;
      const planLink = row.generatedPlan ? `[plan](/${row.generatedPlan})` : '-';
      const specLink = row.generatedSpec ? `[spec](/${row.generatedSpec})` : '-';
      return `| ${prLink} | ${row.title} | ${row.e2eCount || 0} | ${row.manualCount || 0} | ${row.integrationCount || 0} | ${planLink} | ${specLink} |`;
    })
    .join('\n');

  const guidance = `\n\n## 運用ルール\n\n` +
`- PR本文のチェックリストを更新すると、本ダッシュボードが再集計されます。\n` +
`- E2E/総合テスト項目は Playwright 雛形に反映されます。\n` +
`- 手動テスト項目は PRレビュー時に確認・実施してください。\n`;

  fs.writeFileSync(outputFile, header + (table || '') + guidance, 'utf8');
  console.log(`Updated dashboard: ${outputFile}`);
}

main();
