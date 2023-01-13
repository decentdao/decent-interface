import EthersAdapter from '@safe-global/safe-ethers-lib';
import SafeServiceClient, { TransferResponse } from '@safe-global/safe-service-client';
import axios, { AxiosResponse } from 'axios';
import { ethers } from 'ethers';
import { useCallback, useEffect, useMemo } from 'react';
import { useProvider, useSigner } from 'wagmi';
import { logError } from '../../../helpers/errorLogging';
import { GnosisAction, TreasuryAction } from '../constants/actions';
import { GnosisActions, IGnosis, TreasuryActions } from '../types';
import { buildGnosisApiUrl } from '../utils';
import { useUpdateTimer } from './../../../hooks/utils/useUpdateTimer';
import { useNetworkConfg } from './../../NetworkConfig/NetworkConfigProvider';

/**
 * We generally use SafeServiceClient to make requests to the Safe API, however it does not
 * support the /transfers/ endpoint, so we do that via a normal get request instead.
 *
 * This API is paginated, but for our current usage we take the first page, and in
 * the Treasury page have a component to link to Etherscan in the event they want
 * to see more than the first page of assets.
 */
export interface AllTransfersListResponse {
  next: any;
  results: TransferResponse[];
}

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
        payload: await safeService.getUsdBalances(address),
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
        payload: await safeService.getCollectibles(address),
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
        buildGnosisApiUrl(chainId, `/safes/${address}/transfers/`)
      );
      treasuryDispatch({
        type: TreasuryAction.UPDATE_GNOSIS_SAFE_TRANSFERS,
        payload: response.data,
      });
    } catch (e) {
      logError(e);
    }
  }, [address, chainId, treasuryDispatch]);

  const getGnosisSafeTransactions = useCallback(async () => {
    if (!address || !safeService) {
      return;
    }
    try {
      gnosisDispatch({
        type: GnosisAction.SET_SAFE_TRANSACTIONS,
        payload: await safeService.getAllTransactions(address),
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
        payload: await safeService.getSafeInfo(providedSafeAddress),
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
