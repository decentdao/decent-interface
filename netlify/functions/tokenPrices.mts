import { getStore } from '@netlify/blobs';

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
  const store = getStore('token-prices');
  const tokensString = new URL(request.url).searchParams.get('tokens');

  if (!tokensString) {
    return Response.json({ error: 'Tokens to request were not provided' });
  }
  const tokens = tokensString.split(',');
  try {
    const now = Date.now();
    const cachedPrices = await Promise.all(
      tokens.map(
        tokenAddress =>
          store.getWithMetadata(tokenAddress, {
            type: 'json',
          }) as Promise<TokenPriceWithMetadata> | null
      )
    );
    const cachedUnexpiredPrices = cachedPrices
      .filter(tokenPrice => tokenPrice && tokenPrice.metadata.expiration <= now)
      .map(tokenPrice => ({
        tokenAddress: tokenPrice!.data.tokenAddress,
        price: tokenPrice!.data.price,
      }));
    const nonCachedTokensAddresses = tokens.filter(
      address => !cachedUnexpiredPrices.find(tokenPrice => tokenPrice.tokenAddress === address)
    );
    const responseBody: Record<string, number> = {};
    cachedUnexpiredPrices.forEach(tokenPrice => {
      responseBody[tokenPrice.tokenAddress] = tokenPrice.price;
    });
    if (nonCachedTokensAddresses.length === 0) {
      return Response.json({ data: responseBody });
    }
    if (!process.env.COINGECKO_API_KEY) {
      console.error('CoinGecko API key is missing');
      return Response.json({ error: 'Unknown error while fetching prices' });
    }
    const PUBLIC_DEMO_API_BASE_URL = 'https://api.coingecko.com/api/v3/';
    const AUTH_QUERY_PARAM = `?x_cg_demo_api_key=${process.env.COINGECKO_API_KEY}`;
    const tokenPricesUrl = `${PUBLIC_DEMO_API_BASE_URL}simple/token_price/ethereum/${AUTH_QUERY_PARAM}&vs_currencies=usd&contract_addresses=${nonCachedTokensAddresses.join(
      ','
    )}`;

    const tokenPricesResponse = await fetch(tokenPricesUrl);
    const tokenPricesResponseJson = await tokenPricesResponse.json();
    const tokenPriceMetadata = { metadata: { expiration: now + 1000 * 60 * 30 } };
    Object.keys(tokenPricesResponseJson).forEach(tokenAddress => {
      const price = tokenPricesResponseJson[tokenAddress].usd;
      responseBody[tokenAddress] = price;
      store.setJSON(tokenAddress, { tokenAddress, price }, tokenPriceMetadata);
    });

    const ethAsset = nonCachedTokensAddresses.find(token => token === 'ethereum');
    if (ethAsset) {
      // Unfortunately, there's no way avoiding 2 requests. We either need to fetch asset IDs from CoinGecko for given token contract addresses
      // And then use this endpoint to get all the prices. But that brings us way more bandwidth
      // Or, we are doing this "hardcoded" call for ETH price. But our request for token prices simpler.
      const ethPriceUrl = `${PUBLIC_DEMO_API_BASE_URL}simple/price${AUTH_QUERY_PARAM}&ids=ethereum&vs_currencies=usd`;
      const ethPriceResponse = await fetch(ethPriceUrl);
      const price = (await ethPriceResponse.json()).ethereum.usd;
      store.setJSON('ethereum', { tokenAddress: 'ethereum', price }, tokenPriceMetadata);
      responseBody.ethereum = price;
    }
    return Response.json({ data: responseBody });
  } catch (e) {
    console.error('Error while fetching prices', e);
    return Response.json({
      error: 'Unknown error while fetching prices',
    });
  }
}
