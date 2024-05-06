import { useCallback, useEffect, useRef } from 'react';
import { getAddress } from 'viem';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import useSafeContracts from '../../../safe/useSafeContracts';

export const useERC20LinearToken = ({ onMount = true }: { onMount?: boolean }) => {
  const isTokenLoaded = useRef(false);
  const tokenAccount = useRef<string>();

  const {
    governanceContracts: { votesTokenContractAddress, underlyingTokenAddress },
    action,
    readOnly: { user },
  } = useFractal();
  const account = user.address;
  const baseContracts = useSafeContracts();

  const loadERC20Token = useCallback(async () => {
    if (!votesTokenContractAddress || !baseContracts) {
      return;
    }
    const tokenContract =
      baseContracts.votesTokenMasterCopyContract.asProvider.attach(votesTokenContractAddress);
    const [tokenName, tokenSymbol, tokenDecimals, totalSupply] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals(),
      (await tokenContract.totalSupply()).toBigInt(),
    ]);
    const tokenData = {
      name: tokenName,
      symbol: tokenSymbol,
      decimals: tokenDecimals,
      address: getAddress(votesTokenContractAddress),
      totalSupply,
    };
    isTokenLoaded.current = true;
    action.dispatch({ type: FractalGovernanceAction.SET_TOKEN_DATA, payload: tokenData });
  }, [votesTokenContractAddress, action, baseContracts]);

  const loadUnderlyingERC20Token = useCallback(async () => {
    if (!underlyingTokenAddress || !baseContracts) {
      return;
    }
    const tokenContract =
      baseContracts.votesTokenMasterCopyContract.asProvider.attach(underlyingTokenAddress);

    const [tokenName, tokenSymbol] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
    ]);
    const tokenData = {
      name: tokenName,
      symbol: tokenSymbol,
      address: getAddress(underlyingTokenAddress),
    };
    action.dispatch({
      type: FractalGovernanceAction.SET_UNDERLYING_TOKEN_DATA,
      payload: tokenData,
    });
  }, [underlyingTokenAddress, action, baseContracts]);

  const loadERC20TokenAccountData = useCallback(async () => {
    if (!votesTokenContractAddress || !account || !baseContracts) {
      action.dispatch({ type: FractalGovernanceAction.RESET_TOKEN_ACCOUNT_DATA });
      return;
    }
    const tokenContract =
      baseContracts.votesTokenMasterCopyContract.asProvider.attach(votesTokenContractAddress);
    // @todo We could probably save on some requests here.
    const [tokenBalance, tokenDelegatee, tokenVotingWeight] = await Promise.all([
      (await tokenContract.balanceOf(account)).toBigInt(),
      tokenContract.delegates(account),
      (await tokenContract.getVotes(account)).toBigInt(),
    ]);

    const tokenAccountData = {
      balance: tokenBalance,
      delegatee: tokenDelegatee,
      votingWeight: tokenVotingWeight,
    };

    action.dispatch({
      type: FractalGovernanceAction.SET_TOKEN_ACCOUNT_DATA,
      payload: tokenAccountData,
    });
  }, [votesTokenContractAddress, action, account, baseContracts]);

  useEffect(() => {
    if (
      votesTokenContractAddress &&
      isTokenLoaded.current &&
      tokenAccount.current !== account + votesTokenContractAddress &&
      onMount
    ) {
      tokenAccount.current = account + votesTokenContractAddress;
      loadERC20TokenAccountData();
    }
  }, [account, votesTokenContractAddress, onMount, loadERC20TokenAccountData]);

  useEffect(() => {
    if (!votesTokenContractAddress || !onMount || !baseContracts) {
      return;
    }
    const tokenContract =
      baseContracts.votesTokenMasterCopyContract.asProvider.attach(votesTokenContractAddress);

    const delegateVotesChangedfilter = tokenContract.filters.DelegateVotesChanged();
    tokenContract.on(delegateVotesChangedfilter, loadERC20TokenAccountData);

    return () => {
      tokenContract.off(delegateVotesChangedfilter, loadERC20TokenAccountData);
    };
  }, [votesTokenContractAddress, loadERC20TokenAccountData, onMount, baseContracts]);

  useEffect(() => {
    if (!votesTokenContractAddress || !onMount || !baseContracts) {
      return;
    }
    const tokenContract =
      baseContracts.votesTokenMasterCopyContract.asProvider.attach(votesTokenContractAddress);
    const delegateChangedfilter = tokenContract.filters.DelegateChanged();
    tokenContract.on(delegateChangedfilter, loadERC20TokenAccountData);

    return () => {
      tokenContract.off(delegateChangedfilter, loadERC20TokenAccountData);
    };
  }, [votesTokenContractAddress, loadERC20TokenAccountData, onMount, baseContracts]);

  useEffect(() => {
    if (!votesTokenContractAddress || !onMount || !baseContracts) {
      return;
    }
    const tokenContract =
      baseContracts.votesTokenMasterCopyContract.asProvider.attach(votesTokenContractAddress);
    const filterTo = tokenContract.filters.Transfer(null, account);
    const filterFrom = tokenContract.filters.Transfer(account, null);
    tokenContract.on(filterTo, loadERC20TokenAccountData);
    tokenContract.on(filterFrom, loadERC20TokenAccountData);
    return () => {
      tokenContract.off(filterTo, loadERC20TokenAccountData);
      tokenContract.off(filterFrom, loadERC20TokenAccountData);
    };
  }, [votesTokenContractAddress, account, onMount, loadERC20TokenAccountData, baseContracts]);

  return { loadERC20Token, loadUnderlyingERC20Token, loadERC20TokenAccountData };
};
