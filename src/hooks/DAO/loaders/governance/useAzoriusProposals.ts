import { FractalUsul, OZLinearVoting } from '@fractal-framework/fractal-contracts';
import {
  VotedEvent,
  VoteFinalizedEvent,
} from '@fractal-framework/fractal-contracts/dist/typechain-types/@tokenwalk/seele/contracts/extensions/BaseTokenVoting';
import { TypedListener } from '@fractal-framework/fractal-contracts/dist/typechain-types/common';
import {
  ProposalCanceledEvent,
  ProposalCreatedEvent,
} from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/FractalUsul';
import { useCallback, useEffect } from 'react';
import { useProvider } from 'wagmi';
import { getEventRPC } from '../../../../helpers';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../../providers/App/governance/action';

import { UsulProposal } from '../../../../types/daoProposal';
import {
  mapProposalCreatedEventToProposal,
  getProposalVotesSummary,
  getFractalProposalState,
} from '../../../../utils';
import { useDecodeTransaction } from '../../../utils/useDecodeTransaction';

export const useAzoriusProposals = () => {
  const {
    governanceContracts: { usulContract, ozLinearVotingContract },
    action,
  } = useFractal();

  const provider = useProvider();
  const {
    network: { chainId },
  } = provider;
  const decodeTransactions = useDecodeTransaction();

  const loadAzoriusProposals = useCallback(async (): Promise<UsulProposal[]> => {
    if (!usulContract || !ozLinearVotingContract) {
      return [];
    }
    const rpc = getEventRPC<FractalUsul>(usulContract, chainId);
    const proposalCreatedFilter = rpc.filters.ProposalCreated();
    const proposalMetaDataCreatedFilter = rpc.filters.ProposalMetadataCreated();

    const proposalCreatedEvents = await rpc.queryFilter(proposalCreatedFilter);
    const proposalMetaDataCreatedEvents = await rpc.queryFilter(proposalMetaDataCreatedFilter);

    const strategyContract = getEventRPC<OZLinearVoting>(ozLinearVotingContract, chainId);

    const proposals = await Promise.all(
      proposalCreatedEvents.map(async ({ args }) => {
        const metaDataEvent = proposalMetaDataCreatedEvents.find(event =>
          event.args.proposalId.eq(args.proposalNumber)
        );

        let metaData;
        if (metaDataEvent) {
          const decodedTransactions = await decodeTransactions(
            args.proposalNumber.toString(),
            metaDataEvent.args.transactions
          );
          metaData = {
            title: metaDataEvent.args.title,
            description: metaDataEvent.args.description,
            documentationUrl: metaDataEvent.args.documentationUrl,
            transactions: metaDataEvent.args.transactions,
            decodedTransactions,
          };
        }
        return mapProposalCreatedEventToProposal(
          strategyContract,
          args.proposalNumber,
          args.proposer,
          usulContract,
          provider,
          chainId,
          metaData
        );
      })
    );
    return proposals;
  }, [chainId, decodeTransactions, ozLinearVotingContract, usulContract, provider]);

  // Azrious proposals are listeners
  const proposalCreatedListener: TypedListener<ProposalCreatedEvent> = useCallback(
    async (strategyAddress, proposalNumber, proposer) => {
      if (!usulContract || !ozLinearVotingContract) {
        return;
      }
      const usulContractRPC = getEventRPC<FractalUsul>(usulContract, provider.network.chainId);
      const proposalMetaDataCreatedFilter = usulContractRPC.filters.ProposalMetadataCreated();
      const proposalMetaDataCreatedEvents = await usulContractRPC.queryFilter(
        proposalMetaDataCreatedFilter
      );

      const metaDataEvent = proposalMetaDataCreatedEvents.find(event =>
        event.args.proposalId.eq(proposalNumber)
      );
      let metaData;
      if (metaDataEvent) {
        metaData = {
          title: metaDataEvent.args.title,
          description: metaDataEvent.args.description,
          documentationUrl: metaDataEvent.args.documentationUrl,
          transactions: metaDataEvent.args.transactions,
          decodedTransactions: await decodeTransactions(
            proposalNumber.toString(),
            metaDataEvent.args.transactions
          ),
        };
      }
      const strategyContract = getEventRPC<OZLinearVoting>(ozLinearVotingContract, chainId).attach(
        strategyAddress
      );
      const proposal = await mapProposalCreatedEventToProposal(
        strategyContract,
        proposalNumber,
        proposer,
        usulContract,
        provider,
        provider.network.chainId,
        metaData
      );
      action.dispatch({
        type: FractalGovernanceAction.UPDATE_PROPOSALS_NEW,
        payload: proposal,
      });
    },
    [ozLinearVotingContract, usulContract, provider, chainId, decodeTransactions, action]
  );

  const proposalVotedEventListener: TypedListener<VotedEvent> = useCallback(
    async (voter, proposalNumber, support, weight) => {
      if (!ozLinearVotingContract) {
        return;
      }
      const strategyContract = getEventRPC<OZLinearVoting>(ozLinearVotingContract, chainId);
      const votesSummary = await getProposalVotesSummary(strategyContract, proposalNumber);

      action.dispatch({
        type: FractalGovernanceAction.UPDATE_NEW_USUL_VOTE,
        payload: {
          proposalNumber: proposalNumber.toString(),
          voter,
          support,
          weight,
          votesSummary,
        },
      });
    },
    [ozLinearVotingContract, chainId, action]
  );

  const proposalQueuedEventListener: TypedListener<VoteFinalizedEvent> = useCallback(
    async proposalNumber => {
      if (!ozLinearVotingContract || !usulContract) {
        return;
      }
      const strategyContract = getEventRPC<OZLinearVoting>(ozLinearVotingContract, chainId);
      const usulContractRPC = getEventRPC<FractalUsul>(usulContract, chainId);

      const state = await getFractalProposalState(
        strategyContract,
        usulContractRPC,
        proposalNumber,
        chainId
      );

      action.dispatch({
        type: FractalGovernanceAction.UPDATE_PROPOSAL_STATE,
        payload: { state, proposalNumber: proposalNumber.toString() },
      });
    },
    [chainId, ozLinearVotingContract, usulContract, action]
  );

  const proposalCanceledListener: TypedListener<ProposalCanceledEvent> = useCallback(
    async proposalNumber => {
      if (!ozLinearVotingContract || !usulContract) {
        return;
      }
      const strategyContract = getEventRPC<OZLinearVoting>(ozLinearVotingContract, chainId);
      const usulContractRPC = getEventRPC<FractalUsul>(usulContract, chainId);

      const state = await getFractalProposalState(
        strategyContract,
        usulContractRPC,
        proposalNumber,
        chainId
      );
      action.dispatch({
        type: FractalGovernanceAction.UPDATE_PROPOSAL_STATE,
        payload: { state, proposalNumber: proposalNumber.toString() },
      });
    },
    [chainId, ozLinearVotingContract, usulContract, action]
  );

  useEffect(() => {
    if (!usulContract || !ozLinearVotingContract) {
      return;
    }
    const proposalCreatedFilter = usulContract.asSigner.filters.ProposalCreated();
    const proposalCanceledFilter = usulContract.asSigner.filters.ProposalCanceled();

    const votedEvent = ozLinearVotingContract.asSigner.filters.Voted();
    const queuedEvent = ozLinearVotingContract.asSigner.filters.VoteFinalized();

    usulContract.asSigner.on(proposalCreatedFilter, proposalCreatedListener);
    usulContract.asSigner.on(proposalCanceledFilter, proposalCanceledListener);

    ozLinearVotingContract.asSigner.on(votedEvent, proposalVotedEventListener);
    ozLinearVotingContract.asSigner.on(queuedEvent, proposalQueuedEventListener);

    return () => {
      usulContract.asSigner.off(proposalCreatedFilter, proposalCreatedListener);
      usulContract.asSigner.off(proposalCanceledFilter, proposalCanceledListener);

      ozLinearVotingContract.asSigner.off(votedEvent, proposalVotedEventListener);
      ozLinearVotingContract.asSigner.off(queuedEvent, proposalQueuedEventListener);
    };
  }, [
    usulContract,
    ozLinearVotingContract,
    proposalCreatedListener,
    proposalVotedEventListener,
    proposalQueuedEventListener,
    proposalCanceledListener,
  ]);

  return loadAzoriusProposals;
};
