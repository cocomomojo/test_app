#!/usr/bin/env node

/**
 * issue-tools.js — consolidated issue management scripts
 *
 * Subcommands:
 *   classify            classify-issue-pattern
 *   generate-fix-brief  generate-fix-brief
 *   generate-auto-fix-prompt  generate-auto-fix-prompt
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

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

// ─────────────────────────────────────────────
// classify  (was: classify-issue-pattern.js)
// ─────────────────────────────────────────────

const BUG_PATTERNS = {
  FRONTEND_UI_TEXT: 'frontend-ui-text',
  FRONTEND_UNIT_TEST: 'frontend-unit-test',
  BACKEND: 'backend',
  CI_CONFIG: 'ci-config',
  E2E_ENVIRONMENT: 'e2e-environment',
  DOCS_MANUAL: 'docs-manual',
};

const SEVERITIES = ['low', 'medium', 'high', 'critical'];
const MANAGED_LABELS = [
  'ai-fixable',
  'needs-human-triage',
  ...SEVERITIES.map((severity) => `severity:${severity}`),
  ...Object.values(BUG_PATTERNS).map((pattern) => `bug-pattern:${pattern}`),
];

function parseClassifyArgs(argv) {
  const args = { repo: process.env.GITHUB_REPOSITORY || 'cocomomojo/test_app' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--issue') args.issue = argv[++i];
    else if (arg === '--repo') args.repo = argv[++i];
    else if (arg === '--issue-file') args.issueFile = argv[++i];
    else if (arg === '--out') args.out = argv[++i];
  }
  return args;
}

function normalizeIssue(raw) {
  return {
    number: raw.number,
    title: raw.title || '',
    body: raw.body || '',
    url: raw.url || '',
    labels: Array.isArray(raw.labels)
      ? raw.labels.map((label) => {
          if (typeof label === 'string') return label;
          if (label && typeof label.name === 'string') return label.name;
          return String(label || '');
        }).filter(Boolean)
      : [],
  };
}

function loadIssueForClassify({ issue, issueFile, repo }) {
  if (issueFile) {
    return normalizeIssue(readJson(issueFile));
  }
  if (!issue) {
    throw new Error('Usage: node scripts/issue-tools.js classify --issue <number> [--repo owner/repo] [--issue-file path] [--out path]');
  }
  const output = execSync(
    `gh issue view ${issue} --repo ${repo} --json number,title,body,url,labels`,
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
  );
  return normalizeIssue(JSON.parse(output));
}

function hasAny(text, patterns) {
  return patterns.some((pattern) => text.includes(pattern));
}

function hasKeyword(text, keywords) {
  return keywords.some((keyword) => {
    if (/^[a-z0-9_-]+$/i.test(keyword)) {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i').test(text);
    }
    return text.includes(keyword);
  });
}

function extractFormValue(body, heading) {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`###\\s+${escapedHeading}\\s*\\n+([\\s\\S]*?)(?=\\n###\\s+|$)`, 'i');
  const match = body.match(regex);
  if (!match) return null;
  const value = match[1].split(/\r?\n/).map((line) => line.trim()).filter(Boolean).join(' ').trim();
  if (!value || value === '未選択') return null;
  return value;
}

function extractExplicitPattern(issue) {
  const labelPattern = issue.labels.map((label) => label.toLowerCase()).find((label) => label.startsWith('bug-pattern:'));
  if (labelPattern) return labelPattern.replace('bug-pattern:', '');
  const fromBody = extractFormValue(issue.body || '', '不具合パターン（任意）');
  if (fromBody && Object.values(BUG_PATTERNS).includes(fromBody)) return fromBody;
  return null;
}

function detectPattern(issue) {
  const title = issue.title.toLowerCase();
  const body = issue.body.toLowerCase();
  const labels = issue.labels.map((label) => label.toLowerCase());
  const text = `${title}\n${body}`;
  const explicitPattern = extractExplicitPattern(issue);

  if (explicitPattern) return { pattern: explicitPattern, reason: 'Issue form or existing labels explicitly specify the bug pattern.' };
  if (labels.includes('documentation') || labels.includes('manual')) return { pattern: BUG_PATTERNS.DOCS_MANUAL, reason: 'Issue labels indicate documentation/manual work.' };
  if (labels.includes('feature') || labels.includes('enhancement')) return { pattern: null, reason: 'Feature/enhancement issue is outside the bug triage scope.' };
  if (hasAny(text, ['manual', 'wiki/', 'markdown', '操作マニュアル', 'スクリーンショット', 'readme']) && !hasAny(text, ['playwright', 'gradle', 'stack trace', 'workflow'])) return { pattern: BUG_PATTERNS.DOCS_MANUAL, reason: 'Text focuses on documentation/manual artifacts.' };
  if (body.includes('<!-- automated-e2e-failure-analysis -->') && (hasAny(text, ['getbytext', '表示テキスト', '文言', 'tobevisible', 'locator']) || hasAny(text, ['こんばんは', 'こんばんわー']))) return { pattern: BUG_PATTERNS.FRONTEND_UI_TEXT, reason: 'Automated E2E failure issue suggests a UI text mismatch.' };
  if (hasAny(text, ['vitest', '@vue/test-utils', 'wrapper.text()', 'test:unit', 'frontend/tests/unit', 'mount('])) return { pattern: BUG_PATTERNS.FRONTEND_UNIT_TEST, reason: 'Signals point to a frontend unit test failure.' };
  if (hasAny(text, ['docker compose', 'health check', 'mysqladmin ping', 'actuator/health', 'frontend failed to start', 'backend connectivity', 'timeout']) && hasAny(text, ['playwright', 'e2e', 'localhost:8080', 'localhost:8081'])) return { pattern: BUG_PATTERNS.E2E_ENVIRONMENT, reason: 'Issue looks like an E2E environment or service readiness failure.' };
  if (hasAny(text, ['workflow', 'github actions', '.github/workflows', 'yaml', 'permissions', 'dockerfile', 'node version', 'sonarqube'])) return { pattern: BUG_PATTERNS.CI_CONFIG, reason: 'Issue appears related to CI or workflow configuration.' };
  if (hasAny(text, ['spring boot', 'gradle', 'jacoco', 'stack trace', 'exception', 'sql', 'endpoint', 'junit', 'backend/src/main'])) return { pattern: BUG_PATTERNS.BACKEND, reason: 'Issue appears related to backend code or API behavior.' };
  if (hasAny(text, ['playwright', 'getbytext', 'tobevisible', 'locator', '.vue'])) return { pattern: BUG_PATTERNS.FRONTEND_UI_TEXT, reason: 'Issue suggests a frontend/UI E2E mismatch.' };
  return { pattern: null, reason: 'Could not deterministically map the issue to a supported bug pattern.' };
}

function detectSeverity(issue, pattern) {
  const labels = issue.labels.map((label) => label.toLowerCase());
  const text = `${issue.title}\n${issue.body}`.toLowerCase();
  const explicitSeverity = extractFormValue(issue.body || '', '重要度（任意）');

  for (const severity of SEVERITIES) {
    if (labels.includes(`severity:${severity}`) || labels.includes(severity)) return severity;
  }
  if (explicitSeverity && SEVERITIES.includes(explicitSeverity)) return explicitSeverity;
  if (hasKeyword(text, ['critical', 'sev1', 'blocker', '重大'])) return 'critical';
  if (hasKeyword(text, ['high', 'sev2', '緊急'])) return 'high';
  if (hasKeyword(text, ['low', '軽微'])) return 'low';

  switch (pattern) {
    case BUG_PATTERNS.BACKEND:
    case BUG_PATTERNS.CI_CONFIG:
    case BUG_PATTERNS.E2E_ENVIRONMENT:
      return 'high';
    case BUG_PATTERNS.DOCS_MANUAL:
      return 'low';
    case BUG_PATTERNS.FRONTEND_UI_TEXT:
    case BUG_PATTERNS.FRONTEND_UNIT_TEST:
      return 'medium';
    default:
      return 'medium';
  }
}

function buildClassifyResult(issue) {
  const { pattern, reason } = detectPattern(issue);
  const severity = detectSeverity(issue, pattern);
  const aiFixable = Boolean(pattern);
  const labelsToAdd = [];
  if (pattern) labelsToAdd.push(`bug-pattern:${pattern}`);
  if (severity) labelsToAdd.push(`severity:${severity}`);
  labelsToAdd.push(aiFixable ? 'ai-fixable' : 'needs-human-triage');
  const labelsToRemove = MANAGED_LABELS.filter((label) => !labelsToAdd.includes(label));
  return {
    issueNumber: issue.number,
    issueUrl: issue.url,
    bugPattern: pattern,
    severity,
    aiFixable,
    reason,
    labelsToAdd,
    labelsToRemove,
    summary: aiFixable
      ? `Pattern=${pattern}, severity=${severity}, ai_fixable=true`
      : `Pattern unresolved, severity=${severity}, ai_fixable=false`,
  };
}

function mainClassify(argv) {
  const args = parseClassifyArgs(argv);
  const issue = loadIssueForClassify(args);
  const result = buildClassifyResult(issue);
  const output = JSON.stringify(result, null, 2);
  if (args.out) {
    const outputPath = path.resolve(args.out);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, output, 'utf8');
    console.log(`Generated: ${outputPath}`);
  } else {
    console.log(output);
  }
}

// ─────────────────────────────────────────────
// generate-fix-brief  (was: generate-fix-brief.js)
// ─────────────────────────────────────────────

function parseFixBriefArgs(argv) {
  const args = {
    repo: process.env.GITHUB_REPOSITORY || 'cocomomojo/test_app',
    outDir: path.join(process.cwd(), 'qa', 'test-management', 'generated'),
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--issue') args.issue = argv[++i];
    else if (arg === '--repo') args.repo = argv[++i];
    else if (arg === '--issue-file') args.issueFile = argv[++i];
    else if (arg === '--triage-file') args.triageFile = argv[++i];
    else if (arg === '--out-dir') args.outDir = argv[++i];
  }
  return args;
}

function loadIssueForBrief({ issue, issueFile, repo }) {
  if (issueFile) return readJson(issueFile);
  if (!issue) throw new Error('Usage: node scripts/issue-tools.js generate-fix-brief --issue <number> [--repo owner/repo] [--issue-file path] [--triage-file path] [--out-dir path]');
  const output = execSync(`gh issue view ${issue} --repo ${repo} --json number,title,body,url,labels`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  return JSON.parse(output);
}

function loadTriage({ triageFile, issueFile, issue, repo }) {
  if (triageFile) return readJson(triageFile);
  // Run classify inline rather than via execSync to avoid path dependency
  const rawIssue = loadIssueForBrief({ issue, issueFile, repo });
  return buildClassifyResult(normalizeIssue(rawIssue));
}

function extractPaths(text) {
  const matches = text.match(/(?:frontend|backend|infra|wiki|qa|scripts|\.github)\/[A-Za-z0-9_./-]+/g) || [];
  return unique(matches.map((value) => value.replace(/[`,.)]+$/g, '')));
}

function pathMatchesRule(candidatePath, rule) {
  if (!candidatePath || !rule) return false;
  if (rule.endsWith('/')) return candidatePath.startsWith(rule);
  return candidatePath === rule;
}

function filterCandidatePaths(paths, allowedPaths = []) {
  if (!Array.isArray(paths) || paths.length === 0) return [];
  if (!Array.isArray(allowedPaths) || allowedPaths.length === 0) return unique(paths);
  return unique(paths.filter((candidatePath) => allowedPaths.some((rule) => pathMatchesRule(candidatePath, rule))));
}

function extractQuotedTexts(text) {
  const matches = [...text.matchAll(/["'`「](.{1,80}?)["'`」]/g)];
  return unique(matches.map((match) => match[1]).filter((value) => value && !value.includes('\n'))).slice(0, 6);
}

function splitAcceptanceCriteria(body) {
  const lines = body.split(/\r?\n/).map((line) => line.trim());
  const criteria = lines.filter((line) => /^- \[.?\]/.test(line) || /^- /.test(line));
  return criteria.length > 0 ? criteria : ['- [ ] 根本原因の特定', '- [ ] 修正案の提示'];
}

function buildPatternDetails(issue, triage) {
  const text = `${issue.title || ''}\n${issue.body || ''}`;
  const referencedPaths = extractPaths(text);
  const quotedTexts = extractQuotedTexts(text);
  const pattern = triage.bugPattern || 'unresolved';

  const defaults = {
    'frontend-ui-text': {
      allowedPaths: ['frontend/src/', 'frontend/tests/e2e/', 'frontend/tests/unit/'],
      candidateFiles: ['frontend/tests/e2e/', 'frontend/src/components/'],
      validationSteps: ['frontend の E2E テストを対象シナリオ中心に再実行する', '必要に応じて frontend unit test で表示文言の整合を確認する'],
      changeConstraints: ['UI 文言不一致の解消に必要な最小変更に留める', '関係ない selector や待機条件の変更を避ける'],
    },
    'frontend-unit-test': {
      allowedPaths: ['frontend/src/', 'frontend/tests/unit/'],
      candidateFiles: ['frontend/src/', 'frontend/tests/unit/'],
      validationSteps: ['frontend unit test を再実行する', 'coverage の大きな後退がないことを確認する'],
      changeConstraints: ['テストだけを都合よく緩めず、実装との整合を優先する'],
    },
    backend: {
      allowedPaths: ['backend/src/main/', 'backend/src/test/'],
      candidateFiles: ['backend/src/main/', 'backend/src/test/'],
      validationSteps: ['./gradlew test jacocoTestReport を実行する', 'SonarQube が有効なら Quality Gate の結果も確認する'],
      changeConstraints: ['DB スキーマや API 仕様を無断で広げない'],
    },
    'ci-config': {
      allowedPaths: ['.github/workflows/', 'infra/', 'frontend/Dockerfile', 'backend/Dockerfile'],
      candidateFiles: ['.github/workflows/', 'infra/', 'frontend/Dockerfile', 'backend/Dockerfile'],
      validationSteps: ['対象 workflow を再実行し、失敗ステップが解消したか確認する', 'Docker build / docker compose health check を必要に応じて再確認する'],
      changeConstraints: ['失敗を隠す continue-on-error 追加でごまかさない'],
    },
    'e2e-environment': {
      allowedPaths: ['infra/', '.github/workflows/e2e.yml', 'frontend/tests/e2e/'],
      candidateFiles: ['infra/', '.github/workflows/e2e.yml', 'frontend/tests/e2e/'],
      validationSteps: ['docker compose の health check を確認する', 'smoke E2E を実行して最低限の画面遷移を確認する'],
      changeConstraints: ['タイムアウト値だけを闇雲に増やす対応を避ける'],
    },
    'docs-manual': {
      allowedPaths: ['README.md', 'docs/'],
      candidateFiles: ['README.md', 'docs/'],
      validationSteps: ['関連 Markdown の整合を確認する', 'リンク切れや screenshot 参照切れがないことを確認する'],
      changeConstraints: ['実装差分なしに画面仕様を作り変えない'],
    },
  };

  const selected = defaults[pattern] || {
    allowedPaths: [],
    candidateFiles: [],
    validationSteps: ['人手で分類と検証手順を補完する'],
    changeConstraints: ['対象範囲が明確になるまで変更しない'],
  };

  const filteredReferencedPaths = filterCandidatePaths(referencedPaths, selected.allowedPaths);
  return {
    pattern,
    allowedPaths: selected.allowedPaths,
    candidateFiles: unique([...filteredReferencedPaths, ...selected.candidateFiles]),
    validationSteps: selected.validationSteps,
    changeConstraints: selected.changeConstraints,
    evidence: quotedTexts,
  };
}

function buildPrDraft(issue, triage) {
  const prefix = triage.bugPattern ? `fix(${triage.bugPattern})` : 'fix(triage)';
  return {
    title: `${prefix}: issue #${issue.number} ${issue.title || 'untitled issue'}`.slice(0, 120),
    branch: `${triage.bugPattern || 'triage'}/issue-${issue.number}`.slice(0, 80),
    body: [
      '## 概要',
      issue.title || '(Issue title unavailable)',
      '',
      '## 関連Issue',
      `- Closes #${issue.number}`,
      '',
      '## Inputs for Test Design (Q&A)',
      `- 対象画面/機能: ${triage.bugPattern || '要分類'}`,
      '- 主要ユーザーフロー: Issue本文と fix brief を参照',
      '- 変更点（何が変わるか）: 最小修正方針に従う',
      '- 影響範囲（どこに波及するか）: candidate files を参照',
      '- 既知のリスク/懸念: fix brief の constraints を参照',
      '- 非機能観点（性能/アクセシビリティ等）: pattern ごとの validation を参照',
    ].join('\n'),
  };
}

function renderMarkdown(template, data) {
  return template
    .replaceAll('{{ISSUE_NUMBER}}', String(data.issue.number))
    .replaceAll('{{ISSUE_TITLE}}', data.issue.title || 'Untitled Issue')
    .replaceAll('{{ISSUE_URL}}', data.issue.url || '')
    .replaceAll('{{BUG_PATTERN}}', data.triage.bugPattern || 'unresolved')
    .replaceAll('{{SEVERITY}}', data.triage.severity || 'unknown')
    .replaceAll('{{AI_FIXABLE}}', data.triage.aiFixable ? 'true' : 'false')
    .replaceAll('{{TRIAGE_REASON}}', data.triage.reason || 'N/A')
    .replaceAll('{{ISSUE_BODY}}', data.issue.body || '(Issue本文なし)')
    .replaceAll('{{CANDIDATE_FILES}}', data.details.candidateFiles.map((item) => `- ${item}`).join('\n') || '- (要補完)')
    .replaceAll('{{VALIDATION_STEPS}}', data.details.validationSteps.map((item) => `- ${item}`).join('\n'))
    .replaceAll('{{CHANGE_CONSTRAINTS}}', data.details.changeConstraints.map((item) => `- ${item}`).join('\n'))
    .replaceAll('{{EVIDENCE_LINES}}', data.details.evidence.map((item) => `- ${item}`).join('\n') || '- (抽出なし)')
    .replaceAll('{{ACCEPTANCE_CRITERIA}}', data.acceptanceCriteria.join('\n'))
    .replaceAll('{{PR_TITLE}}', data.prDraft.title)
    .replaceAll('{{PR_BRANCH}}', data.prDraft.branch)
    .replaceAll('{{PR_BODY}}', data.prDraft.body);
}

function mainFixBrief(argv) {
  const args = parseFixBriefArgs(argv);
  const issue = loadIssueForBrief(args);
  const triage = loadTriage(args);
  const details = buildPatternDetails(issue, triage);
  const acceptanceCriteria = splitAcceptanceCriteria(issue.body || '');
  const prDraft = buildPrDraft(issue, triage);

  const payload = { generatedAt: new Date().toISOString(), issue, triage, details, acceptanceCriteria, prDraft };
  const outDir = path.resolve(args.outDir);
  const templatePath = path.join(process.cwd(), 'qa', 'test-management', 'templates', `fix-brief-${details.pattern}.md`);
  const fallbackTemplatePath = path.join(process.cwd(), 'qa', 'test-management', 'templates', 'fix-brief-generic.md');
  const template = fs.existsSync(templatePath) ? fs.readFileSync(templatePath, 'utf8') : fs.readFileSync(fallbackTemplatePath, 'utf8');
  const markdown = renderMarkdown(template, payload);
  fs.mkdirSync(outDir, { recursive: true });

  const jsonPath = path.join(outDir, `fix-brief-issue-${issue.number}.json`);
  const mdPath = path.join(outDir, `fix-brief-issue-${issue.number}.md`);
  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), 'utf8');
  fs.writeFileSync(mdPath, markdown, 'utf8');
  console.log(JSON.stringify({ jsonPath, mdPath }, null, 2));
}

// ─────────────────────────────────────────────
// generate-auto-fix-prompt  (was: generate-auto-fix-prompt.js)
// ─────────────────────────────────────────────

function parseAutoFixPromptArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--fix-brief') args.fixBrief = argv[++i];
    else if (arg === '--out') args.out = argv[++i];
  }
  return args;
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
      return ['テストだけを弱める変更ではなく、実装との整合が取れる最小修正を優先すること。'];
    default:
      return ['fix brief の candidate files と constraints を守り、最小変更で問題を解消すること。'];
  }
}

function renderAutoFixPrompt(payload) {
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

function mainAutoFixPrompt(argv) {
  const args = parseAutoFixPromptArgs(argv);
  if (!args.fixBrief || !args.out) {
    throw new Error('Usage: node scripts/issue-tools.js generate-auto-fix-prompt --fix-brief <path> --out <path>');
  }
  const payload = readJson(args.fixBrief);
  const prompt = renderAutoFixPrompt(payload);
  const outputPath = path.resolve(args.out);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, prompt, 'utf8');
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
      case 'classify':
        mainClassify(argv);
        break;
      case 'generate-fix-brief':
        mainFixBrief(argv);
        break;
      case 'generate-auto-fix-prompt':
        mainAutoFixPrompt(argv);
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.error('Available commands: classify, generate-fix-brief, generate-auto-fix-prompt');
        process.exit(1);
    }
  } catch (error) {
    console.error(error.message || String(error));
    process.exit(1);
  }
}

main();
