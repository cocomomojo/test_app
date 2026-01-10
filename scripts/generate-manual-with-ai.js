#!/usr/bin/env node

/**
 * AI統合マニュアル生成スクリプト
 * 
 * Playwrightで取得したページ内容をAI（GitHub Copilot/Claude）に送信し、
 * 高精度なマニュアルコンテンツを自動生成
 * 
 * 使用方法:
 * node scripts/generate-manual-with-ai.js \
 *   --feature "ログイン機能" \
 *   --type "user" \
 *   --page-data page-analysis.json
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

const PROJECT_DIR = path.join(__dirname, '..');
const MANUAL_DIR = path.join(PROJECT_DIR, 'wiki', 'manual');

// パラメータ解析
const args = process.argv.slice(2);
let featureName = '';
let manualType = 'user';
let pageDataFile = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--feature' && i + 1 < args.length) {
    featureName = args[i + 1];
    i++;
  } else if (args[i] === '--type' && i + 1 < args.length) {
    manualType = args[i + 1];
    i++;
  } else if (args[i] === '--page-data' && i + 1 < args.length) {
    pageDataFile = args[i + 1];
    i++;
  }
}

if (!featureName) {
  console.error('❌ エラー: --feature を指定してください');
  process.exit(1);
}

console.log(`🤖 AI統合マニュアル生成開始`);
console.log(`   機能名: ${featureName}`);
console.log(`   種別: ${manualType}`);
console.log('');

async function generateManualWithAI() {
  try {
    // ページデータ読み込み
    let pageData = null;
    if (pageDataFile) {
      const dataPath = path.isAbsolute(pageDataFile) 
        ? pageDataFile 
        : path.join(PROJECT_DIR, pageDataFile);
      
      if (fs.existsSync(dataPath)) {
        pageData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        console.log(`✅ ページデータ読み込み: ${dataPath}`);
      }
    }

    // AI用プロンプト生成
    const prompt = generatePrompt(featureName, manualType, pageData);
    
    console.log('');
    console.log('📝 AIプロンプト生成完了');
    console.log('');
    console.log('─'.repeat(60));
    console.log(prompt);
    console.log('─'.repeat(60));
    console.log('');
    console.log('💡 次のステップ:');
    console.log('');
    console.log('1. 上記のプロンプトを GitHub Copilot Chat に貼り付けてください');
    console.log('');
    console.log('2. AIが生成したマニュアルコンテンツを以下に保存:');
    const featureSlug = featureName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const outputFile = path.join(MANUAL_DIR, manualType, `01-${featureSlug}-ai.md`);
    console.log(`   ${outputFile}`);
    console.log('');
    console.log('3. または、以下のコマンドでプロンプトをファイルに保存:');
    const promptFile = path.join(PROJECT_DIR, 'wiki', 'manual', `prompt-${featureSlug}.txt`);
    fs.writeFileSync(promptFile, prompt, 'utf-8');
    console.log(`   ✅ プロンプトを保存: ${promptFile}`);
    console.log('');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

function generatePrompt(featureName, manualType, pageData) {
  const typeLabel = manualType === 'admin' ? '管理者' : 'ユーザー';
  
  let prompt = `# ${featureName}の${typeLabel}向け操作マニュアル生成依頼

以下の情報を基に、実用的で分かりやすい操作マニュアルを生成してください。

## 機能名
${featureName}

## マニュアル種別
${typeLabel}向け

`;

  if (pageData) {
    prompt += `## ページ情報（実画面から取得）

### 見出し
${pageData.headings.map(h => `- **${h.level}**: ${h.text}`).join('\n')}

### ボタン
${pageData.buttons.map(b => `- 「${b.text}」${b.ariaLabel ? ` (${b.ariaLabel})` : ''}`).join('\n')}

### 入力フィールド
${pageData.inputs.map(i => `- ${i.label || i.name || i.type} (${i.type})`).join('\n')}

### リンク
${pageData.links.map(l => `- [${l.text}](${l.href})`).join('\n')}

### アイコン
${[...new Set(pageData.icons)].join(', ')}

`;
  }

  prompt += `## 生成してほしいマニュアル構成

### 1. 概要
#### この機能について
- ${featureName}の目的と主な機能を簡潔に説明（2-3文）
- 実際の画面要素（上記のボタンや入力フィールド）を踏まえた具体的な説明

#### 利用シーン
- この機能を使う具体的なシーン3つ（実務での利用例）
- 例: 「朝の業務開始時にシステムにアクセスする」など

### 2. 前提条件
- 必要な権限やアクセス権
- 推奨環境（ブラウザ、デバイス）

### 3. 基本操作
- 実際の画面に表示されているボタンや入力フィールドを使った操作手順
- ステップごとに具体的な操作内容を記載
- スクリーンショット参照の記載（\`![説明](screenshots/${manualType}/[feature]-step1.png)\`形式）

### 4. 詳細機能
- 高度な使い方やオプション機能
- 実際の画面要素を参照した説明

### 5. トラブルシューティング
- よくあるエラーとその対処法
- 実際のエラーメッセージ例

### 6. よくある質問
- ユーザーが疑問に思いそうなQ&A 3-5個

## 出力形式
Markdown形式で、そのままファイルとして保存できる形式で出力してください。

## 注意事項
- プレースホルダー（〇〇など）は使わず、すべて具体的な内容にしてください
- 実際の画面要素（ボタン名、入力フィールド名）を正確に引用してください
- ${typeLabel}の立場で分かりやすい言葉遣いにしてください
`;

  return prompt;
}

// 実行
generateManualWithAI();
