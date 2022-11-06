import axios from 'axios';
import { useCallback, useEffect } from 'react';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { logError } from '../../../helpers/errorLogging';
import {
  AssetTransfer,
  AssetTransfers,
  GnosisAssetFungible,
  GnosisAssetNonFungible,
  TreasuryActions,
} from '../types';
import { buildGnosisApiUrl } from '../utils';
import { TreasuryAction } from './../constants/actions';

/**
 * hooks on loading of a Gnosis Module will make requests to Gnosis API endpoints to gather any additional safe information
 * @param safeAddress
 * @param dispatch
 * @returns
 */
export function useGnosisApiServices(
  safeAddress: string | undefined,
  treasuryDispatch: React.Dispatch<TreasuryActions>
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

  const getGnosisSafeTransfers = useCallback(async () => {
    if (!safeAddress) {
      return;
    }
    try {
      const { data } = await axios.get<AssetTransfers>(
        buildGnosisApiUrl(chainId, `/safes/${safeAddress}/transfers/`)
      );
      treasuryDispatch({
        type: TreasuryAction.UPDATE_GNOSIS_SAFE_TRANSFERS,
        payload: data.results,
      });
    } catch (e) {
      logError(e);
    }
  }, [chainId, safeAddress, treasuryDispatch]);

  useEffect(() => {
    getGnosisSafeFungibleAssets();
    getGnosisSafeNonFungibleAssets();
    getGnosisSafeTransfers();
  }, [getGnosisSafeFungibleAssets, getGnosisSafeNonFungibleAssets, getGnosisSafeTransfers]);

  return;
}
