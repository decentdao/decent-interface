import { expect, test } from '@playwright/test';
import { DAOCreate } from '../models/DAOCreate';
import { HomePage } from '../models/HomePage';
import { NewDAOMockRequests } from '../models/mock/NewDAOMockRequests';
import { BASE_URL } from '../testUtils';

let create: DAOCreate;

test.beforeEach(async ({ page }) => {
  const home = await new HomePage(page).visit();
  create = await home
    .connectToWallet()
    .then(() => home.dismissConnectedMessage())
    .then(() => home.clickCreateAFractal());
});

test('Create Pure Gnosis DAO', async ({ page }) => {
  await new NewDAOMockRequests(page).newDAORoutes();
  await create
    .fillName('Test Fractal')
    .then(() => create.clickNextButton())
    .then(() => create.clickPureGnosisSafe())
    .then(() => create.clickNextButton())
    .then(() => create.fillTotalSigners('1'))
    .then(() => create.fillThreshold('1'))
    .then(() => create.fillWalletAddress(0, '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'))
    .then(() => create.clickDeployButton());

  await page.waitForURL(BASE_URL + '/daos/*');

  const daoNameEle = page.locator('[data-testid=DAOInfo-name]');
  await page.waitForSelector('[data-testid=DAOInfo-name]', { timeout: 10000 });
  expect(daoNameEle).toContainText('Test Fractal');
});
