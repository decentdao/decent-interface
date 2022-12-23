import EthersAdapter from '@safe-global/safe-ethers-lib';
import SafeServiceClient from '@safe-global/safe-service-client';
import { ethers } from 'ethers';
import { useCallback, useEffect } from 'react';
import { logError } from '../../../helpers/errorLogging';
import { useWeb3Provider } from '../../Web3Data/hooks/useWeb3Provider';
import { GnosisAction, TreasuryAction } from '../constants/actions';
import { GnosisActions, IGnosis, TreasuryActions } from '../types';
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
  const {
    state: { chainId, account, signerOrProvider },
  } = useWeb3Provider();

  const { safeBaseURL } = useNetworkConfg();

  const { setMethodOnInterval } = useUpdateTimer(address);

  useEffect(() => {
    if (!account || !signerOrProvider) {
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
  }, [account, signerOrProvider, gnosisDispatch, chainId, safeBaseURL]);

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
    if (!address || !safeService) {
      return;
    }
    try {
      treasuryDispatch({
        type: TreasuryAction.UPDATE_GNOSIS_SAFE_TRANSFERS,
        payload: await safeService.getIncomingTransactions(address),
      });
    } catch (e) {
      logError(e);
    }
  }, [address, treasuryDispatch, safeService]);

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

  useEffect(() => {
    if (!providedSafeAddress || !safeService || !isGnosisLoading) {
      return;
    }
    (async () => {
      gnosisDispatch({
        type: GnosisAction.SET_SAFE,
        payload: await safeService.getSafeInfo(providedSafeAddress),
      });
    })();
  }, [providedSafeAddress, safeService, gnosisDispatch, isGnosisLoading]);

  useEffect(() => {
    setMethodOnInterval(getGnosisSafeFungibleAssets);
    setMethodOnInterval(getGnosisSafeNonFungibleAssets);
    setMethodOnInterval(getGnosisSafeTransfers);
    setMethodOnInterval(getGnosisSafeTransactions);
  }, [
    setMethodOnInterval,
    getGnosisSafeFungibleAssets,
    getGnosisSafeNonFungibleAssets,
    getGnosisSafeTransfers,
    getGnosisSafeTransactions,
  ]);

  return { getGnosisSafeTransactions };
}
