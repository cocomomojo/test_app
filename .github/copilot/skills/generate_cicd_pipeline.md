# Skill: generate_cicd_pipeline

## Description
GitHub Actions / Jenkinsfile の CI/CD パイプラインを生成する。
プロジェクトの特性に合わせた最適化されたパイプライン設定を自動生成。

## Inputs
- project_type: プロジェクトタイプ（web, api, mobile, etc.）
- language: 主要プログラミング言語
- build_steps: ビルドプロセス
- deploy_target: デプロイ先（AWS, GCP, Azure, etc.）
- test_requirements: テスト要件

## Output
- 最適化されたCI/CDパイプライン設定
- 環境別設定ファイル
- セットアップ手順書

## Behavior
- キャッシュ戦略、並列化、セキュリティを考慮したYAML/Jenkinsfileを生成
- 環境分離（dev/staging/prod）を適切に設定
- シークレット管理とセキュリティスキャンを組み込み
- 実行時間最適化とコスト効率を考慮
- 監視・アラート設定を含める

## Pipeline Templates

### GitHub Actions (Node.js)
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16, 18, 20]
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm run build --if-present
      - run: npm test
```

### Docker Build & Deploy
```yaml
  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-1
      - name: Build and push Docker image
        run: |
          aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin ${{ secrets.ECR_REGISTRY }}
          docker build -t ${{ secrets.ECR_REGISTRY }}/app:${{ github.sha }} .
          docker push ${{ secrets.ECR_REGISTRY }}/app:${{ github.sha }}
```
