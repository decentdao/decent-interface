import { test } from '@playwright/test';
import { DAOHome } from '../models/DAOHome';
import { HomePage } from '../models/HomePage';

test.describe.skip('DAO Creation', () => {
  let dao: DAOHome;

  test.beforeEach(async ({ page }) => {
    const home = await new HomePage(page).visit();
    const create = await home
      .connectToWallet()
      .then(() => home.dismissConnectedMessage())
      .then(() => home.clickCreateAFractal());
    dao = await create.createTestDAO();
  });

  test('Click favorite and confirm in favorites list', async ({}) => {
    await dao
      .clickFavoriteStar()
      .then(() => dao.clickHeaderMenuDropdown().then(() => dao.clickHeaderFavorites()));

    // TODO this star doesn't do anything yet for pure gnosis...
  });
});
