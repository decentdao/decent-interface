import { constants } from 'ethers';
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
  const { loadERC20Token, loadUnderlyingERC20Token } = useERC20LinearToken({});

  useEffect(() => {
    const { isLoaded, azoriusContract } = governanceContracts;

    if (parentAddress && guardContracts.freezeGuardType === null) {
      return;
    }

    const newValidAddress =
      daoAddress && guardContracts.freezeGuardType
        ? daoAddress + guardContracts.freezeGuardType
        : constants.AddressZero;

    if (isLoaded && daoAddress && newValidAddress !== currentValidAddress.current) {
      currentValidAddress.current = newValidAddress;

      loadDAOProposals();

      if (azoriusContract) {
        loadAzoriusStrategy();
        loadERC20Token();
        loadUnderlyingERC20Token();
      }
    } else if (!isLoaded) {
      currentValidAddress.current = undefined;
    }
  }, [
    daoAddress,
    parentAddress,
    governanceContracts,
    loadDAOProposals,
    loadUnderlyingERC20Token,
    guardContracts,
    loadAzoriusStrategy,
    loadERC20Token,
  ]);
};
