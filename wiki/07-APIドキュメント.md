# 📡 7. APIドキュメント

このセクションでは、Test App の REST API エンドポイント仕様について説明します。

---

## 🌐 API 基本情報

### ベース URL

```
開発環境:    http://localhost:8080/api
本番環境:    https://api.example.com/api
```

### 認証方式

**JWT トークンベース認証**

```
Authorization: Bearer <JWT_TOKEN>
```

**リクエストヘッダー例：**
```http
GET /api/todos HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### レスポンス形式

**成功時（200）：**
```json
{
  "success": true,
  "data": { ... },
  "message": null,
  "timestamp": "2024-12-31T12:34:56"
}
```

**エラー時（4xx, 5xx）：**
```json
{
  "success": false,
  "data": null,
  "message": "エラーメッセージ",
  "timestamp": "2024-12-31T12:34:56"
}
```

---

## 🔐 認証エンドポイント

### ログイン

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "user",
  "password": "password"
}
```

**レスポンス (201 Created):**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "username": "user",
    "email": "user@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  },
  "message": null
}
```

**エラーレスポンス (401 Unauthorized):**
```json
{
  "success": false,
  "data": null,
  "message": "Invalid username or password"
}
```

### ログアウト

```http
POST /api/auth/logout
Authorization: Bearer <JWT_TOKEN>
```

**レスポンス (200 OK):**
```json
{
  "success": true,
  "data": null,
  "message": "Logged out successfully"
}
```

---

## ✓ ToDo エンドポイント

### 1. タスク一覧取得

**リクエスト：**
```http
GET /api/todos
Authorization: Bearer <JWT_TOKEN>
```

**クエリパラメータ（オプション）：**

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `status` | string | ステータスでフィルター（TODO, IN_PROGRESS, DONE） |
| `priority` | integer | 優先度でフィルター（0:低, 1:中, 2:高） |
| `sortBy` | string | ソート順（dueDate, priority, createdAt） |

**使用例：**
```http
GET /api/todos?status=TODO&sortBy=dueDate
```

**レスポンス (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "プロジェクト設計",
      "description": "システムアーキテクチャ設計を完了する",
      "status": "IN_PROGRESS",
      "priority": 2,
      "dueDate": "2024-01-15T23:59:59",
      "completedAt": null,
      "createdAt": "2024-12-31T10:00:00",
      "updatedAt": "2024-12-31T11:30:00"
    },
    {
      "id": 2,
      "title": "ドキュメント作成",
      "description": "API 仕様書を作成する",
      "status": "TODO",
      "priority": 1,
      "dueDate": "2025-01-10T23:59:59",
      "completedAt": null,
      "createdAt": "2024-12-31T10:05:00",
      "updatedAt": "2024-12-31T10:05:00"
    }
  ]
}
```

### 2. タスク詳細取得

**リクエスト：**
```http
GET /api/todos/{id}
Authorization: Bearer <JWT_TOKEN>
```

**レスポンス (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "プロジェクト設計",
    "description": "システムアーキテクチャ設計を完了する",
    "status": "IN_PROGRESS",
    "priority": 2,
    "dueDate": "2024-01-15T23:59:59",
    "completedAt": null,
    "createdAt": "2024-12-31T10:00:00",
    "updatedAt": "2024-12-31T11:30:00"
  }
}
```

### 3. タスク作成

**リクエスト：**
```http
POST /api/todos
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "title": "新規タスク",
  "description": "タスクの説明",
  "priority": 1,
  "dueDate": "2025-01-31T23:59:59"
}
```

**レスポンス (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "title": "新規タスク",
    "description": "タスクの説明",
    "status": "TODO",
    "priority": 1,
    "dueDate": "2025-01-31T23:59:59",
    "completedAt": null,
    "createdAt": "2024-12-31T12:00:00",
    "updatedAt": "2024-12-31T12:00:00"
  }
}
```

### 4. タスク更新

**リクエスト：**
```http
PUT /api/todos/{id}
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "title": "更新されたタスク",
  "status": "IN_PROGRESS",
  "priority": 2
}
```

**レスポンス (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "title": "更新されたタスク",
    "status": "IN_PROGRESS",
    "priority": 2,
    "updatedAt": "2024-12-31T13:00:00"
  }
}
```

### 5. タスク削除

**リクエスト：**
```http
DELETE /api/todos/{id}
Authorization: Bearer <JWT_TOKEN>
```

**レスポンス (200 OK):**
```json
{
  "success": true,
  "message": "Todo deleted successfully"
}
```

---

## 📝 メモ エンドポイント

### 1. メモ一覧取得

**リクエスト：**
```http
GET /api/memos
Authorization: Bearer <JWT_TOKEN>
```

**レスポンス (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "会議メモ",
      "content": "プロジェクト会議の記録...",
      "imageUrl": "https://s3.example.com/memo-image-1.jpg",
      "isPinned": true,
      "createdAt": "2024-12-31T09:00:00",
      "updatedAt": "2024-12-31T09:00:00"
    }
  ]
}
```

### 2. メモ作成（ファイルアップロード対応）

**リクエスト：**
```http
POST /api/memos
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

--boundary123
Content-Disposition: form-data; name="title"

新規メモ
--boundary123
Content-Disposition: form-data; name="content"

メモの内容...
--boundary123
Content-Disposition: form-data; name="image"; filename="photo.jpg"
Content-Type: image/jpeg

<binary image data>
--boundary123--
```

**Curl での使用例：**
```bash
curl -X POST http://localhost:8080/api/memos \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=新規メモ" \
  -F "content=メモの内容" \
  -F "image=@/path/to/image.jpg"
```

**レスポンス (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "title": "新規メモ",
    "content": "メモの内容",
    "imageUrl": "https://s3.example.com/memo-image-2.jpg",
    "isPinned": false,
    "createdAt": "2024-12-31T14:00:00",
    "updatedAt": "2024-12-31T14:00:00"
  }
}
```

### 3. メモ更新

**リクエスト：**
```http
PUT /api/memos/{id}
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "title": "更新されたメモ",
  "content": "新しい内容",
  "isPinned": true
}
```

**レスポンス (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "title": "更新されたメモ",
    "isPinned": true,
    "updatedAt": "2024-12-31T15:00:00"
  }
}
```

### 4. メモ削除

**リクエスト：**
```http
DELETE /api/memos/{id}
Authorization: Bearer <JWT_TOKEN>
```

**レスポンス (200 OK):**
```json
{
  "success": true,
  "message": "Memo deleted successfully"
}
```

---

## ⚠️ エラーレスポンス一覧

### 400 Bad Request

**バリデーションエラー：**
```json
{
  "success": false,
  "message": "Title is required",
  "errors": {
    "title": "Title cannot be empty"
  }
}
```

### 401 Unauthorized

**認証失敗：**
```json
{
  "success": false,
  "message": "Unauthorized: Invalid or expired token"
}
```

### 403 Forbidden

**権限なし：**
```json
{
  "success": false,
  "message": "Forbidden: You don't have permission to access this resource"
}
```

### 404 Not Found

**リソースが見つからない：**
```json
{
  "success": false,
  "message": "Todo with id 999 not found"
}
```

### 500 Internal Server Error

**サーバーエラー：**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 📊 API 仕様表

### REST エンドポイント一覧

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| POST | `/api/auth/login` | ログイン | ✗ |
| POST | `/api/auth/logout` | ログアウト | ✓ |
| GET | `/api/todos` | タスク一覧 | ✓ |
| GET | `/api/todos/{id}` | タスク詳細 | ✓ |
| POST | `/api/todos` | タスク作成 | ✓ |
| PUT | `/api/todos/{id}` | タスク更新 | ✓ |
| DELETE | `/api/todos/{id}` | タスク削除 | ✓ |
| GET | `/api/memos` | メモ一覧 | ✓ |
| POST | `/api/memos` | メモ作成 | ✓ |
| PUT | `/api/memos/{id}` | メモ更新 | ✓ |
| DELETE | `/api/memos/{id}` | メモ削除 | ✓ |

---

## 🧪 テスト用 cURL コマンド

### ログイン

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"password"}'
```

### タスク作成

```bash
curl -X POST http://localhost:8080/api/todos \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"新規タスク",
    "description":"説明",
    "priority":1,
    "dueDate":"2025-01-31T23:59:59"
  }'
```

### メモ作成（画像付き）

```bash
curl -X POST http://localhost:8080/api/memos \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=新規メモ" \
  -F "content=メモの内容" \
  -F "image=@/path/to/image.jpg"
```

---

## 📚 次のステップ

- [テスト戦略](./08-テスト戦略.md) - API テスト方法
- [デプロイメント](./09-デプロイメント.md) - 本番環境への展開
