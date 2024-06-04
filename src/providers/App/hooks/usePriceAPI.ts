import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { logError } from '../../../helpers/errorLogging';
import { useNetworkConfig } from '../../NetworkConfig/NetworkConfigProvider';

export default function usePriceAPI() {
  const { chain } = useNetworkConfig();
  const { t } = useTranslation('treasury');

  const getTokenPrices = useCallback(
    async (tokens: any[]) => {
      if (chain.id !== 1) {
        // Support only mainnet for now. CoinGecko does not support Sepolia (obviously, I guess :D) and we don't want to burn API credits to "simulate" prices display
        return;
      }

      try {
        const tokensAddresses = tokens
          .filter(token => token.balance !== '0' && !!token.tokenAddress)
          .map(token => token.tokenAddress);
        const ethAsset = tokens.find(token => !token.tokenAddress);
        if (ethAsset) {
          tokensAddresses.push('ethereum');
        }
        if (tokensAddresses.length > 0) {
          const pricesResponse = await fetch(
            `/.netlify/functions/tokenPrices?tokens=${tokensAddresses.join(',')}&network=ethereum`,
          );

          const pricesResponseBody = await pricesResponse.json();
          if (pricesResponseBody.data) {
            return pricesResponseBody.data;
          } else {
            // In theory - we shouldn't get into such situation, when request data is missing, but also we haven't fallen into catch case
            // Yet, better safe than sorry
            logError('Error fetching prices, response data is missing!', pricesResponseBody);
            toast.warning(t('tokenPriceFetchingError'));
            return;
          }
        }
      } catch (e) {
        // When doing local development, it's unlikely that the Pricing Service is going to be running locally,
        // so don't worry about logging or showing the error toast.
        if (process.env.NODE_ENV === 'development') return;
        logError('Error while getting tokens prices', e);
        toast.warning(t('tokenPriceFetchingError'));
        return;
      }
    },
    [chain, t],
  );
  return { getTokenPrices };
}
