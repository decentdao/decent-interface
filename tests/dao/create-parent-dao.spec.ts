import { expect, test } from '@playwright/test';
import { DAOCreate } from '../models/DAOCreate';
import { HomePage } from '../models/HomePage';
import { CreateMultisigMocker } from '../models/mock/CreateMultisigMocker';
import { BASE_URL } from '../testUtils';

let create: DAOCreate;

test.beforeEach(async ({ page }) => {
  const home = await new HomePage(page).visit();
  create = await home.clickCreateAFractal();
});

test('Create Multisig DAO', async ({ page }) => {
  new CreateMultisigMocker(page);
  await create
    .fillName('Test Fractal')
    .then(() => create.clickNextButton())
    .then(() => create.clickMultisig())
    .then(() => create.clickNextButton())
    .then(() => create.fillTotalSigners('1'))
    .then(() => create.fillThreshold('1'))
    .then(() => create.fillMultisigSigner(0, '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'))
    .then(() => create.clickDeployButton());

  await page.waitForURL(BASE_URL + '/daos/*');

  const daoNameEle = page.locator('[data-testid=DAOInfo-name]');
  await page.waitForSelector('[data-testid=DAOInfo-name]', { timeout: 10000 });
  expect(daoNameEle).toContainText('Test Fractal');
});
