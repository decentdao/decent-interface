import {
  VoteFinalizedEvent,
  VotedEvent,
} from '@fractal-framework/fractal-contracts/dist/typechain-types/@tokenwalk/seele/contracts/extensions/BaseTokenVoting';
import {
  ProposalCreatedEvent,
  ProposalCanceledEvent,
} from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/FractalUsul';
import { Dispatch, useCallback, useEffect, useMemo } from 'react';
import { useProvider, useSigner } from 'wagmi';
import { TypedListener } from '../../../../assets/typechain-types/usul/common';
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
  const { data: signer } = useSigner();
  const signerOrProvider = useMemo(() => signer || provider, [signer, provider]);

  const { chainId } = useNetworkConfg();

  const {
    txProposalsInfo,
    contracts: { usulContract, ozLinearVotingContract },
  } = governance;
  const updateProposalState = useUpdateProposalState({
    governance,
    governanceDispatch,
  });

  const proposalCreatedListener: TypedListener<ProposalCreatedEvent> = useCallback(
    async (...[strategyAddress, proposalNumber, proposer]) => {
      if (!usulContract || !signerOrProvider || !provider) {
        return;
      }
      const proposalMetaDataCreatedFilter = usulContract.filters.ProposalMetadataCreated();
      const proposalMetaDataCreatedEvents = await usulContract.queryFilter(
        proposalMetaDataCreatedFilter
      );
      const metaDataEvent = proposalMetaDataCreatedEvents.find(event =>
        event.args.proposalId.eq(proposalNumber)
      );
      let metaData;
      if (metaDataEvent) {
        metaData = {
          transactions: metaDataEvent.args.transactions,
          decodedTransactions: await decodeTransactions(metaDataEvent.args.transactions, chainId),
        };
      }
      const proposal = await mapProposalCreatedEventToProposal(
        strategyAddress,
        proposalNumber,
        proposer,
        usulContract,
        signerOrProvider,
        provider,
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
    [usulContract, signerOrProvider, provider, chainId, governanceDispatch, txProposalsInfo]
  );

  const proposalVotedEventListener: TypedListener<VotedEvent> = useCallback(
    async (...[voter, proposalNumber, support, weight]) => {
      if (!ozLinearVotingContract || !usulContract || !signerOrProvider) {
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
                usulContract,
                proposalNumber,
                signerOrProvider
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
    [usulContract, ozLinearVotingContract, governanceDispatch, signerOrProvider, txProposalsInfo]
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
    if (!usulContract || !ozLinearVotingContract || !signerOrProvider) {
      return;
    }
    const proposalCreatedFilter = usulContract.filters.ProposalCreated();
    const proposalCanceledFilter = usulContract.filters.ProposalCanceled();

    const votedEvent = ozLinearVotingContract.filters.Voted();
    const queuedEvent = ozLinearVotingContract.filters.VoteFinalized();

    usulContract.on(proposalCreatedFilter, proposalCreatedListener);
    usulContract.on(proposalCanceledFilter, proposalCanceledListener);

    ozLinearVotingContract.on(votedEvent, proposalVotedEventListener);
    ozLinearVotingContract.on(queuedEvent, proposalQueuedEventListener);

    return () => {
      usulContract.off(proposalCreatedFilter, proposalCreatedListener);
      usulContract.off(proposalCanceledFilter, proposalCanceledListener);

      ozLinearVotingContract.off(votedEvent, proposalVotedEventListener);
      ozLinearVotingContract.off(queuedEvent, proposalQueuedEventListener);
    };
  }, [
    usulContract,
    ozLinearVotingContract,
    signerOrProvider,
    proposalCreatedListener,
    proposalVotedEventListener,
    proposalQueuedEventListener,
    proposalCanceledListener,
  ]);

  useEffect(() => {
    if (!usulContract || !signerOrProvider || !provider) {
      return;
    }
    const loadProposals = async () => {
      const proposalCreatedFilter = usulContract.filters.ProposalCreated();
      const proposalMetaDataCreatedFilter = usulContract.filters.ProposalMetadataCreated();
      const proposalCreatedEvents = await usulContract.queryFilter(proposalCreatedFilter);
      const proposalMetaDataCreatedEvents = await usulContract.queryFilter(
        proposalMetaDataCreatedFilter
      );

      const mappedProposals = await Promise.all(
        proposalCreatedEvents.map(async ({ args }) => {
          const metaDataEvent = proposalMetaDataCreatedEvents.find(event =>
            event.args.proposalId.eq(args.proposalNumber)
          );
          let metaData;
          if (metaDataEvent) {
            metaData = {
              transactions: metaDataEvent.args.transactions,
              decodedTransactions: await decodeTransactions(
                metaDataEvent.args.transactions,
                chainId
              ),
            };
          }
          return mapProposalCreatedEventToProposal(
            args[0],
            args[1],
            args[2],
            usulContract,
            signerOrProvider,
            provider,
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
    };

    loadProposals();
  }, [usulContract, signerOrProvider, governanceDispatch, provider, chainId]);
}
