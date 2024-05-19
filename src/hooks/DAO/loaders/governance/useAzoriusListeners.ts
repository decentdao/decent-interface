import { LinearERC721Voting } from '@fractal-framework/fractal-contracts';
import { TypedListener } from '@fractal-framework/fractal-contracts/dist/typechain-types/common';
import { TimelockPeriodUpdatedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/MultisigFreezeGuard';
import {
  Azorius,
  ProposalCreatedEvent,
} from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/Azorius';
import { VotedEvent as ERC721VotedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/LinearERC721Voting';
import { Dispatch, useEffect, useMemo } from 'react';
import { getAddress, getContract, GetContractReturnType, Hex, PublicClient } from 'viem';
import { usePublicClient } from 'wagmi';
import LinearERC20VotingAbi from '../../../../assets/abi/LinearERC20Voting';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { useEthersProvider } from '../../../../providers/Ethers/hooks/useEthersProvider';
import {
  CreateProposalMetadata,
  VotingStrategyType,
  DecodedTransaction,
  FractalActions,
} from '../../../../types';
import { Providers } from '../../../../types/network';
import {
  getProposalVotesSummary,
  mapProposalCreatedEventToProposal,
  decodeTransactions,
} from '../../../../utils';
import { getAverageBlockTime } from '../../../../utils/contract';
import useSafeContracts from '../../../safe/useSafeContracts';
import { useSafeDecoder } from '../../../utils/useSafeDecoder';

const proposalCreatedEventListener = (
  azoriusContract: Azorius,
  erc20StrategyContract:
    | GetContractReturnType<typeof LinearERC20VotingAbi, PublicClient>
    | undefined,
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

  const baseContracts = useSafeContracts();
  const provider = useEthersProvider();
  const decode = useSafeDecoder();

  const publicClient = usePublicClient();

  const azoriusContract = useMemo(() => {
    if (!baseContracts || !azoriusContractAddress) {
      return;
    }

    return baseContracts.fractalAzoriusMasterCopyContract.asProvider.attach(azoriusContractAddress);
  }, [azoriusContractAddress, baseContracts]);

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
    if (!ozLinearVotingContractAddress || !publicClient) {
      return undefined;
    }

    return getContract({
      abi: LinearERC20VotingAbi,
      address: getAddress(ozLinearVotingContractAddress),
      client: publicClient,
    });
  }, [ozLinearVotingContractAddress, publicClient]);

  const erc721StrategyContract = useMemo(() => {
    if (!baseContracts || !erc721LinearVotingContractAddress) {
      return undefined;
    }

    return baseContracts.linearVotingERC721MasterCopyContract.asProvider.attach(
      erc721LinearVotingContractAddress,
    );
  }, [baseContracts, erc721LinearVotingContractAddress]);

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
    provider,
    strategyType,
  ]);

  useEffect(() => {
    if (strategyType !== VotingStrategyType.LINEAR_ERC20 || !erc20StrategyContract) {
      return;
    }

    const unwatch = erc20StrategyContract.watchEvent.Voted({
      onLogs: async logs => {
        for (const log of logs) {
          if (!log.args.proposalId || !log.args.voter || !log.args.voteType || !log.args.weight) {
            continue;
          }

          const votesSummary = await getProposalVotesSummary(
            erc20StrategyContract,
            undefined,
            strategyType,
            BigInt(log.args.proposalId),
          );

          action.dispatch({
            type: FractalGovernanceAction.UPDATE_NEW_AZORIUS_ERC20_VOTE,
            payload: {
              proposalId: log.args.proposalId.toString(),
              voter: log.args.voter,
              support: log.args.voteType,
              weight: log.args.weight,
              votesSummary,
            },
          });
        }
      },
    });

    return () => {
      unwatch();
    };
  }, [action, erc20StrategyContract, strategyType]);

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
