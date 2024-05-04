import { Dispatch, useEffect, useMemo } from 'react';
import { getAddress, Hex } from 'viem';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import {
  CreateProposalMetadata,
  VotingStrategyType,
  DecodedTransaction,
  FractalActions,
} from '../../../../types';
import {
  getProposalVotesSummary,
  mapProposalCreatedEventToProposal,
  decodeTransactions,
} from '../../../../utils';
import { getAverageBlockTime } from '../../../../utils/contract';
import useSafeContracts from '../../../safe/useSafeContracts';
import useContractClient from '../../../utils/useContractClient';
import { useSafeDecoder } from '../../../utils/useSafeDecoder';

const proposalCreatedEventListener = (
  azoriusContract: Azorius,
  erc20StrategyContract: LinearERC20Voting | undefined,
  erc721StrategyContract: LinearERC721Voting | undefined,
  provider: Providers,
  strategyType: VotingStrategyType,
  decode: (value: string, to: string, data?: string | undefined) => Promise<DecodedTransaction[]>,
  dispatch: Dispatch<FractalActions>,
): TypedListener<ProposalCreatedEvent> => {
  return async (_strategyAddress, proposalId, proposer, transactions, metadata) => {
    // Wait for a block before processing.
    // We've seen that calling smart contract functions in `mapProposalCreatedEventToProposal`
    // which include the `proposalId` error out because the RPC node (rather, the block it's on)
    // doesn't see this proposal yet (despite the event being caught in the app...).
    const averageBlockTime = await getAverageBlockTime(provider);
    await new Promise(resolve => setTimeout(resolve, averageBlockTime * 1000));

    if (!metadata) {
      return;
    }

    const typedTransactions = transactions.map(t => ({
      ...t,
      to: getAddress(t.to),
      data: t.data as Hex, // @todo - this type casting shouldn't be needed after migrating to getContract
      value: t.value.toBigInt(),
    }));

    const metaDataEvent: CreateProposalMetadata = JSON.parse(metadata);
    const proposalData = {
      metaData: {
        title: metaDataEvent.title,
        description: metaDataEvent.description,
        documentationUrl: metaDataEvent.documentationUrl,
      },
      transactions: typedTransactions,
      decodedTransactions: await decodeTransactions(decode, typedTransactions),
    };

    const proposal = await mapProposalCreatedEventToProposal(
      erc20StrategyContract,
      erc721StrategyContract,
      strategyType,
      proposalId.toBigInt(),
      proposer,
      azoriusContract,
      provider,
      Promise.resolve(undefined),
      Promise.resolve(undefined),
      Promise.resolve(undefined),
      proposalData,
    );

    dispatch({
      type: FractalGovernanceAction.UPDATE_PROPOSALS_NEW,
      payload: proposal,
    });
  };
};

const erc20VotedEventListener = (
  erc20StrategyContract: LinearERC20Voting,
  strategyType: VotingStrategyType,
  dispatch: Dispatch<FractalActions>,
): TypedListener<ERC20VotedEvent> => {
  return async (voter, proposalId, voteType, weight) => {
    const votesSummary = await getProposalVotesSummary(
      erc20StrategyContract,
      undefined,
      strategyType,
      BigInt(proposalId),
    );

    dispatch({
      type: FractalGovernanceAction.UPDATE_NEW_AZORIUS_ERC20_VOTE,
      payload: {
        proposalId: proposalId.toString(),
        voter,
        support: voteType,
        weight: weight.toBigInt(),
        votesSummary,
      },
    });
  };
};

const erc721VotedEventListener = (
  erc721StrategyContract: LinearERC721Voting,
  strategyType: VotingStrategyType,
  dispatch: Dispatch<FractalActions>,
): TypedListener<ERC721VotedEvent> => {
  return async (voter, proposalId, voteType, tokenAddresses, tokenIds) => {
    const votesSummary = await getProposalVotesSummary(
      undefined,
      erc721StrategyContract,
      strategyType,
      BigInt(proposalId),
    );

    dispatch({
      type: FractalGovernanceAction.UPDATE_NEW_AZORIUS_ERC721_VOTE,
      payload: {
        proposalId: proposalId.toString(),
        voter,
        support: voteType,
        tokenAddresses,
        tokenIds: tokenIds.map(tokenId => tokenId.toString()),
        votesSummary,
      },
    });
  };
};

export const useAzoriusListeners = () => {
  const {
    action,
    governanceContracts: {
      azoriusContractAddress,
      ozLinearVotingContractAddress,
      erc721LinearVotingContractAddress,
    },
  } = useFractal();
  const { publicClient } = useContractClient();

  const baseContracts = useSafeContracts();
  const decode = useSafeDecoder();

  const azoriusContract = useMemo(() => {
    if (!baseContracts || !azoriusContractAddress || !publicClient) {
      return;
    }

    return getContract({
      address: azoriusContractAddress,
      abi: baseContracts.fractalAzoriusMasterCopyContract.asPublic.abi,
      client: publicClient,
    });
  }, [azoriusContractAddress, baseContracts, publicClient]);

  const strategyType = useMemo(() => {
    if (ozLinearVotingContractAddress) {
      return VotingStrategyType.LINEAR_ERC20;
    } else if (erc721LinearVotingContractAddress) {
      return VotingStrategyType.LINEAR_ERC721;
    } else {
      return undefined;
    }
  }, [ozLinearVotingContractAddress, erc721LinearVotingContractAddress]);

  const erc20StrategyContract = useMemo(() => {
    if (!baseContracts || !ozLinearVotingContractAddress || !publicClient) {
      return undefined;
    }

    return getContract({
      abi: baseContracts.linearVotingMasterCopyContract.asPublic.abi,
      address: ozLinearVotingContractAddress,
      client: publicClient,
    });
  }, [baseContracts, ozLinearVotingContractAddress, publicClient]);

  const erc721StrategyContract = useMemo(() => {
    if (
      !baseContracts ||
      !erc721LinearVotingContractAddress ||
      !baseContracts.linearVotingERC721MasterCopyContract ||
      !publicClient
    ) {
      return undefined;
    }

    return getContract({
      abi: baseContracts.linearVotingERC721MasterCopyContract.asPublic.abi,
      address: erc721LinearVotingContractAddress,
      client: publicClient,
    });
  }, [baseContracts, erc721LinearVotingContractAddress, publicClient]);

  useEffect(() => {
    if (!azoriusContract || !provider || !strategyType) {
      return;
    }

    const proposalCreatedFilter = azoriusContract.filters.ProposalCreated();
    const listener = proposalCreatedEventListener(
      azoriusContract,
      erc20StrategyContract,
      erc721StrategyContract,
      provider,
      strategyType,
      decode,
      action.dispatch,
    );

    azoriusContract.on(proposalCreatedFilter, listener);

    return () => {
      azoriusContract.off(proposalCreatedFilter, listener);
    };
  }, [
    action.dispatch,
    azoriusContract,
    decode,
    erc20StrategyContract,
    erc721StrategyContract,
    publicClient,
    strategyType,
  ]);

  useEffect(() => {
    if (strategyType !== VotingStrategyType.LINEAR_ERC20 || !erc20StrategyContract) {
      return;
    }

    const votedEvent = erc20StrategyContract.filters.Voted();
    const listener = erc20VotedEventListener(erc20StrategyContract, strategyType, action.dispatch);

    erc20StrategyContract.on(votedEvent, listener);

    return () => {
      erc20StrategyContract.off(votedEvent, listener);
    };
  }, [action.dispatch, erc20StrategyContract, strategyType]);

  useEffect(() => {
    if (strategyType !== VotingStrategyType.LINEAR_ERC721 || !erc721StrategyContract) {
      return;
    }

    const votedEvent = erc721StrategyContract.filters.Voted();
    const listener = erc721VotedEventListener(
      erc721StrategyContract,
      strategyType,
      action.dispatch,
    );

    erc721StrategyContract.on(votedEvent, listener);

    return () => {
      erc721StrategyContract.off(votedEvent, listener);
    };
  }, [action.dispatch, erc721StrategyContract, strategyType]);

  useEffect(() => {
    if (!azoriusContract) {
      return;
    }

    const timeLockPeriodFilter = azoriusContract.filters.TimelockPeriodUpdated();
    const timelockPeriodListener: TypedListener<TimelockPeriodUpdatedEvent> = timelockPeriod => {
      action.dispatch({
        type: FractalGovernanceAction.UPDATE_TIMELOCK_PERIOD,
        payload: BigInt(timelockPeriod),
      });
    };

    azoriusContract.on(timeLockPeriodFilter, timelockPeriodListener);

    return () => {
      azoriusContract.off(timeLockPeriodFilter, timelockPeriodListener);
    };
  }, [action, azoriusContract]);
};
