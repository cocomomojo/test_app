#!/usr/bin/env node

/**
 * dashboard-tools.js — consolidated dashboard and AI prompt scripts
 *
 * Subcommands:
 *   update-dashboard      update-test-dashboard
 *   publication-mode      pr-test-plan-publication-mode
 *   generate-ai-prompt    generate-pr-test-plan-ai-prompt
 *   ensure-ai-output      ensure-pr-test-plan-ai-output
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────
// Shared utilities
// ─────────────────────────────────────────────

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJsonSafe(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return null; }
}

// ─────────────────────────────────────────────
// update-dashboard  (was: update-test-dashboard.js)
// ─────────────────────────────────────────────

function mainUpdateDashboard() {
  const root = process.env.PR_TEST_PLAN_OUTPUT_ROOT || process.cwd();
  const metaDir = path.join(root, 'qa', 'test-management', '.meta');
  const outputDir = path.join(root, 'qa', 'test-management');
  const outputFile = path.join(outputDir, 'dashboard.md');
  ensureDir(metaDir);
  ensureDir(outputDir);

  const rows = fs.readdirSync(metaDir).filter((f) => f.endsWith('.json'))
    .map((f) => readJsonSafe(path.join(metaDir, f))).filter(Boolean).sort((a, b) => (a.pr < b.pr ? 1 : -1));

  const totals = rows.reduce((acc, row) => { acc.pr += 1; acc.e2e += row.e2eCount || 0; acc.manual += row.manualCount || 0; acc.integration += row.integrationCount || 0; return acc; }, { pr: 0, e2e: 0, manual: 0, integration: 0 });

  const header = `# Test Management Dashboard\n\n最終更新: ${new Date().toISOString()}\n\n## 集計\n\n- 対象PR数: **${totals.pr}**\n- E2E項目数: **${totals.e2e}**\n- 手動項目数: **${totals.manual}**\n- 総合項目数: **${totals.integration}**\n\n## PR別テスト計画\n\n| PR | タイトル | E2E | 手動 | 総合 | テスト計画 | Playwright |\n|---:|---|---:|---:|---:|---|---|\n`;

  const table = rows.map((row) => {
    const prLink = row.url ? `[#${row.pr}](${row.url})` : `#${row.pr}`;
    const planLink = row.generatedPlan ? `[plan](/${row.generatedPlan})` : '-';
    const specLink = row.generatedSpec ? `[spec](/${row.generatedSpec})` : '-';
    return `| ${prLink} | ${row.title} | ${row.e2eCount || 0} | ${row.manualCount || 0} | ${row.integrationCount || 0} | ${planLink} | ${specLink} |`;
  }).join('\n');

  const guidance = `\n\n## 運用ルール\n\n- PR本文のチェックリストを更新すると、本ダッシュボードが再集計されます。\n- E2E/総合テスト項目は Playwright 雛形に反映されます。\n- 手動テスト項目は PRレビュー時に確認・実施してください。\n`;

  fs.writeFileSync(outputFile, header + (table || '') + guidance, 'utf8');
  console.log(`Updated dashboard: ${outputFile}`);
}

// ─────────────────────────────────────────────
// publication-mode  (was: pr-test-plan-publication-mode.js)
// ─────────────────────────────────────────────

function toBool(value) {
  return String(value).toLowerCase() === 'true';
}

function loadLabels(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return String(raw).split(',').map((item) => item.trim()).filter(Boolean);
  }
}

function evaluatePublicationMode(options) {
  const requiredLabel = options.pushLabel || 'test-plan-sync';
  const labels = loadLabels(options.labels);
  const hasRequiredLabel = labels.includes(requiredLabel);
  const isFork = toBool(options.isFork);
  const isDraft = toBool(options.isDraft);
  const pushEnabled = toBool(options.pushEnabled);
  const tokenConfigured = toBool(options.tokenConfigured);
  const pushTokenAvailable = options.pushTokenAvailable !== undefined ? toBool(options.pushTokenAvailable) : tokenConfigured;
  const sameRepo = (options.headRepo || '') === (options.baseRepo || '');
  const prNumber = String(options.prNumber || 'unknown');

  const result = { prNumber, artifactName: `pr-test-assets-${prNumber}`, requiredLabel, hasRequiredLabel, isFork, isDraft, sameRepo, commentMode: 'comment-and-summary', branchSyncEnabled: false, branchSyncReason: '' };

  if (isFork) {
    result.commentMode = 'summary-only';
    result.branchSyncReason = 'fork PR のため branch 反映は行わず、artifact と workflow summary のみ提供';
  } else if (isDraft) {
    result.branchSyncReason = 'draft PR のため branch 反映をスキップ';
  } else if (!sameRepo) {
    result.branchSyncReason = '同一リポジトリPRではないため branch 反映をスキップ';
  } else if (!pushEnabled) {
    result.branchSyncReason = 'PR_TEST_PLAN_PUSH_ENABLED が true ではないため branch 反映をスキップ';
  } else if (!hasRequiredLabel) {
    result.branchSyncReason = `required label (${requiredLabel}) が付いていないため branch 反映をスキップ`;
  } else if (!tokenConfigured && !pushTokenAvailable) {
    result.branchSyncReason = 'PR_TEST_PLAN_GITHUB_TOKEN も GITHUB_TOKEN も利用できないため branch 反映をスキップ';
  } else {
    result.branchSyncEnabled = true;
    result.branchSyncReason = '同一リポジトリPRかつ push 条件を満たしたため branch 反映を実施';
  }

  return result;
}

function writeGithubOutput(result) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) return;
  const lines = [
    `is_fork=${String(result.isFork)}`,
    `artifact_name=${result.artifactName}`,
    `required_label=${result.requiredLabel}`,
    `has_required_label=${String(result.hasRequiredLabel)}`,
    `comment_mode=${result.commentMode}`,
    `branch_sync_enabled=${String(result.branchSyncEnabled)}`,
    `branch_sync_reason=${result.branchSyncReason}`,
  ];
  fs.appendFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8');
}

function mainPublicationMode() {
  const result = evaluatePublicationMode({
    prNumber: process.env.PR_NUMBER,
    isFork: process.env.IS_FORK,
    isDraft: process.env.PR_IS_DRAFT,
    headRepo: process.env.HEAD_REPO,
    baseRepo: process.env.BASE_REPO,
    pushEnabled: process.env.PR_TEST_PLAN_PUSH_ENABLED,
    pushLabel: process.env.PR_TEST_PLAN_PUSH_LABEL,
    tokenConfigured: process.env.PR_TEST_PLAN_GITHUB_TOKEN_CONFIGURED,
    pushTokenAvailable: process.env.PUSH_TOKEN_AVAILABLE,
    labels: process.env.PR_LABELS_JSON,
  });

  writeGithubOutput(result);

  if (process.argv.includes('--json')) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  const lines = [
    `comment_mode=${result.commentMode}`,
    `branch_sync_enabled=${String(result.branchSyncEnabled)}`,
    `branch_sync_reason=${result.branchSyncReason}`,
    `required_label=${result.requiredLabel}`,
    `has_required_label=${String(result.hasRequiredLabel)}`,
    `artifact_name=${result.artifactName}`,
  ];
  process.stdout.write(`${lines.join('\n')}\n`);
}

// ─────────────────────────────────────────────
// generate-ai-prompt  (was: generate-pr-test-plan-ai-prompt.js)
// ─────────────────────────────────────────────

function parseAiPromptArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--simulation-root') args.simulationRoot = argv[++i];
    else if (arg === '--pr-number') args.prNumber = argv[++i];
    else if (arg === '--scenario') args.scenario = argv[++i];
    else if (arg === '--required-label') args.requiredLabel = argv[++i];
    else if (arg === '--out') args.out = argv[++i];
  }
  return args;
}

function mainGenerateAiPrompt(argv) {
  const args = parseAiPromptArgs(argv);
  if (!args.simulationRoot || !args.prNumber || !args.out) {
    throw new Error('Usage: node scripts/dashboard-tools.js generate-ai-prompt --simulation-root <path> --pr-number <number> --scenario <name> --required-label <label> --out <path>');
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
  ensureDir(path.dirname(outPath));
  fs.writeFileSync(outPath, prompt, 'utf8');
  console.log(outPath);
}

// ─────────────────────────────────────────────
// ensure-ai-output  (was: ensure-pr-test-plan-ai-output.js)
// ─────────────────────────────────────────────

function parseEnsureAiArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--simulation-root') args.simulationRoot = argv[++i];
    else if (arg === '--pr-number') args.prNumber = argv[++i];
    else if (arg === '--scenario') args.scenario = argv[++i];
    else if (arg === '--ai-status') args.aiStatus = argv[++i];
    else if (arg === '--reason') args.reason = argv[++i];
  }
  return args;
}

function mainEnsureAiOutput(argv) {
  const args = parseEnsureAiArgs(argv);
  if (!args.simulationRoot || !args.prNumber) {
    throw new Error('Usage: node scripts/dashboard-tools.js ensure-ai-output --simulation-root <path> --pr-number <number> [--scenario <name>] [--ai-status <status>] [--reason <text>]');
  }
  const simulationRoot = path.resolve(args.simulationRoot);
  const prNumber = String(args.prNumber);
  const scenario = args.scenario || 'normal';
  const aiStatus = args.aiStatus || 'fallback';
  const reason = args.reason || 'Copilot による提案生成結果を取得できなかったため、fallback を作成しました。';
  const outputPath = path.join(simulationRoot, 'qa', 'test-management', 'ai', `pr-${prNumber}-ai-suggestions.md`);

  if (fs.existsSync(outputPath)) {
    const content = fs.readFileSync(outputPath, 'utf8').trim();
    if (content.length > 0) { console.log(outputPath); return; }
  }

  ensureDir(path.dirname(outputPath));
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

// ─────────────────────────────────────────────
// Dispatcher
// ─────────────────────────────────────────────

function main() {
  const command = process.argv[2];
  const argv = process.argv.slice(3);

  try {
    switch (command) {
      case 'update-dashboard':
        mainUpdateDashboard();
        break;
      case 'publication-mode':
        mainPublicationMode();
        break;
      case 'generate-ai-prompt':
        mainGenerateAiPrompt(argv);
        break;
      case 'ensure-ai-output':
        mainEnsureAiOutput(argv);
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.error('Available commands: update-dashboard, publication-mode, generate-ai-prompt, ensure-ai-output');
        process.exit(1);
    }
  } catch (error) {
    console.error(error.message || String(error));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { evaluatePublicationMode };
