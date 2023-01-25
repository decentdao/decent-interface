import { test } from '@playwright/test';
import { DAOHome } from '../models/DAOHome';
import { HomePage } from '../models/HomePage';

test.describe.skip('DAO Creation', () => {
  let dao: DAOHome;

  test.beforeEach(async ({ page }) => {
    const home = await new HomePage(page).visit();
    const create = await home.clickCreateAFractal();
    dao = await create.createTestMultisig();
  });

  test('Click favorite and confirm in favorites list', async ({}) => {
    await dao
      .clickFavoriteStar()
      .then(() => dao.clickAccountMenu().then(() => dao.clickFavoritesMenu()));

    // TODO this star doesn't do anything yet for pure gnosis...
  });
});
