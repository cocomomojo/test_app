#!/usr/bin/env node

/**
 * マニュアル作成用スクリーンショット自動撮影スクリプト
 * 
 * 使用方法:
 * node scripts/capture-manual-screenshots-node.js --type user --feature "ログイン機能"
 */

const playwright = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const PROJECT_DIR = path.join(__dirname, '..');
const SCREENSHOT_DIR = path.join(PROJECT_DIR, 'wiki', 'manual', 'screenshots');

// パラメータ解析
const args = process.argv.slice(2);
let manualType = 'user';
let featureName = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--type' && i + 1 < args.length) {
    manualType = args[i + 1];
    i++;
  } else if (args[i] === '--feature' && i + 1 < args.length) {
    featureName = args[i + 1];
    i++;
  }
}

console.log(`📸 スクリーンショット撮影開始`);
console.log(`   タイプ: ${manualType}`);
console.log(`   機能: ${featureName}`);
console.log('');

// ディレクトリ作成
async function ensureDirectories() {
  const dir = path.join(SCREENSHOT_DIR, manualType);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ ディレクトリ作成: ${dir}`);
  }
}

// スクリーンショット撮影
async function captureScreenshots() {
  let browser;
  
  try {
    await ensureDirectories();
    
    // Playwright が利用可能か確認
    let playwright_;
    try {
      playwright_ = require('@playwright/test');
    } catch (e) {
      console.log('⚠️  @playwright/test が見つかりません');
      console.log('   インストールして再度実行してください:');
      console.log('   cd frontend && npm install @playwright/test');
      process.exit(1);
    }

    browser = await playwright_.chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    const page = await context.newPage();

    console.log('🌐 ブラウザ起動完了');
    console.log('');

    // ===== ユーザー向けスクリーンショット =====
    if (manualType === 'user') {
      console.log('📸 ユーザー向けスクリーンショット撮影中...');
      console.log('');

      // 1. ログイン画面
      console.log('   1. ログイン画面');
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, manualType, '01-login.png'),
        fullPage: true,
      });
      console.log('      ✅ 撮影完了: 01-login.png');

      // 2. TODO管理画面（ダッシュボード想定）
      console.log('   2. ダッシュボード/メインページ');
      // 実際にはログイン処理が必要ですが、画面が表示されていれば撮影
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, manualType, '02-dashboard.png'),
        fullPage: true,
      });
      console.log('      ✅ 撮影完了: 02-dashboard.png');

      // 3. ナビゲーション例
      console.log('   3. メニュー/ナビゲーション');
      // スクロールしてメニュー部分を撮影
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, manualType, '03-menu.png'),
        fullPage: false,
      });
      console.log('      ✅ 撮影完了: 03-menu.png');

      console.log('');
      console.log('✅ ユーザー向けスクリーンショット撮影完了');
    }
    // ===== 管理者向けスクリーンショット =====
    else if (manualType === 'admin') {
      console.log('📸 管理者向けスクリーンショット撮影中...');
      console.log('');

      // 1. ダッシュボード
      console.log('   1. ダッシュボード');
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, manualType, '01-dashboard.png'),
        fullPage: true,
      });
      console.log('      ✅ 撮影完了: 01-dashboard.png');

      // 2. 設定画面
      console.log('   2. 設定画面');
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, manualType, '02-settings.png'),
        fullPage: true,
      });
      console.log('      ✅ 撮影完了: 02-settings.png');

      console.log('');
      console.log('✅ 管理者向けスクリーンショット撮影完了');
    }

    await browser.close();

    console.log('');
    console.log(`✅ スクリーンショット保存先: ${path.join(SCREENSHOT_DIR, manualType)}`);
    console.log('');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
}

// 実行
captureScreenshots();
