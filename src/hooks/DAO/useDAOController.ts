'use client';

import { useEffect, useState } from 'react';
import { useFractal } from '../../providers/App/AppProvider';
import { useERC20Claim } from './loaders/governance/useERC20Claim';
import { useSnapshotProposals } from './loaders/snapshot/useSnapshotProposals';
import { useFractalFreeze } from './loaders/useFractalFreeze';
import { useFractalGovernance } from './loaders/useFractalGovernance';
import { useFractalGuardContracts } from './loaders/useFractalGuardContracts';
import { useFractalNode } from './loaders/useFractalNode';
import { useFractalTreasury } from './loaders/useFractalTreasury';
import { useGovernanceContracts } from './loaders/useGovernanceContracts';

export default function useDAOController({ daoAddress }: { daoAddress?: string }) {
  const [currentDAOAddress, setCurrentDAOAddress] = useState<string>();
  const [reloadingDAO, setReloadingDAO] = useState(false);
  const {
    node: {
      nodeHierarchy: { parentAddress },
    },
    action,
  } = useFractal();
  useEffect(() => {
    if (daoAddress && currentDAOAddress !== daoAddress) {
      setReloadingDAO(true);
      action.resetDAO().then(() => {
        setCurrentDAOAddress(daoAddress);
        setReloadingDAO(false);
      });
    }
  }, [daoAddress, currentDAOAddress, action]);

  const nodeLoading = useFractalNode({ daoAddress: currentDAOAddress });
  useGovernanceContracts();
  useFractalGuardContracts({});
  useFractalFreeze({ parentSafeAddress: parentAddress });
  useFractalGovernance();
  useFractalTreasury();
  useERC20Claim();
  useSnapshotProposals();
  return { nodeLoading, reloadingDAO };
}
