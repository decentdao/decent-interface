import { useEffect, useRef } from 'react';
import { useFractal } from '../../../providers/App/AppProvider';
import { useAzoriusStrategy } from './governance/useERC20LinearStrategy';
import { useERC20LinearToken } from './governance/useERC20LinearToken';
import { useDAOProposals } from './useProposals';

export const useFractalGovernance = () => {
  // tracks the current valid DAO address; helps prevent unnecessary calls
  const currentValidAddress = useRef<string>();

  const {
    node: {
      daoAddress,
      nodeHierarchy: { parentAddress },
    },
    governanceContracts,
    guardContracts,
  } = useFractal();

  const loadDAOProposals = useDAOProposals();
  const loadAzoriusStrategy = useAzoriusStrategy();
  const loadERC20Token = useERC20LinearToken();

  useEffect(() => {
    const { isLoaded, usulContract } = governanceContracts;
    if (
      isLoaded &&
      !!daoAddress &&
      daoAddress + guardContracts.vetoGuardType !== currentValidAddress.current
    ) {
      if (parentAddress && guardContracts.vetoGuardType === null) {
        return;
      }
      currentValidAddress.current = daoAddress + guardContracts.vetoGuardType;
      loadDAOProposals();
      if (!!usulContract) {
        // load DAO voting strategy data
        loadAzoriusStrategy();
        // load voting token
        loadERC20Token();
      }
    }
  }, [
    daoAddress,
    parentAddress,
    governanceContracts,
    loadDAOProposals,
    guardContracts,
    loadAzoriusStrategy,
    loadERC20Token,
  ]);
};
