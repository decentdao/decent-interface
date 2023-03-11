import { addMinutes } from 'date-fns';
import { BigNumber } from 'ethers';
import { useReducer, useMemo, useEffect, useCallback, useRef } from 'react';
import { useAccount, useProvider } from 'wagmi';
import { useTimeHelpers } from '../../../../hooks/utils/useTimeHelpers';
import {
  IGoveranceTokenData,
  TokenAction,
  TokenActions,
  GovernanceContracts,
  ITokenData,
  TokenAccountRaw,
  VotingTokenConfig,
  TransferListener,
  DelegateChangedListener,
  DelegateVotesChangedListener,
} from '../../../../types';
import { formatCoin } from '../../../../utils/numberFormats';

const TOKEN_DATA_EXPIRATION = 5; // in minutes
const USER_ACCOUNT_EXPIRATION = 1; // in minutes

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

  // key: contract address
  // value: ITokenData, ITokenAccount, VotingTokenConfig
  const tokenDataCache = useRef<Map<string, GovernanceTokenCache<ITokenData>>>(new Map());
  const tokenAccountCache = useRef<Map<string, GovernanceTokenCache<TokenAccountRaw>>>(new Map());
  const votingTokenConfigCache = useRef<
    Map<string, GovernanceTokenCache<VotingTokenConfig<BigNumber>>>
  >(new Map());

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
      const ozVotingContractAddress = ozLinearVotingContract.asSigner.address;
      const votingCache = votingTokenConfigCache.current.get(ozVotingContractAddress);
      let votingData = votingCache?.data;
      if (
        !votingCache ||
        !votingCache.expires ||
        votingCache.expires > addMinutes(votingCache.expires, TOKEN_DATA_EXPIRATION)
      ) {
        const [votingPeriod, quorumPercentage, timeLockPeriod] = await Promise.all([
          ozLinearVotingContract.asSigner.votingPeriod(),
          ozLinearVotingContract.asSigner.quorumNumerator(),
          ozLinearVotingContract.asSigner.timeLockPeriod(),
        ]);
        votingData = { votingPeriod, quorumPercentage, timeLockPeriod };
        votingTokenConfigCache.current.set(ozVotingContractAddress, {
          data: votingData,
          expires: addMinutes(new Date(), TOKEN_DATA_EXPIRATION),
        });
      }
      dispatch({
        type: TokenActions.UPDATE_VOTING_CONTRACT,
        payload: {
          votingPeriod: {
            value: votingData!.votingPeriod!,
            formatted: getTimeDuration(votingData!.votingPeriod!.toString()),
          },
          quorumPercentage: {
            value: votingData!.quorumPercentage!,
            formatted: votingData!.quorumPercentage!.toString() + '%',
          },
          timeLockPeriod: {
            value: votingData!.timeLockPeriod!,
            formatted: getTimeDuration(votingData!.timeLockPeriod!.toString()),
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
      const tokenAddress = tokenContract.asSigner.address;
      const tokenCache = tokenDataCache.current.get(tokenContract.asSigner.address);
      let tokenData = tokenCache?.data;
      if (
        !tokenCache ||
        !tokenCache.expires ||
        tokenCache.expires > addMinutes(tokenCache.expires, TOKEN_DATA_EXPIRATION)
      ) {
        const [tokenName, tokenSymbol, tokenDecimals, totalSupply] = await Promise.all([
          tokenContract.asSigner.name(),
          tokenContract.asSigner.symbol(),
          tokenContract.asSigner.decimals(),
          tokenContract.asSigner.totalSupply(),
        ]);
        tokenData = {
          name: tokenName,
          symbol: tokenSymbol,
          decimals: tokenDecimals,
          address: tokenAddress,
          totalSupply,
        };
        tokenDataCache.current.set(tokenAddress, {
          data: tokenData,
          expires: addMinutes(new Date(), TOKEN_DATA_EXPIRATION),
        });
      }

      dispatch({
        type: TokenActions.UPDATE_TOKEN,
        payload: tokenData!,
      });
    })();
  }, [tokenContract, tokenDataCache]);

  const getTokenAccount = useCallback(async () => {
    if (!tokenContract || !account) {
      return;
    }
    const tokenAddress = tokenContract.asSigner.address;
    const accountCache = tokenAccountCache.current.get(tokenAddress);
    let tokenAccountData = accountCache?.data;
    if (
      !accountCache ||
      !accountCache.expires ||
      accountCache.expires > addMinutes(accountCache.expires, USER_ACCOUNT_EXPIRATION)
    ) {
      const providerContract = tokenContract.asSigner.connect(provider);
      const [tokenBalance, tokenDelegatee, tokenVotingWeight, delegateChangeEvents] =
        await Promise.all([
          tokenContract.asSigner.balanceOf(account),
          tokenContract.asSigner.delegates(account),
          tokenContract.asSigner.getVotes(account),
          providerContract.queryFilter(providerContract.filters.DelegateChanged()),
        ]);
      tokenAccountData = {
        userBalance: tokenBalance,
        delegatee: tokenDelegatee,
        votingWeight: tokenVotingWeight,
        isDelegatesSet: !!delegateChangeEvents.length,
      };
      tokenAccountCache.current.set(tokenAddress, {
        data: tokenAccountData,
        expires: addMinutes(new Date(), USER_ACCOUNT_EXPIRATION),
      });
    }

    dispatch({
      type: TokenActions.UPDATE_ACCOUNT,
      payload: tokenAccountData!,
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
