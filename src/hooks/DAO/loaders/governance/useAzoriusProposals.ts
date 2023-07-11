import { Azorius, LinearERC20Voting } from '@fractal-framework/fractal-contracts';
import { TypedListener } from '@fractal-framework/fractal-contracts/dist/typechain-types/common';
import { ProposalCreatedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/Azorius';
import { VotedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/azorius/LinearERC20Voting';
import { BigNumber } from 'ethers';
import { useCallback, useEffect } from 'react';
import { useProvider } from 'wagmi';
import { getEventRPC } from '../../../../helpers';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';
import { ProposalMetadata, MetaTransaction } from '../../../../types';

import { AzoriusProposal, ProposalData } from '../../../../types/daoProposal';
import { mapProposalCreatedEventToProposal, getProposalVotesSummary } from '../../../../utils';
import { useAsyncRetry } from '../../../utils/useAsyncRetry';
import { useSafeDecoder } from '../../../utils/useSafeDecoder';

export const useAzoriusProposals = () => {
  const {
    governanceContracts: { azoriusContract, ozLinearVotingContract },
    action,
  } = useFractal();

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
    if (!azoriusContract || !ozLinearVotingContract) {
      return [];
    }
    const rpc = getEventRPC<Azorius>(azoriusContract, chainId);
    const proposalCreatedFilter = rpc.filters.ProposalCreated();

    const proposalCreatedEvents = await rpc.queryFilter(proposalCreatedFilter);

    const strategyContract = getEventRPC<LinearERC20Voting>(ozLinearVotingContract, chainId);

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
          args.proposalId,
          args.proposer,
          azoriusContract,
          provider,
          chainId,
          proposalData
        );
      })
    );
    return proposals;
  }, [chainId, decodeTransactions, ozLinearVotingContract, azoriusContract, provider]);

  const { requestWithRetries } = useAsyncRetry();
  // Azrious proposals are listeners
  const proposalCreatedListener: TypedListener<ProposalCreatedEvent> = useCallback(
    async (strategyAddress, proposalId, proposer, transactions, _metadata) => {
      if (!azoriusContract || !ozLinearVotingContract) {
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
      const strategyContract = getEventRPC<LinearERC20Voting>(
        ozLinearVotingContract,
        chainId
      ).attach(strategyAddress);
      const func = async () => {
        return mapProposalCreatedEventToProposal(
          strategyContract,
          proposalId,
          proposer,
          azoriusContract,
          provider,
          provider.network.chainId,
          proposalData
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
      azoriusContract,
      provider,
      chainId,
      decodeTransactions,
      action,
      requestWithRetries,
    ]
  );

  const proposalVotedEventListener: TypedListener<VotedEvent> = useCallback(
    async (voter, proposalId, support, weight) => {
      if (!ozLinearVotingContract) {
        return;
      }
      const strategyContract = getEventRPC<LinearERC20Voting>(ozLinearVotingContract, chainId);
      const votesSummary = await getProposalVotesSummary(
        strategyContract,
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
    [ozLinearVotingContract, chainId, action]
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
    if (!ozLinearVotingContract) {
      return;
    }
    const votedEvent = ozLinearVotingContract.asSigner.filters.Voted();

    ozLinearVotingContract.asSigner.on(votedEvent, proposalVotedEventListener);

    return () => {
      ozLinearVotingContract.asSigner.off(votedEvent, proposalVotedEventListener);
    };
  }, [ozLinearVotingContract, proposalVotedEventListener]);

  return loadAzoriusProposals;
};
