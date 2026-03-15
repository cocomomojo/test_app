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
    else if (arg === '--required-label') args.requiredLabel = argv[++i];
    else if (arg === '--out') args.out = argv[++i];
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.simulationRoot || !args.prNumber || !args.out) {
    console.error('Usage: node scripts/generate-pr-test-plan-ai-prompt.js --simulation-root <path> --pr-number <number> --scenario <name> --required-label <label> --out <path>');
    process.exit(1);
  }

  const repoRoot = process.cwd();
  const simulationRoot = path.resolve(args.simulationRoot);
  const prNumber = String(args.prNumber);
  const scenario = args.scenario || 'normal';
  const requiredLabel = args.requiredLabel || 'test-plan-sync';
  const aiOutput = path.join(simulationRoot, 'qa', 'test-management', 'ai', `pr-${prNumber}-ai-suggestions.md`);
  const planPath = path.join(simulationRoot, 'qa', 'test-management', 'pr', `PR-${prNumber}-test-plan.md`);
  const metaPath = path.join(simulationRoot, 'qa', 'test-management', '.meta', `pr-${prNumber}.json`);
  const dashboardPath = path.join(simulationRoot, 'qa', 'test-management', 'dashboard.md');

  const prompt = [
    'あなたは GitHub Actions 上で PR test plan を改善する GitHub Copilot です。',
    '',
    `対象PR番号: #${prNumber}`,
    `シミュレーションシナリオ: ${scenario}`,
    `required label: ${requiredLabel}`,
    '',
    '利用可能な材料:',
    `- リポジトリ一式: ${repoRoot}`,
    `- simulation root: ${simulationRoot}`,
    `- test plan: ${planPath}`,
    `- meta: ${metaPath}`,
    `- dashboard: ${dashboardPath}`,
    '',
    'タスク:',
    `1. ${planPath} と ${metaPath} を読み、テスト観点の不足や改善候補を整理する。`,
    `2. ${aiOutput} を UTF-8 Markdown で作成する。`,
    '3. 変更してよいファイルは上記 Markdown 1 ファイルだけ。既存の test plan / meta / dashboard は変更しない。',
    '',
    'Markdown の構成:',
    '- # AI Test Plan Suggestions',
    '- 概要',
    '- 追加候補（E2E / 手動 / 総合）',
    '- 優先度付きレビュー観点',
    '- branch反映ポリシー観点での注意点',
    '- Human review メモ',
    '',
    '制約:',
    '- 日本語で書くこと。',
    '- 推測は「仮説」と明記すること。',
    '- 過剰テストを避け、重要度順に箇条書きにすること。',
    '- branch sync 条件（fork/draft/label/token）を踏まえたコメントを入れること。',
    `- 出力先は ${aiOutput} のみ。`,
  ].join('\n');

  const outPath = path.resolve(args.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, prompt, 'utf8');
  console.log(outPath);
}

main();