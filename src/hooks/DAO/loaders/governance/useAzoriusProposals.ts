import { LinearERC20Voting, LinearERC721Voting } from '@fractal-framework/fractal-contracts';
import { TypedListener } from '@fractal-framework/fractal-contracts/dist/typechain-types/common';
import { ProposalCreatedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/Azorius';
import { VotedEvent as ERC20VotedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/LinearERC20Voting';
import { VotedEvent as ERC721VotedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/LinearERC721Voting';
import { BigNumber } from 'ethers';
import { useCallback, useEffect, useMemo } from 'react';
import { logError } from '../../../../helpers/errorLogging';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { useEthersProvider } from '../../../../providers/Ethers/hooks/useEthersProvider';
import { ProposalMetadata, MetaTransaction, VotingStrategyType } from '../../../../types';
import { AzoriusProposal, ProposalData } from '../../../../types/daoProposal';
import { mapProposalCreatedEventToProposal, getProposalVotesSummary } from '../../../../utils';
import useSafeContracts from '../../../safe/useSafeContracts';
import { useAsyncRetry } from '../../../utils/useAsyncRetry';
import { useSafeDecoder } from '../../../utils/useSafeDecoder';

export const useAzoriusProposals = () => {
  const {
    governanceContracts: {
      azoriusContractAddress,
      ozLinearVotingContractAddress,
      erc721LinearVotingContractAddress,
    },
    action,
  } = useFractal();
  const baseContracts = useSafeContracts();
  const strategyType = useMemo(() => {
    if (ozLinearVotingContractAddress) {
      return VotingStrategyType.LINEAR_ERC20;
    } else if (erc721LinearVotingContractAddress) {
      return VotingStrategyType.LINEAR_ERC721;
    } else {
      return undefined;
    }
  }, [ozLinearVotingContractAddress, erc721LinearVotingContractAddress]);
  const provider = useEthersProvider();
  const decode = useSafeDecoder();
  const decodeTransactions = useCallback(
    async (transactions: MetaTransaction[]) => {
      const decodedTransactions = await Promise.all(
        transactions.map(async tx => {
          return decode(tx.value.toString(), tx.to, tx.data);
        }),
      );
      return decodedTransactions.flat();
    },
    [decode],
  );

  const loadAzoriusProposals = useCallback(async (): Promise<AzoriusProposal[]> => {
    if (
      !azoriusContractAddress ||
      !(ozLinearVotingContractAddress || erc721LinearVotingContractAddress) ||
      !strategyType ||
      !provider ||
      !baseContracts
    ) {
      return [];
    }
    const azoriusContract =
      baseContracts.fractalAzoriusMasterCopyContract.asProvider.attach(azoriusContractAddress);
    const proposalCreatedFilter = azoriusContract.filters.ProposalCreated();

    const proposalCreatedEvents = await azoriusContract.queryFilter(proposalCreatedFilter);
    let strategyContract: LinearERC20Voting | LinearERC721Voting;
    if (ozLinearVotingContractAddress) {
      strategyContract = baseContracts.linearVotingMasterCopyContract.asProvider.attach(
        ozLinearVotingContractAddress,
      );
    } else if (erc721LinearVotingContractAddress) {
      strategyContract = baseContracts.linearVotingMasterCopyContract.asProvider.attach(
        erc721LinearVotingContractAddress,
      );
    } else {
      logError('No strategy contract found');
      return [];
    }

    const proposals = await Promise.all(
      proposalCreatedEvents.map(async ({ args }) => {
        let proposalData;
        if (args.metadata) {
          const metadataEvent: ProposalMetadata = JSON.parse(args.metadata);
          const decodedTransactions = await decodeTransactions(args.transactions);
          proposalData = {
            metaData: {
              title: metadataEvent.title,
              description: metadataEvent.description,
              documentationUrl: metadataEvent.documentationUrl,
            },
            transactions: args.transactions,
            decodedTransactions,
          };
        }
        return mapProposalCreatedEventToProposal(
          strategyContract,
          strategyType,
          args.proposalId,
          args.proposer,
          azoriusContract,
          provider,
          proposalData,
        );
      }),
    );
    return proposals;
  }, [
    decodeTransactions,
    ozLinearVotingContractAddress,
    erc721LinearVotingContractAddress,
    azoriusContractAddress,
    provider,
    strategyType,
    baseContracts,
  ]);

  const { requestWithRetries } = useAsyncRetry();
  // Azrious proposals are listeners
  const proposalCreatedListener: TypedListener<ProposalCreatedEvent> = useCallback(
    async (strategyAddress, proposalId, proposer, transactions, _metadata) => {
      if (
        !azoriusContractAddress ||
        !(ozLinearVotingContractAddress || erc721LinearVotingContractAddress) ||
        !strategyType ||
        !provider ||
        !baseContracts
      ) {
        return;
      }
      let proposalData: ProposalData | undefined;
      const azoriusContract =
        baseContracts.fractalAzoriusMasterCopyContract.asProvider.attach(azoriusContractAddress);
      if (_metadata) {
        const metaDataEvent: ProposalMetadata = JSON.parse(_metadata);
        proposalData = {
          metaData: {
            title: metaDataEvent.title,
            description: metaDataEvent.description,
            documentationUrl: metaDataEvent.documentationUrl,
          },
          transactions: transactions,
          decodedTransactions: await decodeTransactions(transactions),
        };
      }
      let strategyContract: LinearERC20Voting | LinearERC721Voting;
      if (ozLinearVotingContractAddress) {
        strategyContract =
          baseContracts.linearVotingMasterCopyContract.asProvider.attach(strategyAddress);
      } else if (erc721LinearVotingContractAddress) {
        strategyContract =
          baseContracts.linearVotingMasterCopyContract.asProvider.attach(strategyAddress);
      } else {
          logError('No strategy contract found');
        return [];
      }
      const func = async () => {
        return mapProposalCreatedEventToProposal(
          strategyContract,
          strategyType,
          proposalId,
          proposer,
          azoriusContract,
          provider,
          proposalData,
        );
      };
      const proposal = await requestWithRetries(func, 5, 7000);
      action.dispatch({
        type: FractalGovernanceAction.UPDATE_PROPOSALS_NEW,
        payload: proposal,
      });
    },
    [
      baseContracts,
      azoriusContractAddress,
      provider,
      decodeTransactions,
      action,
      requestWithRetries,
      strategyType,
      ozLinearVotingContractAddress,
      erc721LinearVotingContractAddress,
    ],
  );

  const erc20ProposalVotedEventListener: TypedListener<ERC20VotedEvent> = useCallback(
    async (voter, proposalId, support, weight) => {
      if (!ozLinearVotingContractAddress || !strategyType || !baseContracts) {
        return;
      }
      const strategyContract = baseContracts.linearVotingMasterCopyContract.asProvider.attach(
        ozLinearVotingContractAddress,
      );

      const votesSummary = await getProposalVotesSummary(
        strategyContract,
        strategyType,
        BigNumber.from(proposalId),
      );

      action.dispatch({
        type: FractalGovernanceAction.UPDATE_NEW_AZORIUS_ERC20_VOTE,
        payload: {
          proposalId: proposalId.toString(),
          voter,
          support,
          weight,
          votesSummary,
        },
      });
    },
    [ozLinearVotingContractAddress, action, strategyType, baseContracts],
  );

  const erc721ProposalVotedEventListener: TypedListener<ERC721VotedEvent> = useCallback(
    async (voter, proposalId, support, tokenAddresses, tokenIds) => {
      if (!erc721LinearVotingContractAddress || !strategyType || !baseContracts) {
        return;
      }
      const strategyContract = baseContracts.linearVotingMasterCopyContract.asProvider.attach(
        erc721LinearVotingContractAddress,
      );
      const votesSummary = await getProposalVotesSummary(
        strategyContract,
        strategyType,
        BigNumber.from(proposalId),
      );

      action.dispatch({
        type: FractalGovernanceAction.UPDATE_NEW_AZORIUS_ERC721_VOTE,
        payload: {
          proposalId: proposalId.toString(),
          voter,
          support,
          tokenAddresses,
          tokenIds: tokenIds.map(tokenId => tokenId.toString()),
          votesSummary,
        },
      });
    },
    [erc721LinearVotingContractAddress, action, strategyType, baseContracts],
  );

  useEffect(() => {
    if (!azoriusContractAddress || !baseContracts) {
      return;
    }

    const azoriusContract =
      baseContracts.fractalAzoriusMasterCopyContract.asProvider.attach(azoriusContractAddress);
    const proposalCreatedFilter = azoriusContract.filters.ProposalCreated();

    azoriusContract.on(proposalCreatedFilter, proposalCreatedListener);

    return () => {
      azoriusContract.off(proposalCreatedFilter, proposalCreatedListener);
    };
  }, [azoriusContractAddress, proposalCreatedListener, baseContracts]);

  useEffect(() => {
    if (ozLinearVotingContractAddress && baseContracts) {
      const ozLinearVotingContract = baseContracts.linearVotingMasterCopyContract.asProvider.attach(
        ozLinearVotingContractAddress,
      );

      const votedEvent = ozLinearVotingContract.filters.Voted();

      ozLinearVotingContract.on(votedEvent, erc20ProposalVotedEventListener);

      return () => {
        ozLinearVotingContract.off(votedEvent, erc20ProposalVotedEventListener);
      };
    } else if (erc721LinearVotingContractAddress && baseContracts) {
      const erc721LinearVotingContract =
        baseContracts.linearVotingMasterCopyContract.asProvider.attach(
          erc721LinearVotingContractAddress,
        );
      const votedEvent = erc721LinearVotingContract.filters.Voted();

      erc721LinearVotingContract.on(votedEvent, erc721ProposalVotedEventListener);

      return () => {
        erc721LinearVotingContract.off(votedEvent, erc721ProposalVotedEventListener);
      };
    }
  }, [
    ozLinearVotingContractAddress,
    erc721LinearVotingContractAddress,
    erc20ProposalVotedEventListener,
    erc721ProposalVotedEventListener,
    baseContracts,
  ]);

  return loadAzoriusProposals;
};
