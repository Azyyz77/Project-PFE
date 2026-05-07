import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 * Docs: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Run all tests in parallel
  fullyParallel: true,

  // Fail CI if you accidentally left test.only in source
  forbidOnly: !!process.env.CI,

  // Retry failed tests (more retries in CI)
  retries: process.env.CI ? 2 : 0,

  // Limit parallelism in CI to reduce flakiness
  workers: process.env.CI ? 1 : undefined,

  // Reporters
  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']]
    : [['html', { open: 'on-failure' }], ['list']],

  // Global setup (pre-authenticate test user once)
  globalSetup: './tests/global-setup.ts',

  use: {
    // Base URL for all page.goto() calls
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Capture trace on first retry for debugging
    trace: 'on-first-retry',

    // Screenshot on test failure
    screenshot: 'only-on-failure',

    // Video recording on first retry
    video: 'on-first-retry',

    // Reasonable timeouts
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  // Output directory for test artifacts
  outputDir: 'test-results',

  // ── Browser Projects ───────────────────────────────────────────────────
  projects: [
    // Primary: Desktop Chrome (always run)
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Secondary: Firefox (CI only or on-demand)
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    // Mobile viewport (Chrome on Pixel 5)
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // ── Dev Server ─────────────────────────────────────────────────────────
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    // Reuse running server in local dev; always start fresh in CI
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
