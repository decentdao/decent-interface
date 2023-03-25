import { VotesToken } from '@fractal-framework/fractal-contracts';
import { useCallback, useEffect, useRef } from 'react';
import { useAccount, useProvider } from 'wagmi';
import { getEventRPC } from '../../../../helpers';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
export const useERC20LinearToken = () => {
  const isTokenLoaded = useRef(false);
  const {
    governanceContracts: { tokenContract },
    dispatch,
  } = useFractal();

  const {
    network: { chainId },
  } = useProvider();

  const { address: account } = useAccount();

  const loadERC20Token = useCallback(async () => {
    if (!tokenContract) {
      return;
    }
    const tokenAddress = tokenContract.asSigner.address;

    const [tokenName, tokenSymbol, tokenDecimals, totalSupply] = await Promise.all([
      tokenContract.asSigner.name(),
      tokenContract.asSigner.symbol(),
      tokenContract.asSigner.decimals(),
      tokenContract.asSigner.totalSupply(),
    ]);
    const tokenData = {
      name: tokenName,
      symbol: tokenSymbol,
      decimals: tokenDecimals,
      address: tokenAddress,
      totalSupply,
    };
    isTokenLoaded.current = true;
    dispatch.governance({ type: FractalGovernanceAction.SET_TOKEN_DATA, payload: tokenData });
  }, [tokenContract, dispatch]);

  const loadERC20TokenAccountData = useCallback(async () => {
    if (!isTokenLoaded.current) {
      return;
    }
    if (!tokenContract || !account) {
      dispatch.governance({ type: FractalGovernanceAction.RESET_TOKEN_ACCOUNT_DATA });
      return;
    }

    const [tokenBalance, tokenDelegatee, tokenVotingWeight, delegateChangeEvents] =
      await Promise.all([
        tokenContract.asSigner.balanceOf(account),
        tokenContract.asSigner.delegates(account),
        tokenContract.asSigner.getVotes(account),
        tokenContract.asSigner.queryFilter(tokenContract.asSigner.filters.DelegateChanged()),
      ]);
    const tokenAccountData = {
      balance: tokenBalance,
      delegatee: tokenDelegatee,
      votingWeight: tokenVotingWeight,
      isDelegatesSet: delegateChangeEvents.length > 0,
    };
    dispatch.governance({
      type: FractalGovernanceAction.SET_TOKEN_ACCOUNT_DATA,
      payload: tokenAccountData,
    });
  }, [tokenContract, dispatch, account]);

  useEffect(() => {
    loadERC20TokenAccountData();
  }, [account, loadERC20TokenAccountData]);

  useEffect(() => {
    if (!tokenContract) {
      return;
    }
    const rpc = getEventRPC<VotesToken>(tokenContract, chainId);
    const filter = rpc.filters.DelegateChanged();
    rpc.on(filter, loadERC20TokenAccountData);
    return () => {
      rpc.off(filter, loadERC20TokenAccountData);
    };
  }, [tokenContract, chainId, loadERC20TokenAccountData]);

  useEffect(() => {
    if (!tokenContract) {
      return;
    }
    const rpc = getEventRPC<VotesToken>(tokenContract, chainId);
    const filter = rpc.filters.DelegateVotesChanged();
    rpc.on(filter, loadERC20TokenAccountData);
    return () => {
      rpc.off(filter, loadERC20TokenAccountData);
    };
  }, [tokenContract, chainId, loadERC20TokenAccountData]);

  useEffect(() => {
    if (!tokenContract || !account) {
      return;
    }
    const rpc = getEventRPC<VotesToken>(tokenContract, chainId);
    const filterTo = rpc.filters.Transfer(null, account);
    const filterFrom = rpc.filters.Transfer(account, null);
    rpc.on(filterTo, loadERC20TokenAccountData);
    rpc.on(filterFrom, loadERC20TokenAccountData);
    return () => {
      rpc.off(filterTo, loadERC20TokenAccountData);
      rpc.off(filterFrom, loadERC20TokenAccountData);
    };
  }, [tokenContract, chainId, account, loadERC20TokenAccountData]);

  return loadERC20Token;
};
