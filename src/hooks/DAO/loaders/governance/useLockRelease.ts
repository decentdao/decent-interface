import { DelegateChangedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/VotesERC20';
import { useCallback, useEffect, useRef } from 'react';
import { LockRelease } from '../../../../assets/typechain-types/dcnt';
import { getEventRPC } from '../../../../helpers';
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
    governanceContracts: { lockReleaseContract },
    action,
    readOnly: { user },
  } = useFractal();
  const account = user.address;

  const loadLockedVotesToken = useCallback(async () => {
    if (!lockReleaseContract || !account) {
      action.dispatch({ type: DecentGovernanceAction.RESET_LOCKED_TOKEN_ACCOUNT_DATA });
      return;
    }
    const [tokenAmountTotal, tokenAmountReleased, tokenDelegatee, tokenVotingWeight] =
      await Promise.all([
        lockReleaseContract.asProvider.getTotal(account),
        lockReleaseContract.asProvider.getReleased(account),
        lockReleaseContract.asProvider.delegates(account),
        lockReleaseContract.asProvider.getVotes(account),
      ]);

    let delegateChangeEvents: DelegateChangedEvent[];
    try {
      delegateChangeEvents = await lockReleaseContract.asProvider.queryFilter(
        lockReleaseContract.asProvider.filters.DelegateChanged(),
      );
    } catch (e) {
      delegateChangeEvents = [];
    }

    const tokenAccountData = {
      balance: tokenAmountTotal.sub(tokenAmountReleased),
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
      tokenAccount.current !== account + lockReleaseContract.asProvider.address &&
      onMount
    ) {
      tokenAccount.current = account + lockReleaseContract.asProvider.address;
      loadLockedVotesToken();
    }
  }, [account, lockReleaseContract, onMount, loadLockedVotesToken]);

  useEffect(() => {
    if (!lockReleaseContract || !onMount) {
      return;
    }
    const rpc = getEventRPC<LockRelease>(lockReleaseContract);
    const delegateVotesChangedfilter = rpc.filters.DelegateVotesChanged();
    rpc.on(delegateVotesChangedfilter, loadLockedVotesToken);

    return () => {
      rpc.off(delegateVotesChangedfilter, loadLockedVotesToken);
    };
  }, [lockReleaseContract, loadLockedVotesToken, onMount]);

  useEffect(() => {
    if (!lockReleaseContract || !onMount) {
      return;
    }
    const rpc = getEventRPC<LockRelease>(lockReleaseContract);
    const delegateChangedfilter = rpc.filters.DelegateChanged();
    rpc.on(delegateChangedfilter, loadLockedVotesToken);

    return () => {
      rpc.off(delegateChangedfilter, loadLockedVotesToken);
    };
  }, [lockReleaseContract, loadLockedVotesToken, onMount]);

  return { loadLockedVotesToken };
};
