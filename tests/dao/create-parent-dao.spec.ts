import { expect, test } from '@playwright/test';
import { DAOCreate } from '../models/DAOCreate';
import { HomePage } from '../models/HomePage';
import { CreateMultisigMocker } from '../models/mock/CreateMultisigMocker';
import { CreateTokenVotingMocker } from '../models/mock/CreateTokenVotingMocker';
import { accounts } from '../models/mock/data/testSigners';
import { BASE_URL } from '../testUtils';

let create: DAOCreate;

test.beforeEach(async ({ page }) => {
  const home = await new HomePage(page).visit();
  create = await home.clickCreateAFractal();
});

test('Create Multisig DAO', async ({ page }) => {
  new CreateMultisigMocker(page);
  await create
    .fillName('Test Multisig')
    .then(() => create.clickMultisig())
    .then(() => create.clickNext())
    .then(() => create.fillTotalSigners('1'))
    .then(() => create.fillThreshold('1'))
    .then(() => create.fillMultisigSigner(0, accounts[0]))
    .then(() => create.clickDeployButton());

  await page.waitForURL(BASE_URL + '/daos/*');

  const daoNameEle = page.locator('[data-testid=DAOInfo-name]');
  await page.waitForSelector('[data-testid=DAOInfo-name]', { timeout: 10000 });
  expect(daoNameEle).toContainText('Test Multisig');
});

test('Create Token Voting DAO', async ({ page }) => {
  new CreateTokenVotingMocker(page);
  await create
    .fillName('Test Token Voting')
    .then(() => create.clickTokenVoting())
    .then(() => create.clickNext())
    .then(() => create.fillTokenName('Test Token'))
    .then(() => create.fillTokenSymbol('TT'))
    .then(() => create.fillTokenSupply('1'))
    .then(() => create.fillAllocationAddress(0, accounts[0]))
    .then(() => create.fillAllocationAmount(0, '1'))
    .then(() => create.clickNext())
    .then(() => create.clickDeployButton());

  await page.waitForURL(BASE_URL + '/daos/*');

  const daoNameEle = page.locator('[data-testid=DAOInfo-name]');
  await page.waitForSelector('[data-testid=DAOInfo-name]', { timeout: 10000 });
  expect(daoNameEle).toContainText('Test Token Voting');
});
