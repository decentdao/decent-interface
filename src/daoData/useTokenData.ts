import { useState, useEffect, useCallback } from "react";
import { VotesTokenWithSupply } from "../typechain-types";
import { useWeb3 } from "../web3";
import { BigNumber, ethers } from "ethers";

const useTokenData = (tokenContract: VotesTokenWithSupply | undefined) => {
  const { account } = useWeb3();
  const [tokenName, setTokenName] = useState<string>();
  const [tokenSymbol, setTokenSymbol] = useState<string>();
  const [tokenDecimals, setTokenDecimals] = useState<number>();
  const [tokenBalance, setTokenBalance] = useState<number>();
  const [tokenDelegatee, setTokenDelegatee] = useState<string>();

  const updateTokenBalance = useCallback(() => {
    if (tokenContract === undefined || account === undefined) {
      setTokenBalance(undefined);
      return;
    }

    tokenContract
      .balanceOf(account)
      .then((balance) =>
        setTokenBalance(
          Number(ethers.utils.formatUnits(balance, tokenDecimals))
        )
      )
      .catch(console.error);
  }, [account, tokenContract, tokenDecimals]);

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

  return { 
    name: tokenName,
    symbol: tokenSymbol,
    decimals: tokenDecimals,
    userBalance: tokenBalance, 
    delegatee: tokenDelegatee
  };
};

export default useTokenData;
