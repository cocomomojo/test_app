import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30000,
  expect: { timeout: 5000 },
  retries: 0,
  reporter: [ ['list'], ['allure-playwright'] ],
  projects: [
    {
      name: 'chrome',
      use: {
        browserName: 'chromium',
        // use bundled Playwright Chromium for CI environments
        headless: true,
        baseURL: 'http://localhost:8081'
      }
    }
  ],
  use: {
    viewport: { width: 1280, height: 800 },
    actionTimeout: 10000,
    trace: 'on-first-retry'
  }
});
