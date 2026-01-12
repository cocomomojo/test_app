#!/usr/bin/env node

/**
 * マニュアル作成用スクリーンショット自動撮影スクリプト
 * 
 * 使用方法:
 * node scripts/capture-manual-screenshots-node.js --type user --feature "ログイン機能"
 */

const { createRequire } = require('module');
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
      // 通常の解決
      playwright_ = require('@playwright/test');
    } catch (e1) {
      try {
        // frontend/node_modules 経由で解決（devDependencies が frontend にあるケース）
        const requireFromFrontend = createRequire(path.join(PROJECT_DIR, 'frontend', 'package.json'));
        playwright_ = requireFromFrontend('@playwright/test');
      } catch (e2) {
        console.log('⚠️  @playwright/test が見つかりません');
        console.log('   次のいずれかを実施してください:');
        console.log('   1) リポジトリ直下で npm install @playwright/test');
        console.log('   2) frontend 配下で npm install を実行し、NODE_PATH を設定して再実行');
        console.log('      例: NODE_PATH="./frontend/node_modules" FRONTEND_URL="http://localhost:5173" npm run manual:generate:user -- --feature "ログイン機能"');
        process.exit(1);
      }
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
      await page.waitForTimeout(1000); // 画面安定を待つ
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, manualType, '01-login.png'),
        fullPage: true,
      });
      console.log('      ✅ 撮影完了: 01-login.png');

      // ログイン処理を実行
      console.log('   🔐 ログイン処理中...');
      try {
        // ユーザー名とパスワードの入力フィールドを探して入力
        const usernameInput = await page.locator('input[type="text"]').first();
        const passwordInput = await page.locator('input[type="password"]').first();
        
        if (usernameInput && passwordInput) {
          await usernameInput.fill('testuser');
          await passwordInput.fill('Test1234!'); // 正しいパスワード
          
          // ログインボタンをクリック
          const loginButton = await page.locator('button:has-text("ログイン")').first();
          if (loginButton) {
            await loginButton.click();
            // ページ遷移を待つ
            await page.waitForURL(/\/(top|todo|dashboard)/, { timeout: 5000 }).catch(() => {
              console.log('      ⚠️  ページ遷移を検出できませんでした（/topへのナビゲーションを待機）');
            });
            await page.waitForTimeout(2000); // 画面描画を待つ
            console.log('      ✅ ログイン成功');
          }
        }
      } catch (error) {
        console.log(`      ⚠️  ログイン処理をスキップ: ${error.message}`);
      }

      // 2. TODO管理画面（ダッシュボード）
      console.log('   2. ダッシュボード/TODOページ');
      try {
        // TODOページに遷移
        const todoLink = await page.locator('a:has-text("TODO"), button:has-text("TODO")').first();
        if (todoLink) {
          await todoLink.click();
          await page.waitForTimeout(1500);
        }
      } catch (error) {
        console.log(`      ⚠️  TODOページへの遷移をスキップ: ${error.message}`);
      }
      
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, manualType, '02-dashboard.png'),
        fullPage: true,
      });
      console.log('      ✅ 撮影完了: 02-dashboard.png');

      // 3. メモページ
      console.log('   3. メモページ/その他機能');
      try {
        // メモページに遷移
        const memoLink = await page.locator('a:has-text("メモ"), button:has-text("メモ")').first();
        if (memoLink) {
          await memoLink.click();
          await page.waitForTimeout(1500);
        }
      } catch (error) {
        console.log(`      ⚠️  メモページへの遷移をスキップ: ${error.message}`);
      }
      
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, manualType, '03-menu.png'),
        fullPage: true,
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
