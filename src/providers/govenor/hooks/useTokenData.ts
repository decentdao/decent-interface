import { useState, useEffect, useCallback, useMemo } from 'react';
import { BigNumber } from 'ethers';
import { VotesToken } from '../../../assets/typechain-types/module-governor';
import { ClaimSubsidiary } from '../../../assets/typechain-types/votes-token';
import { ClaimListener } from '../../../contexts/daoData/types';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { TransferListener, DelegateChangedListener, DelegateVotesChangedListener } from '../types';

interface ITokenData {
  name: string | undefined;
  symbol: string | undefined;
  decimals: number | undefined;
  address: string | undefined;
}

interface ITokenAccount {
  userBalance: BigNumber | undefined;
  delegatee: string | undefined;
  votingWeight: BigNumber | undefined;
}
const useTokenData = (
  tokenContract: VotesToken | undefined,
  claimContract: ClaimSubsidiary | undefined
) => {
  const {
    state: { account },
  } = useWeb3Provider();
  const [tokenData, setTokenData] = useState<ITokenData>({} as ITokenData);
  const [tokenAccount, setTokenAccount] = useState<ITokenAccount>({} as ITokenAccount);
  const [userClaimAmount, setTokenClaimAmount] = useState<BigNumber>();

  // get token data
  useEffect(() => {
    if (!tokenContract) {
      setTokenData({} as ITokenData);
      return;
    }
    (async () => {
      const tokenName = await tokenContract.name();
      const tokenSymbol = await tokenContract.symbol();
      const tokenDecimals = await tokenContract.decimals();
      const tokenAddress = tokenContract.address;
      setTokenData({
        name: tokenName,
        symbol: tokenSymbol,
        decimals: tokenDecimals,
        address: tokenAddress,
      });
    })();
  }, [tokenContract]);

  const getTokenAccount = useCallback(async () => {
    if (!tokenContract || !account) {
      setTokenAccount({} as ITokenAccount);
      return;
    }
    const tokenBalance = await tokenContract.balanceOf(account);
    const tokenDelegatee = await tokenContract.delegates(account);
    const tokenVotingWeight = await tokenContract.getVotes(account);
    setTokenAccount({
      userBalance: tokenBalance,
      delegatee: tokenDelegatee,
      votingWeight: tokenVotingWeight,
    });
  }, [tokenContract, account]);

  // get token account data
  useEffect(() => {
    getTokenAccount();
  }, [getTokenAccount]);

  // Get initial user claim amount
  useEffect(() => {
    if (!claimContract || !account) {
      setTokenClaimAmount(undefined);
      return;
    }
    claimContract.calculateClaimAmount(account).then(setTokenClaimAmount).catch(console.error);
  }, [claimContract, account]);

  // Setup token transfer events listener
  useEffect(() => {
    if (tokenContract === undefined || !account) {
      setTokenAccount({} as ITokenAccount);
      return;
    }

    const filterTransferTo = tokenContract.filters.Transfer(null, account);
    const filterTransferFrom = tokenContract.filters.Transfer(account, null);

    const listenerCallback: TransferListener = () => {
      getTokenAccount();
    };

    tokenContract.on(filterTransferTo, listenerCallback);
    tokenContract.on(filterTransferFrom, listenerCallback);

    return () => {
      tokenContract.off(filterTransferTo, listenerCallback);
      tokenContract.off(filterTransferFrom, listenerCallback);
    };
  }, [account, tokenContract, getTokenAccount]);

  // Setup token claim events listener
  useEffect(() => {
    if (claimContract === undefined || tokenContract === undefined || !account) {
      setTokenClaimAmount(undefined);
      return;
    }

    const filter = claimContract.filters.SnapClaimed(null, tokenContract.address, account, null);

    const listenerCallback: ClaimListener = () => {
      setTokenClaimAmount(BigNumber.from('0'));
    };

    claimContract.on(filter, listenerCallback);

    return () => {
      claimContract.off(filter, listenerCallback);
    };
  }, [account, tokenContract, claimContract]);

  // Setup token delegate changed events listener
  useEffect(() => {
    if (tokenContract === undefined || !account) {
      return;
    }

    const filter = tokenContract.filters.DelegateChanged(account);

    const listenerCallback: DelegateChangedListener = (
      _delegator: string,
      _fromDelegate: string,
      toDelegate: string
    ) => {
      setTokenAccount(tokenAcc => ({ ...tokenAcc, tokenDelegatee: toDelegate }));
    };

    tokenContract.on(filter, listenerCallback);

    return () => {
      tokenContract.off(filter, listenerCallback);
    };
  }, [account, tokenContract, getTokenAccount]);

  // Setup listeners for when voting weight increases or decreases
  useEffect(() => {
    if (!tokenContract || !account) {
      return;
    }

    const filter = tokenContract.filters.DelegateVotesChanged(account);

    const callback: DelegateVotesChangedListener = (
      _delegate: string,
      _previousBalance: BigNumber,
      currentBalance: BigNumber
    ) => {
      setTokenAccount(tokenAcc => ({ ...tokenAcc, tokenVotingWeight: currentBalance }));
    };

    tokenContract.on(filter, callback);

    return () => {
      tokenContract.off(filter, callback);
    };
  }, [account, tokenContract]);

  const data = useMemo(
    () => ({
      userClaimAmount,
      ...tokenAccount,
      ...tokenData,
    }),
    [tokenAccount, userClaimAmount, tokenData]
  );
  return data;
};

export default useTokenData;
