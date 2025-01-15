import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Address } from 'viem';
import { DefiBalance, NFTBalance, TokenBalance } from '../../../types';
import { useNetworkConfigStore } from '../../NetworkConfig/useNetworkConfigStore';

type BalanceResponse = {
  tokens?: { data: TokenBalance[] };
  nfts?: { data: NFTBalance[] };
  defi?: { data: DefiBalance[] };
  error?: string;
};

const USE_LEGACY_BACKEND = import.meta.env.VITE_APP_USE_LEGACY_BACKEND === 'true';

export default function useBalancesAPI() {
  const {
    chain,
    moralis: { deFiSupported },
  } = useNetworkConfigStore();
  const { t } = useTranslation('treasury');

  const fetchBalancesNew = useCallback(
    async (address: Address, flavors: string[]): Promise<BalanceResponse> => {
      try {
        const params = new URLSearchParams();
        params.append('address', address);
        params.append('network', chain.id.toString());
        flavors.forEach(flavor => params.append('flavor', flavor));

        const response = await fetch(`/api/balances?${params}`);
        return await response.json();
      } catch (e) {
        console.error('Error while fetching balances', e);
        return { error: t('errorFetchingBalances') };
      }
    },
    [chain.id, t],
  );

  const fetchBalancesLegacy = useCallback(
    async (
      address: Address,
      type: 'token' | 'nft' | 'defi',
    ): Promise<{ data?: any; error?: string }> => {
      try {
        const endpoint =
          type === 'token' ? 'tokenBalances' : type === 'nft' ? 'nftBalances' : 'defiBalances';
        const balancesResponse = await fetch(
          `/.netlify/functions/${endpoint}?address=${address}&network=${chain.id}`,
        );
        return await balancesResponse.json();
      } catch (e) {
        console.error(`Error while fetching treasury ${type} balances`, e);
        return { error: t('errorFetchingBalances') };
      }
    },
    [chain.id, t],
  );

  const getTokenBalances = useCallback(
    async (address: Address): Promise<{ data?: TokenBalance[]; error?: string }> => {
      if (USE_LEGACY_BACKEND) {
        return fetchBalancesLegacy(address, 'token');
      }
      const response = await fetchBalancesNew(address, ['tokens']);
      return { data: response.tokens?.data, error: response.error };
    },
    [fetchBalancesNew, fetchBalancesLegacy],
  );

  const getNFTBalances = useCallback(
    async (address: Address): Promise<{ data?: NFTBalance[]; error?: string }> => {
      if (USE_LEGACY_BACKEND) {
        return fetchBalancesLegacy(address, 'nft');
      }
      const response = await fetchBalancesNew(address, ['nfts']);
      return { data: response.nfts?.data, error: response.error };
    },
    [fetchBalancesNew, fetchBalancesLegacy],
  );

  const getDeFiBalances = useCallback(
    async (address: Address): Promise<{ data?: DefiBalance[]; error?: string }> => {
      if (!deFiSupported) {
        return { data: [] };
      }
      if (USE_LEGACY_BACKEND) {
        return fetchBalancesLegacy(address, 'defi');
      }
      const response = await fetchBalancesNew(address, ['defi']);
      return { data: response.defi?.data, error: response.error };
    },
    [deFiSupported, fetchBalancesNew, fetchBalancesLegacy],
  );

  return { getTokenBalances, getNFTBalances, getDeFiBalances };
}
