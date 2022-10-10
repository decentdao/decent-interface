import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: './tests',
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 15000
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
 
  reporter: [
		/* List reporter for getting updates */
		['list'],
		/* HTML output - unzip(open) videos and images before referencing them on the html report */
		['html', {
			/* Output HTML files to playwright-report folder */
			/* Never open a server - important for CI since it doesn't close automatically */
			open: 'never',
		}],
	],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    headless: true,
		viewport: { width: 1280, height: 1020 },
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 25000,
    ignoreHTTPSErrors: true,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'on',
		launchOptions: {
			slowMo: 100, /* Adjusts tests' run speed to aid in video report visualization reports as well as mimic user input/action speed */
		},
    video: 'on',
    contextOptions: {
      recordVideo: {
        dir: './playwright-report' } /* Or wherever you want the videos to be saved. */
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
