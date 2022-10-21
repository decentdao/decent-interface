import { test } from '@playwright/test';
import { HomePage } from '../page-objects/HomePage';
import { DAOHome } from '../page-objects/DAOHome';

test.describe('DAO Creation', () => {
  let dao: DAOHome;

  test.beforeEach(async ({ page }) => {
    const home = await new HomePage(page).visit();
    const create = await home
      .dismissAuditMessage()
      .then(() => home.connectToWallet())
      .then(() => home.dismissConnectedMessage())
      .then(() => home.clickCreateAFractal());
    dao = await create.createTestDAO();
  });

  test('Click favorite and confirm in favorites list', async ({}) => {
    await dao
      .clickFavoriteStar()
      .then(() => dao.clickHeaderMenuDropdown().then(() => dao.clickMenuFavorites()));

    // TODO this star doesn't do anything yet for pure gnosis...
  });
});
