import {
  VoteFinalizedEvent,
  VotedEvent,
} from '@fractal-framework/fractal-contracts/dist/typechain-types/@tokenwalk/seele/contracts/extensions/BaseTokenVoting';
import {
  ProposalCreatedEvent,
  ProposalCanceledEvent,
  FractalUsul,
} from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/FractalUsul';
import { Dispatch, useCallback, useEffect, useRef } from 'react';
import { useProvider } from 'wagmi';
import { TypedListener } from '../../../../assets/typechain-types/usul/common';
import { getEventRPC } from '../../../../helpers';
import { DecodedTransaction } from '../../../../types';
import { decodeTransactions } from '../../../../utils/crypto';
import { useNetworkConfg } from '../../../NetworkConfig/NetworkConfigProvider';
import { IGovernance, TxProposalState, UsulProposal, VOTE_CHOICES } from '../../types';
import { mapProposalCreatedEventToProposal, getProposalVotesSummary } from '../../utils';
import { GovernanceActions, GovernanceAction } from '../actions';
import useUpdateProposalState from './useUpdateProposalState';

interface IUseUsulProposals {
  governance: IGovernance;
  governanceDispatch: Dispatch<GovernanceActions>;
}

export default function useUsulProposals({ governance, governanceDispatch }: IUseUsulProposals) {
  const provider = useProvider();
  const { safeBaseURL } = useNetworkConfg();
  const metaDataMapping = useRef<Map<string, DecodedTransaction[]>>(new Map());
  const { chainId } = useNetworkConfg();

  const {
    txProposalsInfo,
    contracts: { usulContract, ozLinearVotingContract },
  } = governance;
  const updateProposalState = useUpdateProposalState({
    governance,
    governanceDispatch,
    chainId,
  });

  const proposalCreatedListener: TypedListener<ProposalCreatedEvent> = useCallback(
    async (...[strategyAddress, proposalNumber, proposer]) => {
      if (!usulContract || !ozLinearVotingContract) {
        return;
      }
      const rpc = getEventRPC<FractalUsul>(usulContract, provider.network.chainId);
      const proposalMetaDataCreatedFilter = rpc.filters.ProposalMetadataCreated();
      const proposalMetaDataCreatedEvents = await rpc.queryFilter(proposalMetaDataCreatedFilter);
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
            metaDataEvent.args.transactions,
            safeBaseURL
          ),
        };
      }
      const proposal = await mapProposalCreatedEventToProposal(
        strategyAddress,
        proposalNumber,
        proposer,
        usulContract,
        ozLinearVotingContract,
        provider,
        provider.network.chainId,
        metaData
      );

      const proposals = [...txProposalsInfo.txProposals, proposal];

      governanceDispatch({
        type: GovernanceAction.UPDATE_PROPOSALS,
        payload: {
          txProposals: proposals,
          passed: txProposalsInfo.passed,
          active: txProposalsInfo.active ? txProposalsInfo.active : 1,
        },
      });
    },
    [
      usulContract,
      ozLinearVotingContract,
      provider,
      txProposalsInfo.txProposals,
      txProposalsInfo.passed,
      txProposalsInfo.active,
      governanceDispatch,
      safeBaseURL,
    ]
  );

  const proposalVotedEventListener: TypedListener<VotedEvent> = useCallback(
    async (...[voter, proposalNumber, support, weight]) => {
      if (!ozLinearVotingContract || !usulContract) {
        return;
      }

      const proposals = await Promise.all(
        (txProposalsInfo.txProposals as UsulProposal[]).map(async proposal => {
          if (proposalNumber.eq(proposal.proposalNumber)) {
            const updatedProposal = {
              ...proposal,
              votes: [
                ...proposal.votes,
                {
                  voter,
                  choice: VOTE_CHOICES[support],
                  weight,
                },
              ],
              votesSummary: await getProposalVotesSummary(
                usulContract.asSigner,
                ozLinearVotingContract.asSigner,
                proposalNumber
              ),
            };
            return updatedProposal;
          }
          return proposal;
        })
      );

      governanceDispatch({
        type: GovernanceAction.UPDATE_PROPOSALS,
        payload: {
          txProposals: proposals,
          passed: txProposalsInfo.passed,
          active: txProposalsInfo.active ? txProposalsInfo.active : 1,
        },
      });
    },
    [usulContract, ozLinearVotingContract, governanceDispatch, txProposalsInfo]
  );

  const proposalQueuedEventListener: TypedListener<VoteFinalizedEvent> = useCallback(
    async (...[proposalNumber]) => {
      await updateProposalState(proposalNumber);
    },
    [updateProposalState]
  );

  const proposalCanceledListener: TypedListener<ProposalCanceledEvent> = useCallback(
    async (...[proposalNumber]) => {
      await updateProposalState(proposalNumber);
    },
    [updateProposalState]
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

  const loadProposals = useCallback(async () => {
    if (!usulContract || !ozLinearVotingContract) {
      return;
    }
    const proposalCreatedFilter = usulContract.asSigner.filters.ProposalCreated();
    const proposalMetaDataCreatedFilter = usulContract.asSigner.filters.ProposalMetadataCreated();
    const proposalCreatedEvents = await usulContract.asSigner.queryFilter(proposalCreatedFilter);
    const proposalMetaDataCreatedEvents = await usulContract.asSigner.queryFilter(
      proposalMetaDataCreatedFilter
    );

    const mappedProposals = await Promise.all(
      proposalCreatedEvents.map(async ({ args }) => {
        const metaDataEvent = proposalMetaDataCreatedEvents.find(event =>
          event.args.proposalId.eq(args.proposalNumber)
        );
        let metaData;
        if (metaDataEvent) {
          let decodedTransactions = metaDataMapping.current.get(args.proposalNumber.toString());
          if (!decodedTransactions) {
            decodedTransactions = await decodeTransactions(
              metaDataEvent.args.transactions,
              safeBaseURL
            );
            metaDataMapping.current.set(args.proposalNumber.toString(), decodedTransactions);
          }
          metaData = {
            title: metaDataEvent.args.title,
            description: metaDataEvent.args.description,
            documentationUrl: metaDataEvent.args.documentationUrl,
            transactions: metaDataEvent.args.transactions,
            decodedTransactions,
          };
        }
        return mapProposalCreatedEventToProposal(
          args[0],
          args[1],
          args[2],
          usulContract,
          ozLinearVotingContract,
          provider,
          provider.network.chainId,
          metaData
        );
      })
    );
    const passedProposals = mappedProposals.reduce(
      (prev, proposal) => (proposal.state === TxProposalState.Executed ? prev + 1 : prev),
      0
    );
    // @todo no queued?
    const activeProposals = mappedProposals.reduce(
      (prev, proposal) => (proposal.state === TxProposalState.Active ? prev + 1 : prev),
      0
    );

    governanceDispatch({
      type: GovernanceAction.UPDATE_PROPOSALS,
      payload: {
        txProposals: mappedProposals,
        passed: passedProposals,
        active: activeProposals,
      },
    });
  }, [usulContract, ozLinearVotingContract, governanceDispatch, provider, safeBaseURL]);

  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  return { loadProposals };
}
