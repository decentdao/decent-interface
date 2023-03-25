import { useEffect, useRef } from 'react';
import { useFractal } from '../../../providers/App/AppProvider';
import { useAzuriousStrategy } from './governance/useAzuriousStrategy';
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
        }
      })();
    }
  }, [daoAddress, governanceContracts, loadDAOProposals, loadAzuriousStrategy]);
};
