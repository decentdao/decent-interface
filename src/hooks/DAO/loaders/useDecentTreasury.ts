import { useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { getAddress } from 'viem';
import { useFractal } from '../../../providers/App/AppProvider';
import useBalancesAPI from '../../../providers/App/hooks/useBalancesAPI';
import { useSafeAPI } from '../../../providers/App/hooks/useSafeAPI';
import { TreasuryAction } from '../../../providers/App/treasury/action';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';

export const useDecentTreasury = () => {
  // tracks the current valid DAO address / chain; helps prevent unnecessary calls
  const loadKey = useRef<string | null>();
  const {
    node: { daoAddress },
    action,
  } = useFractal();
  const safeAPI = useSafeAPI();
  const { getTokenBalances, getNFTBalances } = useBalancesAPI();

  const { chain } = useNetworkConfig();

  const loadTreasury = useCallback(async () => {
    if (!daoAddress || !safeAPI) {
      return;
    }

    const [
      transfers,
      { data: tokenBalances, error: tokenBalancesError },
      { data: nftBalances, error: nftBalancesError },
    ] = await Promise.all([
      safeAPI.getIncomingTransactions(daoAddress),
      getTokenBalances(daoAddress),
      getNFTBalances(daoAddress),
    ]);

    if (tokenBalancesError) {
      toast(tokenBalancesError, { autoClose: 2000 });
    }
    if (nftBalancesError) {
      toast(nftBalancesError, { autoClose: 2000 });
    }
    const assetsFungible = tokenBalances || [];
    const assetsNonFungible = nftBalances || [];

    const totalUsdValue = assetsFungible.reduce((prev, curr) => prev + (curr.usdValue || 0), 0);

    const transfersWithTokenInfo = await Promise.all(
      transfers.results.map(async transfer => {
        if (transfer.tokenAddress) {
          const tokenData = await safeAPI.getToken(getAddress(transfer.tokenAddress));
          return { ...transfer, tokenInfo: tokenData };
        }
        // @note When would there be a transfer with no token address? Should this just throw an error?
        return {
          ...transfer,
          tokenInfo: {
            address: '',
            name: '',
            symbol: '',
            decimals: 18,
          },
        };
      }),
    );
    const treasuryData = {
      assetsFungible,
      assetsNonFungible,
      transfers: transfersWithTokenInfo,
      totalUsdValue,
    };
    action.dispatch({ type: TreasuryAction.UPDATE_TREASURY, payload: treasuryData });
  }, [daoAddress, safeAPI, action, getTokenBalances, getNFTBalances]);

  useEffect(() => {
    if (daoAddress && chain.id + daoAddress !== loadKey.current) {
      loadKey.current = chain.id + daoAddress;
      loadTreasury();
    }
    if (!daoAddress) {
      loadKey.current = null;
    }
  }, [chain, daoAddress, loadTreasury]);

  return;
};
