import { useMemo } from 'react';
import { SortBy } from '../../../types';
import { TxProposalState } from '../types';
import { useFractal } from './useFractal';

export default function useProposals({
  sortBy,
  filters,
}: {
  sortBy?: SortBy;
  filters?: TxProposalState[];
}) {
  const {
    governance: {
      txProposalsInfo: { txProposals },
    },
  } = useFractal();

  const getProposalsTotal = (state: TxProposalState) => {
    if (txProposals.length) {
      return txProposals.filter(proposal => proposal.state === state).length;
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
    if (txProposals && (sortBy || filters)) {
      let sorted = txProposals; // They returned in oldest sorting from contract by default
      if (sortBy === SortBy.Newest) {
        sorted = [...txProposals].reverse(); // .reverse mutates original array - we have to create new one
      }

      let filtered = sorted;
      if (filters) {
        filtered = filtered.filter(proposal => filters.includes(proposal.state));
      }

      return filtered;
    }

    return txProposals;
  }, [sortBy, filters, txProposals]);

  return {
    proposals: sortedAndFilteredProposals,
    getProposalsTotal,
  };
}
