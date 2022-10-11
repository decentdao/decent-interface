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

  test.beforeEach(async ({ page }) => {
    daoSafe = new DaoSafe(page);
    homePage = new HomePage(page);
    navButtons = new Navbuttons(page);
    notifications = new Notifications(page);
    inputFields = new InputFields(page);
    homePage.visit();
    await delay(3000);
    notifications.closeButton('Close Audit Message');
    await page.waitForLoadState();
    await delay(1500);
    navButtons.clickOnButton('Connect to Wallet on Header');
    await page.waitForLoadState('load');
    await delay(2000);
    await page.click('[data-testid="menu:connect"]');
    await page.waitForLoadState('domcontentloaded');
    navButtons.clickOnButton('Select Local Wallet - Web3');
    page.waitForSelector('#connected');
    notifications.assertConnected();
    await page.waitForLoadState('networkidle');
  });

  test('Create 1:1 Gnosis Parent DAO', async ({ page }) => {
    navButtons.clickOnButton('Create a Fractal - Button');

    /* Check URL to make sure navigation is correct. */
    await expect(page).toHaveURL('http://localhost:3000/#/daos/new');

    /* Input a Fractal name */
    inputFields.fillField('Insert Fractal Name');
    navButtons.clickOnButton('Next Button');

    /* Select Gnosis Safe */
    daoSafe.selectSafe('Select Gnosis 1:1 Safe');
    await delay(1200);
    navButtons.clickOnButton('Next Button');

    /* Add Wallet address */
    inputFields.fillField('Insert Local Node Wallet');
    navButtons.clickOnButton('Deploy Button');

    /* Check toaster message for 'Deploying' text */
    notifications.assertDeployed();
    await page.waitForLoadState('domcontentloaded');

    /* Check URL to make sure wallet is connected. */
    await expect(page).not.toHaveURL('http://localhost:3000/#/daos/new');

    /* Check header for created DAO title */
    const parentDAO = page.locator('text=Playwright Parent | Home');
    await expect(parentDAO).toContainText('Playwright Parent | Home');
  });
});
