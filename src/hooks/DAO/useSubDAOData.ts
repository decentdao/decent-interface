import { ethers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { SafeInfoResponseWithGuard } from '../../types';
import { SubDAOData } from '../../types/daoGeneral';
import { useFractal } from './../../providers/Fractal/hooks/useFractal';

export function useSubDAOData(safeAddress?: string) {
  const {
    gnosis: { safeService },
    actions: { lookupModules, getVetoGuardContracts, lookupFreezeGuard },
  } = useFractal();

  const [subDAOData, setSubDAOData] = useState<SubDAOData>();

  const loadSubDAOData = useCallback(async () => {
    if (!safeService || !safeAddress) {
      return;
    }
    const { getAddress } = ethers.utils;
    const safeInfo: SafeInfoResponseWithGuard = await safeService.getSafeInfo(
      getAddress(safeAddress)
    );
    if (!safeInfo.guard) {
      return;
    }
    const modules = await lookupModules(safeInfo.modules);
    const vetoGuardContracts = await getVetoGuardContracts(safeInfo.guard, modules);
    if (!vetoGuardContracts) {
      return;
    }
    const freezeGuard = await lookupFreezeGuard(vetoGuardContracts);

    setSubDAOData({
      safeInfo,
      modules,
      vetoGuardContracts,
      freezeGuard,
    });
  }, [safeService, lookupModules, getVetoGuardContracts, lookupFreezeGuard, safeAddress]);

  useEffect(() => {
    loadSubDAOData();
  }, [loadSubDAOData]);

  return { subDAOData };
}
