import { GnosisRoutes } from './GnosisRoutes';
import {
  createSafeInfo,
  EMPTY_TRANSACTIONS,
  SINGLE_OWNER_MULTISIG_CREATION,
} from './data/creation';
import { accounts } from './data/testSigners';

export class NewDAOMockRequests extends GnosisRoutes {
  async newDAORoutes() {
    // @dev this function is usuful for debughing requests, uncomment as needed
    // this.page.on('request', request => console.log('>>', request.method(), request.url()));
    await this.page.route(this.routeGetSafeCreationInfo, async route => {
      await route.fulfill({
        body: JSON.stringify(SINGLE_OWNER_MULTISIG_CREATION),
      });
    });
    await this.page.route(this.routeGetSafeInfo, async (route, request) => {
      const daoAddrArr = request.url().match(/((0x).+?(?=\/))/);
      const daoAddress = daoAddrArr![0];
      const mockInfo = createSafeInfo(daoAddress, [accounts[0]]);
      await route.fulfill({
        body: JSON.stringify(mockInfo),
      });
    });
    await this.page.route(this.routeGetAllTransactions, async route => {
      await route.fulfill({
        body: JSON.stringify(EMPTY_TRANSACTIONS),
      });
    });
    await this.page.route(this.routeGetUsdBalances, async route => {
      await route.fulfill({
        body: JSON.stringify([]),
      });
    });
    await this.page.route(this.routeGetCollectibles, async route => {
      await route.fulfill({
        body: JSON.stringify([]),
      });
    });
    await this.page.route(this.routeGetIncomingTransactions, async route => {
      await route.fulfill({
        body: JSON.stringify(EMPTY_TRANSACTIONS),
      });
    });
    await this.page.route(this.routeGetOwners, async route => {
      await route.fulfill({
        body: JSON.stringify({
          safes: [accounts[0]],
        }),
      });
    });
  }
}
