#!/usr/bin/env node

/**
 * マニュアル作成用スクリーンショット自動撮影スクリプト（AI提案ベース）
 * 
 * AI が提案したJSON形式の撮影計画に基づいて、
 * 動的にスクリーンショットを撮影します。
 * 
 * 使用方法:
 * node scripts/capture-manual-screenshots-node.js \
 *   --screenshot-steps wiki/manual/screenshot-steps-login--.json
 */

const { createRequire } = require('module');
const path = require('path');
const fs = require('fs');

const PROJECT_DIR = path.join(__dirname, '..');
const SCREENSHOT_DIR = path.join(PROJECT_DIR, 'wiki', 'manual', 'screenshots');
const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// パラメータ解析
const args = process.argv.slice(2);
let screenshotStepsFile = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--screenshot-steps' && i + 1 < args.length) {
    screenshotStepsFile = args[i + 1];
    i++;
  }
}

if (!screenshotStepsFile) {
  console.error('❌ エラー: --screenshot-steps を指定してください');
  console.error('');
  console.error('使用方法:');
  console.error('  node scripts/capture-manual-screenshots-node.js \\');
  console.error('    --screenshot-steps path/to/screenshot-steps.json');
  console.error('');
  console.error('撮影計画JSONの取得方法:');
  console.error('  1. node scripts/analyze-page-content.js --url "http://localhost:5173" --output wiki/manual/page-analysis.json');
  console.error('  2. node scripts/generate-screenshot-steps.js --feature "機能名" --type user --page-data wiki/manual/page-analysis.json');
  console.error('  3. AIが提案したJSONを保存');
  process.exit(1);
}

console.log(`📸 AI提案ベース スクリーンショット撮影開始`);
console.log(`   撮影計画: ${screenshotStepsFile}`);
console.log('');

// メイン処理
async function main() {
  let browser;
  let page;

  try {
    // 撮影計画ファイル読み込み
    const stepsPath = path.isAbsolute(screenshotStepsFile)
      ? screenshotStepsFile
      : path.join(PROJECT_DIR, screenshotStepsFile);

    if (!fs.existsSync(stepsPath)) {
      console.error(`❌ 撮影計画ファイルが見つかりません: ${stepsPath}`);
      process.exit(1);
    }

    let stepsData;
    try {
      stepsData = JSON.parse(fs.readFileSync(stepsPath, 'utf-8'));
      console.log(`✅ 撮影計画を読み込み: ${path.basename(stepsPath)}`);
    } catch (parseError) {
      console.error(`❌ JSON形式が無効です: ${parseError.message}`);
      process.exit(1);
    }

    if (!stepsData.feature || !Array.isArray(stepsData.steps)) {
      console.error('❌ 撮影計画ファイルの形式が無効です');
      console.error('   必須項目: feature (string), steps (array)');
      process.exit(1);
    }

    console.log(`   機能: ${stepsData.feature}`);
    console.log(`   ステップ数: ${stepsData.steps.length}`);
    console.log('');

    // ディレクトリ準備
    const manualType = stepsData.manualType || 'user';
    const screenshotOutputDir = path.join(SCREENSHOT_DIR, manualType);
    if (!fs.existsSync(screenshotOutputDir)) {
      fs.mkdirSync(screenshotOutputDir, { recursive: true });
    }

    // Playwright起動
    let playwright_;
    try {
      playwright_ = require('@playwright/test');
    } catch (e1) {
      try {
        const requireFromFrontend = createRequire(path.join(PROJECT_DIR, 'frontend', 'package.json'));
        playwright_ = requireFromFrontend('@playwright/test');
      } catch (e2) {
        console.error('❌ @playwright/test が見つかりません');
        console.error('   frontend 配下で npm install を実行してください');
        process.exit(1);
      }
    }

    browser = await playwright_.chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    page = await context.newPage();

    console.log('🌐 ブラウザ起動完了');
    console.log('');
    console.log('📸 スクリーンショット撮影中...');
    console.log('');

    // 各ステップを順序に実行
    for (const step of stepsData.steps) {
      console.log(`   Step ${step.stepNumber}: ${step.description}`);

      try {
        // アクション実行
        if (Array.isArray(step.actions)) {
          for (const action of step.actions) {
            await executeAction(page, action);
          }
        }

        // スクリーンショット撮影
        if (step.filename) {
          const screenshotPath = path.join(screenshotOutputDir, step.filename);
          await page.screenshot({
            path: screenshotPath,
            fullPage: true,
          });
          console.log(`      ✅ 撮影完了: ${step.filename}`);
        }

      } catch (stepError) {
        console.error(`      ❌ ステップ実行エラー: ${stepError.message}`);
        console.error(`         スキップして続行...`);
      }
    }

    await browser.close();

    console.log('');
    console.log('✅ スクリーンショット撮影完了');
    console.log(`📁 保存先: ${screenshotOutputDir}`);
    console.log('');

  } catch (error) {
    console.error('❌ 予期しないエラーが発生しました:', error.message);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
}

/**
 * アクションを実行
 * @param {Page} page - Playwrightのページオブジェクト
 * @param {Object} action - 実行するアクション
 */
async function executeAction(page, action) {
  switch (action.type) {
    case 'navigate':
      await page.goto(action.target || BASE_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      break;

    case 'fill':
      // ターゲットがセレクタの場合と説明テキストの場合に対応
      let fillLocator;
      if (action.target.startsWith('.') || action.target.startsWith('#') || action.target.startsWith('[')) {
        // CSSセレクタの場合
        fillLocator = page.locator(action.target).first();
      } else if (action.target.includes('入力フィールド')) {
        // 説明から推測: 「最初の入力フィールド」など
        const match = action.target.match(/(\d+)番目|最初|最後/);
        if (action.target.includes('パスワード')) {
          fillLocator = page.locator('input[type="password"]').first();
        } else {
          fillLocator = page.locator('input[type="text"]').first();
        }
      } else if (action.target.includes('パスワード')) {
        fillLocator = page.locator('input[type="password"]').first();
      } else {
        // デフォルト：テキスト入力フィールド
        fillLocator = page.locator('input[type="text"]').first();
      }

      await fillLocator.fill(action.value || '');
      await page.waitForTimeout(500);
      break;

    case 'click':
      // ターゲットがボタンテキストの場合
      let clickLocator;
      if (action.target.startsWith('.') || action.target.startsWith('#') || action.target.startsWith('[')) {
        clickLocator = page.locator(action.target).first();
      } else {
        // ボタンテキストから検索
        const buttonText = action.target.replace(/「|」/g, '');
        clickLocator = page.locator(`button:has-text("${buttonText}"), [role="button"]:has-text("${buttonText}")`).first();
      }

      await clickLocator.click();
      await page.waitForTimeout(1000);
      break;

    case 'wait':
      await page.waitForTimeout(action.duration || 1000);
      break;

    case 'navigate_to_path':
      await page.goto(`${BASE_URL}${action.target}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      break;

    default:
      console.warn(`      ⚠️  未知のアクションタイプ: ${action.type}`);
  }
}

// 実行
main();
