import { useCallback, useMemo } from 'react';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalProposalState, SortBy } from '../../../types';

export default function useProposals({
  sortBy,
  filters,
}: {
  sortBy: SortBy;
  filters: FractalProposalState[];
}) {
  const {
    governance: { proposals },
  } = useFractal();

  const getProposalsTotal = useCallback(
    (state: FractalProposalState) => {
      if (proposals && proposals.length) {
        return proposals.filter(proposal => proposal.state === state).length;
      }
    },
    [proposals],
  );

  const sortedAndFilteredProposals = useMemo(() => {
    return [...(proposals || [])]
      .filter(proposal => filters.includes(proposal.state!))
      .sort((a, b) => {
        const dataA = new Date(a.eventDate).getTime();
        const dataB = new Date(b.eventDate).getTime();
        if (sortBy === SortBy.Oldest) {
          return dataA - dataB;
        }
        return dataB - dataA;
      });
  }, [sortBy, filters, proposals]);

  return {
    proposals: sortedAndFilteredProposals,
    getProposalsTotal,
  };
}
