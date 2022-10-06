import { expect, test } from '@playwright/test';
import { HomePage } from '../page-objects/HomePage';
import { Navbuttons } from '../page-objects/components/Navbuttons';
import { Notifications } from '../page-objects/Notifications';
import { InputFields } from '../page-objects/InputFields';
//import { helpers } from '../page-objects/Helpers/helpers';

test.describe('DAO Creation', () => {
  let homePage: HomePage;
  let navButtons: Navbuttons;
  let notifications: Notifications;
  let inputFields: InputFields;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    navButtons = new Navbuttons(page);
    notifications = new Notifications(page);
    inputFields = new InputFields(page);
    homePage.visit();
    await page.waitForTimeout(500);
    //await page.waitForLoadState('networkidle');
    //await page.pause();
    notifications.closeButton('Close Audit Message');
    await page.waitForLoadState();
    navButtons.clickOnButton('Connect to Wallet on Header');
    await page.waitForLoadState();
    //await page.waitForSelector('button[role="menuitem"]:has-text("Connect")');
    await page.locator('button[role="menuitem"]:has-text("Connect")').click();
    await page.waitForLoadState();
    navButtons.clickOnButton('Select Local Wallet - Web3');
    await page.waitForTimeout(4000);
    page.waitForSelector('#connected');
    notifications.assertConnected();
    await page.waitForLoadState('networkidle');
  });

  test('Create 1:1 Gnosis Parent DAO', async ({ page }) => {
    navButtons.clickOnButton('Create a Fractal - Button');

    /* Check URL to make sure navigation is correct. */
    await expect(page).toHaveURL('http://localhost:3000/#/daos/new');

    inputFields.fillField('Insert Fractal Name');
    navButtons.clickOnButton('Next Button');

    /* Select Gnosis Safe */
    await page.locator('text=Gnosis Safe').click();

    navButtons.clickOnButton('Next Button');
    inputFields.fillField('Insert Local Node Wallet');
    navButtons.clickOnButton('Deploy Button');
    // page.waitForSelector('#root div:has-text("Deploying Fractal...") >> nth=2');
    // notifications.assertDeployed();

    // page.waitForSelector('#root div:has-text("DAO Created") >> nth=2');
    // notifications.assertCreated();
    await expect(page).not.toHaveURL('http://localhost:3000/#/daos/new');

    const parentDAO = page.locator('text=Playwright Parent | Home');
    await expect(parentDAO).toContainText('Playwright Parent | Home');

    //await page.locator('text=Playwright Parent | Home').click();
  });
});
