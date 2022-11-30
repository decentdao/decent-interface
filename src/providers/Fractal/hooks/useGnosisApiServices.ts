import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient from '@gnosis.pm/safe-service-client';
import { ethers, Signer } from 'ethers';
import { useCallback, useEffect } from 'react';
import { CHAIN_DATA_LIST } from 'web3modal';
import { logError } from '../../../helpers/errorLogging';
import { useWeb3Provider } from '../../Web3Data/hooks/useWeb3Provider';
import { GnosisAction, TreasuryAction } from '../constants/actions';
import { GnosisActions, IGnosis, TreasuryActions } from '../types';

/**
 * hooks on loading of a Gnosis Module will make requests to Gnosis API endpoints to gather any additional safe information
 * @param safeAddress
 * @param dispatch
 * @returns
 */
export function useGnosisApiServices(
  { safe: { address }, safeService }: IGnosis,
  treasuryDispatch: React.Dispatch<TreasuryActions>,
  gnosisDispatch: React.Dispatch<GnosisActions>
) {
  const {
    state: { chainId, account },
  } = useWeb3Provider();

  const {
    state: { signerOrProvider },
  } = useWeb3Provider();

  useEffect(() => {
    if (!account || !signerOrProvider) {
      return;
    }
    const ethAdapter = new EthersAdapter({
      ethers,
      signer: signerOrProvider as Signer,
    });

    const network =
      process.env.REACT_APP_LOCAL_CHAIN_ID === chainId.toString()
        ? 'goerli'
        : CHAIN_DATA_LIST[chainId].network;

    // gnosisDispatch({
    //   type: GnosisAction.SET_SAFE_SERVICE_CLIENT,
    //   payload: new SafeServiceClient({
    //     txServiceUrl: `https://safe-transaction-${network}.safe.global`,
    //     ethAdapter,
    //   }),
    // });
  }, [account, signerOrProvider, gnosisDispatch, chainId]);

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

  useEffect(() => {
    getGnosisSafeFungibleAssets();
    getGnosisSafeNonFungibleAssets();
    getGnosisSafeTransfers();
  }, [getGnosisSafeFungibleAssets, getGnosisSafeNonFungibleAssets, getGnosisSafeTransfers]);

  return;
}
