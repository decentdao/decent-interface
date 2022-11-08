import { BigNumber } from 'ethers';
import { useEffect, useCallback, useMemo, useReducer, useState } from 'react';
import { VotesToken, VotesToken__factory } from '../../../assets/typechain-types/fractal-contracts';
import {
  OZLinearVoting,
  OZLinearVoting__factory,
  Usul,
} from '../../../assets/typechain-types/usul';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { formatCoin } from '../../../utils/numberFormats';
import {
  DelegateChangedListener,
  DelegateVotesChangedListener,
  TransferListener,
} from '../../govenor/types';
import { GnosisModuleType, IGnosisModuleData } from '../types/governance';

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

export interface IGoveranceTokenData extends ITokenData, ITokenAccount {
  votingContract: OZLinearVoting | undefined;
  tokenContract: VotesToken | undefined;
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
  | { type: TokenActions.UPDATE_VOTING_CONTRACT; payload: OZLinearVoting }
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
      return { ...state, votingContract: action.payload };
    case TokenActions.UPDATE_TOKEN_CONTRACT:
      return { ...state, tokenContract: action.payload };
  }
  return state;
};

const useTokenData = (modules: IGnosisModuleData[]) => {
  const {
    state: { account, signerOrProvider },
  } = useWeb3Provider();
  const [votingContract, setVotingContract] = useState<OZLinearVoting>();
  const [tokenContract, setTokenContract] = useState<VotesToken>();
  const [decimals, setDecimals] = useState<number>();
  const [symbol, setSymbol] = useState<string>();

  const [state, dispatch] = useReducer(reducer, initialState);

  const usulModule = useMemo(
    () => modules.find(module => module.moduleType === GnosisModuleType.USUL)?.moduleContract,
    [modules]
  ) as Usul | undefined;

  // set voting contract
  useEffect(() => {
    if (!usulModule || !signerOrProvider) {
      return;
    }

    (async () => {
      // todo: This assumes that only one strategy has been enabled, but Usul supports more than one
      const votingContractAddress = await usulModule
        .queryFilter(usulModule.filters.EnabledStrategy())
        .then(strategiesEnabled => {
          return strategiesEnabled[0].args.strategy;
        });

      setVotingContract(OZLinearVoting__factory.connect(votingContractAddress, signerOrProvider));
    })();
  }, [signerOrProvider, usulModule]);

  // set token contract
  useEffect(() => {
    if (!votingContract || !signerOrProvider) {
      return;
    }

    (async () => {
      setTokenContract(
        VotesToken__factory.connect(await votingContract.governanceToken(), signerOrProvider)
      );
    })();
  }, [signerOrProvider, votingContract]);

  // set decimals
  useEffect(() => {
    if (!tokenContract) {
      setDecimals(undefined);
      return;
    }

    tokenContract.decimals().then(setDecimals);
  }, [tokenContract]);

  // set symbol
  useEffect(() => {
    if (!tokenContract) {
      setSymbol(undefined);
      return;
    }

    tokenContract.symbol().then(setSymbol);
  }, [tokenContract]);

  // dispatch voting contract
  useEffect(() => {
    if (!votingContract) {
      return;
    }

    dispatch({
      type: TokenActions.UPDATE_VOTING_CONTRACT,
      payload: votingContract,
    });
  }, [votingContract]);

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
        userBalanceString: formatCoin(tokenBalance, decimals, symbol),
        delegatee: tokenDelegatee,
        votingWeight: tokenVotingWeight,
        votingWeightString: formatCoin(tokenVotingWeight, decimals, symbol),
        isDelegatesSet,
      },
    });
  }, [tokenContract, account, decimals, symbol]);

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
      dispatch({ type: TokenActions.UPDATE_DELEGATEE, payload: toDelegate });
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
          votingWeightString: formatCoin(currentBalance, decimals, symbol),
        },
      });
    };

    tokenContract.on(filter, callback);

    return () => {
      tokenContract.off(filter, callback);
    };
  }, [account, decimals, symbol, tokenContract]);

  const data = useMemo(() => state, [state]);
  return data;
};

export default useTokenData;
