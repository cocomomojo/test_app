#!/usr/bin/env node
/**
 * 🎨 WikiのMermaid図をPNG画像として生成するスクリプト
 * 
 * 使用方法:
 * npm install -g @mermaid-js/mermaid-cli
 * node scripts/generate-diagrams.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 🎯 Mermaid図の定義
const diagrams = {
  // Wiki17: テスト管理ツール選択フローチャート
  'tool-selection-flow': `
flowchart TD
    A[🤔 テスト管理ツールが必要] --> B{💰 予算はある？}
    B -->|Yes| C{👥 チーム規模は？}
    B -->|No| D{💻 技術者のみ？}
    
    C -->|大規模 20+| E[TestRail<br/>📊 エンタープライズ]
    C -->|中規模 5-20| F[Qase 有料<br/>⚡ バランス重視]
    C -->|小規模 5-| G[Qase 無料<br/>🚀 スタートアップ]
    
    D -->|Yes| H[GitHub Repository<br/>+ Test Dashboard<br/>🏆 最強無料]
    D -->|No| I[Notion Database<br/>👥 全員参加型]
    
    H --> J[🥇 2026年最適解]
    E --> K[🏢 企業向け]
    F --> L[📈 成長対応]
    G --> M[🌟 お試し最適]
    I --> N[🎨 柔軟性重視]
  `,

  // Wiki18: Qaseシステム連携フロー
  'qase-integration-flow': `
flowchart TD
    A[💻 開発者 Push] --> B[🚀 GitHub Actions トリガー]
    B --> C[🗺️ テスト実行]
    C --> D[🧪 Playwright E2E]
    C --> E[⚙️ JUnit Backend]
    C --> F[⚡ Vitest Frontend]
    
    D --> G[📄 結果ファイル生成]
    E --> G
    F --> G
    
    G --> H[🔗 Qase Reporter]
    H --> I[☁️ Qase Platform]
    I --> J[📊 レポート更新]
    J --> K[📧 チーム通知]
    
    subgraph "🌐 GitHub Repository"
        A1[Source Code]
        A2[Test Cases]
        A3[CI/CD Config]
    end
    
    subgraph "☁️ Qase Cloud"
        I1[Test Cases]
        I2[Test Results]
        I3[Reports]
        I4[Analytics]
    end
  `,

  // Wiki19: GitHub Test Dashboard アーキテクチャ
  'dashboard-architecture': `
flowchart LR
    A[👥 ユーザー] --> B[🌐 React Frontend]
    B --> C[📞 REST API]
    C --> D[⚙️ Node.js Backend]
    D --> E[🗃️ Database]
    D --> F[🔗 GitHub API]
    F --> G[🏗️ GitHub Repo]
    
    subgraph "🎨 フロントエンド"
        B1[📊 Dashboard]
        B2[🎯 Test Manager]
        B3[📈 Analytics]
        B4[🔍 Test Runner]
    end
    
    subgraph "⚙️ バックエンド"
        D1[🔗 GitHub Sync]
        D2[📊 Analytics Engine]
        D3[📈 Report Generator]
        D4[📦 WebSocket]
    end
    
    subgraph "🗃️ データストア"
        E1[Test Cases]
        E2[Test Runs]
        E3[Results]
        E4[Metrics]
    end
  `,

  // Wiki17: コスト性能マトリックス (より詳細版)
  'cost-performance-matrix': `
quadrant-chart
    title テスト管理ツール コスト vs 機能性 (2026年)
    x-axis 低コスト --> 高コスト
    y-axis 基本機能 --> 高機能

    quadrant-1 高機能・高コスト
    quadrant-2 高機能・低コスト ⭐
    quadrant-3 基本・低コスト
    quadrant-4 基本・高コスト

    GitHub Repository: [0.1, 0.9]
    Qase (無料): [0.2, 0.7]
    TestLink: [0.1, 0.4]
    Notion Database: [0.3, 0.6]
    Qase (有料): [0.4, 0.8]
    TestRail: [0.8, 0.9]
    Zephyr: [0.7, 0.8]
    Azure Test Plans: [0.6, 0.8]
  `
};

// 📁 出力ディレクトリの作成
const outputDir = path.join(__dirname, '..', 'wiki', 'images');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 🎨 各図を画像として生成
Object.entries(diagrams).forEach(([name, diagram]) => {
  try {
    // 一時的なmermaidファイルを作成
    const tempFile = path.join(outputDir, `${name}.mmd`);
    const outputFile = path.join(outputDir, `${name}.png`);
    
    fs.writeFileSync(tempFile, diagram.trim());
    
    // Mermaid CLIで画像生成
    console.log(`🎨 生成中: ${name}.png`);
    execSync(`mmdc -i "${tempFile}" -o "${outputFile}" -t neutral -b white --width 1200 --height 800`, {
      stdio: 'inherit'
    });
    
    // 一時ファイル削除
    fs.unlinkSync(tempFile);
    
    console.log(`✅ 完成: ${outputFile}`);
  } catch (error) {
    console.error(`❌ エラー (${name}):`, error.message);
  }
});

console.log(`
🎉 画像生成が完了しました！

📁 生成された画像:
${Object.keys(diagrams).map(name => `   - wiki/images/${name}.png`).join('\\n')}

📝 次のステップ:
1. 生成された画像をMarkdownで参照
2. ASCII artを画像に置き換え
3. より視覚的で理解しやすいドキュメントに改善

💡 使用方法:
![ツール選択フロー](images/tool-selection-flow.png)
`);