import { test, expect } from '@playwright/test';
import { delay } from '../page-objects/Helpers/custom';

test('Go to the Fractal App', async ({ page }) => {
  // For CI use when modded wallet is present
  await page.goto('http://localhost:3000');

  // Go to dev.app
  //await page.goto('https://app.dev.fractalframework.xyz/');

  // assert disconnect is present
  const welcome = page.locator('h1');
  await expect(welcome).toContainText('Welcome');
});
