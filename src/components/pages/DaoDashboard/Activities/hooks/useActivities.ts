import { VetoGuard } from '@fractal-framework/fractal-contracts';
import { useMemo } from 'react';
import { useSafeActivitiesWithState } from '../../../../../hooks/utils/useSafeActivitiesWithState';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { Activity, SortBy, VetoGuardType } from '../../../../../types';

export const useActivities = (sortBy: SortBy) => {
  const {
    guardContracts: { vetoGuardContract, vetoGuardType },
    governance: { proposals },
  } = useFractal();

  const parsedActivitiesWithState = useSafeActivitiesWithState(
    proposals,
    vetoGuardType === VetoGuardType.MULTISIG
      ? (vetoGuardContract?.asSigner as VetoGuard)
      : undefined
  );

  /**
   * After data is parsed it is sorted based on execution data
   * updates when a different sort is selected
   */
  const sortedActivities: Activity[] = useMemo(() => {
    return [...parsedActivitiesWithState].sort((a, b) => {
      const dataA = new Date(a.eventDate).getTime();
      const dataB = new Date(b.eventDate).getTime();
      if (sortBy === SortBy.Oldest) {
        return dataA - dataB;
      }
      return dataB - dataA;
    });
  }, [parsedActivitiesWithState, sortBy]);

  return { sortedActivities };
};
