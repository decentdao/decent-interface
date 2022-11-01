import { test } from '@playwright/test';
import { DAOCreate } from '../models/DAOCreate';
import { HomePage } from '../models/HomePage';

test.describe('DAO Creation', () => {
  let create: DAOCreate;

  test.beforeEach(async ({ page }) => {
    const home = await new HomePage(page).visit();
    create = await home
      .dismissAuditMessage()
      .then(() => home.connectToWallet())
      .then(() => home.dismissConnectedMessage())
      .then(() => home.clickCreateAFractal());
  });

  test('Create MVD Gnosis DAO', async ({ page }) => {
    await create
      .fillFractalName('Test Fractal')
      .then(() => create.clickNextButton())
      .then(() => create.clickMVDGnosisSafe())
      .then(() => create.clickNextButton())
      .then(() => create.fillWalletAddress('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'))
      .then(() => create.clickDeployButton());

    await page.waitForURL(create.baseUrl + '/daos/0x*');
  });

  test('Create Pure Gnosis DAO', async ({ page }) => {
    await create
      .fillFractalName('Test Fractal')
      .then(() => create.clickNextButton())
      .then(() => create.clickPureGnosisSafe())
      .then(() => create.clickNextButton())
      .then(() => create.fillWalletAddress('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'))
      .then(() => create.clickDeployButton());

    await page.waitForURL(create.baseUrl + '/daos/0x*');
  });

  // TODO both DAO pure gnosis creation paths (token and multisig)
});
