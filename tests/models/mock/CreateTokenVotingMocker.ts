import { Endpoint, GnosisMocker } from './GnosisMocker';
import {
  createSafeInfo,
  EMPTY_TRANSACTIONS,
  SINGLE_OWNER_MULTISIG_CREATION,
} from './data/creation';
import { accounts } from './data/testSigners';

// TODO should be Token Voting / Usul mocked data
export class CreateTokenVotingMocker extends GnosisMocker {
  setMocks() {
    this.mock(Endpoint.SAFES_CREATED_LIST, SINGLE_OWNER_MULTISIG_CREATION);
    this.mockWithHandler(Endpoint.SAFE_INFO, request => {
      const daoAddrArr = request.url().match(/((0x).+?(?=\/))/);
      return createSafeInfo(daoAddrArr![0], [accounts[0]]);
    });
    this.mock(Endpoint.ALL_TRANSACTIONS_LIST, EMPTY_TRANSACTIONS);
    this.mock(Endpoint.TOKEN_USD_BALANCES, []);
    this.mock(Endpoint.COLLECTIBLES, []);
    this.mock(Endpoint.OWNERS, {
      safes: [accounts[0]],
    });
  }
}
