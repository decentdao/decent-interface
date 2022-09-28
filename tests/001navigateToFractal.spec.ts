import { test, expect } from '@playwright/test';

test('Go to the Fractal App', async ({ page, browserName }) => {
  // For CI use when modded wallet is present
  await page.goto('http://localhost:3000', { timeout: 10000 });

  // Go to dev.app
  //await page.goto('https://app.dev.fractalframework.xyz/');

  // assert disconnect is present
  const welcome = page.locator('h1');
  await expect(welcome).toContainText('Welcome');
});
