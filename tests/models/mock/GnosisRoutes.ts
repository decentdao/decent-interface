import { Page } from '@playwright/test';

export class GnosisRoutes {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  safeGlobalBaseApiUrl = 'https://safe-transaction-goerli.safe.global/api/'; // GET

  routeGetSafeCreationInfo = this.safeGlobalBaseApiUrl + 'v1/safes/**/creation/'; // GET

  routeGetSafeInfo = this.safeGlobalBaseApiUrl + 'v1/safes/**'; // GET

  routeGetAllTransactions = this.safeGlobalBaseApiUrl + 'v1/safes/**/all-transactions/*'; // GET

  routeGetUsdBalances = this.safeGlobalBaseApiUrl + 'v1/safes/**/balances/usd/*'; // GET

  routeGetCollectibles = this.safeGlobalBaseApiUrl + 'v1/safes/**/collectibles/*'; // GET

  routeGetIncomingTransactions = this.safeGlobalBaseApiUrl + 'v1/safes/**/incoming-transfers/*'; // GET

  routeGetOwners = this.safeGlobalBaseApiUrl + 'v1/owners/**/safes/*'; // GET

  routeConfirmTransaction =
    this.safeGlobalBaseApiUrl + 'v1/multisig-transactions/**/confirmations/*'; // POST
}
