import { useCallback, useEffect, useMemo, useRef } from 'react';
import { getAddress, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import VotesERC20Abi from '../../../../assets/abi/VotesERC20';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';

export const useERC20LinearToken = ({ onMount = true }: { onMount?: boolean }) => {
  const isTokenLoaded = useRef(false);
  const tokenAccount = useRef<string>();

  const {
    governanceContracts: { votesTokenAddress, underlyingTokenAddress },
    action,
    readOnly: { user },
  } = useFractal();
  const account = user.address;
  const publicClient = usePublicClient();

  const tokenContract = useMemo(() => {
    if (!votesTokenAddress || !publicClient) {
      return;
    }

    return getContract({
      abi: VotesERC20Abi,
      address: votesTokenAddress,
      client: publicClient,
    });
  }, [publicClient, votesTokenAddress]);

  const underlyingTokenContract = useMemo(() => {
    if (!underlyingTokenAddress || !publicClient) {
      return;
    }

    return getContract({
      abi: VotesERC20Abi,
      address: underlyingTokenAddress,
      client: publicClient,
    });
  }, [publicClient, underlyingTokenAddress]);

  const loadERC20Token = useCallback(async () => {
    if (!tokenContract) {
      return;
    }

    const [tokenName, tokenSymbol, tokenDecimals, totalSupply] = await Promise.all([
      tokenContract.read.name(),
      tokenContract.read.symbol(),
      tokenContract.read.decimals(),
      await tokenContract.read.totalSupply(),
    ]);
    const tokenData = {
      name: tokenName,
      symbol: tokenSymbol,
      decimals: tokenDecimals,
      address: tokenContract.address,
      totalSupply,
    };
    isTokenLoaded.current = true;
    action.dispatch({ type: FractalGovernanceAction.SET_TOKEN_DATA, payload: tokenData });
  }, [tokenContract, action]);

  const loadUnderlyingERC20Token = useCallback(async () => {
    if (!underlyingTokenContract) {
      return;
    }

    const [tokenName, tokenSymbol] = await Promise.all([
      underlyingTokenContract.read.name(),
      underlyingTokenContract.read.symbol(),
    ]);
    const tokenData = {
      name: tokenName,
      symbol: tokenSymbol,
      address: underlyingTokenContract.address,
    };
    action.dispatch({
      type: FractalGovernanceAction.SET_UNDERLYING_TOKEN_DATA,
      payload: tokenData,
    });
  }, [underlyingTokenContract, action]);

  const loadERC20TokenAccountData = useCallback(async () => {
    if (!account || !tokenContract) {
      action.dispatch({ type: FractalGovernanceAction.RESET_TOKEN_ACCOUNT_DATA });
      return;
    }

    const [tokenBalance, tokenDelegatee, tokenVotingWeight] = await Promise.all([
      tokenContract.read.balanceOf([getAddress(account)]),
      tokenContract.read.delegates([getAddress(account)]),
      tokenContract.read.getVotes([getAddress(account)]),
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
  }, [account, tokenContract, action]);

  useEffect(() => {
    if (
      votesTokenAddress &&
      isTokenLoaded.current &&
      tokenAccount.current !== account + votesTokenAddress &&
      onMount
    ) {
      tokenAccount.current = account + votesTokenAddress;
      loadERC20TokenAccountData();
    }
  }, [account, votesTokenAddress, onMount, loadERC20TokenAccountData]);

  useEffect(() => {
    if (!onMount || !tokenContract || !account) {
      return;
    }

    const unwatch = tokenContract.watchEvent.DelegateVotesChanged(
      { delegate: getAddress(account) },
      { onLogs: loadERC20TokenAccountData },
    );

    return () => {
      unwatch();
    };
  }, [loadERC20TokenAccountData, onMount, tokenContract, account]);

  useEffect(() => {
    if (!tokenContract || !onMount || !account) {
      return;
    }

    const unwatchDelegator = tokenContract.watchEvent.DelegateChanged(
      { delegator: getAddress(account) },
      { onLogs: loadERC20TokenAccountData },
    );
    const unwatchFromDelegate = tokenContract.watchEvent.DelegateChanged(
      { fromDelegate: getAddress(account) },
      { onLogs: loadERC20TokenAccountData },
    );
    const unwatchToDelegate = tokenContract.watchEvent.DelegateChanged(
      { toDelegate: getAddress(account) },
      { onLogs: loadERC20TokenAccountData },
    );

    return () => {
      unwatchDelegator();
      unwatchFromDelegate();
      unwatchToDelegate();
    };
  }, [account, loadERC20TokenAccountData, onMount, tokenContract]);

  useEffect(() => {
    if (!onMount || !account || !tokenContract) {
      return;
    }

    const unwatchTo = tokenContract.watchEvent.Transfer(
      { from: getAddress(account) },
      { onLogs: loadERC20TokenAccountData },
    );
    const unwatchFrom = tokenContract.watchEvent.Transfer(
      { to: getAddress(account) },
      { onLogs: loadERC20TokenAccountData },
    );

    return () => {
      unwatchTo();
      unwatchFrom();
    };
  }, [account, loadERC20TokenAccountData, onMount, tokenContract]);

  return { loadERC20Token, loadUnderlyingERC20Token, loadERC20TokenAccountData };
};
