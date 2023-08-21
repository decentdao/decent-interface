import { constants } from 'ethers';
import { buildSafeApiUrl } from './api';

describe('Safe URL builder tests', () => {
  test('Creates Safe Transaction Service URL, no params', async () => {
    const safeTransactionURL = buildSafeApiUrl(
      'https://safe-transaction-goerli.safe.global',
      '/about',
      {},
      'v1'
    );
    const EXPECTED_URL = 'https://safe-transaction-Goerli.safe.global/api/v1/about';
    expect(safeTransactionURL).toEqual(EXPECTED_URL);
  });

  test('Creates Safe Transaction Service URL, with params', async () => {
    const safeTransactionURL = buildSafeApiUrl(
      'https://safe-transaction-goerli.safe.global',
      `/safes/${constants.AddressZero}/multisig-transactions`,
      { target: constants.AddressZero },
      'v1'
    );
    const EXPECTED_URL = `https://safe-transaction-Goerli.safe.global/api/v1/safes/${constants.AddressZero}/multisig-transactions?target=${constants.AddressZero}`;
    expect(safeTransactionURL).toEqual(EXPECTED_URL);
  });
});
