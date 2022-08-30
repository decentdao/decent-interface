import { buildGnosisApiUrl } from '../helpers';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { useCallback, useEffect } from 'react';
import { GnosisActions, GnosisActionTypes } from '../types';
import axios from 'axios';
import { GnosisSafeStatusResponse } from '../types/gnosis';

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
          nonce: safeStatusResponse.data.nonce,
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
