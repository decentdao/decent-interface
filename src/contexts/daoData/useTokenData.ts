import { useState, useEffect, useCallback } from "react";
import { VotesTokenWithSupply } from "../../typechain-types";
import { useWeb3 } from "../web3Data";
import { BigNumber } from "ethers";

const useTokenData = (tokenContract: VotesTokenWithSupply | undefined) => {
  const [{ account }] = useWeb3();
  const [tokenName, setTokenName] = useState<string>();
  const [tokenSymbol, setTokenSymbol] = useState<string>();
  const [tokenDecimals, setTokenDecimals] = useState<number>();
  const [tokenBalance, setTokenBalance] = useState<BigNumber>();
  const [tokenDelegatee, setTokenDelegatee] = useState<string>();
  const [tokenVotingWeight, setTokenVotingWeight] = useState<BigNumber>();
  const [tokenAddress, setTokenAddress] = useState<string>();

  const updateTokenBalance = useCallback(() => {
    if (tokenContract === undefined || account === undefined) {
      setTokenBalance(undefined);
      return;
    }

    tokenContract.balanceOf(account).then(setTokenBalance).catch(console.error);
  }, [account, tokenContract]);

  // Get token name
  useEffect(() => {
    if (tokenContract === undefined) {
      setTokenName(undefined);
      return;
    }

    tokenContract
      .name()
      .then((name) => setTokenName(name))
      .catch(console.error);
  }, [tokenContract]);

  // Get token symbol
  useEffect(() => {
    if (tokenContract === undefined) {
      setTokenSymbol(undefined);
      return;
    }

    tokenContract
      .symbol()
      .then((symbol) => setTokenSymbol(symbol))
      .catch(console.error);
  }, [tokenContract]);

  // Get token decimals
  useEffect(() => {
    if (tokenContract === undefined) {
      setTokenDecimals(undefined);
      return;
    }

    tokenContract
      .decimals()
      .then((decimals) => setTokenDecimals(decimals))
      .catch(console.error);
  }, [tokenContract]);

  // Get initial user token balance
  useEffect(() => {
    updateTokenBalance();
  }, [account, tokenContract, updateTokenBalance]);

  // Get initial user token delegatee
  useEffect(() => {
    if (tokenContract === undefined || account === undefined) {
      setTokenDelegatee(undefined);
      return;
    }

    tokenContract
      .delegates(account)
      .then((delegatee) => setTokenDelegatee(delegatee))
      .catch(console.error);
  }, [tokenContract, account]);

  // Setup token transfer events listener
  useEffect(() => {
    if (tokenContract === undefined || account === undefined) {
      setTokenBalance(undefined);
      return;
    }

    const filterTransferTo = tokenContract.filters.Transfer(null, account);
    const filterTransferFrom = tokenContract.filters.Transfer(account, null);

    const listenerCallback = (
      _from: string,
      _to: string,
      _value: BigNumber,
      _: any
    ) => {
      updateTokenBalance();
    };

    tokenContract.on(filterTransferTo, listenerCallback);
    tokenContract.on(filterTransferFrom, listenerCallback);

    return () => {
      tokenContract.off(filterTransferTo, listenerCallback);
      tokenContract.off(filterTransferFrom, listenerCallback);
    };
  }, [account, tokenContract, updateTokenBalance]);

  // Setup token delegate changed events listener
  useEffect(() => {
    if (tokenContract === undefined || account === undefined) {
      setTokenDelegatee(undefined);
      return;
    }

    const filter = tokenContract.filters.DelegateChanged(account);

    const listenerCallback = (
      delegator: string,
      fromDelegate: string,
      toDelegate: string,
      _: any
    ) => {
      setTokenDelegatee(toDelegate);
    };

    tokenContract.on(filter, listenerCallback);

    return () => {
      tokenContract.off(filter, listenerCallback);
    };
  }, [account, tokenContract, updateTokenBalance]);

  // Get initial token delegation weight
  useEffect(() => {
    if (!tokenContract || !account) {
      setTokenVotingWeight(undefined);
      return;
    }

    tokenContract
      .getVotes(account)
      .then(setTokenVotingWeight)
      .catch(console.error);
  }, [account, tokenContract]);

  // Setup listeners for when voting weight increases or decreases
  useEffect(() => {
    if (!tokenContract || !account) {
      setTokenVotingWeight(undefined);
      return;
    }

    const filter = tokenContract.filters.DelegateVotesChanged(account);

    const callback = (
      _delegate: string,
      _previousBalance: BigNumber,
      currentBalance: BigNumber,
      _: any
    ) => {
      setTokenVotingWeight(currentBalance);
    };

    tokenContract.on(filter, callback);

    return () => {
      tokenContract.off(filter, callback);
    };
  }, [account, tokenContract]);

  // Get token address
  useEffect(() => {
    if (tokenContract === undefined) {
      setTokenAddress(undefined);
      return;
    }

    setTokenAddress(tokenContract.address);
  }, [tokenContract]);

  return {
    name: tokenName,
    symbol: tokenSymbol,
    decimals: tokenDecimals,
    userBalance: tokenBalance,
    delegatee: tokenDelegatee,
    votingWeight: tokenVotingWeight,
    address: tokenAddress,
  };
};

export default useTokenData;
