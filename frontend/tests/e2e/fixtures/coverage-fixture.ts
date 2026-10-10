import { test as base } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import v8ToIstanbul from 'v8-to-istanbul';

/**
 * Coverage-enabled test fixture.
 *
 * Wraps each test with Chromium's built-in JS coverage collection (page.coverage).
 * After each test the raw V8 coverage is converted to Istanbul format and written
 * as individual JSON files under `coverage/e2e-raw/` so they can later be merged and
 * reported with nyc/istanbul.
 *
 * Only works with Chromium (CDP protocol). Other browsers are silently skipped.
 */

const COVERAGE_DIR = path.resolve(process.cwd(), 'coverage/e2e-raw');

function writeCoverageFinalFile(coverageMap: Record<string, any>): void {
  const finalPath = path.join(COVERAGE_DIR, 'coverage-final.json');
  fs.mkdirSync(COVERAGE_DIR, { recursive: true });
  fs.writeFileSync(finalPath, JSON.stringify(coverageMap, null, 2));
}

export function mergeCoverageData(currentCoverage: Record<string, any>, nextCoverage: Record<string, any>): Record<string, any> {
  const mergedCoverage: Record<string, any> = { ...currentCoverage };

  for (const [filePath, nextEntry] of Object.entries(nextCoverage)) {
    const currentEntry = mergedCoverage[filePath];
    if (!currentEntry) {
      mergedCoverage[filePath] = nextEntry;
      continue;
    }

    mergedCoverage[filePath] = {
      ...currentEntry,
      ...nextEntry,
      path: currentEntry.path || nextEntry.path,
      statementMap: {
        ...(currentEntry.statementMap || {}),
        ...(nextEntry.statementMap || {}),
      },
      fnMap: {
        ...(currentEntry.fnMap || {}),
        ...(nextEntry.fnMap || {}),
      },
      branchMap: {
        ...(currentEntry.branchMap || {}),
        ...(nextEntry.branchMap || {}),
      },
      s: {
        ...(currentEntry.s || {}),
        ...(nextEntry.s || {}),
      },
      f: {
        ...(currentEntry.f || {}),
        ...(nextEntry.f || {}),
      },
      b: {
        ...(currentEntry.b || {}),
        ...(nextEntry.b || {}),
      },
    };

    for (const [key, value] of Object.entries(nextEntry.s || {})) {
      if ((currentEntry.s || {})[key] === 1 || value === 1) {
        mergedCoverage[filePath].s[key] = 1;
      }
    }
  }

  return mergedCoverage;
}

/**
 * Normalize file paths to work correctly with nyc
 * Converts absolute URLs to relative paths from project root
 */
export function normalizeFilePath(url: string): string {
  try {
    const urlObj = new URL(url);
    let pathname = urlObj.pathname;

    // Remove port number if present (e.g., :8081)
    pathname = pathname.replace(/:\d+$/, '');

    // Handle Vite /@fs/ and /@id/ prefixes for source files.
    if (pathname.includes('/@fs/')) {
      pathname = pathname.replace('/@fs/', '');
    } else if (pathname.includes('/@id/')) {
      pathname = pathname.replace('/@id/', '');
    }

    // Keep Vite-built asset URLs as relative paths so nyc can report them.
    if (pathname.startsWith('/assets/')) {
      return pathname.slice(1);
    }

    // Ignore node_modules and Vite internal runtime files.
    if (pathname.includes('/node_modules/') || pathname.startsWith('/@vite/')) {
      return '';
    }

    // Convert source URLs to repository-relative paths.
    if (pathname.startsWith('/src/')) {
      return pathname.slice(1);
    }

    let filePath = pathname;
    if (filePath.startsWith('/')) {
      filePath = filePath.slice(1);
    }

    if (!filePath || filePath === '/') {
      return '';
    }

    const localSrc = path.resolve(process.cwd(), filePath);
    if (fs.existsSync(localSrc) && localSrc.startsWith(process.cwd())) {
      return path.relative(process.cwd(), localSrc);
    }

    const distFile = path.resolve(process.cwd(), 'dist', filePath);
    if (fs.existsSync(distFile)) {
      return path.relative(process.cwd(), distFile);
    }

    const distSrc = path.resolve(process.cwd(), 'dist', `.${pathname}`);
    if (fs.existsSync(distSrc)) {
      return path.relative(process.cwd(), distSrc);
    }

    // Preserve the existing main-branch behavior for local app paths.
    if (pathname !== '/' && !pathname.startsWith('/src/')) {
      pathname = `src${pathname}`;
    }

    return pathname;
  } catch {
    return '';
  }
}

const SOURCE_MAP_CACHE_DIR = path.resolve(process.cwd(), 'coverage', 'e2e-raw', '.source-map-cache');

async function loadCoverageSource(normalizedPath: string, entryUrl: string, entrySource = ''): Promise<{ source: string; sourceMapPath?: string; sourceMap?: string }> {
  const absolutePath = path.resolve(process.cwd(), normalizedPath);
  if (fs.existsSync(absolutePath)) {
    const source = fs.readFileSync(absolutePath, 'utf-8');
    const sourceMapPath = `${absolutePath}.map`;
    if (fs.existsSync(sourceMapPath)) {
      return {
        source,
        sourceMapPath,
        sourceMap: fs.readFileSync(sourceMapPath, 'utf-8'),
      };
    }
    return { source };
  }

  const distPath = path.resolve(process.cwd(), 'dist', normalizedPath);
  if (fs.existsSync(distPath)) {
    const source = fs.readFileSync(distPath, 'utf-8');
    const sourceMapPath = `${distPath}.map`;
    if (fs.existsSync(sourceMapPath)) {
      return {
        source,
        sourceMapPath,
        sourceMap: fs.readFileSync(sourceMapPath, 'utf-8'),
      };
    }
    return { source };
  }

  // When the JS asset is served by Vite in dev mode, the source map may be available over HTTP.
  if (entryUrl && (entryUrl.startsWith('http://') || entryUrl.startsWith('https://'))) {
    try {
      const entryUrlObj = new URL(entryUrl);
      const mapUrl = new URL(`${entryUrlObj.pathname}.map`, entryUrlObj.origin).toString();
      const mapResponse = await fetch(mapUrl);
      if (mapResponse.ok) {
        const sourceMap = await mapResponse.text();
        const source = entrySource || await (await fetch(entryUrl)).text();
        fs.mkdirSync(SOURCE_MAP_CACHE_DIR, { recursive: true });
        const cacheMapPath = path.join(SOURCE_MAP_CACHE_DIR, `${path.basename(entryUrlObj.pathname)}.map`);
        fs.writeFileSync(cacheMapPath, sourceMap, 'utf-8');
        return {
          source,
          sourceMapPath: cacheMapPath,
          sourceMap,
        };
      }
    } catch (error) {
      console.log(`  ⚠ Could not fetch source map from ${entryUrl}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Fall back to the source embedded in the coverage entry when the asset is not present on disk.
  return { source: entrySource };
}

export const test = base.extend<{ coverageEnabled: void }>({
  coverageEnabled: [
    async ({ page }, use) => {
      // 1. テストを実行
      await use();

      // 2. テスト終了後、ブラウザ上の window.__coverage__ を取得
      const coverage = await page.evaluate(() => (window as any).__coverage__);

      if (coverage) {
        fs.mkdirSync(COVERAGE_DIR, { recursive: true });

        // ユニークなファイル名で保存（複数テスト実行時の上書き防止）
        const filePath = path.join(
          COVERAGE_DIR,
          `coverage-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.json`
        );

        fs.writeFileSync(filePath, JSON.stringify(coverage));
        console.log(`📊 Saved istanbul coverage to ${filePath}`);
      } else {
        console.warn('⚠️ No window.__coverage__ found on page.');
      }
    },
    { auto: true }
  ],
});

export { expect } from '@playwright/test';
