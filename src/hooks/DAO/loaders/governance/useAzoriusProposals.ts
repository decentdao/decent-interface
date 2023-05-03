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
import { MetaData } from '../../../../types';

import { AzoriusProposal } from '../../../../types/daoProposal';
import { mapProposalCreatedEventToProposal, getProposalVotesSummary } from '../../../../utils';
import { useDecodeTransaction } from '../../../utils/useDecodeTransaction';

export const useAzoriusProposals = () => {
  const {
    governanceContracts: { azoriusContract, ozLinearVotingContract },
    action,
  } = useFractal();

  const provider = useProvider();
  const {
    network: { chainId },
  } = provider;
  const decodeTransactions = useDecodeTransaction();

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
        let metaData;
        if (args.metadata) {
          const metaDataEvent: MetaData = JSON.parse(args.metadata);
          const decodedTransactions = await decodeTransactions(
            args.proposalId.toString(),
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
          args.proposalId,
          args.proposer,
          azoriusContract,
          provider,
          chainId,
          metaData
        );
      })
    );
    return proposals;
  }, [chainId, decodeTransactions, ozLinearVotingContract, azoriusContract, provider]);

  // Azrious proposals are listeners
  const proposalCreatedListener: TypedListener<ProposalCreatedEvent> = useCallback(
    async (strategyAddress, proposalId, proposer, _, _metadata) => {
      if (!azoriusContract || !ozLinearVotingContract) {
        return;
      }

      let metaData;

      if (_metadata) {
        const metaDataEvent: MetaData = JSON.parse(_metadata);
        metaData = {
          title: metaDataEvent.args.title,
          description: metaDataEvent.args.description,
          documentationUrl: metaDataEvent.args.documentationUrl,
          transactions: metaDataEvent.args.transactions,
          decodedTransactions: await decodeTransactions(
            proposalId.toString(),
            metaDataEvent.args.transactions
          ),
        };
      }
      const strategyContract = getEventRPC<LinearERC20Voting>(
        ozLinearVotingContract,
        chainId
      ).attach(strategyAddress);
      const proposal = await mapProposalCreatedEventToProposal(
        strategyContract,
        proposalId,
        proposer,
        azoriusContract,
        provider,
        provider.network.chainId,
        metaData
      );
      action.dispatch({
        type: FractalGovernanceAction.UPDATE_PROPOSALS_NEW,
        payload: proposal,
      });
    },
    [ozLinearVotingContract, azoriusContract, provider, chainId, decodeTransactions, action]
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
    if (!azoriusContract || !ozLinearVotingContract) {
      return;
    }
    const proposalCreatedFilter = azoriusContract.asSigner.filters.ProposalCreated();

    const votedEvent = ozLinearVotingContract.asSigner.filters.Voted();

    azoriusContract.asSigner.on(proposalCreatedFilter, proposalCreatedListener);

    ozLinearVotingContract.asSigner.on(votedEvent, proposalVotedEventListener);

    return () => {
      azoriusContract.asSigner.off(proposalCreatedFilter, proposalCreatedListener);

      ozLinearVotingContract.asSigner.off(votedEvent, proposalVotedEventListener);
    };
  }, [
    azoriusContract,
    ozLinearVotingContract,
    proposalCreatedListener,
    proposalVotedEventListener,
  ]);

  return loadAzoriusProposals;
};
