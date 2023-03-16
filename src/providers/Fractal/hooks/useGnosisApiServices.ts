import EthersAdapter from '@safe-global/safe-ethers-lib';
import SafeServiceClient from '@safe-global/safe-service-client';
import axios, { AxiosResponse } from 'axios';
import { ethers } from 'ethers';
import { useCallback, useEffect, useMemo } from 'react';
import { useProvider, useSigner } from 'wagmi';
import { logError } from '../../../helpers/errorLogging';
import {
  IGnosis,
  TreasuryActions,
  GnosisActions,
  GnosisAction,
  TreasuryAction,
  AllTransfersListResponse,
} from '../../../types';
import { buildGnosisApiUrl } from '../utils';
import { useUpdateTimer } from './../../../hooks/utils/useUpdateTimer';
import { useNetworkConfg } from './../../NetworkConfig/NetworkConfigProvider';

/**
 * hooks on loading of a Gnosis Module will make requests to Gnosis API endpoints to gather any additional safe information
 * @param safeAddress
 * @param dispatch
 * @returns
 */
export function useGnosisApiServices(
  { safe: { address }, safeService, providedSafeAddress, isGnosisLoading }: IGnosis,
  treasuryDispatch: React.Dispatch<TreasuryActions>,
  gnosisDispatch: React.Dispatch<GnosisActions>
) {
  const provider = useProvider();
  const { data: signer } = useSigner();
  const signerOrProvider = useMemo(() => signer || provider, [signer, provider]);
  const { safeBaseURL } = useNetworkConfg();

  const { setMethodOnInterval } = useUpdateTimer(address);

  useEffect(() => {
    if (!signerOrProvider) {
      return;
    }
    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider,
    });

    gnosisDispatch({
      type: GnosisAction.SET_SAFE_SERVICE_CLIENT,
      payload: new SafeServiceClient({
        txServiceUrl: safeBaseURL,
        ethAdapter,
      }),
    });
  }, [signerOrProvider, gnosisDispatch, safeBaseURL]);

  const getGnosisSafeFungibleAssets = useCallback(async () => {
    if (!address || !safeService) {
      return;
    }
    try {
      treasuryDispatch({
        type: TreasuryAction.UPDATE_GNOSIS_SAFE_FUNGIBLE_ASSETS,
        payload: await safeService.getUsdBalances(ethers.utils.getAddress(address)),
      });
    } catch (e) {
      logError(e);
    }
  }, [safeService, address, treasuryDispatch]);

  const getGnosisSafeNonFungibleAssets = useCallback(async () => {
    if (!address || !safeService) {
      return;
    }
    try {
      treasuryDispatch({
        type: TreasuryAction.UPDATE_GNOSIS_SAFE_NONFUNGIBLE_ASSETS,
        payload: await safeService.getCollectibles(ethers.utils.getAddress(address)),
      });
    } catch (e) {
      logError(e);
    }
  }, [safeService, address, treasuryDispatch]);

  const getGnosisSafeTransfers = useCallback(async () => {
    if (!address) {
      return;
    }
    try {
      const response: AxiosResponse<AllTransfersListResponse> = await axios.get(
        buildGnosisApiUrl(safeBaseURL, `/safes/${address}/transfers/`)
      );
      treasuryDispatch({
        type: TreasuryAction.UPDATE_GNOSIS_SAFE_TRANSFERS,
        payload: response.data,
      });
    } catch (e) {
      logError(e);
    }
  }, [address, safeBaseURL, treasuryDispatch]);

  const getGnosisSafeTransactions = useCallback(async () => {
    if (!address || !safeService) {
      return;
    }
    try {
      gnosisDispatch({
        type: GnosisAction.SET_SAFE_TRANSACTIONS,
        payload: await safeService.getAllTransactions(ethers.utils.getAddress(address)),
      });
    } catch (e) {
      logError(e);
    }
  }, [address, safeService, gnosisDispatch]);

  const getGnosisSafeInfo = useCallback(async () => {
    if (!providedSafeAddress || !safeService || !isGnosisLoading) {
      return;
    }
    try {
      gnosisDispatch({
        type: GnosisAction.SET_SAFE,
        payload: await safeService.getSafeInfo(ethers.utils.getAddress(providedSafeAddress)),
      });
    } catch (e) {
      logError(e);
    }
  }, [providedSafeAddress, safeService, gnosisDispatch, isGnosisLoading]);

  useEffect(() => {
    setMethodOnInterval(getGnosisSafeInfo);
    setMethodOnInterval(getGnosisSafeFungibleAssets);
    setMethodOnInterval(getGnosisSafeNonFungibleAssets);
    setMethodOnInterval(getGnosisSafeTransfers);
    setMethodOnInterval(getGnosisSafeTransactions);
  }, [
    setMethodOnInterval,
    getGnosisSafeInfo,
    getGnosisSafeFungibleAssets,
    getGnosisSafeNonFungibleAssets,
    getGnosisSafeTransfers,
    getGnosisSafeTransactions,
  ]);

  return { getGnosisSafeTransactions, getGnosisSafeInfo };
}
