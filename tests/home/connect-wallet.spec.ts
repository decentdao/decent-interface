import { expect, test } from '@playwright/test';
import { HomePage } from '../models/HomePage';
import { MenuItems } from '../models/NavPage';

test('network connected to local node', async ({ page }) => {
  const home = await new HomePage(page).visit();

  await home.clickHeaderMenuDropdown();

  const networkItem = await home.menuLocator(MenuItems.Network);
  await expect(networkItem!).toContainText('Goerli Test Network');
});

test('wallet should auto connect', async ({ page }) => {
  const home = await new HomePage(page).visit();

  /* Assert defined wallet address is present ("0xf39F...2266") */
  await home.clickHeaderMenuDropdown();
  await expect(page.locator('[data-testid="walletMenu-accountDisplay"]')).toContainText(
    '0xf39F...2266'
  );
});

test('disconnect wallet', async ({ page }) => {
  const home = await new HomePage(page).visit();

  await home.clickHeaderMenuDropdown();
  await home.clickMenuDisconnect();

  await expect(page.locator('[data-testid=header-accountMenu]')).toContainText('Connect Wallet');
});
