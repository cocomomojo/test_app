#!/bin/bash

# 操作マニュアル自動生成スクリプト
# GitHub Actions のワークフローと同じ処理をLocal環境で実行
#
# 使用方法:
#   ./scripts/generate-manual.sh --feature "ログイン機能" --type "user"
#   ./scripts/generate-manual.sh --feature "システム設定" --type "admin"

set -e

# 色付き出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログ関数
log_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

log_warn() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
  echo -e "${RED}❌ $1${NC}"
}

# デフォルト値
FEATURE_NAME=""
MANUAL_TYPE="user"
BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MANUAL_DIR="$BASE_DIR/wiki/manual"
SCREENSHOT_DIR="$MANUAL_DIR/screenshots"
FRONTEND_DIR="$BASE_DIR/frontend"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"

# 引数パース
while [[ $# -gt 0 ]]; do
  case $1 in
    --feature)
      FEATURE_NAME="$2"
      shift 2
      ;;
    --type)
      MANUAL_TYPE="$2"
      shift 2
      ;;
    --frontend-url)
      FRONTEND_URL="$2"
      shift 2
      ;;
    *)
      log_error "不明なオプション: $1"
      exit 1
      ;;
  esac
done

# 必須パラメータチェック
if [ -z "$FEATURE_NAME" ]; then
  log_error "エラー: --feature を指定してください"
  echo "使用方法: $0 --feature \"機能名\" [--type user|admin]"
  exit 1
fi

log_info "=========================================="
log_info "操作マニュアル自動生成ツール"
log_info "=========================================="
log_info "機能名: $FEATURE_NAME"
log_info "マニュアル種別: $MANUAL_TYPE"
log_info "フロントエンドURL: $FRONTEND_URL"
log_info ""

# ========================
# Step 1: 環境チェック
# ========================
log_info "【Step 1】環境チェック"
log_info ""

# Docker チェック
if ! command -v docker &> /dev/null; then
  log_error "Docker がインストールされていません"
  exit 1
fi
log_success "Docker インストール確認"

# Docker Compose チェック
if ! command -v docker-compose &> /dev/null; then
  log_error "Docker Compose がインストールされていません"
  exit 1
fi
log_success "Docker Compose インストール確認"

# Node.js チェック
if ! command -v node &> /dev/null; then
  log_error "Node.js がインストールされていません"
  exit 1
fi
log_success "Node.js インストール確認"

# バックエンド稼働確認
log_info "バックエンド稼働確認中..."
if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
  log_success "バックエンド稼働中"
else
  log_warn "バックエンドが起動していない可能性があります"
  log_info "以下を実行してください:"
  echo "  cd $BASE_DIR"
  echo "  docker-compose -f infra/docker-compose.local.yml up -d"
  exit 1
fi

# フロントエンド稼働確認
log_info "フロントエンド稼働確認中..."
if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
  log_success "フロントエンド稼働中"
else
  log_warn "フロントエンドが起動していない可能性があります"
  log_info "以下を実行してください:"
  echo "  cd $FRONTEND_DIR"
  echo "  npm install"
  echo "  npm run dev"
  log_warn "フロントエンド起動待機中（最大30秒）..."
  
  # 最大30秒待機
  for i in {1..30}; do
    if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
      log_success "フロントエンド起動確認"
      break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
      log_error "フロントエンド起動タイムアウト"
      exit 1
    fi
  done
fi

log_success "全環境チェック完了"
log_info ""

# ========================
# Step 2: ディレクトリ準備
# ========================
log_info "【Step 2】ディレクトリ準備"
log_info ""

mkdir -p "$SCREENSHOT_DIR/$MANUAL_TYPE"
log_success "スクリーンショットディレクトリ作成: $SCREENSHOT_DIR/$MANUAL_TYPE"

mkdir -p "$MANUAL_DIR/$MANUAL_TYPE"
log_success "マニュアルディレクトリ作成: $MANUAL_DIR/$MANUAL_TYPE"

log_info ""

# ========================
# Step 3: スクリーンショット撮影
# ========================
log_info "【Step 3】スクリーンショット撮影"
log_info ""

# Node.js スクリプトでスクリーンショット撮影
SCREENSHOT_SCRIPT_JS="$BASE_DIR/scripts/capture-manual-screenshots-node.js"
SCREENSHOT_SCRIPT_TS="$BASE_DIR/scripts/capture-manual-screenshots.ts"

if [ -f "$SCREENSHOT_SCRIPT_JS" ]; then
  cd "$BASE_DIR"
  FRONTEND_URL="$FRONTEND_URL" node "$SCREENSHOT_SCRIPT_JS" --type "$MANUAL_TYPE" --feature "$FEATURE_NAME"
  log_success "スクリーンショット撮影完了 (node)"
elif [ -f "$SCREENSHOT_SCRIPT_TS" ]; then
  cd "$BASE_DIR"
  FRONTEND_URL="$FRONTEND_URL" npx ts-node "$SCREENSHOT_SCRIPT_TS" --type "$MANUAL_TYPE" --feature "$FEATURE_NAME"
  log_success "スクリーンショット撮影完了 (ts-node)"
else
  log_warn "スクリーンショット撮影スクリプトが見つかりません: $SCREENSHOT_SCRIPT_JS / $SCREENSHOT_SCRIPT_TS"
  log_info "簡易的なスクリーンショット撮影をスキップします (手動で撮影してください)"
fi

log_info ""

# ========================
# Step 4: マニュアルコンテンツ生成
# ========================
log_info "【Step 4】マニュアルコンテンツ生成"
log_info ""

# テンプレート選択
if [ "$MANUAL_TYPE" = "admin" ]; then
  TEMPLATE_FILE="$MANUAL_DIR/templates/admin-manual-template.md"
else
  TEMPLATE_FILE="$MANUAL_DIR/templates/user-manual-template.md"
fi

if [ ! -f "$TEMPLATE_FILE" ]; then
  log_error "テンプレートが見つかりません: $TEMPLATE_FILE"
  exit 1
fi

log_success "テンプレート読み込み: $TEMPLATE_FILE"

# ファイル名生成（日付 + スラッグ化した機能名）
FEATURE_SLUG=$(echo "$FEATURE_NAME" | sed 's/[^a-zA-Z0-9]/-/g' | tr '[:upper:]' '[:lower:]')
FILE_INDEX=$(printf "%02d" $(($(ls -1 "$MANUAL_DIR/$MANUAL_TYPE"/*.md 2>/dev/null | wc -l) + 1)))
OUTPUT_FILE="$MANUAL_DIR/$MANUAL_TYPE/${FILE_INDEX}-${FEATURE_SLUG}.md"

log_success "出力ファイル: $OUTPUT_FILE"

# テンプレートをコピーして機能名を置換
cp "$TEMPLATE_FILE" "$OUTPUT_FILE"

# 機能名を置換
sed -i "s/\[機能名\]/$FEATURE_NAME/g" "$OUTPUT_FILE"
sed -i "s/\[機能名\]/$FEATURE_NAME/g" "$OUTPUT_FILE"
sed -i "s/\[機能名\]/$FEATURE_NAME/g" "$OUTPUT_FILE"

# スクリーンショットパスを置換（テンプレート内のプレースホルダーを実際のパスに）
sed -i "s|\[feature\]|${FEATURE_SLUG}|g" "$OUTPUT_FILE"

# 日付を挿入
TODAY=$(date +%Y年%m月%d日)
sed -i "s|**作成日**: 2026年1月10日|**作成日**: $TODAY|g" "$OUTPUT_FILE"
sed -i "s|**最終更新**: 2026年1月10日|**最終更新**: $TODAY|g" "$OUTPUT_FILE"

log_success "マニュアルコンテンツ生成完了"

log_info ""

# ========================
# Step 5: Git操作
# ========================
log_info "【Step 5】Git操作"
log_info ""

cd "$BASE_DIR"

# ブランチ名生成
BRANCH_NAME="docs/manual-${FEATURE_SLUG}-$(date +%s)"

# 既存ブランチがある場合はスキップ
if git rev-parse --verify "$BRANCH_NAME" > /dev/null 2>&1; then
  log_warn "ブランチが既に存在します: $BRANCH_NAME"
else
  git checkout -b "$BRANCH_NAME" > /dev/null 2>&1
  log_success "ブランチ作成: $BRANCH_NAME"
fi

# 変更をステージング
git add "$OUTPUT_FILE"
git add "$SCREENSHOT_DIR/$MANUAL_TYPE/"* 2>/dev/null || true

log_success "変更ファイルをステージング"

# コミットメッセージ
COMMIT_MESSAGE="docs: ${FEATURE_NAME}の操作マニュアルを追加"

# コミット実行
if git diff --cached --quiet; then
  log_warn "コミット対象のファイルがありません"
else
  git commit -m "$COMMIT_MESSAGE" > /dev/null 2>&1
  log_success "コミット作成: $COMMIT_MESSAGE"
fi

log_info ""

# ========================
# Step 6: PR作成準備
# ========================
log_info "【Step 6】PR作成準備"
log_info ""

# PR作成コマンド表示
PR_TITLE="docs: ${FEATURE_NAME}の操作マニュアルを追加"
PR_BODY="## 概要
${FEATURE_NAME}の操作マニュアルを追加しました。

## 成果物
- ✅ マニュアルコンテンツ: \`$OUTPUT_FILE\`
- ✅ スクリーンショット: \`$SCREENSHOT_DIR/$MANUAL_TYPE/\`

## チェックリスト
- [ ] マニュアルの内容が正確か確認
- [ ] スクリーンショットが適切か確認
- [ ] リンク切れがないか確認
- [ ] Markdownのフォーマットが正しいか確認

## 関連Issue
Issue番号を指定してください。
例: Closes #123"

log_info "PR作成準備完了"
log_info ""

# ========================
# 完了報告
# ========================
log_success "=========================================="
log_success "マニュアル自動生成完了！"
log_success "=========================================="
log_info ""
log_info "📁 生成されたファイル:"
log_info "   マニュアル: $OUTPUT_FILE"
log_info "   スクリーンショット: $SCREENSHOT_DIR/$MANUAL_TYPE/"
log_info ""
log_info "🔗 次のステップ:"
log_info ""
log_info "1. マニュアルをプレビューして確認"
log_info "   code $OUTPUT_FILE"
log_info ""
log_info "2. 内容に問題がなければPRを作成"
log_info "   gh pr create \\"
log_info "     --title \"$PR_TITLE\" \\"
log_info "     --body \"$PR_BODY\" \\"
log_info "     --head $BRANCH_NAME"
log_info ""
log_info "3. または以下でPR作成（対話形式）"
log_info "   gh pr create"
log_info ""
log_success "完了！"
