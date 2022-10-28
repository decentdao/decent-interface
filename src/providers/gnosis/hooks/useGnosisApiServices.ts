import { buildGnosisApiUrl } from '../helpers';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { useCallback, useEffect } from 'react';
import { GnosisActions, GnosisActionTypes } from '../types';
import axios from 'axios';
import { GnosisSafeStatusResponse } from '../types/gnosis';
import { logError } from '../../../helpers/errorLogging';
import { GnosisAssetFungible, GnosisAssetNonFungible } from '../../treasury/types';

/**
 * hooks on loading of a Gnosis Module will make requests to Gnosis API endpoints to gather any additional safe information
 * @param safeAddress
 * @param dispatch
 * @returns
 */
export function useGnosisApiServices(
  safeAddress: string | undefined,
  dispatch: React.Dispatch<GnosisActionTypes>
) {
  const {
    state: { chainId },
  } = useWeb3Provider();

  const getGnosisSafeStatus = useCallback(async () => {
    if (!safeAddress) {
      return;
    }
    try {
      const safeStatusResponse = await axios.get<GnosisSafeStatusResponse>(
        buildGnosisApiUrl(chainId, `/safes/${safeAddress}/`)
      );
      dispatch({
        type: GnosisActions.UPDATE_GNOSIS_SAFE_INFORMATION,
        payload: {
          nonce: safeStatusResponse.data.nonce,
          owners: safeStatusResponse.data.owners,
          threshold: safeStatusResponse.data.threshold,
        },
      });
    } catch (e) {
      logError(e);
    }
  }, [chainId, safeAddress, dispatch]);

  const getGnosisSafeAssets = useCallback(async () => {
    if (!safeAddress) {
      return;
    }
    try {
      const fAssetsStatusResponse = await axios.get<GnosisAssetFungible[]>(
        buildGnosisApiUrl(chainId, `/safes/${safeAddress}/balances/usd/`)
      );
      const nfAssetsStatusResponse = await axios.get<GnosisAssetNonFungible[]>(
        buildGnosisApiUrl(chainId, `/safes/${safeAddress}/collectibles/`)
      );
      dispatch({
        type: GnosisActions.UPDATE_GNOSIS_SAFE_ASSETS,
        payload: {
          treasuryAssetsFungible: fAssetsStatusResponse.data,
          treasuryAssetsNonFungible: nfAssetsStatusResponse.data,
        },
      });
    } catch (e) {
      logError(e);
    }
  }, [chainId, safeAddress, dispatch]);

  useEffect(() => {
    getGnosisSafeStatus();
    getGnosisSafeAssets();
  }, [getGnosisSafeStatus, getGnosisSafeAssets]);

  return;
}
