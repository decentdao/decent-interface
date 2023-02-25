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

export interface VotingTokenConfig<Type = BNFormattedPair> {
  votingPeriod?: Type;
  quorumPercentage?: Type;
  timeLockPeriod?: Type;
}

export interface GovernanceTokenCache<DataType> {
  data: DataType;
  expires?: Date;
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
  | {
      type: TokenActions.UPDATE_ACCOUNT;
      payload: Omit<ITokenAccount, 'userBalanceString' | 'votingWeightString'>;
    }
  | { type: TokenActions.UPDATE_DELEGATEE; payload: string }
  | {
      type: TokenActions.UPDATE_VOTING_WEIGHTS;
      payload: { votingWeight: BigNumber };
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
    case TokenActions.UPDATE_ACCOUNT: {
      let userBalanceString: string | undefined;
      let votingWeightString: string | undefined;
      if (state.decimals) {
        userBalanceString = formatCoin(
          action.payload.userBalance!,
          false,
          state.decimals,
          state.symbol
        );
        votingWeightString = formatCoin(
          action.payload.votingWeight!,
          false,
          state.decimals,
          state.symbol
        );
      }

      return {
        ...state,
        ...action.payload,
        userBalanceString,
        votingWeightString,
      };
    }
    case TokenActions.UPDATE_DELEGATEE:
      return { ...state, delegatee: action.payload };
    case TokenActions.UPDATE_VOTING_WEIGHTS:
      let votingWeightString: string | undefined;
      if (state.decimals) {
        votingWeightString = formatCoin(
          action.payload.votingWeight!,
          false,
          state.decimals,
          state.symbol
        );
      }
      return {
        ...state,
        votingWeight: action.payload.votingWeight,
        votingWeightString,
      };
    case TokenActions.UPDATE_VOTING_CONTRACT: {
      return { ...state, ...action.payload, isLoading: false };
    }
    case TokenActions.UPDATE_TOKEN_CONTRACT:
      return { ...state, tokenContract: action.payload, isLoading: false };
    case TokenActions.RESET:
      return { ...initialState };
  }
};

const useTokenData = ({ ozLinearVotingContract, tokenContract }: GovernanceContracts) => {
  const provider = useProvider();
  const { address: account } = useAccount();

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
      const votingPeriod = await ozLinearVotingContract.asSigner.votingPeriod();
      const quorumPercentage = await ozLinearVotingContract.asSigner.quorumNumerator();
      const timeLockPeriod = await ozLinearVotingContract.asSigner.timeLockPeriod();
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

  // get token data
  useEffect(() => {
    if (!tokenContract) {
      return;
    }

    (async () => {
      const tokenName = await tokenContract.asSigner.name();
      const tokenSymbol = await tokenContract.asSigner.symbol();
      const tokenDecimals = await tokenContract.asSigner.decimals();
      const tokenAddress = tokenContract.asSigner.address;
      const totalSupply = await tokenContract.asSigner.totalSupply();
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
    if (!tokenContract || !account) {
      return;
    }

    const tokenBalance = await tokenContract.asSigner.balanceOf(account);
    const tokenDelegatee = await tokenContract.asSigner.delegates(account);
    const tokenVotingWeight = await tokenContract.asSigner.getVotes(account);
    const providerContract = tokenContract.asSigner.connect(provider);
    const isDelegatesSet = !!(
      await providerContract.queryFilter(providerContract.filters.DelegateChanged())
    ).length;

    dispatch({
      type: TokenActions.UPDATE_ACCOUNT,
      payload: {
        userBalance: tokenBalance,
        delegatee: tokenDelegatee,
        votingWeight: tokenVotingWeight,
        isDelegatesSet,
      },
    });
  }, [tokenContract, account, provider]);

  // get token account data
  useEffect(() => {
    getTokenAccount();
  }, [getTokenAccount]);

  // Setup token transfer events listener
  useEffect(() => {
    if (tokenContract === undefined || !account) {
      return;
    }

    const filterTransferTo = tokenContract.asSigner.filters.Transfer(null, account);
    const filterTransferFrom = tokenContract.asSigner.filters.Transfer(account, null);

    const listenerCallback: TransferListener = () => {
      getTokenAccount();
    };

    tokenContract.asSigner.on(filterTransferTo, listenerCallback);
    tokenContract.asSigner.on(filterTransferFrom, listenerCallback);

    return () => {
      tokenContract.asSigner.off(filterTransferTo, listenerCallback);
      tokenContract.asSigner.off(filterTransferFrom, listenerCallback);
    };
  }, [account, getTokenAccount, tokenContract]);

  // Setup token delegate changed events listener
  useEffect(() => {
    if (tokenContract === undefined || !account) {
      return;
    }

    const filter = tokenContract.asSigner.filters.DelegateChanged(account);

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

    tokenContract.asSigner.on(filter, listenerCallback);

    return () => {
      tokenContract.asSigner.off(filter, listenerCallback);
    };
  }, [account, getTokenAccount, tokenContract]);

  // Setup listeners for when voting weight increases or decreases
  useEffect(() => {
    if (!tokenContract || !account) {
      return;
    }

    const filter = tokenContract.asSigner.filters.DelegateVotesChanged(account);

    const callback: DelegateVotesChangedListener = (
      _delegate: string,
      _previousBalance: BigNumber,
      currentBalance: BigNumber
    ) => {
      dispatch({
        type: TokenActions.UPDATE_VOTING_WEIGHTS,
        payload: {
          votingWeight: currentBalance,
        },
      });
    };

    tokenContract.asSigner.on(filter, callback);

    return () => {
      tokenContract.asSigner.off(filter, callback);
    };
  }, [account, tokenContract]);

  const data = useMemo(() => state, [state]);
  return data;
};

export default useTokenData;
