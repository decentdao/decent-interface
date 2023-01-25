import { Page, Request } from '@playwright/test';

/**
 * https://safe-transaction-goerli.safe.global/
 */
export enum Endpoint {
  SAFE_INFO = 'v1/safes/**',
  SAFES_CREATED_LIST = 'v1/safes/**/creation/',
  ALL_TRANSACTIONS_LIST = 'v1/safes/**/all-transactions/*',
  TOKEN_USD_BALANCES = 'v1/safes/**/balances/usd/*',
  COLLECTIBLES = 'v1/safes/**/collectibles/*',
  INCOMING_TRANSACTIONS = 'v1/safes/**/incoming-transfers/*',
  OWNERS = 'v1/owners/**/safes/*',
  CONFIRM_TRANSACTION = 'v1/multisig-transactions/**/confirmations/*',
}

export abstract class GnosisMocker {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.setMocks();
    // log requests for debugging
    this.page.on('request', request => console.log('>>', request.method(), request.url()));
  }

  abstract setMocks(): void;

  mock(endpoint: Endpoint, response: object) {
    this.mockWithHandler(endpoint, () => response);
  }

  async mockWithHandler(endpoint: Endpoint, handler: (request: Request) => object) {
    await this.page.route(
      'https://safe-transaction-goerli.safe.global/api/' + endpoint.toString(),
      async (route, request) => {
        await route.fulfill({
          body: JSON.stringify(handler(request)),
        });
      }
    );
  }
}
