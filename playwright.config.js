'use strict';
const { defineConfig, devices } = require('@playwright/test');

const PORT = 8787;

module.exports = defineConfig({
  testDir: 'test/e2e',
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node server/index.js',
    url: `http://localhost:${PORT}/healthz`,
    // A reused server might lack the debug and access-code settings the tests rely on
    reuseExistingServer: false,
    env: { PORT: String(PORT), IPPO_DEBUG: '1', IPPO_ACCESS_CODE: 'test' },
  },
});
