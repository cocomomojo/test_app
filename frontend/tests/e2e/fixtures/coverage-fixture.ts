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
      if (!pathname.startsWith('/src/') && pathname !== '/') {
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

        for (let idx = 0; idx < coverage.length; idx++) {
          const entry = coverage[idx];
          
          console.log(`\n[${idx + 1}/${coverage.length}] Processing entry`);
          console.log(`  URL: ${entry.url}`);
          console.log(`  Functions: ${entry.functions ? entry.functions.length : 0}`);
          console.log(`  Source length: ${entry.source ? entry.source.length : 0}`);

          // Filter out node_modules and vendor code
          if (!entry.url || entry.url.includes('node_modules')) {
            console.log(`  ⊘ Skipped (node_modules)`);
            continue;
          }

          // Only process URLs from localhost (our app)
          if (!entry.url.includes('localhost') && !entry.url.includes('127.0.0.1')) {
            console.log(`  ⊘ Skipped (not localhost)`);
            continue;
          }

          // Skip duplicate URLs
          if (processedUrls.has(entry.url)) {
            console.log(`  ⊘ Skipped (duplicate)`);
            continue;
          }
          processedUrls.add(entry.url);

          try {
            // Normalize the file path for nyc compatibility
            const normalizedPath = normalizeFilePath(entry.url);
            console.log(`  Normalized path: ${normalizedPath}`);
            
            if (!normalizedPath || normalizedPath === '/') {
              console.log(`  ⊘ Skipped (invalid normalized path)`);
              continue;
            }

            // Use the source from the coverage entry if available
            const source = entry.source ?? '';
            console.log(`  Source available: ${source.length > 0 ? 'YES' : 'NO'}`);
            
            // Create v8-to-istanbul converter with normalized URL
            const converter = v8ToIstanbul(normalizedPath, 0, { source });
            await converter.load();
            converter.applyCoverage(entry.functions);
            const istanbulCoverage = converter.toIstanbul();

            console.log(`  Istanbul coverage keys: ${Object.keys(istanbulCoverage).length}`);

            // Ensure the coverage object has the correct structure
            const coverageData: { [key: string]: any } = {};
            for (const [filePath, coverageInfo] of Object.entries(istanbulCoverage)) {
              // Keep the path as-is for now to see what's being generated
              coverageData[filePath] = coverageInfo;
              console.log(`    → ${filePath}: ${JSON.stringify(coverageInfo).length} bytes`);
            }

            // Generate unique filename
            const timestamp = Date.now();
            const hash = Math.random().toString(36).slice(2, 8);
            const filename = path.join(COVERAGE_DIR, `coverage-${timestamp}-${hash}.json`);
            
            const fileContent = JSON.stringify(coverageData, null, 2);
            fs.writeFileSync(filename, fileContent);
            successCount++;
            
            console.log(`  ✓ Coverage saved: ${path.basename(filename)} (${fileContent.length} bytes)`);
          } catch (error) {
            // Log but don't fail - some files might not be convertible
            console.error(
              `  ✗ Failed to convert:`,
              error instanceof Error ? error.message : String(error)
            );
          }
        }

        console.log(`\n✅ Saved ${successCount} coverage files to ${COVERAGE_DIR}`);
        
        // Verify coverage files were created
        const files = fs.readdirSync(COVERAGE_DIR);
        console.log(`📁 Coverage directory now contains ${files.length} files`);
        files.slice(0, 3).forEach((f) => {
          const size = fs.statSync(path.join(COVERAGE_DIR, f)).size;
          console.log(`   - ${f} (${size} bytes)`);
        });
        if (files.length > 3) console.log(`   ... and ${files.length - 3} more`);
      }
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
