import { GnosisAction, TreasuryAction } from './../constants/actions';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { useCallback, useEffect } from 'react';
import axios from 'axios';
import { logError } from '../../../helpers/errorLogging';
import {
  GnosisActions,
  GnosisAssetFungible,
  GnosisAssetNonFungible,
  GnosisTransactionsResponse,
  TreasuryActions,
} from '../types';
import { buildGnosisApiUrl } from '../utils';

/**
 * hooks on loading of a Gnosis Module will make requests to Gnosis API endpoints to gather any additional safe information
 * @param safeAddress
 * @param dispatch
 * @returns
 */
export function useGnosisApiServices(
  safeAddress: string | undefined,
  treasuryDispatch: React.Dispatch<TreasuryActions>,
  gnosisDispatch: React.Dispatch<GnosisActions>
) {
  const {
    state: { chainId },
  } = useWeb3Provider();

  const getGnosisSafeFungibleAssets = useCallback(async () => {
    if (!safeAddress) {
      return;
    }
    try {
      const { data } = await axios.get<GnosisAssetFungible[]>(
        buildGnosisApiUrl(chainId, `/safes/${safeAddress}/balances/usd/`)
      );
      treasuryDispatch({
        type: TreasuryAction.UPDATE_GNOSIS_SAFE_FUNGIBLE_ASSETS,
        payload: data,
      });
    } catch (e) {
      logError(e);
    }
  }, [chainId, safeAddress, treasuryDispatch]);

  const getGnosisSafeNonFungibleAssets = useCallback(async () => {
    if (!safeAddress) {
      return;
    }
    try {
      const { data } = await axios.get<GnosisAssetNonFungible[]>(
        buildGnosisApiUrl(chainId, `/safes/${safeAddress}/collectibles/`)
      );
      treasuryDispatch({
        type: TreasuryAction.UPDATE_GNOSIS_SAFE_NONFUNGIBLE_ASSETS,
        payload: data,
      });
    } catch (e) {
      logError(e);
    }
  }, [chainId, safeAddress, treasuryDispatch]);

  const getGnosisSafeTransactions = useCallback(async () => {
    if (!safeAddress) {
      return;
    }
    try {
      const { data } = await axios.get<GnosisTransactionsResponse>(
        buildGnosisApiUrl(chainId, `/safes/${safeAddress}/all-transactions/`)
      );
      gnosisDispatch({
        type: GnosisAction.SET_SAFE_TRANSACTIONS,
        payload: data,
      });
    } catch (e) {
      logError(e);
    }
  }, [chainId, safeAddress, gnosisDispatch]);

  useEffect(() => {
    getGnosisSafeFungibleAssets();
    getGnosisSafeNonFungibleAssets();
    getGnosisSafeTransactions();
  }, [getGnosisSafeFungibleAssets, getGnosisSafeNonFungibleAssets, getGnosisSafeTransactions]);

  return;
}
