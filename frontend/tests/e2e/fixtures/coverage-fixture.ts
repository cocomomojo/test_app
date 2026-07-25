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
        for (const entry of coverage) {
          // Filter out node_modules and vendor code
          if (!entry.url || entry.url.includes('node_modules')) {
            continue;
          }

          // Only process URLs from localhost (our app)
          if (!entry.url.includes('localhost') && !entry.url.includes('127.0.0.1')) {
            continue;
          }

          try {
            // Use the source from the coverage entry if available
            const source = entry.source ?? '';
            
            // Create v8-to-istanbul converter
            const converter = v8ToIstanbul(entry.url, 0, { source });
            await converter.load();
            converter.applyCoverage(entry.functions);
            const istanbulCoverage = converter.toIstanbul();

            // Generate unique filename
            const timestamp = Date.now();
            const hash = Math.random().toString(36).slice(2, 8);
            const filename = path.join(COVERAGE_DIR, `coverage-${timestamp}-${hash}.json`);
            
            fs.writeFileSync(filename, JSON.stringify(istanbulCoverage));
            successCount++;
            
            console.log(`✓ Coverage saved: ${path.basename(filename)}`);
          } catch (error) {
            // Log but don't fail - some files might not be convertible
            console.warn(`⚠ Failed to convert coverage for ${entry.url}:`, error instanceof Error ? error.message : String(error));
          }
        }

        console.log(`✅ Saved ${successCount} coverage files to ${COVERAGE_DIR}`);
      }
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
