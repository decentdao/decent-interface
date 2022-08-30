import { buildGnosisApiUrl } from '../helpers';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { useCallback, useEffect } from 'react';
import { GnosisActions, GnosisActionTypes } from '../types';
import axios from 'axios';
import { GnosisSafeStatusResponse, GnosisTransaction } from '../types/gnosis';

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
      console.log(e);
    }
  }, [chainId, safeAddress, dispatch]);

  const getGnosisSafeTransactions = useCallback(async () => {
    if (!safeAddress) {
      return;
    }
    try {
      const safeTransactionsResponse = await axios.get<GnosisTransaction>(
        buildGnosisApiUrl(chainId, `/safes/${safeAddress}/multisig-transactions/`)
      );
      // dispatch({
      //   type: GnosisActions.UPDATE_GNOSIS_SAFE_INFORMATION,
      //   payload: {
      //     nonce: safeStatusResponse.data.nonce,
      //     owners: safeStatusResponse.data.owners,
      //     threshold: safeStatusResponse.data.threshold,
      //   },
      // });
    } catch (e) {
      console.log(e);
    }
  }, [chainId, safeAddress, dispatch]);

  useEffect(() => {
    getGnosisSafeStatus();
    getGnosisSafeTransactions();
  }, [getGnosisSafeStatus, getGnosisSafeTransactions]);

  return;
}
