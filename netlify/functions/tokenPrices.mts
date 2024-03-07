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

  // First we want to pull the tokens off of the request's query param.
  const tokensStringParam = new URL(request.url).searchParams.get('tokens');
  if (!tokensStringParam) {
    return Response.json({ error: 'Tokens to request were not provided' }, { status: 400 });
  }

  // Sanitize user input
  const rawTokenAddresses = tokensStringParam.split(',');
  const needEthereum = rawTokenAddresses.map(address => address.toLowerCase()).includes('ethereum');
  const validTokenAddresses = rawTokenAddresses.filter(address => ethers.utils.isAddress(address));
  const lowerCaseTokenAddresses = validTokenAddresses.map(address => address.toLowerCase());
  const tokens = [...new Set(lowerCaseTokenAddresses)];
  if (needEthereum) tokens.push('ethereum');

  // Let's immediately build up our repsonse object, containing each
  // token address and an value of 0. We'll modify this along the way
  // populating it with more relevant prices.
  const responseBody: Record<string, number> = tokens.reduce((p, c) => ({ ...p, [c]: 0 }), {});

  const store = getStore('token-prices');

  try {
    const now = Math.floor(Date.now() / 1000);

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

    console.log('allCachedTokenPrices');
    console.log(
      allCachedTokenPrices.map(a => ({
        address: a.data.tokenAddress,
        price: a.data.price,
        now: '      ' + now,
        expiration: a.metadata.expiration,
        expired: a.metadata.expiration < now,
      }))
    );

    // Let's pull out all of the unexpired TokenPrices from our cache.
    const cachedUnexpiredTokenPrices = allCachedTokenPrices.filter(
      tokenPrice => tokenPrice.metadata.expiration >= now
    );

    console.log('cachedUnexpiredTokenPrices');
    console.log(
      cachedUnexpiredTokenPrices.map(a => ({
        address: a.data.tokenAddress,
      }))
    );

    // We'll update our response with those unexpired cached prices.
    cachedUnexpiredTokenPrices.forEach(tokenPrice => {
      responseBody[tokenPrice.data.tokenAddress] = tokenPrice.data.price;
    });

    // Let's pull out all of the expired TokenPrices from our cache.
    const cachedExpiredTokenPrices = allCachedTokenPrices.filter(
      tokenPrice => tokenPrice.metadata.expiration < now
    );

    console.log('cachedExpiredTokenPrices');
    console.log(
      cachedExpiredTokenPrices.map(a => ({
        address: a.data.tokenAddress,
      }))
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
    const allUncachedTokenAddresses = tokens.filter(
      address =>
        !allCachedTokenPrices.find(
          cachedTokenPrice => cachedTokenPrice.data.tokenAddress === address
        )
    );

    console.log('allUncachedTokenAddresses');
    console.log(
      allUncachedTokenAddresses.map(a => ({
        address: a,
      }))
    );

    // If there are no expired token prices, and no token addresses that we
    // don't have a cached value for at all, we can early return!
    if (allUncachedTokenAddresses.length === 0 && cachedExpiredTokenPrices.length === 0) {
      console.log('early exit');
      console.log({ responseBody });
      return Response.json({ data: responseBody });
    }

    // If we got here, then we have either some expired prices for given tokens,
    // or no prices at all for given tokens.

    // First, let's build up our list of token addresses to query CoinGecko with,
    // which is all uncached tokens and tokens that have expired.
    // Remove "ethereum" if it's in this list
    const needPricesTokenAddresses = [
      ...allUncachedTokenAddresses,
      ...cachedExpiredTokenPrices.map(tokenPrice => tokenPrice.data.tokenAddress),
    ].filter(address => address !== 'ethereum');

    try {
      // Build up the request URL.
      const PUBLIC_DEMO_API_BASE_URL = 'https://api.coingecko.com/api/v3/';
      const AUTH_QUERY_PARAM = `?x_cg_demo_api_key=${process.env.COINGECKO_API_KEY}`;
      const tokenPricesUrl = `${PUBLIC_DEMO_API_BASE_URL}simple/token_price/ethereum/${AUTH_QUERY_PARAM}&vs_currencies=usd&contract_addresses=${needPricesTokenAddresses.join(
        ','
      )}`;

      console.log('making CoinGecko API call:', tokenPricesUrl);

      // Make the request.
      const tokenPricesResponse = await fetch(tokenPricesUrl);
      const tokenPricesResponseJson = await tokenPricesResponse.json();

      // Create the metadata for our new token prices, with an
      // expiration in the future.
      const tokenPriceMetadata = { metadata: { expiration: now + 48 } };

      // With our response...
      const coinGeckoResponseAddresses = Object.keys(tokenPricesResponseJson);
      coinGeckoResponseAddresses.forEach(tokenAddress => {
        const price: number | undefined = tokenPricesResponseJson[tokenAddress].usd;

        const sanitizedAddress = tokenAddress.toLowerCase();

        // Sometimes no USD price is returned
        if (price === undefined) {
          store.setJSON(
            sanitizedAddress,
            { tokenAddress: sanitizedAddress, price: 0 },
            { metadata: { expiration: now + 60 * 10 } }
          );
          return;
        }

        // 1. Replace the token addresses of our existing response object with the new prices.
        responseBody[sanitizedAddress] = price;
        // 2. Store these fresh prices in our Blob store.
        store.setJSON(
          sanitizedAddress,
          { tokenAddress: sanitizedAddress, price },
          tokenPriceMetadata
        );
      });

      // CoinGecko will only respond back with prices for token addresses
      // that it knows about. We should store a price of 0 in our store with
      // a long expiration for all addresses that CoinGecko isn't tracking
      // (likely spam tokens), so as to not continually query CoinGecko with
      // these addresses
      const likelySpamAddresses = needPricesTokenAddresses.filter(
        x => !coinGeckoResponseAddresses.includes(x)
      );
      console.log({ likelySpamAddresses });
      likelySpamAddresses.forEach(tokenAddress => {
        const sanitizedAddress = tokenAddress.toLowerCase();
        store.setJSON(
          sanitizedAddress,
          { tokenAddress: sanitizedAddress, price: 0 },
          { metadata: { expiration: now + 60 * 10 } }
        );
      });

      // Do we need to get the price of our chain's gas token (ethereum)?
      if (needEthereum) {
        // Build up the request URL.
        const ethPriceUrl = `${PUBLIC_DEMO_API_BASE_URL}simple/price${AUTH_QUERY_PARAM}&ids=ethereum&vs_currencies=usd`;

        console.log('making CoinGecko API call:', ethPriceUrl);

        // Make the request.
        const ethPriceResponse = await fetch(ethPriceUrl);
        const ethPriceResponseJson = await ethPriceResponse.json();

        // Get the price data.
        const price: number | undefined = ethPriceResponseJson.ethereum.usd;

        if (price !== undefined) {
          // 1. Replace the token addresses of our existing response object with the new prices.
          responseBody.ethereum = price;

          // 2. Store this fresh prices in our Blob store.
          store.setJSON('ethereum', { tokenAddress: 'ethereum', price }, tokenPriceMetadata);
        }
      }

      console.log({ responseBody });
      return Response.json({ data: responseBody });
    } catch (e) {
      console.error('Error while querying CoinGecko', e);
      return Response.json({ error: 'Error while fetching prices', data: responseBody });
    }
  } catch (e) {
    console.error('Error while fetching prices', e);
    return Response.json({ error: 'Error while fetching prices', data: responseBody });
  }
}
