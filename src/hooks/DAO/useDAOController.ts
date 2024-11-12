import { useSearchParams } from 'react-router-dom';
import { isAddress } from 'viem';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
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

export default function useDAOController() {
  const [searchParams] = useSearchParams();
  const addressWithPrefix = searchParams.get('dao');
  const validDaoQueryString = /^[^\s:]+:[^\s:]+$/;

  const prefixAndAddress = addressWithPrefix?.split(':');
  const addressPrefix = prefixAndAddress?.[0];
  const safeAddressStr = prefixAndAddress?.[1];

  const invalidQuery =
    !safeAddressStr ||
    addressWithPrefix === null ||
    !validDaoQueryString.test(addressWithPrefix) ||
    !isAddress(safeAddressStr);

  if (invalidQuery) {
    throw new Error('Invalid query');
  }

  const safeAddress = !invalidQuery ? safeAddressStr : undefined;

  const { addressPrefix: connectedAddressPrefix } = useNetworkConfig();
  const wrongNetwork = addressPrefix !== connectedAddressPrefix;
  const skip = invalidQuery || wrongNetwork;

  const {
    node: {
      nodeHierarchy: { parentAddress },
    },
  } = useFractal();

  const { errorLoading } = useFractalNode(skip, {
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

  return { invalidQuery, wrongNetwork, errorLoading, safeAddress, urlAddressPrefix: addressPrefix };
}
