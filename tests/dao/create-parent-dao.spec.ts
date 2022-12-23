import { expect, test } from '@playwright/test';
import { DAOCreate } from '../models/DAOCreate';
import { HomePage } from '../models/HomePage';
import { NewDAOMockRequests } from '../models/mock/NewDAOMockRequests';

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
    .fillFractalName('Test Fractal')
    .then(() => create.clickNextButton())
    .then(() => create.clickPureGnosisSafe())
    .then(() => create.clickNextButton())
    .then(() => create.fillWalletAddress('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'))
    .then(() => create.clickDeployButton());

  await page.waitForURL(create.baseUrl + '/daos/*');

  const daoNameEle = page.locator('[data-testid=DAOInfo-name]');
  await page.waitForSelector('[data-testid=DAOInfo-name]', { timeout: 5000 });
  expect(daoNameEle).toContainText('Test Fractal');
});
