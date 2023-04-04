'use client';

import { useFractalFreeze } from './loaders/useFractalFreeze';
import { useFractalGovernance } from './loaders/useFractalGovernance';
import { useFractalGuardContracts } from './loaders/useFractalGuardContracts';
import { useFractalNode } from './loaders/useFractalNode';
import { useFractalTreasury } from './loaders/useFractalTreasury';
import { useGovernanceContracts } from './loaders/useGovernanceContracts';

export default function useDAOController({ daoAddress }: { daoAddress: string }) {
  useFractalNode({ daoAddress });
  useGovernanceContracts();
  useFractalGovernance();
  useFractalGuardContracts({});
  useFractalFreeze({});
  useFractalTreasury();
}
