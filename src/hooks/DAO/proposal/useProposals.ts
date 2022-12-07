import { TypedListener } from '@fractal-framework/core-contracts/dist/common';
import {
  ProposalCreatedEvent,
  ProposalMetadataCreatedEvent,
} from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/FractalUsul';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Proposal, ProposalState } from '../../../providers/Fractal/types/usul';
import { mapProposalCreatedEventToProposal } from '../../../providers/Fractal/utils/usul';
import { useWeb3Provider } from '../../../providers/Web3Data/hooks/useWeb3Provider';
import { SortBy } from '../../../types';
import { decodeTransactions } from '../../../utils/crypto';
import useUsul from './useUsul';

export default function useProposals({
  sortBy,
  filters,
}: {
  sortBy?: SortBy;
  filters?: ProposalState[];
}) {
  const { usulContract } = useUsul();
  const [proposals, setProposals] = useState<Proposal[]>();

  const {
    state: { signerOrProvider, chainId },
  } = useWeb3Provider();

  const proposalCreatedListener: TypedListener<ProposalCreatedEvent> = useCallback(
    async (...[strategyAddress, proposalNumber, proposer]) => {
      if (!usulContract || !signerOrProvider) {
        return;
      }
      const proposal = await mapProposalCreatedEventToProposal(
        strategyAddress,
        proposalNumber,
        proposer,
        usulContract,
        signerOrProvider
      );

      setProposals(prevState => {
        if (prevState) {
          return [...prevState, proposal];
        }
        return [proposal];
      });
    },
    [usulContract, signerOrProvider]
  );

  const proposalMetaDataCreatedListener: TypedListener<ProposalMetadataCreatedEvent> = useCallback(
    async (...[proposalNumber, transactions, title, description, documentationUrl]) => {
      if (!usulContract || !signerOrProvider) {
        return;
      }

      const metaData = {
        title,
        description,
        documentationUrl,
        transactions,
        decodedTransactions: await decodeTransactions(transactions, chainId),
      };

      setProposals(prevState => {
        if (prevState) {
          return prevState.map(proposal => {
            if (proposal.proposalNumber.eq(proposalNumber)) {
              return {
                ...proposal,
                metaData,
              };
            }

            return proposal;
          });
        }

        return prevState;
      });
    },
    [usulContract, signerOrProvider, chainId]
  );

  const getProposalsTotal = (state: ProposalState) => {
    if (proposals) {
      return proposals.filter(proposal => proposal.state === state).length;
    }
  };

  useEffect(() => {
    if (!usulContract || !signerOrProvider) {
      return;
    }

    const proposalCreatedFilter = usulContract.filters.ProposalCreated();
    const proposalMetaDataCreatedFilter = usulContract.filters.ProposalMetadataCreated();

    usulContract.on(proposalCreatedFilter, proposalCreatedListener);
    usulContract.on(proposalMetaDataCreatedFilter, proposalMetaDataCreatedListener);

    return () => {
      usulContract.off(proposalCreatedFilter, proposalCreatedListener);
      usulContract.off(proposalMetaDataCreatedFilter, proposalMetaDataCreatedListener);
    };
  }, [usulContract, signerOrProvider, proposalCreatedListener, proposalMetaDataCreatedListener]);

  useEffect(() => {
    if (!usulContract || !signerOrProvider) {
      return;
    }

    const loadProposals = async () => {
      const proposalCreatedFilter = usulContract.filters.ProposalCreated();
      const proposalMetaDataCreatedFilter = usulContract.filters.ProposalMetadataCreated();
      const proposalCreatedEvents = await usulContract.queryFilter(proposalCreatedFilter);
      const proposalMetaDataCreatedEvents = await usulContract.queryFilter(
        proposalMetaDataCreatedFilter
      );

      let mappedProposals = await Promise.all(
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
            metaData
          );
        })
      );

      setProposals(mappedProposals);
    };

    loadProposals();
  }, [usulContract, signerOrProvider, chainId]);

  const sortedAndFilteredProposals = useMemo(() => {
    if (proposals && (sortBy || filters)) {
      let sorted = proposals; // They returned in oldest sorting from contract by default
      if (sortBy === SortBy.Newest) {
        sorted = [...proposals].reverse(); // .reverse mutates original array - we have to create new one
      }

      let filtered = sorted;
      if (filters) {
        filtered = filtered.filter(proposal => filters.includes(proposal.state));
      }

      return filtered;
    }

    return proposals;
  }, [sortBy, filters, proposals]);

  return {
    proposals: sortedAndFilteredProposals,
    getProposalsTotal,
  };
}
