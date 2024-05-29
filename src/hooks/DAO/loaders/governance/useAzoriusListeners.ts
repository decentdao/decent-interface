import { useEffect, useMemo } from 'react';
import { getAddress, getContract } from 'viem';
import { usePublicClient } from 'wagmi';
import AzoriusAbi from '../../../../assets/abi/Azorius';
import LinearERC20VotingAbi from '../../../../assets/abi/LinearERC20Voting';
import LinearERC721VotingAbi from '../../../../assets/abi/LinearERC721Voting';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { useEthersProvider } from '../../../../providers/Ethers/hooks/useEthersProvider';
import { CreateProposalMetadata, VotingStrategyType } from '../../../../types';
import {
  getProposalVotesSummary,
  mapProposalCreatedEventToProposal,
  decodeTransactions,
} from '../../../../utils';
import { getAverageBlockTime } from '../../../../utils/contract';
import { useSafeDecoder } from '../../../utils/useSafeDecoder';

export const useAzoriusListeners = () => {
  const {
    action,
    governanceContracts: {
      azoriusContractAddress,
      ozLinearVotingContractAddress,
      erc721LinearVotingContractAddress,
    },
  } = useFractal();

  const provider = useEthersProvider();
  const decode = useSafeDecoder();

  const publicClient = usePublicClient();

  const azoriusContract = useMemo(() => {
    if (!publicClient || !azoriusContractAddress) {
      return;
    }

    return getContract({
      abi: AzoriusAbi,
      address: getAddress(azoriusContractAddress),
      client: publicClient,
    });
  }, [azoriusContractAddress, publicClient]);

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
    if (!erc721LinearVotingContractAddress || !publicClient) {
      return undefined;
    }

    return getContract({
      abi: LinearERC721VotingAbi,
      address: getAddress(erc721LinearVotingContractAddress),
      client: publicClient,
    });
  }, [erc721LinearVotingContractAddress, publicClient]);

  useEffect(() => {
    if (!azoriusContract || !provider || !strategyType) {
      return;
    }

    const unwatch = azoriusContract.watchEvent.ProposalCreated({
      onLogs: async logs => {
        for (const log of logs) {
          if (
            !log.args.strategy ||
            !log.args.proposalId ||
            !log.args.metadata ||
            !log.args.transactions ||
            !log.args.proposer
          ) {
            continue;
          }

          // Wait for a block before processing.
          // We've seen that calling smart contract functions in `mapProposalCreatedEventToProposal`
          // which include the `proposalId` error out because the RPC node (rather, the block it's on)
          // doesn't see this proposal yet (despite the event being caught in the app...).
          const averageBlockTime = await getAverageBlockTime(provider);
          await new Promise(resolve => setTimeout(resolve, averageBlockTime * 1000));

          const typedTransactions = log.args.transactions.map(t => ({
            ...t,
            to: t.to,
            data: t.data,
            value: t.value,
          }));

          const metaDataEvent: CreateProposalMetadata = JSON.parse(log.args.metadata);
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
            Number(log.args.proposalId),
            log.args.proposer,
            azoriusContract,
            provider,
            Promise.resolve(undefined),
            Promise.resolve(undefined),
            Promise.resolve(undefined),
            proposalData,
          );

          action.dispatch({
            type: FractalGovernanceAction.UPDATE_PROPOSALS_NEW,
            payload: proposal,
          });
        }
      },
    });

    return () => {
      unwatch();
    };
  }, [
    action,
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
            log.args.proposalId,
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

    const unwatch = erc721StrategyContract.watchEvent.Voted({
      onLogs: async logs => {
        for (const log of logs) {
          if (
            !log.args.proposalId ||
            !log.args.voter ||
            !log.args.voteType ||
            !log.args.tokenAddresses ||
            !log.args.tokenIds
          ) {
            continue;
          }

          const votesSummary = await getProposalVotesSummary(
            undefined,
            erc721StrategyContract,
            strategyType,
            log.args.proposalId,
          );

          action.dispatch({
            type: FractalGovernanceAction.UPDATE_NEW_AZORIUS_ERC721_VOTE,
            payload: {
              proposalId: log.args.proposalId.toString(),
              voter: log.args.voter,
              support: log.args.voteType,
              tokenAddresses: log.args.tokenAddresses.map(tokenAddress => tokenAddress),
              tokenIds: log.args.tokenIds.map(tokenId => tokenId.toString()),
              votesSummary,
            },
          });
        }
      },
    });

    return () => {
      unwatch();
    };
  }, [action, erc721StrategyContract, strategyType]);

  useEffect(() => {
    if (!azoriusContract) {
      return;
    }

    const unwatch = azoriusContract.watchEvent.TimelockPeriodUpdated({
      onLogs: logs => {
        for (const log of logs) {
          if (!log.args.timelockPeriod) {
            continue;
          }

          action.dispatch({
            type: FractalGovernanceAction.UPDATE_TIMELOCK_PERIOD,
            payload: BigInt(log.args.timelockPeriod),
          });
        }
      },
    });

    return () => {
      unwatch();
    };
  }, [action, azoriusContract]);
};
