import { VotesToken } from '@fractal-framework/fractal-contracts';
import { BigNumber, utils } from 'ethers';
import { useReducer, useMemo, useEffect, useCallback } from 'react';
import { OZLinearVoting } from '../../../../assets/typechain-types/usul';
import { formatCoin } from '../../../../utils/numberFormats';
import { useWeb3Provider } from '../../../Web3Data/hooks/useWeb3Provider';
import {
  TransferListener,
  DelegateChangedListener,
  DelegateVotesChangedListener,
} from '../../types';

interface ITokenData {
  name: string | undefined;
  symbol: string | undefined;
  decimals: number | undefined;
  address: string | undefined;
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
  votingContract: OZLinearVoting | undefined;
  tokenContract: VotesToken | undefined;
  isLoading?: boolean;
}

export interface VotingTokenConfig {
  votingPeriod?: string;
  quorum?: string;
}

const initialState = {
  name: undefined,
  symbol: undefined,
  decimals: undefined,
  address: undefined,
  userBalance: undefined,
  userBalanceString: undefined,
  delegatee: undefined,
  votingWeight: undefined,
  votingWeightString: undefined,
  isDelegatesSet: undefined,
  votingContract: undefined,
  tokenContract: undefined,
  votingPeriod: undefined,
  quorum: undefined,
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
        votingContract: OZLinearVoting;
        votingPeriod: string;
        quorum: string;
      };
    }
  | { type: TokenActions.UPDATE_TOKEN_CONTRACT; payload: VotesToken }
  | { type: TokenActions.RESET };

const reducer = (state: IGoveranceTokenData, action: TokenAction) => {
  switch (action.type) {
    case TokenActions.UPDATE_TOKEN:
      const { name, symbol, decimals, address } = action.payload;
      return { ...state, name, symbol, decimals, address };
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
const useTokenData = (votingContract?: OZLinearVoting, tokenContract?: VotesToken) => {
  const {
    state: { account, provider },
  } = useWeb3Provider();

  const [state, dispatch] = useReducer(reducer, initialState);

  // dispatch voting contract
  useEffect(() => {
    if (!votingContract || !provider) {
      dispatch({
        type: TokenActions.RESET,
      });
      return;
    }

    (async () => {
      // @todo handle errors
      const votingPeriod = await votingContract.votingPeriod();
      const blockNumber = await provider.getBlockNumber();
      const quorum = await votingContract.quorum(blockNumber - 1);

      dispatch({
        type: TokenActions.UPDATE_VOTING_CONTRACT,
        payload: {
          votingContract,
          votingPeriod: utils.formatUnits(votingPeriod, 0),
          quorum: utils.formatUnits(quorum),
        },
      });
    })();
  }, [votingContract, provider]);

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
  }, [tokenContract, account, state.decimals, state.symbol]);

  // get token account data
  useEffect(() => {
    getTokenAccount();
  }, [getTokenAccount]);

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
  }, [account, getTokenAccount, tokenContract]);

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
      dispatch({
        type: TokenActions.UPDATE_DELEGATEE,
        payload: toDelegate,
      });
    };

    tokenContract.on(filter, listenerCallback);

    return () => {
      tokenContract.off(filter, listenerCallback);
    };
  }, [account, getTokenAccount, tokenContract]);

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
  }, [account, state.decimals, state.symbol, tokenContract]);

  const data = useMemo(() => state, [state]);
  return data;
};

export default useTokenData;
