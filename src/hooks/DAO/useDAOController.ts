import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFractal } from '../../providers/App/AppProvider';
import { useERC20Claim } from './loaders/governance/useERC20Claim';
import { useSnapshotProposals } from './loaders/snapshot/useSnapshotProposals';
import { useFractalFreeze } from './loaders/useFractalFreeze';
import { useFractalGovernance } from './loaders/useFractalGovernance';
import { useFractalGuardContracts } from './loaders/useFractalGuardContracts';
import { useFractalNode } from './loaders/useFractalNode';
import { useFractalTreasury } from './loaders/useFractalTreasury';
import { useGovernanceContracts } from './loaders/useGovernanceContracts';

export default function useDAOController() {
  const [searchParams] = useSearchParams();
  const addressWithPrefix = searchParams.get('dao');

  if (addressWithPrefix === null) {
    throw new Error('address is null');
  }

  if (!addressWithPrefix.includes(':')) {
    throw new Error("address doesn't include prefix");
  }

  const prefixAndAddress = addressWithPrefix.split(':');
  const daoNetwork = prefixAndAddress[0];
  const daoAddress = prefixAndAddress[1];

  const {
    node: {
      nodeHierarchy: { parentAddress },
    },
    action,
  } = useFractal();

  useEffect(() => {
    if (!daoAddress) {
      action.resetDAO();
    }
  }, [action, daoAddress]);

  const { nodeLoading, errorLoading } = useFractalNode({ daoAddress: daoAddress || undefined });
  useGovernanceContracts();
  useFractalGuardContracts({});
  useFractalFreeze({ parentSafeAddress: parentAddress });
  useFractalGovernance();
  useFractalTreasury();
  useERC20Claim();
  useSnapshotProposals();
  return { nodeLoading, errorLoading };
}
