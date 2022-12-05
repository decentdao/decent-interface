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
