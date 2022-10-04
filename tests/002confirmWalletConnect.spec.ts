import { expect, test } from '@playwright/test';

test('Confirm Wallet is Connected to Fractal', async ({ page }) => {
  /* Go to local host http link */
  await page.goto('http://localhost:3000');

  /* Click("Connect Wallet") */
  await page.locator('button:has-text("Connect Wallet")').click();

  /* Dropdown menu of "Connect Wallet" */
  await page.locator('button[role="menuitem"]:has-text("Connect")').click();

  /* Select wallet of "Local NodeConnects as Signer to local provider" */
  await page.locator('text=Local NodeConnects as Signer to local provider').click();

  /* Assert connected pop-up is present */
  const connected = page.locator('#connected');
  await expect(connected).toBeVisible();

  /* Assert defined wallet address is present ("0xf39F...2266") */
  await page.locator('button:has-text("0xf39F...2266")').click();

  /* Assert disconnect is present */
  const disconnect = page.locator('button[role="menuitem"]:has-text("Disconnect")');
  await expect(disconnect).toBeVisible();
});
