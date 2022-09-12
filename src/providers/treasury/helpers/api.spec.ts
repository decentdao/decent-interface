import { buildCoingeckoApiUrlForErc20Tokens, buildCoingeckoApiUrlForNativeToken } from './api';

describe('CoinGecko URL builder tests', () => {
  test('Creates CoinGecko URL for native tokens', async () => {
    const url = buildCoingeckoApiUrlForNativeToken('usd');
    const EXPECTED_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
    expect(url).toEqual(EXPECTED_URL);
  });

  test('Creates CoinGecko URL for single ERC20 token', async () => {
    const address = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
    const url = buildCoingeckoApiUrlForErc20Tokens(address, 'usd');
    const EXPECTED_URL = 'https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48&vs_currencies=usd';
    expect(url).toEqual(EXPECTED_URL);
  });

  test('Creates CoinGecko URL for multiple ERC20 tokens', async () => {
    const addresses = [
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    ];
    const url = buildCoingeckoApiUrlForErc20Tokens(addresses, 'usd');
    const EXPECTED_URL = 'https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48%2C0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2&vs_currencies=usd';
    expect(url).toEqual(EXPECTED_URL);
  });
});
