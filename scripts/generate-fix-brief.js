#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {
    repo: process.env.GITHUB_REPOSITORY || 'cocomomojo/test_app',
    outDir: path.join(process.cwd(), 'qa', 'test-management', 'generated'),
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--issue') args.issue = argv[++i];
    else if (arg === '--repo') args.repo = argv[++i];
    else if (arg === '--issue-file') args.issueFile = argv[++i];
    else if (arg === '--triage-file') args.triageFile = argv[++i];
    else if (arg === '--out-dir') args.outDir = argv[++i];
  }

  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
}

function loadIssue({ issue, issueFile, repo }) {
  if (issueFile) {
    return readJson(issueFile);
  }

  if (!issue) {
    throw new Error('Usage: node scripts/generate-fix-brief.js --issue <number> [--repo owner/repo] [--issue-file path] [--triage-file path] [--out-dir path]');
  }

  const output = execSync(
    `gh issue view ${issue} --repo ${repo} --json number,title,body,url,labels`,
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
  );

  return JSON.parse(output);
}

function loadTriage({ triageFile, issueFile, issue, repo }) {
  if (triageFile) {
    return readJson(triageFile);
  }

  const issueInput = issueFile ? `--issue-file ${path.resolve(issueFile)}` : `--issue ${issue}`;
  const command = `node scripts/classify-issue-pattern.js ${issueInput} --repo ${repo}`;
  return JSON.parse(execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function extractPaths(text) {
  const matches = text.match(/(?:frontend|backend|infra|wiki|qa|scripts|\.github)\/[A-Za-z0-9_./-]+/g) || [];
  return unique(matches.map((value) => value.replace(/[`,.)]+$/g, '')));
}

function pathMatchesRule(candidatePath, rule) {
  if (!candidatePath || !rule) return false;

  if (rule.endsWith('/')) {
    return candidatePath.startsWith(rule);
  }

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
      allowedPaths: ['frontend/src/', 'frontend/tests/e2e/', 'frontend/test/'],
      candidateFiles: ['frontend/tests/e2e/', 'frontend/src/components/'],
      validationSteps: [
        'frontend の E2E テストを対象シナリオ中心に再実行する',
        '必要に応じて frontend unit test で表示文言の整合を確認する',
      ],
      changeConstraints: [
        'UI 文言不一致の解消に必要な最小変更に留める',
        '関係ない selector や待機条件の変更を避ける',
      ],
    },
    'frontend-unit-test': {
      allowedPaths: ['frontend/src/', 'frontend/test/'],
      candidateFiles: ['frontend/src/', 'frontend/test/'],
      validationSteps: [
        'frontend unit test を再実行する',
        'coverage の大きな後退がないことを確認する',
      ],
      changeConstraints: [
        'テストだけを都合よく緩めず、実装との整合を優先する',
      ],
    },
    backend: {
      allowedPaths: ['backend/src/main/', 'backend/src/test/'],
      candidateFiles: ['backend/src/main/', 'backend/src/test/'],
      validationSteps: [
        './gradlew test jacocoTestReport を実行する',
        'SonarQube が有効なら Quality Gate の結果も確認する',
      ],
      changeConstraints: [
        'DB スキーマや API 仕様を無断で広げない',
      ],
    },
    'ci-config': {
      allowedPaths: ['.github/workflows/', 'infra/', 'frontend/Dockerfile', 'backend/Dockerfile'],
      candidateFiles: ['.github/workflows/', 'infra/', 'frontend/Dockerfile', 'backend/Dockerfile'],
      validationSteps: [
        '対象 workflow を再実行し、失敗ステップが解消したか確認する',
        'Docker build / docker compose health check を必要に応じて再確認する',
      ],
      changeConstraints: [
        '失敗を隠す continue-on-error 追加でごまかさない',
      ],
    },
    'e2e-environment': {
      allowedPaths: ['infra/', '.github/workflows/e2e.yml', 'frontend/tests/e2e/'],
      candidateFiles: ['infra/', '.github/workflows/e2e.yml', 'frontend/tests/e2e/'],
      validationSteps: [
        'docker compose の health check を確認する',
        'smoke E2E を実行して最低限の画面遷移を確認する',
      ],
      changeConstraints: [
        'タイムアウト値だけを闇雲に増やす対応を避ける',
      ],
    },
    'docs-manual': {
      allowedPaths: ['wiki/', 'README.md', 'wiki/manual/'],
      candidateFiles: ['wiki/', 'README.md', 'wiki/manual/'],
      validationSteps: [
        '関連 Markdown の整合を確認する',
        'リンク切れや screenshot 参照切れがないことを確認する',
      ],
      changeConstraints: [
        '実装差分なしに画面仕様を作り変えない',
      ],
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

function main() {
  try {
    const args = parseArgs(process.argv);
    const issue = loadIssue(args);
    const triage = loadTriage(args);
    const details = buildPatternDetails(issue, triage);
    const acceptanceCriteria = splitAcceptanceCriteria(issue.body || '');
    const prDraft = buildPrDraft(issue, triage);

    const payload = {
      generatedAt: new Date().toISOString(),
      issue,
      triage,
      details,
      acceptanceCriteria,
      prDraft,
    };

    const outDir = path.resolve(args.outDir);
    const templatePath = path.join(process.cwd(), 'qa', 'test-management', 'templates', `fix-brief-${details.pattern}.md`);
    const fallbackTemplatePath = path.join(process.cwd(), 'qa', 'test-management', 'templates', 'fix-brief-generic.md');
    const template = fs.existsSync(templatePath)
      ? fs.readFileSync(templatePath, 'utf8')
      : fs.readFileSync(fallbackTemplatePath, 'utf8');

    const markdown = renderMarkdown(template, payload);
    fs.mkdirSync(outDir, { recursive: true });

    const jsonPath = path.join(outDir, `fix-brief-issue-${issue.number}.json`);
    const mdPath = path.join(outDir, `fix-brief-issue-${issue.number}.md`);
    fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), 'utf8');
    fs.writeFileSync(mdPath, markdown, 'utf8');

    console.log(JSON.stringify({ jsonPath, mdPath }, null, 2));
  } catch (error) {
    console.error(error.message || String(error));
    process.exit(1);
  }
}

main();
