# Skill: optimize_dockerfile

## Description
Dockerコンテナとマルチステージビルドの最適化を行う。
ビルド時間短縮、イメージサイズ削減、セキュリティ強化を実現する最適化されたDockerfileを生成。

## Inputs
- project_type: プロジェクトタイプ（frontend, backend, fullstack）
- technology_stack: 技術スタック（Vue.js, Java, Node.js等）
- current_dockerfile: 現在のDockerfile（任意）
- optimization_goals: 最適化目標（size, speed, security等）

## Output
- 最適化されたDockerfile
- docker-compose.yml設定
- .dockerignore設定
- ビルド・実行手順書

## Behavior
- マルチステージビルドによる最適化
- レイヤー数削減とキャッシュ効率化
- セキュリティベストプラクティスの適用
- 実測可能な改善指標の提示

## Optimization Templates

### Vue.js + Vite Frontend
```dockerfile
# マルチステージビルド - 最適化版
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --no-audit --no-fund

FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Java Spring Boot Backend
```dockerfile
# マルチステージビルド - Spring Boot最適化
FROM gradle:8-jdk17-alpine AS build
WORKDIR /app
COPY gradle/ gradle/
COPY gradlew build.gradle settings.gradle ./
COPY src/ src/
RUN ./gradlew build -x test --no-daemon

FROM openjdk:17-jre-alpine AS runtime
RUN addgroup -g 1001 -S spring && adduser -u 1001 -S spring -G spring
USER spring:spring
WORKDIR /app
COPY --from=build --chown=spring:spring /app/build/libs/*.jar app.jar
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1
CMD ["java", "-Xms256m", "-Xmx512m", "-jar", "app.jar"]
```

## Security Enhancements
```dockerfile
# セキュリティ強化例
FROM alpine:3.18
RUN apk --no-cache add dumb-init
RUN adduser -D -s /bin/sh myuser
USER myuser
WORKDIR /app
COPY --chown=myuser:myuser . .
ENTRYPOINT ["dumb-init", "--"]
```
