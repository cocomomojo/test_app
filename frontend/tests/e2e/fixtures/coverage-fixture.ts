import { test as base, chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import v8ToIstanbul from 'v8-to-istanbul';

/**
 * Coverage-enabled test fixture.
 *
 * Wraps each test with Chromium's built-in JS coverage collection (page.coverage).
 * After each test the raw V8 coverage is converted to Istanbul format and written
 * as individual JSON files under `coverage/` so they can later be merged and
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
        await page.coverage.startJSCoverage({ resetOnNavigation: false });
      }

      await use();

      if (isChromium) {
        const coverage = await page.coverage.stopJSCoverage();

        fs.mkdirSync(COVERAGE_DIR, { recursive: true });

        for (const entry of coverage) {
          // Only process app source files (skip vendor/node_modules)
          if (!entry.url.includes('node_modules') && entry.url.includes('localhost')) {
            const converter = v8ToIstanbul('', 0, { source: entry.source ?? '' });
            await converter.load();
            converter.applyCoverage(entry.functions);
            const istanbulCoverage = converter.toIstanbul();

            const filename = path.join(
              COVERAGE_DIR,
              `coverage-${Date.now()}-${Math.random().toString(36).slice(2)}.json`
            );
            fs.writeFileSync(filename, JSON.stringify(istanbulCoverage));
          }
        }
      }
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
