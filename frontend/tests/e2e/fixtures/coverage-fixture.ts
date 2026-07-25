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

/**
 * Normalize file paths to work correctly with nyc
 * Converts absolute URLs to relative paths from project root
 */
function normalizeFilePath(url: string): string {
  try {
    const urlObj = new URL(url);
    let pathname = urlObj.pathname;
    
    // Remove port number if present (e.g., :8081)
    pathname = pathname.replace(/:\d+/, '');
    
    // Handle different URL patterns
    if (pathname.includes('/@fs/')) {
      // Vite /@fs/ prefix for absolute paths
      pathname = pathname.replace('/@fs/', '');
    } else if (pathname.startsWith('/src/')) {
      // Already in correct format
    } else if (pathname.includes('/node_modules/')) {
      // Skip node_modules
      return '';
    } else {
      // Assume it's a relative path from src
      if (!pathname.startsWith('/src/')) {
        pathname = `/src${pathname}`;
      }
    }
    
    return pathname;
  } catch {
    return '';
  }
}

export const test = base.extend<{ coverageEnabled: void }>({
  coverageEnabled: [
    async ({ page, browserName }, use) => {
      const isChromium = browserName === 'chromium';

      if (isChromium) {
        console.log('🔍 Starting JS coverage collection...');
        await page.coverage.startJSCoverage({ resetOnNavigation: false });
      }

      await use();

      if (isChromium) {
        const coverage = await page.coverage.stopJSCoverage();
        console.log(`📊 Collected coverage from ${coverage.length} entries`);

        fs.mkdirSync(COVERAGE_DIR, { recursive: true });

        let successCount = 0;
        const processedUrls = new Set<string>();

        for (const entry of coverage) {
          // Filter out node_modules and vendor code
          if (!entry.url || entry.url.includes('node_modules')) {
            continue;
          }

          // Only process URLs from localhost (our app)
          if (!entry.url.includes('localhost') && !entry.url.includes('127.0.0.1')) {
            continue;
          }

          // Skip duplicate URLs
          if (processedUrls.has(entry.url)) {
            console.log(`⊘ Skipping duplicate: ${entry.url}`);
            continue;
          }
          processedUrls.add(entry.url);

          try {
            // Normalize the file path for nyc compatibility
            const normalizedPath = normalizeFilePath(entry.url);
            if (!normalizedPath) {
              console.log(`⊘ Skipping (invalid path): ${entry.url}`);
              continue;
            }

            // Use the source from the coverage entry if available
            const source = entry.source ?? '';
            
            // Create v8-to-istanbul converter with normalized URL
            const converter = v8ToIstanbul(normalizedPath, 0, { source });
            await converter.load();
            converter.applyCoverage(entry.functions);
            const istanbulCoverage = converter.toIstanbul();

            // Ensure the coverage object has the correct structure
            const coverageData: { [key: string]: any } = {};
            for (const [filePath, coverageInfo] of Object.entries(istanbulCoverage)) {
              // Normalize file paths in the coverage data
              const normalizedFilePath = normalizeFilePath(filePath);
              if (normalizedFilePath) {
                coverageData[normalizedFilePath] = coverageInfo;
              }
            }

            // Generate unique filename
            const timestamp = Date.now();
            const hash = Math.random().toString(36).slice(2, 8);
            const filename = path.join(COVERAGE_DIR, `coverage-${timestamp}-${hash}.json`);
            
            fs.writeFileSync(filename, JSON.stringify(coverageData, null, 2));
            successCount++;
            
            console.log(`✓ Coverage saved: ${path.basename(filename)}`);
            console.log(`  URL: ${entry.url}`);
            console.log(`  Path: ${normalizedPath}`);
            console.log(`  Files: ${Object.keys(coverageData).length}`);
          } catch (error) {
            // Log but don't fail - some files might not be convertible
            console.warn(
              `⚠ Failed to convert coverage for ${entry.url}:`,
              error instanceof Error ? error.message : String(error)
            );
          }
        }

        console.log(`✅ Saved ${successCount} coverage files to ${COVERAGE_DIR}`);
        
        // Verify coverage files were created
        const files = fs.readdirSync(COVERAGE_DIR);
        console.log(`📁 Coverage directory now contains ${files.length} files`);
        files.forEach((f, i) => {
          if (i < 3) console.log(`   - ${f}`);
        });
        if (files.length > 3) console.log(`   ... and ${files.length - 3} more`);
      }
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
