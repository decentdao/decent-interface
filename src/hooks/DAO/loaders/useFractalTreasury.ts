import axios from 'axios';
import { useEffect, useCallback, useRef } from 'react';
import { logError } from '../../../helpers/errorLogging';
import { useFractal } from '../../../providers/App/AppProvider';
import { TreasuryAction } from '../../../providers/App/treasury/action';
import { buildGnosisApiUrl } from '../../../providers/Fractal/utils';
import { useNetworkConfg } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { useUpdateTimer } from './../../utils/useUpdateTimer';

export const useFractalTreasury = () => {
  // tracks the current valid DAO address; helps prevent unnecessary calls
  const currentValidAddress = useRef<string>();
  const {
    node: { daoAddress },
    clients: { safeService },
    dispatch,
  } = useFractal();

  const { safeBaseURL } = useNetworkConfg();

  const { setMethodOnInterval } = useUpdateTimer();

  const loadTreasury = useCallback(async () => {
    if (!daoAddress || !safeService) {
      return;
    }
    currentValidAddress.current = daoAddress;

    const [assetsFungible, assetsNonFungible, transfers] = await Promise.all([
      safeService.getUsdBalances(daoAddress).catch(e => {
        logError(e);
        return [];
      }),
      axios
        .get(buildGnosisApiUrl(safeBaseURL, `/safes/${daoAddress}/collectibles/`, {}, 'v2'))
        .catch(e => {
          logError(e);
          return { data: [] };
        }),
      axios.get(buildGnosisApiUrl(safeBaseURL, `/safes/${daoAddress}/transfers/`)).catch(e => {
        logError(e);
        return { data: undefined };
      }),
    ]);

    const treasuryData = {
      assetsFungible,
      assetsNonFungible: assetsNonFungible.data,
      transfers: transfers.data,
    };
    dispatch.treasury({ type: TreasuryAction.UPDATE_TREASURY, payload: treasuryData });
  }, [daoAddress, safeService, safeBaseURL, dispatch]);

  useEffect(() => {
    if (daoAddress !== currentValidAddress.current) {
      setMethodOnInterval(loadTreasury);
    }
  }, [daoAddress, loadTreasury, setMethodOnInterval]);

  return;
};
