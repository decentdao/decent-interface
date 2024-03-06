import { getStore } from '@netlify/blobs';
import { ethers } from 'ethers';

type TokenPriceWithMetadata = {
  data: {
    tokenAddress: string;
    price: number;
  };
  metadata: {
    expiration: number;
  };
};

export default async function getTokenPrices(request: Request) {
  if (!process.env.COINGECKO_API_KEY) {
    console.error('CoinGecko API key is missing');
    return Response.json({ error: 'Unknown error while fetching prices' }, { status: 503 });
  }

  const now = Date.now();

  // First we want to pull the tokens off of the request's query param.
  const tokensStringParam = new URL(request.url).searchParams.get('tokens');
  if (!tokensStringParam) {
    return Response.json({ error: 'Tokens to request were not provided' }, { status: 400 });
  }

  // These are the token addresses from the client, split up.
  const rawTokenAddresses = tokensStringParam.split(',');

  // Let's make sure all of these given addresses are valid.
  const anyInvalidTokens = rawTokenAddresses.some(address => !ethers.utils.isAddress(address));
  if (!anyInvalidTokens) {
    return Response.json({ error: 'One or more token addresses is invalid' }, { status: 400 });
  }

  // Next we want to standardize them all by making them lowercase.
  const lowerCaseTokens = rawTokenAddresses.map(address => address.toLowerCase());

  // Finally, make sure we're dealing with a unique set of token addresses.
  const tokens = [...new Set(lowerCaseTokens)];

  const store = getStore('token-prices');

  // Let's immediately build up our repsonse object, containing each
  // token address and an value of 0. We'll modify this along the way
  // populating it with more relevant prices.
  const responseBody: Record<string, number> = tokens.reduce((p, c) => ({ ...p, [c]: 0 }), {});

  try {
    // Try to get all of the tokens from our store.
    // Any token address that we don't have a record for will
    // come back as null.
    const possibleCachedTokenPrices = await Promise.all(
      tokens.map(
        tokenAddress =>
          store.getWithMetadata(tokenAddress, {
            type: 'json',
          }) as Promise<TokenPriceWithMetadata> | null
      )
    );

    // Filter out the null values, leaving us with an array of
    // TokenPricesWithMetadata. All of these TokenPrices will be either
    // expired or unexpired.
    const allCachedTokenPrices = possibleCachedTokenPrices.filter(
      (possible): possible is TokenPriceWithMetadata => possible !== null
    );

    // Let's pull out all of the unexpired TokenPrices from our cache.
    const cachedUnexpiredTokenPrices = allCachedTokenPrices.filter(
      tokenPrice => tokenPrice.metadata.expiration <= now
    );

    // We'll update our response with those unexpired cached prices.
    cachedUnexpiredTokenPrices.forEach(tokenPrice => {
      responseBody[tokenPrice.data.tokenAddress] = tokenPrice.data.price;
    });

    // Let's pull out all of the expired TokenPrices from our cache.
    const cachedExpiredTokenPrices = allCachedTokenPrices.filter(
      tokenPrice => tokenPrice.metadata.expiration > now
    );

    // We'll update our response with those expired cached prices.
    // This is done now in the offchance that we won't be able to contact
    // CoinGecko later. Ideally these will be updated after getting
    // fresher data from CoinGecko
    cachedExpiredTokenPrices.forEach(tokenPrice => {
      responseBody[tokenPrice.data.tokenAddress] = tokenPrice.data.price;
    });

    // Finally let's get a list of all of the token addresses that
    // we don't have any price for in our cache, expired or not.
    const allUncachedTokenPrices = possibleCachedTokenPrices.filter(
      (possible): possible is TokenPriceWithMetadata => possible === null
    );

    // If there are no expired token prices, and no token addresses that we
    // don't have a cached value for at all, we can early return!
    if (allUncachedTokenPrices.length === 0 && cachedExpiredTokenPrices.length === 0) {
      return Response.json({ data: responseBody });
    }

    // If we got here, then we have either some expired prices for given tokens,
    // or no prices at all for given tokens.

    // First, let's build up our list of token addresses to query CoinGecko with,
    // which is all uncached tokens and tokens that have expired.
    const needPrices = [...allUncachedTokenPrices, ...cachedExpiredTokenPrices];

    try {
      // Build up the request URL.
      const PUBLIC_DEMO_API_BASE_URL = 'https://api.coingecko.com/api/v3/';
      const AUTH_QUERY_PARAM = `?x_cg_demo_api_key=${process.env.COINGECKO_API_KEY}`;
      const tokenPricesUrl = `${PUBLIC_DEMO_API_BASE_URL}simple/token_price/ethereum/${AUTH_QUERY_PARAM}&vs_currencies=usd&contract_addresses=${needPrices.join(
        ','
      )}`;

      // Make the request.
      const tokenPricesResponse = await fetch(tokenPricesUrl);
      const tokenPricesResponseJson = await tokenPricesResponse.json();

      // Create the metadata for our new token prices, with an
      // expiration in the future.
      const tokenPriceMetadata = { metadata: { expiration: now + 1000 * 60 * 30 } };

      // With our response...
      Object.keys(tokenPricesResponseJson).forEach(tokenAddress => {
        const price = tokenPricesResponseJson[tokenAddress].usd;
        const sanitizedAddress = tokenAddress.toLowerCase();
        // 1. Replace the token addresses of our existing response object with the new prices.
        responseBody[sanitizedAddress] = price;
        // 2. Store these fresh prices in our Blob store.
        store.setJSON(
          sanitizedAddress,
          { tokenAddress: sanitizedAddress, price },
          tokenPriceMetadata
        );
      });

      // Do we need to get the price of our chain's gas token (ethereum)?
      const ethAsset = needPrices.find(token => token.data.tokenAddress === 'ethereum');
      if (ethAsset) {
        // Build up the request URL.
        const ethPriceUrl = `${PUBLIC_DEMO_API_BASE_URL}simple/price${AUTH_QUERY_PARAM}&ids=ethereum&vs_currencies=usd`;

        // Make the request.
        const ethPriceResponse = await fetch(ethPriceUrl);
        const ethPriceResponseJson = await ethPriceResponse.json();

        // Get the price data.
        const price = ethPriceResponseJson.ethereum.usd;

        // 1. Replace the token addresses of our existing response object with the new prices.
        responseBody.ethereum = price;

        // 2. Store this fresh prices in our Blob store.
        store.setJSON('ethereum', { tokenAddress: 'ethereum', price }, tokenPriceMetadata);
      }
      return Response.json({ data: responseBody });
    } catch (e) {
      console.error('Error while querying CoinGecko', e);
      return Response.json({ error: 'Error while fetching prices', data: responseBody });
    }
  } catch (e) {
    console.error('Error while fetching prices', e);
    return Response.json({
      error: 'Unknown error while fetching prices',
      data: responseBody,
    });
  }
}
