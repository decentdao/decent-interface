import axios from 'axios';
import { useEffect, useCallback, useRef } from 'react';
import { logError } from '../../../helpers/errorLogging';
import { useFractal } from '../../../providers/App/AppProvider';
import { useSafeAPI } from '../../../providers/App/hooks/useSafeAPI';
import { TreasuryAction } from '../../../providers/App/treasury/action';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { buildSafeApiUrl } from '../../../utils';
import { useUpdateTimer } from './../../utils/useUpdateTimer';

export const useFractalTreasury = () => {
  // tracks the current valid DAO address / chain; helps prevent unnecessary calls
  const loadKey = useRef<string | null>();
  const {
    node: { daoAddress },
    action,
  } = useFractal();
  const safeAPI = useSafeAPI();

  const { chain } = useNetworkConfig();

  const { safeBaseURL } = useNetworkConfig();

  const { setMethodOnInterval, clearIntervals } = useUpdateTimer(daoAddress);

  const loadTreasury = useCallback(async () => {
    if (!daoAddress || !safeAPI) {
      return;
    }
    const [assetsFungible, assetsNonFungible, transfers] = await Promise.all([
      safeAPI.getBalances(daoAddress, { excludeSpamTokens: true }).catch(e => {
        logError(e);
        return [];
      }),
      axios
        .get(buildSafeApiUrl(safeBaseURL, `/safes/${daoAddress}/collectibles/`, {}, 'v2'))
        .catch(e => {
          logError(e);
          return { data: { results: [] } };
        }),
      axios.get(buildSafeApiUrl(safeBaseURL, `/safes/${daoAddress}/transfers/`)).catch(e => {
        logError(e);
        return { data: undefined };
      }),
    ]);

    const treasuryData = {
      assetsFungible,
      assetsNonFungible: assetsNonFungible.data.results,
      transfers: transfers.data,
    };
    action.dispatch({ type: TreasuryAction.UPDATE_TREASURY, payload: treasuryData });
  }, [daoAddress, safeAPI, safeBaseURL, action]);

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
