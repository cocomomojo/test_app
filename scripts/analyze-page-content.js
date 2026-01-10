#!/usr/bin/env node

/**
 * ページ内容分析スクリプト（AI 用データ抽出）
 * 
 * PlaywrightでDOM内容を取得し、AIが理解しやすい形式でJSONに出力
 * 
 * 使用方法:
 * node scripts/analyze-page-content.js --url "http://localhost:5175" --output analysis.json
 */

const { createRequire } = require('module');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const PROJECT_DIR = path.join(__dirname, '..');

// パラメータ解析
const args = process.argv.slice(2);
let targetUrl = BASE_URL;
let outputFile = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--url' && i + 1 < args.length) {
    targetUrl = args[i + 1];
    i++;
  } else if (args[i] === '--output' && i + 1 < args.length) {
    outputFile = args[i + 1];
    i++;
  }
}

console.log(`🔍 ページ内容分析開始`);
console.log(`   対象URL: ${targetUrl}`);
console.log('');

// ページ内容分析
async function analyzePage() {
  let browser;
  
  try {
    // Playwright が利用可能か確認
    let playwright_;
    try {
      playwright_ = require('@playwright/test');
    } catch (e1) {
      try {
        const requireFromFrontend = createRequire(path.join(PROJECT_DIR, 'frontend', 'package.json'));
        playwright_ = requireFromFrontend('@playwright/test');
      } catch (e2) {
        console.log('⚠️  @playwright/test が見つかりません');
        console.log('   frontend 配下で npm install を実行してください');
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

    // ページに移動
    await page.goto(targetUrl, { waitUntil: 'networkidle' });
    console.log('✅ ページ読み込み完了');

    // ページ内容を解析
    const pageData = await page.evaluate(() => {
      const result = {
        title: document.title,
        url: window.location.href,
        headings: [],
        buttons: [],
        inputs: [],
        links: [],
        textContent: [],
        icons: [],
      };

      // 見出し取得
      document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
        result.headings.push({
          level: el.tagName.toLowerCase(),
          text: el.textContent.trim(),
        });
      });

      // ボタン取得
      document.querySelectorAll('button, [role="button"], .v-btn').forEach(el => {
        const text = el.textContent.trim();
        if (text) {
          result.buttons.push({
            text: text,
            type: el.getAttribute('type') || '',
            ariaLabel: el.getAttribute('aria-label') || '',
          });
        }
      });

      // 入力フィールド取得
      document.querySelectorAll('input, textarea, .v-text-field').forEach(el => {
        const label = el.getAttribute('label') || 
                      el.getAttribute('placeholder') || 
                      el.getAttribute('aria-label') || '';
        const type = el.getAttribute('type') || 'text';
        
        result.inputs.push({
          label: label,
          type: type,
          name: el.getAttribute('name') || '',
        });
      });

      // リンク取得
      document.querySelectorAll('a').forEach(el => {
        const text = el.textContent.trim();
        if (text) {
          result.links.push({
            text: text,
            href: el.getAttribute('href') || '',
          });
        }
      });

      // アイコン取得（Vuetify のアイコン）
      document.querySelectorAll('.v-icon, [class*="mdi-"]').forEach(el => {
        const classes = Array.from(el.classList).filter(c => c.startsWith('mdi-'));
        if (classes.length > 0) {
          result.icons.push(classes[0]);
        }
      });

      // テキストコンテンツ取得（主要な段落やリスト項目）
      document.querySelectorAll('p, li, .v-list-item-title, .v-card-text').forEach(el => {
        const text = el.textContent.trim();
        if (text && text.length > 0 && text.length < 500) {
          result.textContent.push(text);
        }
      });

      return result;
    });

    console.log('✅ ページ内容解析完了');
    console.log('');
    console.log('📊 解析結果サマリー:');
    console.log(`   見出し: ${pageData.headings.length} 個`);
    console.log(`   ボタン: ${pageData.buttons.length} 個`);
    console.log(`   入力フィールド: ${pageData.inputs.length} 個`);
    console.log(`   リンク: ${pageData.links.length} 個`);
    console.log(`   アイコン: ${pageData.icons.length} 個`);
    console.log('');

    // 結果を出力
    if (outputFile) {
      const outputPath = path.isAbsolute(outputFile) 
        ? outputFile 
        : path.join(PROJECT_DIR, outputFile);
      
      fs.writeFileSync(outputPath, JSON.stringify(pageData, null, 2), 'utf-8');
      console.log(`✅ 分析結果を保存: ${outputPath}`);
    } else {
      // 標準出力に JSON を出力
      console.log(JSON.stringify(pageData, null, 2));
    }

    await browser.close();

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
}

// 実行
analyzePage();
