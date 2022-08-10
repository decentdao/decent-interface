import { useState, useEffect, useCallback, useMemo, useReducer } from 'react';
import { BigNumber } from 'ethers';
import { GovernorModule, VotesToken } from '../../../assets/typechain-types/module-governor';
import { ClaimSubsidiary } from '../../../assets/typechain-types/votes-token';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import {
  TransferListener,
  DelegateChangedListener,
  DelegateVotesChangedListener,
  ClaimListener,
} from '../types';

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

interface IGoveranceTokenData {
  name: string | undefined;
  symbol: string | undefined;
  decimals: number | undefined;
  address: string | undefined;
  userBalance: BigNumber | undefined;
  delegatee: string | undefined;
  votingWeight: BigNumber | undefined;
  proposalTokenThreshold: BigNumber | undefined;
}

const initialState = {
  name: undefined,
  symbol: undefined,
  decimals: undefined,
  address: undefined,
  userBalance: undefined,
  delegatee: undefined,
  votingWeight: undefined,
  proposalTokenThreshold: undefined,
};

enum TokenActions {
  UPDATE_TOKEN,
  UPDATE_DELEGATEE,
  UPDATE_VOTING_WEIGHT,
  UPDATE_ACCOUNT,
  UPDATE_PROPOSAL_THRESHOLD,
  RESET,
}
type TokenAction =
  | { type: TokenActions.UPDATE_TOKEN; payload: ITokenData }
  | { type: TokenActions.UPDATE_ACCOUNT; payload: ITokenAccount }
  | { type: TokenActions.UPDATE_DELEGATEE; payload: string }
  | { type: TokenActions.UPDATE_VOTING_WEIGHT; payload: BigNumber }
  | { type: TokenActions.UPDATE_PROPOSAL_THRESHOLD; payload: BigNumber }
  | { type: TokenActions.RESET };

const reducer = (state: IGoveranceTokenData, action: TokenAction) => {
  switch (action.type) {
    case TokenActions.UPDATE_TOKEN:
      const { name, symbol, decimals, address } = action.payload;
      return { ...state, name, symbol, decimals, address };
    case TokenActions.UPDATE_ACCOUNT:
      const { userBalance, delegatee, votingWeight } = action.payload;
      return { ...state, userBalance, delegatee, votingWeight };
    case TokenActions.UPDATE_DELEGATEE:
      return { ...state, delegatee: action.payload };
    case TokenActions.UPDATE_VOTING_WEIGHT:
      return { ...state, votingWeight: action.payload };
    case TokenActions.UPDATE_VOTING_WEIGHT:
      return { ...initialState };
    case TokenActions.UPDATE_PROPOSAL_THRESHOLD:
      return { ...state, proposalTokenThreshold: action.payload };
  }
  return state;
};

const useTokenData = (
  governorModule: GovernorModule | undefined,
  tokenContract: VotesToken | undefined,
  claimContract: ClaimSubsidiary | undefined
) => {
  const {
    state: { account },
  } = useWeb3Provider();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [userClaimAmount, setTokenClaimAmount] = useState<BigNumber>();

  // get token data
  useEffect(() => {
    if (!tokenContract) {
      return;
    }
    (async () => {
      const tokenName = await tokenContract.name();
      const tokenSymbol = await tokenContract.symbol();
      const tokenDecimals = await tokenContract.decimals();
      const tokenAddress = tokenContract.address;
      dispatch({
        type: TokenActions.UPDATE_TOKEN,
        payload: {
          name: tokenName,
          symbol: tokenSymbol,
          decimals: tokenDecimals,
          address: tokenAddress,
        },
      });
    })();
  }, [tokenContract]);

  const getTokenAccount = useCallback(async () => {
    if (!tokenContract || !account) {
      return;
    }
    const tokenBalance = await tokenContract.balanceOf(account);
    const tokenDelegatee = await tokenContract.delegates(account);
    const tokenVotingWeight = await tokenContract.getVotes(account);
    dispatch({
      type: TokenActions.UPDATE_ACCOUNT,
      payload: {
        userBalance: tokenBalance,
        delegatee: tokenDelegatee,
        votingWeight: tokenVotingWeight,
      },
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
      dispatch({ type: TokenActions.UPDATE_DELEGATEE, payload: toDelegate });
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
      dispatch({ type: TokenActions.UPDATE_VOTING_WEIGHT, payload: currentBalance });
    };

    tokenContract.on(filter, callback);

    return () => {
      tokenContract.off(filter, callback);
    };
  }, [account, tokenContract]);

  const getProposalTokenThreshold = useCallback(async () => {
    if (!governorModule) {
      return;
    }
    const proposalThreshold = await governorModule.proposalThreshold();
    dispatch({ type: TokenActions.UPDATE_PROPOSAL_THRESHOLD, payload: proposalThreshold });
  }, [governorModule]);

  useEffect(() => {
    getProposalTokenThreshold();
  }, [getProposalTokenThreshold]);

  const data = useMemo(
    () => ({
      userClaimAmount,
      ...state,
    }),
    [state, userClaimAmount]
  );
  return data;
};

export default useTokenData;
