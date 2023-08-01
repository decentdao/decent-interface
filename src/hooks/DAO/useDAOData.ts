import { useEffect, useState } from 'react';
import { initialGuardState } from '../../providers/App/guard/reducer';
import { initialGuardContractsState } from '../../providers/App/guardContracts/reducer';
import { FractalNode } from '../../types';
import { DAOData } from '../../types/daoGeneral';
import { FractalGuardContracts } from '../../types/fractal';
import { useFractalFreeze } from './loaders/useFractalFreeze';
import { useFractalGuardContracts } from './loaders/useFractalGuardContracts';

/**
 * A hook for loading guard and freeze guard contract data for the provided
 * FractalNode.
 */
export function useLoadDAOData(fractalNode?: FractalNode, parentAddress?: string) {
  const [daoData, setDAOData] = useState<DAOData>();
  const loadFractalGuardContracts = useFractalGuardContracts({ loadOnMount: false });
  const loadFractalFreezeGuard = useFractalFreeze({
    loadOnMount: false,
    parentSafeAddress: parentAddress,
  });

  useEffect(() => {
    const loadDAOData = async () => {
      if (!fractalNode) {
        return;
      }
      const { daoAddress, safe, fractalModules } = fractalNode;

      if (!daoAddress || !safe) {
        return;
      }

      let freezeGuardContracts: FractalGuardContracts | undefined = await loadFractalGuardContracts(
        daoAddress,
        safe,
        fractalModules
      );
      if (!freezeGuardContracts) {
        freezeGuardContracts = initialGuardContractsState;
      }
      let freezeGuard = await loadFractalFreezeGuard(freezeGuardContracts);
      if (!freezeGuard) {
        freezeGuard = initialGuardState;
      }
      setDAOData({
        safe,
        fractalModules,
        freezeGuardContracts: freezeGuardContracts,
        freezeGuard,
      });
    };
    loadDAOData();
  }, [fractalNode, loadFractalGuardContracts, loadFractalFreezeGuard]);

  return { daoData };
}
