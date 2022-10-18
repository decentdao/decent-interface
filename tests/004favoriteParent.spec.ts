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

  test('Create 1:1 Gnosis Parent DAO and Favorite', async ({ page }) => {
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

    /* Click favorite star button */
    await navButtons.clickFavoriteStar();

    /* Open menu to and select Favorites option */
    navButtons.clickHeaderConnectWallet();
    await delay(2500);
    navButtons.clickFavoritesMenu();

    /* Assert favorite Parent DAO is visible by title */
    const favPageHeader = page.locator('h1');
    await expect(favPageHeader).toContainText('Favorite Fractals');
    await page.waitForLoadState('networkidle');

    /* Assert Favorite Page DAO title is present and visible. */
    const favPageDaoTitle = page.locator('.text-sm.font-medium.text-gray-50.pb-1');
    await expect(favPageDaoTitle).toContainText('Playwright Parent');
    await page.click('.visible');

    /* Check header for created DAO title */
    await expect(parentDAO).toContainText('Playwright Parent | Home');

    /* Select star icon again to Unfavorite */
    await navButtons.clickFavoriteStar();

    /* Select Favorites from menu */
    await navButtons.clickHeaderConnectWallet();
    await navButtons.clickFavoritesMenu();

    /* Make sure no DOA are displayed under favorites page */
    const noFavorites = page.locator('text=Favorite FractalsNo favorites! >> div >> nth=0');
    await expect(noFavorites).toBeVisible();
  });
});
