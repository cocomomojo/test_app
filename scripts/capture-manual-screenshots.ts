import { test, chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * マニュアル用スクリーンショット自動撮影スクリプト
 * 
 * 使用方法:
 * npx ts-node scripts/capture-manual-screenshots.ts
 */

const SCREENSHOT_DIR = path.join(__dirname, '..', 'wiki', 'manual', 'screenshots');
const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// スクリーンショット保存ディレクトリの作成
function ensureDirectories() {
  const dirs = [
    path.join(SCREENSHOT_DIR, 'user'),
    path.join(SCREENSHOT_DIR, 'admin'),
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
}

async function captureScreenshots() {
  ensureDirectories();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  console.log('🚀 Starting screenshot capture...\n');

  try {
    // ===== ユーザー向けスクリーンショット =====
    
    // 1. ログイン画面
    console.log('📸 Capturing: Login page');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'user', '01-login.png'),
      fullPage: true,
    });

    // 2. ログイン後（ダッシュボード）
    console.log('📸 Capturing: Dashboard');
    // ログイン処理（必要に応じて実装）
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'user', '02-dashboard.png'),
      fullPage: true,
    });

    // 3. TODO管理画面
    console.log('📸 Capturing: TODO management');
    await page.click('a[href*="todo"]');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'user', '03-todo-list.png'),
      fullPage: true,
    });

    // 4. TODO作成フォーム
    console.log('📸 Capturing: TODO create form');
    await page.click('button:has-text("新規作成")');
    await page.waitForSelector('form');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'user', '04-todo-create.png'),
      fullPage: false,
    });

    // 5. メモ管理画面
    console.log('📸 Capturing: Memo management');
    await page.click('a[href*="memo"]');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'user', '05-memo-list.png'),
      fullPage: true,
    });

    // 6. メモ作成フォーム
    console.log('📸 Capturing: Memo create form');
    await page.click('button:has-text("新規作成")');
    await page.waitForSelector('form');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'user', '06-memo-create.png'),
      fullPage: false,
    });

    // 7. 設定画面
    console.log('📸 Capturing: Settings page');
    await page.click('a[href*="settings"]');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'user', '07-settings.png'),
      fullPage: true,
    });

    // ===== 管理者向けスクリーンショット =====
    
    // 管理者でログイン（必要に応じて実装）
    // await page.goto(BASE_URL + '/admin');
    // ... 管理者画面のスクリーンショット撮影

    console.log('\n✅ Screenshot capture completed!');
    console.log(`📁 Screenshots saved to: ${SCREENSHOT_DIR}`);

  } catch (error) {
    console.error('❌ Error capturing screenshots:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// スクリプト実行
captureScreenshots().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
