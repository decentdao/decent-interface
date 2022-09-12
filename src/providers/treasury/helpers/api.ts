/**
 * builds url for coingecko api request for native token
 * @param currencies string or array of currencies
 * @url https://api.coingecko.com/api/v3/simple/price
 * @returns
 */
export const buildCoingeckoApiUrlForNativeToken = (currencies: string | string[]) => {
  const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price';
  const vsCurrencies = typeof currencies === 'string' ? currencies : currencies.join(',');

  const query = new URLSearchParams({
    ids: 'ethereum',
    vs_currencies: vsCurrencies,
  });

  return `${COINGECKO_URL}?${query.toString()}`;
};

/**
 * builds url for coingecko api requests for erc20 tokens
 * @param addresses array of addresses
 * @param currencies string or array of currencies
 * @url https://api.coingecko.com/api/v3/simple/token_price/ethereum
 * @returns
 */
export const buildCoingeckoApiUrlForErc20Tokens = (
  addresses: string | string[],
  currencies: string | string[]
) => {
  const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/token_price/ethereum';
  const contractAddresses = typeof addresses === 'string' ? addresses : addresses.join(',');
  const vsCurrencies = typeof currencies === 'string' ? currencies : currencies.join(',');

  const query = new URLSearchParams({
    contract_addresses: contractAddresses,
    vs_currencies: vsCurrencies,
  });

  return `${COINGECKO_URL}?${query.toString()}`;
};
