import { DelegateChangedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/VotesERC20';
import { useCallback, useEffect, useRef } from 'react';
import { useProvider } from 'wagmi';
import { LockRelease } from '../../../../assets/typechain-types/dcnt';
import { getEventRPC } from '../../../../helpers';
import { useFractal } from '../../../../providers/App/AppProvider';
import { DecentGovernanceAction } from '../../../../providers/App/governance/action';

/**
 * This hook is specifically for the LockRelease.sol contract used for the DCNT token.
 */
export const useLockRelease = ({ onMount = true }: { onMount?: boolean }) => {
  const isTokenLoaded = useRef(false);
  const tokenAccount = useRef<string>();

  const {
    governanceContracts: { lockReleaseContract },
    action,
    readOnly: { user },
  } = useFractal();
  const account = user.address;

  const {
    network: { chainId },
  } = useProvider();

  const loadLockedVotesToken = useCallback(async () => {
    if (!lockReleaseContract || !account) {
      action.dispatch({ type: DecentGovernanceAction.RESET_LOCKED_TOKEN_ACCOUNT_DATA });
      return;
    }
    const [tokenBalance, tokenDelegatee, tokenVotingWeight] = await Promise.all([
      lockReleaseContract.asSigner.getPending(account),
      lockReleaseContract.asSigner.delegates(account),
      lockReleaseContract.asSigner.getVotes(account),
    ]);

    let delegateChangeEvents: DelegateChangedEvent[];
    try {
      delegateChangeEvents = await lockReleaseContract.asSigner.queryFilter(
        lockReleaseContract.asSigner.filters.DelegateChanged()
      );
    } catch (e) {
      delegateChangeEvents = [];
    }

    const tokenAccountData = {
      balance: tokenBalance,
      delegatee: tokenDelegatee,
      votingWeight: tokenVotingWeight,
      isDelegatesSet: delegateChangeEvents.length > 0,
    };
    action.dispatch({
      type: DecentGovernanceAction.SET_LOCKED_TOKEN_ACCOUNT_DATA,
      payload: tokenAccountData,
    });
  }, [lockReleaseContract, action, account]);

  useEffect(() => {
    if (
      lockReleaseContract &&
      isTokenLoaded.current &&
      tokenAccount.current !== account + lockReleaseContract.asSigner.address &&
      onMount
    ) {
      tokenAccount.current = account + lockReleaseContract.asSigner.address;
      loadLockedVotesToken();
    }
  }, [account, lockReleaseContract, onMount, loadLockedVotesToken]);

  useEffect(() => {
    if (!lockReleaseContract || !onMount) {
      return;
    }
    const rpc = getEventRPC<LockRelease>(lockReleaseContract, chainId);
    const delegateVotesChangedfilter = rpc.filters.DelegateVotesChanged();
    rpc.on(delegateVotesChangedfilter, loadLockedVotesToken);

    return () => {
      rpc.off(delegateVotesChangedfilter, loadLockedVotesToken);
    };
  }, [lockReleaseContract, chainId, loadLockedVotesToken, onMount]);

  useEffect(() => {
    if (!lockReleaseContract || !onMount) {
      return;
    }
    const rpc = getEventRPC<LockRelease>(lockReleaseContract, chainId);
    const delegateChangedfilter = rpc.filters.DelegateChanged();
    rpc.on(delegateChangedfilter, loadLockedVotesToken);

    return () => {
      rpc.off(delegateChangedfilter, loadLockedVotesToken);
    };
  }, [lockReleaseContract, chainId, loadLockedVotesToken, onMount]);

  return { loadLockedVotesToken };
};
