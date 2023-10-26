import { expect, test } from '@playwright/test';
import { DAOCreate } from '../models/DAOCreate';
import { DAOHome } from '../models/DAOHome';
import { HomePage } from '../models/HomePage';
import { CreateMultisigMocker } from '../models/mock/CreateMultisigMocker';
import { SubgraphMocker } from '../models/mock/SubgraphMocker';
import { createSubgraphDAO } from '../models/mock/data/creation';
import { BASE_URL } from '../testUtils';

let create: DAOCreate;
let daoDashboard: DAOHome;

test.beforeEach(async ({ page }) => {
  const home = await new HomePage(page).visit();
  create = await home.clickCreateAFractal();
  daoDashboard = await create.createTestMultisigSnapshot();
  await daoDashboard.visit();
});

test('DAO with Snapshot URL displays proposals from Snapshot', async ({ page }) => {
  new CreateMultisigMocker(page);
  const subgraphMocker = new SubgraphMocker(page);
  await subgraphMocker.mock(createSubgraphDAO('0x', 'Test Multisig', []));

  await page.waitForURL(BASE_URL + '/daos/*');

  const proposalIdSelector = '[data-testid=Proposal-id-#3c39]';
  const proposalTitleSelector = '[data-testid=Proposal-title-Portfolio Sub-DAO Council: Epoch 2]';

  const proposalIdElement = page.locator(proposalIdSelector);
  const proposalTitleElement = page.locator(proposalTitleSelector);

  await page.waitForSelector(proposalIdSelector, { timeout: 10000 });
  await page.waitForSelector(proposalTitleSelector, { timeout: 10000 });

  expect(proposalIdElement).toContainText('#3c39');
  expect(proposalTitleElement).toContainText('Portfolio Sub-DAO Council: Epoch 2');
});

test('View Snapshot proposal details and voting results', async ({ page }) => {
  new CreateMultisigMocker(page);
  const subgraphMocker = new SubgraphMocker(page);
  await subgraphMocker.mock(createSubgraphDAO('0x', 'Test Multisig', []));

  await page.waitForURL(BASE_URL + '/daos/*');

  const proposalDetailsButtonSelector = '[data-testid=Proposal-id-#3c39]';

  const proposalDetailsButtonElement = page.locator(proposalDetailsButtonSelector);

  await page.waitForSelector(proposalDetailsButtonSelector, { timeout: 10000 });
  await proposalDetailsButtonElement.click();

  const proposalDetailsDescriptionSelector = '[data-testid=Snapshot-Proposal-description]';
  const proposalDetailsVotingResultSelector = '[data-testid=Snapshot-Proposal-total-votes]';

  const proposalDescriptionElement = page.locator(proposalDetailsDescriptionSelector);
  const proposalDetailsVotingResultElement = page.locator(proposalDetailsVotingResultSelector);

  await page.waitForSelector(proposalDetailsDescriptionSelector, { timeout: 10000 });
  expect(proposalDescriptionElement).toContainText('Portfolio Sub-DAO Council Voting');
  expect(proposalDescriptionElement).toContainText(
    'Portfolio Sub-DAO Council Epoch 2 will run from June 18th - December 18th.'
  );
  expect(proposalDetailsVotingResultElement).toContainText('1334 LIZARD');
});
