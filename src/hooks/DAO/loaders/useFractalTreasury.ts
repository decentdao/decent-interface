import { useEffect, useCallback, useRef } from 'react';
import { useFractal } from '../../../providers/App/AppProvider';
import useBalancesAPI from '../../../providers/App/hooks/useBalancesAPI';
import { useSafeAPI } from '../../../providers/App/hooks/useSafeAPI';
import { TreasuryAction } from '../../../providers/App/treasury/action';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { useUpdateTimer } from './../../utils/useUpdateTimer';

export const useFractalTreasury = () => {
  // tracks the current valid DAO address / chain; helps prevent unnecessary calls
  const loadKey = useRef<string | null>();
  const {
    node: { daoAddress },
    action,
  } = useFractal();
  const safeAPI = useSafeAPI();
  const getBalances = useBalancesAPI();

  const { chain } = useNetworkConfig();

  const { setMethodOnInterval, clearIntervals } = useUpdateTimer(daoAddress);

  const loadTreasury = useCallback(async () => {
    if (!daoAddress || !safeAPI) {
      return;
    }

    // @todo - fetch assetsNonFungible here
    const [transfers, balances] = await Promise.all([
      safeAPI.getAllTransactions(daoAddress),
      getBalances(daoAddress),
    ]);
    const treasuryData = {
      assetsFungible: balances.tokens,
      assetsNonFungible: [],
      transfers,
    };
    action.dispatch({ type: TreasuryAction.UPDATE_TREASURY, payload: treasuryData as any });
  }, [daoAddress, safeAPI, action, getBalances]);

  useEffect(() => {
    if (daoAddress && chain.id + daoAddress !== loadKey.current) {
      loadKey.current = chain.id + daoAddress;
      setMethodOnInterval(loadTreasury);
    }
    if (!daoAddress) {
      loadKey.current = null;
      clearIntervals();
    }
  }, [chain, daoAddress, loadTreasury, setMethodOnInterval, clearIntervals]);

  return;
};
