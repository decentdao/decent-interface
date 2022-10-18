import { DaoSafe } from '../page-objects/DaoSafe';
import { delay } from '../page-objects/Helpers/helpers';
import { expect, test } from '@playwright/test';
import { HomePage } from '../page-objects/HomePage';
import { InputFields } from '../page-objects/InputFields';
import { Navbuttons } from '../page-objects/components/Navbuttons';
import { Notifications } from '../page-objects/Notifications';

test.describe('DAO Creation', () => {
  let daoSafe: DaoSafe;
  let homePage: HomePage;
  let inputFields: InputFields;
  let navButtons: Navbuttons;
  let notifications: Notifications;

  // test.beforeEach(async ({ page }) => {
  //   daoSafe = new DaoSafe(page);
  //   homePage = new HomePage(page);
  //   navButtons = new Navbuttons(page);
  //   notifications = new Notifications(page);
  //   inputFields = new InputFields(page);
  //   homePage.visit();
  //   await delay(3000);
  //   notifications.closeButton('Close Audit Message');
  //   await delay(1500);
  //   navButtons.clickHeaderConnectWallet();
  //   await delay(2500);
  //   await navButtons.clickConnectWalletMenu();
  //   navButtons.clickLocalWallet();
  //   notifications.assertConnected();
  // });

  test('Create 1:1 Gnosis Parent DAO', async ({ page }) => {
    daoSafe = new DaoSafe(page);
    homePage = new HomePage(page);
    navButtons = new Navbuttons(page);
    notifications = new Notifications(page);
    inputFields = new InputFields(page);
    homePage.visit();
    await delay(3000);
    notifications.closeButton('Close Audit Message');
    await delay(1500);
    navButtons.clickHeaderConnectWallet();
    await delay(2500);
    await navButtons.clickConnectWalletMenu();
    navButtons.clickLocalWallet();
    notifications.assertConnected();

    navButtons.clickCreateAFractal();

    /* Check URL to make sure navigation is correct. */
    await expect(page).toHaveURL('http://localhost:3000/#/daos/new');

    /* Input a Fractal name */
    inputFields.fillField('Insert Fractal Name');
    navButtons.clickNextButton();

    /* Select Gnosis Safe */
    daoSafe.selectSafe('Select Gnosis 1:1 Safe');
    await delay(1300);
    navButtons.clickNextButton();

    /* Add Wallet address */
    inputFields.fillField('Insert Local Node Wallet');
    navButtons.clickDeployButton();

    /* Check toaster message for 'Deploying' text, if this fails deploy did not occur. */
    notifications.assertDeployed();

    /* Check URL to make sure wallet is connected. If this fails wallet is not connected correctly. */
    await expect(page).not.toHaveURL('http://localhost:3000/#/daos/new');

    /* Check header for created DAO title */
    const parentDAO = page.locator('text=Playwright Parent | Home');
    await expect(parentDAO).toContainText('Playwright Parent | Home');
  });
});
