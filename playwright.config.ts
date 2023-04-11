import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  // forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  timeout: 30 * 1000, // From https://github.com/vercel/next.js/blob/canary/examples/with-playwright/playwright.config.ts
  reporter: [
    /* List reporter for getting updates */
    [process.env.CI ? 'list' : 'line'],
    /* HTML output - unzip(open) videos and images before referencing them on the html report */
    ['html', {
      /* Output HTML files to playwright-report folder */
      /* Never open a server - important for CI since it doesn't close automatically */
      open: 'never',
    }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    viewport: { width: 1280, height: 1020 },
    ignoreHTTPSErrors: false,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry', /* Tracks exactly what is going on in the test. Saved as a zip file in test-results folder. Can be viewed at 'trace.playwright.dev' in a browser. To use 'npx playwright test --trace on' */
    screenshot: 'on',
    launchOptions: {
      slowMo: !process.env.CI ? 100 : 0, /* Adjusts tests' run speed to aid in video report visualization reports as well as mimic user input/action speed */
      devtools: false, /* When tests are ran locally with the '--headed' flag devtools will appear for debugging purposes. */
    },
    video: !process.env.CI ? 'on' : 'off',
    contextOptions: {
      recordVideo: {
        dir: './playwright-report'
      } /* Or wherever you want the videos to be saved. */
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
  ],
};

export default config;
