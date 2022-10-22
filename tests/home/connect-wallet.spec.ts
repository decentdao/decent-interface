import { expect, test } from '@playwright/test';
import { connectWallet } from '../helpers/wallet';

test.describe.serial('Confirm Wallet is Connected to Fractal', async () => {
  test.beforeEach(async ({ page }, config) => {
    const { baseURL } = config.project.use;
    await page.goto(baseURL!);
  });

  test('network connected to local node', async ({ page }) => {
    await page.locator('[data-testid=header-accountMenu]').click();
    const networkMenuItem = page.locator('[data-testid=accountMenu-network] div div p');
    await expect(networkMenuItem).toContainText('Local Test Network');
  });

  test('connect wallet', async ({ page }) => {
    await connectWallet(page);

    const connected = page.locator('#connected');
    await expect(connected).toBeVisible();

    await page.locator('[data-testid=header-accountMenu]').click();
    const accountDisplay = page.locator(
      '[data-testid=accountMenu-wallet] [data-testid=walletMenu-accountDisplay]'
    );
    await expect(accountDisplay).toContainText('0xf39F...2266');
  });

  test('disconnect wallet', async ({ page }) => {
    await connectWallet(page);

    await page.locator('[data-testid=header-accountMenu]').click();

    /* Locate and click disconnect */
    page.locator('button[data-testid=accountMenu-disconnect]').click();

    await expect(page.locator('[data-testid=header-accountMenu]')).toContainText('Connect Wallet');
  });
});
