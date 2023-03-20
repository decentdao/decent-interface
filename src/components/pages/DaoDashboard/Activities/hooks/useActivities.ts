import { VetoGuard } from '@fractal-framework/fractal-contracts';
import { useEffect, useMemo, useState } from 'react';
import { useParseSafeTxs } from '../../../../../hooks/utils/useParseSafeTxs';
import { useSafeActivitiesWithState } from '../../../../../hooks/utils/useSafeActivitiesWithState';
import { useFractal } from '../../../../../providers/Fractal/hooks/useFractal';
import {
  Activity,
  ActivityEventType,
  GovernanceTypes,
  SortBy,
  VetoGuardType,
} from '../../../../../types';

export const useActivities = (sortBy: SortBy) => {
  const {
    gnosis: {
      transactions,
      safe,
      guardContracts: { vetoGuardContract, vetoGuardType },
    },
    governance: {
      type,
      txProposalsInfo: { txProposals },
    },
  } = useFractal();

  const [isActivitiesLoading, setActivitiesLoading] = useState<boolean>(true);

  const parsedActivities = useParseSafeTxs(transactions, safe);
  const parsedActivitiesWithState = useSafeActivitiesWithState(
    parsedActivities,
    vetoGuardType === VetoGuardType.MULTISIG
      ? (vetoGuardContract?.asSigner as VetoGuard)
      : undefined
  );

  /**
   * filters out initial multisig transaction on USUL enabled safes
   */
  const filterActivities = useMemo(() => {
    if (type === GovernanceTypes.GNOSIS_SAFE_USUL) {
      return [
        ...parsedActivitiesWithState.filter(
          activity => activity.eventType !== ActivityEventType.Governance
        ),
        ...txProposals,
      ];
    }
    return [...parsedActivitiesWithState];
  }, [type, parsedActivitiesWithState, txProposals]);

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
