import { useCallback, useEffect, useState } from 'react';
import { useFractal } from '../../providers/App/AppProvider';
import { initialGuardState } from '../../providers/App/guard/reducer';
import { initialGuardContractsState } from '../../providers/App/guardContracts/reducer';
import { FractalNode } from '../../types';
import { SubDAOData } from '../../types/daoGeneral';
import { FractalGuardContracts } from './../../types/fractal';
import { useFractalFreeze } from './loaders/useFractalFreeze';
import { useFractalGuardContracts } from './loaders/useFractalGuardContracts';

export function useSubDAOData(fractalNode?: FractalNode) {
  const {
    clients: { safeService },
  } = useFractal();

  const [subDAOData, setSubDAOData] = useState<SubDAOData>();
  const loadFractalGuardContracts = useFractalGuardContracts({ loadOnMount: false });
  const loadFractalFreezeGuard = useFractalFreeze({ loadOnMount: false });

  const loadSubDAOData = useCallback(async () => {
    if (!safeService || !fractalNode) {
      return;
    }
    const { daoAddress, safe, fractalModules } = fractalNode;

    if (!daoAddress || !safe) {
      return;
    }

    let vetoGuardContracts: FractalGuardContracts | undefined = await loadFractalGuardContracts(
      daoAddress,
      safe,
      fractalModules
    );
    if (!vetoGuardContracts) {
      vetoGuardContracts = initialGuardContractsState;
    }
    let freezeGuard = await loadFractalFreezeGuard(vetoGuardContracts);
    if (!freezeGuard) {
      freezeGuard = initialGuardState;
    }
    setSubDAOData({
      safe,
      fractalModules,
      vetoGuardContracts,
      freezeGuard,
    });
  }, [safeService, fractalNode, loadFractalGuardContracts, loadFractalFreezeGuard]);

  useEffect(() => {
    loadSubDAOData();
  }, [loadSubDAOData]);

  return { subDAOData };
}
