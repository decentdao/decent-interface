import { expect, test } from '@playwright/test';

test('Confirm Wallet is Connected to Fractal', async ({ page }) => {
  /* Go to local host http link */
  await page.goto('http://localhost:3000');

  /* Click("Connect Wallet") */
  await page.locator('[data-testid=header-accountMenu]').click();

  /* Dropdown menu of "Connect Wallet" */
  await page.locator('button[data-testid=accountMenu-connect]').click();
  await page.waitForLoadState();

  /* Select wallet of "Local NodeConnects as Signer to local provider" */
  await page
    .locator('#WEB3_CONNECT_MODAL_ID div.web3modal-provider-name:has-text("Local Node")')
    .click();

  /* Assert connected pop-up is present */
  const connected = page.locator('#connected');
  await expect(connected).toBeVisible();

  /* Assert defined wallet address is present ("0xf39F...2266") */
  await page.locator('[data-testid=header-accountMenu]').click();
  const accountDisplay = page.locator(
    '[data-testid=accountMenu-wallet] [data-testid=walletMenu-accountDisplay]'
  );
  await expect(accountDisplay).toContainText('0xf39F...2266');

  /* Assert disconnect is present */
  const disconnect = page.locator('button[data-testid=accountMenu-disconnect]');
  await expect(disconnect).toBeVisible();
});
