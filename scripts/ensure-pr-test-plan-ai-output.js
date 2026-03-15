#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--simulation-root') args.simulationRoot = argv[++i];
    else if (arg === '--pr-number') args.prNumber = argv[++i];
    else if (arg === '--scenario') args.scenario = argv[++i];
    else if (arg === '--ai-status') args.aiStatus = argv[++i];
    else if (arg === '--reason') args.reason = argv[++i];
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.simulationRoot || !args.prNumber) {
    console.error('Usage: node scripts/ensure-pr-test-plan-ai-output.js --simulation-root <path> --pr-number <number> [--scenario <name>] [--ai-status <status>] [--reason <text>]');
    process.exit(1);
  }

  const simulationRoot = path.resolve(args.simulationRoot);
  const prNumber = String(args.prNumber);
  const scenario = args.scenario || 'normal';
  const aiStatus = args.aiStatus || 'fallback';
  const reason = args.reason || 'Copilot による提案生成結果を取得できなかったため、fallback を作成しました。';
  const outputPath = path.join(simulationRoot, 'qa', 'test-management', 'ai', `pr-${prNumber}-ai-suggestions.md`);

  if (fs.existsSync(outputPath)) {
    const content = fs.readFileSync(outputPath, 'utf8').trim();
    if (content.length > 0) {
      console.log(outputPath);
      return;
    }
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const body = [
    '# AI Test Plan Suggestions',
    '',
    '## 概要',
    `- status: ${aiStatus}`,
    `- scenario: ${scenario}`,
    `- reason: ${reason}`,
    '',
    '## 追加候補（E2E / 手動 / 総合）',
    '- Copilot 提案が未生成のため、人レビューで補完してください。',
    '',
    '## 優先度付きレビュー観点',
    '- 高: PR本文の主要導線が test plan に反映されているか確認する。',
    '- 中: branch sync 条件（fork / draft / label / token）と運用意図が一致しているか確認する。',
    '',
    '## branch反映ポリシー観点での注意点',
    '- simulation は生成AI連携の動線確認用です。実運用前に secret / label / review 手順を確認してください。',
    '',
    '## Human review メモ',
    '- このファイルは fallback です。必要に応じて Copilot 実行結果と差し替えてください。',
  ].join('\n');

  fs.writeFileSync(outputPath, `${body}\n`, 'utf8');
  console.log(outputPath);
}

main();