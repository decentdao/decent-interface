import { SafeBalanceUsdResponse } from '@safe-global/safe-service-client';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { logError } from '../../../helpers/errorLogging';
import { useNetworkConfig } from '../../NetworkConfig/NetworkConfigProvider';

export default function usePriceAPI() {
  const { chainId } = useNetworkConfig();
  const { t } = useTranslation('treasury');

  const getTokenPrices = useCallback(
    async (tokens: SafeBalanceUsdResponse[]) => {
      if (chainId !== 1) {
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
            `/.netlify/functions/tokenPrices?tokens=${tokensAddresses.join(',')}`
          );

          const pricesResponseBody = await pricesResponse.json();
          if (pricesResponseBody.error) {
            // We don't need to log error here as it is supposed to be logged through Netlify function anyway
            toast.warning(t('tokenPriceFetchingError'));
            if (pricesResponseBody.data) {
              // Netlify function might fail due to rate limit of CoinGecko error, but it still will return cached prices.
              return pricesResponseBody.data;
            }
          } else {
            return pricesResponseBody.data;
          }
        }
      } catch (e) {
        logError('Error while getting tokens prices', e);
        return;
      }
    },
    [chainId, t]
  );
  return { getTokenPrices };
}
