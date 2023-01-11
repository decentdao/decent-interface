import { expect, test } from '@playwright/test';
import { HomePage } from '../models/HomePage';

test('network should appear as Goerli', async ({ page }) => {
  const home = await new HomePage(page).visit();

  await home.clickAccountMenu();
  await expect(page.locator('[data-testid=accountMenu-network]')).toContainText(
    'Goerli Test Network'
  );
});

test('wallet should auto connect', async ({ page }) => {
  const home = await new HomePage(page).visit();

  /* Assert defined wallet address is present ("0xf39F...2266") */
  await home.clickAccountMenu();
  await expect(page.locator('[data-testid="walletMenu-accountDisplay"]')).toContainText(
    '0xf39F...2266'
  );
});

test('disconnect wallet', async ({ page }) => {
  const home = await new HomePage(page).visit();

  await home.clickAccountMenu();
  await home.clickAccountDisconnect();

  await expect(page.locator('[data-testid=header-accountMenu]')).toContainText('Connect Wallet');
});
