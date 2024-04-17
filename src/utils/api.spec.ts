import { zeroAddress } from 'viem';
import { buildSafeApiUrl } from './api';

describe('Safe URL builder tests', () => {
  test('Creates Safe Transaction Service URL, no params', async () => {
    const safeTransactionURL = buildSafeApiUrl(
      'https://safe-transaction-sepolia.safe.global',
      '/about',
      {},
      'v1',
    );
    const EXPECTED_URL = 'https://safe-transaction-sepolia.safe.global/api/v1/about';
    expect(safeTransactionURL).toEqual(EXPECTED_URL);
  });

  test('Creates Safe Transaction Service URL, with params', async () => {
    const safeTransactionURL = buildSafeApiUrl(
      'https://safe-transaction-sepolia.safe.global',
      `/safes/${zeroAddress}/multisig-transactions`,
      { target: zeroAddress },
      'v1',
    );
    const EXPECTED_URL = `https://safe-transaction-sepolia.safe.global/api/v1/safes/${zeroAddress}/multisig-transactions?target=${zeroAddress}`;
    expect(safeTransactionURL).toEqual(EXPECTED_URL);
  });
});
