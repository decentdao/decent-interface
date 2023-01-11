import { useCallback, useEffect, useState } from 'react';
import { SafeInfoResponseWithGuard } from '../../providers/Fractal/types';
import { SubDAOData } from '../../types/dao';
import { useFractal } from './../../providers/Fractal/hooks/useFractal';

export function useSubDAOData(safeAddress?: string) {
  const {
    gnosis: { safeService },
    actions: { lookupModules, getVetoGuardContracts, lookupFreezeData },
  } = useFractal();

  const [subDAOData, setSubDAOData] = useState<SubDAOData>();

  const loadSubDAOData = useCallback(async () => {
    if (!safeService || !safeAddress) {
      return;
    }
    const safeInfo: SafeInfoResponseWithGuard = await safeService.getSafeInfo(safeAddress);
    if (!safeInfo.guard) {
      return;
    }
    const modules = await lookupModules(safeInfo.modules);
    const vetoGuardContracts = await getVetoGuardContracts(safeInfo.guard, modules);
    if (!vetoGuardContracts) {
      return;
    }
    const freezeData = await lookupFreezeData(vetoGuardContracts);

    setSubDAOData({
      safeInfo,
      modules,
      vetoGuardContracts,
      freezeData,
    });
  }, [safeService, lookupModules, getVetoGuardContracts, lookupFreezeData, safeAddress]);

  useEffect(() => {
    loadSubDAOData();
  }, [loadSubDAOData]);

  return { subDAOData };
}
