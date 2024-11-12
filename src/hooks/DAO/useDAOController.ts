import { Address } from 'viem';
import { useFractal } from '../../providers/App/AppProvider';
import { useAzoriusListeners } from './loaders/governance/useAzoriusListeners';
import { useERC20Claim } from './loaders/governance/useERC20Claim';
import { useSnapshotProposals } from './loaders/snapshot/useSnapshotProposals';
import { useDecentTreasury } from './loaders/useDecentTreasury';
import { useFractalFreeze } from './loaders/useFractalFreeze';
import { useFractalGovernance } from './loaders/useFractalGovernance';
import { useFractalGuardContracts } from './loaders/useFractalGuardContracts';
import { useFractalNode } from './loaders/useFractalNode';
import { useGovernanceContracts } from './loaders/useGovernanceContracts';
import { useHatsTree } from './loaders/useHatsTree';
import { useKeyValuePairs } from './useKeyValuePairs';

export default function useDAOController({
  addressPrefix,
  safeAddress,
}: {
  addressPrefix?: string;
  safeAddress?: Address;
}) {
  const {
    node: {
      nodeHierarchy: { parentAddress },
    },
  } = useFractal();

  const { errorLoading } = useFractalNode({
    addressPrefix,
    safeAddress,
  });

  useGovernanceContracts();
  useFractalGuardContracts({});
  useFractalFreeze({ parentSafeAddress: parentAddress });
  useFractalGovernance();
  useDecentTreasury();
  useERC20Claim();
  useSnapshotProposals();
  useAzoriusListeners();

  useKeyValuePairs();
  useHatsTree();

  return { errorLoading };
}
