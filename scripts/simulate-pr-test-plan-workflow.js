#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const { evaluatePublicationMode } = require('./dashboard-tools');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = 'true';
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function toBool(value, fallback = false) {
  if (value === undefined) return fallback;
  return String(value).toLowerCase() === 'true';
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function runNodeScript(scriptPath, env, args = []) {
  execFileSync(process.execPath, [scriptPath, ...args], {
    cwd: path.resolve(__dirname, '..'),
    env,
    stdio: 'inherit',
  });
}

function main() {
  const args = parseArgs(process.argv);
  const repoRoot = path.resolve(__dirname, '..');
  const prNumber = args['pr-number'] || '99901';
  const title = args.title || 'Simulation PR for test plan workflow';
  const body = args.body || [
    '## E2Eテスト項目',
    '- [ ] ログイン後に一覧が表示される',
    '- [ ] 編集後に保存結果が表示される',
    '',
    '## 手動テスト項目',
    '- [ ] エラーメッセージの文言を確認する',
    '',
    '## 総合テスト項目',
    '- [ ] API連携を含めて保存処理を確認する',
  ].join('\n');

  const simulationRoot = args['output-root']
    ? path.resolve(repoRoot, args['output-root'])
    : fs.mkdtempSync(path.join(os.tmpdir(), 'pr-test-plan-sim-'));
  ensureDir(simulationRoot);

  const labels = (args.labels || 'test-plan-sync').split(',').map((item) => item.trim()).filter(Boolean);
  const context = {
    prNumber,
    isFork: toBool(args.fork, false),
    isDraft: toBool(args.draft, false),
    headRepo: args['head-repo'] || 'cocomomojo/test_app',
    baseRepo: args['base-repo'] || 'cocomomojo/test_app',
    pushEnabled: toBool(args['push-enabled'], true),
    pushLabel: args['push-label'] || 'test-plan-sync',
    tokenConfigured: toBool(args['token-configured'], true),
    labels: JSON.stringify(labels),
  };

  const publication = evaluatePublicationMode(context);

  const env = {
    ...process.env,
    PR_TEST_PLAN_OUTPUT_ROOT: simulationRoot,
    PR_NUMBER: String(prNumber),
    PR_TITLE: title,
    PR_USER: args.user || 'simulation-bot',
    PR_URL: args.url || `https://github.com/cocomomojo/test_app/pull/${prNumber}`,
    PR_BODY_B64: Buffer.from(body, 'utf8').toString('base64'),
    PR_BODY: body,
  };

  runNodeScript(path.join(repoRoot, 'scripts', 'pr-tools.js'), env, ['generate-assets']);
  runNodeScript(path.join(repoRoot, 'scripts', 'pr-tools.js'), env, ['collect-meta']);
  runNodeScript(path.join(repoRoot, 'scripts', 'dashboard-tools.js'), env, ['update-dashboard']);

  const relative = (filePath) => path.relative(repoRoot, filePath).replace(/\\/g, '/');
  const outputFiles = {
    plan: path.join(simulationRoot, 'qa', 'test-management', 'pr', `PR-${prNumber}-test-plan.md`),
    meta: path.join(simulationRoot, 'qa', 'test-management', '.meta', `pr-${prNumber}.json`),
    dashboard: path.join(simulationRoot, 'qa', 'test-management', 'dashboard.md'),
  };
  const generatedDir = path.join(simulationRoot, 'frontend', 'tests', 'e2e', 'generated');
  const specs = fs.existsSync(generatedDir)
    ? fs.readdirSync(generatedDir).filter((name) => name.startsWith(`pr-${prNumber}-`) && name.endsWith('.spec.ts'))
    : [];

  const summaryLines = [
    '# PR Test Plan Simulation',
    '',
    `- simulation root: \`${simulationRoot}\``,
    `- artifact: \`${publication.artifactName}\``,
    `- comment mode: ${publication.commentMode}`,
    `- branch sync enabled: ${publication.branchSyncEnabled}`,
    `- branch sync reason: ${publication.branchSyncReason}`,
    `- required label: ${publication.requiredLabel}`,
    `- labels: ${labels.join(', ') || '(none)'}`,
    '',
    '## Generated files',
    `- plan: \`${relative(outputFiles.plan)}\``,
    `- meta: \`${relative(outputFiles.meta)}\``,
    `- dashboard: \`${relative(outputFiles.dashboard)}\``,
    `- playwright draft: \`${specs.length ? relative(path.join(generatedDir, specs[0])) : '(none)'}\``,
    '',
    '## Artifact download simulation',
    `1. artifact name は \`${publication.artifactName}\``,
    '2. workflow summary と同じ項目をこのローカル出力で確認できる',
    '3. simulation root 配下を zip 化すれば artifact 相当を再現できる',
  ];

  const summaryPath = path.join(simulationRoot, 'qa', 'test-management', 'simulation-summary.md');
  ensureDir(path.dirname(summaryPath));
  fs.writeFileSync(summaryPath, `${summaryLines.join('\n')}\n`, 'utf8');

  process.stdout.write(`${summaryLines.join('\n')}\n`);
  process.stdout.write(`\nsummary: ${summaryPath}\n`);
}

main();