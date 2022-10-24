import { expect, test } from '@playwright/test';
import { Notification } from '../page-objects/FractalPage';
import { HomePage } from '../page-objects/HomePage';

test('Confirm Wallet is Connected to Fractal', async ({ page }) => {
  const home = await new HomePage(page).visit();
  await home.connectToWallet();

  /* Assert connected pop-up is present */
  await expect(home.notificationLocator(Notification.Connected)).toBeVisible();

  /* Assert defined wallet address is present ("0xf39F...2266") */
  await home.clickHeaderMenuDropdown();
  await expect(page.locator('//a[normalize-space()="0xf39F...2266"]')).toContainText(
    '0xf39F...2266'
  );

  /* Assert disconnect is present */
  await expect(page.locator('button[role="menuitem"]:has-text("Disconnect")')).toBeVisible();
});
