#!/usr/bin/env node

const fs = require('fs');

function toBool(value) {
  return String(value).toLowerCase() === 'true';
}

function loadLabels(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return String(raw)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
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
  // pushTokenAvailable indicates whether any push-capable token is available.
  // When not explicitly set (e.g. in simulation), fall back to tokenConfigured so
  // the simulation no-token scenario keeps working without changes.
  const pushTokenAvailable = options.pushTokenAvailable !== undefined
    ? toBool(options.pushTokenAvailable)
    : tokenConfigured;
  const sameRepo = (options.headRepo || '') === (options.baseRepo || '');
  const prNumber = String(options.prNumber || 'unknown');

  const result = {
    prNumber,
    artifactName: `pr-test-assets-${prNumber}`,
    requiredLabel,
    hasRequiredLabel,
    isFork,
    isDraft,
    sameRepo,
    commentMode: 'comment-and-summary',
    branchSyncEnabled: false,
    branchSyncReason: '',
  };

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

function main() {
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

if (require.main === module) {
  main();
}

module.exports = {
  evaluatePublicationMode,
};