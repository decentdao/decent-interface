import { expect, test } from '@playwright/test';
import { HomePage } from '../models/HomePage';

test('network connected to local node', async ({ page }) => {
  const home = await new HomePage(page).visit();

  await home.clickAccountMenu();
  await expect(page.locator('[data-testid=accountMenu-network]')).toContainText(
    'Local Test Network'
  );
});

test('connect wallet', async ({ page }) => {
  const home = await new HomePage(page).visit();
  await home.connectToWallet();

  await expect(page.locator('#connected')).toBeVisible();

  /* Assert defined wallet address is present ("0xf39F...2266") */
  await home.clickAccountMenu();
  await expect(page.locator('[data-testid=walletMenu-accountDisplay]')).toContainText(
    '0xf39F...2266'
  );
});

test('disconnect wallet', async ({ page }) => {
  const home = await new HomePage(page).visit();
  await home.connectToWallet();

  await home.clickAccountMenu();
  await home.clickAccountDisconnect();

  await expect(page.locator('[data-testid=header-accountMenu]')).toContainText('Connect Wallet');
});
