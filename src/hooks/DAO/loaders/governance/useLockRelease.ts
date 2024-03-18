import { DelegateChangedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/VotesERC20';
import { useCallback, useEffect, useRef } from 'react';
import { LockRelease__factory } from '../../../../assets/typechain-types/dcnt';
import { useFractal } from '../../../../providers/App/AppProvider';
import { DecentGovernanceAction } from '../../../../providers/App/governance/action';
import { useEthersProvider } from '../../../../providers/Ethers/hooks/useEthersProvider';

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
  const provider = useEthersProvider();
  const account = user.address;

  const loadLockedVotesToken = useCallback(async () => {
    if (!lockReleaseContractAddress || !account || !provider) {
      action.dispatch({ type: DecentGovernanceAction.RESET_LOCKED_TOKEN_ACCOUNT_DATA });
      return;
    }
    const lockReleaseContract = LockRelease__factory.connect(lockReleaseContractAddress, provider);
    const [tokenAmountTotal, tokenAmountReleased, tokenDelegatee, tokenVotingWeight] =
      await Promise.all([
        lockReleaseContract.getTotal(account),
        lockReleaseContract.getReleased(account),
        lockReleaseContract.delegates(account),
        lockReleaseContract.getVotes(account),
      ]);

    let delegateChangeEvents: DelegateChangedEvent[];
    try {
      delegateChangeEvents = await lockReleaseContract.queryFilter(
        lockReleaseContract.filters.DelegateChanged(),
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
  }, [lockReleaseContractAddress, action, account, provider]);

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
    if (!lockReleaseContractAddress || !onMount || !provider) {
      return;
    }
    const lockReleaseContract = LockRelease__factory.connect(lockReleaseContractAddress, provider);
    const delegateVotesChangedfilter = lockReleaseContract.filters.DelegateVotesChanged();
    lockReleaseContract.on(delegateVotesChangedfilter, loadLockedVotesToken);

    return () => {
      lockReleaseContract.off(delegateVotesChangedfilter, loadLockedVotesToken);
    };
  }, [lockReleaseContractAddress, loadLockedVotesToken, onMount, provider]);

  useEffect(() => {
    if (!lockReleaseContractAddress || !onMount || !provider) {
      return;
    }
    const lockReleaseContract = LockRelease__factory.connect(lockReleaseContractAddress, provider);
    const delegateChangedfilter = lockReleaseContract.filters.DelegateChanged();
    lockReleaseContract.on(delegateChangedfilter, loadLockedVotesToken);

    return () => {
      lockReleaseContract.off(delegateChangedfilter, loadLockedVotesToken);
    };
  }, [lockReleaseContractAddress, loadLockedVotesToken, onMount, provider]);

  return { loadLockedVotesToken };
};
