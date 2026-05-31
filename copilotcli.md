# GitHub Copilot CLI メモ

このファイルは、GitHub Copilot CLI を安全かつ実用的に使うための個人メモです。
あわせて、Chronicle 系の履歴参照を低コストで行うための query 例もまとめています。

## 周辺ドキュメントの方針

- README は初心者向けに、**絵文字・表・Mermaid フロー** を多めに使う
- README とは別に、workspace 全体を **発表用資料** にまとめる
- パネルディスカッションでも使えるように、**スクリーンショット、図表、コード例、表、Mermaid** を含める

参考:

- https://qiita.com/chomado/items/51d0727a80a14826e036

## モード切り替え

### Shift + Tab でモード切り替え

`Interactive → Plan → Autopilot`

### モードの使い分け

| モード | 特徴 | 向いている場面 |
| --- | --- | --- |
| Interactive | コンテキストを保持しながら対話できる | 続き作業、相談しながら進める実装 |
| Plan | 実装前に段取りを整理しやすい | 複雑な改修、調査、設計 |
| Autopilot | まとまった作業を一気に進めやすい | 明確なタスクの自動処理 |

> Interactive モードは前のやり取りを踏まえて応答するため、継続作業と相性がよいです。

## よく使うコマンド

| コマンド | 機能 | 使う場面 |
| --- | --- | --- |
| `/help` | 利用可能なコマンド一覧を表示 | コマンドを忘れたとき |
| `/clear` | 会話をリセット | 話題を切り替えたいとき |
| `/plan` | 実装前の作業設計 | 複雑な機能に取り組むとき |
| `/research` | GitHub や Web を使った調査 | 実装前に深い調査が必要なとき |
| `/model` | AI モデルの確認・切り替え | モデルを変えたいとき |
| `/exit` | セッションを終了 | 作業を終えるとき |

## `--allow-all` の注意点

`--allow-all` は、権限確認プロンプトをスキップし、CLI がファイル読み取り・コマンド実行・URL アクセスを確認なしで実行できるようにするフラグです。

Programmatic モード（`-p`）では対話ができないため、必要になることがあります。

### 使うときのルール

- **自分で書いたプロンプト** に対してのみ使用する
- **信頼できるディレクトリ** 内でのみ使用する
- **不明な入力や機密情報を含む環境では使わない**

## 認証トークンの扱い

### 重要

- **Personal Access Token を Markdown やソースコードに直接貼らない**
- **リポジトリへコミットしない**
- 必要なら環境変数やシークレット管理機構を使う

### 推奨方針

- ローカル利用なら環境変数に設定する
- GitHub Actions では `Secrets` を使う
- サンプルやメモには `ghp_xxx` や `<REDACTED>` のようなプレースホルダーだけ書く

## ベストプラクティスの参考リンク

### 複数リポジトリにまたがって作業する

- https://docs.github.com/en/copilot/how-tos/copilot-cli/cli-best-practices#work-across-multiple-repositories

### チームガイドライン

- https://docs.github.com/en/copilot/how-tos/copilot-cli/cli-best-practices#team-guidelines

## Chronicle / 履歴参照のコスト最適化メモ

### 基本原則

低コストで使うコツは次の順です。

1. まず `sessions` で期間を絞る
2. `search_index MATCH` で話題を絞る
3. `session_files` / `session_refs` で対象を絞る
4. `turns` の本文は最後に少しだけ読む

### やらない方がよいこと

- `SELECT *` を多用する
- 期間指定なしで `turns` を読む
- 長文列に対して `LIKE '%keyword%'` を多用する
- 最初から大きな JOIN を組む

## `test_app` 向け query テンプレート

履歴 DB に `test_app` の蓄積がある前提で使うテンプレートです。
そのまま貼って使えるように、`repository LIKE '%test_app%'` を軸にしています。

### 最近のセッション一覧

```sql
SELECT
	id,
	updated_at,
	branch,
	agent_name,
	summary
FROM sessions
WHERE repository LIKE '%test_app%'
ORDER BY updated_at DESC
LIMIT 20
```

### よく触ったファイル

```sql
SELECT
	sf.file_path,
	COUNT(*) AS hit_count,
	MAX(sf.first_seen_at) AS last_seen
FROM session_files sf
JOIN sessions s ON s.id = sf.session_id
WHERE s.repository LIKE '%test_app%'
GROUP BY sf.file_path
ORDER BY hit_count DESC, last_seen DESC
LIMIT 20
```

### E2E / QA 関連話題を探す

```sql
SELECT
	si.session_id,
	s.updated_at,
	si.source_type,
	substr(si.content, 1, 180) AS snippet
FROM search_index si
JOIN sessions s ON s.id = si.session_id
WHERE s.repository LIKE '%test_app%'
	AND search_index MATCH 'e2e OR playwright OR qa OR dashboard'
ORDER BY s.updated_at DESC
LIMIT 20
```

### よく参照した Issue / PR / URL

```sql
SELECT
	sr.ref_type,
	sr.ref_value,
	COUNT(*) AS used_count,
	MAX(sr.created_at) AS last_used
FROM session_refs sr
JOIN sessions s ON s.id = sr.session_id
WHERE s.repository LIKE '%test_app%'
GROUP BY sr.ref_type, sr.ref_value
ORDER BY used_count DESC, last_used DESC
LIMIT 20
```

### 最近の checkpoint を見る

```sql
SELECT
	c.session_id,
	c.checkpoint_number,
	c.title,
	c.created_at
FROM checkpoints c
JOIN sessions s ON s.id = c.session_id
WHERE s.repository LIKE '%test_app%'
ORDER BY c.created_at DESC
LIMIT 20
```

## 日次 / 週次の定点観測 query

### 日次セッション数

```sql
SELECT
	date(updated_at) AS day,
	COUNT(*) AS session_count
FROM sessions
WHERE updated_at >= datetime('now', '-14 day')
GROUP BY date(updated_at)
ORDER BY day DESC
```
 
### 週次セッション数

```sql
SELECT
	strftime('%Y-%W', updated_at) AS year_week,
	COUNT(*) AS session_count
FROM sessions
WHERE updated_at >= datetime('now', '-56 day')
GROUP BY strftime('%Y-%W', updated_at)
ORDER BY year_week DESC
```

### 日次でよく触ったファイル上位

```sql
SELECT
	date(sf.first_seen_at) AS day,
	sf.file_path,
	COUNT(*) AS hit_count
FROM session_files sf
JOIN sessions s ON s.id = sf.session_id
WHERE s.repository LIKE '%test_app%'
	AND sf.first_seen_at >= datetime('now', '-7 day')
GROUP BY date(sf.first_seen_at), sf.file_path
ORDER BY day DESC, hit_count DESC
LIMIT 50
```

## standup 用の query セット

### 昨日〜今日のセッション一覧

```sql
SELECT
	updated_at,
	branch,
	summary
FROM sessions
WHERE repository LIKE '%test_app%'
	AND updated_at >= datetime('now', '-1 day')
ORDER BY updated_at DESC
LIMIT 15
```

### 直近24時間で触ったファイル上位

```sql
SELECT
	sf.file_path,
	COUNT(*) AS hit_count
FROM session_files sf
JOIN sessions s ON s.id = sf.session_id
WHERE s.repository LIKE '%test_app%'
	AND sf.first_seen_at >= datetime('now', '-1 day')
GROUP BY sf.file_path
ORDER BY hit_count DESC
LIMIT 10
```

### 直近24時間の話題キーワード探索

```sql
SELECT
	s.updated_at,
	substr(si.content, 1, 160) AS snippet
FROM search_index si
JOIN sessions s ON s.id = si.session_id
WHERE s.repository LIKE '%test_app%'
	AND s.updated_at >= datetime('now', '-1 day')
	AND search_index MATCH 'bug OR fix OR test OR e2e OR ci'
ORDER BY s.updated_at DESC
LIMIT 15
```

## 最小の朝会セット

### 昨日の要約

```sql
SELECT updated_at, summary
FROM sessions
WHERE repository LIKE '%test_app%'
	AND updated_at >= datetime('now', '-1 day')
ORDER BY updated_at DESC
LIMIT 10
```

### 触ったファイル

```sql
SELECT sf.file_path, COUNT(*) AS hit_count
FROM session_files sf
JOIN sessions s ON s.id = sf.session_id
WHERE s.repository LIKE '%test_app%'
	AND sf.first_seen_at >= datetime('now', '-1 day')
GROUP BY sf.file_path
ORDER BY hit_count DESC
LIMIT 10
```

### 最新 checkpoint

```sql
SELECT c.created_at, c.title
FROM checkpoints c
JOIN sessions s ON s.id = c.session_id
WHERE s.repository LIKE '%test_app%'
ORDER BY c.created_at DESC
LIMIT 5
```

## メモ

- まずは **広く取らずに期間を絞る**
- `MATCH` が使える検索は `LIKE` より優先する
- `turns` の長文は最後に読む
- 集計してから詳細を見る

ちょまどさんの更新も、のんびり待ちつつ追記していく。 