import { useCallback, useEffect, useRef } from 'react';
import { Address, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import LockReleaseABI from '../../../../assets/abi/LockRelease';
import { useFractal } from '../../../../providers/App/AppProvider';
import { DecentGovernanceAction } from '../../../../providers/App/governance/action';

/**
 * @link https://github.com/decent-dao/dcnt/blob/master/contracts/LockRelease.sol
 * This hook is specifically for the LockRelease.sol contract used for the DCNT token.
 */
export const useLockRelease = ({ onMount = true }: { onMount?: boolean }) => {
  const isTokenLoaded = useRef(false);
  const tokenAccount = useRef<string>();

  const {
    governanceContracts: { lockReleaseContractAddress },
    action,
    readOnly: { user },
  } = useFractal();
  const account = user.address;
  const publicClient = usePublicClient();

  const loadLockedVotesToken = useCallback(async () => {
    if (!lockReleaseContractAddress || !account || !publicClient) {
      action.dispatch({ type: DecentGovernanceAction.RESET_LOCKED_TOKEN_ACCOUNT_DATA });
      return;
    }
    const lockReleaseContract = getContract({
      abi: LockReleaseABI,
      address: lockReleaseContractAddress,
      client: publicClient,
    });
    const [tokenAmountTotal, tokenAmountReleased, tokenDelegatee, tokenVotingWeight] =
      await Promise.all([
        (await lockReleaseContract.read.getTotal([account])) as bigint,
        (await lockReleaseContract.read.getReleased([account])) as bigint,
        (await lockReleaseContract.read.delegates([account])) as Address,
        (await lockReleaseContract.read.getVotes([account])) as bigint,
      ]);

    let delegateChangeEvents = [];
    try {
      delegateChangeEvents = await lockReleaseContract.getEvents.DelegateChanged();
    } catch (e) {
      delegateChangeEvents = [];
    }

    const tokenAccountData = {
      balance: tokenAmountTotal - tokenAmountReleased,
      delegatee: tokenDelegatee,
      votingWeight: tokenVotingWeight,
      isDelegatesSet: delegateChangeEvents.length > 0,
    };
    action.dispatch({
      type: DecentGovernanceAction.SET_LOCKED_TOKEN_ACCOUNT_DATA,
      payload: tokenAccountData,
    });
  }, [lockReleaseContractAddress, action, account, publicClient]);

  useEffect(() => {
    if (
      lockReleaseContractAddress &&
      isTokenLoaded.current &&
      tokenAccount.current !== account + lockReleaseContractAddress &&
      onMount
    ) {
      tokenAccount.current = account + lockReleaseContractAddress;
      loadLockedVotesToken();
    }
  }, [account, lockReleaseContractAddress, onMount, loadLockedVotesToken]);

  useEffect(() => {
    if (!lockReleaseContractAddress || !onMount || !publicClient) {
      return;
    }
    const lockReleaseContract = getContract({
      abi: LockReleaseABI,
      address: lockReleaseContractAddress,
      client: publicClient,
    });
    const unsubscribe = lockReleaseContract.watchEvent.DelegateVotesChanged(
      {},
      { onLogs: loadLockedVotesToken },
    );

    return () => {
      unsubscribe();
    };
  }, [lockReleaseContractAddress, loadLockedVotesToken, onMount, publicClient]);

  useEffect(() => {
    if (!lockReleaseContractAddress || !onMount || !publicClient) {
      return;
    }
    const lockReleaseContract = getContract({
      abi: LockReleaseABI,
      address: lockReleaseContractAddress,
      client: publicClient,
    });
    const unsubscribe = lockReleaseContract.watchEvent.DelegateChanged(
      {},
      { onLogs: loadLockedVotesToken },
    );

    return () => {
      unsubscribe();
    };
  }, [lockReleaseContractAddress, loadLockedVotesToken, onMount, publicClient]);

  return { loadLockedVotesToken };
};
