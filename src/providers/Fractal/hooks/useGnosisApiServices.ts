import EthersAdapter from '@safe-global/safe-ethers-lib';
import SafeServiceClient, {
  AllTransactionsListResponse,
  SafeBalanceUsdResponse,
  SafeCollectibleResponse,
  SafeInfoResponse,
  TransferResponse,
} from '@safe-global/safe-service-client';
import axios from 'axios';
import { ethers } from 'ethers';
import { useCallback, useEffect, useMemo } from 'react';
import { useProvider, useSigner } from 'wagmi';
import { logError } from '../../../helpers/errorLogging';
import { GnosisAction, TreasuryAction } from '../constants/actions';
import { GnosisActions, IGnosis, TreasuryActions } from '../types';
import { buildGnosisApiUrl } from '../utils';
import { useUpdateTimer } from './../../../hooks/utils/useUpdateTimer';
import { useNetworkConfg } from './../../NetworkConfig/NetworkConfigProvider';
import { CacheKeys, useLocalStorage } from './account/useLocalStorage';

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

const SAFE_API_CACHE_MINUTES = 1; // TODO what should this be?

async function getCachedGnosis<T>(
  cacheKey: string,
  address: string,
  setCache: (key: string, value: any, expirationMinutes?: number) => void,
  getCache: (key: string) => any,
  networkRequest: () => Promise<T>
) {
  let cache: T = getCache(cacheKey + address);
  if (!cache) {
    cache = await networkRequest();
    setCache(cacheKey + address, cache, SAFE_API_CACHE_MINUTES);
  }
  return cache;
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
  const { setValue, getValue } = useLocalStorage();

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
        payload: await getCachedGnosis<SafeBalanceUsdResponse[]>(
          CacheKeys.USD_BALANCES_PREFIX,
          address,
          setValue,
          getValue,
          () => {
            return safeService.getUsdBalances(address);
          }
        ),
      });
    } catch (e) {
      logError(e);
    }
  }, [address, safeService, treasuryDispatch, getValue, setValue]);

  const getGnosisSafeNonFungibleAssets = useCallback(async () => {
    if (!address || !safeService) {
      return;
    }
    try {
      treasuryDispatch({
        type: TreasuryAction.UPDATE_GNOSIS_SAFE_NONFUNGIBLE_ASSETS,
        payload: await getCachedGnosis<SafeCollectibleResponse[]>(
          CacheKeys.COLLECTIBLES_PREFIX,
          address,
          setValue,
          getValue,
          () => {
            return safeService.getCollectibles(address);
          }
        ),
      });
    } catch (e) {
      logError(e);
    }
  }, [address, safeService, treasuryDispatch, setValue, getValue]);

  const getGnosisSafeTransfers = useCallback(async () => {
    if (!address) {
      return;
    }
    try {
      treasuryDispatch({
        type: TreasuryAction.UPDATE_GNOSIS_SAFE_TRANSFERS,
        payload: await getCachedGnosis<AllTransfersListResponse>(
          CacheKeys.ALL_TRANSFERS_PREFIX,
          address,
          setValue,
          getValue,
          () => {
            return axios.get(buildGnosisApiUrl(safeBaseURL, `/safes/${address}/transfers/`));
          }
        ),
      });
    } catch (e) {
      logError(e);
    }
  }, [address, getValue, safeBaseURL, setValue, treasuryDispatch]);

  const getGnosisSafeTransactions = useCallback(async () => {
    if (!address || !safeService) {
      return;
    }
    try {
      gnosisDispatch({
        type: GnosisAction.SET_SAFE_TRANSACTIONS,
        payload: await getCachedGnosis<AllTransactionsListResponse>(
          CacheKeys.ALL_TRANSACTIONS_PREFIX,
          address,
          setValue,
          getValue,
          () => {
            return safeService.getAllTransactions(address);
          }
        ),
      });
    } catch (e) {
      logError(e);
    }
  }, [address, safeService, gnosisDispatch, setValue, getValue]);

  const getGnosisSafeInfo = useCallback(async () => {
    if (!providedSafeAddress || !safeService || !isGnosisLoading) {
      return;
    }
    try {
      gnosisDispatch({
        type: GnosisAction.SET_SAFE,
        payload: await getCachedGnosis<SafeInfoResponse>(
          CacheKeys.SAFE_INFO_PREFIX,
          providedSafeAddress,
          setValue,
          getValue,
          () => {
            return safeService.getSafeInfo(providedSafeAddress);
          }
        ),
      });
    } catch (e) {
      logError(e);
    }
  }, [providedSafeAddress, safeService, isGnosisLoading, gnosisDispatch, setValue, getValue]);

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
