import { useCallback, useMemo } from 'react';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { SortBy, TxProposalState } from '../../../types';

export default function useProposals({
  sortBy,
  filters,
}: {
  sortBy: SortBy;
  filters: TxProposalState[];
}) {
  const {
    governance: {
      txProposalsInfo: { txProposals },
    },
  } = useFractal();

  const getProposalsTotal = useCallback(
    (state: TxProposalState) => {
      if (txProposals.length) {
        return txProposals.filter(proposal => proposal.state === state).length;
      }
    },
    [txProposals]
  );

  const sortedAndFilteredProposals = useMemo(() => {
    return [...txProposals]
      .filter(proposal => filters.includes(proposal.state!))
      .sort((a, b) => {
        const dataA = new Date(a.eventDate).getTime();
        const dataB = new Date(b.eventDate).getTime();
        if (sortBy === SortBy.Oldest) {
          return dataA - dataB;
        }
        return dataB - dataA;
      });
  }, [sortBy, filters, txProposals]);

  return {
    proposals: sortedAndFilteredProposals,
    getProposalsTotal,
  };
}
