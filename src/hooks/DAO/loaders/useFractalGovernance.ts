import { useEffect, useRef } from 'react';
import { useFractal } from '../../../providers/App/AppProvider';
import { useAzuriousStrategy } from './governance/useERC20LinearStrategy';
import { useERC20LinearToken } from './governance/useERC20LinearToken';
import { useDAOProposals } from './useDAOProposals';

export const useFractalGovernance = () => {
  // tracks the current valid DAO address; helps prevent unnecessary calls
  const currentValidAddress = useRef<string>();

  const {
    node: { daoAddress },
    governanceContracts,
  } = useFractal();

  const loadDAOProposals = useDAOProposals();
  const loadAzuriousStrategy = useAzuriousStrategy();
  const loadERC20Token = useERC20LinearToken();
  useEffect(() => {
    const { isLoaded, usulContract } = governanceContracts;
    if (isLoaded && !!daoAddress && daoAddress !== currentValidAddress.current) {
      currentValidAddress.current = daoAddress;
      (async () => {
        loadDAOProposals();
        if (!!usulContract) {
          // load DAO voting strategy data
          loadAzuriousStrategy();
          // load voting token
          loadERC20Token();
        }
      })();
    }
  }, [daoAddress, governanceContracts, loadDAOProposals, loadAzuriousStrategy, loadERC20Token]);
};
