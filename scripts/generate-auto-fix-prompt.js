#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {};

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--fix-brief') args.fixBrief = argv[++i];
    else if (arg === '--out') args.out = argv[++i];
  }

  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function buildPatternGuidance(pattern) {
  switch (pattern) {
    case 'frontend-ui-text':
      return [
        'UI実装・unit test・Issue本文の証拠から source of truth を判断すること。',
        '実装文言と unit test がすでに一致している場合は、古い E2E 期待値だけを追随修正することを優先する。',
        'selector や待機条件の変更は、本当に必要な場合に限定すること。',
      ];
    case 'frontend-unit-test':
      return [
        'テストだけを弱める変更ではなく、実装との整合が取れる最小修正を優先すること。',
      ];
    default:
      return [
        'fix brief の candidate files と constraints を守り、最小変更で問題を解消すること。',
      ];
  }
}

function renderPrompt(payload) {
  const issueNumber = payload.issue?.number;
  const issueTitle = payload.issue?.title || 'Untitled Issue';
  const bugPattern = payload.triage?.bugPattern || 'unresolved';
  const severity = payload.triage?.severity || 'unknown';
  const candidateFiles = unique(payload.details?.candidateFiles || []);
  const allowedPaths = unique(payload.details?.allowedPaths || candidateFiles);
  const validationSteps = unique(payload.details?.validationSteps || []);
  const changeConstraints = unique(payload.details?.changeConstraints || []);
  const evidence = unique(payload.details?.evidence || []);
  const patternGuidance = buildPatternGuidance(bugPattern);

  return [
    'あなたは GitHub Actions 上で issue を最小変更で修正する GitHub Copilot です。',
    '',
    `対象 Issue: #${issueNumber} — ${issueTitle}`,
    `bug_pattern: ${bugPattern}`,
    `severity: ${severity}`,
    '',
    '利用可能な材料:',
    `- fix brief JSON: /tmp/auto-fix/output/fix-brief-issue-${issueNumber}.json`,
    `- fix brief Markdown: /tmp/auto-fix/output/fix-brief-issue-${issueNumber}.md`,
    `- PR draft JSON: /tmp/auto-fix/output/pr-draft-issue-${issueNumber}.json`,
    `- PR draft Markdown: /tmp/auto-fix/output/pr-draft-issue-${issueNumber}.md`,
    `- issue payload: /tmp/auto-fix/issue.json`,
    `- triage payload: /tmp/auto-fix/triage.json`,
    `- repository root: ${process.env.GITHUB_WORKSPACE || '${GITHUB_WORKSPACE}'}`,
    '',
    'タスク:',
    '1. fix brief と issue 証拠を読み、根本原因を解消する最小変更を repository 内に加える。',
    '2. 必要なら関連テストも更新するが、無関係なリファクタや広範囲な整理はしない。',
    '3. 作業後に /tmp/auto-fix/output/result.json を UTF-8 JSON で作成する。形式は次のみ:',
    '   {"status":"success|skipped","summary":"...","changedFiles":["..."],"notes":["..."]}',
    '',
    '変更可能パス（この範囲以外は変更禁止）:',
    ...allowedPaths.map((item) => `- ${item}`),
    '',
    '候補ファイル:',
    ...candidateFiles.map((item) => `- ${item}`),
    '',
    'validation 観点:',
    ...validationSteps.map((item) => `- ${item}`),
    '',
    'change constraints:',
    ...changeConstraints.map((item) => `- ${item}`),
    '',
    'pattern guidance:',
    ...patternGuidance.map((item) => `- ${item}`),
    '',
    'evidence:',
    ...(evidence.length > 0 ? evidence.map((item) => `- ${item}`) : ['- (抽出なし)']),
    '',
    '制約:',
    '- allowed path の外は変更しないこと。',
    '- workflow / docs / infra は allowed path に含まれない限り変更しないこと。',
    '- 文字コードは UTF-8 を維持すること。',
    '- 既存スタイル・命名・インデントを尊重すること。',
    '- 安全な修正が判断できない場合は repository を変更せず、result.json に skipped 理由を書くこと。',
  ].join('\n');
}

function main() {
  try {
    const args = parseArgs(process.argv);
    if (!args.fixBrief || !args.out) {
      throw new Error('Usage: node scripts/generate-auto-fix-prompt.js --fix-brief <path> --out <path>');
    }

    const payload = readJson(args.fixBrief);
    const prompt = renderPrompt(payload);
    const outputPath = path.resolve(args.out);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, prompt, 'utf8');
    console.log(outputPath);
  } catch (error) {
    console.error(error.message || String(error));
    process.exit(1);
  }
}

main();