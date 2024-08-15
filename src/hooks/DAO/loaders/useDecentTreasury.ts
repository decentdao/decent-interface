import { useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { useFractal } from '../../../providers/App/AppProvider';
import useBalancesAPI from '../../../providers/App/hooks/useBalancesAPI';
import { useSafeAPI } from '../../../providers/App/hooks/useSafeAPI';
import { TreasuryAction } from '../../../providers/App/treasury/action';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';

export const useDecentTreasury = () => {
  // tracks the current valid DAO address / chain; helps prevent unnecessary calls
  const loadKey = useRef<string | null>();
  const {
    node: { safe },
    action,
  } = useFractal();
  const safeAPI = useSafeAPI();
  const { getTokenBalances, getNFTBalances } = useBalancesAPI();

  const { chain } = useNetworkConfig();

  const safeAddress = safe?.address;

  const loadTreasury = useCallback(async () => {
    if (!safeAddress || !safeAPI) {
      return;
    }

    const [
      transfers,
      { data: tokenBalances, error: tokenBalancesError },
      { data: nftBalances, error: nftBalancesError },
    ] = await Promise.all([
      safeAPI.getAllTransactions(safeAddress),
      getTokenBalances(safeAddress),
      getNFTBalances(safeAddress),
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
    const treasuryData = {
      assetsFungible,
      assetsNonFungible,
      transfers,
      totalUsdValue,
    };
    action.dispatch({ type: TreasuryAction.UPDATE_TREASURY, payload: treasuryData });
  }, [safeAddress, safeAPI, action, getTokenBalances, getNFTBalances]);

  useEffect(() => {
    if (safeAddress && chain.id + safeAddress !== loadKey.current) {
      loadKey.current = chain.id + safeAddress;
      loadTreasury();
    }
    if (!safeAddress) {
      loadKey.current = null;
    }
  }, [chain, safeAddress, loadTreasury]);

  return;
};
