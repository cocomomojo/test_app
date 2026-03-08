#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

function parseArgs(argv) {
  const args = {
    repo: process.env.GITHUB_REPOSITORY || 'cocomomojo/test_app',
  };

  for (let i = 2; i < argv.length; i += 1) {
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

function loadIssue({ issue, issueFile, repo }) {
  if (issueFile) {
    return normalizeIssue(JSON.parse(fs.readFileSync(path.resolve(issueFile), 'utf8')));
  }

  if (!issue) {
    throw new Error('Usage: node scripts/classify-issue-pattern.js --issue <number> [--repo owner/repo] [--issue-file path] [--out path]');
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

  const value = match[1]
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ')
    .trim();

  if (!value || value === '未選択') return null;
  return value;
}

function extractExplicitPattern(issue) {
  const labelPattern = issue.labels
    .map((label) => label.toLowerCase())
    .find((label) => label.startsWith('bug-pattern:'));

  if (labelPattern) {
    return labelPattern.replace('bug-pattern:', '');
  }

  const fromBody = extractFormValue(issue.body || '', '不具合パターン（任意）');
  if (fromBody && Object.values(BUG_PATTERNS).includes(fromBody)) {
    return fromBody;
  }

  return null;
}

function detectPattern(issue) {
  const title = issue.title.toLowerCase();
  const body = issue.body.toLowerCase();
  const labels = issue.labels.map((label) => label.toLowerCase());
  const text = `${title}\n${body}`;
  const explicitPattern = extractExplicitPattern(issue);

  if (explicitPattern) {
    return {
      pattern: explicitPattern,
      reason: 'Issue form or existing labels explicitly specify the bug pattern.',
    };
  }

  if (labels.includes('documentation') || labels.includes('manual')) {
    return {
      pattern: BUG_PATTERNS.DOCS_MANUAL,
      reason: 'Issue labels indicate documentation/manual work.',
    };
  }

  if (labels.includes('feature') || labels.includes('enhancement')) {
    return {
      pattern: null,
      reason: 'Feature/enhancement issue is outside the bug triage scope.',
    };
  }

  if (
    hasAny(text, ['manual', 'wiki/', 'markdown', '操作マニュアル', 'スクリーンショット', 'readme']) &&
    !hasAny(text, ['playwright', 'gradle', 'stack trace', 'workflow'])
  ) {
    return {
      pattern: BUG_PATTERNS.DOCS_MANUAL,
      reason: 'Text focuses on documentation/manual artifacts.',
    };
  }

  if (
    body.includes('<!-- automated-e2e-failure-analysis -->') &&
    (hasAny(text, ['getbytext', '表示テキスト', '文言', 'toBeVisible'.toLowerCase(), 'locator']) ||
      hasAny(text, ['こんばんは', 'こんばんわー']))
  ) {
    return {
      pattern: BUG_PATTERNS.FRONTEND_UI_TEXT,
      reason: 'Automated E2E failure issue suggests a UI text mismatch.',
    };
  }

  if (
    hasAny(text, ['vitest', '@vue/test-utils', 'wrapper.text()', 'test:unit', 'frontend/src/test', 'mount('])
  ) {
    return {
      pattern: BUG_PATTERNS.FRONTEND_UNIT_TEST,
      reason: 'Signals point to a frontend unit test failure.',
    };
  }

  if (
    hasAny(text, ['docker compose', 'health check', 'mysqladmin ping', 'actuator/health', 'frontend failed to start', 'backend connectivity', 'timeout']) &&
    hasAny(text, ['playwright', 'e2e', 'localhost:8080', 'localhost:8081'])
  ) {
    return {
      pattern: BUG_PATTERNS.E2E_ENVIRONMENT,
      reason: 'Issue looks like an E2E environment or service readiness failure.',
    };
  }

  if (
    hasAny(text, ['workflow', 'github actions', '.github/workflows', 'yaml', 'permissions', 'dockerfile', 'node version', 'sonarqube'])
  ) {
    return {
      pattern: BUG_PATTERNS.CI_CONFIG,
      reason: 'Issue appears related to CI or workflow configuration.',
    };
  }

  if (
    hasAny(text, ['spring boot', 'gradle', 'jacoco', 'stack trace', 'exception', 'sql', 'endpoint', 'junit', 'backend/src/main'])
  ) {
    return {
      pattern: BUG_PATTERNS.BACKEND,
      reason: 'Issue appears related to backend code or API behavior.',
    };
  }

  if (hasAny(text, ['playwright', 'getbytext', 'toBeVisible'.toLowerCase(), 'locator', '.vue'])) {
    return {
      pattern: BUG_PATTERNS.FRONTEND_UI_TEXT,
      reason: 'Issue suggests a frontend/UI E2E mismatch.',
    };
  }

  return {
    pattern: null,
    reason: 'Could not deterministically map the issue to a supported bug pattern.',
  };
}

function detectSeverity(issue, pattern) {
  const labels = issue.labels.map((label) => label.toLowerCase());
  const text = `${issue.title}\n${issue.body}`.toLowerCase();
  const explicitSeverity = extractFormValue(issue.body || '', '重要度（任意）');

  for (const severity of SEVERITIES) {
    if (labels.includes(`severity:${severity}`) || labels.includes(severity)) {
      return severity;
    }
  }

  if (explicitSeverity && SEVERITIES.includes(explicitSeverity)) {
    return explicitSeverity;
  }

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

function buildResult(issue) {
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

function main() {
  try {
    const args = parseArgs(process.argv);
    const issue = loadIssue(args);
    const result = buildResult(issue);
    const output = JSON.stringify(result, null, 2);

    if (args.out) {
      const outputPath = path.resolve(args.out);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, output, 'utf8');
      console.log(`Generated: ${outputPath}`);
    } else {
      console.log(output);
    }
  } catch (error) {
    console.error(error.message || String(error));
    process.exit(1);
  }
}

main();
