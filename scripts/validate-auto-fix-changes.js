#!/usr/bin/env node

const { execSync } = require('child_process');
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

function pathMatchesRule(candidatePath, rule) {
  if (!candidatePath || !rule) return false;
  if (rule.endsWith('/')) return candidatePath.startsWith(rule);
  return candidatePath === rule;
}

function listChangedFiles() {
  const tracked = execSync('git diff --name-only HEAD --', { encoding: 'utf8' })
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const untracked = execSync('git ls-files --others --exclude-standard', { encoding: 'utf8' })
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return unique([...tracked, ...untracked]);
}

function main() {
  try {
    const args = parseArgs(process.argv);
    if (!args.fixBrief) {
      throw new Error('Usage: node scripts/validate-auto-fix-changes.js --fix-brief <path> [--out path]');
    }

    const payload = readJson(args.fixBrief);
    const allowedRules = unique([
      ...((payload.details && payload.details.allowedPaths) || []),
      ...((payload.details && payload.details.candidateFiles) || []),
    ]);
    const changedFiles = listChangedFiles();

    if (changedFiles.length === 0) {
      throw new Error('Auto-fix produced no repository changes.');
    }

    const invalidFiles = changedFiles.filter((file) => !allowedRules.some((rule) => pathMatchesRule(file, rule)));

    const result = {
      issueNumber: payload.issue?.number,
      bugPattern: payload.triage?.bugPattern,
      allowedRules,
      changedFiles,
      invalidFiles,
    };

    if (args.out) {
      const outputPath = path.resolve(args.out);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
    }

    if (invalidFiles.length > 0) {
      throw new Error(`Auto-fix touched files outside allowed paths: ${invalidFiles.join(', ')}`);
    }

    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error.message || String(error));
    process.exit(1);
  }
}

main();