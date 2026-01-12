#!/bin/bash

# プロンプトファイルから Copilot Chat を自動実行するスクリプト
# 使用方法: bash scripts/run-prompt.sh wiki/manual/prompt-todo--.txt

PROMPT_FILE="$1"

if [ -z "$PROMPT_FILE" ]; then
  echo "❌ エラー: プロンプトファイルを指定してください"
  echo "使用方法: bash scripts/run-prompt.sh <prompt-file>"
  exit 1
fi

if [ ! -f "$PROMPT_FILE" ]; then
  echo "❌ エラー: ファイルが見つかりません: $PROMPT_FILE"
  exit 1
fi

echo "📝 プロンプトファイルから Chat を実行中..."
echo "ファイル: $PROMPT_FILE"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat "$PROMPT_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 上記のプロンプトを以下の方法で実行できます："
echo ""
echo "【方法1】Copilot Chat で直接実行"
echo "  - VS Code を開く"
echo "  - Copilot Chat を開く (Ctrl+Shift+I)"
echo "  - 上記のプロンプトをコピー＆ペースト"
echo ""
echo "【方法2】自動実行コマンド（今後）"
echo "  - VS Code の Copilot Chat API を使用可能にする拡張機能を導入"
echo ""
