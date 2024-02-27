import { SafeBalanceUsdResponse } from '@safe-global/safe-service-client';
import { useCallback } from 'react';
import { useNetworkConfig } from '../../NetworkConfig/NetworkConfigProvider';

const PUBLIC_DEMO_API_BASE_URL = 'https://api.coingecko.com/api/v3/';
const AUTH_QUERY_PARAM = `?x_cg_demo_api_key=${process.env.NEXT_PUBLIC_COINGECKO_API_KEY}`;

export default function useCoinGeckoAPI() {
  const { chainId } = useNetworkConfig();

  const getTokenPrices = useCallback(
    async (tokens: SafeBalanceUsdResponse[]) => {
      if (chainId !== 1) {
        // Support only mainnet for now. CoinGecko does not support Sepolia (obviously, I guess :D) and we don't want to burn API credits to "simulate" prices display
        return;
      }

      const tokenPricesUrl = `${PUBLIC_DEMO_API_BASE_URL}simple/token_price/ethereum/${AUTH_QUERY_PARAM}&vs_currencies=usd&contract_addresses=${tokens
        .filter(token => token.balance !== '0' && token.tokenAddress)
        .map(token => token.tokenAddress)
        .join(',')}`;

      const tokenPricesResponse = await fetch(tokenPricesUrl);

      const ethAsset = tokens.find(token => !token.tokenAddress);
      if (ethAsset) {
        // Unfortunately, there's no way avoiding 2 requests. We either need to fetch asset IDs from CoinGecko for given token contract addresses
        // And then use this endpoint to get all the prices. But that brings us way more bandwidth
        // Or, we are doing this "hardcoded" call for ETH price. But our request for token prices simpler.
        const ethPriceUrl = `${PUBLIC_DEMO_API_BASE_URL}simple/price${AUTH_QUERY_PARAM}&ids=ethereum&vs_currencies=usd`;
        const ethPriceResponse = await fetch(ethPriceUrl);

        return { ...(await tokenPricesResponse.json()), ...(await ethPriceResponse.json()) };
      }

      return tokenPricesResponse.json();
    },
    [chainId]
  );
  return { getTokenPrices };
}
