import {
  Azorius,
  LinearERC20Voting,
  LinearERC721Voting,
} from '@fractal-framework/fractal-contracts';
import { TypedListener } from '@fractal-framework/fractal-contracts/dist/typechain-types/common';
import { ProposalCreatedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/Azorius';
import { VotedEvent as ERC20VotedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/LinearERC20Voting';
import { VotedEvent as ERC721VotedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/LinearERC721Voting';
import { BigNumber } from 'ethers';
import { useCallback, useEffect, useMemo } from 'react';
import { getEventRPC } from '../../../../helpers';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { ProposalMetadata, MetaTransaction, VotingStrategyType } from '../../../../types';
import { AzoriusProposal, ProposalData } from '../../../../types/daoProposal';
import { mapProposalCreatedEventToProposal, getProposalVotesSummary } from '../../../../utils';
import { useAsyncRetry } from '../../../utils/useAsyncRetry';
import { useEthersProvider } from '../../../utils/useEthersProvider';
import { useSafeDecoder } from '../../../utils/useSafeDecoder';

export const useAzoriusProposals = () => {
  const {
    governanceContracts: { azoriusContract, ozLinearVotingContract, erc721LinearVotingContract },
    action,
  } = useFractal();
  const strategyType = useMemo(() => {
    if (ozLinearVotingContract) {
      return VotingStrategyType.LINEAR_ERC20;
    } else if (erc721LinearVotingContract) {
      return VotingStrategyType.LINEAR_ERC721;
    } else {
      return undefined;
    }
  }, [ozLinearVotingContract, erc721LinearVotingContract]);
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
      !azoriusContract ||
      !(ozLinearVotingContract || erc721LinearVotingContract) ||
      !strategyType
    ) {
      return [];
    }
    const rpc = getEventRPC<Azorius>(azoriusContract);
    const proposalCreatedFilter = rpc.filters.ProposalCreated();

    const proposalCreatedEvents = await rpc.queryFilter(proposalCreatedFilter);

    const strategyContract = getEventRPC<LinearERC20Voting | LinearERC721Voting>(
      ozLinearVotingContract ?? erc721LinearVotingContract!,
    );

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
    ozLinearVotingContract,
    erc721LinearVotingContract,
    azoriusContract,
    provider,
    strategyType,
  ]);

  const { requestWithRetries } = useAsyncRetry();
  // Azrious proposals are listeners
  const proposalCreatedListener: TypedListener<ProposalCreatedEvent> = useCallback(
    async (strategyAddress, proposalId, proposer, transactions, _metadata) => {
      if (
        !azoriusContract ||
        !(ozLinearVotingContract || erc721LinearVotingContract) ||
        !strategyType
      ) {
        return;
      }
      let proposalData: ProposalData | undefined;

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
      const strategyContract = getEventRPC<LinearERC20Voting | LinearERC721Voting>(
        ozLinearVotingContract ?? erc721LinearVotingContract!,
      ).attach(strategyAddress);
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
      ozLinearVotingContract,
      erc721LinearVotingContract,
      azoriusContract,
      provider,
      decodeTransactions,
      action,
      requestWithRetries,
      strategyType,
    ],
  );

  const erc20ProposalVotedEventListener: TypedListener<ERC20VotedEvent> = useCallback(
    async (voter, proposalId, support, weight) => {
      if (!ozLinearVotingContract || !strategyType) {
        return;
      }
      const strategyContract = getEventRPC<LinearERC20Voting>(ozLinearVotingContract);
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
    [ozLinearVotingContract, action, strategyType],
  );

  const erc721ProposalVotedEventListener: TypedListener<ERC721VotedEvent> = useCallback(
    async (voter, proposalId, support, tokenAddresses, tokenIds) => {
      if (!erc721LinearVotingContract || !strategyType) {
        return;
      }
      const strategyContract = getEventRPC<LinearERC721Voting>(erc721LinearVotingContract);
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
    [erc721LinearVotingContract, action, strategyType],
  );

  useEffect(() => {
    if (!azoriusContract) {
      return;
    }
    const proposalCreatedFilter = azoriusContract.asProvider.filters.ProposalCreated();

    azoriusContract.asProvider.on(proposalCreatedFilter, proposalCreatedListener);

    return () => {
      azoriusContract.asProvider.off(proposalCreatedFilter, proposalCreatedListener);
    };
  }, [azoriusContract, proposalCreatedListener]);

  useEffect(() => {
    if (ozLinearVotingContract) {
      const votedEvent = ozLinearVotingContract.asProvider.filters.Voted();

      ozLinearVotingContract.asProvider.on(votedEvent, erc20ProposalVotedEventListener);

      return () => {
        ozLinearVotingContract.asProvider.off(votedEvent, erc20ProposalVotedEventListener);
      };
    } else if (erc721LinearVotingContract) {
      const votedEvent = erc721LinearVotingContract.asProvider.filters.Voted();

      erc721LinearVotingContract.asProvider.on(votedEvent, erc721ProposalVotedEventListener);

      return () => {
        erc721LinearVotingContract.asProvider.off(votedEvent, erc721ProposalVotedEventListener);
      };
    }
  }, [
    ozLinearVotingContract,
    erc721LinearVotingContract,
    erc20ProposalVotedEventListener,
    erc721ProposalVotedEventListener,
  ]);

  return loadAzoriusProposals;
};
