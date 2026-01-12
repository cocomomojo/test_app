cd /home/k-mano/test_app/infra && docker-compose -f docker-compose.local.yml up -d

cd /home/k-mano/test_app/frontend && npm run dev

---
# 1. Issue 自動作成
@create-issue メモ機能の操作マニュアル作成のIssueを作成してください


# 1 メモ画面のページ分析（/memo）
# 目的: 実DOMの情報をAIに渡せるようにする
# 実行コマンド:
cd /home/k-mano/test_app
NODE_PATH="./frontend/node_modules" node scripts/analyze-page-content.js --url "http://localhost:5173/memo" --output wiki/manual/memo-page-analysis.json

# 2 AI向けプロンプト生成（撮影計画）
# 目的: AIに「どんなスクショを撮るか」を提案してもらう
# 実行コマンド:
 NODE_PATH="./frontend/node_modules" node scripts/generate-screenshot-steps.js --feature "メモ機能" --type user --page-data wiki/manual/memo-page-analysis.json --save-prompt wiki/manual/prompt-screenshot-steps-メモ機能.txt

# 出力:
# - wiki/manual/screenshots/user/ （3 枚の PNG）
# - wiki/manual/prompt-todo--.txt （AI プロンプト）
# - wiki/manual/user-page-analysis.json （DOM 分析）

# 3. Copilot でマニュアル作成
# prompt ファイルを Copilot Chat に貼り付け → Markdown 生成

```
他方法
A： ファイルをドラッグ＆ドロップ
Chat入力欄に wiki/manual/prompt-todo--.txt をドラッグ＆ドロップ
B： ファイルリンク参照
@file:wiki/manual/prompt-todo--.txt の内容を実行してください
```

# 4. Git + PR で自動クローズ
git checkout -b feature/xxx
git add wiki/manual/...
git commit -m "..."
gh pr create --body "Closes #3 ..."

# 5. PRレビュー、マージ

---

TODO LIST

- [x] deepwiki を試す　[参考サイト](https://qiita.com/a32-suzuki/items/c3540da3e009dab1bf97)　ドキュメント指示書.mdからドキュメントを作成して。8.2%

- [x] 方法 1: GitHub Issue でエージェントを利用（推奨）カスタムエージェント
- [ ] github copilot plan
- [ ] Playwright Test Agents
- [ ] Issue の自動生成
- [x] agent.md
- [x] [GitHub Copilot カスタムコマンド](https://zenn.dev/ren21/articles/de3da1fdaf71d4)

- [ ] [GitHub Copilot Chat の Ask/Edit/Agent モードをコードレベルで理解して使い分ける](https://zenn.dev/openjny/articles/5487004a195051)
- [ ] 1. [Agent Skills](https://note.com/masa_wunder/n/nffa03e1d5999)
- [ ] [WSL2 の VS Code で GitHub MCP Server (github-mcp-server) を動かしてみた](https://techblog.ap-com.co.jp/entry/2025/04/07/190000)
---
---
Wiki14「E2E テスト専門エージェント ガイド」の方法1は、
ユーザーが手動で Issue を作成し、
エージェントをアサインするフローです。自動で Issue を生成する仕組みは含まれていません。

手動手順の流れ（概要）
リポジトリで新規 Issue を作成（テンプレート例はドキュメント記載のとおり）。
右側の Assignees から @e2e-test-specialist を選択。
エージェントが Issue を元にテスト実装と PR を自動で進める。
もし「Issue の自動生成」もしたい場合は、別途

GitHub Actions でテンプレート Issue を起こす
CLI やカスタムコマンドで Issue を作成する
などの仕組みを追加で用意する必要があります。

---
Webアプリの操作マニュアルを作成したいです。
・Playwrightを使用（PlaywrightMCP使用することで良いものができるのであれば、それを使用）
・Agent.mdなどを使用するこで良いものができるのであればそれを使用
・他に何か必要なものありますか？（アプリ起動、コードは不要でもよい？）
どのような手段があるか教えてください

---
私はソフトウエア開発者技術者で、CICDやE2E構築を中心に従事しています
生成AIで効率的に作業したいのですが、
生成AIの使い方が多く、何をどのように活用したらよいかいつも迷ってしまいます。

複数のWebサイトを参照して、
活用別に、マニュアル（概要・手順・ベストプラクティス・フロー・注意事項・比較表など）を
markdownファイルに出力することはできますか？

・開発環境：vscode、github、GitHub copilot、WSL、Dockerなど
・github mcp： issue 作成から
・Playwright agent：開発アプリをリグレッションテストで品質安定化
・Agent.md：E2E作成（Playwright）、E2E作成（codeceptjs）

公式サイト
Playwright、codeceptjs、github

GitHub Copilot Chat の Ask/Edit/Agent モードをコードレベルで理解して使い分ける
https://share.google/99JzRzK6NdqfMQk9w
 
参考 - GitHub Copilot 各種資料/チートシート
https://qiita.com/Hurry_Fox/items/d18d85a17f6c74b659f8


【Nano Banana 爆速仕事術】マニュアル・手順書作成を“ほぼ自動化”する全手順を解説（ビジネス＋IT）
https://share.google/EaIck8YIv8078V0bU

Playwright MCPとQAエージェントによるGitHub Copilot活用
https://share.google/aZavfFzVlCHU9nEu7

２日間で全社員がわかる仕様ガイドを7件全社公開した
https://share.google/uwpivki5W4t6jaDgn
 

https://speakerdeck.com/legalontechnologies/playwright-ai-e2e-testing-stac-2025?slide=11
https://recruit.group.gmo/engineer/jisedai/blog/playwright-agents-codex-cli/
https://note.com/life_to_ai/n/n0a7bd75f1f73
https://product.plex.co.jp/entry/devin-takes-on-E2E-testing


https://zenn.dev/remitaid/articles/62083277d92f68

https://blog.ogaclejapan.dev/2025/medley-advent-calendar-2025/

https://www.skygroup.jp/tech-blog/article/1525/

https://gihyo.jp/article/2024/10/generative-ai-for-testing
https://zenn.dev/prevent/articles/f19872f65b2de2

https://github.com/cocomomojo/mcp_test

https://www.vamp.jp/archives/2528
https://qiita.com/H-Iida/items/9a078b13332b64a4cbb5
https://qiita.com/H-Iida/items/3ebffe0d0b7754614ed5
https://zenn.dev/jins/articles/baadbdb2fec2ad


https://zenn.dev/thinkingsinc/articles/cd59e1ffc4f842

https://news.yahoo.co.jp/articles/c33ab6516a7d1c40f5362e236796c52dc28f595f

https://zenn.dev/ren21/articles/de3da1fdaf71d4

https://qiita.com/a32-suzuki/items/c3540da3e009dab1bf97

開発の手動構築を「AWS MCP Server」でサッとIaC 管理へ移行しよう - asken テックブログ
https://share.google/IZhb72PD67UaHZKBV

AWS設計ガイドラインを公開しました | フューチャー技術ブログ
https://share.google/FIk4MyxZNysOkk2AQ

GitHub Copilotを使いこなす 実例に学ぶAIコーディング活用術
https://share.google/QiWXRyAUzjoItjbEY

2026年、日本のソフトウェア開発を変える5つの潮流
https://share.google/tzEdnhEBFuO6INgTG

GitHub Copilotの実務活用術：レビュー・テスト自動化・開発効率化のリアル
https://zenn.dev/prevent/articles/f19872f65b2de2


AIによる手動QAの自動化：自動テストコーディングのAI化でテスト実行工数を52%削減
https://tech-blog.tabelog.com/entry/ai-for-qa-automation-test

============================

@create-issue
タイプ: 操作マニュアル作成
対象機能: TODO機能の操作マニュアル
説明: ユーザー向けとしてTODO機能の操作方法を記載したマニュアルを作成してください。スクリーンショット付きで初心者向けに分かりやすくまとめてください。

↓

Copilot カスタムコマンドの代わりに、直接スクリプトで Issue を作成します。

cd /home/k-mano/test_app && node scripts/create-issue.js --type manual --title "TODO機能の操作マニュアル作成" --feature "TODO機能" --description "ユーザー向けとしてTODO機能の操作方法を記載したマニュアルを作成してください。スクリーンショット付きで初心者向けに分かりやすくまとめてください。"

