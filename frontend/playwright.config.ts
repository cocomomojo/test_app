import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30000,
  expect: { timeout: 5000 },
  retries: 0,
  reporter: [ ['list'], ['allure-playwright'], ['html', 'test-results/html'] ],
  projects: [
    {
      name: 'chrome',
      use: {
        browserName: 'chromium',
        // use bundled Playwright Chromium for CI environments
        headless: true,
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure'
      }
    }
  ],
  use: {
    viewport: { width: 1280, height: 800 },
    actionTimeout: 10000,
    trace: 'on-first-retry'
  }
});
