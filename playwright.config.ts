import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI || false;
const baseURL = process.env.BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  fullyParallel: !isCI,
  forbidOnly: isCI,
  retries: isCI ? 2 : 1,
  workers: isCI ? 1 : undefined,
  outputDir: './tests/results/artifacts',
  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: './tests/results/report',
        open: 'never',
      },
    ],
    ...(isCI
      ? [['junit', { outputFile: './tests/results/junit.xml' }] as const]
      : []),
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Desktop Firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Desktop Safari',
      use: { ...devices['Desktop Safari'] },
      timeout: 60_000,
    },
    {
      name: 'Mobile Chrome (Pixel 5)',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari (iPhone 13)',
      use: { ...devices['iPhone 13'] },
    },
  ],

  webServer: {
    command: isCI ? 'npm run build && npm run start' : 'npm run dev',
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
