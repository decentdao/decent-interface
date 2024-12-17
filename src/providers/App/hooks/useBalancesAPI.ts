import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Address } from 'viem';
import { DefiBalance, NFTBalance, TokenBalance } from '../../../types';
import { useNetworkConfigStore } from '../../NetworkConfig/useNetworkConfigStore';

export default function useBalancesAPI() {
  const {
    chain,
    moralis: { deFiSupported },
  } = useNetworkConfigStore();
  const { t } = useTranslation('treasury');

  const getTokenBalances = useCallback(
    async (address: Address): Promise<{ data?: TokenBalance[]; error?: string }> => {
      try {
        const balancesResponse = await fetch(
          `/.netlify/functions/tokenBalances?address=${address}&network=${chain.id}`,
        );
        const balancesResponseBody = await balancesResponse.json();
        return balancesResponseBody;
      } catch (e) {
        console.error('Error while fetching treasury token balances', e);
        return { error: t('errorFetchingBalances') };
      }
    },
    [chain, t],
  );

  const getNFTBalances = useCallback(
    async (address: Address): Promise<{ data?: NFTBalance[]; error?: string }> => {
      try {
        const balancesResponse = await fetch(
          `/.netlify/functions/nftBalances?address=${address}&network=${chain.id}`,
        );
        const balancesResponseBody = await balancesResponse.json();
        return balancesResponseBody;
      } catch (e) {
        console.error('Error while fetching treasury NFT balances', e);
        return { error: t('errorFetchingBalances') };
      }
    },
    [chain, t],
  );

  const getDeFiBalances = useCallback(
    async (address: Address): Promise<{ data?: DefiBalance[]; error?: string }> => {
      if (!deFiSupported) {
        return { data: [] };
      }
      try {
        const balancesResponse = await fetch(
          `/.netlify/functions/defiBalances?address=${address}&network=${chain.id}`,
        );
        const balancesResponseBody = await balancesResponse.json();
        return balancesResponseBody;
      } catch (e) {
        console.error('Error while fetching treasury DeFi balances', e);
        return { error: t('errorFetchingBalances') };
      }
    },
    [chain, t, deFiSupported],
  );

  return { getTokenBalances, getNFTBalances, getDeFiBalances };
}
