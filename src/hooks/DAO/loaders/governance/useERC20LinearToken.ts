import { abis } from '@fractal-framework/fractal-contracts';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { getContract } from 'viem';
import { usePublicClient } from 'wagmi';
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

  const underlyingTokenContract = useMemo(() => {
    if (!underlyingTokenAddress || !publicClient) {
      return;
    }

    return getContract({
      abi: abis.VotesERC20,
      address: underlyingTokenAddress,
      client: publicClient,
    });
  }, [publicClient, underlyingTokenAddress]);

  const loadERC20Token = useCallback(async () => {
    if (!votesTokenAddress || !publicClient) {
      return;
    }

    const tokenContract = getContract({
      abi: abis.VotesERC20,
      address: votesTokenAddress,
      client: publicClient,
    });

    const [tokenName, tokenSymbol, tokenDecimals, totalSupply] = await Promise.all([
      tokenContract.read.name(),
      tokenContract.read.symbol(),
      tokenContract.read.decimals(),
      tokenContract.read.totalSupply(),
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
  }, [action, publicClient, votesTokenAddress]);

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
    if (!account || !votesTokenAddress || !publicClient) {
      action.dispatch({ type: FractalGovernanceAction.RESET_TOKEN_ACCOUNT_DATA });
      return;
    }

    const tokenContract = getContract({
      abi: abis.VotesERC20,
      address: votesTokenAddress,
      client: publicClient,
    });

    const [tokenBalance, tokenDelegatee, tokenVotingWeight] = await Promise.all([
      tokenContract.read.balanceOf([account]),
      tokenContract.read.delegates([account]),
      tokenContract.read.getVotes([account]),
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
  }, [account, action, publicClient, votesTokenAddress]);

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
    if (!onMount || !account) {
      return;
    }

    if (!votesTokenAddress || !publicClient) {
      return;
    }

    const tokenContract = getContract({
      abi: abis.VotesERC20,
      address: votesTokenAddress,
      client: publicClient,
    });

    const unwatch = tokenContract.watchEvent.DelegateVotesChanged(
      { delegate: account },
      { onLogs: loadERC20TokenAccountData },
    );

    return () => {
      unwatch();
    };
  }, [loadERC20TokenAccountData, onMount, account, votesTokenAddress, publicClient]);

  useEffect(() => {
    if (!onMount || !account) {
      return;
    }

    if (!votesTokenAddress || !publicClient) {
      return;
    }

    const tokenContract = getContract({
      abi: abis.VotesERC20,
      address: votesTokenAddress,
      client: publicClient,
    });

    const unwatchDelegator = tokenContract.watchEvent.DelegateChanged(
      { delegator: account },
      { onLogs: loadERC20TokenAccountData },
    );
    const unwatchFromDelegate = tokenContract.watchEvent.DelegateChanged(
      { fromDelegate: account },
      { onLogs: loadERC20TokenAccountData },
    );
    const unwatchToDelegate = tokenContract.watchEvent.DelegateChanged(
      { toDelegate: account },
      { onLogs: loadERC20TokenAccountData },
    );

    return () => {
      unwatchDelegator();
      unwatchFromDelegate();
      unwatchToDelegate();
    };
  }, [account, loadERC20TokenAccountData, onMount, publicClient, votesTokenAddress]);

  useEffect(() => {
    if (!onMount || !account) {
      return;
    }

    if (!votesTokenAddress || !publicClient) {
      return;
    }

    const tokenContract = getContract({
      abi: abis.VotesERC20,
      address: votesTokenAddress,
      client: publicClient,
    });

    const unwatchTo = tokenContract.watchEvent.Transfer(
      { from: account },
      { onLogs: loadERC20TokenAccountData },
    );
    const unwatchFrom = tokenContract.watchEvent.Transfer(
      { to: account },
      { onLogs: loadERC20TokenAccountData },
    );

    return () => {
      unwatchTo();
      unwatchFrom();
    };
  }, [account, loadERC20TokenAccountData, onMount, publicClient, votesTokenAddress]);

  return { loadERC20Token, loadUnderlyingERC20Token, loadERC20TokenAccountData };
};
