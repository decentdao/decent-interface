import { useCallback, useEffect, useRef } from 'react';
import { Address, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
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
  const publicClient = usePublicClient();

  const loadERC20Token = useCallback(async () => {
    if (!votesTokenContractAddress || !baseContracts || !publicClient) {
      return;
    }
    const tokenContract = getContract({
      address: votesTokenContractAddress,
      abi: baseContracts.votesTokenMasterCopyContract.asPublic.abi,
      client: publicClient,
    });
    const [tokenName, tokenSymbol, tokenDecimals, totalSupply] = await Promise.all([
      tokenContract.read.name([]),
      tokenContract.read.symbol([]),
      tokenContract.read.decimals([]),
      (await tokenContract.read.totalSupply([])) as bigint,
    ]);
    const tokenData = {
      name: tokenName as string,
      symbol: tokenSymbol as string,
      decimals: Number(tokenDecimals as bigint),
      address: votesTokenContractAddress,
      totalSupply,
    };
    isTokenLoaded.current = true;
    action.dispatch({ type: FractalGovernanceAction.SET_TOKEN_DATA, payload: tokenData });
  }, [votesTokenContractAddress, action, baseContracts, publicClient]);

  const loadUnderlyingERC20Token = useCallback(async () => {
    if (!underlyingTokenAddress || !baseContracts || !publicClient) {
      return;
    }
    const tokenContract = getContract({
      address: underlyingTokenAddress,
      abi: baseContracts.votesTokenMasterCopyContract.asPublic.abi,
      client: publicClient,
    });

    const [tokenName, tokenSymbol] = await Promise.all([
      tokenContract.read.name([]),
      tokenContract.read.symbol([]),
    ]);
    const tokenData = {
      name: tokenName as string,
      symbol: tokenSymbol as string,
      address: underlyingTokenAddress,
    };
    action.dispatch({
      type: FractalGovernanceAction.SET_UNDERLYING_TOKEN_DATA,
      payload: tokenData,
    });
  }, [underlyingTokenAddress, action, baseContracts, publicClient]);

  const loadERC20TokenAccountData = useCallback(async () => {
    if (!votesTokenContractAddress || !account || !baseContracts || !publicClient) {
      action.dispatch({ type: FractalGovernanceAction.RESET_TOKEN_ACCOUNT_DATA });
      return;
    }
    const tokenContract = getContract({
      address: votesTokenContractAddress,
      abi: baseContracts.votesTokenMasterCopyContract.asPublic.abi,
      client: publicClient,
    });
    // @todo We could probably save on some requests here.
    const [tokenBalance, tokenDelegatee, tokenVotingWeight] = await Promise.all([
      (await tokenContract.read.balanceOf([account])) as bigint,
      tokenContract.read.delegates([account]),
      await tokenContract.read.getVotes([account]),
    ]);

    let delegateChangeEvents = [];
    try {
      delegateChangeEvents = await tokenContract.getEvents.DelegateChanged();
    } catch (e) {
      delegateChangeEvents = [];
    }

    const tokenAccountData = {
      balance: tokenBalance,
      delegatee: tokenDelegatee as Address,
      votingWeight: tokenVotingWeight as bigint,
      isDelegatesSet: delegateChangeEvents.length > 0,
    };

    action.dispatch({
      type: FractalGovernanceAction.SET_TOKEN_ACCOUNT_DATA,
      payload: tokenAccountData,
    });
  }, [votesTokenContractAddress, action, account, baseContracts, publicClient]);

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

  return { loadERC20Token, loadUnderlyingERC20Token, loadERC20TokenAccountData };
};
