import { useEffect, useMemo, useState } from 'react';
import { useParseSafeTxs } from '../../../../hooks/utils/useParseSafeTxs';
import { useFractal } from '../../../../providers/Fractal/hooks/useFractal';
import { GovernanceTypes } from '../../../../providers/Fractal/types';
import { SortBy } from '../../../../types';
import { Activity, ActivityEventType } from './../../../../providers/Fractal/governance/types';

export const useActivities = (sortBy: SortBy) => {
  const {
    gnosis: { transactions, safe },
    governance: {
      type,
      txProposalsInfo: { txProposals },
    },
  } = useFractal();

  const [isActivitiesLoading, setActivitiesLoading] = useState<boolean>(true);

  const parsedActivities = useParseSafeTxs(transactions, safe);

  /**
   * filters out initial multisig transaction on USUL enabled safes
   */
  const filterActivities = useMemo(() => {
    if (type === GovernanceTypes.GNOSIS_SAFE_USUL) {
      return [
        ...parsedActivities.filter(activity => activity.eventType === ActivityEventType.Treasury),
        ...txProposals,
      ];
    }
    return [...parsedActivities];
  }, [parsedActivities, type, txProposals]);

  /**
   * After data is parsed it is sorted based on execution data
   * updates when a different sort is selected
   */
  const sortedActivities: Activity[] = useMemo(() => {
    return [...filterActivities].sort((a, b) => {
      const dataA = new Date(a.eventDate).getTime();
      const dataB = new Date(b.eventDate).getTime();
      if (sortBy === SortBy.Oldest) {
        return dataA - dataB;
      }
      return dataB - dataA;
    });
  }, [filterActivities, sortBy]);

  /**
   * When data is ready, set loading to false
   */

  useEffect(() => {
    if (transactions.count !== null) {
      setActivitiesLoading(false);
    }
  }, [transactions]);

  return { sortedActivities, isActivitiesLoading };
};
