# 🎨 Wiki画像生成ガイド

> ASCII artとmermaid図を美しい画像に変換する完全マニュアル

## 📋 目次

1. [画像化の方法](#画像化の方法)
2. [自動生成スクリプト](#自動生成スクリプト)
3. [手動作成ツール](#手動作成ツール)
4. [画像の配置と参照](#画像の配置と参照)

---

## 🎯 画像化の方法

### 1️⃣ **Mermaid図 → PNG画像**

```bash
# Mermaid CLIをインストール
npm install -g @mermaid-js/mermaid-cli

# 自動生成スクリプトを実行
node scripts/generate-diagrams.js
```

### 2️⃣ **ASCII Art → SVG画像**

```bash
# Python環境で実行
python3 scripts/ascii-to-svg.py
```

### 3️⃣ **手動作成ツール**

| ツール | 用途 | URL |
|:-------|:-----|:----|
| 🎨 **Mermaid Live Editor** | フローチャート、シーケンス図 | https://mermaid.live |
| 🖼️ **Draw.io** | 汎用図表作成 | https://app.diagrams.net |
| 📊 **Excalidraw** | 手描き風図表 | https://excalidraw.com |
| 🏗️ **PlantUML** | UML図、アーキテクチャ図 | https://plantuml.com |

---

## 📁 ファイル構成

```
wiki/
├── images/                    # 🖼️ 画像ファイル
│   ├── tool-selection-flow.png         # ツール選択フロー
│   ├── qase-integration-flow.png       # Qase連携フロー
│   ├── dashboard-architecture.svg      # ダッシュボード構成
│   └── cost-performance-matrix.png     # コスト性能マトリックス
├── 17-テスト管理ツール比較ガイド.md
├── 18-Qase導入ガイド.md
└── 19-GitHub-Test-Dashboard自作ガイド.md
```

---

## 🔄 変換例

### Before: ASCII Art
```
┌─────────────────────────┐
│    システム構成        │
├─────────────────────────┤
│ Frontend │ Backend     │
│ React    │ Node.js     │
└─────────────────────────┘
```

### After: 画像参照
```markdown
![システム構成](images/system-architecture.svg)
```

---

## ⚡ クイックスタート

### 🚀 1分で画像生成

```bash
# 1. スクリプトに実行権限を付与
chmod +x scripts/generate-diagrams.js
chmod +x scripts/ascii-to-svg.py

# 2. 依存関係をインストール
npm install -g @mermaid-js/mermaid-cli

# 3. 画像を一括生成
node scripts/generate-diagrams.js
python3 scripts/ascii-to-svg.py

# 4. 結果確認
ls -la wiki/images/
```

### 📝 Markdownで画像を参照

```markdown
## システムアーキテクチャ

![GitHub Test Dashboard アーキテクチャ](images/dashboard-architecture.svg)

## ツール選択フローチャート

![テスト管理ツール選択フロー](images/tool-selection-flow.png)
```

---

## 🎨 画像最適化のコツ

### ✅ **推奨事項**

- **SVG形式**: ベクター画像、拡大しても高画質
- **PNG形式**: 複雑な図、写真的な画像
- **適切なサイズ**: 幅1200px以下でモバイル対応
- **alt属性**: アクセシビリティのため必ず記述

### ❌ **避けるべき**

- 巨大なファイルサイズ (>500KB)
- 低解像度の画像
- 意味のない画像名 (image1.png等)

---

## 🔧 トラブルシューティング

### 💥 よくある問題

| 問題 | 原因 | 解決方法 |
|:-----|:-----|:---------|
| `mmdc: command not found` | Mermaid CLI未インストール | `npm install -g @mermaid-js/mermaid-cli` |
| 画像が表示されない | パス間違い | 相対パスを確認 `images/filename.png` |
| SVGが崩れる | 特殊文字の問題 | UTF-8エンコーディングを確認 |

### 🆘 サポート

問題が解決しない場合：
1. GitHubのIssueで質問
2. スクリプトのログを確認
3. 手動でツールを使用して画像作成

---

## 🎉 完成イメージ

画像化後のWikiは以下のような見た目になります：

- 📊 **美しいフローチャート**: 複雑な判断プロセスも直感的に理解
- 🏗️ **プロフェッショナルなアーキテクチャ図**: システム構成が一目瞭然
- 📈 **インタラクティブな図表**: マウスオーバーやズームに対応
- 🎨 **統一されたデザイン**: ブランドカラーと一貫性

**Before**: テキストだけの説明で理解困難
**After**: 視覚的で初心者にも分かりやすい完璧なドキュメント！

---

> 💡 **Pro Tip**: 画像は定期的に更新し、システム変更に合わせて最新状態を保ちましょう！
