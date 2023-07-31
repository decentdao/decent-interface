'use client';

import { useEffect, useState } from 'react';
import { useFractal } from '../../providers/App/AppProvider';
import { useERC20Claim } from './loaders/governance/useERC20Claim';
import { useFractalFreeze } from './loaders/useFractalFreeze';
import { useFractalGovernance } from './loaders/useFractalGovernance';
import { useFractalGuardContracts } from './loaders/useFractalGuardContracts';
import { useFractalNode } from './loaders/useFractalNode';
import { useFractalTreasury } from './loaders/useFractalTreasury';
import { useGovernanceContracts } from './loaders/useGovernanceContracts';
import { useSnapshotProposals } from './loaders/useSnapshotProposals';

export default function useDAOController({ daoAddress }: { daoAddress?: string }) {
  const [currentDAOAddress, setCurrentDAOAddress] = useState<string>();
  const {
    node: {
      nodeHierarchy: { parentAddress },
    },
    action,
  } = useFractal();
  useEffect(() => {
    if (daoAddress && currentDAOAddress !== daoAddress) {
      action.resetDAO().then(() => {
        setCurrentDAOAddress(daoAddress);
      });
    }
  }, [daoAddress, currentDAOAddress, action]);

  useFractalNode({ daoAddress: currentDAOAddress });
  useGovernanceContracts();
  useFractalGuardContracts({});
  useFractalFreeze({ parentSafeAddress: parentAddress });
  useFractalGovernance();
  useFractalTreasury();
  useERC20Claim();
  useSnapshotProposals();
}
