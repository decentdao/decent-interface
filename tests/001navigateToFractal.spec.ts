import { test, expect } from '@playwright/test';

test('Go to the Fractal App', async ({ page }) => {
  /* Go to local host http link */
  await page.goto('http://localhost:3000');

  /* Assert Fractal landing page is present */
  const headerWalletMenu = page.locator('[data-testid=header-accountMenu]');
  await expect(headerWalletMenu).toBeVisible();
});
