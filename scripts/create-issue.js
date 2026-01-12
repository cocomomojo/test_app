#!/usr/bin/env node

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Issue タイプの定義
const ISSUE_TYPES = {
  'e2e-test': {
    title: 'E2E テスト作成',
    labels: ['test', 'e2e', 'auto-generated'],
    assignee: 'e2e-test-specialist',
    bodyTemplate: (date) => `## 背景
自動生成されたE2Eテスト作成タスクです。

## 対象機能とテストシナリオ
### ログイン機能
- [ ] 正常系: 正しい認証情報でログイン成功
- [ ] 異常系: 空のユーザ名でエラー表示
- [ ] 異常系: 不正なパスワードでエラー表示

### TODO管理機能
- [ ] 作成: 新規TODO作成
- [ ] 削除: TODO削除
- [ ] 完了: TODO完了マーク

### メモ管理機能
- [ ] 作成: 新規メモ作成
- [ ] 編集: メモ編集
- [ ] 削除: メモ削除

## 受け入れ条件
- すべてのテストがローカルで成功すること
- Allureレポートが生成されること
- テストカバレッジが80%以上であること

## 実装パス
\`frontend/tests/e2e/\`

---
**自動生成日**: ${date}
**自動生成タイプ**: E2Eテスト作成`
  },
  'manual': {
    title: '操作マニュアル作成',
    labels: ['documentation', 'manual', 'auto-generated'],
    assignee: 'manual-specialist',
    bodyTemplate: (date) => `## 背景
自動生成された操作マニュアル作成タスクです。

## 対象機能
### ユーザー向け操作マニュアル
- [ ] ログイン・ログアウト手順
- [ ] TODO管理機能の使い方
- [ ] メモ管理機能の使い方
- [ ] 設定変更手順

### 管理者向け操作マニュアル
- [ ] システム設定手順
- [ ] ユーザー管理手順
- [ ] バックアップ・リストア手順

## 成果物
- ユーザー向けマニュアル (Markdown形式)
- 管理者向けマニュアル (Markdown形式)
- スクリーンショット付き手順書

## 受け入れ条件
- 初心者でも理解できる明確な説明
- スクリーンショットを適切に配置
- 目次とリンクが正しく機能すること

## 実装パス
\`wiki/manual/\`

---
**自動生成日**: ${date}
**自動生成タイプ**: 操作マニュアル作成`
  },
  'feature': {
    title: 'アプリ機能改修',
    labels: ['enhancement', 'feature', 'auto-generated'],
    assignee: null,
    bodyTemplate: (date) => `## 背景
自動生成されたアプリ機能改修タスクです。

## 改修対象機能
### UI/UX改善
- [ ] レスポンシブデザイン対応
- [ ] アクセシビリティ向上
- [ ] エラーメッセージの改善

### パフォーマンス改善
- [ ] ページ読み込み速度の最適化
- [ ] API レスポンス時間の短縮
- [ ] メモリ使用量の削減

### 新機能追加
- [ ] 検索機能の強化
- [ ] フィルタリング機能の追加
- [ ] エクスポート機能の実装

## 受け入れ条件
- 既存機能に影響を与えないこと
- すべてのテストが成功すること
- コードレビューを完了すること
- ドキュメントを更新すること

## 実装パス
- フロントエンド: \`frontend/src/\`
- バックエンド: \`backend/src/\`

---
**自動生成日**: ${date}
**自動生成タイプ**: アプリ機能改修`
  },
  'error-analysis': {
    title: 'エラー解析',
    labels: ['bug', 'error-analysis', 'auto-generated'],
    assignee: null,
    bodyTemplate: (date) => `## 背景
自動生成されたエラー解析タスクです。

## エラー解析対象
### フロントエンドエラー
- [ ] コンソールエラーの分析
- [ ] ネットワークエラーの調査
- [ ] レンダリングエラーの特定

### バックエンドエラー
- [ ] サーバーログの分析
- [ ] データベースエラーの調査
- [ ] API エラーレスポンスの改善

### パフォーマンス問題
- [ ] メモリリークの調査
- [ ] 遅延処理の特定
- [ ] ボトルネックの分析

## 解析手法
- ログファイルの確認
- エラートレースの追跡
- パフォーマンスプロファイリング
- テストケースでの再現

## 成果物
- エラー分析レポート
- 原因特定と対策案
- 修正パッチまたはPR

## 受け入れ条件
- エラーの根本原因を特定すること
- 再現手順を明確にすること
- 修正案を提示すること

## 実装パス
- ログ: \`logs/\`
- 修正: 該当ファイル

---
**自動生成日**: ${date}
**自動生成タイプ**: エラー解析`
  }
};

/**
 * GitHub Issue を作成
 * @param {string} type - Issue タイプ ('e2e-test', 'manual', 'feature', 'error-analysis')
 */
async function createIssue(type) {
  const config = ISSUE_TYPES[type];
  
  if (!config) {
    console.error(`❌ 不明なIssueタイプです: ${type}`);
    console.error(`利用可能なタイプ: ${Object.keys(ISSUE_TYPES).join(', ')}`);
    process.exit(1);
  }

  try {
    const date = new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    const title = `[自動] ${config.title} - ${date}`;
    const body = config.bodyTemplate(date);
    // バッククォート、ダブルクォート、$をエスケープ
    const bodyEscaped = body
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\$/g, '\\$')
      .replace(/`/g, '\\`');
    const labels = config.labels.join(',');

    let command = `gh issue create --title "${title}" --body "${bodyEscaped}" --label "${labels}"`;

    if (config.assignee) {
      command += ` --assignee "${config.assignee}"`;
    }

    console.log(`📝 ${config.title}のIssue を作成中...`);
    const { stdout } = await execPromise(command);
    
    console.log(`✅ Issue を作成しました:`);
    console.log(stdout);

  } catch (error) {
    // アサイン失敗の場合、アサイン無しで再実行
    if (error.message.includes('Could not resolve to a User') && config.assignee) {
      console.warn(`⚠️  ユーザー '${config.assignee}' が見つかりません。アサイン無しで Issue を作成します。`);
      
      try {
        const date = new Date().toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        
        const title = `[自動] ${config.title} - ${date}`;
        const body = config.bodyTemplate(date);
        const bodyEscaped = body
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/\$/g, '\\$')
          .replace(/`/g, '\\`');
        const labels = config.labels.join(',');
        
        const command = `gh issue create --title "${title}" --body "${bodyEscaped}" --label "${labels}"`;
        
        const { stdout } = await execPromise(command);
        console.log(`✅ Issue を作成しました:`);
        console.log(stdout);
        console.log(`\n📌 注意: Issue を手動で @${config.assignee} にアサインしてください。`);
      } catch (retryError) {
        console.error('❌ エラーが発生しました:', retryError.message);
        process.exit(1);
      }
    } else {
      console.error('❌ エラーが発生しました:', error.message);
      process.exit(1);
    }
  }
}

// コマンドライン引数からIssueタイプを取得
const args = process.argv.slice(2);
const type = args[0];

if (!type) {
  console.log('使用方法: node scripts/create-issue.js <type>');
  console.log('');
  console.log('利用可能なタイプ:');
  Object.keys(ISSUE_TYPES).forEach(key => {
    console.log(`  - ${key}: ${ISSUE_TYPES[key].title}`);
  });
  process.exit(1);
}

createIssue(type);
