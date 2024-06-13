import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFractal } from '../../../providers/App/AppProvider';
import { SortBy, FractalProposalState } from '../../../types';
import { useLoadTempProposals } from '../loaders/useLoadDAOProposals';
import { TempProposalData } from './useSubmitProposal';

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

  const loadTempDAOProposals = useLoadTempProposals();
  const [tempProposals, setTempProposals] = useState<TempProposalData[]>([]);

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

  useEffect(() => {
    loadTempDAOProposals().then(data => setTempProposals(data));
  }, [loadTempDAOProposals]);

  return {
    proposals: sortedAndFilteredProposals,
    tempProposals,
    getProposalsTotal,
  };
}
