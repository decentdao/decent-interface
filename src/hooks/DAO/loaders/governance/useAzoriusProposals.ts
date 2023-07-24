import {
  Azorius,
  LinearERC20Voting,
  LinearERC721Voting,
} from '@fractal-framework/fractal-contracts';
import { TypedListener } from '@fractal-framework/fractal-contracts/dist/typechain-types/common';
import { ProposalCreatedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/Azorius';
import { VotedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/LinearERC20Voting';
import { BigNumber } from 'ethers';
import { useCallback, useEffect } from 'react';
import { useProvider } from 'wagmi';
import { getEventRPC } from '../../../../helpers';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { AzoriusGovernance, CreateProposalMetadata, MetaTransaction } from '../../../../types';

import { AzoriusProposal, ProposalMetaData } from '../../../../types/daoProposal';
import { mapProposalCreatedEventToProposal, getProposalVotesSummary } from '../../../../utils';
import { useAsyncRetry } from '../../../utils/useAsyncRetry';
import { useSafeDecoder } from '../../../utils/useSafeDecoder';

export const useAzoriusProposals = () => {
  const {
    governanceContracts: { azoriusContract, ozLinearVotingContract, erc721LinearVotingContract },
    governance,
    action,
  } = useFractal();
  const strategyType = (governance as AzoriusGovernance).votingStrategy?.strategyType;
  const provider = useProvider();
  const {
    network: { chainId },
  } = provider;
  const decode = useSafeDecoder();
  const decodeTransactions = useCallback(
    async (transactions: MetaTransaction[]) => {
      const decodedTransactions = await Promise.all(
        transactions.map(async tx => {
          return decode(tx.value.toString(), tx.to, tx.data);
        })
      );
      return decodedTransactions.flat();
    },
    [decode]
  );

  const loadAzoriusProposals = useCallback(async (): Promise<AzoriusProposal[]> => {
    if (
      !azoriusContract ||
      !(ozLinearVotingContract || erc721LinearVotingContract) ||
      !strategyType
    ) {
      return [];
    }
    const rpc = getEventRPC<Azorius>(azoriusContract, chainId);
    const proposalCreatedFilter = rpc.filters.ProposalCreated();

    const proposalCreatedEvents = await rpc.queryFilter(proposalCreatedFilter);

    const strategyContract = getEventRPC<LinearERC20Voting | LinearERC721Voting>(
      ozLinearVotingContract ?? erc721LinearVotingContract!,
      chainId
    );

    const proposals = await Promise.all(
      proposalCreatedEvents.map(async ({ args }) => {
        let metaData;
        if (args.metadata) {
          const metaDataEvent: CreateProposalMetadata = JSON.parse(args.metadata);
          const decodedTransactions = await decodeTransactions(args.transactions);
          metaData = {
            title: metaDataEvent.title,
            description: metaDataEvent.description,
            documentationUrl: metaDataEvent.documentationUrl,
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
          metaData
        );
      })
    );
    return proposals;
  }, [
    chainId,
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
      let metaData: ProposalMetaData | undefined;

      if (_metadata) {
        const metaDataEvent: CreateProposalMetadata = JSON.parse(_metadata);
        metaData = {
          title: metaDataEvent.title,
          description: metaDataEvent.description,
          documentationUrl: metaDataEvent.documentationUrl,
          transactions: transactions,
          decodedTransactions: await decodeTransactions(transactions),
        };
      }
      const strategyContract = getEventRPC<LinearERC20Voting | LinearERC721Voting>(
        ozLinearVotingContract ?? erc721LinearVotingContract!,
        chainId
      ).attach(strategyAddress);
      const func = async () => {
        return mapProposalCreatedEventToProposal(
          strategyContract,
          strategyType,
          proposalId,
          proposer,
          azoriusContract,
          provider,
          metaData
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
      chainId,
      decodeTransactions,
      action,
      requestWithRetries,
      strategyType,
    ]
  );

  const proposalVotedEventListener: TypedListener<VotedEvent> = useCallback(
    async (voter, proposalId, support, weight) => {
      if (!ozLinearVotingContract || !erc721LinearVotingContract || !strategyType) {
        return;
      }
      const strategyContract = getEventRPC<LinearERC20Voting | LinearERC721Voting>(
        ozLinearVotingContract ?? erc721LinearVotingContract!,
        chainId
      );
      const votesSummary = await getProposalVotesSummary(
        strategyContract,
        strategyType,
        BigNumber.from(proposalId)
      );

      action.dispatch({
        type: FractalGovernanceAction.UPDATE_NEW_AZORIUS_VOTE,
        payload: {
          proposalId: proposalId.toString(),
          voter,
          support,
          weight,
          votesSummary,
        },
      });
    },
    [ozLinearVotingContract, erc721LinearVotingContract, chainId, action, strategyType]
  );

  useEffect(() => {
    if (!azoriusContract) {
      return;
    }
    const proposalCreatedFilter = azoriusContract.asSigner.filters.ProposalCreated();

    azoriusContract.asSigner.on(proposalCreatedFilter, proposalCreatedListener);

    return () => {
      azoriusContract.asSigner.off(proposalCreatedFilter, proposalCreatedListener);
    };
  }, [azoriusContract, proposalCreatedListener]);

  useEffect(() => {
    if (!ozLinearVotingContract || !erc721LinearVotingContract) {
      return;
    }
    const votingContract = ozLinearVotingContract ?? erc721LinearVotingContract!;
    const votedEvent = votingContract.asSigner.filters.Voted();

    votingContract.asSigner.on(votedEvent, proposalVotedEventListener);

    return () => {
      votingContract.asSigner.off(votedEvent, proposalVotedEventListener);
    };
  }, [ozLinearVotingContract, erc721LinearVotingContract, proposalVotedEventListener]);

  return loadAzoriusProposals;
};
