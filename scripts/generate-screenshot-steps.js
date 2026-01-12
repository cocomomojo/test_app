#!/usr/bin/env node

/**
 * AI がスクリーンショット撮影手順を提案するスクリプト
 * 
 * ページ分析結果を元に、AI（プロンプト形式）が
 * 「このページのマニュアル作成に必要なスクリーンショット撮影手順」を提案
 * 
 * 使用方法:
 * node scripts/generate-screenshot-steps.js \
 *   --feature "ログイン機能" \
 *   --type "user" \
 *   --page-data wiki/manual/user-page-analysis.json
 */

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = path.join(__dirname, '..');

// パラメータ解析
const args = process.argv.slice(2);
let featureName = '';
let manualType = 'user';
let pageDataFile = '';
let savePromptPath = '';

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
  } else if (args[i] === '--save-prompt' && i + 1 < args.length) {
    savePromptPath = args[i + 1];
    i++;
  }
}

if (!featureName) {
  console.error('❌ エラー: --feature を指定してください');
  process.exit(1);
}

console.log(`🤖 スクリーンショット撮影手順の AI 分析開始`);
console.log(`   機能名: ${featureName}`);
console.log(`   種別: ${manualType}`);
console.log('');

function generateScreenshotPrompt(featureName, manualType, pageData) {
  const typeLabel = manualType === 'admin' ? '管理者' : 'ユーザー';
  
  let prompt = `# ${featureName}の${typeLabel}向けマニュアル作成用スクリーンショット撮影計画の提案依頼

以下の情報を基に、実用的で分かりやすい操作マニュアル作成のための、スクリーンショット撮影手順を提案してください。

## 機能名
${featureName}

## マニュアル種別
${typeLabel}向け

## ページ情報（実画面から取得）

### 見出し
`;
  
  if (pageData && pageData.headings && pageData.headings.length > 0) {
    prompt += pageData.headings.map(h => `- ${h.text}`).join('\n');
  } else {
    prompt += '（見出しなし）';
  }

  prompt += `

### ボタン
`;
  if (pageData && pageData.buttons && pageData.buttons.length > 0) {
    prompt += pageData.buttons.map(b => `- 「${b.text}」`).join('\n');
  } else {
    prompt += '（ボタンなし）';
  }

  prompt += `

### 入力フィールド
`;
  if (pageData && pageData.inputs && pageData.inputs.length > 0) {
    prompt += pageData.inputs.map(i => {
      const label = i.label || i.name || '入力フィールド';
      const type = i.type || 'text';
      return `- ${label} (${type})`;
    }).join('\n');
  } else {
    prompt += '（入力フィールドなし）';
  }

  prompt += `

### リンク
`;
  if (pageData && pageData.links && pageData.links.length > 0) {
    prompt += pageData.links.slice(0, 5).map(l => `- [${l.text}](${l.href})`).join('\n');
  } else {
    prompt += '（リンクなし）';
  }

  prompt += `

## 提案してほしい内容

### スクリーンショット撮影計画

以下のフォーマットで、このページのマニュアル作成に必要なスクリーンショット撮影手順を提案してください：

\`\`\`json
{
  "feature": "${featureName}",
  "steps": [
    {
      "stepNumber": 1,
      "filename": "01-xxx.png",
      "description": "スクリーンショットの説明",
      "actions": [
        {
          "type": "navigate",
          "target": "URL または特定の要素",
          "description": "動作説明"
        },
        {
          "type": "fill",
          "target": "入力フィールドのセレクタまたは説明",
          "value": "入力値（例: ユーザーID）",
          "description": "何を入力するか"
        },
        {
          "type": "click",
          "target": "ボタンのテキストまたはセレクタ",
          "description": "クリックする要素"
        },
        {
          "type": "wait",
          "duration": 1000,
          "description": "待機理由"
        }
      ]
    }
  ]
}
\`\`\`

## 考慮事項

1. **段階的な操作が可能か** - ステップごとに画面の状態が異なること
2. **ユーザーの目線** - ユーザーが実際に行う操作順序に沿うこと
3. **複数入力フィールド** - 複数の入力がある場合、各段階で異なるスクリーンショットを取得すること
4. **分岐処理** - 成功/失敗などの分岐が必要な場合は、主要パターンのみで構いません
5. **最小限のステップ** - マニュアル作成に必要な最小限のステップのみを提案してください

## 例（ログイン機能の場合）

\`\`\`json
{
  "feature": "ログイン機能",
  "steps": [
    {
      "stepNumber": 1,
      "filename": "01-login-initial.png",
      "description": "ログイン画面（初期状態）",
      "actions": [
        {
          "type": "navigate",
          "target": "http://localhost:5173",
          "description": "ログイン画面に移動"
        }
      ]
    },
    {
      "stepNumber": 2,
      "filename": "02-login-with-userid.png",
      "description": "ユーザーID入力後",
      "actions": [
        {
          "type": "fill",
          "target": "最初の入力フィールド",
          "value": "testuser",
          "description": "ユーザーIDを入力"
        }
      ]
    },
    {
      "stepNumber": 3,
      "filename": "03-login-with-password.png",
      "description": "パスワード入力後",
      "actions": [
        {
          "type": "fill",
          "target": "パスワード入力フィールド",
          "value": "Test1234!",
          "description": "パスワードを入力"
        }
      ]
    },
    {
      "stepNumber": 4,
      "filename": "04-login-success.png",
      "description": "ログイン成功後",
      "actions": [
        {
          "type": "click",
          "target": "「ログイン」ボタン",
          "description": "ログインボタンをクリック"
        },
        {
          "type": "wait",
          "duration": 2000,
          "description": "ログイン処理待機"
        }
      ]
    }
  ]
}
\`\`\`

## 注意事項

- JSON形式で正確に出力してください（パース可能であることが重要）
- \`actions\` 配列内の各要素は、実際にPlaywrightスクリプトで実行可能な形式で記述してください
- 入力値は具体的なテスト値を使用してください
- ファイル名は 01-xxx.png, 02-xxx.png のように連番でお願いします
`;

  return prompt;
}

async function main() {
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
        console.log('');
      }
    }

    // AI用プロンプト生成
    const prompt = generateScreenshotPrompt(featureName, manualType, pageData);
    
    // 保存オプションが指定されていれば、プロンプトをファイル保存
    if (savePromptPath) {
      const outPath = path.isAbsolute(savePromptPath)
        ? savePromptPath
        : path.join(PROJECT_DIR, savePromptPath);
      const outDir = path.dirname(outPath);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      fs.writeFileSync(outPath, prompt, 'utf-8');
      console.log(`📝 プロンプトを保存しました: ${outPath}`);
      console.log('  → このファイルを開いて、そのまま Copilot Chat に貼り付けてください');
      console.log('');
    }

    console.log('📝 スクリーンショット撮影計画プロンプト生成完了');
    console.log('');
    console.log('─'.repeat(80));
    console.log(prompt);
    console.log('─'.repeat(80));
    console.log('');
    console.log('💡 次のステップ:');
    console.log('');
    console.log('1. 上記のプロンプトを GitHub Copilot Chat に貼り付けてください');
    console.log('');
    console.log('2. AIが提案したJSON形式の撮影計画を、以下のファイルに保存:');
    const featureSlug = featureName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const outputFile = path.join(PROJECT_DIR, 'wiki', 'manual', `screenshot-steps-${featureSlug}.json`);
    console.log(`   ${outputFile}`);
    console.log('');
    console.log('3. 保存後、以下のコマンドでスクリーンショット撮影を実行:');
    console.log(`   node scripts/capture-manual-screenshots-node.js --type ${manualType} --feature "${featureName}" --screenshot-steps ${outputFile}`);
    console.log('');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

main();
