// eslint-disable-next-line import/named
import { Store, getStore } from '@netlify/blobs';
import { ethers } from 'ethers';

const PUBLIC_DEMO_API_BASE_URL = 'https://api.coingecko.com/api/v3/';
const AUTH_QUERY_PARAM = `?x_cg_demo_api_key=${process.env.COINGECKO_API_KEY}`;

type TokenPriceWithMetadata = {
  data: {
    tokenAddress: string;
    price: number;
  };
  metadata: {
    expiration: number;
  };
};

type Config = {
  store: Store;
  now: number;
  invalidAddressCacheTime: number;
  validAddressCacheTime: number;
};

function sanitizeUserInput(tokensString: string) {
  const rawTokenAddresses = tokensString.split(',');
  const needEthereum = rawTokenAddresses.map(address => address.toLowerCase()).includes('ethereum');
  const validTokenAddresses = rawTokenAddresses.filter(address => ethers.utils.isAddress(address));
  const lowerCaseTokenAddresses = validTokenAddresses.map(address => address.toLowerCase());
  const tokens = [...new Set(lowerCaseTokenAddresses)];
  if (needEthereum) tokens.push('ethereum');
  return { tokens, needEthereum };
}

async function splitData(
  config: Config,
  tokens: string[],
  responseBodyCallback: (address: string, price: number) => void
) {
  // Try to get all of the tokens from our store.
  // Any token address that we don't have a record for will
  // come back as null.
  const possibleCachedTokenPrices = await Promise.all(
    tokens.map(
      tokenAddress =>
        config.store.getWithMetadata(tokenAddress, {
          type: 'json',
        }) as Promise<TokenPriceWithMetadata> | null
    )
  );

  // Filter out the null values, leaving us with an array of
  // TokenPricesWithMetadata. All of these TokenPrices will be either
  // expired or unexpired.
  const cachedTokenPrices = possibleCachedTokenPrices.filter(
    (possible): possible is TokenPriceWithMetadata => possible !== null
  );

  // Let's pull out all of the expired addresses from our cache.
  const expiredCachedTokenAddresses = cachedTokenPrices
    .filter(tokenPrice => tokenPrice.metadata.expiration < config.now)
    .map(tokenPrice => tokenPrice.data.tokenAddress);

  // Finally let's get a list of all of the token addresses that
  // we don't have any record of in our cache.
  const uncachedTokenAddresses = tokens.filter(
    address =>
      !cachedTokenPrices.find(cachedTokenPrice => cachedTokenPrice.data.tokenAddress === address)
  );

  // We'll update our response with those cached expired and
  // unexpired prices.
  cachedTokenPrices.forEach(tokenPrice => {
    responseBodyCallback(tokenPrice.data.tokenAddress, tokenPrice.data.price);
  });

  return { expiredCachedTokenAddresses, uncachedTokenAddresses };
}

function getTokenPricesUrl(tokens: string[]) {
  const tokenPricesUrl = `${PUBLIC_DEMO_API_BASE_URL}simple/token_price/ethereum/${AUTH_QUERY_PARAM}&vs_currencies=usd&contract_addresses=${tokens.join(
    ','
  )}`;
  return tokenPricesUrl;
}

function getEthereumPriceUrl() {
  const ethPriceUrl = `${PUBLIC_DEMO_API_BASE_URL}simple/price${AUTH_QUERY_PARAM}&ids=ethereum&vs_currencies=usd`;
  return ethPriceUrl;
}

async function storeTokenPrice(
  config: Config,
  tokenAddress: string,
  price: number,
  expiration: number
) {
  await config.store.setJSON(
    tokenAddress,
    { tokenAddress, price },
    { metadata: { expiration: config.now + expiration } }
  );
}

async function processTokenPricesResponse(
  config: Config,
  tokenPricesResponseJson: Record<string, { usd?: number }>,
  responseBodyCallback: (address: string, price: number) => void
) {
  const coinGeckoResponseAddresses = Object.keys(tokenPricesResponseJson);
  for await (const tokenAddress of coinGeckoResponseAddresses) {
    const price = tokenPricesResponseJson[tokenAddress].usd;
    const sanitizedAddress = tokenAddress.toLowerCase();

    // Sometimes no USD price is returned. If this happens,
    // we should consider it as though CoinGecko doesn't support
    // this address and not query it again for a while.
    if (price === undefined) {
      await storeTokenPrice(config, sanitizedAddress, 0, config.invalidAddressCacheTime);
    } else {
      // Otherwise, update the cache with the new price and update
      // the response object.
      responseBodyCallback(sanitizedAddress, price);
      await storeTokenPrice(config, sanitizedAddress, price, config.validAddressCacheTime);
    }
  }

  return coinGeckoResponseAddresses;
}

async function processUnknownAddresses(
  config: Config,
  needPricesTokenAddresses: string[],
  responseAddresses: string[]
) {
  const unknownAddresses = needPricesTokenAddresses
    .filter(x => !responseAddresses.includes(x))
    .map(address => address.toLowerCase());
  for await (const tokenAddress of unknownAddresses) {
    await storeTokenPrice(config, tokenAddress, 0, config.invalidAddressCacheTime);
  }
}

async function coinGeckoRequestAndResponse(
  config: Config,
  url: string,
  responseBodyCallback: (address: string, price: number) => void
) {
  // Make the request to CoinGecko.
  // Response is of shape:
  // {
  //    [tokenAddress]: { usd: 1234 },
  // }
  let ethPriceResponseJson: Record<string, { usd?: number }>;
  try {
    const ethPriceResponse = await fetch(url);
    ethPriceResponseJson = await ethPriceResponse.json();
  } catch (e) {
    throw e;
  }

  // Update the cache with the new price and update
  // the response object.
  const responseAddresses = processTokenPricesResponse(
    config,
    ethPriceResponseJson,
    responseBodyCallback
  );

  return responseAddresses;
}

export default async function getTokenPrices(request: Request) {
  if (!process.env.COINGECKO_API_KEY) {
    console.error('CoinGecko API key is missing');
    return Response.json({ error: 'Error while fetching prices' }, { status: 503 });
  }

  if (!process.env.TOKEN_PRICE_INVALID_CACHE_MINUTES) {
    console.error('TOKEN_PRICE_INVALID_CACHE_MINUTES is not set');
    return Response.json({ error: 'Error while fetching prices' }, { status: 503 });
  }

  if (!process.env.TOKEN_PRICE_VALID_CACHE_MINUTES) {
    console.error('TOKEN_PRICE_VALID_CACHE_MINUTES is not set');
    return Response.json({ error: 'Error while fetching prices' }, { status: 503 });
  }

  const tokensStringParam = new URL(request.url).searchParams.get('tokens');
  if (!tokensStringParam) {
    return Response.json({ error: 'Tokens missing from request' }, { status: 400 });
  }

  const store = getStore('token-prices');
  const now = Math.floor(Date.now() / 1000);
  const invalidAddressCacheTime = parseInt(process.env.TOKEN_PRICE_INVALID_CACHE_MINUTES);
  const validAddressCacheTime = parseInt(process.env.TOKEN_PRICE_VALID_CACHE_MINUTES);
  const config = { store, now, invalidAddressCacheTime, validAddressCacheTime };

  const { tokens, needEthereum } = sanitizeUserInput(tokensStringParam);

  // Let's immediately build up our repsonse object, containing each
  // token address and an value of 0. We'll modify this along the way
  // populating it with more relevant prices.
  const responseBody: Record<string, number> = tokens.reduce((p, c) => ({ ...p, [c]: 0 }), {});

  const { expiredCachedTokenAddresses, uncachedTokenAddresses } = await splitData(
    config,
    tokens,
    (address, price) => {
      responseBody[address] = price;
    }
  );

  // If there are no expired token prices, and no token addresses that we
  // don't have a cached value for at all, we can early return!
  if (expiredCachedTokenAddresses.length === 0 && uncachedTokenAddresses.length === 0) {
    return Response.json({ data: responseBody });
  }

  // If we got here, then we have either some expired prices for given tokens,
  // or no prices at all for given tokens.

  // First, let's build up our list of token addresses to query CoinGecko with,
  // which is all uncached tokens and tokens that have expired.
  // Remove "ethereum" if it's in this list.
  const needPricesTokenAddresses = [
    ...uncachedTokenAddresses,
    ...expiredCachedTokenAddresses,
  ].filter(address => address !== 'ethereum');

  let responseAddresses: string[];
  try {
    responseAddresses = await coinGeckoRequestAndResponse(
      config,
      getTokenPricesUrl(needPricesTokenAddresses),
      (address, price) => {
        responseBody[address] = price;
      }
    );
  } catch (e) {
    console.error('Error while querying CoinGecko', e);
    return Response.json({ error: 'Error while fetching prices', data: responseBody });
  }

  // In the previous request, CoinGecko will only respond back with prices
  // for token addresses that it knows about. We should store a price of 0
  // in our store with a long expiration for all addresses that CoinGecko
  // isn't tracking (likely spam tokens), so as to not continually query
  // CoinGecko with these addresses
  await processUnknownAddresses(config, needPricesTokenAddresses, responseAddresses);

  // Do we need to get the price of our chain's gas token (ethereum)?
  if (needEthereum) {
    try {
      await coinGeckoRequestAndResponse(config, getEthereumPriceUrl(), (address, price) => {
        responseBody[address] = price;
      });
    } catch (e) {
      console.error('Error while querying CoinGecko', e);
      return Response.json({ error: 'Error while fetching prices', data: responseBody });
    }
  }

  return Response.json({ data: responseBody });
}
