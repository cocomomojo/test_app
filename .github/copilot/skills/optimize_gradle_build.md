# Skill: optimize_gradle_build

## Description
Java Spring BootプロジェクトのGradleビルドシステムを最適化。
ビルド時間短縮、CI/CD効率化、依存関係管理の改善を実現。

## Inputs
- project_structure: プロジェクト構造（single-module, multi-module）
- current_build_gradle: 現在のbuild.gradle
- build_performance_goals: パフォーマンス目標
- ci_environment: CI環境（GitHub Actions, Jenkins等）

## Output
- 最適化されたbuild.gradle
- gradle.properties設定
- gradlewスクリプト設定
- CI/CD用タスク定義

## Behavior
- 並列実行・増分ビルドの最適化
- キャッシュ戦略の実装
- テスト効率化設定
- セキュリティスキャン統合

## Optimization Templates

### 最適化されたbuild.gradle
```gradle
plugins {
    id 'org.springframework.boot' version '3.2.1'
    id 'io.spring.dependency-management' version '1.1.4'
    id 'java'
    id 'jacoco'
    id 'org.sonarqube' version '4.4.1.3373'
}

java {
    sourceCompatibility = '17'
    targetCompatibility = '17'
}

configurations {
    compileOnly {
        extendsFrom annotationProcessor
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-actuator'

    developmentOnly 'org.springframework.boot:spring-boot-devtools'

    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.testcontainers:junit-jupiter'
    testImplementation 'org.testcontainers:postgresql'

    annotationProcessor 'org.springframework.boot:spring-boot-configuration-processor'
}

// 並列テスト実行
test {
    useJUnitPlatform()
    maxParallelForks = Runtime.runtime.availableProcessors().intdiv(2) ?: 1
    testLogging {
        events "passed", "skipped", "failed"
    }
}

// JaCoCo カバレッジ
jacoco {
    toolVersion = "0.8.8"
}

jacocoTestReport {
    dependsOn test
    reports {
        xml.required = true
        html.required = true
    }
}

// Spring Boot最適化
bootJar {
    archiveFileName = "${project.name}-${project.version}.jar"
    layered {
        enabled = true
    }
}
```

### gradle.properties（パフォーマンス最適化）
```properties
# Gradle最適化設定
org.gradle.parallel=true
org.gradle.caching=true
org.gradle.configureondemand=true
org.gradle.daemon=true
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m

# Spring Boot最適化
spring.main.lazy-initialization=true
management.endpoints.web.exposure.include=health,info,metrics
```
