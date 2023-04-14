import { useMemo } from 'react';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { Activity, SortBy } from '../../../../../types';

export const useActivities = (sortBy: SortBy) => {
  const {
    governance: { proposals },
  } = useFractal();

  /**
   * After data is parsed it is sorted based on execution data
   * updates when a different sort is selected
   */
  const sortedActivities: Activity[] = useMemo(() => {
    return [...(proposals || [])].sort((a, b) => {
      const dataA = new Date(a.eventDate).getTime();
      const dataB = new Date(b.eventDate).getTime();
      if (sortBy === SortBy.Oldest) {
        return dataA - dataB;
      }
      return dataB - dataA;
    });
  }, [sortBy, proposals]);

  return { sortedActivities };
};
