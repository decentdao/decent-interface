import { VotesToken } from '@fractal-framework/fractal-contracts';
import { BigNumber } from 'ethers';
import { useReducer, useMemo, useEffect, useCallback } from 'react';
import { useAccount, useProvider } from 'wagmi';
import { useTimeHelpers } from '../../../../hooks/utils/useTimeHelpers';
import { formatCoin } from '../../../../utils/numberFormats';
import {
  TransferListener,
  DelegateChangedListener,
  DelegateVotesChangedListener,
  GovernanceContracts,
} from '../../types';

interface ITokenData {
  name: string | undefined;
  symbol: string | undefined;
  decimals: number | undefined;
  address: string | undefined;
  totalSupply: BigNumber | undefined;
}

interface ITokenAccount {
  userBalance: BigNumber | undefined;
  userBalanceString: string | undefined;
  delegatee: string | undefined;
  votingWeight: BigNumber | undefined;
  votingWeightString: string | undefined;
  isDelegatesSet: boolean | undefined;
}

export interface IGoveranceTokenData extends ITokenData, ITokenAccount, VotingTokenConfig {
  isLoading?: boolean;
}

interface BNFormattedPair {
  value: BigNumber;
  formatted?: string;
}

export interface VotingTokenConfig {
  votingPeriod?: BNFormattedPair;
  quorumPercentage?: BNFormattedPair;
  timeLockPeriod?: BNFormattedPair;
}

const initialState = {
  name: undefined,
  symbol: undefined,
  decimals: undefined,
  address: undefined,
  totalSupply: undefined,
  userBalance: undefined,
  userBalanceString: undefined,
  delegatee: undefined,
  votingWeight: undefined,
  votingWeightString: undefined,
  isDelegatesSet: undefined,
  tokenContract: undefined,
  votingPeriod: undefined,
  quorumPercentage: undefined,
  timeLockPeriod: undefined,
};

enum TokenActions {
  UPDATE_TOKEN,
  UPDATE_DELEGATEE,
  UPDATE_VOTING_WEIGHTS,
  UPDATE_ACCOUNT,
  UPDATE_VOTING_CONTRACT,
  UPDATE_TOKEN_CONTRACT,
  RESET,
}
type TokenAction =
  | { type: TokenActions.UPDATE_TOKEN; payload: ITokenData }
  | { type: TokenActions.UPDATE_ACCOUNT; payload: ITokenAccount }
  | { type: TokenActions.UPDATE_DELEGATEE; payload: string }
  | {
      type: TokenActions.UPDATE_VOTING_WEIGHTS;
      payload: { votingWeight: BigNumber; votingWeightString: string };
    }
  | {
      type: TokenActions.UPDATE_VOTING_CONTRACT;
      payload: {
        votingPeriod: BNFormattedPair;
        quorumPercentage: BNFormattedPair;
        timeLockPeriod: BNFormattedPair;
      };
    }
  | { type: TokenActions.UPDATE_TOKEN_CONTRACT; payload: VotesToken }
  | { type: TokenActions.RESET };

const reducer = (state: IGoveranceTokenData, action: TokenAction) => {
  switch (action.type) {
    case TokenActions.UPDATE_TOKEN:
      const { name, symbol, decimals, address, totalSupply } = action.payload;
      return { ...state, name, symbol, decimals, address, totalSupply };
    case TokenActions.UPDATE_ACCOUNT:
      const {
        userBalance,
        userBalanceString,
        delegatee,
        votingWeight,
        votingWeightString,
        isDelegatesSet,
      } = action.payload;
      return {
        ...state,
        userBalance,
        userBalanceString,
        delegatee,
        votingWeight,
        votingWeightString,
        isDelegatesSet,
      };
    case TokenActions.UPDATE_DELEGATEE:
      return { ...state, delegatee: action.payload };
    case TokenActions.UPDATE_VOTING_WEIGHTS:
      return {
        ...state,
        votingWeight: action.payload.votingWeight,
        votingWeightString: action.payload.votingWeightString,
      };
    case TokenActions.UPDATE_VOTING_CONTRACT:
      return { ...state, ...action.payload, isLoading: false };
    case TokenActions.UPDATE_TOKEN_CONTRACT:
      return { ...state, tokenContract: action.payload, isLoading: false };
    case TokenActions.RESET:
      return { ...initialState };
  }
};

const useTokenData = ({ ozLinearVotingContract, tokenContract }: GovernanceContracts) => {
  const provider = useProvider();
  const { address } = useAccount();

  const { getTimeDuration } = useTimeHelpers();

  const [state, dispatch] = useReducer(reducer, initialState);

  // dispatch voting contract
  useEffect(() => {
    if (!ozLinearVotingContract || !provider) {
      dispatch({
        type: TokenActions.RESET,
      });
      return;
    }

    (async () => {
      // @todo handle errors
      const votingPeriod = await ozLinearVotingContract.votingPeriod();
      const quorumPercentage = await ozLinearVotingContract.quorumNumerator();
      const timeLockPeriod = await ozLinearVotingContract.timeLockPeriod();
      dispatch({
        type: TokenActions.UPDATE_VOTING_CONTRACT,
        payload: {
          votingPeriod: {
            value: votingPeriod,
            formatted: getTimeDuration(votingPeriod.toString()),
          },
          quorumPercentage: {
            value: quorumPercentage,
            formatted: quorumPercentage.toString() + '%',
          },
          timeLockPeriod: {
            value: timeLockPeriod,
            formatted: getTimeDuration(timeLockPeriod.toString()),
          },
        },
      });
    })();
  }, [ozLinearVotingContract, provider, getTimeDuration]);

  // dispatch token contract
  useEffect(() => {
    if (!tokenContract) {
      return;
    }

    dispatch({
      type: TokenActions.UPDATE_TOKEN_CONTRACT,
      payload: tokenContract,
    });
  }, [tokenContract]);

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
      const totalSupply = await tokenContract.totalSupply();
      dispatch({
        type: TokenActions.UPDATE_TOKEN,
        payload: {
          name: tokenName,
          symbol: tokenSymbol,
          decimals: tokenDecimals,
          address: tokenAddress,
          totalSupply,
        },
      });
    })();
  }, [tokenContract]);

  const getTokenAccount = useCallback(async () => {
    if (!tokenContract || !address) {
      return;
    }

    const tokenBalance = await tokenContract.balanceOf(address);
    const tokenDelegatee = await tokenContract.delegates(address);
    const tokenVotingWeight = await tokenContract.getVotes(address);

    const isDelegatesSet = !!(
      await tokenContract.queryFilter(tokenContract.filters.DelegateChanged())
    ).length;

    dispatch({
      type: TokenActions.UPDATE_ACCOUNT,
      payload: {
        userBalance: tokenBalance,
        userBalanceString: formatCoin(tokenBalance, false, state.decimals, state.symbol),
        delegatee: tokenDelegatee,
        votingWeight: tokenVotingWeight,
        votingWeightString: formatCoin(tokenVotingWeight, false, state.decimals, state.symbol),
        isDelegatesSet,
      },
    });
  }, [tokenContract, address, state.decimals, state.symbol]);

  // get token account data
  useEffect(() => {
    getTokenAccount();
  }, [getTokenAccount]);

  // Setup token transfer events listener
  useEffect(() => {
    if (tokenContract === undefined || !address) {
      return;
    }

    const filterTransferTo = tokenContract.filters.Transfer(null, address);
    const filterTransferFrom = tokenContract.filters.Transfer(address, null);

    const listenerCallback: TransferListener = () => {
      getTokenAccount();
    };

    tokenContract.on(filterTransferTo, listenerCallback);
    tokenContract.on(filterTransferFrom, listenerCallback);

    return () => {
      tokenContract.off(filterTransferTo, listenerCallback);
      tokenContract.off(filterTransferFrom, listenerCallback);
    };
  }, [address, getTokenAccount, tokenContract]);

  // Setup token delegate changed events listener
  useEffect(() => {
    if (tokenContract === undefined || !address) {
      return;
    }

    const filter = tokenContract.filters.DelegateChanged(address);

    const listenerCallback: DelegateChangedListener = (
      _delegator: string,
      _fromDelegate: string,
      toDelegate: string
    ) => {
      dispatch({
        type: TokenActions.UPDATE_DELEGATEE,
        payload: toDelegate,
      });
    };

    tokenContract.on(filter, listenerCallback);

    return () => {
      tokenContract.off(filter, listenerCallback);
    };
  }, [address, getTokenAccount, tokenContract]);

  // Setup listeners for when voting weight increases or decreases
  useEffect(() => {
    if (!tokenContract || !address) {
      return;
    }

    const filter = tokenContract.filters.DelegateVotesChanged(address);

    const callback: DelegateVotesChangedListener = (
      _delegate: string,
      _previousBalance: BigNumber,
      currentBalance: BigNumber
    ) => {
      dispatch({
        type: TokenActions.UPDATE_VOTING_WEIGHTS,
        payload: {
          votingWeight: currentBalance,
          votingWeightString: formatCoin(currentBalance, true, state.decimals, state.symbol),
        },
      });
    };

    tokenContract.on(filter, callback);

    return () => {
      tokenContract.off(filter, callback);
    };
  }, [address, state.decimals, state.symbol, tokenContract]);

  const data = useMemo(() => state, [state]);
  return data;
};

export default useTokenData;
