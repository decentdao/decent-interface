import { Page } from '@playwright/test';

export async function connectWallet(page: Page) {
  /* Click("Connect Wallet") */
  await page.locator('[data-testid=header-accountMenu]').click();

  /* Dropdown menu of "Connect Wallet" */
  await page.locator('button[data-testid=accountMenu-connect]').click();
  await page.waitForLoadState();

  /* Select wallet of "Local NodeConnects as Signer to local provider" */
  await page
    .locator('#WEB3_CONNECT_MODAL_ID div.web3modal-provider-name:has-text("Local Node")')
    .click();
}
