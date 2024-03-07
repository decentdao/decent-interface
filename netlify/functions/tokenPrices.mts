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
    fetched: number;
  };
};

type Config = {
  store: Store;
  now: number;
  cacheTime: number;
};

const SUPPORTED_NETWORKS = ['ethereum'] as const;
type SupportedNetworks = typeof SUPPORTED_NETWORKS[number];

function sanitizeUserInput(tokensString: string, network: SupportedNetworks) {
  const rawTokenAddresses = tokensString.split(',');
  const needNativeAsset = rawTokenAddresses.map(address => address.toLowerCase()).includes(network);
  const validTokenAddresses = rawTokenAddresses.filter(address => ethers.utils.isAddress(address));
  const lowerCaseTokenAddresses = validTokenAddresses.map(address => address.toLowerCase());
  const tokens = [...new Set(lowerCaseTokenAddresses)];
  if (needNativeAsset) tokens.push(network);
  return { tokens, needNativeAsset };
}

async function splitData(
  config: Config,
  tokens: string[],
  responseBodyCallback: (address: string, price: number) => void,
  network: SupportedNetworks
) {
  // Try to get all of the tokens from our store.
  // Any token address that we don't have a record for will
  // come back as null.
  const possibleCachedTokenPrices = await Promise.all(
    tokens.map(
      tokenAddress =>
        config.store.getWithMetadata(`${network}/${tokenAddress}`, {
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
    .filter(tokenPrice => tokenPrice.metadata.fetched + config.cacheTime > config.now)
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

function getTokenPricesUrl(tokens: string[], network: SupportedNetworks) {
  const tokenPricesUrl = `${PUBLIC_DEMO_API_BASE_URL}simple/token_price/${network}/${AUTH_QUERY_PARAM}&vs_currencies=usd&contract_addresses=${tokens.join(
    ','
  )}`;
  return tokenPricesUrl;
}

function getNativeAssetPriceUrl(network: SupportedNetworks) {
  const nativeAssetPriceUrl = `${PUBLIC_DEMO_API_BASE_URL}simple/price${AUTH_QUERY_PARAM}&ids=${network}&vs_currencies=usd`;
  return nativeAssetPriceUrl;
}

async function storeTokenPrice(
  config: Config,
  tokenAddress: string,
  price: number,
  network: SupportedNetworks
) {
  await config.store.setJSON(
    `${network}/${tokenAddress}`,
    { tokenAddress, price },
    { metadata: { fetched: config.now } }
  );
}

async function processTokenPricesResponse(
  config: Config,
  tokenPricesResponseJson: Record<string, { usd?: number }>,
  responseBodyCallback: (address: string, price: number) => void,
  network: SupportedNetworks
) {
  const coinGeckoResponseAddresses = Object.keys(tokenPricesResponseJson);
  for await (const tokenAddress of coinGeckoResponseAddresses) {
    // Sometimes no USD price is returned. If this happens,
    // we should consider it as though CoinGecko doesn't support
    // this address and fallback to 0.
    const price = tokenPricesResponseJson[tokenAddress].usd || 0;
    const sanitizedAddress = tokenAddress.toLowerCase();

    responseBodyCallback(sanitizedAddress, price);
    await storeTokenPrice(config, sanitizedAddress, price, network);
  }

  return coinGeckoResponseAddresses;
}

async function processUnknownAddresses(
  config: Config,
  needPricesTokenAddresses: string[],
  responseAddresses: string[],
  network: SupportedNetworks
) {
  const unknownAddresses = needPricesTokenAddresses
    .filter(x => !responseAddresses.includes(x))
    .map(address => address.toLowerCase());
  for await (const tokenAddress of unknownAddresses) {
    await storeTokenPrice(config, tokenAddress, 0, network);
  }
}

async function coinGeckoRequestAndResponse(
  config: Config,
  url: string,
  responseBodyCallback: (address: string, price: number) => void,
  network: SupportedNetworks
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
    responseBodyCallback,
    network
  );

  return responseAddresses;
}

export default async function getTokenPrices(request: Request) {
  if (!process.env.COINGECKO_API_KEY) {
    console.error('CoinGecko API key is missing');
    return Response.json({ error: 'Error while fetching prices' }, { status: 503 });
  }

  if (!process.env.TOKEN_PRICE_CACHE_INTERVAL_MINUTES) {
    console.error('TOKEN_PRICE_CACHE_INTERVAL_MINUTES is not set');
    return Response.json({ error: 'Error while fetching prices' }, { status: 503 });
  }

  const requestSearchParams = new URL(request.url).searchParams;
  const tokensStringParam = requestSearchParams.get('tokens');
  if (!tokensStringParam) {
    return Response.json({ error: 'Tokens missing from request' }, { status: 400 });
  }

  const networkParam = requestSearchParams.get('network') as SupportedNetworks;
  if (!networkParam || !SUPPORTED_NETWORKS.includes(networkParam)) {
    return Response.json({ error: 'Requested network is not supported' }, { status: 400 });
  }

  const store = getStore('token-prices');
  const now = Math.floor(Date.now() / 1000);
  const cacheTime = parseInt(process.env.TOKEN_PRICE_CACHE_INTERVAL_MINUTES);
  const config = { store, now, cacheTime };

  const { tokens, needNativeAsset } = sanitizeUserInput(tokensStringParam, networkParam);

  // Let's immediately build up our repsonse object, containing each
  // token address and an value of 0. We'll modify this along the way
  // populating it with more relevant prices.
  const responseBody: Record<string, number> = tokens.reduce((p, c) => ({ ...p, [c]: 0 }), {});

  const { expiredCachedTokenAddresses, uncachedTokenAddresses } = await splitData(
    config,
    tokens,
    (address, price) => {
      responseBody[address] = price;
    },
    networkParam
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
  // Remove native asset name if it's in this list.
  const needPricesTokenAddresses = [
    ...uncachedTokenAddresses,
    ...expiredCachedTokenAddresses,
  ].filter(address => address !== networkParam);

  let responseAddresses: string[];
  try {
    responseAddresses = await coinGeckoRequestAndResponse(
      config,
      getTokenPricesUrl(needPricesTokenAddresses, networkParam),
      (address, price) => {
        responseBody[address] = price;
      },
      networkParam
    );
  } catch (e) {
    console.error('Error while querying CoinGecko', e);
    return Response.json({ error: 'Error while fetching prices', data: responseBody });
  }
  await processUnknownAddresses(config, needPricesTokenAddresses, responseAddresses, networkParam);

  // Do we need to get the price of our chain's gas token?
  if (needNativeAsset) {
    try {
      await coinGeckoRequestAndResponse(
        config,
        getNativeAssetPriceUrl(networkParam),
        (address, price) => {
          responseBody[address] = price;
        },
        networkParam
      );
    } catch (e) {
      console.error('Error while querying CoinGecko', e);
      return Response.json({ error: 'Error while fetching prices', data: responseBody });
    }
  }

  return Response.json({ data: responseBody });
}
