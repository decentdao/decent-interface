import { buildGnosisApiUrl } from '../helpers';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { useCallback, useEffect } from 'react';
import { GnosisActions, GnosisActionTypes } from '../types';
import axios from 'axios';
import { GnosisSafeStatusResponse } from '../types/gnosis';

export function useGnosisApiServices(
  safeAddress: string | undefined,
  dispatch: React.Dispatch<GnosisActionTypes>
) {
  const {
    state: { chainId, account },
  } = useWeb3Provider();

  const getGnosisSafeStatus = useCallback(async () => {
    if (!safeAddress || !account) {
      return;
    }
    try {
      const safeStatusResponse = await axios.get<GnosisSafeStatusResponse>(
        buildGnosisApiUrl(chainId, `/safes/${safeAddress}/`)
      );
      dispatch({
        type: GnosisActions.UPDATE_GNOSIS_SAFE_INFORMATION,
        payload: {
          owners: safeStatusResponse.data.owners,
          threshold: safeStatusResponse.data.threshold,
          isSigner: safeStatusResponse.data.owners.includes(account),
        },
      });
    } catch (e) {
      console.log(e);
    }
  }, [chainId, safeAddress, dispatch, account]);

  useEffect(() => {
    getGnosisSafeStatus();
  }, [getGnosisSafeStatus]);

  return;
}
