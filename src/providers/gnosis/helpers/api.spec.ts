import { constants } from 'ethers';
import { buildGnosisApiUrl, buildGnosisGasRelayApiUrl } from './api';

const GOERLI_CHAIN_ID = 5;

describe('Gnosis URL builder tests', () => {
  test('Creates Gnosis Transaction Service URL, no params', async () => {
    const gnosisTransactionURL = buildGnosisApiUrl(GOERLI_CHAIN_ID, '/about', {}, 'v1');
    const EXPECTED_URL = 'https://safe-transaction.goerli.gnosis.io/api/v1/about';
    expect(gnosisTransactionURL).toEqual(EXPECTED_URL);
  });

  test('Creates Gnosis Transaction Service URL, with params', async () => {
    const gnosisTransactionURL = buildGnosisApiUrl(
      GOERLI_CHAIN_ID,
      `/safes/${constants.AddressZero}/multisig-transactions`,
      { target: constants.AddressZero },
      'v1'
    );
    const EXPECTED_URL = `https://safe-transaction.goerli.gnosis.io/api/v1/safes/${constants.AddressZero}/multisig-transactions?target=0x0000000000000000000000000000000000000000`;
    expect(gnosisTransactionURL).toEqual(EXPECTED_URL);
  });

  test('Creates Gnosis Transaction-Relay Service Request, no params', async () => {
    const gnosisRelayURL = buildGnosisGasRelayApiUrl(GOERLI_CHAIN_ID, '/about', {}, 'v1');
    const EXPECTED_URL = 'https://safe-relay.goerli.gnosis.io/api/v1/about';
    expect(gnosisRelayURL).toEqual(EXPECTED_URL);
  });

  test('Creates Gnosis Transaction-Relay Service URL, with params', async () => {
    const gnosisTransactionURL = buildGnosisGasRelayApiUrl(
      GOERLI_CHAIN_ID,
      `/safes/${constants.AddressZero}/multisig-transactions`,
      { target: constants.AddressZero },
      'v1'
    );
    const EXPECTED_URL = `https://safe-relay.goerli.gnosis.io/api/v1/safes/${constants.AddressZero}/multisig-transactions?target=0x0000000000000000000000000000000000000000`;
    expect(gnosisTransactionURL).toEqual(EXPECTED_URL);
  });
});
