#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = { repo: process.env.GITHUB_REPOSITORY || 'cocomomojo/test_app' };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--issue') args.issue = argv[++i];
    else if (a === '--repo') args.repo = argv[++i];
    else if (a === '--out') args.out = argv[++i];
  }
  return args;
}

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf\-_\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80) || 'feature';
}

function main() {
  const { issue, repo, out } = parseArgs(process.argv);
  if (!issue) {
    console.error('Usage: node scripts/create-planner-prompt.js --issue <number> [--repo owner/repo] [--out path]');
    process.exit(1);
  }

  const root = process.cwd();
  const templatePath = path.join(root, 'qa', 'test-management', 'templates', 'planner-prompt-template.md');
  if (!fs.existsSync(templatePath)) {
    console.error(`Template not found: ${templatePath}`);
    process.exit(1);
  }

  const issueJsonRaw = execSync(
    `gh issue view ${issue} --repo ${repo} --json number,title,body,url`,
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
  );
  const issueData = JSON.parse(issueJsonRaw);

  const template = fs.readFileSync(templatePath, 'utf8');
  const content = template
    .replaceAll('{{ISSUE_NUMBER}}', String(issueData.number))
    .replaceAll('{{REPO}}', repo)
    .replaceAll('{{ISSUE_TITLE}}', issueData.title || 'Untitled Issue')
    .replaceAll('{{ISSUE_BODY}}', issueData.body || '(Issue本文なし)')
    .replaceAll('{{ISSUE_SLUG}}', slugify(issueData.title));

  const defaultOut = path.join(
    root,
    'qa',
    'test-management',
    'generated',
    `planner-prompt-issue-${issueData.number}.md`
  );
  const outputPath = out ? path.resolve(out) : defaultOut;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content, 'utf8');

  console.log(`Generated: ${outputPath}`);
}

main();
