import { expect, test } from '@playwright/test';

test.describe.serial('Vist dApp', async () => {
  test.beforeEach(async ({ page }, config) => {
    const { baseURL } = config.project.use;
    await page.goto(baseURL!);
  });

  test('Header renders correctly', async ({ page }) => {
    await expect(page.locator('[data-testid=header-accountMenu]')).toBeVisible();
  });

  test('Fractal dApp welcome title renders', async ({ page }) => {
    await expect(page.locator('[data-testid=home-pageTitle]')).toContainText('Welcome to Fractal');
  });
});
