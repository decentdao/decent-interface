import { TypedListener } from '@fractal-framework/core-contracts/dist/common';
import {
  ProposalCreatedEvent,
  ProposalMetadataCreatedEvent,
} from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/FractalUsul';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SortBy } from '../../../types';
import { decodeTransactions } from '../../../utils/crypto';
import { useWeb3Provider } from '../../Web3Data/hooks/useWeb3Provider';
import { Proposal, ProposalState } from '../types/usul';
import { mapProposalCreatedEventToProposal } from '../utils/usul';
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
    state: { signerOrProvider },
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

      setProposals(prevState => {
        if (prevState) {
          return prevState.map(proposal => {
            if (proposal.proposalNumber.eq(proposalNumber)) {
              return {
                ...proposal,
                metaData: {
                  title,
                  description,
                  documentationUrl,
                  decodedTransactions: decodeTransactions(transactions),
                },
              };
            }

            return proposal;
          });
        }

        return prevState;
      });
    },
    [usulContract, signerOrProvider]
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
        proposalCreatedEvents.map(({ args }) => {
          const metaDataEvent = proposalMetaDataCreatedEvents.find(event =>
            event.args.proposalId.eq(args.proposalNumber)
          );
          let metaData;
          if (metaDataEvent) {
            metaData = {
              decodedTransactions: decodeTransactions(metaDataEvent.args[1]),
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
  }, [usulContract, signerOrProvider]);

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
