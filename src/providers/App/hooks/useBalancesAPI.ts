import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Address } from 'viem';
import { NFTBalance, TokenBalance } from '../../../types';
import { useNetworkConfig } from '../../NetworkConfig/NetworkConfigProvider';

export default function useBalancesAPI() {
  const { chain } = useNetworkConfig();
  const { t } = useTranslation('treasury')

  const getBalances = useCallback(
    async (
      address: Address,
    ): Promise<{ data?: { tokens: TokenBalance[]; nfts: NFTBalance[] }; error?: string }> => {
      try {
        const balancesResponse = await fetch(
          `/.netlify/functions/tokenBalances?address=${address}&network=${chain.id}`,
        );
        const balancesResponseBody = await balancesResponse.json();
        return balancesResponseBody;
      } catch (e) {
        console.error('Error while fetching treasury balances', e);
        return { error: t('errorFetchingBalances')}
      }
    },
    [chain, t],
  );

  return getBalances;
}
