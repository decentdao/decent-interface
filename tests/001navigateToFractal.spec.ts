import { test, expect } from '@playwright/test';

test('Go to the Fractal App', async ({ page }) => {
  /* Go to local host http link */
  await page.goto('http://localhost:3000');

  /* Assert Fractal landing page is present */
  const welcome = page.locator('h1');
  await expect(welcome).toContainText('Welcome');
});
