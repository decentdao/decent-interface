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
    node: { daoAddress },
    action,
  } = useFractal();
  const safeAPI = useSafeAPI();
  const { getTokenBalances, getNFTBalances, getDeFiBalances } = useBalancesAPI();

  const { chain } = useNetworkConfig();

  const loadTreasury = useCallback(async () => {
    if (!daoAddress || !safeAPI) {
      return;
    }

    const [
      transfers,
      { data: tokenBalances, error: tokenBalancesError },
      { data: nftBalances, error: nftBalancesError },
      { data: defiBalances, error: defiBalancesError },
    ] = await Promise.all([
      safeAPI.getAllTransactions(daoAddress),
      getTokenBalances(daoAddress),
      getNFTBalances(daoAddress),
      getDeFiBalances(daoAddress),
    ]);

    if (tokenBalancesError) {
      toast(tokenBalancesError, { autoClose: 2000 });
    }
    if (nftBalancesError) {
      toast(nftBalancesError, { autoClose: 2000 });
    }
    if (defiBalancesError) {
      toast(defiBalancesError, { autoClose: 2000 });
    }
    const assetsFungible = tokenBalances || [];
    const assetsNonFungible = nftBalances || [];
    const assetsDeFi = defiBalances || [];

    const totalAssetsFungibleUsd = assetsFungible.reduce(
      (prev, curr) => prev + (curr.usdValue || 0),
      0,
    );
    const totalAssetsDeFiUsd = assetsDeFi.reduce(
      (prev, curr) => prev + (curr.position?.balanceUsd || 0),
      0,
    );

    const totalUsdValue = totalAssetsFungibleUsd + totalAssetsDeFiUsd;

    const treasuryData = {
      assetsFungible,
      assetsDeFi,
      assetsNonFungible,
      transfers,
      totalUsdValue,
    };
    action.dispatch({ type: TreasuryAction.UPDATE_TREASURY, payload: treasuryData });
  }, [daoAddress, safeAPI, action, getTokenBalances, getNFTBalances, getDeFiBalances]);

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
